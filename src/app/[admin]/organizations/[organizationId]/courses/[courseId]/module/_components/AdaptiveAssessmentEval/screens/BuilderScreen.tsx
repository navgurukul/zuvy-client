import React, { useState } from 'react';
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { THEME } from '../constants';
import { Badge, Btn } from '../ui-primitives';
import { StepDetails } from '../steps/StepDetails';
import { StepTopicsBaseline } from '../steps/StepTopicsBaseline';
import { StepPool } from '../steps/StepPool';
import { StepReview } from '../steps/StepReview';
import { StepSettings } from '../steps/StepSettings';
import { StepPublish } from '../steps/StepPublish';
import { BuilderState, Question, Chapter, BandCounts } from '../types';
import { DistributionSummary } from '../distribution';
import { TopicWithDifficultyLevel } from '@/hooks/hookType';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface BuilderScreenProps {
  a: BuilderState;
  set: (patch: Partial<BuilderState>) => void;
  step: number;
  setStep: (step: number) => void;
  isSubmittingAssessment?: boolean;
  isCreatingAssessment?: boolean;
  isMapping?: boolean;
  onGenerateAndReview?: () => Promise<void>;
  aiAssessmentId?: number | null;
  questionSets?: import('@/hooks/hookType').GetQuestionSetsApiResponse | null;
  isFetchingQuestionSets?: boolean;
  questionSetsError?: string | null;
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
  publish: (status: string, endDatetime?: string) => void | Promise<void>;
  schedule: (startDatetime: string, endDatetime: string) => void | Promise<void>;
  saveDraft: () => void | Promise<void>;
  showToast: (msg: string) => void;
  baselineOptions: Chapter[];
  bankTopics: string[];
  bankQuestions: Question[];
  orgTopics: TopicWithDifficultyLevel[];
  orgTopicsLoading: boolean;
  refreshOrgTopics: () => Promise<unknown>;
  topicAvailability: Record<string, BandCounts>;
  distributionSummary: DistributionSummary;
  moduleId?: number;
  courseId?: any;
  chapterId?: number;
}

