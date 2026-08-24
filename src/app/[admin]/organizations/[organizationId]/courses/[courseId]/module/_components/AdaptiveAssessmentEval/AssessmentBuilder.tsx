'use client';
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { THEME, BANDS, LEVELS } from './constants';
import { cellTarget, poolCapacity } from './helpers';
import { useQuestionBank } from './useQuestionBank';
import { BuilderScreen } from './screens/BuilderScreen';
import { MonitorScreen } from './screens/MonitorScreen';
import { BankPickerModal } from './modals/BankPickerModal';
import { ReplaceModal } from './modals/ReplaceModal';
import { pickDemoQuestion } from './helpers';
import { Chapter, Question, BuilderState, LevelId } from './types';
import { useModuleChapters } from '@/hooks/useModuleChapters';
import { useCreateAiAssessment } from '@/hooks/createAiAssessmentEval';
import { useMapQuestions } from '@/hooks/useAIMapAssesmentEval';
import { useGetQuestionSets } from '@/hooks/useGetQuestionSetsEval';
import { usePublishAssessment } from '@/hooks/usePublishingAssessmentEval';
import { useGetAiAssessmentsByChapter } from '@/hooks/useGetAiAsssessmentEval';

const STEPS = ['Details', 'Topics & Baseline', 'Build Pool', 'Review', 'Settings', 'Publish'];

interface AssessmentBuilderProps {
  chapterId?: number;
  moduleId: number;
  baselineOptions: Chapter[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (payload: any) => void;
  bootcampId?: number;
  chapterData?: any;
  content?: any;
  fetchChapterContent?: any;
  courseId?: any;
  canEdit?: boolean;
  topicId?: number;
}

export default function AssessmentBuilder({
  chapterId: _chapterId,
  moduleId: _moduleId,
  baselineOptions: _dummyBaselineOptions,
  ...restProps
}: AssessmentBuilderProps) {
  const { chapters } = useModuleChapters(_moduleId);
  const quizChapters = useMemo(() => chapters.filter((chapter) => chapter.topicId === 4), [chapters]);
  const baselineOptions = useMemo(() => {
    return quizChapters.map((ch: any) => ({
      id: ch.chapterId,
      title: ch.chapterTitle,
      questionCount: ch.questionCount || 0,
    }));
  }, [quizChapters]);

  const [screen, setScreen] = useState<'builder' | 'monitor'>('builder');
  const [step, setStep] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [pool, setPool] = useState<Question[]>([]);
  const [generating, setGenerating] = useState<any>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [bankPicker, setBankPicker] = useState<{ topic: string; band: string } | null>(null);
  const [replaceModal, setReplaceModal] = useState<Question | null>(null);
  const [previewLevel, setPreviewLevel] = useState<LevelId>('C');
  const [showPreview, setShowPreview] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [aiAssessmentId, setAiAssessmentId] = useState<number | null>(null);

  const [a, setA] = useState<BuilderState>({
    name: '',
    objective: '',
    outcomes: '',
    questionsPerForm: 10,
    chapterIds: [],
    poolTopics: [],
    poolTopicDescriptions: {},
    poolTopicOutcomes: {},
    mode: 'formative',
    gateLevel: 'C',
    timeLimit: '45 min',
    proctorCopyPaste: true,
    proctorTabChange: true,
    status: 'editing',
    scheduledDate: '',
    scheduledTime: '',
  });
  const set = useCallback((patch: Partial<BuilderState>) => {
    setA((prev) => ({ ...prev, ...patch }));
  }, []);

  const hasInitializedBaseline = useRef(false);
  useEffect(() => {
    if (baselineOptions.length > 0 && !hasInitializedBaseline.current) {
      set({ chapterIds: baselineOptions.map((c) => c.id) });
      hasInitializedBaseline.current = true;
    }
  }, [baselineOptions, set]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }, []);

  const { questions: bankQuestions } = useQuestionBank();
  const bankTopics = Array.from(new Set(bankQuestions.map((q: Question) => q.topic)));

  const { createAiAssessment, isLoading: isCreatingAssessment, error: createAssessmentError } = useCreateAiAssessment();
  const { mapQuestions, isMapping, mapError } = useMapQuestions();
  const { getQuestionSets, isFetching: isFetchingQuestionSets, fetchError: questionSetsError, questionSets } = useGetQuestionSets();
  const { publishAssessment, isPublishing: isPublishingAssessment, publishError: publishAssessmentError } = usePublishAssessment();
  const { getAiAssessmentsByChapter } = useGetAiAssessmentsByChapter();
  const isSubmittingAssessment = isCreatingAssessment || isMapping;

