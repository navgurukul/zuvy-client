import React, { useState } from 'react';
import { Info, AlertCircle, X, Loader2, Check } from 'lucide-react';
import { BANDS, QTYPES, LEVELS, POOL_MULTIPLIER, DIFF_LABEL } from '../constants';
import { Btn } from '../ui-primitives';
import { bandCount } from '../helpers';
import { Question, Chapter, BuilderState } from '../types';

interface StepPoolProps {
  a: BuilderState;
  pool: Question[];
  targets: Record<string, Record<string, number>>;
  coverage: { met: number; total: number; missing: number; complete: boolean };
  capacity: number;
  generating: any;
  genError: string | null;
  setGenError: (error: string | null) => void;
  generateForCell: (topic: string, band: string, count: number) => void;
  fillAllGaps: () => void;
  setBankPicker: (picker: { topic: string; band: string } | null) => void;
  baselineOptions: Chapter[];
  bankQuestions: Question[];
}

export function StepPool({
  a,
  pool,
  targets,
  coverage,
  capacity,
  generating,
  genError,
  setGenError,
  generateForCell,
  fillAllGaps,
  setBankPicker,
  baselineOptions,
  bankQuestions,
}: StepPoolProps) {
  const [qTab, setQTab] = useState('mcq');

  const typeCount = (t: string) => pool.filter((q: Question) => q.qtype === t && !q.quarantined).length;
  const linkedChapters = baselineOptions.filter((c: Chapter) =>
    a.baselineChapterIds.includes(c.id)
  );

  const smeAvailable = bankQuestions.filter(
    (q: Question) =>
      q.source === 'bank' &&
      q.validated &&
      a.poolTopics.includes(q.topic) &&
      !pool.some((p: Question) => p.id === q.id)
  ).length;

  return (
    <div>
      <div className="bg-primary-light border border-primary rounded-[10px] py-[14px] px-[18px] mb-5">
        <div className="font-bold flex text-[14px] text-primary-dark mb-1">
          Baseline signal — {linkedChapters.length} MCQ chapter{linkedChapters.length !== 1 ? 's' : ''} linked
        </div>
        <div className="flex gap-[7px] flex-wrap mb-2">
          {linkedChapters.map((c: Chapter) => (
            <span
              key={c.id}
              className="bg-card border border-primary text-primary-dark text-[12px] font-semibold py-[3px] px-[10px] rounded-full"
            >
              {c.title} · {c.questionCount}Q
            </span>
          ))}
        </div>
        <div className="text-[12.5px] flex text-muted-foreground leading-relaxed">
          When a learner opens this assessment, the system reads their MCQ history and
          maps it to a level (E → A+). The pool below serves the right difficulty mix
          for that level.
        </div>
      </div>

      {smeAvailable > 0 && (
        <div className="bg-secondary-light border border-secondary rounded-[10px] py-[11px] px-4 mb-4">
          <span className="text-[13px] flex text-secondary-dark">
            <strong>{smeAvailable} SME-validated question{smeAvailable !== 1 ? 's' : ''}</strong>{' '}
            in the bank ready to add — click &quot;Bank (N)&quot; in any cell.
          </span>
        </div>
      )}

      <div className="flex gap-0.5 border-b border-border mb-[22px]">
        {QTYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setQTab(t.id)}
            className={`px-[18px] pt-[9px] pb-[11px] border-none bg-transparent cursor-pointer font-semibold text-[13px] flex gap-1.5 items-center border-b-[3px] transition-colors ${qTab === t.id ? 'text-primary-dark border-primary' : 'text-muted-foreground border-transparent'
              }`}
          >
            {t.label} ({typeCount(t.id)})
          </button>
        ))}
      </div>

      {qTab === 'mcq' && (
        <div>
          <div className="flex justify-between items-start mb-[13px]">
            <div>
              <h4 className="text-[16px] flex font-bold m-0 mb-0.5">MCQ pool</h4>
              <div className="bg-muted flex rounded-md py-2 px-3 text-[12.5px] text-muted-foreground leading-relaxed max-w-[520px]">
                <strong className="text-foreground">Why these targets?</strong> Each
                cell needs {POOL_MULTIPLIER}× the maximum draw any level makes. With{' '}
                {a.questionsPerForm} questions/form and {a.poolTopics.length || 1} topic{a.poolTopics.length !== 1 ? 's' : ''},
                Level A+ draws the most hard questions ({Math.max(...LEVELS.map((l) => l.mix[2]))}%).
              </div>
            </div>
            <div className="text-right shrink-0 ml-4">
              <div className={`text-[22px] font-bold ${coverage.complete ? 'text-success-dark' : 'text-foreground'}`}>
                {coverage.met}/{coverage.total}
              </div>
              <div className="text-[11px] text-muted-foreground">cells at target</div>
              {capacity > 0 && (
                <div className={`text-[11px] mt-[3px] font-semibold ${capacity < 2 ? 'text-destructive' : 'text-primary-dark'}`}>
                  ~{capacity} unique attempt{capacity !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>

          <div className="border border-border rounded-lg overflow-hidden mb-[14px]">
            <div className="grid grid-cols-[160px_repeat(3,1fr)] bg-muted text-[12px] font-bold text-muted-foreground">
              <div className="py-2 px-3">Topic</div>
              {BANDS.map((b) => (
                <div key={b} className="py-2 px-3 border-l border-border flex items-center gap-[5px]">
                  {DIFF_LABEL[b]}
                </div>
              ))}
            </div>

            {a.poolTopics.length === 0 && (
              <div className="p-[22px] text-muted-foreground text-[13px] text-center">
                Select topics in Step 2 first.
              </div>
            )}

            {a.poolTopics.map((topic: string) => (
              <div key={topic} className="grid grid-cols-[160px_repeat(3,1fr)] border-t border-border">
                <div className="p-3 font-semibold text-[13px]">
                  {topic}
                </div>
                {BANDS.map((b) => {
                  const have = bandCount(pool, topic, b);
                  const need = targets[topic]?.[b] ?? 0;
                  const met = have >= need;
                  const inBank = bankQuestions.filter(
                    (q: Question) =>
                      q.validated &&
                      q.qtype === 'mcq' &&
                      q.topic === topic &&
                      q.difficulty === b &&
                      !pool.some((p: Question) => p.id === q.id)
                  ).length;
                  const busy =
                    generating &&
                    generating !== 'bulk' &&
                    generating.topic === topic &&
                    generating.band === b;

                  return (
                    <div key={b} className={`py-2.5 px-3 border-l border-border ${met ? 'bg-success-light' : 'bg-card'}`}>
                      <div className="flex justify-between items-baseline mb-[5px]">
                        <span className={`font-bold text-[13px] ${met ? 'text-success-dark' : 'text-foreground'}`}>
                          {have}
                          <span className="font-normal text-muted-foreground text-[11px]">
                            {' '}
                            / {need}
                          </span>
                        </span>
                        {met && <Check size={13} className="text-success-dark" />}
                      </div>
                      <div className="h-1 bg-muted rounded-full mb-2">
                        <div
                          className="h-1 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.round((have / Math.max(need, 1)) * 100))}%`,
                            background: met ? '#7CB342' : '#fbbf24',
                          }}
                        />
                      </div>
                      {!met && (
                        <div className="flex gap-[5px] flex-wrap">
                          {inBank > 0 && (
                            <button
                              onClick={() => setBankPicker({ topic, band: b })}
                              className="text-[11px] font-semibold text-primary bg-transparent border border-primary rounded-[5px] py-[3px] px-[7px] cursor-pointer"
                            >
                              Bank ({inBank})
                            </button>
                          )}
                          <button
                            disabled={!!busy || generating === 'bulk'}
                            onClick={() => generateForCell(topic, b, need - have)}
                            className={`text-[11px] font-semibold text-white bg-secondary border-none rounded-[5px] py-[3px] px-[7px] cursor-pointer flex gap-[3px] items-center ${busy || generating === 'bulk' ? 'opacity-55' : 'opacity-100'}`}
                          >
                            {busy ? (
                              <Loader2 size={10} className="animate-spin" />
                            ) : null}
                            Gen {need - have}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {genError && (
            <div className="bg-destructive-light border border-destructive rounded-lg py-[9px] px-[13px] text-[13px] text-destructive mb-3 flex justify-between items-center">
              <span className="flex items-center gap-[5px]">
                <AlertCircle size={13} className="shrink-0" />
                {genError}
              </span>
              <button
                onClick={() => setGenError(null)}
                className="bg-transparent border-none text-destructive cursor-pointer p-0 flex items-center"
              >
                <X size={13} />
              </button>
            </div>
          )}

          <div className="flex gap-[11px] items-center">
            <Btn
              variant="secondary"
              disabled={!!generating || coverage.complete}
              onClick={fillAllGaps}
            >
              {generating === 'bulk' ? (
                <Loader2 size={13} className="animate-spin mr-1.5 inline-block" />
              ) : null}
              {generating === 'bulk' ? 'Filling…' : `Fill all ${coverage.missing} gaps`}
            </Btn>
          </div>

          <div className="mt-[18px] flex items-center bg-info-light border border-info rounded-lg py-[11px] px-[15px] text-[12.5px] text-info flex gap-2">
            <Info size={14} className="shrink-0 mt-[1px]" />
            <div>
              <strong>Cross-topic questions (roadmap):</strong> Each question currently
              belongs to exactly one topic.
            </div>
          </div>
        </div>
      )}

      {qTab !== 'mcq' && (
        <div className="bg-info-light rounded-lg py-[14px] px-[18px] text-[13px] text-info flex gap-[9px]">
          <Info size={14} className="shrink-0 mt-[1px]" />
          Fixed section — identical for every student. Adaptivity applies to MCQs only.
        </div>
      )}
    </div>
  );
}
