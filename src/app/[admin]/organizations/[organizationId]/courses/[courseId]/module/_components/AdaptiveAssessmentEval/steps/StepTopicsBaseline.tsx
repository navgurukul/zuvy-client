import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AlertCircle, AlertTriangle, Check, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { DIFF_LABEL } from '../constants';
import { Band, BandCounts, BuilderState, Chapter, Question } from '../types';
import { QuestionDistribution } from '../components/QuestionDistribution';
import {
  DistributionSummary,
  SET_COUNT,
  distributionKeyFor,
  proposeDistribution,
  sumCounts,
} from '../distribution';
import { GenerateQuestionsRequestBody, TopicWithDifficultyLevel } from '@/hooks/hookType';
import { api } from '@/utils/axios.config';
import { toast } from '@/components/ui/use-toast';

interface StepTopicsBaselineProps {
  a: BuilderState;
  set: (patch: Partial<BuilderState>) => void;
  baselineOptions: Chapter[];
  bankTopics: string[];
  bankQuestions: Question[];
  orgTopics: TopicWithDifficultyLevel[];
  orgTopicsLoading: boolean;
  refreshOrgTopics: () => Promise<unknown>;
  topicAvailability: Record<string, BandCounts>;
  distributionSummary: DistributionSummary;
  moduleId?: number;
  courseId?: any;
  chapterId?: number;
  isGenerated?: boolean;
}

const card = 'rounded-lg border border-border bg-card p-6 shadow-sm text-left';