  const hasHydratedFromExistingAssessment = useRef(false);

  useEffect(() => {
    if (!_chapterId || hasHydratedFromExistingAssessment.current) return;

    let isActive = true;

    const hydrateFromExistingAssessment = async () => {
      const response = await getAiAssessmentsByChapter(_chapterId);
      if (!isActive || !response?.length) return;

      const latestAssessment = [...response].sort((x, y) => {
        const xTs = new Date(x.updatedAt || x.createdAt).getTime();
        const yTs = new Date(y.updatedAt || y.createdAt).getTime();
        return yTs - xTs;
      })[0];

      const normalizedStatus: BuilderState['status'] =
        latestAssessment.status === 'draft' ||
        latestAssessment.status === 'published' ||
        latestAssessment.status === 'scheduled' ||
        latestAssessment.status === 'editing'
          ? latestAssessment.status
          : 'editing';

      const normalizedMode: BuilderState['mode'] =
        latestAssessment.scope === 'summative' ? 'summative' : 'formative';

      const scheduledDate = latestAssessment.endDatetime
        ? latestAssessment.endDatetime.slice(0, 10)
        : '';
      const scheduledTime = latestAssessment.endDatetime
        ? latestAssessment.endDatetime.slice(11, 16)
        : '';

      setA((prev) => ({
        ...prev,
        name: latestAssessment.title || prev.name,
        objective: latestAssessment.objective || prev.objective,
        outcomes: latestAssessment.expectedOutcomes || prev.outcomes,
        questionsPerForm:
          latestAssessment.totalNumberOfQuestions || prev.questionsPerForm,
        chapterIds:
          latestAssessment.chapterIds?.length > 0
            ? latestAssessment.chapterIds
            : prev.chapterIds,
        poolTopics:
          latestAssessment.poolTopics?.length > 0
            ? latestAssessment.poolTopics
            : prev.poolTopics,
        poolTopicDescriptions: prev.poolTopicDescriptions,
        poolTopicOutcomes: prev.poolTopicOutcomes,
        mode: normalizedMode,
        status: normalizedStatus,
        scheduledDate: scheduledDate || prev.scheduledDate,
        scheduledTime: scheduledTime || prev.scheduledTime,
      }));

      setAiAssessmentId(latestAssessment.id);
      hasInitializedBaseline.current = true;
      hasHydratedFromExistingAssessment.current = true;

      const setsResponse = await getQuestionSets(latestAssessment.id);
      if (!isActive || !setsResponse?.sets?.length) return;

      const mappedPool = setsResponse.sets.flatMap((set) =>
        (set.questions || []).map((q) => ({
          id: String(q.questionId),
          qtype: 'mcq',
          topic: q.topicName || 'General',
          difficulty: q.difficulty || 'medium',
          quarantined: false,
          text: q.question,
          source: 'ai' as const,
          validated: true,
          options: q.options ? Object.values(q.options) : [],
          correctIndex: Number(q.correctOption) > 0 ? Number(q.correctOption) - 1 : 0,
          explanation: q.topicDescription || 'Mapped from AI assessment',
        }))
      );

      setPool(mappedPool);
    };

    hydrateFromExistingAssessment();

    return () => {
      isActive = false;
    };
  }, [_chapterId, getAiAssessmentsByChapter, getQuestionSets]);

