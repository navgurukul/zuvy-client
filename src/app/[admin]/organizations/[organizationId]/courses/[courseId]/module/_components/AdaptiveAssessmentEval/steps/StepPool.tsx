'use client'
import React from 'react';
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
  const selectedChapters = baselineOptions.filter((c: Chapter) =>
    a.chapterIds.includes(c.id)
  );

  return (
    <div>
      <div className="bg-primary-light border border-primary rounded-[10px] py-[14px] px-[18px] mb-5">
        <div className="font-bold flex text-[14px] text-primary-dark mb-1">
          Baseline signal — {selectedChapters.length} MCQ chapter{selectedChapters.length !== 1 ? 's' : ''} selected
        </div>
        <div className="flex gap-[7px] flex-wrap mb-2">
          {selectedChapters.map((c: Chapter) => (
            <span
              key={c.id}
              className="bg-card border border-primary text-primary-dark text-[12px] font-semibold py-[3px] px-[10px] rounded-full"
            >
              {c.title} · {c.questionCount}Q
            </span>
          ))}
        </div>
        <div className="text-[12.5px] flex text-muted-foreground leading-relaxed">
          When a learner opens this assessment, the system reads their MCQ history and
          maps it to a level (E → A+). The pool below serves the right difficulty mix
          for that level.
        </div>
      </div>

    </div>
  );
}

