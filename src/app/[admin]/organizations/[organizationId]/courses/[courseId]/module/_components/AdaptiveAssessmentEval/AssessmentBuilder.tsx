'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { THEME, BANDS, LEVELS } from './constants';
import { cellTarget, poolCapacity } from './helpers';
import { useQuestionBank } from './useQuestionBank';
import { BuilderScreen } from './screens/BuilderScreen';
import { MonitorScreen } from './screens/MonitorScreen';
import { BankPickerModal } from './modals/BankPickerModal';
import { ReplaceModal } from './modals/ReplaceModal';
import { pickDemoQuestion } from './helpers';
import { Chapter, Question, BuilderState, LevelId } from './types';

const STEPS = ['Details', 'Topics & Baseline', 'Build Pool', 'Review', 'Settings', 'Publish'];

interface AssessmentBuilderProps {
  chapterId: number;
  moduleId: number;
  baselineOptions: Chapter[];
}

export default function AssessmentBuilder({
  chapterId: _chapterId,
  moduleId: _moduleId,
  baselineOptions,
}: AssessmentBuilderProps) {
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

  const [a, setA] = useState<BuilderState>({
    name: '',
    objective: '',
    outcomes: '',
    questionsPerForm: 10,
    baselineChapterIds: baselineOptions.map((c) => c.id),
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
  const set = (patch: Partial<BuilderState>) => setA((prev) => ({ ...prev, ...patch }));

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const { questions: bankQuestions } = useQuestionBank();
  const bankTopics = Array.from(new Set(bankQuestions.map((q: Question) => q.topic)));

  const targets = useMemo(() => {
    const t: Record<string, Record<string, number>> = {};
    a.poolTopics.forEach((topic) => {
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
    a.poolTopics.forEach((topic) =>
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
      })
    );
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
    [pool, a.objective, a.outcomes, a.poolTopicDescriptions]
  );

  const fillAllGaps = useCallback(() => {
    setGenerating('bulk');
    setGenError(null);
    console.log('[Bulk generation context → production API]', {
      topics: a.poolTopics,
      objective: a.objective,
      outcomes: a.outcomes,
      topicDescriptions: a.poolTopicDescriptions,
    });
    let added = 0;
    const next = [...pool];
    a.poolTopics.forEach((topic) =>
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
      })
    );
    setPool(next);
    setTimeout(() => {
      setGenerating(null);
      showToast(`Filled ${added} gap${added !== 1 ? 's' : ''} with demo questions`);
    }, 250);
  }, [a.poolTopics, a.objective, a.outcomes, a.poolTopicDescriptions, pool, targets]);

  const publish = (status: string) => {
    set({ status: status as any });
    setScreen('monitor');
    showToast(
      status === 'published'
        ? 'Published — learners will see this assessment.'
        : status === 'scheduled'
          ? `Scheduled for ${a.scheduledDate}`
          : 'Saved as draft.'
    );
  };

  const capacity = useMemo(
    () => poolCapacity(pool, a.poolTopics, a.questionsPerForm),
    [pool, a.poolTopics, a.questionsPerForm]
  );

  const stepValid = [
    !!(a.name.trim() && a.objective.trim()),
    a.poolTopics.length > 0,
    pool.length > 0,
    true,
    true,
    true,
  ];

  const P = {
    a,
    set,
    step,
    setStep,
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

