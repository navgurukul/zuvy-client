import React from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { THEME } from '../constants';
import { Badge, Btn } from '../ui-primitives';
import { StepDetails } from '../steps/StepDetails';
import { StepTopicsBaseline } from '../steps/StepTopicsBaseline';
import { StepPool } from '../steps/StepPool';
import { StepReview } from '../steps/StepReview';
import { StepSettings } from '../steps/StepSettings';
import { StepPublish } from '../steps/StepPublish';
import { BuilderState, Question, Chapter } from '../types';

interface BuilderScreenProps {
  a: BuilderState;
  set: (patch: Partial<BuilderState>) => void;
  step: number;
  setStep: (step: number) => void;
  STEPS: string[];
  stepValid: boolean[];
  pool: Question[];
  setPool: (pool: Question[]) => void;
  targets: Record<string, Record<string, number>>;
  coverage: { met: number; total: number; missing: number; complete: boolean };
  capacity: number;
  generating: any;
  genError: string | null;
  setGenError: (error: string | null) => void;
  generateForCell: (topic: string, band: string, count: number) => void;
  fillAllGaps: () => void;
  bankPicker: { topic: string; band: string } | null;
  setBankPicker: (picker: { topic: string; band: string } | null) => void;
  replaceModal: Question | null;
  setReplaceModal: (question: Question | null) => void;
  previewLevel: any;
  setPreviewLevel: (level: any) => void;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  expanded: string | null;
  setExpanded: (id: string | null) => void;
  publish: (status: string) => void;
  showToast: (msg: string) => void;
  baselineOptions: Chapter[];
  bankTopics: string[];
  bankQuestions: Question[];
}

export function BuilderScreen({
  a,
  set,
  step,
  setStep,
  STEPS,
  stepValid,
  pool,
  setPool,
  targets,
  coverage,
  capacity,
  generating,
  genError,
  setGenError,
  generateForCell,
  fillAllGaps,
  setBankPicker,
  setReplaceModal,
  previewLevel,
  setPreviewLevel,
  showPreview,
  setShowPreview,
  expanded,
  setExpanded,
  publish,
  baselineOptions,
  bankTopics,
  bankQuestions,
}: BuilderScreenProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 28px 20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <h2 style={{ fontSize: 21, fontWeight: 700, margin: 0 }}>
            {a.name.trim() || 'New adaptive assessment'}
          </h2>
          <Badge bg={THEME.muted} color={THEME.textSub}>
            {a.status === 'editing' ? 'Unsaved' : a.status}
          </Badge>
        </div>
        <p style={{ color: THEME.textSub, fontSize: 13.5, margin: '0 0 20px' }}>
          One pool, assembled per student at attempt time. Level is inferred from their
          MCQ history — no separate baseline test needed.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 2,
            borderBottom: `1px solid ${THEME.border}`,
            marginBottom: 22,
          }}
        >
          {STEPS.map((s: string, i: number) => {
            const done = i < step;
            const active = i === step;
            const reachable = i <= step || stepValid.slice(0, i).every(Boolean);
            return (
              <button
                key={s}
                onClick={() => reachable && setStep(i)}
                style={{
                  flex: 1,
                  padding: '9px 4px 11px',
                  border: 'none',
                  cursor: reachable ? 'pointer' : 'not-allowed',
                  background: 'transparent',
                  color: active ? THEME.primary : done ? THEME.primaryMid : THEME.textMuted,
                  borderBottom: `3px solid ${active || done ? THEME.primary : 'transparent'}`,
                  fontWeight: 600,
                  fontSize: 12,
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  transition: 'all .2s',
                }}
              >
                {done ? (
                  <Check size={11} />
                ) : (
                  <span style={{ opacity: 0.6 }}>{i + 1}</span>
                )}{' '}
                {s}
              </button>
            );
          })}
        </div>

        {step === 0 && <StepDetails a={a} set={set} />}
        {step === 1 && (
          <StepTopicsBaseline
            a={a}
            set={set}
            baselineOptions={baselineOptions}
            bankTopics={bankTopics}
            bankQuestions={bankQuestions}
          />
        )}
        {step === 2 && (
          <StepPool
            a={a}
            pool={pool}
            targets={targets}
            coverage={coverage}
            capacity={capacity}
            generating={generating}
            genError={genError}
            setGenError={setGenError}
            generateForCell={generateForCell}
            fillAllGaps={fillAllGaps}
            setBankPicker={setBankPicker}
            baselineOptions={baselineOptions}
            bankQuestions={bankQuestions}
          />
        )}
        {step === 3 && (
          <StepReview
            a={a}
            pool={pool}
            setPool={setPool}
            expanded={expanded}
            setExpanded={setExpanded}
            setReplaceModal={setReplaceModal}
            previewLevel={previewLevel}
            setPreviewLevel={setPreviewLevel}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
          />
        )}
        {step === 4 && <StepSettings a={a} set={set} />}
        {step === 5 && (
          <StepPublish
            a={a}
            set={set}
            coverage={coverage}
            pool={pool}
            publish={publish}
          />
        )}
      </div>

      <div
        style={{
          flexShrink: 0,
          background: THEME.card,
          borderTop: `1px solid ${THEME.border}`,
          padding: '11px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          zIndex: 10,
        }}
      >
        <Btn variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
          <ChevronLeft size={14} /> Back
        </Btn>
        {step < 5 && (
          <Btn disabled={!stepValid[step]} onClick={() => setStep(step + 1)}>
            Continue to {STEPS[step + 1]} <ChevronRight size={14} />
          </Btn>
        )}
      </div>
    </div>
  );
}