  const handleGenerateAndReview = useCallback(async () => {
    try {
      showToast('Creating assessment and mapping questions...');
      const result = await createAiAssessment({
        bootcampId: Number(restProps.courseId ?? 0),
        chapterId: Number(_chapterId ?? 0),
        title: a.name,
        objective: a.objective,
        expectedOutcomes: a.outcomes,
        totalNumberOfQuestions: a.questionsPerForm,
        chapterIds: a.chapterIds,
        moduleId: _moduleId,
        poolTopics: a.poolTopics,
      });

      if (!result) {
        const message = 'Failed to create AI assessment.';
        setGenError(message);
        showToast(message);
        return;
      }

      const assessmentId = Number((result as any)?.data?.id ?? (result as any)?.id);
      if (!assessmentId || Number.isNaN(assessmentId)) {
        const message = 'Assessment created without a valid id.';
        setGenError(message);
        showToast(message);
        return;
      }

      setAiAssessmentId(assessmentId);

      const mapped = await mapQuestions({ aiAssessmentId: assessmentId });
      if (!mapped) {
        const message = 'Assessment created, but mapping failed.';
        setGenError(message);
        showToast(message);
        return;
      }

      const setsResponse = await getQuestionSets(assessmentId);
      if (setsResponse?.sets?.length) {
        const mappedPool = setsResponse.sets.flatMap((set) =>
          (set.questions || []).map((q) => ({
            id: String(q.questionId),
            qtype: 'mcq',
            topic: q.topicName || 'General',
            difficulty: q.difficulty || 'medium',
            quarantined: false,
            text: q.question,
            source: 'ai' as const,
            validated: true,
            options: q.options ? Object.values(q.options) : [],
            correctIndex: Number(q.correctOption) > 0 ? Number(q.correctOption) - 1 : 0,
            explanation: q.topicDescription || 'Mapped from AI assessment',
          }))
        );
        setPool(mappedPool);
      }

      setGenError(null);
      showToast('Assessment created and mapped successfully. Moving to review.');
      setStep(3);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong while creating the assessment.';
      setGenError(message);
      showToast(message);
    }
  }, [a, createAiAssessment, getQuestionSets, mapQuestions, _chapterId, _moduleId, restProps.courseId, showToast]);

  const targets = useMemo(() => {
    const t: Record<string, Record<string, number>> = {};
    a.poolTopics.forEach((topicObj) => {
      const topic = topicObj.name;
      t[topic] = {};
      BANDS.forEach((b) => {
        t[topic][b] = cellTarget(a.questionsPerForm, a.poolTopics.length, b);
      });
    });
    return t;
  }, [a.poolTopics, a.questionsPerForm]);

  const coverage = useMemo(() => {
    let met = 0,
      total = 0,
      missing = 0;
    a.poolTopics.forEach((topicObj) => {
      const topic = topicObj.name;
      BANDS.forEach((b) => {
        total++;
        const have = pool.filter(
          (q) =>
            q.qtype === 'mcq' &&
            q.topic === topic &&
            q.difficulty === b &&
            !q.quarantined
        ).length;
        const need = targets[topic]?.[b] ?? 0;
        if (have >= need) met++;
        else missing += need - have;
      });
    });
    return { met, total, missing, complete: total > 0 && met === total };
  }, [a.poolTopics, pool, targets]);

  const generateForCell = useCallback(
    (topic: string, band: string, count: number) => {
      setGenerating({ topic, band });
      setGenError(null);
      console.log('[Generation context → production API]', {
        topic,
        band,
        count,
        objective: a.objective,
        outcomes: a.outcomes,
        topicDescription: a.poolTopicDescriptions[topic] ?? '',
      });
      setTimeout(() => {
        const usedTexts = pool
          .filter((q) => q.qtype === 'mcq' && q.topic === topic && q.difficulty === band)
          .map((q) => q.text);
        const gen: Question[] = [];
        for (let i = 0; i < count; i++) {
          const q = pickDemoQuestion(topic, band, [...usedTexts, ...gen.map((x) => x.text)]);
          if (q) gen.push(q);
          else break;
        }
        setPool((cur) => [...cur, ...gen]);
        setGenerating(null);
        if (gen.length > 0)
          showToast(`Added ${gen.length} questions for ${topic}`);
        else setGenError(`No more demo questions for ${topic} · ${band}.`);
      }, 380);
    },
    [pool, a.objective, a.outcomes, a.poolTopicDescriptions, showToast]
  );

  const fillAllGaps = useCallback(() => {
    setGenerating('bulk');
    setGenError(null);
    console.log('[Bulk generation context → production API]', {
      topics: a.poolTopics.map(t => t.name),
      objective: a.objective,
      outcomes: a.outcomes,
      topicDescriptions: a.poolTopicDescriptions,
    });
    let added = 0;
    const next = [...pool];
    a.poolTopics.forEach((topicObj) => {
      const topic = topicObj.name;
      BANDS.forEach((b) => {
        const need =
          (targets[topic]?.[b] ?? 0) -
          next.filter(
            (q) =>
              q.qtype === 'mcq' &&
              q.topic === topic &&
              q.difficulty === b &&
              !q.quarantined
          ).length;
        if (need <= 0) return;
        const usedTexts = next
          .filter((q) => q.qtype === 'mcq' && q.topic === topic && q.difficulty === b)
          .map((q) => q.text);
        for (let i = 0; i < need; i++) {
          const q = pickDemoQuestion(topic, b, [...usedTexts, ...next.map((x) => x.text)]);
          if (q) {
            next.push(q);
            usedTexts.push(q.text);
            added++;
          }
        }
      });
    });
    setPool(next);
    setTimeout(() => {
      setGenerating(null);
      showToast(`Filled ${added} gap${added !== 1 ? 's' : ''} with demo questions`);
    }, 250);
  }, [a.poolTopics, a.objective, a.outcomes, a.poolTopicDescriptions, pool, showToast, targets]);

