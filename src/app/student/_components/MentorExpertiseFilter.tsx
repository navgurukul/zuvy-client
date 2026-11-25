"use client"

import { useMemo, useState } from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import type { MentorSkill } from "@/app/student/hooks/hookTypes"

type MentorExpertiseDropdownProps = {
  /** Skills from GET /student/mentors/skills?inUse=true (loaded once by the page) */
  skills: MentorSkill[]
  loading?: boolean
  error?: string | null
  /** Selected skill slugs, sent as /student/mentors?expertise=<slug,slug> */
  selected: string[]
  onChange: (next: string[]) => void
  className?: string
}

const isSelected = (selected: string[], slug: string) => selected.includes(slug)

/**
 * Searchable multi-select of mentor skills. The search box narrows the skill
 * list that was loaded once on mount; picking skills filters the mentors via
 * /student/mentors?expertise=<slugs>.
 */
export function MentorExpertiseDropdown({
  skills,
  loading = false,
  error = null,
  selected,
  onChange,
  className,
}: MentorExpertiseDropdownProps) {
  const [open, setOpen] = useState(false)
  const [skillSearch, setSkillSearch] = useState("")

  const visibleSkills = useMemo(() => {
    const term = skillSearch.trim().toLowerCase()
    if (!term) return skills
    return skills.filter(
      (skill) => skill.name.toLowerCase().includes(term) || skill.slug.includes(term)
    )
  }, [skills, skillSearch])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) setSkillSearch("")
  }

  const toggleSkill = (slug: string) => {
    onChange(
      isSelected(selected, slug)
        ? selected.filter((item) => item !== slug)
        : [...selected, slug]
    )
  }

  const label =
    selected.length === 0
      ? "Filter by expertise"
      : `${selected.length} skill${selected.length === 1 ? "" : "s"} selected`

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-56",
            selected.length > 0 && "border-green-300 dark:border-green-800",
            className
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(18rem,calc(100vw-2rem))] p-0 text-left">
        {/* shouldFilter={false}: visibleSkills is already narrowed by the search box */}
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search skills..."
            value={skillSearch}
            onValueChange={setSkillSearch}
          />
          <CommandList className="max-h-64">
            {loading && skills.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">Loading skills...</p>
            ) : error ? (
              <p className="px-3 py-4 text-center text-sm text-destructive">{error}</p>
            ) : (
              <>
                {visibleSkills.length === 0 && (
                  <p className="px-3 py-4 text-center text-sm text-muted-foreground">No skills found.</p>
                )}
                <CommandGroup>
                  {visibleSkills.map((skill) => {
                    const checked = isSelected(selected, skill.slug)
                    return (
                      <CommandItem
                        key={skill.slug}
                        value={skill.slug}
                        onSelect={() => toggleSkill(skill.slug)}
                        className="flex cursor-pointer items-center gap-2 text-left text-foreground aria-selected:bg-muted aria-selected:text-foreground"
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                            checked
                              ? "border-green-800 bg-green-800 text-white dark:border-green-600 dark:bg-green-600"
                              : "border-muted-foreground/40"
                          )}
                        >
                          {checked && <Check className="h-3 w-3" />}
                        </span>
                        <span className="flex-1 truncate">{skill.name}</span>
                        {skill.mentorCount !== null && (
                          <span className="text-xs text-muted-foreground">{skill.mentorCount}</span>
                        )}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
          {selected.length > 0 && (
            <div className="border-t border-border p-1">
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Clear selection
              </button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}

type MentorExpertiseChipsProps = {
  skills: MentorSkill[]
  selected: string[]
  /** Selected skill slugs */
  onRemove: (slug: string) => void
  onClearAll: () => void
}

/** "Filter by expertise" row: one removable chip per selected skill. */
export function MentorExpertiseChips({ skills, selected, onRemove, onClearAll }: MentorExpertiseChipsProps) {
  if (selected.length === 0) return null

  const findSkill = (slug: string) => skills.find((skill) => skill.slug === slug)

  return (
    <div className="space-y-2 text-left">
      <p className="text-sm font-semibold text-foreground">Filter by expertise</p>
      <div className="flex flex-wrap items-center gap-2">
        {selected.map((slug) => {
          const skill = findSkill(slug)
          const name = skill?.name ?? slug
          const count = skill?.mentorCount ?? null
          return (
            <span
              key={slug}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-card py-1.5 pl-3.5 pr-2 text-sm text-foreground"
            >
              <span className="truncate">{name}</span>
              {count !== null && <span className="text-xs text-muted-foreground">{count}</span>}
              <button
                type="button"
                onClick={() => onRemove(slug)}
                aria-label={`Remove ${name} filter`}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )
        })}
        {selected.length > 1 && (
          <button
            type="button"
            onClick={onClearAll}
            className="px-1 text-sm font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  )
}
