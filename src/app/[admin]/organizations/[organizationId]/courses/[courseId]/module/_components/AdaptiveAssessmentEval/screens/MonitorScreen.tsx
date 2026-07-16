import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { THEME } from '../constants';
import { Card } from '../ui-primitives';
import { BuilderState, Question, Chapter } from '../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
    <div className="flex-1 overflow-y-auto py-[22px] px-7">
      <div className='flex' >
        <Button
          variant="ghost"
          onClick={onBack}
          className="w-fit justify-start gap-1.5 text-[13px] p-2 mb-3.5 h-auto"
        >
          ← Back to builder
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h2 className="text-[22px] font-bold m-0">{a.name || 'Untitled'}</h2>
        <Badge
          className="py-[5px] px-3"
          style={{
            background: a.status === 'published' ? THEME.primaryLight : THEME.infoLight,
            color: a.status === 'published' ? THEME.primaryDark : THEME.info,
          }}
        >
          {a.status === 'published'
            ? 'Published'
            : a.status === 'scheduled'
              ? `Scheduled · ${a.scheduledDate}`
              : 'Draft'}
        </Badge>
        <Badge style={{ background: THEME.muted, color: THEME.textSub }}>
          {a.mode === 'formative'
            ? 'Checkpoint'
            : `Milestone · Level ${a.gateLevel}+ target`}
        </Badge>
      </div>

      <div className="grid gap-3.5 mb-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <Card className="p-[18px]">
          <div className="font-bold flex text-[13.5px] mb-[11px]">Baseline signal</div>
          <div className="text-[12.5px] flex mb-2.5" style={{ color: THEME.textSub }}>
            Learner level is inferred from:
          </div>
          {linkedChapters.map((c) => (
            <div
              key={c.id}
              className="flex justify-between py-[5px] text-[13px] border-b"
              style={{ borderColor: THEME.border }}
            >
              <span>{c.title}</span>
              <span style={{ color: THEME.textTertiary }}>{c.questionCount}Q</span>
            </div>
          ))}
          <div className="text-[11.5px] mt-2" style={{ color: THEME.textTertiary }}>
            No separate baseline test. MCQ attempts during the module are enough.
          </div>
        </Card>

        <Card className="p-[18px]">
          <div className="font-bold flex text-[13.5px] mb-[11px]">Attempts</div>
          <div className="flex gap-[22px]">
            {[
              ['18', 'completed'],
              ['3', 'in progress'],
              ['11', 'not started'],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="text-[22px] font-bold">{n}</div>
                <div className="text-[11px]" style={{ color: THEME.textTertiary }}>
                  {l}
                </div>
              </div>
            ))}
          </div>
          <div
            className="mt-[11px] h-[5px] rounded-full overflow-hidden flex"
            style={{ background: THEME.muted }}
          >
            <div className="w-[56%]" style={{ background: THEME.primary }} />
            <div className="w-[9%]" style={{ background: THEME.warning }} />
          </div>
        </Card>

        <Card className="p-[18px]">
          <div className="font-bold flex text-[13.5px] mb-[11px]">Level distribution</div>
          <div className="flex items-end gap-[7px] h-[90px]">
            {mockDist.map((d) => (
              <div key={d.l} className="flex-1 flex flex-col items-center gap-[3px]">
                <span className="text-[10px] font-semibold" style={{ color: THEME.textSub }}>
                  {d.n}
                </span>
                <div
                  className="w-full rounded-t-[3px] transition-[height] duration-300"
                  style={{
                    height: `${(d.n / maxN) * 72}px`,
                    background:
                      d.l === 'C' || d.l === 'B' ? THEME.primary : THEME.primaryLight,
                  }}
                />
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: THEME.textTertiary }}
                >
                  {d.l}
                </span>
              </div>
            ))}
          </div>
          <div className="text-[11px] mt-[7px]" style={{ color: THEME.textTertiary }}>
            Level derived from module MCQ history, not a baseline sitting.
          </div>
        </Card>

        <Card className="p-[18px] flex flex-col justify-start">
          <div className="font-bold text-[13.5px] flex mb-[11px]">Pool</div>
          {[
            [`${pool.length} questions total`],
            [`${pool.filter((q) => q.source === 'ai').length} AI-generated (provisional)`],
            [`${pool.filter((q) => q.quarantined).length} quarantined`],
          ].map(([txt], i) => (
            <div
              key={i}
              className="py-[5px] flex text-[12.5px]"

            >
              {txt}
            </div>
          ))}
        </Card>

        <Card className="p-[18px]">
          <div className="font-bold text-[13.5px] flex mb-[11px]">Pool capacity</div>
          <div className="mb-2.5">
            <span
              className="text-[28px] flex flex-row justify-center font-bold"
              style={{
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
            <span className="text-[13px] flex ml-1.5">
              unique attempt{capacity !== 1 ? 's' : ''} before any question repeats
            </span>
          </div>
          <div
            className="h-[5px] rounded-full mb-2.5"
            style={{ background: THEME.muted }}
          >
            <div
              className="h-[5px] rounded-full transition-[width] duration-300"
              style={{
                width: `${Math.min(100, (capacity / 5) * 100)}%`,
                background:
                  capacity < 2
                    ? THEME.danger
                    : capacity < 3
                      ? THEME.warning
                      : THEME.success,
              }}
            />
          </div>
          <div className="text-xs leading-[1.5]" style={{ color: THEME.textTertiary }}>
            Bottlenecked by the thinnest (topic × difficulty) cell. Add more questions to
            raise this number. Target: ≥ 3 for most cohorts.
          </div>
          {capacity < 2 && (
            <div
              className="mt-2.5 rounded-md py-[7px] px-2.5 text-xs flex gap-1.5"
              style={{ background: THEME.dangerLight, color: THEME.danger }}
            >
              <AlertTriangle size={12} className="shrink-0 mt-px" />
              Returning learners will see repeated questions. Add more questions.
            </div>
          )}
        </Card>

        <Card className="p-[18px] col-span-2">
          <div className="font-bold flex text-[13.5px] mb-1.5">Repeat prevention log</div>
          <div className="text-xs flex mb-3 text-left">
            Questions served to each learner are recorded so retakes draw from unseen
            questions first. In production this log lives on the backend and is queried at
            attempt-start time.{' '}
            {/* <span style={{ color: THEME.textTertiary }}>Showing mock data.</span> */}
          </div>
          <div className="rounded-lg overflow-hidden border" style={{ borderColor: THEME.border }}>
            <Table>
              <TableHeader>
                <TableRow style={{ background: THEME.muted }}>
                  <TableHead className="text-[11.5px] font-bold" style={{ color: THEME.textTertiary }}>
                    Learner
                  </TableHead>
                  <TableHead
                    className="text-[11.5px] font-bold border-l"
                    style={{ color: THEME.textTertiary, borderColor: THEME.border }}
                  >
                    Attempt
                  </TableHead>
                  <TableHead
                    className="text-[11.5px] font-bold border-l"
                    style={{ color: THEME.textTertiary, borderColor: THEME.border }}
                  >
                    Question IDs served
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAttemptLog.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-[13px] font-semibold">{row.learner}</TableCell>
                    <TableCell
                      className="text-[13px] border-l"
                      style={{ color: THEME.textSub, borderColor: THEME.border }}
                    >
                      #{row.attempt}
                    </TableCell>
                    <TableCell
                      className="text-[11.5px] border-l font-mono"
                      style={{ color: THEME.textTertiary, borderColor: THEME.border }}
                    >
                      {row.qIds.join(', ')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-2 text-[11.5px]" style={{ color: THEME.textTertiary }}>
            On retake, these IDs are excluded from the draw pool — learners see fresh
            questions up to pool capacity.
          </div>
        </Card>
      </div>
    </div>
  );
}