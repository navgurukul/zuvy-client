import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { THEME } from '../constants';
import { Card } from '../ui-primitives';
import { BuilderState, Question } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface StepPublishProps {
  a: BuilderState;
  set: (patch: Partial<BuilderState>) => void;
  coverage: { met: number; total: number; complete: boolean };
  pool: Question[];
  publish: (status: string, endDatetime?: string) => void | Promise<void>;
}

export function StepPublish({ a, set, coverage, pool, publish }: StepPublishProps) {
  const [choice, setChoice] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    a.scheduledDate || new Date().toISOString().slice(0, 10)
  );
  const [selectedTime, setSelectedTime] = useState(a.scheduledTime || '09:00');
  const unreviewed = pool.filter((q: Question) => q.source === 'ai' && !q.validated).length;

  useEffect(() => {
    if (a.scheduledDate) setSelectedDate(a.scheduledDate);
    if (a.scheduledTime) setSelectedTime(a.scheduledTime);
  }, [a.scheduledDate, a.scheduledTime]);

  const openDialog = () => {
    if (!choice) return;
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!choice) return;
    const endDatetime = `${selectedDate}T${selectedTime}:00+05:30`;
    set({ scheduledDate: selectedDate, scheduledTime: selectedTime });
    await publish(choice, endDatetime);
    setDialogOpen(false);
  };

  return (
    <Card className="p-[26px] max-w-[720px]">
      <h4 className="text-lg flex font-bold m-0 mb-1">Publish</h4>
      <p className="text-[13.5px] flex m-0 mb-[18px]" style={{ color: THEME.textSub }}>
        Publishing is final. Each learner`&apos;`s form assembles from the pool at attempt time.
      </p>

      {/* {blocked && (
        <Alert
          className="mb-3.5 flex gap-[7px] items-start rounded-lg py-2.5 px-3.5 text-[13px]"
          style={{
            background: THEME.warningLight,
            borderColor: THEME.warning,
            color: THEME.warningDark,
          }}
        >
          <AlertTriangle size={14} className="mt-px shrink-0" />
          <AlertDescription style={{ color: THEME.warningDark }}>
            {missingCells} pool cell{missingCells !== 1 ? 's are' : ' is'} below target. Fill the gaps before publishing.
          </AlertDescription>
        </Alert>
      )} */}

      <div className="grid grid-cols-3 gap-3 mb-[18px]">
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
            className="rounded-[9px] p-4 cursor-pointer border-2"
            style={{
              background: opt.bg,
              borderColor: choice === opt.id ? THEME.primary : 'transparent',
            }}
          >
            <div className="font-bold text-sm mb-0.5">{opt.title}</div>
            <div className="text-xs" style={{ color: THEME.textSub }}>
              {opt.desc}
            </div>
          </div>
        ))}
      </div>

      <div
        className="rounded-lg py-3 px-[15px] text-[13px] mb-[18px]"
        style={{ background: THEME.muted, color: THEME.textSub }}
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

      <div className="flex justify-end">
        <Button
          size="lg"
          disabled={!choice}
          onClick={openDialog}
        >
          {choice === 'published'
            ? 'Publish assessment'
            : choice === 'draft'
              ? 'Save as draft'
              : 'Schedule'}
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {choice === 'published'
                ? 'Publish assessment'
                : choice === 'draft'
                  ? 'Save as draft'
                  : 'Schedule assessment'}
            </DialogTitle>
            <DialogDescription>
              Select the end date and time in IST before submitting.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">End date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End time</label>
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!selectedDate || !selectedTime}>
              {choice === 'published'
                ? 'Confirm publish'
                : choice === 'draft'
                  ? 'Confirm draft'
                  : 'Confirm schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}