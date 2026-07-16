import React, { useState } from 'react';
import { Eye, RefreshCw, Trash2, X, Check } from 'lucide-react';
import { LEVELS, DIFF_LABEL, DIFF_BG, DIFF_COLOR } from '../constants';
import { Btn } from '../ui-primitives';
import { Question, BuilderState, LevelId } from '../types';

interface StepReviewProps {
  a: BuilderState;
  pool: Question[];
  setPool: any;
  expanded: string | null;
  setExpanded: (id: string | null) => void;
  setReplaceModal: (question: Question | null) => void;
  previewLevel: LevelId;
  setPreviewLevel: (level: LevelId) => void;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
}

export function StepReview({
  a,
  pool,
  setPool,
  expanded,
  setExpanded,
  setReplaceModal,
  previewLevel,
  setPreviewLevel,
  showPreview,
  setShowPreview,
}: StepReviewProps) {
  const [filter, setFilter] = useState('all');

  const shown = pool.filter((q: Question) => {
    if (filter === 'ai') return q.source === 'ai';
    if (filter === 'bank') return q.source === 'bank';
    if (filter === 'fixed') return q.qtype !== 'mcq';
    return true;
  });

  const assemblePreview = () => {
    const lvl = LEVELS.find((l) => l.id === previewLevel)!;
    const counts = a.poolTopics.map((_, i) =>
      Math.round((a.questionsPerForm * lvl.mix[i]) / 100)
    );
    const picked: Question[] = [];
    LEVELS.forEach((_, i) => {
      const avail = pool.filter((q: Question) => q.qtype === 'mcq' && !q.quarantined);
      picked.push(...avail.slice(0, counts[i]));
    });
    return picked;
  };

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap gap-3 mb-4">
        <div>
          <h4 className="text-[18px] flex font-bold m-0 mb-0.5">
            Review the pool
          </h4>
          <p className="text-[13px] text-muted-foreground m-0">
            Replace or remove any question. Preview shows how a form assembles for a
            given level.
          </p>
        </div>
        <div className="flex gap-[9px] items-center">
          <select
            value={previewLevel}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setPreviewLevel(e.target.value as LevelId)
            }
            className="w-[115px] py-[7px] px-[10px] rounded-md border border-border text-[14px] text-foreground bg-card outline-none font-inherit box-border"
          >
            {LEVELS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
          <Btn variant="outline" onClick={() => setShowPreview(true)}>
            <Eye size={13} className="mr-1" /> Preview form
          </Btn>
        </div>
      </div>

      <div className="flex gap-1.5 mb-[14px] flex-wrap">
        {[
          ['all', `All (${pool.length})`],
          ['ai', `AI (${pool.filter((q: Question) => q.source === 'ai').length})`],
          ['bank', `Bank (${pool.filter((q: Question) => q.source === 'bank').length})`],
        ].map(([k, lbl]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`py-[5px] px-[12px] rounded-full border font-semibold text-[12.5px] cursor-pointer font-inherit transition-colors ${filter === k
              ? 'border-primary bg-primary-light text-primary-dark'
              : 'border-border bg-card text-muted-foreground'
              }`}
          >
            {lbl}
          </button>
        ))}
      </div>

      {shown.length === 0 && (
        <div className="bg-card rounded-lg border border-border shadow-soft p-7 text-center text-muted-foreground text-[14px]">
          Pool is empty — go back to Build Pool.
        </div>
      )}

      {shown.map((item: Question) => (
        <div
          key={item.id}
          className={`bg-card rounded-lg border border-border shadow-soft p-[13px_17px] mb-2 ${item.quarantined ? 'opacity-50' : 'opacity-100'
            }`}
        >
          <div className="flex gap-3 items-start justify-between">
            <div
              className="flex-1 cursor-pointer min-w-0"
              onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            >
              <div className="flex gap-[5px] mb-1.5 flex-wrap">
                <span className="bg-muted text-muted-foreground text-[11.5px] font-semibold py-[3px] px-[9px] rounded-full inline-flex items-center whitespace-nowrap">
                  {item.topic}
                </span>
                <span
                  style={{ background: DIFF_BG[item.difficulty], color: DIFF_COLOR[item.difficulty] }}
                  className="text-[11.5px] font-semibold py-[3px] px-[9px] rounded-full inline-flex items-center whitespace-nowrap"
                >
                  {DIFF_LABEL[item.difficulty]}
                </span>
                <span
                  className={`text-[11.5px] font-semibold py-[3px] px-[9px] rounded-full inline-flex items-center whitespace-nowrap ${item.source === 'ai'
                    ? 'bg-secondary-light text-secondary-dark'
                    : 'bg-info-light text-info-dark'
                    }`}
                >
                  {item.source === 'ai' ? 'AI · provisional' : 'Bank · validated'}
                </span>
              </div>
              <div className="text-[14px] flex font-medium leading-relaxed">
                {item.text}
              </div>
            </div>
            <div className="flex gap-[5px] shrink-0">
              <Btn size="sm" variant="outline" onClick={() => setReplaceModal(item)}>
                <RefreshCw size={12} className="mr-1" /> Replace
              </Btn>
              <Btn
                size="sm"
                variant="danger"
                onClick={() => setPool((p: Question[]) => p.filter((q) => q.id !== item.id))}
              >
                <Trash2 size={12} />
              </Btn>
            </div>
          </div>
          {expanded === item.id && item.options && (
            <div className="mt-[11px] border-t border-border pt-[11px]">
              {item.options.map((opt: string, i: number) => {
                const correct = i === item.correctIndex;
                return (
                  <div
                    key={i}
                    className={`flex gap-2 py-[5px] px-[9px] rounded-md mb-[3px] ${correct ? 'bg-success-light' : 'bg-transparent'
                      }`}
                  >
                    <span
                      className={`font-bold w-[17px] text-[13px] ${correct ? 'text-success-dark' : 'text-muted-foreground'
                        }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span
                      className={`text-[13.5px] flex-1 ${correct ? 'text-success-dark font-semibold' : 'text-foreground font-normal'
                        }`}
                    >
                      {opt}
                    </span>
                    {correct && <Check size={13} className="text-success-dark" />}
                  </div>
                );
              })}
              <div className="mt-2 bg-muted rounded-md py-2 px-3 text-[13px] text-muted-foreground">
                <strong className="text-foreground">Explanation:</strong>{' '}
                {item.explanation}
              </div>
            </div>
          )}
        </div>
      ))}

      {showPreview && (() => {
        const preview = assemblePreview();
        return (
          <div
            className="fixed inset-0 bg-black/45 flex items-center justify-center z-[60] p-5"
            onClick={() => setShowPreview(false)}
          >
            <div
              className="bg-card rounded-[10px] shadow-strong w-full max-w-[680px] max-h-[84vh] flex flex-col"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="py-4 px-[22px] border-b border-border flex justify-between items-center">
                <div>
                  <div className="font-bold text-[18px]">
                    Form preview — {LEVELS.find((l) => l.id === previewLevel)?.label}
                  </div>
                  <div className="text-[13px] text-muted-foreground mt-[2px]">
                    Assembled randomly from the pool.
                  </div>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="bg-transparent border-none cursor-pointer text-muted-foreground"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="overflow-y-auto p-5">
                {preview.map((q, i) => (
                  <div
                    key={q.id}
                    className="flex gap-[10px] py-[9px] px-[12px] border border-border rounded-lg mb-1.5 items-center"
                  >
                    <span className="font-bold text-muted-foreground w-[17px] text-[13px]">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-[13.5px]">{q.text}</span>
                    <span
                      style={{ background: DIFF_BG[q.difficulty], color: DIFF_COLOR[q.difficulty] }}
                      className="text-[11.5px] font-semibold py-[3px] px-[9px] rounded-full inline-flex items-center whitespace-nowrap"
                    >
                      {DIFF_LABEL[q.difficulty]}
                    </span>
                    <span className="bg-muted text-muted-foreground text-[11.5px] font-semibold py-[3px] px-[9px] rounded-full inline-flex items-center whitespace-nowrap">
                      {q.topic}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
