import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ChevronUp, ChevronDown, X, AlertTriangle, Link2 } from 'lucide-react';
import { THEME, BANDS, LEVELS } from '../constants';
import { inputStyle, Btn, Badge } from '../ui-primitives';
import { scoreTopicMatch } from '../helpers';
import { BuilderState, Question } from '../types';
import { useTopicsWithDifficultyLevels } from '@/hooks/useTopicsWithDifficultiesEval';
import useDebounce from '@/app/[admin]/hooks/useDebounce';
import { TopicWithDifficultyLevel } from '@/hooks/hookType';

interface PoolTopicPickerProps {
  a: BuilderState;
  set: (patch: Partial<BuilderState>) => void;
  bankTopics: string[];
  bankQuestions: Question[];
}

export function PoolTopicPicker({
  a,
  set,
  bankTopics,
  bankQuestions,
}: PoolTopicPickerProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { fetchTopics, data: fetchedTopics, isLoading: fetchingTopics } = useTopicsWithDifficultyLevels();

  useEffect(() => {
    fetchTopics(debouncedQuery);
  }, [debouncedQuery, fetchTopics]);

  const [open, setOpen] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<TopicWithDifficultyLevel[] | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const removeTopic = (tName: string) => {
    const desc = { ...a.poolTopicDescriptions };
    delete desc[tName];
    const out = { ...a.poolTopicOutcomes };
    delete out[tName];
    set({
      poolTopics: a.poolTopics.filter((x) => x.name !== tName),
      poolTopicDescriptions: desc,
      poolTopicOutcomes: out,
    });
  };

  const addTopic = (topicObj: { id: number; name: string }) => {
    const name = topicObj.name.trim();
    if (!name || a.poolTopics.some(pt => pt.name === name)) return;
    set({ poolTopics: [...a.poolTopics, { id: topicObj.id || 0, name }] });
    setQuery('');
    setSuggestions(null);
    inputRef.current?.focus();
  };

  const moveTopic = (idx: number, dir: -1 | 1) => {
    const arr = [...a.poolTopics];
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    set({ poolTopics: arr });
  };

  const bankCounts = (topic: string) => {
    const qs = (bankQuestions as Question[]).filter(
      (q) => q.qtype === 'mcq' && q.topic === topic
    );
    return BANDS.map((b) => qs.filter((x) => x.difficulty === b).length);
  };

  const topicCapacity = (topic: string, topicCount: number): number => {
    return Math.min(
      ...BANDS.map((_b, bi) => {
        const maxPct = Math.max(...LEVELS.map((l) => l.mix[bi])) / 100;
        const maxDraw = Math.ceil((a.questionsPerForm * maxPct) / Math.max(topicCount, 1));
        const have = bankCounts(topic)[bi];
        return maxDraw > 0 ? Math.floor(have / maxDraw) : 99;
      })
    );
  };

  const filtered = fetchedTopics?.filter(
    (t) => !a.poolTopics.some(pt => pt.name === t.name)
  ) || [];

  const queryIsNew =
    query.trim() !== '' &&
    !fetchedTopics?.some(t => t.name.toLowerCase() === query.trim().toLowerCase()) &&
    !a.poolTopics.some(pt => pt.name.toLowerCase() === query.trim().toLowerCase());

  const showDropdown = open && (filtered.length > 0 || queryIsNew || fetchingTopics);

  const suggestTopics = () => {
    setSuggesting(true);
    setTimeout(() => {
      const text = a.objective + ' ' + a.outcomes;
      const unselected = (fetchedTopics || []).filter(
        (t) => !a.poolTopics.some(pt => pt.name === t.name)
      );
      const scored = unselected
        .map((t) => ({ t, score: scoreTopicMatch(t.name, text) }))
        .sort((a: any, b: any) => b.score - a.score);
      setSuggestions(scored.map((x: any) => x.t));
      setSuggesting(false);
    }, 500);
  };

  return (
    <div>
      {/* Suggest from objective */}
      {(a.objective.trim() || a.outcomes.trim()) && (
        <div className="mb-3">
          <Btn
            variant="ghost"
            size="sm"
            disabled={suggesting}
            onClick={suggestTopics}
          // className="py-[5px] px-0 text-[12.5px]"
          >
            {suggesting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : null}
            Suggest topics from objective
          </Btn>
          {suggestions !== null && (
            <div
              className="mt-2 rounded-[7px] border px-3 py-2.5"
              style={{
                background: THEME.secondaryLight,
                borderColor: THEME.secondary,
              }}
            >
              <div
                className="mb-[7px] text-[11.5px] font-bold tracking-[.04em]"
                style={{ color: THEME.secondaryDark }}
              >
                SUGGESTED FROM OBJECTIVE
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.length === 0 ? (
                  <span className="text-[12.5px]" style={{ color: THEME.textTertiary }}>
                    No matches — add topics manually.
                  </span>
                ) : (
                  suggestions.map((t) => (
                    <button
                      key={t.name}
                      onMouseDown={() => addTopic({ id: t.id, name: t.name })}
                      className="cursor-pointer rounded-md border px-2.5 py-1 font-sans text-[13px] font-semibold"
                      style={{
                        background: THEME.card,
                        borderColor: THEME.secondary,
                        color: THEME.secondaryDark,
                      }}
                    >
                      + {t.name}
                    </button>
                  ))
                )}
              </div>
              <button
                onClick={() => setSuggestions(null)}
                className="mt-2 cursor-pointer border-none bg-transparent p-0 font-sans text-[11.5px]"
                style={{ color: THEME.textTertiary }}
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {/* Selected chips */}
      {a.poolTopics.length > 0 && (
        <div className="mb-3.5 flex flex-col gap-1.5">
          {a.poolTopics.map((topicObj, idx: number) => {
            const t = topicObj.name;
            const counts = bankCounts(t);
            const inBank = counts.some((n) => n > 0);
            const isCustom = topicObj.id === 0 || !bankTopics.includes(t);
            const hasZeroBand = inBank && counts.some((n) => n === 0);
            const cap = topicCapacity(t, a.poolTopics.length);
            const isExpanded = expandedTopic === t;

            return (
              <div
                key={t}
                className="overflow-hidden rounded-lg border-[1.5px]"
                style={{
                  borderColor: hasZeroBand || isCustom ? THEME.warning : THEME.primary,
                }}
              >
                <div
                  className="flex items-center gap-1.5 px-2.5 py-[7px]"
                  style={{
                    background: hasZeroBand || isCustom ? THEME.warningLight : THEME.primaryLight,
                  }}
                >
                  <div className="flex flex-col gap-px">
                    <button
                      onClick={() => moveTopic(idx, -1)}
                      disabled={idx === 0}
                      className={`flex border-none bg-transparent p-0 ${idx === 0 ? 'cursor-default opacity-30' : 'cursor-pointer opacity-70'}`}
                      style={{ color: THEME.textTertiary }}
                    >
                      <ChevronUp size={11} />
                    </button>
                    <button
                      onClick={() => moveTopic(idx, 1)}
                      disabled={idx === a.poolTopics.length - 1}
                      className={`flex border-none bg-transparent p-0 ${idx === a.poolTopics.length - 1 ? 'cursor-default opacity-30' : 'cursor-pointer opacity-70'}`}
                      style={{ color: THEME.textTertiary }}
                    >
                      <ChevronDown size={11} />
                    </button>
                  </div>

                  <span
                    className="fontFamily-poppins flex-1 text-[13px] font-bold"
                    style={{ color: THEME.text }}
                  >
                    {t}
                  </span>

                  {/* {isCustom && (
                    <Badge
                      bg={THEME.warningLight}
                      color={THEME.warningDark}
                      style={{ fontSize: 10.5 }}
                    >
                      <AlertTriangle size={9} /> custom · no bank questions
                    </Badge>
                  )} */}

                  {inBank && (
                    <span className="inline-flex gap-[5px] text-[11px] font-semibold">
                      {BANDS.map((b, bi) => (
                        <span
                          key={b}
                          style={{
                            color: counts[bi] === 0 ? THEME.danger : 'inherit',
                          }}
                        >
                          {counts[bi]}
                          {b[0].toUpperCase()}
                        </span>
                      ))}
                    </span>
                  )}

                  {inBank && cap > 0 && (
                    <span
                      className="text-[10.5px] font-medium"
                      style={{ color: cap < 2 ? THEME.danger : THEME.textTertiary }}
                    >
                      ~{cap} attempt{cap !== 1 ? 's' : ''}
                    </span>
                  )}

                  {/* <button
                    onClick={() =>
                      setExpandedTopic(isExpanded ? null : t)
                    }
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: THEME.textTertiary,
                      display: 'flex',
                      padding: 0,
                    }}
                  >
                    {isExpanded ? (
                      <ChevronUp size={13} />
                    ) : (
                      <ChevronDown size={13} />
                    )}
                  </button> */}

                  <button
                    onClick={() => removeTopic(t)}
                    className="ml-0.5 flex cursor-pointer border-none bg-transparent p-0"
                    style={{ color: THEME.danger }}
                    aria-label={`Remove ${t}`}
                  >
                    <X size={12} />
                  </button>
                </div>

                {isExpanded && (
                  <div
                    className="flex flex-col gap-2.5 border-t px-3.5 py-3"
                    style={{ background: THEME.card, borderColor: THEME.border }}
                  >
                    <div>
                      <label
                        className="mb-1 block text-xs font-bold tracking-[.04em]"
                        style={{ color: THEME.textTertiary }}
                      >
                        TOPIC DESCRIPTION{' '}
                        <span className="font-normal" style={{ color: THEME.textMuted }}>
                          (fed to AI generation)
                        </span>
                      </label>
                      <textarea
                        style={inputStyle}
                        className="min-h-[56px] resize-y text-[12.5px]"
                        value={a.poolTopicDescriptions[t] ?? ''}
                        placeholder={`e.g., ${t} — specific concepts covered in Module 102`}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          set({
                            poolTopicDescriptions: {
                              ...a.poolTopicDescriptions,
                              [t]: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label
                        className="mb-1 block text-xs font-bold tracking-[.04em]"
                        style={{ color: THEME.textTertiary }}
                      >
                        <Link2 size={10} className="-mb-px mr-1 inline align-middle" />
                        LINKED LEARNING OUTCOME{' '}
                        <span className="font-normal" style={{ color: THEME.textMuted }}>
                          (production: linked to course syllabus)
                        </span>
                      </label>
                      <input
                        style={inputStyle}
                        className="text-[12.5px]"
                        value={a.poolTopicOutcomes[t] ?? ''}
                        placeholder="e.g., LO-3.2 — Learner can debug layout issues using browser dev tools"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          set({
                            poolTopicOutcomes: {
                              ...a.poolTopicOutcomes,
                              [t]: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Search input + dropdown */}
      <div className="relative">
        <input
          ref={inputRef}
          style={inputStyle}
          value={query}
          placeholder="Search topics from bank, or type to add a custom one…"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setQuery(e.target.value);
            setOpen(true);
            setSuggestions(null);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 160)}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && query.trim()) {
              addTopic({ id: 0, name: query });
              setOpen(false);
            }
            if (e.key === 'Escape') {
              setOpen(false);
              setQuery('');
            }
          }}
        />

        {showDropdown && (
          <div
            className="absolute inset-x-0 top-full z-20 mt-1 max-h-[230px] overflow-y-auto rounded-lg border"
            style={{
              background: THEME.card,
              borderColor: THEME.border,
              boxShadow: THEME.shadowStrong,
            }}
          >
            {fetchingTopics ? (
              <div
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-[13px]"
                style={{ color: THEME.textTertiary }}
              >
                <Loader2 size={14} className="animate-spin" />
                Searching topics...
              </div>
            ) : (
              <>
                {filtered.map((t, idx: number) => {
                  const counts = [
                    t.difficultyLevel.easy,
                    t.difficultyLevel.medium,
                    t.difficultyLevel.hard
                  ];
                  return (
                    <div
                      key={t.id}
                      onMouseDown={() => addTopic({ id: t.id, name: t.name })}
                      className="flex cursor-pointer items-center justify-between px-3.5 py-2.5 text-[13.5px]"
                      style={{
                        borderBottom:
                          idx < filtered.length - 1 || queryIsNew
                            ? `1px solid ${THEME.border}`
                            : 'none',
                        background: 'transparent',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = THEME.muted)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span className="font-medium" style={{ color: THEME.text }}>{t.name}</span>
                      <span className="inline-flex gap-[7px] text-[11.5px]">
                        {BANDS.map((b, bi) => (
                          <span
                            key={b}
                            style={{
                              color: counts[bi] === 0 ? THEME.danger : 'inherit',
                            }}
                          >
                            {counts[bi]} {b}
                          </span>
                        ))}
                      </span>
                    </div>
                  );
                })}
                {queryIsNew && (
                  <div
                    onMouseDown={() => {
                      addTopic({ id: 0, name: query });
                      setOpen(false);
                    }}
                    className="flex cursor-pointer items-center gap-[7px] px-3.5 py-2.5 text-[13.5px]"
                    style={{ color: THEME.secondary, background: 'transparent' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = THEME.muted)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    + Add &ldquo;{query.trim()}&rdquo; as custom topic
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {bankTopics.length > 0 && a.poolTopics.length === 0 && (
        <div className="mt-2 text-xs" style={{ color: THEME.textTertiary }}>
          Search available topics in the bank,
          or use &ldquo;Suggest&rdquo; above.
        </div>
      )}
    </div>
  );
}