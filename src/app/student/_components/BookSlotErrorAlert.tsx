"use client"

import { AlertCircle, CalendarX, Clock, CreditCard } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { BookSlotError, BookSlotErrorCode } from "@/app/student/hooks/hookTypes"
import { cn } from "@/lib/utils"

type AlertStyle = { icon: LucideIcon; box: string; iconColor: string }

// Credits/gap: the student can't book anything yet (amber). Slot problems: pick another slot (red).
const AMBER: Omit<AlertStyle, "icon"> = {
  box: "border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30",
  iconColor: "text-amber-600 dark:text-amber-400",
}
const RED: Omit<AlertStyle, "icon"> = {
  box: "border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30",
  iconColor: "text-red-600 dark:text-red-400",
}

const ALERT_STYLES: Record<BookSlotErrorCode, AlertStyle> = {
  SLOT_TOO_SOON: { icon: Clock, ...RED },
  SLOT_UNAVAILABLE: { icon: CalendarX, ...RED },
  NO_CREDITS: { icon: CreditCard, ...AMBER },
  GAP_ACTIVE: { icon: Clock, ...AMBER },
}

/** POST /student/mentor-slots/book refusal, styled by its code. */
export default function BookSlotErrorAlert({
  error,
  className,
}: {
  error: BookSlotError
  className?: string
}) {
  const style = error.code ? ALERT_STYLES[error.code] : { icon: AlertCircle, ...RED }
  const Icon = style.icon

  return (
    <div
      role="alert"
      className={cn("flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left", style.box, className)}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style.iconColor)} />
      <p className="min-w-0 text-sm leading-relaxed text-foreground">{error.message}</p>
    </div>
  )
}
