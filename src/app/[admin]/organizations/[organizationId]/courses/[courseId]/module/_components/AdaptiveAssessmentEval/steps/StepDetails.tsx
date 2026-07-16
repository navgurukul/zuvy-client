import React from 'react';
import { THEME } from '../constants';
import { Card, Field } from '../ui-primitives';
import { BuilderState } from '../types';

interface StepDetailsProps {
  a: BuilderState;
  set: (patch: Partial<BuilderState>) => void;
}

const inputClasses = "w-full px-3 py-2.5 rounded-md border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none font-[inherit] box-border";

export function StepDetails({ a, set }: StepDetailsProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 max-w-[680px]">
      <h4 className="text-base font-bold flex  mb-0.5 mt-0">
        Assessment details
      </h4>
      <p className="text-[12.5px] flex text-slate-600 mb-3.5 mt-0">
        Objective and outcomes are used to guide AI question generation — be
        specific.
      </p>

      <div className="mb-5">
        <label className="block flex font-semibold text-sm text-slate-900 mb-1">
          Assessment name <span className="text-red-500">*</span>
        </label>
        <input
          className={inputClasses}
          value={a.name}
          placeholder="e.g., HTML & CSS — Module checkpoint"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            set({ name: e.target.value })
          }
        />
      </div>

      <div className="mb-5">
        <label className="block flex font-semibold text-sm text-slate-900 mb-1">
          Objective <span className="text-red-500">*</span>
        </label>
        <textarea
          className={`${inputClasses} min-h-[56px] resize-y`}
          value={a.objective}
          placeholder="e.g., Verify learners can apply CSS layout and specificity concepts to solve small practical problems."
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            set({ objective: e.target.value })
          }
        />
        <div className="text-xs flex text-slate-500 mt-1">
          What this assessment measures — one or two sentences. This is sent to the AI generation API.
        </div>
      </div>

      <div className="mb-5">
        <label className="block flex font-semibold text-sm text-slate-900 mb-1">
          Expected outcomes
        </label>
        <textarea
          className={`${inputClasses} min-h-[56px] resize-y`}
          value={a.outcomes}
          placeholder="e.g., Correctly predict layout behaviour, choose the right positioning model for a described UI."
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            set({ outcomes: e.target.value })
          }
        />
        <div className="text-xs flex text-slate-500 mt-1">
          What a passing learner should demonstrate. Also sent to AI generation for question relevance.
        </div>
      </div>

      <div className="mb-5 flex flex-col">
        <label className="block flex font-semibold text-sm text-slate-900 mb-1">
          Number of MCQs per form
        </label>
        <input
          type="number"
          min={5}
          max={30}
          className={`${inputClasses} !w-[100px]`}
          value={a.questionsPerForm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            set({
              questionsPerForm: Math.max(5, Math.min(30, Number(e.target.value) || 10)),
            })
          }
        />
        <div className="text-[11px] flex text-slate-500 mt-1">
          Each student's MCQ section will have this many questions, assembled
          from the pool to match their level.
        </div>
      </div>
    </div>
  );
}
