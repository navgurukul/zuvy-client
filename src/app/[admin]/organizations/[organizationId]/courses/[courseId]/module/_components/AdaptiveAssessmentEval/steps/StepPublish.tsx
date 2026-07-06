import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { THEME } from '../constants';
import { Card, Btn, inputStyle } from '../ui-primitives';
import { BuilderState, Question } from '../types';

interface StepPublishProps {
  a: BuilderState;
  set: (patch: Partial<BuilderState>) => void;
  coverage: { met: number; total: number; complete: boolean };
  pool: Question[];
  publish: (status: string) => void;
}

export function StepPublish({ a, set, coverage, pool, publish }: StepPublishProps) {
  const [choice, setChoice] = useState<string | null>(null);
  const unreviewed = pool.filter((q: Question) => q.source === 'ai' && !q.validated).length;
  const blocked = !coverage.complete;

  return (
    <Card style={{ padding: 26, maxWidth: 720 }}>
      <h4 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>Publish</h4>
      <p style={{ color: THEME.textSub, fontSize: 13.5, margin: '0 0 18px' }}>
        Publishing is final. Each learner's form assembles from the pool at attempt time.
      </p>

      {blocked && (
        <div
          style={{
            background: THEME.warningLight,
            border: `1px solid ${THEME.warning}`,
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 13,
            color: THEME.warningDark,
            marginBottom: 14,
            display: 'flex',
            gap: 7,
          }}
        >
          <AlertTriangle size={14} style={{ marginTop: 1 }} />
          {coverage.total - coverage.met} pool cell
          {coverage.total - coverage.met !== 1 ? 's are' : ' is'} below target. Fill the gaps
          before publishing.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 18 }}>
        {[
          {
            id: 'published',
            title: 'Publish now',
            desc: 'Available to learners immediately',
            bg: '#E8F5E9',
          },
          {
            id: 'draft',
            title: 'Save as draft',
            desc: 'Edit freely, publish later',
            bg: '#E3F2FD',
          },
          {
            id: 'scheduled',
            title: 'Schedule',
            desc: 'Goes live at a set date and time',
            bg: '#F3E5F5',
          },
        ].map((opt) => (
          <div
            key={opt.id}
            onClick={() => setChoice(opt.id)}
            style={{
              background: opt.bg,
              borderRadius: 9,
              padding: 16,
              cursor: 'pointer',
              border: `2px solid ${choice === opt.id ? THEME.primary : 'transparent'}`,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
              {opt.title}
            </div>
            <div style={{ fontSize: 12, color: THEME.textSub }}>{opt.desc}</div>
          </div>
        ))}
      </div>

      {choice === 'scheduled' && (
        <div style={{ display: 'flex', gap: 11, marginBottom: 16 }}>
          <input
            type="date"
            style={{ ...inputStyle, width: 170 }}
            value={a.scheduledDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              set({ scheduledDate: e.target.value })
            }
          />
          <input
            type="time"
            style={{ ...inputStyle, width: 130 }}
            value={a.scheduledTime}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              set({ scheduledTime: e.target.value })
            }
          />
        </div>
      )}

      <div
        style={{
          background: THEME.muted,
          borderRadius: 8,
          padding: '12px 15px',
          fontSize: 13,
          color: THEME.textSub,
          marginBottom: 18,
        }}
      >
        <strong style={{ color: THEME.text }}>What learners see:</strong> &quot;
        {a.name || 'Untitled'}&rdquo; — one card. MCQ section assembles at attempt time.
        {unreviewed > 0 && (
          <span>
            {' '}
            · {unreviewed} AI question{unreviewed !== 1 ? 's' : ''} carry provisional labels.
          </span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Btn
          size="lg"
          disabled={!choice || blocked || (choice === 'scheduled' && !a.scheduledDate)}
          onClick={() => publish(choice!)}
        >
          {choice === 'published'
            ? 'Publish assessment'
            : choice === 'draft'
              ? 'Save as draft'
              : 'Schedule'}
        </Btn>
      </div>
    </Card>
  );
}
