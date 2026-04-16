import { useState, useEffect } from 'react';
import { AssessmentCriteria, PreviousAssessment, SelectedAssessmentWithWeight, GeneratedQuestionSet, WizardStep, MCQQuestion } from './types';
import { mockPreviousAssessments, mockGeneratedSets, mockReplacementQuestions } from './mockData';
import { ConfigurationForm } from '../../../../_components/adaptiveAssessment/ConfigurationForm';
import { LoadingOverlay } from '../../../../_components/adaptiveAssessment/LoadingOverlay';
import { PreviousAssessmentsSection } from '../../../../_components/adaptiveAssessment/PreviousAssessmentsSection';
import { WeightageSection } from '../../../../_components/adaptiveAssessment/WeightageSection';
import { GeneratedSetsSection } from '../../../../_components/adaptiveAssessment/GeneratedSetsSection';
import { QuestionReviewModal } from '../../../../_components/adaptiveAssessment/QuestionReviewModal';
import { FinalActionsSection } from '../../../../_components/adaptiveAssessment/FinalActionsSection';
import { RevealButton } from '../../../../_components/adaptiveAssessment/RevealButton';
import { SuccessMessage } from '../../../../_components/adaptiveAssessment/SuccessMessage';
import { FileText } from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { useGenerateAiAssessment, MapQuestionsResponse } from '@/hooks/useGenerateAiAssessment';
import { GetQuestionSetsResponse, useGetQuestionSets } from '@/hooks/useGetQuestionSets';
import { useGetAiAssessments } from '@/hooks/useGetAiAssessments';

const ASSESSMENTS_HISTORY_KEY = 'zuvy_assessment_history';

interface WizardState {
  currentStep: WizardStep;
  revealedSteps: WizardStep[];
  assessmentName: string;
  assessmentDescription: string;
  assessmentAudience: string;
  assessmentQuestionCount: string;
  criteria: AssessmentCriteria[];
  selectedPreviousIds: string[];
  weights: SelectedAssessmentWithWeight[];
  selectedSetForReview: GeneratedQuestionSet | null;
  generatedSets: GeneratedQuestionSet[];
  finalAction: 'publish' | 'draft' | 'schedule' | null;
  aiAssessmentId: number | null;
  mappingResponse: MapQuestionsResponse | null;
}

interface AssessmentHistory {
  id: number;
  name: string;
  createdAt: string;
  assessmentId: number;
}

const createEmptyCriteria = (): AssessmentCriteria => ({
  id: `criteria-${Date.now()}`,
  domainId: '',
  topics: [],
  questionType: 'MCQ',
});

const initialState: WizardState = {
  currentStep: 'configuration',
  revealedSteps: ['configuration'],
  assessmentName: '',
  assessmentDescription: '',
  assessmentAudience: '',
  assessmentQuestionCount: '',
  criteria: [createEmptyCriteria()],
  selectedPreviousIds: [],
  weights: [],
  selectedSetForReview: null,
  generatedSets: [],
  finalAction: null,
  aiAssessmentId: null,
  mappingResponse: null,
};

const toPositiveInt = (value: unknown): number | null => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const convertQuestionSetsToGeneratedSets = (
  questionSetsResponse: GetQuestionSetsResponse
): GeneratedQuestionSet[] => {
  return questionSetsResponse.sets.map((set) => {
    const difficultyBreakdown = {
      easy: 0,
      medium: 0,
      hard: 0,
    };

    const domainsSet = new Set<string>();

    set.questions.forEach((q) => {
      if (q.difficulty === 'easy') difficultyBreakdown.easy++;
      if (q.difficulty === 'medium') difficultyBreakdown.medium++;
      if (q.difficulty === 'hard') difficultyBreakdown.hard++;
      domainsSet.add(q.domainName);
    });

    return {
      id: set.id.toString(),
      name: `${set.label} (Level ${set.levelCode})`,
      setIndex: set.setIndex,
      levelCode: set.levelCode,
      totalQuestions: set.questions.length,
      difficultyBreakdown,
      domainsCovered: Array.from(domainsSet),
      questions: set.questions.map((q) => ({
        id: `${q.questionId}`,
        question: q.question,
        options: Object.values(q.options),
        correctOption: q.correctOption,
        difficulty: q.difficulty,
        topic: q.topicName,
        isCommon: q.isCommon,
      })),
      version: 1,
    };
  });
};

