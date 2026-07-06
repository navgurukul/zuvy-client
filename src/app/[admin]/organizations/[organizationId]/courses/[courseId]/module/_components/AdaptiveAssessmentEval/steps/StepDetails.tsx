import React from 'react';
import { THEME } from '../constants';
import { Card, Field, inputStyle } from '../ui-primitives';
import { BuilderState } from '../types';

interface StepDetailsProps {
  a: BuilderState;
  set: (patch: Partial<BuilderState>) => void;
}

export function StepDetails({ a, set }: StepDetailsProps) {
  return (
    <Card style={{ padding: 26, maxWidth: 680 }}>
      <h4 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>
        Assessment details
      </h4>
      <p style={{ color: THEME.textSub, fontSize: 13.5, margin: '0 0 20px' }}>
        Objective and outcomes are used to guide AI question generation — be
        specific.
      </p>
      <Field label="Assessment name" required>
        <input
          style={inputStyle}
          value={a.name}
          placeholder="e.g., HTML & CSS — Module checkpoint"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            set({ name: e.target.value })
          }
        />
      </Field>
      <Field
        label="Objective"
        required
        hint="What this assessment measures — one or two sentences. This is sent to the AI generation API."
      >
        <textarea
          style={{ ...inputStyle, minHeight: 72, resize: 'vertical' as const }}
          value={a.objective}
          placeholder="e.g., Verify learners can apply CSS layout and specificity concepts to solve small practical problems."
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            set({ objective: e.target.value })
          }
        />
      </Field>
      <Field
        label="Expected outcomes"
        hint="What a passing learner should demonstrate. Also sent to AI generation for question relevance."
      >
        <textarea
          style={{ ...inputStyle, minHeight: 72, resize: 'vertical' as const }}
          value={a.outcomes}
          placeholder="e.g., Correctly predict layout behaviour, choose the right positioning model for a described UI."
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            set({ outcomes: e.target.value })
          }
        />
      </Field>
      <Field label="Number of MCQs per form">
        <input
          type="number"
          min={5}
          max={30}
          style={{ ...inputStyle, width: 100 }}
          value={a.questionsPerForm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            set({
              questionsPerForm: Math.max(5, Math.min(30, Number(e.target.value) || 10)),
            })
          }
        />
        <div style={{ fontSize: 12, color: THEME.textTertiary, marginTop: 4 }}>
          Each student's MCQ section will have this many questions, assembled
          from the pool to match their level.
        </div>
      </Field>
    </Card>
  );
}