  const publish = useCallback(async (status: string, endDatetime?: string) => {
    const normalizedStatus = status as any;

    if (status === 'published' || status === 'scheduled') {
      const assessmentId = aiAssessmentId ?? Number(restProps.courseId ?? 0);
      if (!assessmentId || Number.isNaN(assessmentId)) {
        const msg = 'Assessment is not ready to publish yet.';
        setGenError(msg);
        showToast(msg);
        return;
      }

      const finalEndDatetime = endDatetime || `${a.scheduledDate || new Date().toISOString().slice(0, 10)}T${a.scheduledTime || '09:00'}:00+05:30`;
      const response = await publishAssessment(assessmentId, { endDatetime: finalEndDatetime });
      if (!response) {
        const msg = 'Failed to publish assessment.';
        setGenError(msg);
        showToast(msg);
        return;
      }
    }

    set({ status: normalizedStatus });
    setScreen('monitor');
    showToast(
      status === 'published'
        ? 'Published — learners will see this assessment.'
        : status === 'scheduled'
          ? `Scheduled for ${endDatetime || `${a.scheduledDate || ''} ${a.scheduledTime || ''}`}`
          : 'Saved as draft.'
    );
  }, [a.scheduledDate, a.scheduledTime, aiAssessmentId, publishAssessment, restProps.courseId, set, showToast]);

  const capacity = useMemo(
    () => poolCapacity(pool, a.poolTopics.map(t => t.name), a.questionsPerForm),
    [pool, a.poolTopics, a.questionsPerForm]
  );

  const stepValid = [
    !!(a.name.trim() && a.objective.trim()),
    a.chapterIds.length > 0,
    true,
    true,
    true,
    true,
  ];

  const P = {
    a,
    set,
    step,
    setStep,
    isSubmittingAssessment,
    onGenerateAndReview: handleGenerateAndReview,
    aiAssessmentId,
    questionSets,
    isFetchingQuestionSets,
    questionSetsError,
    STEPS,
    stepValid,
    pool,
    setPool,
    targets,
    coverage,
    capacity,
    generating,
    genError,
    setGenError,
    generateForCell,
    fillAllGaps,
    bankPicker,
    setBankPicker,
    replaceModal,
    setReplaceModal,
    previewLevel,
    setPreviewLevel,
    showPreview,
    setShowPreview,
    expanded,
    setExpanded,
    publish,
    showToast,
    baselineOptions,
    bankTopics,
    bankQuestions,
    moduleId: _moduleId,
    courseId: restProps.courseId,
    chapterId: _chapterId,
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50 w-full">
      {screen === 'builder' ? (
        <BuilderScreen {...P} />
      ) : (
        <MonitorScreen
          a={a}
          pool={pool}
          capacity={capacity}
          baselineOptions={baselineOptions}
          onBack={() => setScreen('builder')}
        />
      )}

      {bankPicker && (
        <BankPickerModal
          topic={bankPicker.topic}
          band={bankPicker.band}
          pool={pool}
          setPool={setPool}
          onClose={() => setBankPicker(null)}
          showToast={showToast}
          bankQuestions={bankQuestions}
        />
      )}
      {replaceModal && (
        <ReplaceModal
          item={replaceModal}
          pool={pool}
          setPool={setPool}
          onClose={() => setReplaceModal(null)}
          showToast={showToast}
          bankQuestions={bankQuestions}
          levelCode={questionSets?.sets.find((set) => set.id === replaceModal.questionSetId)?.levelCode}
          onReplaced={async () => {
            if (!aiAssessmentId) return;
            const levelCode = questionSets?.sets.find(
              (set) => set.id === replaceModal.questionSetId
            )?.levelCode;
            await getQuestionSets(aiAssessmentId, levelCode);
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-[76px] left-1/2 -translate-x-1/2 text-white px-[18px] py-2.5 rounded-lg text-[13.5px] z-[99] bg-primary shadow-md">
          {toast}
        </div>
      )}
    </div>
  );
}

