import React from 'react';
import { Check } from 'lucide-react';
import { THEME, LEVELS } from '../constants';
import { Card } from '../ui-primitives';
import { BuilderState } from '../types';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface StepSettingsProps {
  a: BuilderState;
  set: (patch: Partial<BuilderState>) => void;
}

export function StepSettings({ a, set }: StepSettingsProps) {
  return (
    <Card className="p-[26px] max-w-[680px]">
      <h4 className="text-lg flex font-bold m-0 mb-[18px]">Settings</h4>

      <div className="mb-5">
        <Label className="mb-2 flex ">
          Assessment mode <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              id: 'formative',
              title: 'Checkpoint',
              desc: "Practice reading. No pass mark. Updates the learner's level.",
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
              className="rounded-lg p-[15px] cursor-pointer border-2"
              style={{
                borderColor: a.mode === m.id ? THEME.primary : THEME.border,
                background: a.mode === m.id ? THEME.primaryLight : THEME.card,
              }}
            >
              <div className="flex justify-between items-center mb-[5px]">
                <span className="font-bold text-sm" style={{ color: THEME.text }}>
                  {m.title}
                </span>
                {a.mode === m.id && <Check size={14} color={THEME.primary} />}
              </div>
              <div className="text-[12.5px] leading-[1.5]" style={{ color: THEME.textSub }}>
                {m.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {a.mode === 'summative' && (
        <div className="mb-5">
          <Label className="mb-2 flex">Target level</Label>
          <Select
            value={a.gateLevel}
            onValueChange={(value) => set({ gateLevel: value as any })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.label} or above
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs mt-1" style={{ color: THEME.textTertiary }}>
            Shown alongside the learner's result.
          </p>
        </div>
      )}

      <div className="mb-5">
        <Label className="mb-2 flex">Time limit</Label>
        <Select
          value={a.timeLimit}
          onValueChange={(value) => set({ timeLimit: value })}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Select time limit" />
          </SelectTrigger>
          <SelectContent>
            {['30 min', '45 min', '1 hour', '2 hours'].map((x) => (
              <SelectItem key={x} value={x}>
                {x}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 flex">Proctoring</Label>
        {(
          [
            ['proctorCopyPaste', 'Block copy and paste', 'Prevents copying question text.'],
            ['proctorTabChange', 'Flag tab changes', 'Tab switches are logged.'],
          ] as const
        ).map(([k, lbl, desc]) => (
          <div
            key={k}
            className="flex justify-between items-center py-2.5 border-b"
            style={{ borderColor: THEME.border }}
          >
            <div>
              <div className="font-semibold text-[13.5px]">{lbl}</div>
              <div className="text-xs" style={{ color: THEME.textTertiary }}>
                {desc}
              </div>
            </div>
            <Switch
              checked={a[k]}
              onCheckedChange={(checked) => set({ [k]: checked } as Partial<BuilderState>)}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}