import { useState, useEffect } from 'react';
import { AssessmentCriteria, PreviousAssessment, SelectedAssessmentWithWeight, GeneratedQuestionSet, WizardStep, MCQQuestion } from '@/types/assessment';
import { mockPreviousAssessments, mockGeneratedSets, mockReplacementQuestions } from './mockData';
import { ConfigurationForm } from '../../../../../module/_components/adaptiveAssessment/ConfigurationForm';
import { LoadingOverlay } from '../../../../../module/_components/adaptiveAssessment/LoadingOverlay';
import { PreviousAssessmentsSection } from '../../../../../module/_components/adaptiveAssessment/PreviousAssessmentsSection';
import { WeightageSection } from '../../../../../module/_components/adaptiveAssessment/WeightageSection';
import { GeneratedSetsSection } from '../../../../../module/_components/adaptiveAssessment/GeneratedSetsSection';
import { QuestionReviewModal } from '../../../../../module/_components/adaptiveAssessment/QuestionReviewModal';
import { FinalActionsSection } from '../../../../../module/_components/adaptiveAssessment/FinalActionsSection';
import { RevealButton } from '../../../../../module/_components/adaptiveAssessment/RevealButton';
import { SuccessMessage } from '../../../../../module/_components/adaptiveAssessment/SuccessMessage';
import { FileText } from 'lucide-react';

const STORAGE_KEY = 'zuvy_assessment_wizard_state';

interface WizardState {
  currentStep: WizardStep;
  revealedSteps: WizardStep[];
  assessmentName: string;
  assessmentDescription: string;
  criteria: AssessmentCriteria[];
  selectedPreviousIds: string[];
  weights: SelectedAssessmentWithWeight[];
  selectedSetForReview: GeneratedQuestionSet | null;
  generatedSets: GeneratedQuestionSet[];
  finalAction: 'publish' | 'draft' | 'schedule' | null;
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
  criteria: [createEmptyCriteria()],
  selectedPreviousIds: [],
  weights: [],
  selectedSetForReview: null,
  generatedSets: [],
  finalAction: null,
};

