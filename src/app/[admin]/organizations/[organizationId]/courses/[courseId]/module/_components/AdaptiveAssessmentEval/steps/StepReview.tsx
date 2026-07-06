import React, { useState } from 'react';
import { Eye, RefreshCw, Trash2, AlertTriangle, X, Check } from 'lucide-react';
import { THEME, LEVELS, DIFF_LABEL } from '../constants';
import { Card, Btn, Badge, DiffBadge, inputStyle } from '../ui-primitives';
import { Question, BuilderState, LevelId } from '../types';

interface StepReviewProps {
  a: BuilderState;
  pool: Question[];
  setPool: (pool: Question[]) => void;
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap' as const,
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <h4 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 2px' }}>
            Review the pool
          </h4>
          <p style={{ fontSize: 13, color: THEME.textSub, margin: 0 }}>
            Replace or remove any question. Preview shows how a form assembles for a
            given level.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
          <select
            value={previewLevel}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setPreviewLevel(e.target.value as LevelId)
            }
            style={{ ...inputStyle, width: 115, padding: '7px 10px' }}
          >
            {LEVELS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
          <Btn variant="outline" onClick={() => setShowPreview(true)}>
            <Eye size={13} /> Preview form
          </Btn>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' as const }}>
        {[
          ['all', `All (${pool.length})`],
          ['ai', `AI (${pool.filter((q: Question) => q.source === 'ai').length})`],
          ['bank', `Bank (${pool.filter((q: Question) => q.source === 'bank').length})`],
        ].map(([k, lbl]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            style={{
              padding: '5px 12px',
              borderRadius: 99,
              border: `1px solid ${filter === k ? THEME.primary : THEME.border}`,
              background: filter === k ? THEME.primaryLight : THEME.card,
              color: filter === k ? THEME.primaryDark : THEME.textSub,
              fontWeight: 600,
              fontSize: 12.5,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {lbl}
          </button>
        ))}
      </div>

      {shown.length === 0 && (
        <Card style={{ padding: 28, textAlign: 'center' as const, color: THEME.textTertiary, fontSize: 14 }}>
          Pool is empty — go back to Build Pool.
        </Card>
      )}

      {shown.map((item: Question) => (
        <Card
          key={item.id}
          style={{
            padding: '13px 17px',
            marginBottom: 8,
            opacity: item.quarantined ? 0.5 : 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{ flex: 1, cursor: 'pointer', minWidth: 0 }}
              onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 5,
                  marginBottom: 6,
                  flexWrap: 'wrap' as const,
                }}
              >
                <Badge bg={THEME.muted} color={THEME.textSub}>
                  {item.topic}
                </Badge>
                <DiffBadge d={item.difficulty} />
                <Badge
                  bg={item.source === 'ai' ? THEME.secondaryLight : THEME.infoLight}
                  color={item.source === 'ai' ? THEME.secondaryDark : THEME.info}
                >
                  {item.source === 'ai' ? 'AI · provisional' : 'Bank · validated'}
                </Badge>
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.45 }}>
                {item.text}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
              <Btn size="sm" variant="outline" onClick={() => setReplaceModal(item)}>
                <RefreshCw size={12} /> Replace
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
            <div
              style={{
                marginTop: 11,
                borderTop: `1px solid ${THEME.border}`,
                paddingTop: 11,
              }}
            >
              {item.options.map((opt: string, i: number) => {
                const correct = i === item.correctIndex;
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 8,
                      padding: '5px 9px',
                      borderRadius: 6,
                      background: correct ? THEME.successLight : 'transparent',
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: correct ? THEME.successDark : THEME.textTertiary,
                        width: 17,
                        fontSize: 13,
                      }}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span
                      style={{
                        fontSize: 13.5,
                        color: correct ? THEME.successDark : THEME.text,
                        fontWeight: correct ? 600 : 400,
                        flex: 1,
                      }}
                    >
                      {opt}
                    </span>
                    {correct && <Check size={13} color={THEME.successDark} />}
                  </div>
                );
              })}
              <div
                style={{
                  marginTop: 8,
                  background: THEME.muted,
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 13,
                  color: THEME.textSub,
                }}
              >
                <strong style={{ color: THEME.text }}>Explanation:</strong>{' '}
                {item.explanation}
              </div>
            </div>
          )}
        </Card>
      ))}

      {showPreview && (() => {
        const preview = assemblePreview();
        return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(33,48,43,.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 60,
              padding: 20,
            }}
            onClick={() => setShowPreview(false)}
          >
            <div
              style={{
                background: THEME.card,
                borderRadius: 10,
                boxShadow: THEME.shadowStrong,
                width: '100%',
                maxWidth: 680,
                maxHeight: '84vh',
                display: 'flex',
                flexDirection: 'column' as const,
              }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: '16px 22px',
                  borderBottom: `1px solid ${THEME.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>
                    Form preview — {LEVELS.find((l) => l.id === previewLevel)?.label}
                  </div>
                  <div style={{ fontSize: 13, color: THEME.textSub, marginTop: 2 }}>
                    Assembled randomly from the pool.
                  </div>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: THEME.textTertiary,
                  }}
                >
                  <X size={18} />
                </button>
              </div>
              <div style={{ overflowY: 'auto', padding: 20 }}>
                {preview.map((q, i) => (
                  <div
                    key={q.id}
                    style={{
                      display: 'flex',
                      gap: 10,
                      padding: '9px 12px',
                      border: `1px solid ${THEME.border}`,
                      borderRadius: 8,
                      marginBottom: 6,
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: THEME.textTertiary,
                        width: 17,
                        fontSize: 13,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ flex: 1, fontSize: 13.5 }}>{q.text}</span>
                    <DiffBadge d={q.difficulty} />
                    <Badge bg={THEME.muted} color={THEME.textSub}>
                      {q.topic}
                    </Badge>
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
