'use client'

import { useEffect, useState } from 'react'
import { X, Check, AlertTriangle, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { ChevronsUpDown } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { useTopics } from '@/hooks/useGetTopicsEval'
import { useCreateTopic } from '@/hooks/useCreateTopicEval'
import { useGenerateQuestions } from '@/hooks/useCreateAIQuestionEval'
import { useAllCourses } from '@/hooks/useAllCourses'
import { useAddSubtopic } from '@/hooks/useAddSubTopicsEval'

const UnportaledPopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-72 rounded-md border bg-popover p-4 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
UnportaledPopoverContent.displayName = "UnportaledPopoverContent"

function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder
}: {
  value: string;
  onValueChange: (val: string) => void;
  options: { label: string; value: string; id: number }[];
  placeholder: string;
  searchPlaceholder: string;
}) {
  const [open, setOpen] = useState(false)
  const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selectedLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <UnportaledPopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.id}
                  value={`${opt.label}-${opt.id}`} // keep search text distinct too
                  onSelect={() => {
                    onValueChange(opt.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === opt.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </UnportaledPopoverContent>
    </Popover>
  )
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const
type Difficulty = (typeof DIFFICULTIES)[number]



const normalise = (s: string) => s.trim().toLowerCase().replace(/[-\s/]+/g, ' ')

const BLOOMS: { id: string; label: string; hint: string }[] = [
  { id: 'remember', label: 'Remember', hint: 'Recall facts & concepts' },
  { id: 'understand', label: 'Understand', hint: 'Explain ideas or concepts' },
  { id: 'apply', label: 'Apply', hint: 'Use in a new situation' },
  { id: 'analyze', label: 'Analyze', hint: 'Draw connections & patterns' },
  { id: 'evaluate', label: 'Evaluate', hint: 'Justify a decision or course' },
  { id: 'create', label: 'Create', hint: 'Produce or design something' },
]

const BLOOM_CLASSES: Record<string, string> = {
  remember: 'border-slate-200 bg-slate-50 text-slate-600 data-[state=on]:border-slate-500 data-[state=on]:bg-slate-100 data-[state=on]:text-slate-900',
  understand: 'border-blue-200 bg-blue-50 text-blue-600 data-[state=on]:border-blue-500 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-900',
  apply: 'border-violet-200 bg-violet-50 text-violet-600 data-[state=on]:border-violet-500 data-[state=on]:bg-violet-100 data-[state=on]:text-violet-900',
  analyze: 'border-amber-200 bg-amber-50 text-amber-700 data-[state=on]:border-amber-500 data-[state=on]:bg-amber-100 data-[state=on]:text-amber-900',
  evaluate: 'border-red-200 bg-red-50 text-red-600 data-[state=on]:border-red-500 data-[state=on]:bg-red-100 data-[state=on]:text-red-900',
  create: 'border-emerald-200 bg-emerald-50 text-emerald-600 data-[state=on]:border-emerald-500 data-[state=on]:bg-emerald-100 data-[state=on]:text-emerald-900',
}

// ─── Form state type ──────────────────────────────────────────────────────────

interface AiFormState {
  domain: string
  topic: string; customTopic: string; customTopicDesc: string; topicMode: 'existing' | 'custom'
  subtopics: string[]; subtopicInput: string; subtopicError: string
  difficultyCounts: Record<string, number>
  bloomLevel: string; objective: string; reference: string
}

const DEFAULT_AI_FORM: AiFormState = {
  domain: '',
  topic: '', customTopic: '', customTopicDesc: '', topicMode: 'existing',
  subtopics: [], subtopicInput: '', subtopicError: '',
  difficultyCounts: { easy: 0, medium: 5, hard: 0 },
  bloomLevel: 'apply', objective: '', reference: '',
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </Label>
  )
}

function FieldError({ msg }: { msg: string | null }) {
  if (!msg) return null
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
      <AlertTriangle className="h-3 w-3 shrink-0" /> {msg}
    </p>
  )
}

// ─── Form fields ──────────────────────────────────────────────────────────────