const AdaptiveAssessment = (props: any) => {
  const params = useParams();
  const { generateAssessment, isGenerating, generationPhase } = useGenerateAiAssessment();
  const { fetchQuestionSets, isFetching } = useGetQuestionSets();
  const { fetchAssessments, isFetchingAssessments } = useGetAiAssessments();
  const [hasFetchedChapterAssessments, setHasFetchedChapterAssessments] = useState(false);
  const [hasChapterAssessments, setHasChapterAssessments] = useState<boolean | null>(null);

  const aiGenerationSlides = [
    'Assessment is generating',
    'AI is mapping questions',
  ];

  const aiActiveSlideIndex =
    generationPhase === 'mapping-questions' ? 1 : 0;

  const [state, setState] = useState<WizardState>(initialState);

  const routeBootcampId = toPositiveInt((params as any)?.courseId);
  const routeChapterId = toPositiveInt((params as any)?.chapterId ?? (params as any)?.chapterID);
  const routeDomainId = toPositiveInt((params as any)?.moduleId);

  // On page load, fetch chapter assessments and use the latest assessment id
  // to load the corresponding question sets for this specific chapter.
  useEffect(() => {
    if (!routeBootcampId || !routeChapterId) {
      return;
    }

    let isCancelled = false;
    setHasFetchedChapterAssessments(false);

    const loadExistingChapterAssessment = async () => {
      try {
        const chapterAssessments = await fetchAssessments(routeBootcampId, routeChapterId);

        if (isCancelled) {
          return;
        }

        if (!chapterAssessments.length) {
          setHasChapterAssessments(false);
          setState((prev) => ({
            ...prev,
            aiAssessmentId: null,
            generatedSets: [],
            selectedSetForReview: null,
            finalAction: null,
            currentStep: 'configuration',
            revealedSteps: ['configuration'],
          }));
          return;
        }

        setHasChapterAssessments(true);

        const latestAssessment = [...chapterAssessments].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

        if (!latestAssessment?.id) {
          return;
        }

        const questionSetsResponse = await fetchQuestionSets(latestAssessment.id);

        if (isCancelled) {
          return;
        }

        const convertedSets = convertQuestionSetsToGeneratedSets(questionSetsResponse);

        setState((prev) => ({
          ...prev,
          aiAssessmentId: latestAssessment.id,
          assessmentName: latestAssessment.title || prev.assessmentName,
          assessmentDescription: latestAssessment.description || prev.assessmentDescription,
          assessmentAudience: latestAssessment.audience || prev.assessmentAudience,
          assessmentQuestionCount: String(
            latestAssessment.totalQuestionsWithBuffer ?? latestAssessment.totalNumberOfQuestions ?? ''
          ),
          generatedSets: convertedSets,
          currentStep: 'generatedSets',
          revealedSteps: prev.revealedSteps.includes('generatedSets')
            ? prev.revealedSteps
            : [...prev.revealedSteps, 'generatedSets'],
        }));
      } catch {
        if (!isCancelled) {
          setHasChapterAssessments(null);
        }
        // Silent on load; user will still be able to generate a new assessment manually.
      } finally {
        if (!isCancelled) {
          setHasFetchedChapterAssessments(true);
        }
      }
    };

    loadExistingChapterAssessment();

    return () => {
      isCancelled = true;
    };
  }, [fetchAssessments, fetchQuestionSets, routeBootcampId, routeChapterId]);

  const updateState = (updates: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const revealStep = (step: WizardStep) => {
    if (!state.revealedSteps.includes(step)) {
      updateState({ revealedSteps: [...state.revealedSteps, step] });
    }
  };

  const isRevealed = (step: WizardStep) => state.revealedSteps.includes(step);

  // Save assessment to history
  const saveAssessmentToHistory = (assessmentId: number, name: string) => {
    try {
      const historyStr = localStorage.getItem(ASSESSMENTS_HISTORY_KEY);
      const history: AssessmentHistory[] = historyStr ? JSON.parse(historyStr) : [];
      
      const newEntry: AssessmentHistory = {
        id: Date.now(),
        name,
        createdAt: new Date().toISOString(),
        assessmentId,
      };
      
      // Add to beginning of history and keep only last 50
      history.unshift(newEntry);
      localStorage.setItem(ASSESSMENTS_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
      
      return newEntry;
    } catch (error) {
      console.error('Failed to save assessment to history:', error);
      return null;
    }
  };

  // Step handlers
  const handleConfigSubmit = async () => {
    const bootcampId = routeBootcampId;
    const domainId = routeDomainId ?? toPositiveInt(state.criteria.find((c) => c.domainId)?.domainId);
    const chapterId = routeChapterId;
    const totalNumberOfQuestions = Number.parseInt(state.assessmentQuestionCount, 10);

    if (!bootcampId) {
      toast.error({
        title: 'Invalid course context',
        description: 'Unable to determine bootcamp id from route.',
      });
      return;
    }

    if (!chapterId) {
      toast.error({
        title: 'Invalid chapter context',
        description: 'Unable to determine chapter id from route.',
      });
      return;
    }

    if (!domainId) {
      toast.error({
        title: 'Invalid domain context',
        description: 'Please select a valid domain before generating assessment.',
      });
      return;
    }

    try {
      const response = await generateAssessment({
        bootcampId,
        scope: 'domain',
        chapterId,
        domainId,
        title: state.assessmentName.trim(),
        description: state.assessmentDescription.trim(),
        audience: state.assessmentAudience.trim(),
        totalNumberOfQuestions,
      });

      const mappingResponse = response.mapResponse as MapQuestionsResponse;
      const aiAssessmentId = mappingResponse.aiAssessmentId;

      if (!aiAssessmentId || Number.isNaN(aiAssessmentId)) {
        throw new Error('Invalid AI assessment ID received from server');
      }

      // Save assessment to history
      saveAssessmentToHistory(aiAssessmentId, state.assessmentName);

      // Save the mapping response and aiAssessmentId
      updateState({
        aiAssessmentId,
        mappingResponse,
        currentStep: 'fetchingPrevious',
      });
      revealStep('fetchingPrevious');

      toast.info({
        title: 'Assessment Generated',
        description: `Assessment ID: ${aiAssessmentId} - Fetching question sets...`,
      });

      // Fetch question sets using the assessmentId
      try {
        const questionSetsResponse = await fetchQuestionSets(aiAssessmentId);
        const convertedSets = convertQuestionSetsToGeneratedSets(questionSetsResponse);

        updateState({
          currentStep: 'generatedSets',
          generatedSets: convertedSets,
        });
        revealStep('generatedSets');

        toast.success({
          title: 'Question sets generated',
          description: `Loaded ${convertedSets.length} adaptive question sets for this assessment.`,
        });
      } catch (error: any) {
        toast.error({
          title: 'Failed to fetch question sets',
          description:
            error?.response?.data?.message ||
            error?.message ||
            'Unable to fetch question sets right now.',
        });
        updateState({ currentStep: 'generatedSets' });
        revealStep('generatedSets');
      }
    } catch (error: any) {
      toast.error({
        title: 'Generation failed',
        description:
          error?.response?.data?.message ||
          error?.message ||
          'Unable to generate assessment right now.',
      });
      return;
    }
  };

  const handleSetSelect = (set: GeneratedQuestionSet) => {
    updateState({ selectedSetForReview: set, currentStep: 'reviewQuestions' });
    revealStep('reviewQuestions');
  };

  const handleReviewClose = () => {
    updateState({ selectedSetForReview: null, currentStep: 'generatedSets' });
  };

  const handlePublishFromReview = () => {
    updateState({ currentStep: 'finalActions' });
    revealStep('finalActions');
  };

  const handleFinalAction = (action: 'publish' | 'draft' | 'schedule') => {
    updateState({ finalAction: action });
  };

  const handleReset = () => {
    setState(initialState);
  };

  // Question management handlers
  const handleRemoveQuestion = (setId: string, questionId: string) => {
    const updatedSets = state.generatedSets.map(set => {
      if (set.id === setId) {
        return {
          ...set,
          questions: set.questions.filter((q: MCQQuestion) => q.id !== questionId),
          totalQuestions: set.totalQuestions - 1,
        };
      }
      return set;
    });
    
    updateState({ 
      generatedSets: updatedSets,
      selectedSetForReview: updatedSets.find(s => s.id === setId) || null,
    });
  };

  const handleReplaceQuestion = (setId: string, oldQuestionId: string, newQuestion: MCQQuestion) => {
    const updatedSets = state.generatedSets.map(set => {
      if (set.id === setId) {
        return {
          ...set,
          questions: set.questions.map((q: MCQQuestion) => 
            q.id === oldQuestionId ? { ...newQuestion, id: `replaced-${Date.now()}` } : q
          ),
          version: (set.version || 1) + 1,
        };
      }
      return set;
    });
    
    updateState({ 
      generatedSets: updatedSets,
      selectedSetForReview: updatedSets.find(s => s.id === setId) || null,
    });
  };

  const getSimilarQuestions = (question: MCQQuestion): MCQQuestion[] => {
    return mockReplacementQuestions.filter(
      q => q.topic === question.topic && q.difficulty === question.difficulty && q.id !== question.id
    );
  };

  const currentGeneratedSets = state.generatedSets;


  return (
    <div className="">
      {isGenerating && (
        <LoadingOverlay
          message={
            generationPhase === 'mapping-questions'
              ? 'AI is mapping questions to your assessment.'
              : 'Assessment is being generated.'
          }
          subMessage="This may take a few moments. Please keep this window open while we complete both steps."
          slides={aiGenerationSlides}
          activeSlideIndex={aiActiveSlideIndex}
          variant="subtle"
        />
      )}

      {state.currentStep === 'fetchingPrevious' && !state.generatedSets.length && (
        <LoadingOverlay 
          message="Fetching generated question sets for you." 
          subMessage="This helps us prepare personalized assessments based on your selections."
          variant="subtle"
        />
      )}

      {isFetchingAssessments && !state.generatedSets.length && !isGenerating && !isFetching && (
        <LoadingOverlay
          message="Loading chapter assessments"
          subMessage="Fetching the latest assessment sets for this chapter."
          variant="subtle"
        />
      )}

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Step 1: Configuration */}
          {isRevealed('configuration') && (
            <section className="">
              <ConfigurationForm
                criteria={state.criteria}
                onCriteriaChange={(criteria) => updateState({ criteria })}
                onSubmit={handleConfigSubmit}
                isSubmitting={isGenerating}
                assessmentName={state.assessmentName}
                assessmentDescription={state.assessmentDescription}
                assessmentAudience={state.assessmentAudience}
                assessmentQuestionCount={state.assessmentQuestionCount}
                onNameChange={(name) => updateState({ assessmentName: name })}
                onDescriptionChange={(description) => updateState({ assessmentDescription: description })}
                onAudienceChange={(audience) => updateState({ assessmentAudience: audience })}
                onQuestionCountChange={(count) => updateState({ assessmentQuestionCount: count })}
              />
            </section>
          )}

          {/* Generated Question Sets */}
          {isRevealed('generatedSets') && !state.selectedSetForReview && currentGeneratedSets.length > 0 && (
            <section className="bg-card rounded-2xl border border-border p-6 shadow-soft">
              <GeneratedSetsSection
                sets={currentGeneratedSets}
                onSelectSet={handleSetSelect}
              />
            </section>
          )}

          {/* Final Actions */}
          {isRevealed('generatedSets') && !state.finalAction && !state.selectedSetForReview && currentGeneratedSets.length > 0 && (
            <section className="bg-card rounded-2xl border border-border p-6 shadow-soft">
              <FinalActionsSection
                setName={currentGeneratedSets[0]?.name || 'Assessment'}
                onAction={handleFinalAction}
              />
            </section>
          )}

          {hasFetchedChapterAssessments && hasChapterAssessments === false && currentGeneratedSets.length === 0 && !isGenerating && !isFetching && !isFetchingAssessments && (
            <section className="bg-card rounded-2xl border border-border p-6 shadow-soft text-center">
              <h3 className="text-lg text-left font-semibold text-foreground">Assessment is not generated yet</h3>
              <p className="mt-2 text-left text-sm text-muted-foreground">
                No AI assessment found for this chapter. Generate a new assessment to continue.
              </p>
            </section>
          )}

          {/* Success State */}
          {state.finalAction && (
            <section className="bg-card rounded-2xl border border-border p-6 shadow-soft">
              <SuccessMessage
                action={state.finalAction}
                setName={currentGeneratedSets[0]?.name || 'Assessment'}
                onReset={handleReset}
              />
            </section>
          )}
        </div>
      </main>

      {/* Question Review Modal */}
      {state.selectedSetForReview && state.currentStep === 'reviewQuestions' && (
        <QuestionReviewModal
          set={state.selectedSetForReview}
          onClose={handleReviewClose}
          onPublish={handlePublishFromReview}
          onRemoveQuestion={(questionId) => handleRemoveQuestion(state.selectedSetForReview!.id, questionId)}
          onReplaceQuestion={(oldQuestionId, newQuestion) => 
            handleReplaceQuestion(state.selectedSetForReview!.id, oldQuestionId, newQuestion)
          }
          getSimilarQuestions={getSimilarQuestions}
        />
      )}
    </div>
  )
}

export default AdaptiveAssessment