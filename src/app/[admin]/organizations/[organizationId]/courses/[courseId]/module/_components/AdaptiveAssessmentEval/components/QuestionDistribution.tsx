import React from 'react';
import { Minus, Plus, RefreshCw } from 'lucide-react';
import { BANDS, DIFF_LABEL } from '../constants';
import { Band, BandCounts } from '../types';
import {
  DistributionSummary,
  SET_COUNT,
  splitCell,
  sumCounts,
} from '../distribution';

interface QuestionDistributionProps {
  topics: string[];
  distribution: Record<string, BandCounts>;
  available: Record<string, BandCounts | undefined>;
  summary: DistributionSummary;
  questionsPerSet: number;
  disabled?: boolean;
  onChange: (topic: string, band: Band, value: number) => void;
  onReset: () => void;
}

const pill = 'inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium';
const okPill = `${pill} border-green-300 bg-green-50 text-green-700 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-300`;
const badPill = `${pill} border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300`;

function Stepper({
  value,
  disabled,
  onChange,
}: {
  value: number;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  const btn =
    'flex h-full w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';
  return (
    <div className="inline-flex h-9 items-stretch overflow-hidden rounded-md border border-border bg-card">
      <button
        type="button"
        className={btn}
        disabled={disabled || value <= 0}
        onClick={() => onChange(value - 1)}
        aria-label="Decrease"
      >
        <Minus size={13} />
      </button>
      <span className="flex w-9 items-center justify-center text-sm font-semibold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        className={btn}
        disabled={disabled}
        onClick={() => onChange(value + 1)}
        aria-label="Increase"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

export function QuestionDistribution({
  topics,
  distribution,
  available,
  summary,
  questionsPerSet,
  disabled,
  onChange,
  onReset,
}: QuestionDistributionProps) {
  const totalOk = summary.perSet === questionsPerSet;

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="text-left">
          <h4 className="m-0 mb-1 text-base font-bold">Question Distribution</h4>
          <p className="m-0 text-[13px] leading-relaxed text-muted-foreground">
            Proposed from availability. Change any number — each topic and
            difficulty is checked against the pool.
          </p>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex shrink-0 items-center gap-2 rounded-md border border-border bg-card px-3.5 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <RefreshCw size={14} />
            Reset to proposed
          </button>
        )}
      </div>

      {topics.length === 0 ? (
        <div className="py-6 text-center text-[13px] text-muted-foreground">
          Select topics above to set how many questions each set draws from them.
        </div>
      ) : (
        <>
          <div className="mb-4 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-left text-[13px] leading-relaxed text-primary-dark dark:text-primary">
            Per set: <strong>{summary.common} common</strong> (shared by all{' '}
            {SET_COUNT} sets) + <strong>{summary.unique} unique</strong>. For each
            topic and difficulty, the pool needs{' '}
            <strong>common + {SET_COUNT} × unique</strong> —{' '}
            <strong>{summary.poolNeed} questions</strong> in total.
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-3 pr-4 text-left font-medium">Topic</th>
                  {BANDS.map((b) => (
                    <th key={b} className="px-2 py-3 text-center font-medium">
                      {DIFF_LABEL[b]}
                    </th>
                  ))}
                  <th className="px-2 py-3 text-center font-medium">Per set</th>
                  <th className="py-3 pl-2" />
                </tr>
              </thead>
              <tbody>
                {topics.map((topic) => {
                  const counts = distribution[topic];
                  const short = summary.shortByTopic[topic] ?? 0;
                  return (
                    <tr key={topic} className="border-b border-border">
                      <td className="py-4 pr-4 text-left font-medium">{topic}</td>
                      {BANDS.map((band) => {
                        const value = counts?.[band] ?? 0;
                        const need = splitCell(value).need;
                        const has = available[topic]?.[band] ?? 0;
                        const isShort = need > has;
                        return (
                          <td key={band} className="px-2 py-4 text-center">
                            <Stepper
                              value={value}
                              disabled={disabled}
                              onChange={(v) => onChange(topic, band, v)}
                            />
                            <div
                              className={`mt-1 text-[11px] ${isShort ? 'font-semibold text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}
                            >
                              needs {need} · has {has}
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-2 py-4 text-center font-semibold tabular-nums">
                        {sumCounts(counts)}
                      </td>
                      <td className="py-4 pl-2 text-right">
                        <span className={short > 0 ? badPill : okPill}>
                          {short > 0 ? `${short} short` : 'Enough'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td className="py-4 pr-4 text-left font-semibold">Total per set</td>
                  <td colSpan={3} />
                  <td className="px-2 py-4 text-center">
                    <span className={totalOk ? okPill : badPill}>
                      {summary.perSet} / {questionsPerSet}
                    </span>
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
          {!totalOk && (
            <p className="mt-2 text-left text-xs text-red-600 dark:text-red-400">
              Each set must have exactly {questionsPerSet} questions —{' '}
              {summary.perSet < questionsPerSet
                ? `add ${questionsPerSet - summary.perSet} more`
                : `remove ${summary.perSet - questionsPerSet}`}
              .
            </p>
          )}
        </>
      )}
    </div>
  );
}