function AiFormFields({ form, patch }: { form: AiFormState; patch: (p: Partial<AiFormState>) => void }) {
  const { allCourses } = useAllCourses()
  const { data: evalTopics, isLoading, error, refetch } = useTopics();
  const { submitTopic, isSubmitting, submitError } = useCreateTopic();
  const { addSubtopic, isAdding, addError } = useAddSubtopic();

  useEffect(() => {
    if (!isSubmitting) {
      refetch()
    }
  }, [isSubmitting])

  const totalCount = Object.values(form.difficultyCounts).reduce((s, n) => s + n, 0)
  const selectedTopic = evalTopics?.find(t => t.name === form.topic)
  const predefinedSubtopics = form.topicMode === 'existing' ? (selectedTopic?.subtopic ? Object.values(selectedTopic.subtopic) : []) : []
  const customSubtopics = form.subtopics.filter(s => !predefinedSubtopics.includes(s))

  const patchCount = (d: string, val: number) =>
    patch({ difficultyCounts: { ...form.difficultyCounts, [d]: Math.max(0, Math.min(20, val)) } })

  const selectExistingTopic = (t: string) => patch({ topic: t, subtopics: [], subtopicError: '' })

  const togglePredefined = (s: string) => {
    const sel = form.subtopics.includes(s)
    patch({ subtopics: sel ? form.subtopics.filter(x => x !== s) : [...form.subtopics, s] })
  }

  const addCustomSubtopic = async () => {
    const v = form.subtopicInput.trim()
    if (!v) return

    const existing = [...predefinedSubtopics, ...form.subtopics].find(s => normalise(s) === normalise(v))
    if (existing) {
      patch({ subtopicError: `"${existing}" is already in the list` })
      return
    }

    // Existing topic selected -> persist via API
    if (form.topicMode === 'existing' && form.topic) {
      const result = await addSubtopic(+form.topic, { subtopic: v })

      if (!result) {
        patch({ subtopicError: addError ?? 'Failed to add subtopic' })
        return
      }

      patch({ subtopics: [...form.subtopics, v], subtopicInput: '', subtopicError: '' })
      refetch() // pull fresh subtopic list so the new one shows as "predefined" next time
      return
    }

    // New/custom topic not yet created -> keep local only, will be sent on topic creation
    patch({ subtopics: [...form.subtopics, v], subtopicInput: '', subtopicError: '' })
  }
  const removeSubtopic = (s: string) => patch({ subtopics: form.subtopics.filter(x => x !== s) })
  return (
    <div className="flex flex-col gap-5">

      {/* Domain */}
      <div>
        <Label className='flex'>Domain</Label>
        <SearchableSelect
          value={form.domain}
          onValueChange={(d) => patch({ domain: d })}
          options={allCourses?.map((c: any) => ({
            label: c.name || c.id.toString(),
            value: c.name || c.id.toString(),
            id: c.id
          })) || []}
          placeholder="Select a domain..."
          searchPlaceholder="Search domains..."
        />
      </div>

      {/* Topic */}
      <div>
        <Label className='flex'>Topic</Label>
        {form.topicMode === 'existing' ? (
          <>
            <div className="flex gap-2">
              <div className="flex-1 min-w-0">
                <SearchableSelect
                  value={form.topic}
                  onValueChange={selectExistingTopic}
                  options={evalTopics?.map((t: any) => ({
                    label: t.name,
                    value: t.id.toString(), // unique, not name
                    id: t.id
                  })) || []}
                  placeholder="Select a topic..."
                  searchPlaceholder="Search topics..."
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
                onClick={() => patch({ topicMode: 'custom', subtopics: [], subtopicError: '' })}
              >
                + New topic
              </Button>
            </div>
            {selectedTopic?.description && (
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {selectedTopic.description}
              </p>
            )}
          </>
        ) : (
          <Card className="bg-muted/40">
            <CardContent className="p-3.5">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-sm font-semibold">New topic</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => patch({ topicMode: 'existing', subtopics: [], subtopicError: '', customTopic: '', customTopicDesc: '' })}
                >
                  ← Use existing
                </Button>
              </div>
              <Input
                className="mb-2 bg-background"
                value={form.customTopic}
                onChange={e => patch({ customTopic: e.target.value })}
                placeholder="Topic name, e.g. TypeScript Generics, SQL Joins…"
              />
              <Textarea
                className="min-h-[52px] bg-background"
                value={form.customTopicDesc}
                onChange={e => patch({ customTopicDesc: e.target.value })}
                placeholder="Description — what does this topic cover? (helps other SMEs understand scope)"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className='flex mt-2'
                onClick={() => submitTopic({ name: form.customTopic, description: form.customTopicDesc, subtopic: {} })}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create topic'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Subtopics */}
      <div>
        <Label className='flex'>
          Subtopics / Concepts <span className="text-[12.5px]"> —optional</span>
        </Label>

        {(predefinedSubtopics.length > 0 || customSubtopics.length > 0) && (
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {predefinedSubtopics.map(s => {
              const sel = form.subtopics.includes(s)
              return (
                <Button
                  key={s}
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => togglePredefined(s)}
                  className={cn(
                    'h-auto rounded-full px-3 py-1 text-xs font-semibold',
                    sel && 'border-primary bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
                  )}
                >
                  {sel && <Check className="mr-1 h-2.5 w-2.5" />}{s}
                </Button>
              )
            })}
            {customSubtopics.map(s => (
              <Badge
                key={s}
                variant="outline"
                className="gap-1.5 rounded-full border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
              >
                {s}
                <button type="button" onClick={() => removeSubtopic(s)} className="flex items-center text-primary">
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Input
            className="flex-1"
            value={form.subtopicInput}
            onChange={e => patch({ subtopicInput: e.target.value, subtopicError: '' })}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomSubtopic() } }}
            placeholder={predefinedSubtopics.length > 0 ? 'Add a subtopic not in the list above…' : 'Type a subtopic and press Enter…'}
          />
          <Button className='mt-2' type="button" onClick={addCustomSubtopic} disabled={!form.subtopicInput.trim()}>
            Add
          </Button>
        </div>
        <FieldError msg={form.subtopicError} />
      </div>

      {/* Difficulty */}
      <div>
        <Label className='flex'>Difficulty &amp; question count</Label>
        <div className="flex flex-col gap-2">
          {DIFFICULTIES.map(d => {
            const cnt = form.difficultyCounts[d] ?? 0
            const active = cnt > 0
            const DIFF_LABEL: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }
            const DIFF_DESC: Record<Difficulty, string> = {
              easy: 'Recall & basic comprehension',
              medium: 'Application & analysis',
              hard: 'Evaluation & synthesis',
            }
            const DIFF_ROW: Record<Difficulty, string> = {
              easy: 'border-emerald-300 bg-emerald-50',
              medium: 'border-amber-300 bg-amber-50',
              hard: 'border-red-300 bg-red-50',
            }
            return (
              <div
                key={d}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-4 py-2.5 transition-colors',
                  active ? DIFF_ROW[d] : 'border-border bg-background'
                )}
              >
                <span className={cn('w-14 shrink-0 text-sm font-bold', !active && 'text-muted-foreground')}>
                  {DIFF_LABEL[d]}
                </span>
                <span className={cn('flex-1 text-xs', !active && 'text-muted-foreground')}>
                  {DIFF_DESC[d]}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button" size="icon" variant="outline" className="h-7 w-7"
                    disabled={cnt <= 0} onClick={() => patchCount(d, cnt - 1)}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-7 text-center text-lg font-bold">{cnt}</span>
                  <Button
                    type="button" size="icon" variant="outline" className="h-7 w-7"
                    disabled={cnt >= 20} onClick={() => patchCount(d, cnt + 1)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
          <p className="pr-0.5 text-right text-xs text-muted-foreground">
            Total: <strong className={totalCount > 0 ? 'text-foreground' : ''}>{totalCount}</strong> question{totalCount !== 1 ? 's' : ''} · max 20 per difficulty
          </p>
        </div>
      </div>

      {/* Course content */}
      <div>
        <FieldLabel>
          Course content <span className="font-normal normal-case tracking-normal">— recommended · paste lesson text to make questions specific to your curriculum</span>
        </FieldLabel>
        <Textarea
          className="min-h-[80px] font-mono text-xs"
          value={form.reference}
          onChange={e => patch({ reference: e.target.value })}
          placeholder="Paste lesson notes, slide text, documentation excerpts, or any reference content here."
        />
      </div>

      {/* Bloom's level */}
      <div>
        <FieldLabel>
          Cognitive level <span className="font-normal normal-case tracking-normal">(Bloom&apos;s taxonomy)</span>
        </FieldLabel>
        <ToggleGroup
          type="single"
          value={form.bloomLevel}
          onValueChange={v => v && patch({ bloomLevel: v })}
          className="grid grid-cols-3 gap-1.5"
        >
          {BLOOMS.map(b => (
            <ToggleGroupItem
              key={b.id}
              value={b.id}
              className={cn(
                'h-auto flex-col items-start whitespace-normal rounded-lg border-2 px-2.5 py-2 text-left',
                BLOOM_CLASSES[b.id]
              )}
            >
              <span className="text-[13px] font-bold">{b.label}</span>
              <span className="mt-0.5 text-[11px] font-normal opacity-80">{b.hint}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          &ldquo;Apply&rdquo; is a good default for most assessment questions. Use &ldquo;Remember&rdquo; for recall drills or &ldquo;Analyze&rdquo; for advanced problem-solving.
        </p>
      </div>

      {/* Learning objective */}
      <div>
        <FieldLabel>
          Learning objective <span className="font-normal normal-case tracking-normal">(optional)</span>
        </FieldLabel>
        <Textarea
          className="min-h-[56px]"
          value={form.objective}
          onChange={e => patch({ objective: e.target.value })}
          placeholder="e.g., Learner can distinguish between var, let, and const and predict output in edge cases — the more specific, the better the AI output."
        />
      </div>
    </div>
  )
}

// ─── Bare page wrapper ─────────────────────────────────────────────────────────
// Just holds form state and a submit handler — no modal, no mock generation,
// no question bank store. Wire onSubmit up to your real API call.

export default function AiQuestionFormPage() {
  const [form, setForm] = useState<AiFormState>(DEFAULT_AI_FORM)
  const patch = (p: Partial<AiFormState>) => setForm(prev => ({ ...prev, ...p }))

  const { generateQuestions, isGenerating } = useGenerateQuestions();

  const activeTopic = form.topicMode === 'custom' ? form.customTopic.trim() : form.topic
  const totalCount = Object.values(form.difficultyCounts).reduce((s, n) => s + n, 0)
  const canSubmit = activeTopic.length > 0 && totalCount >= 1 && !isGenerating

  const handleSubmit = async () => {
    const calcPct = (val: number) => totalCount > 0 ? Math.round((val / totalCount) * 100) : 0
    const counts = {
      easy: form.difficultyCounts.easy || 0,
      medium: form.difficultyCounts.medium || 0,
      hard: form.difficultyCounts.hard || 0
    }

    const payload = {
      domainName: form.domain || "Web Development",
      topicName: activeTopic,
      topicDescription: form.topicMode === 'custom' ? form.customTopicDesc : "",
      subtopics: form.subtopics,
      numberOfQuestions: totalCount,
      learningObjectives: form.objective,
      targetAudience: "Beginner students",
      focusAreas: form.reference || "Focus on calling REST APIs",
      bloomsLevel: form.bloomLevel,
      questionStyle: "practical",
      difficultyDistribution: {
        easy: calcPct(counts.easy),
        medium: calcPct(counts.medium),
        hard: calcPct(counts.hard)
      },
      questionCounts: counts,
      topics: { [activeTopic]: totalCount },
      topicConfigurations: [
        {
          topicName: activeTopic,
          topicDescription: form.topicMode === 'custom' ? form.customTopicDesc : "",
          subtopics: form.subtopics,
          totalQuestions: totalCount,
          questionCounts: counts,
        },
      ],
      levelId: null,
    }

    const result = await generateQuestions(payload)
    if (result) {
      console.log('Generated:', result)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-1 flex text-2xl font-bold">Add questions to bank</h1>
      <span className="mb-6 block text-left text-sm text-muted-foreground">
        AI questions enter a{" "}
        <span className="text-secondary text-[12px]">Pending review</span>{" "}
        queue — an SME must approve them before they appear in assessment pools.
      </span>
      <AiFormFields form={form} patch={patch} />

      <div className="mt-6 flex w-full border-t pt-4">
        <Button
          type="button"
          className=" w-full h-12 font-semibold text-white "
          disabled={!canSubmit}
          onClick={handleSubmit}
          variant={'secondary'}
        >
          {isGenerating ? 'Generating...' : `Generate ${totalCount} question${totalCount !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  )
}