export function StepTopicsBaseline({
  a,
  set,
  orgTopics,
  orgTopicsLoading,
  refreshOrgTopics,
  topicAvailability,
  distributionSummary: summary,
  isGenerated,
}: StepTopicsBaselineProps) {
  const pathname = usePathname();
  const [, adminSegment, , orgId] = pathname.split('/');
  const questionBankUrl = `/${adminSegment}/organizations/${orgId}/resource/mcq`;

  const selectedNames = useMemo(() => a.poolTopics.map((t) => t.name), [a.poolTopics]);

  // Chips: every org topic, plus any selected topic the list doesn't contain
  // (e.g. restored from a saved assessment).
  const chipTopics = useMemo(() => {
    const list = orgTopics.map((t) => ({ id: t.id, name: t.name }));
    a.poolTopics.forEach((pt) => {
      if (!list.some((t) => t.name === pt.name)) list.push(pt);
    });
    return list;
  }, [orgTopics, a.poolTopics]);

  // (Re)propose the distribution whenever the topic selection or set size changes.
  const currentKey = distributionKeyFor(a.questionsPerForm, selectedNames);
  const availabilityReady = orgTopics.length > 0 || selectedNames.length === 0;
  useEffect(() => {
    if (a.distributionKey === currentKey || !availabilityReady) return;
    set({
      distribution: proposeDistribution(selectedNames, topicAvailability, a.questionsPerForm),
      distributionKey: currentKey,
    });
  }, [a.distributionKey, a.questionsPerForm, availabilityReady, currentKey, selectedNames, set, topicAvailability]);

  const resetDistribution = () =>
    set({
      distribution: proposeDistribution(selectedNames, topicAvailability, a.questionsPerForm),
      distributionKey: currentKey,
    });

  const changeCell = (topic: string, band: Band, value: number) =>
    set({
      distribution: {
        ...a.distribution,
        [topic]: {
          ...(a.distribution[topic] ?? { easy: 0, medium: 0, hard: 0 }),
          [band]: Math.max(0, value),
        },
      },
    });

  const toggleTopic = (topic: { id: number; name: string }) => {
    if (isGenerated) return;
    if (selectedNames.includes(topic.name)) {
      const desc = { ...a.poolTopicDescriptions };
      delete desc[topic.name];
      const out = { ...a.poolTopicOutcomes };
      delete out[topic.name];
      set({
        poolTopics: a.poolTopics.filter((t) => t.name !== topic.name),
        poolTopicDescriptions: desc,
        poolTopicOutcomes: out,
      });
    } else {
      set({ poolTopics: [...a.poolTopics, { id: topic.id || 0, name: topic.name }] });
    }
  };

  const emptySelected = selectedNames.filter((n) => sumCounts(topicAvailability[n]) === 0);

  // Counts change when questions are added in the Question Bank (another tab).
  useEffect(() => {
    if (isGenerated) return;
    const onFocus = () => refreshOrgTopics();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [isGenerated, refreshOrgTopics]);

  const [generating, setGenerating] = useState(false);
  const [queuedCount, setQueuedCount] = useState(0);

  const generateMissing = useCallback(async () => {
    const byTopic: Record<string, BandCounts> = {};
    summary.shortages.forEach(({ topic, band, short }) => {
      byTopic[topic] = byTopic[topic] ?? { easy: 0, medium: 0, hard: 0 };
      byTopic[topic][band] += short;
    });

    setGenerating(true);
    const results = await Promise.allSettled(
      Object.entries(byTopic).map(([topicName, counts]) => {
        const total = sumCounts(counts);
        const pct = (n: number) => Math.round((n / total) * 100);
        const topicDescription = a.poolTopicDescriptions[topicName] ?? '';
        const body: GenerateQuestionsRequestBody = {
          topicName,
          topicDescription,
          subtopics: [],
          numberOfQuestions: total,
          learningObjectives: a.objective,
          targetAudience: 'Beginner students',
          focusAreas: '',
          bloomsLevel: 'apply',
          questionStyle: 'practical',
          difficultyDistribution: {
            easy: pct(counts.easy),
            medium: pct(counts.medium),
            hard: pct(counts.hard),
          },
          questionCounts: counts,
          topics: { [topicName]: total },
          topicConfigurations: [
            {
              topicName,
              topicDescription,
              subtopics: [],
              totalQuestions: total,
              questionCounts: counts,
            },
          ],
          levelId: null,
        };
        return api.post(
          `${process.env.NEXT_PUBLIC_EVAL_URL}/questions/generate?orgId=${orgId}`,
          body
        );
      })
    );
    setGenerating(false);

    const failed = Object.keys(byTopic).filter((_, i) => results[i].status === 'rejected');
    const queued = Object.entries(byTopic)
      .filter(([t]) => !failed.includes(t))
      .reduce((s, [, c]) => s + sumCounts(c), 0);
    if (queued > 0) setQueuedCount(queued);

    if (failed.length === 0) {
      toast({
        title: `Generating ${queued} question${queued !== 1 ? 's' : ''}`,
        description:
          'They take a few minutes and must be approved in the Question Bank before they count here.',
        variant: 'success',
      });
    } else {
      toast({
        title: 'Some questions could not be generated',
        description: `Failed for: ${failed.join(', ')}. Please try again.`,
        variant: 'destructive',
      });
    }
  }, [a.objective, a.poolTopicDescriptions, orgId, summary.shortages]);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Select topics ─────────────────────────────────────────────── */}
      <div className={card}>
        <div className="mb-1 flex items-start justify-between gap-4">
          <h4 className="m-0 text-base font-bold">Select topics</h4>
          <a
            href={questionBankUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Manage topics
          </a>
        </div>
        <p className="m-0 mb-4 text-[13px] text-muted-foreground">
          Same topic list as Question Bank. Counts include only your organization&apos;s
          questions.
        </p>

        {chipTopics.length === 0 ? (
          <div className="flex items-center gap-2 py-2 text-[13px] text-muted-foreground">
            {orgTopicsLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Loading topics…
              </>
            ) : (
              'No topics yet. Create topics in the Question Bank.'
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {chipTopics.map((t) => {
              const selected = selectedNames.includes(t.name);
              const count = sumCounts(topicAvailability[t.name]);
              const empty = count === 0;
              const chipClass = selected
                ? empty
                  ? 'border-red-400 bg-red-50 text-red-700 dark:border-red-500/60 dark:bg-red-500/10 dark:text-red-300'
                  : 'border-primary/60 bg-primary/10 text-primary-dark dark:text-primary'
                : 'border-border bg-card text-foreground hover:bg-muted';
              const countClass = selected && empty ? 'text-red-600 dark:text-red-300' : 'text-muted-foreground';
              return (
                <button
                  key={`${t.id}-${t.name}`}
                  type="button"
                  onClick={() => toggleTopic(t)}
                  disabled={isGenerated}
                  aria-pressed={selected}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${chipClass} ${isGenerated ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                >
                  {selected &&
                    (empty ? <AlertTriangle size={15} /> : <Check size={15} />)}
                  {t.name}
                  <span className={`text-xs font-semibold ${countClass}`}>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {emptySelected.length > 0 && (
          <p className="m-0 mt-3 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
            <AlertCircle size={13} className="shrink-0" />
            {emptySelected.join(', ')} {emptySelected.length === 1 ? 'has' : 'have'} no
            questions yet. You can keep {emptySelected.length === 1 ? 'it' : 'them'} selected
            and generate questions for {emptySelected.length === 1 ? 'it' : 'them'}.
          </p>
        )}
      </div>

      {/* ── Shortage banner ──────────────────────────────────────────── */}
      {!isGenerated && selectedNames.length > 0 && summary.totalShort > 0 && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-5 text-left dark:border-red-500/40 dark:bg-red-500/10">
          <div className="flex gap-3">
            <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
            <div className="flex-1">
              <div className="font-bold text-red-700 dark:text-red-300">
                Not enough questions to build {SET_COUNT} sets — {summary.totalShort} short
              </div>
              <div className="mb-2 text-sm text-red-700/90 dark:text-red-300/90">
                The pool needs {summary.poolNeed} questions. Here&apos;s exactly what&apos;s
                missing:
              </div>
              <ul className="m-0 mb-4 list-disc space-y-0.5 pl-5 text-sm text-red-700 dark:text-red-300">
                {summary.shortages.map((s) => (
                  <li key={`${s.topic}-${s.band}`}>
                    {s.topic} · {DIFF_LABEL[s.band]} — needs {s.need}, has {s.has} (
                    <strong>{s.short} short</strong>)
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="relative inline-flex flex-col items-start">
                  <span className="relative mb-2 rounded-full bg-orange-600 px-3 py-1 text-xs font-semibold text-white after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-[5px] after:border-transparent after:border-t-orange-600 after:content-['']">
                    Step 2 · Generate the missing questions
                  </span>
                  <div className="rounded-lg bg-orange-200/70 p-1 dark:bg-orange-500/30">
                    <button
                      type="button"
                      onClick={generateMissing}
                      disabled={generating}
                      className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {generating ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Sparkles size={15} />
                      )}
                      {generating ? 'Generating…' : 'Generate missing questions'}
                    </button>
                  </div>
                </div>
                <div className="self-end pb-2.5 text-sm text-muted-foreground">
                  {queuedCount > 0 ? (
                    <span className="inline-flex flex-wrap items-center gap-x-2">
                      {queuedCount} question{queuedCount !== 1 ? 's' : ''} queued — approve
                      them in the Question Bank, then
                      <button
                        type="button"
                        onClick={() => refreshOrgTopics()}
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                      >
                        <RefreshCw size={12} className={orgTopicsLoading ? 'animate-spin' : ''} />
                        refresh counts
                      </button>
                    </span>
                  ) : (
                    'Your progress here is saved. Questions are generated in the background.'
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Question distribution ────────────────────────────────────── */}
      <QuestionDistribution
        topics={selectedNames}
        distribution={a.distribution}
        available={topicAvailability}
        summary={summary}
        questionsPerSet={a.questionsPerForm}
        disabled={isGenerated}
        onChange={changeCell}
        onReset={resetDistribution}
      />
    </div>
  );
}