export function BuilderScreen({
  a,
  set,
  step,
  setStep,
  isSubmittingAssessment = false,
  isCreatingAssessment = false,
  isMapping = false,
  onGenerateAndReview,
  aiAssessmentId,
  questionSets,
  isFetchingQuestionSets,
  questionSetsError,
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
  schedule,
  saveDraft,
  baselineOptions,
  bankTopics,
  bankQuestions,
  orgTopics,
  orgTopicsLoading,
  refreshOrgTopics,
  topicAvailability,
  distributionSummary,
  moduleId,
  courseId,
  chapterId,
}: BuilderScreenProps) {
  const [showConfirmGenerate, setShowConfirmGenerate] = useState(false);
  return (
    <div className="flex flex-col h-full pb-8 dark:bg-card">
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-3">
        <div className="flex items-baseline justify-between mb-0.5">
          <h2 className="text-lg font-bold m-0 dark:text-muted-foreground">
            {a.name.trim() || 'New adaptive assessment'}
          </h2>
          <Badge bg={THEME.muted} color={THEME.textSub}>
            {a.status === 'editing' ? 'Unsaved' : a.status}
          </Badge>
        </div>
        <p className="text-xs flex m-0 mb-3 text-slate-600 dark:text-muted-foreground">
          One pool, assembled per student at attempt time. Level is inferred from their
          MCQ history — no separate baseline test needed.
        </p>

        <div className="flex items-center gap-2 mb-4 overflow-x-auto py-1">
          {STEPS.map((s: string, i: number) => {
            const isPublished = a.status === 'published' || a.status === 'scheduled';
            const done = !(i === step) && (i < step || (!!aiAssessmentId && i <= 2) || isPublished);
            const active = i === step;
            const reachable = (i <= step || stepValid.slice(0, i).every(Boolean)) && (i < 3 || !!aiAssessmentId);

            const circleClass = active
              ? 'bg-primary border-primary text-primary-foreground'
              : done
                ? 'bg-transparent border-primary text-primary'
                : 'bg-muted/60 border-border text-muted-foreground';
            const labelClass = active
              ? 'text-foreground'
              : done
                ? 'text-foreground/80'
                : 'text-muted-foreground';

            return (
              <React.Fragment key={s}>
                {i > 0 && (
                  <div
                    className={`h-px min-w-[16px] flex-1 ${i <= step ? 'bg-primary' : 'bg-border'}`}
                  />
                )}
                <button
                  onClick={() => reachable && setStep(i)}
                  className={`flex shrink-0 items-center gap-2 border-none bg-transparent p-0 font-[inherit] text-[13px] font-semibold transition-colors ${reachable ? 'cursor-pointer' : 'cursor-not-allowed'} ${labelClass}`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${circleClass}`}
                  >
                    {done ? <Check size={13} /> : i + 1}
                  </span>
                  {s}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {step === 0 && <StepDetails a={a} set={set} isGenerated={!!aiAssessmentId} />}
        {step === 1 && (
          <StepTopicsBaseline
            a={a}
            set={set}
            isGenerated={!!aiAssessmentId}
            baselineOptions={baselineOptions}
            bankTopics={bankTopics}
            bankQuestions={bankQuestions}
            orgTopics={orgTopics}
            orgTopicsLoading={orgTopicsLoading}
            refreshOrgTopics={refreshOrgTopics}
            topicAvailability={topicAvailability}
            distributionSummary={distributionSummary}
            moduleId={moduleId}
            courseId={courseId}
            chapterId={chapterId}
          />
        )}
        {step === 2 && (
          <StepPool
            a={a}
            pool={pool}
            isGenerated={!!aiAssessmentId}
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
            aiAssessmentId={aiAssessmentId}
            questionSets={questionSets}
            isFetchingQuestionSets={isFetchingQuestionSets}
            questionSetsError={questionSetsError}
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
            schedule={schedule}
            saveDraft={saveDraft}
          />
        )}
      </div>

      <div className="shrink-0 flex justify-between px-5 py-3 z-10 bg-white dark:bg-card border-t border-slate-200 dark:border-gray-600">
        <Btn variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
          <ChevronLeft size={14} /> Back
        </Btn>
        {step < 5 && (
          <Button
            disabled={!stepValid[step] || isSubmittingAssessment}
            onClick={async () => {
              if (step === 2 && onGenerateAndReview && !aiAssessmentId) {
                setShowConfirmGenerate(true);
                return;
              }
              setStep(step + 1);
            }}
          >
            {step === 2 && !aiAssessmentId ? (
              isSubmittingAssessment ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {isCreatingAssessment
                    ? 'Generating assessment...'
                    : isMapping
                      ? 'Mapping questions...'
                      : 'Generating & mapping...'}
                </>
              ) : (
                <>Generate Assessment and Review <ChevronRight size={14} /></>
              )
            ) : (
              <>Continue to {STEPS[step + 1]} <ChevronRight size={14} /></>
            )}
          </Button>
        )}
      </div>

      <AlertDialog open={showConfirmGenerate} onOpenChange={setShowConfirmGenerate}>
        <AlertDialogContent>
          <AlertDialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <AlertDialogTitle className="text-lg">Generate Assessment</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Are you sure you want to generate the assessment? Once generated, you
              will not be able to come back and edit the configuration.
              <span className="mt-2 block font-medium text-foreground">
                Please ensure all details are final before proceeding.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-2 gap-2 sm:gap-2">
            <AlertDialogCancel onClick={() => setShowConfirmGenerate(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setShowConfirmGenerate(false);
                if (onGenerateAndReview) {
                  await onGenerateAndReview();
                }
              }}
            >
              Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
