"use client"
import { useMemo, useState, useEffect } from "react"
import { Calendar, Clock, AlertTriangle, Lock, Trash2, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from '@/components/ui/use-toast'
import { useMyMentorSlots } from "@/hooks/useMyMentorSlots"
import { useCreateMentorSlot } from "@/hooks/useCreateMentorSlot"
import { useDeleteMentorSlot } from "@/hooks/useDeleteMentorSlot"
import { api } from '@/utils/axios.config'

const durationOptions = [30, 45, 60, 90]
const minimumDeleteLeadTimeMs = 12 * 60 * 60 * 1000
const defaultStartTime = "09:00"
const defaultDurationMinutes = "60"

const getDefaultSlotDate = () => new Date().toISOString().slice(0, 10)

const startTimeOptions = Array.from({ length: 32 }, (_, index) => {
  const totalMinutes = 6 * 60 + index * 30
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
})

const formatLocalDate = (dateTime: string) =>
  new Date(dateTime).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })

const formatLocalTimeRange = (start: string, end: string) => {
  const startLabel = new Date(start).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
  const endLabel = new Date(end).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  return `${startLabel} — ${endLabel}`
}

const formatDuration = (durationMinutes: number) => {
  if (durationMinutes % 60 === 0) {
    const hours = durationMinutes / 60
    return `${hours} hr`
  }

  return `${durationMinutes} min`
}

const getTimeLabel = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

const getStatusLabel = (status: string) => {
  const normalized = status.toLowerCase()

  if (normalized === "available") return "Open"
  if (normalized === "booked") return "Booked"
  return status
}

const combineDateAndTime = (date: string, time: string): Date | null => {
  if (!date || !time) return null

  const [hours, minutes] = time.split(":").map(Number)
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime()) || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null
  }

  parsedDate.setHours(hours, minutes, 0, 0)
  return parsedDate
}

