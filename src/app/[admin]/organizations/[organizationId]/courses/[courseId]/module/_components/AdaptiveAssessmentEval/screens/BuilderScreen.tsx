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
import { Button } from '@/components/ui/button';

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
    <div className="flex flex-col h-full pb-8">
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-3">
        <div className="flex items-baseline justify-between mb-0.5">
          <h2 className="text-lg font-bold m-0">
            {a.name.trim() || 'New adaptive assessment'}
          </h2>
          <Badge bg={THEME.muted} color={THEME.textSub}>
            {a.status === 'editing' ? 'Unsaved' : a.status}
          </Badge>
        </div>
        <p className="text-xs flex m-0 mb-3 text-slate-600">
          One pool, assembled per student at attempt time. Level is inferred from their
          MCQ history — no separate baseline test needed.
        </p>

        <div className="flex gap-0.5 mb-3 border-b border-slate-200">
          {STEPS.map((s: string, i: number) => {
            const done = i < step;
            const active = i === step;
            const reachable = i <= step || stepValid.slice(0, i).every(Boolean);

            // Determine Tailwind classes for dynamic styles
            const cursorClass = reachable ? 'cursor-pointer' : 'cursor-not-allowed';
            const colorClass = active ? 'text-primary' : done ? 'text-primary/80' : 'text-slate-400';
            const borderClass = active || done ? 'border-primary' : 'border-transparent';

            return (
              <button
                key={s}
                onClick={() => reachable && setStep(i)}
                className={`flex-1 border-none bg-transparent font-semibold text-[11px] font-[inherit] flex items-center justify-center gap-1 transition-all duration-200 pt-[7px] px-1 pb-[9px] border-b-[3px] ${cursorClass} ${colorClass} ${borderClass}`}
              >
                {done ? (
                  <Check size={10} />
                ) : (
                  <span className="opacity-60">{i + 1}</span>
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

      <div className="shrink-0 flex justify-between px-5  z-10 bg-white border-t border-slate-200">
        <Btn variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
          <ChevronLeft size={14} /> Back
        </Btn>
        {step < 5 && (
          <Button disabled={!stepValid[step]} onClick={() => setStep(step + 1)}>
            Continue to {STEPS[step + 1]} <ChevronRight size={14} />
          </Button>
        )}
      </div>
    </div>
  );
}
