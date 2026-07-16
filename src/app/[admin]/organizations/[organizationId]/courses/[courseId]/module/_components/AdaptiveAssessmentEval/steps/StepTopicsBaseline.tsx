import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { CHAPTER_TOPIC_MAP } from '../constants';
import { BuilderState, Question, Chapter } from '../types';
import { PoolTopicPicker } from '../components/PoolTopicPicker';

interface StepTopicsBaselineProps {
  a: BuilderState;
  set: (patch: Partial<BuilderState>) => void;
  baselineOptions: Chapter[];
  bankTopics: string[];
  bankQuestions: Question[];
}

export function StepTopicsBaseline({
  a,
  set,
  baselineOptions,
  bankTopics,
  bankQuestions,
}: StepTopicsBaselineProps) {
  const toggleBaseline = (id: number) =>
    set({
      baselineChapterIds: a.baselineChapterIds.includes(id)
        ? a.baselineChapterIds.filter((x: number) => x !== id)
        : [...a.baselineChapterIds, id],
    });

  const totalBaselineQ = baselineOptions
    .filter((c: Chapter) => a.baselineChapterIds.includes(c.id))
    .reduce((s: number, c: Chapter) => s + (c.questionCount || 0), 0);

  const coveredByBaseline = new Set<string>(
    a.baselineChapterIds.flatMap((id: number) => CHAPTER_TOPIC_MAP[id] ?? [])
  );
  const uncoveredTopics = (a.poolTopics as string[]).filter(
    (t) => !coveredByBaseline.has(t)
  );

  return (
    <div className="grid grid-cols-2 gap-[18px] items-start">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-[22px]">
        <h4 className="text-base flex font-bold mb-1.5 mt-0">
          Baseline signal
        </h4>
        <p className="text-[13px] text-slate-600 mb-4 mt-0 leading-relaxed">
          MCQ chapters in this module. Learner performance is used to assign a
          starting level. <strong>No separate baseline test is needed.</strong>
        </p>

        <div className="flex flex-col gap-2 mb-3.5">
          {baselineOptions.length === 0 && (
            <div className="text-[13px] text-slate-500 py-3">
              No MCQ chapters found in this module.
            </div>
          )}
          {baselineOptions.map((ch: Chapter) => {
            const sel = a.baselineChapterIds.includes(ch.id);
            const covers = CHAPTER_TOPIC_MAP[ch.id] ?? [];
            const selClass = sel ? "border-primary bg-primary-light/30" : "border-slate-200 bg-white";
            const checkClass = sel ? "border-primary bg-primary" : "border-slate-200 bg-white";
            return (
              <div
                key={ch.id}
                onClick={() => toggleBaseline(ch.id)}
                className={`flex items-center gap-3 py-[11px] px-[14px] border-2 rounded-lg cursor-pointer transition-all duration-150 ${selClass}`}
              >
                <div className={`w-[18px] h-[18px] rounded flex items-center justify-center shrink-0 border-2 ${checkClass}`}>
                  {sel && <Check size={11} color="#fff" />}
                </div>
                <div className="flex-1">
                  <div className="text-[13.5px] flex font-semibold">{ch.title}</div>
                  <div className="text-[13.5px] flex text-slate-500 ">
                    {ch.questionCount || 0} questions
                    {covers.length > 0 && (
                      <span className=" text-[13.5px]  flex text-primary">
                        · covers {covers.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <span className="bg-secondary-light text-secondary-dark text-[11.5px] font-semibold px-[9px] py-[3px] rounded-full inline-flex items-center gap-1 whitespace-nowrap">
                  MCQ
                </span>
              </div>
            );
          })}
        </div>

        <div className="bg-slate-100 rounded-lg py-3 px-3.5">
          <div className="text-[11.5px] flex font-bold text-slate-500 tracking-wider mb-2">
            HOW LEVEL IS ASSIGNED
          </div>
          {[
            ['90–100%', 'Level A+'],
            ['76–89%', 'Level A'],
            ['61–75%', 'Level B'],
            ['46–60%', 'Level C (default)'],
            ['31–45%', 'Level D'],
            ['0–30%', 'Level E'],
          ].map(([range, level]) => (
            <div
              key={range}
              className="flex justify-between text-xs text-slate-600 py-0.5"
            >
              <span className='text-[13px] flex'>{range} correct across baseline MCQs</span>
              <strong className='text-[13px] flex'>{level}</strong>
            </div>
          ))}
          <div className="text-[11.5px] text-slate-500 mt-[7px]">
            Learners with no MCQ attempts start at Level C.
          </div>
        </div>

        {totalBaselineQ > 0 && (
          <div className="mt-3 text-[13px] text-primary">
            {totalBaselineQ} questions across {a.baselineChapterIds.length} chapter
            {a.baselineChapterIds.length !== 1 ? 's' : ''} will feed the level signal
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-[22px]">
          <h4 className="text-base flex font-bold mb-1.5 mt-0">Pool topics</h4>
          <p className="text-[13px] text-slate-600 mb-3.5 mt-0 leading-relaxed">
            Choose the topics to draw questions from. Questions are assembled per
            student based on their level.
          </p>
          <PoolTopicPicker
            a={a}
            set={set}
            bankTopics={bankTopics}
            bankQuestions={bankQuestions}
          />
          {a.poolTopics.length === 0 && (
            <div className="mt-3.5 text-[13px] text-slate-500">
              Select at least one topic to continue.
            </div>
          )}
        </div>

        {uncoveredTopics.length > 0 && (
          <div className="bg-amber-100 border border-amber-500 rounded-lg py-[11px] px-[14px] text-[13px] text-amber-700 flex gap-2 items-start">
            <AlertTriangle size={14} className="mt-[1px] shrink-0" />
            <div>
              <strong>Baseline–topic mismatch:</strong> {uncoveredTopics.join(', ')}{' '}
              {uncoveredTopics.length === 1 ? 'is' : 'are'} in the pool but no selected
              baseline chapter covers {uncoveredTopics.length === 1 ? 'it' : 'them'}. Learner
              level won&apos;t reflect{' '}
              {uncoveredTopics.length === 1 ? 'this topic' : 'these topics'}.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