export default function AvailabilityPage() {
  const { slots, loading, error, refetchMySlots, upsertMySlot } = useMyMentorSlots()
  const { isCreating, error: createError, createSlot } = useCreateMentorSlot()
  const {
    isDeleting,
    deletingSlotId,
    error: deleteError,
    message: deleteMessage,
    deleteSlot,
  } = useDeleteMentorSlot()

  const [slotDate, setSlotDate] = useState<string>(
    getDefaultSlotDate()
  )
  const [startTime, setStartTime] = useState<string>(defaultStartTime)
  const [durationMinutes, setDurationMinutes] = useState<string>(defaultDurationMinutes)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [removeError, setRemoveError] = useState<string | null>(null)
  const [isGoogleConnecting, setIsGoogleConnecting] = useState(false)

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token") || localStorage.getItem("token")
      : null


  const handleGoogleConnect = () => {
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken")

    if (!token) {
      toast.error({
        title: "Error",
        description: "Token not found. Please login again.",
      })
      return
    }

    setIsGoogleConnecting(true)

    // Direct redirect wi/mentor-sessions/myth token (THIS IS THE FIX)
    const currentPage = encodeURIComponent(window.location.href)

    const API_BASE = process.env.NEXT_PUBLIC_MAIN_URL;

    window.location.href =
      `${API_BASE}/google/connect?token=${token}&redirectUrl=${currentPage}`;

  }

  useEffect(() => {
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)

    const success = params.get("success")
    const error = params.get("error")

    if (success === "true") {
      toast.success({
        title: "Success",
        description: "Google Calendar connected successfully.",
      })
    }

    if (error) {
      setFormError("Google connection failed")
    }
  }, [])

  const sortedSlots = useMemo(
    () =>
      [...slots].sort(
        (a, b) =>
          new Date(a.slotStartDateTime).getTime() -
          new Date(b.slotStartDateTime).getTime()
      ),
    [slots]
  )

  const openSlotsCount = useMemo(
    () => sortedSlots.filter((slot) => slot.status.toLowerCase() === "available").length,
    [sortedSlots]
  )

  const bookedSlotsCount = useMemo(
    () => sortedSlots.filter((slot) => slot.currentBookedCount > 0).length,
    [sortedSlots]
  )

  const proposedStart = useMemo(
    () => combineDateAndTime(slotDate, startTime),
    [slotDate, startTime]
  )

  const proposedEnd = useMemo(() => {
    if (!proposedStart) return null

    const parsedDuration = Number(durationMinutes)
    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) return null

    return new Date(proposedStart.getTime() + parsedDuration * 60 * 1000)
  }, [durationMinutes, proposedStart])

  const overlappingSlot = useMemo(() => {
    if (!proposedStart || !proposedEnd) return null

    return (
      sortedSlots.find((slot) => {
        const existingStart = new Date(slot.slotStartDateTime)
        const existingEnd = new Date(slot.slotEndDateTime)

        return proposedStart < existingEnd && proposedEnd > existingStart
      }) || null
    )
  }, [proposedStart, proposedEnd, sortedSlots])

  const handleCreateSlot = async () => {
    setFormError(null)
    setSuccessMessage(null)

    if (!proposedStart || !proposedEnd) {
      setFormError("Please select valid date, time, and duration.")
      return
    }

    if (proposedStart <= new Date()) {
      setFormError("Start must not be in the past.")
      return
    }

    if (proposedEnd <= proposedStart) {
      setFormError("End must be greater than start.")
      return
    }

    if (overlappingSlot) {
      setFormError("This slot overlaps with an existing slot.")
      return
    }

    const creationResult = await createSlot({
      slotStartDateTime: proposedStart.toISOString(),
      slotEndDateTime: proposedEnd.toISOString(),
      durationMinutes: Number(durationMinutes),
    })

    if (creationResult.success) {
      const createdSlot = creationResult.slot

      if (createdSlot) {
        upsertMySlot({
          id: createdSlot.id,
          slotStartDateTime: createdSlot.slotStartDateTime,
          slotEndDateTime: createdSlot.slotEndDateTime,
          durationMinutes: createdSlot.durationMinutes,
          maxCapacity: createdSlot.maxCapacity,
          currentBookedCount: createdSlot.currentBookedCount,
          status: createdSlot.status,
        })
      }
      toast.success({
        title: "Success",
        description: "Slot created successfully.",
      })
      setRemoveError(null)
      setSlotDate(getDefaultSlotDate())
      setStartTime(defaultStartTime)
      setDurationMinutes(defaultDurationMinutes)
      void refetchMySlots()
    } else {
      toast.error({
        title: "Failed",
        description: createError || "Failed to create slot.",
      })
    }
  }

  const hasBookings = (status: string, currentBookedCount: number) => {
    const normalizedStatus = status.toLowerCase()
    return currentBookedCount > 0 || normalizedStatus === "booked"
  }

  const canDeleteSlot = (
    slotStartDateTime: string,
    status: string,
    currentBookedCount: number
  ) => {
    if (hasBookings(status, currentBookedCount)) {
      return false
    }

    const slotStartMs = new Date(slotStartDateTime).getTime()
    return slotStartMs - Date.now() >= minimumDeleteLeadTimeMs
  }

  const getDeleteBlockReason = (
    slotStartDateTime: string,
    status: string,
    currentBookedCount: number
  ) => {
    if (hasBookings(status, currentBookedCount)) {
      return "Booked slots cannot be removed."
    }

    if (!canDeleteSlot(slotStartDateTime, status, currentBookedCount)) {
      return "Slot can be removed only if start time is at least 12 hours away."
    }

    return null
  }

  const handleRemoveSlot = async (
    slotId: number,
    slotStartDateTime: string,
    status: string,
    currentBookedCount: number
  ) => {
    setFormError(null)
    setSuccessMessage(null)
    setRemoveError(null)

    const blockReason = getDeleteBlockReason(
      slotStartDateTime,
      status,
      currentBookedCount
    )

    if (blockReason) {
      setRemoveError(blockReason)
      toast.warning({
        title: "Cannot remove slot",
        description: blockReason,
      })
      return
    }

    const removed = await deleteSlot(slotId)
    if (removed) {
      toast.success({
        title: "Success",
        description: deleteMessage || "Slot removed successfully.",
      })
      await refetchMySlots()
    } else {
      toast.error({
        title: "Failed",
        description: deleteError || "Failed to remove slot.",
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-left">
          <h1 className="text-xl font-semibold">Availability</h1>
          <p className="text-sm text-muted-foreground">
            {openSlotsCount} open slots · {bookedSlotsCount} booked
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <Card className="rounded-2xl">
          <CardHeader className="text-left">
            <CardTitle>Create New Slot</CardTitle>
            <p className="text-sm text-muted-foreground">
              Define when you&apos;re available — learners will see this as a bookable time.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-left">
              <label className="text-sm font-medium">Date *</label>
              <Input
                type="date"
                className="mt-1"
                value={slotDate}
                onChange={(event) => setSlotDate(event.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-left">
                <label className="text-sm font-medium">Start Time *</label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {startTimeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {getTimeLabel(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-left">
                <label className="text-sm font-medium">Duration *</label>
                <Select value={durationMinutes} onValueChange={setDurationMinutes}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {formatDuration(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {overlappingSlot && (
              <div className="border border-red-300 bg-red-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-red-500 text-left">
                  CONFLICT DETECTED
                </p>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={14} />
                  {formatLocalDate(overlappingSlot.slotStartDateTime)}
                </div>

                <div className="flex items-center gap-2 text-sm text-red-600">
                  <Clock size={14} />
                  {formatLocalTimeRange(
                    overlappingSlot.slotStartDateTime,
                    overlappingSlot.slotEndDateTime
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-100 rounded-lg p-2">
                  <AlertTriangle size={14} />
                  Overlaps with an existing slot
                </div>
              </div>
            )}

            {formError && <p className="text-sm text-red-500 text-left">{formError}</p>}
            {createError && <p className="text-sm text-red-500 text-left">{createError}</p>}
            {successMessage && (
              <p className="text-sm text-green-700 text-left">{successMessage}</p>
            )}
            {removeError && (
              <p className="text-sm text-red-500 text-left">{removeError}</p>
            )}
            {deleteError && (
              <p className="text-sm text-red-500 text-left">{deleteError}</p>
            )}

            <Button
              className="w-full bg-green-800 hover:bg-green-900"
              onClick={handleCreateSlot}
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "+ Confirm & Create Slot"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              You can create multiple slots in a row — each one is immediately visible to learners.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-2xl text-left">
            <CardHeader>
              <CardTitle>Calendar Sync</CardTitle>
              <div className="border rounded-xl bg-white p-3 flex items-start gap-2">
                <Info size={16} className="text-gray-500 mt-0.5" />
                <p className="text-sm text-gray-600 text-left">
                  Please connect your Google Calendar before creating a slot.
                </p>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleConnect}
                disabled={isGoogleConnecting || !token}
              >
                {isGoogleConnecting ? "Connecting..." : "Connect Google Calendar"}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl text-left">
            <CardHeader>
              <CardTitle>Your Availability</CardTitle>
              <p className="text-sm text-muted-foreground ">
                {openSlotsCount} open · {bookedSlotsCount} booked
              </p>
            </CardHeader>

            {/* <CardContent className="space-y-4"> */}
            <CardContent className="space-y-4 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
              {loading && (
                <p className="text-sm text-muted-foreground">Loading slots...</p>
              )}

              {!loading && error && <p className="text-sm text-red-500">{error}</p>}

              {!loading && !error && sortedSlots.length === 0 && (
                <p className="text-sm text-muted-foreground">No slots created yet.</p>
              )}

              {!loading &&
                !error &&
                sortedSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex justify-between items-center border rounded-lg p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {formatLocalDate(slot.slotStartDateTime)}
                      </p>

                      <div className="flex items-center gap-2 font-medium">
                        <Clock size={14} />
                        {formatLocalTimeRange(
                          slot.slotStartDateTime,
                          slot.slotEndDateTime
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {formatDuration(slot.durationMinutes)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">

                      <Badge
                        className={
                          slot.status.toLowerCase() === "available"
                            ? "bg-green-100 text-green-700 hover:bg-green-100 hover:text-green-700"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-100 hover:text-blue-700"
                        }
                      >
                        {getStatusLabel(slot.status)}
                      </Badge>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-red-600"
                        onClick={() =>
                          handleRemoveSlot(
                            slot.id,
                            slot.slotStartDateTime,
                            slot.status,
                            slot.currentBookedCount
                          )
                        }
                        disabled={
                          isDeleting ||
                          !canDeleteSlot(
                            slot.slotStartDateTime,
                            slot.status,
                            slot.currentBookedCount
                          )
                        }
                      >
                        {isDeleting && deletingSlotId === slot.id ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl text-left">
            <CardHeader>
              <CardTitle>Legend</CardTitle>
            </CardHeader>

            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 hover:text-green-700">Open</Badge>
                Learners can book this slot
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 hover:text-blue-700">Booked</Badge>
                A learner has reserved this slot
              </div>

              <div className="flex items-center gap-2">
                <Lock className="h-3 w-3 text-text-muted shrink-0" />
                <p className="text-xs text-text-muted">Booked slots cannot be deleted</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
