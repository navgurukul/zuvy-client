import React, { useState, useRef } from 'react';
import { Loader2, ChevronUp, ChevronDown, X, AlertTriangle, Link2 } from 'lucide-react';
import { THEME, BANDS, LEVELS } from '../constants';
import { inputStyle, Btn, Badge } from '../ui-primitives';
import { scoreTopicMatch } from '../helpers';
import { BuilderState, Question } from '../types';

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
  const [open, setOpen] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const removeTopic = (t: string) => {
    const desc = { ...a.poolTopicDescriptions };
    delete desc[t];
    const out = { ...a.poolTopicOutcomes };
    delete out[t];
    set({
      poolTopics: a.poolTopics.filter((x: string) => x !== t),
      poolTopicDescriptions: desc,
      poolTopicOutcomes: out,
    });
  };

  const addTopic = (t: string) => {
    const topic = t.trim();
    if (!topic || a.poolTopics.includes(topic)) return;
    set({ poolTopics: [...a.poolTopics, topic] });
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

  const filtered = (bankTopics as string[]).filter(
    (t) => !a.poolTopics.includes(t) && t.toLowerCase().includes(query.toLowerCase())
  );
  const queryIsNew =
    query.trim() !== '' &&
    !bankTopics.includes(query.trim()) &&
    !a.poolTopics.includes(query.trim());
  const showDropdown = open && (filtered.length > 0 || queryIsNew);

  const suggestTopics = () => {
    setSuggesting(true);
    setTimeout(() => {
      const text = a.objective + ' ' + a.outcomes;
      const unselected = (bankTopics as string[]).filter(
        (t: string) => !a.poolTopics.includes(t)
      );
      const scored = unselected
        .map((t: string) => ({ t, score: scoreTopicMatch(t, text) }))
        .sort((a: any, b: any) => b.score - a.score);
      setSuggestions(scored.map((x: any) => x.t));
      setSuggesting(false);
    }, 500);
  };

  return (
    <div>
      {/* Suggest from objective */}
      {(a.objective.trim() || a.outcomes.trim()) && (
        <div style={{ marginBottom: 12 }}>
          <Btn
            variant="ghost"
            size="sm"
            disabled={suggesting}
            onClick={suggestTopics}
            style={{ padding: '5px 0', fontSize: 12.5 }}
          >
            {suggesting ? (
              <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
            ) : null}
            Suggest topics from objective
          </Btn>
          {suggestions !== null && (
            <div
              style={{
                marginTop: 8,
                background: THEME.secondaryLight,
                border: `1px solid ${THEME.secondary}`,
                borderRadius: 7,
                padding: '10px 12px',
              }}
            >
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: THEME.secondaryDark,
                  marginBottom: 7,
                  letterSpacing: '.04em',
                }}
              >
                SUGGESTED FROM OBJECTIVE
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                {suggestions.length === 0 ? (
                  <span style={{ fontSize: 12.5, color: THEME.textTertiary }}>
                    No matches — add topics manually.
                  </span>
                ) : (
                  suggestions.map((t: string) => (
                    <button
                      key={t}
                      onMouseDown={() => addTopic(t)}
                      style={{
                        background: THEME.card,
                        border: `1px solid ${THEME.secondary}`,
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 13,
                        color: THEME.secondaryDark,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      + {t}
                    </button>
                  ))
                )}
              </div>
              <button
                onClick={() => setSuggestions(null)}
                style={{
                  marginTop: 8,
                  background: 'none',
                  border: 'none',
                  fontSize: 11.5,
                  color: THEME.textTertiary,
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: 'inherit',
                }}
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {/* Selected chips */}
      {a.poolTopics.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column' as const,
            gap: 6,
            marginBottom: 14,
          }}
        >
          {(a.poolTopics as string[]).map((t: string, idx: number) => {
            const counts = bankCounts(t);
            const inBank = counts.some((n) => n > 0);
            const isCustom = !bankTopics.includes(t);
            const hasZeroBand = inBank && counts.some((n) => n === 0);
            const cap = topicCapacity(t, a.poolTopics.length);
            const isExpanded = expandedTopic === t;

            return (
              <div
                key={t}
                style={{
                  border: `1.5px solid ${hasZeroBand || isCustom ? THEME.warning : THEME.primary}`,
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background:
                      hasZeroBand || isCustom ? THEME.warningLight : THEME.primaryLight,
                    padding: '7px 10px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column' as const,
                      gap: 1,
                    }}
                  >
                    <button
                      onClick={() => moveTopic(idx, -1)}
                      disabled={idx === 0}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: idx === 0 ? 'default' : 'pointer',
                        padding: 0,
                        color: THEME.textTertiary,
                        opacity: idx === 0 ? 0.3 : 0.7,
                        display: 'flex',
                      }}
                    >
                      <ChevronUp size={11} />
                    </button>
                    <button
                      onClick={() => moveTopic(idx, 1)}
                      disabled={idx === a.poolTopics.length - 1}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor:
                          idx === a.poolTopics.length - 1 ? 'default' : 'pointer',
                        padding: 0,
                        color: THEME.textTertiary,
                        opacity: idx === a.poolTopics.length - 1 ? 0.3 : 0.7,
                        display: 'flex',
                      }}
                    >
                      <ChevronDown size={11} />
                    </button>
                  </div>

                  <span style={{ fontWeight: 700, fontSize: 13, color: THEME.text, flex: 1 }}>
                    {t}
                  </span>

                  {isCustom && (
                    <Badge
                      bg={THEME.warningLight}
                      color={THEME.warningDark}
                      style={{ fontSize: 10.5 }}
                    >
                      <AlertTriangle size={9} /> custom · no bank questions
                    </Badge>
                  )}

                  {inBank && (
                    <span style={{ display: 'inline-flex', gap: 5, fontSize: 11, fontWeight: 600 }}>
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
                      style={{
                        fontSize: 10.5,
                        color: cap < 2 ? THEME.danger : THEME.textTertiary,
                        fontWeight: 500,
                      }}
                    >
                      ~{cap} attempt{cap !== 1 ? 's' : ''}
                    </span>
                  )}

                  <button
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
                  </button>

                  <button
                    onClick={() => removeTopic(t)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: THEME.danger,
                      display: 'flex',
                      padding: 0,
                      marginLeft: 2,
                    }}
                    aria-label={`Remove ${t}`}
                  >
                    <X size={12} />
                  </button>
                </div>

                {isExpanded && (
                  <div
                    style={{
                      padding: '12px 14px',
                      background: THEME.card,
                      borderTop: `1px solid ${THEME.border}`,
                      display: 'flex',
                      flexDirection: 'column' as const,
                      gap: 10,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: 12,
                          fontWeight: 700,
                          color: THEME.textTertiary,
                          marginBottom: 4,
                          letterSpacing: '.04em',
                        }}
                      >
                        TOPIC DESCRIPTION{' '}
                        <span
                          style={{ fontWeight: 400, color: THEME.textMuted }}
                        >
                          (fed to AI generation)
                        </span>
                      </label>
                      <textarea
                        style={{
                          ...inputStyle,
                          minHeight: 56,
                          fontSize: 12.5,
                          resize: 'vertical' as const,
                        }}
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
                        style={{
                          display: 'block',
                          fontSize: 12,
                          fontWeight: 700,
                          color: THEME.textTertiary,
                          marginBottom: 4,
                          letterSpacing: '.04em',
                        }}
                      >
                        <Link2 size={10} style={{ verticalAlign: -1, marginRight: 4 }} />
                        LINKED LEARNING OUTCOME{' '}
                        <span
                          style={{ fontWeight: 400, color: THEME.textMuted }}
                        >
                          (production: linked to course syllabus)
                        </span>
                      </label>
                      <input
                        style={{ ...inputStyle, fontSize: 12.5 }}
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
      <div style={{ position: 'relative' as const }}>
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
              addTopic(query);
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
            style={{
              position: 'absolute' as const,
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 4,
              background: THEME.card,
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
              boxShadow: THEME.shadowStrong,
              zIndex: 20,
              maxHeight: 230,
              overflowY: 'auto' as const,
            }}
          >
            {filtered.map((t: string, idx: number) => {
              const counts = bankCounts(t);
              return (
                <div
                  key={t}
                  onMouseDown={() => addTopic(t)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    fontSize: 13.5,
                    borderBottom:
                      idx < filtered.length - 1 || queryIsNew
                        ? `1px solid ${THEME.border}`
                        : 'none',
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = THEME.muted)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontWeight: 500, color: THEME.text }}>{t}</span>
                  <span
                    style={{
                      display: 'inline-flex',
                      gap: 7,
                      fontSize: 11.5,
                    }}
                  >
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
                  addTopic(query);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontSize: 13.5,
                  color: THEME.secondary,
                  background: 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = THEME.muted)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                + Add &ldquo;{query.trim()}&rdquo; as custom topic
              </div>
            )}
          </div>
        )}
      </div>

      {bankTopics.length > 0 && a.poolTopics.length === 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: THEME.textTertiary }}>
          {(bankTopics as string[]).length} topic
          {bankTopics.length !== 1 ? 's' : ''} available in the bank — type to filter,
          or use &ldquo;Suggest&rdquo; above.
        </div>
      )}
    </div>
  );
}