const AdaptiveAssessment = (props: Props) => {

      const [state, setState] = useState<WizardState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: add new fields if missing
        return {
          ...initialState,
          ...parsed,
          assessmentName: parsed.assessmentName || '',
          assessmentDescription: parsed.assessmentDescription || '',
          generatedSets: parsed.generatedSets || [],
        };
      } catch {
        return initialState;
      }
    }
    return initialState;
  });

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateState = (updates: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const revealStep = (step: WizardStep) => {
    if (!state.revealedSteps.includes(step)) {
      updateState({ revealedSteps: [...state.revealedSteps, step] });
    }
  };

  const isRevealed = (step: WizardStep) => state.revealedSteps.includes(step);

  // Step handlers
  const handleConfigSubmit = () => {
    updateState({ currentStep: 'fetchingPrevious' });
    revealStep('fetchingPrevious');
    
    // Simulate API call
    setTimeout(() => {
      updateState({ currentStep: 'selectPrevious' });
      revealStep('selectPrevious');
    }, 2500);
  };

  const handlePreviousSelectionContinue = () => {
    const weights = state.selectedPreviousIds.map(id => ({
      assessmentId: id,
      weightage: 0, // Default to 0
    }));
    updateState({ weights, currentStep: 'weightage' });
    revealStep('weightage');
  };

  const handleWeightageSubmit = () => {
    updateState({ currentStep: 'generatingQuestions' });
    revealStep('generatingQuestions');
    
    setTimeout(() => {
      updateState({ 
        currentStep: 'generatedSets',
        generatedSets: mockGeneratedSets,
      });
      revealStep('generatedSets');
    }, 3000);
  };

  const handleWeightageSkip = () => {
    handleWeightageSubmit();
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
    localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
  };

  // Question management handlers
  const handleRemoveQuestion = (setId: string, questionId: string) => {
    const updatedSets = state.generatedSets.map(set => {
      if (set.id === setId) {
        return {
          ...set,
          questions: set.questions.filter(q => q.id !== questionId),
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
          questions: set.questions.map(q => 
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

  const selectedAssessments = mockPreviousAssessments.filter(a =>
    state.selectedPreviousIds.includes(a.id)
  );

  const currentGeneratedSets = state.generatedSets.length > 0 ? state.generatedSets : mockGeneratedSets;


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-40">
        <div className="container py-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-lg opacity-50" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/25">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">Zuvy Assessment Builder</h1>
              <p className="text-sm text-text-secondary">Create MCQ assessments with AI assistance</p>
            </div>
          </div>
        </div>
      </header>

      {/* Loading States */}
      {state.currentStep === 'fetchingPrevious' && (
        <LoadingOverlay message="Please wait while we are fetching the previous assessment data." />
      )}

      {state.currentStep === 'generatingQuestions' && (
        <LoadingOverlay 
          message="Please wait for some time while we generate MCQ questions for you based on the selected domains, topics, difficulty, and past assessment patterns."
          subMessage="You can come back later while we generate the MCQ question sets for you."
        />
      )}

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Step 1: Configuration */}
          {isRevealed('configuration') && (
            <section className="bg-card rounded-2xl border border-border p-6 shadow-soft">
              <ConfigurationForm
                criteria={state.criteria}
                onCriteriaChange={(criteria) => updateState({ criteria })}
                onSubmit={handleConfigSubmit}
                assessmentName={state.assessmentName}
                assessmentDescription={state.assessmentDescription}
                onNameChange={(name) => updateState({ assessmentName: name })}
                onDescriptionChange={(description) => updateState({ assessmentDescription: description })}
              />
            </section>
          )}

          {/* Reveal Button for Step 2 */}
          {isRevealed('configuration') && !isRevealed('selectPrevious') && state.currentStep === 'configuration' && (
            <RevealButton 
              label="Reveal: Previous Assessments Selection" 
              onClick={() => {
                updateState({ currentStep: 'fetchingPrevious' });
                revealStep('fetchingPrevious');
                setTimeout(() => {
                  updateState({ currentStep: 'selectPrevious' });
                  revealStep('selectPrevious');
                }, 2500);
              }}
              variant="secondary"
            />
          )}

          {/* Step 2: Previous Assessments */}
          {isRevealed('selectPrevious') && state.currentStep !== 'fetchingPrevious' && (
            <section className="bg-card rounded-2xl border border-border p-6 shadow-soft">
              <PreviousAssessmentsSection
                assessments={mockPreviousAssessments}
                selectedIds={state.selectedPreviousIds}
                onSelectionChange={(ids) => updateState({ selectedPreviousIds: ids })}
                onContinue={handlePreviousSelectionContinue}
              />
            </section>
          )}

          {/* Reveal Button for Step 3 */}
          {isRevealed('selectPrevious') && !isRevealed('weightage') && (
            <RevealButton 
              label="Reveal: Weightage Assignment" 
              onClick={() => {
                const weights = state.selectedPreviousIds.length > 0 
                  ? state.selectedPreviousIds.map(id => ({ assessmentId: id, weightage: 0 }))
                  : mockPreviousAssessments.slice(0, 3).map(a => ({ assessmentId: a.id, weightage: 0 }));
                
                if (state.selectedPreviousIds.length === 0) {
                  updateState({ 
                    selectedPreviousIds: mockPreviousAssessments.slice(0, 3).map(a => a.id),
                    weights,
                    currentStep: 'weightage'
                  });
                } else {
                  updateState({ weights, currentStep: 'weightage' });
                }
                revealStep('weightage');
              }}
              variant="accent"
            />
          )}

          {/* Step 3: Weightage */}
          {isRevealed('weightage') && state.currentStep !== 'generatingQuestions' && (
            <section className="bg-card rounded-2xl border border-border p-6 shadow-soft">
              <WeightageSection
                assessments={selectedAssessments.length > 0 ? selectedAssessments : mockPreviousAssessments.slice(0, 3)}
                weights={state.weights}
                onWeightChange={(weights) => updateState({ weights })}
                onSubmit={handleWeightageSubmit}
                onSkip={handleWeightageSkip}
              />
            </section>
          )}

          {/* Reveal Button for Step 4 */}
          {isRevealed('weightage') && !isRevealed('generatedSets') && (
            <RevealButton 
              label="Reveal: Generated Question Sets" 
              onClick={() => {
                updateState({ currentStep: 'generatingQuestions' });
                revealStep('generatingQuestions');
                setTimeout(() => {
                  updateState({ 
                    currentStep: 'generatedSets',
                    generatedSets: mockGeneratedSets,
                  });
                  revealStep('generatedSets');
                }, 3000);
              }}
              variant="primary"
            />
          )}

          {/* Step 4: Generated Sets */}
          {isRevealed('generatedSets') && state.currentStep !== 'generatingQuestions' && !state.selectedSetForReview && (
            <section className="bg-card rounded-2xl border border-border p-6 shadow-soft">
              <GeneratedSetsSection
                sets={currentGeneratedSets}
                onSelectSet={handleSetSelect}
              />
            </section>
          )}

          {/* Reveal Button for Step 5 */}
          {isRevealed('generatedSets') && !isRevealed('finalActions') && !state.selectedSetForReview && (
            <RevealButton 
              label="Reveal: Final Actions" 
              onClick={() => {
                updateState({ 
                  selectedSetForReview: currentGeneratedSets[0],
                  currentStep: 'finalActions' 
                });
                revealStep('reviewQuestions');
                revealStep('finalActions');
              }}
              variant="secondary"
            />
          )}

          {/* Step 5: Final Actions */}
          {isRevealed('finalActions') && !state.finalAction && (
            <section className="bg-card rounded-2xl border border-border p-6 shadow-soft">
              <FinalActionsSection
                setName={state.selectedSetForReview?.name || currentGeneratedSets[0].name}
                onAction={handleFinalAction}
              />
            </section>
          )}

          {/* Success State */}
          {state.finalAction && (
            <section className="bg-card rounded-2xl border border-border p-6 shadow-soft">
              <SuccessMessage
                action={state.finalAction}
                setName={state.selectedSetForReview?.name || currentGeneratedSets[0].name}
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