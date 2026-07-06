import React, { useState } from 'react';
import { Info, AlertTriangle, AlertCircle, X, Loader2, Check } from 'lucide-react';
import { THEME, BANDS, QTYPES, LEVELS, POOL_MULTIPLIER, DIFF_LABEL } from '../constants';
import { Card, Btn, inputStyle } from '../ui-primitives';
import { bandCount, cellTarget } from '../helpers';
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
      <div
        style={{
          background: THEME.primaryLight,
          border: `1px solid ${THEME.primaryMid}`,
          borderRadius: 10,
          padding: '14px 18px',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: THEME.primaryDark,
            marginBottom: 4,
          }}
        >
          Baseline signal — {linkedChapters.length} MCQ chapter
          {linkedChapters.length !== 1 ? 's' : ''} linked
        </div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' as const, marginBottom: 8 }}>
          {linkedChapters.map((c: Chapter) => (
            <span
              key={c.id}
              style={{
                background: THEME.card,
                border: `1px solid ${THEME.primaryMid}`,
                color: THEME.primaryDark,
                fontSize: 12,
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: 99,
              }}
            >
              {c.title} · {c.questionCount}Q
            </span>
          ))}
        </div>
        <div style={{ fontSize: 12.5, color: THEME.textSub, lineHeight: 1.5 }}>
          When a learner opens this assessment, the system reads their MCQ history and
          maps it to a level (E → A+). The pool below serves the right difficulty mix
          for that level.
        </div>
      </div>

      {smeAvailable > 0 && (
        <div
          style={{
            background: THEME.secondaryLight,
            border: `1px solid ${THEME.secondary}`,
            borderRadius: 10,
            padding: '11px 16px',
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 13, color: THEME.secondaryDark }}>
            <strong>{smeAvailable} SME-validated question{smeAvailable !== 1 ? 's' : ''}</strong>{' '}
            in the bank ready to add — click &quot;Bank (N)&quot; in any cell.
          </span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 2, borderBottom: `1px solid ${THEME.border}`, marginBottom: 22 }}>
        {QTYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setQTab(t.id)}
            style={{
              padding: '9px 18px 11px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: 13,
              color: qTab === t.id ? THEME.primaryDark : THEME.textTertiary,
              borderBottom: `3px solid ${qTab === t.id ? THEME.primary : 'transparent'}`,
              display: 'flex',
              gap: 6,
              alignItems: 'center',
            }}
          >
            {t.label} ({typeCount(t.id)})
          </button>
        ))}
      </div>

      {qTab === 'mcq' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 13,
            }}
          >
            <div>
              <h4 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 2px' }}>MCQ pool</h4>
              <div
                style={{
                  background: THEME.muted,
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 12.5,
                  color: THEME.textSub,
                  lineHeight: 1.55,
                  maxWidth: 520,
                }}
              >
                <strong style={{ color: THEME.text }}>Why these targets?</strong> Each
                cell needs {POOL_MULTIPLIER}× the maximum draw any level makes. With{' '}
                {a.questionsPerForm} questions/form and {a.poolTopics.length || 1} topic
                {a.poolTopics.length !== 1 ? 's' : ''}, Level A+ draws the most hard
                questions ({Math.max(...LEVELS.map((l) => l.mix[2]))}%).
              </div>
            </div>
            <div
              style={{
                textAlign: 'right' as const,
                flexShrink: 0,
                marginLeft: 16,
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: coverage.complete ? THEME.successDark : THEME.text,
                }}
              >
                {coverage.met}/{coverage.total}
              </div>
              <div style={{ fontSize: 11, color: THEME.textTertiary }}>cells at target</div>
              {capacity > 0 && (
                <div
                  style={{
                    fontSize: 11,
                    color: capacity < 2 ? THEME.danger : THEME.primaryDark,
                    marginTop: 3,
                    fontWeight: 600,
                  }}
                >
                  ~{capacity} unique attempt{capacity !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
              overflow: 'hidden',
              marginBottom: 14,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '160px repeat(3,1fr)',
                background: THEME.muted,
                fontSize: 12,
                fontWeight: 700,
                color: THEME.textTertiary,
              }}
            >
              <div style={{ padding: '8px 12px' }}>Topic</div>
              {BANDS.map((b) => (
                <div
                  key={b}
                  style={{
                    padding: '8px 12px',
                    borderLeft: `1px solid ${THEME.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  {DIFF_LABEL[b]}
                </div>
              ))}
            </div>

            {a.poolTopics.length === 0 && (
              <div
                style={{
                  padding: '22px',
                  color: THEME.textTertiary,
                  fontSize: 13,
                  textAlign: 'center' as const,
                }}
              >
                Select topics in Step 2 first.
              </div>
            )}

            {a.poolTopics.map((topic: string) => (
              <div
                key={topic}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px repeat(3,1fr)',
                  borderTop: `1px solid ${THEME.border}`,
                }}
              >
                <div style={{ padding: '12px', fontWeight: 600, fontSize: 13 }}>
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
                    <div
                      key={b}
                      style={{
                        padding: '10px 12px',
                        borderLeft: `1px solid ${THEME.border}`,
                        background: met ? THEME.successLight : THEME.card,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          marginBottom: 5,
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: 13, color: met ? THEME.successDark : THEME.text }}>
                          {have}
                          <span style={{ fontWeight: 400, color: THEME.textTertiary, fontSize: 11 }}>
                            {' '}
                            / {need}
                          </span>
                        </span>
                        {met && <Check size={13} color={THEME.successDark} />}
                      </div>
                      <div
                        style={{
                          height: 4,
                          background: THEME.muted,
                          borderRadius: 99,
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            height: 4,
                            width: `${Math.min(100, Math.round((have / Math.max(need, 1)) * 100))}%`,
                            background: met ? '#7CB342' : '#fbbf24',
                            borderRadius: 99,
                            transition: 'width .3s',
                          }}
                        />
                      </div>
                      {!met && (
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' as const }}>
                          {inBank > 0 && (
                            <button
                              onClick={() => setBankPicker({ topic, band: b })}
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: THEME.primary,
                                background: 'none',
                                border: `1px solid ${THEME.primary}`,
                                borderRadius: 5,
                                padding: '3px 7px',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                              }}
                            >
                              Bank ({inBank})
                            </button>
                          )}
                          <button
                            disabled={!!busy || generating === 'bulk'}
                            onClick={() => generateForCell(topic, b, need - have)}
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: '#fff',
                              background: THEME.secondary,
                              border: 'none',
                              borderRadius: 5,
                              padding: '3px 7px',
                              cursor: 'pointer',
                              opacity: busy || generating === 'bulk' ? 0.55 : 1,
                              fontFamily: 'inherit',
                              display: 'flex',
                              gap: 3,
                              alignItems: 'center',
                            }}
                          >
                            {busy ? (
                              <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} />
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
            <div
              style={{
                background: THEME.dangerLight,
                border: `1px solid ${THEME.danger}`,
                borderRadius: 8,
                padding: '9px 13px',
                fontSize: 13,
                color: THEME.danger,
                marginBottom: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>
                <AlertCircle size={13} style={{ verticalAlign: -2, marginRight: 5 }} />
                {genError}
              </span>
              <button
                onClick={() => setGenError(null)}
                style={{ background: 'none', border: 'none', color: THEME.danger, cursor: 'pointer' }}
              >
                <X size={13} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
            <Btn
              variant="secondary"
              disabled={!!generating || coverage.complete}
              onClick={fillAllGaps}
            >
              {generating === 'bulk' ? (
                <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
              ) : null}
              {generating === 'bulk' ? 'Filling…' : `Fill all ${coverage.missing} gaps`}
            </Btn>
          </div>

          <div
            style={{
              marginTop: 18,
              background: THEME.infoLight,
              border: `1px solid ${THEME.info}`,
              borderRadius: 8,
              padding: '11px 15px',
              fontSize: 12.5,
              color: THEME.info,
              display: 'flex',
              gap: 8,
            }}
          >
            <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong>Cross-topic questions (roadmap):</strong> Each question currently
              belongs to exactly one topic.
            </div>
          </div>
        </div>
      )}

      {qTab !== 'mcq' && (
        <div
          style={{
            background: THEME.infoLight,
            borderRadius: 8,
            padding: '14px 18px',
            fontSize: 13,
            color: THEME.info,
            display: 'flex',
            gap: 9,
          }}
        >
          <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          Fixed section — identical for every student. Adaptivity applies to MCQs only.
        </div>
      )}
    </div>
  );
}
