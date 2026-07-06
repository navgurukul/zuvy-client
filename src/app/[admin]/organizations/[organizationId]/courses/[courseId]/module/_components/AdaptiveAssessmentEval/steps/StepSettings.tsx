import React from 'react';
import { THEME, LEVELS } from '../constants';
import { Card, Field, Btn, inputStyle, Check } from '../ui-primitives';
import { BuilderState } from '../types';

interface StepSettingsProps {
  a: BuilderState;
  set: (patch: Partial<BuilderState>) => void;
}

export function StepSettings({ a, set }: StepSettingsProps) {
  return (
    <Card style={{ padding: 26, maxWidth: 680 }}>
      <h4 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 18px' }}>Settings</h4>
      <Field label="Assessment mode" required>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            {
              id: 'formative',
              title: 'Checkpoint',
              desc: 'Practice reading. No pass mark. Updates the learner's level.',
            },
            {
              id: 'summative',
              title: 'Milestone',
              desc: 'Formal end-of-module reading. Records the level achieved.',
            },
          ].map((m) => (
            <div
              key={m.id}
              onClick={() => set({ mode: m.id as any })}
              style={{
                border: `2px solid ${a.mode === m.id ? THEME.primary : THEME.border}`,
                background: a.mode === m.id ? THEME.primaryLight : THEME.card,
                borderRadius: 8,
                padding: 15,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 5,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 14, color: THEME.text }}>
                  {m.title}
                </span>
                {a.mode === m.id && <Check size={14} color={THEME.primary} />}
              </div>
              <div style={{ fontSize: 12.5, color: THEME.textSub, lineHeight: 1.5 }}>
                {m.desc}
              </div>
            </div>
          ))}
        </div>
      </Field>
      {a.mode === 'summative' && (
        <Field label="Target level" hint="Shown alongside the learner's result.">
          <select
            value={a.gateLevel}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              set({ gateLevel: e.target.value as any })
            }
            style={{ ...inputStyle, width: 200 }}
          >
            {LEVELS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label} or above
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Time limit">
        <select
          value={a.timeLimit}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            set({ timeLimit: e.target.value })
          }
          style={{ ...inputStyle, width: 170 }}
        >
          {['30 min', '45 min', '1 hour', '2 hours'].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </Field>
      <Field label="Proctoring">
        {(
          [
            ['proctorCopyPaste', 'Block copy and paste', 'Prevents copying question text.'],
            ['proctorTabChange', 'Flag tab changes', 'Tab switches are logged.'],
          ] as const
        ).map(([k, lbl, desc]) => (
          <div
            key={k}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: `1px solid ${THEME.border}`,
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{lbl}</div>
              <div style={{ fontSize: 12, color: THEME.textTertiary }}>{desc}</div>
            </div>
            <button
              onClick={() => set({ [k]: !a[k] })}
              style={{
                width: 42,
                height: 24,
                borderRadius: 99,
                border: 'none',
                cursor: 'pointer',
                background: a[k] ? THEME.primary : THEME.muted,
                position: 'relative',
                transition: 'background .2s',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 3,
                  left: a[k] ? 19 : 2,
                  width: 18,
                  height: 18,
                  borderRadius: 99,
                  background: '#fff',
                  transition: 'left .2s',
                }}
              />
            </button>
          </div>
        ))}
      </Field>
    </Card>
  );
}
