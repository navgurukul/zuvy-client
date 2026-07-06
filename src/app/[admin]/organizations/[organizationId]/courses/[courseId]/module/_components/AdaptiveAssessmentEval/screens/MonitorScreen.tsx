import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { THEME } from '../constants';
import { Card, Badge } from '../ui-primitives';
import { BuilderState, Question, Chapter } from '../types';

interface MonitorScreenProps {
  a: BuilderState;
  pool: Question[];
  capacity: number;
  baselineOptions: Chapter[];
  onBack: () => void;
}

export function MonitorScreen({
  a,
  pool,
  capacity,
  baselineOptions,
  onBack,
}: MonitorScreenProps) {
  const mockDist: Array<{ l: string; n: number }> = [
    { l: 'E', n: 2 },
    { l: 'D', n: 4 },
    { l: 'C', n: 10 },
    { l: 'B', n: 8 },
    { l: 'A', n: 4 },
    { l: 'A+', n: 2 },
  ];
  const maxN = Math.max(...mockDist.map((d) => d.n));
  const linkedChapters = baselineOptions.filter((c) =>
    a.baselineChapterIds.includes(c.id)
  );

  const mockAttemptLog = [
    { learner: 'Priya S.', attempt: 1, qIds: [1, 5, 12, 7, 3, 9, 2, 14, 6, 11] },
    { learner: 'Ravi K.', attempt: 1, qIds: [4, 8, 13, 2, 10, 6, 15, 1, 7, 3] },
    { learner: 'Priya S.', attempt: 2, qIds: [16, 20, 8, 18, 4, 13, 19, 17, 22, 21] },
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '22px 28px' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: THEME.textSub,
          cursor: 'pointer',
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          fontSize: 13,
          fontFamily: 'inherit',
          padding: 0,
          marginBottom: 14,
        }}
      >
        ← Back to builder
      </button>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
          flexWrap: 'wrap' as const,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
          {a.name || 'Untitled'}
        </h2>
        <Badge
          bg={a.status === 'published' ? THEME.primaryLight : THEME.infoLight}
          color={a.status === 'published' ? THEME.primaryDark : THEME.info}
          style={{ padding: '5px 12px' }}
        >
          {a.status === 'published'
            ? 'Published'
            : a.status === 'scheduled'
              ? `Scheduled · ${a.scheduledDate}`
              : 'Draft'}
        </Badge>
        <Badge bg={THEME.muted} color={THEME.textSub}>
          {a.mode === 'formative'
            ? 'Checkpoint'
            : `Milestone · Level ${a.gateLevel}+ target`}
        </Badge>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 14,
          marginBottom: 20,
        }}
      >
        <Card style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 11 }}>
            Baseline signal
          </div>
          <div style={{ fontSize: 12.5, color: THEME.textSub, marginBottom: 10 }}>
            Learner level is inferred from:
          </div>
          {linkedChapters.map((c) => (
            <div
              key={c.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '5px 0',
                borderBottom: `1px solid ${THEME.border}`,
                fontSize: 13,
              }}
            >
              <span>{c.title}</span>
              <span style={{ color: THEME.textTertiary }}>{c.questionCount}Q</span>
            </div>
          ))}
          <div style={{ fontSize: 11.5, color: THEME.textTertiary, marginTop: 8 }}>
            No separate baseline test. MCQ attempts during the module are enough.
          </div>
        </Card>

        <Card style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 11 }}>
            Attempts
          </div>
          <div style={{ display: 'flex', gap: 22 }}>
            {[
              ['18', 'completed'],
              ['3', 'in progress'],
              ['11', 'not started'],
            ].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{n}</div>
                <div style={{ fontSize: 11, color: THEME.textTertiary }}>{l}</div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 11,
              height: 5,
              background: THEME.muted,
              borderRadius: 99,
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            <div style={{ width: '56%', background: THEME.primary }} />
            <div style={{ width: '9%', background: THEME.warning }} />
          </div>
        </Card>

        <Card style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 11 }}>
            Level distribution
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 7,
              height: 90,
            }}
          >
            {mockDist.map((d) => (
              <div
                key={d.l}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column' as const,
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <span style={{ fontSize: 10, color: THEME.textSub, fontWeight: 600 }}>
                  {d.n}
                </span>
                <div
                  style={{
                    width: '100%',
                    height: `${(d.n / maxN) * 72}px`,
                    background:
                      d.l === 'C' || d.l === 'B' ? THEME.primary : THEME.primaryLight,
                    borderRadius: '3px 3px 0 0',
                    transition: 'height .3s',
                  }}
                />
                <span style={{ fontSize: 10, color: THEME.textTertiary, fontWeight: 600 }}>
                  {d.l}
                </span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: THEME.textTertiary, marginTop: 7 }}>
            Level derived from module MCQ history, not a baseline sitting.
          </div>
        </Card>

        <Card style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 11 }}>
            Pool
          </div>
          {[
            [`${pool.length} questions total`],
            [`${pool.filter((q) => q.source === 'ai').length} AI-generated (provisional)`],
            [`${pool.filter((q) => q.quarantined).length} quarantined`],
          ].map(([txt], i) => (
            <div
              key={i}
              style={{
                padding: '5px 0',
                fontSize: 12.5,
                color: THEME.textSub,
                borderBottom: i < 2 ? `1px solid ${THEME.border}` : 'none',
              }}
            >
              {txt}
            </div>
          ))}
        </Card>

        <Card style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 11 }}>
            Pool capacity
          </div>
          <div style={{ marginBottom: 10 }}>
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color:
                  capacity < 2
                    ? THEME.danger
                    : capacity < 3
                      ? THEME.warningDark
                      : THEME.successDark,
              }}
            >
              {capacity}
            </span>
            <span style={{ fontSize: 13, color: THEME.textSub, marginLeft: 6 }}>
              unique attempt{capacity !== 1 ? 's' : ''} before any question repeats
            </span>
          </div>
          <div style={{ height: 5, background: THEME.muted, borderRadius: 99, marginBottom: 10 }}>
            <div
              style={{
                height: 5,
                width: `${Math.min(100, (capacity / 5) * 100)}%`,
                background:
                  capacity < 2
                    ? THEME.danger
                    : capacity < 3
                      ? THEME.warning
                      : THEME.success,
                borderRadius: 99,
                transition: 'width .3s',
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: THEME.textTertiary, lineHeight: 1.5 }}>
            Bottlenecked by the thinnest (topic × difficulty) cell. Add more questions to
            raise this number. Target: ≥ 3 for most cohorts.
          </div>
          {capacity < 2 && (
            <div
              style={{
                marginTop: 10,
                background: THEME.dangerLight,
                borderRadius: 6,
                padding: '7px 10px',
                fontSize: 12,
                color: THEME.danger,
                display: 'flex',
                gap: 6,
              }}
            >
              <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 1 }} />
              Returning learners will see repeated questions. Add more questions.
            </div>
          )}
        </Card>

        <Card style={{ padding: 18, gridColumn: 'span 2' }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 6 }}>
            Repeat prevention log
          </div>
          <div
            style={{
              fontSize: 12,
              color: THEME.textSub,
              marginBottom: 12,
              lineHeight: 1.5,
            }}
          >
            Questions served to each learner are recorded so retakes draw from unseen
            questions first. In production this log lives on the backend and is queried at
            attempt-start time.{' '}
            <span style={{ color: THEME.textTertiary }}>Showing mock data.</span>
          </div>
          <div
            style={{
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 80px 1fr',
                background: THEME.muted,
                fontSize: 11.5,
                fontWeight: 700,
                color: THEME.textTertiary,
              }}
            >
              <div style={{ padding: '7px 12px' }}>Learner</div>
              <div style={{ padding: '7px 12px', borderLeft: `1px solid ${THEME.border}` }}>
                Attempt
              </div>
              <div style={{ padding: '7px 12px', borderLeft: `1px solid ${THEME.border}` }}>
                Question IDs served
              </div>
            </div>
            {mockAttemptLog.map((row, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 80px 1fr',
                  borderTop: `1px solid ${THEME.border}`,
                }}
              >
                <div style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>
                  {row.learner}
                </div>
                <div
                  style={{
                    padding: '8px 12px',
                    fontSize: 13,
                    color: THEME.textSub,
                    borderLeft: `1px solid ${THEME.border}`,
                  }}
                >
                  #{row.attempt}
                </div>
                <div
                  style={{
                    padding: '8px 12px',
                    fontSize: 11.5,
                    color: THEME.textTertiary,
                    borderLeft: `1px solid ${THEME.border}`,
                    fontFamily: 'monospace',
                  }}
                >
                  {row.qIds.join(', ')}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 11.5, color: THEME.textTertiary }}>
            On retake, these IDs are excluded from the draw pool — learners see fresh
            questions up to pool capacity.
          </div>
        </Card>
      </div>
    </div>
  );
}
