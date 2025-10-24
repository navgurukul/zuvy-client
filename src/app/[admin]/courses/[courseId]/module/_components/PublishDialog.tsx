;`use client`

import React, { useState, useMemo, useEffect } from 'react'
import { format, addDays, parseISO } from 'date-fns'
import { CalendarIcon, X } from 'lucide-react'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
    PublishData,
    PublishAssessmentDialogs,
} from '@/app/[admin]/courses/[courseId]/module/_components/ModuleComponentType'

// Helper function to parse ISO string to Date and time string (HH:mm)
const parseIsoToDateAndTime = (isoString?: string | null) => {
    // Allow null for isoString
    if (isoString) {
        // This check handles undefined and null correctly (both are falsy)
        try {
            const dateObj = parseISO(isoString)
            return {
                date: dateObj,
                time: format(dateObj, 'HH:mm'),
            }
        } catch (e) {
            // Invalid date string
            return { date: new Date(), time: '' }
        }
    }
    return { date: new Date(), time: '' } // Default if no string provided
}

const PublishAssessmentDialog: React.FC<PublishAssessmentDialogs> = ({
    onSave,
    currentAssessmentStatus, // Destructured
    initialPublishDate, // Destructured
    initialStartDate, // Destructured
    initialEndDate, // Destructured
}) => {
    // const [isOpen, setIsOpen] = useState(false); // No longer needed, parent controls visibility
    const [tab, setTab] = useState<'schedule' | 'now' | 'draft'>('schedule') // Added 'draft'

    // Initialize state with props or defaults
    const [publishDate, setPublishDate] = useState<Date>(
        parseIsoToDateAndTime(initialPublishDate).date
    )
    const [startDate, setStartDate] = useState<Date>(
        parseIsoToDateAndTime(initialStartDate).date
    )
    const [endDate, setEndDate] = useState<Date>(
        parseIsoToDateAndTime(initialEndDate).date
    )
    const [endNowDate, setEndNowDate] = useState<Date>(
        parseIsoToDateAndTime(initialEndDate).date
    ) // Also use initialEndDate for this

    const [publishTime, setPublishTime] = useState(
        parseIsoToDateAndTime(initialPublishDate).time
    )
    const [startTime, setStartTime] = useState(
        parseIsoToDateAndTime(initialStartDate).time
    )
    const [endTime, setEndTime] = useState(
        parseIsoToDateAndTime(initialEndDate).time
    )
    const [endNowTime, setEndNowTime] = useState(
        parseIsoToDateAndTime(initialEndDate).time
    ) // And for this

    const [errors, setErrors] = useState<{
        publishTime?: string
        startTime?: string
        endTime?: string
        endNowTime?: string
        scheduleAction?: string // For general schedule validation errors
    }>({})

    const [scheduleCalendarOpen, setScheduleCalendarOpen] = useState<boolean[]>(
        [false, false, false]
    )
    const [endNowCalendarOpen, setEndNowCalendarOpen] = useState<boolean>(false)

    // Effect to update states if initial props change after mount (e.g. parent re-renders with new data)
    useEffect(() => {
        const pub = parseIsoToDateAndTime(initialPublishDate)
        setPublishDate(pub.date)
        setPublishTime(pub.time)

        const start = parseIsoToDateAndTime(initialStartDate)
        setStartDate(start.date)
        setStartTime(start.time)

        const end = parseIsoToDateAndTime(initialEndDate)
        setEndDate(end.date)
        setEndTime(end.time)
        setEndNowDate(end.date) // Keep endNowDate in sync with initialEndDate too
        setEndNowTime(end.time)
    }, [initialPublishDate, initialStartDate, initialEndDate])

    const disablePastDates = (date: Date) => date < addDays(new Date(), -1)

    const combineDateTime = (date: Date, time: string): Date => {
        const [hours, minutes] = time.split(':').map(Number)
        // Create a new Date object using local year, month, day from the 'date' object,
        // and local hours, minutes from the 'time' string.
        const newDateTime = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            hours,
            minutes,
            0,
            0
        )
        return newDateTime
    }

    const validateTime = (
        publishTimeStr: string,
        startTimeStr: string,
        endTimeStr: string
    ) => {
        const now = new Date()

        let currentPublishTimeError: string | undefined = undefined
        let currentStartTimeError: string | undefined = undefined
        let currentEndTimeError: string | undefined = undefined
        let currentScheduleActionError: string | undefined = undefined

        const publishDateTime =
            publishDate && publishTimeStr
                ? combineDateTime(publishDate, publishTimeStr)
                : null
        const startDateTime =
            startDate && startTimeStr
                ? combineDateTime(startDate, startTimeStr)
                : null
        const endDateTime =
            endDate && endTimeStr ? combineDateTime(endDate, endTimeStr) : null

        // Publish Time Validations
        if (publishDateTime) {
            if (publishDateTime < now) {
                currentPublishTimeError = 'Publish time cannot be in the past'
            }
            // This rule can override the previous one for publishTime if both conditions are met.
            if (startDateTime && publishDateTime > startDateTime) {
                currentPublishTimeError =
                    'Publish time cannot be after start time'
            }
        }

        // Start Time Validations
        if (startDateTime) {
            if (startDateTime < now) {
                currentStartTimeError =
                    'Start date and time cannot be in the past'
            }
        }

        // Rule: If publish date/time is provided, start date/time is mandatory
        if (publishDateTime && !startDateTime) {
            const msg =
                'Start date and time are required if publish date and time are set.'
            currentStartTimeError = currentStartTimeError || msg // Keep existing specific startTime error or use this one
            currentScheduleActionError = msg
        }

        // End Time Validations
        if (endDateTime) {
            if (startDateTime && endDateTime < startDateTime) {
                currentEndTimeError = 'End time cannot be before start time'
            }
            // This rule can override the previous one for endTime.
            if (publishDateTime && endDateTime < publishDateTime) {
                currentEndTimeError = 'End time cannot be before publish time'
            }
        }

        setErrors((prevErrors) => ({
            ...prevErrors, // Preserve other errors like endNowTime
            publishTime: currentPublishTimeError,
            startTime: currentStartTimeError,
            endTime: currentEndTimeError,
            scheduleAction: currentScheduleActionError,
        }))

        return !(
            currentPublishTimeError ||
            currentStartTimeError ||
            currentEndTimeError ||
            currentScheduleActionError
        )
    }

    const validateNowEndTime = (date: Date, time: string) => {
        const now = new Date()
        const endDateTime = time ? combineDateTime(date, time) : null
        if (!time) {
            // If time is cleared, remove the error
            setErrors((prev) => ({ ...prev, endNowTime: undefined }))
            return true
        } else if (endDateTime && endDateTime <= now) {
            setErrors((prev) => ({
                ...prev,
                endNowTime: 'End time must be after current time',
            }))
            return false
        } else {
            // If time is valid, remove the error
            setErrors((prev) => ({ ...prev, endNowTime: undefined }))
            return true
        }
    }

    const handleScheduleAssessment = () => {
        setErrors({}) // Clear previous errors
        if (!validateTime(publishTime, startTime, endTime)) {
            // Validation failed, errors are set by validateTime
            return
        }
        // Additional check for Rule 4 specifically for the button action
        if (publishDate && publishTime && (!startDate || !startTime)) {
            setErrors((prev) => ({
                ...prev,
                scheduleAction:
                    'Start date and time are required if publish date and time are set.',
                startTime: 'Required when publish date/time is set.',
            }))
            return
        }

        const scheduleData: PublishData = {
            action: 'schedule',
            publishDateTime:
                publishDate && publishTime
                    ? combineDateTime(publishDate, publishTime).toISOString()
                    : undefined,
            startDateTime:
                startDate && startTime
                    ? combineDateTime(startDate, startTime).toISOString()
                    : undefined,
            endDateTime:
                endDate && endTime
                    ? combineDateTime(endDate, endTime).toISOString()
                    : undefined,
        }
        onSave(scheduleData)
        // setIsOpen(false); // Close dialog on successful save
    }

    const handlePublishNow = () => {
        setErrors({}) // Clear previous errors
        const nowUtcIso = new Date().toISOString()
        let isValid = true
        let endDateTimeIso: string | undefined = undefined

        if (endNowTime) {
            // End time is optional for publish now
            if (!validateNowEndTime(endNowDate, endNowTime)) {
                isValid = false
                // validateNowEndTime sets the error
            } else {
                endDateTimeIso = combineDateTime(
                    endNowDate,
                    endNowTime
                ).toISOString()
            }
        }

        if (!isValid) return

        const publishNowData: PublishData = {
            action: 'publishNow',
            publishDateTime: nowUtcIso,
            startDateTime: nowUtcIso,
            endDateTime: endDateTimeIso,
        }
        onSave(publishNowData)
        // setIsOpen(false); // Close dialog on successful save
    }

    const handleMoveToDraft = () => {
        const draftData: PublishData = {
            action: 'moveToDraft',
            publishDateTime: null,
            startDateTime: null,
            endDateTime: null,
        }
        onSave(draftData)
        // Dialog close would typically be handled by the parent component after onSave completes
    }

    useEffect(() => {
        // Ensure validation runs if any relevant field has data, changes, or on initial load with props
        validateTime(publishTime, startTime, endTime)
    }, [
        publishDate,
        publishTime,
        startDate,
        startTime,
        endDate,
        endTime,
        initialPublishDate,
        initialStartDate,
        initialEndDate,
    ])

    useEffect(() => {
        // Validate endNowTime if it exists, or clear error if it's removed
        if (endNowTime) {
            validateNowEndTime(endNowDate, endNowTime)
        } else {
            // Explicitly clear error if endNowTime is empty
            setErrors((prev) => ({ ...prev, endNowTime: undefined }))
        }
    }, [endNowDate, endNowTime])

    return (
        <>
            <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-gray-600">
                    Publish
                </DialogTitle>
            </DialogHeader>
            <Tabs
                value={tab}
                onValueChange={(val) =>
                    setTab(val as 'schedule' | 'now' | 'draft')
                } // Added 'draft' to cast
                className={`mt-4 text-left`}
            >
                <TabsList className="flex bg-white border-b-2 justify-start border-gray-300">
                    <div>
                        <TabsTrigger
                            value="schedule"
                            className={`flex-1 mt-1 ${
                                tab === 'schedule'
                                    ? '!text-[rgb(81,134,114)] border-b-green-700 border-b-2 text-bold'
                                    : '!text-[#6E6E6E]'
                            }`}
                        >
                            Schedule for Future
                        </TabsTrigger>
                    </div>
                    <div>
                        <TabsTrigger
                            value="now"
                            className={`flex-1 mt-1 ${
                                tab === 'now'
                                    ? '!text-[rgb(81,134,114)] border-b-green-700 border-b-2 text-bold'
                                    : '!text-[#6E6E6E]'
                            }`}
                        >
                            Publish Now
                        </TabsTrigger>
                    </div>
                    <div>
                        <TabsTrigger
                            value="draft"
                            className={`flex-1 mt-1 ${
                                tab === 'draft'
                                    ? '!text-[rgb(81,134,114)] border-b-green-700 border-b-2 text-bold'
                                    : '!text-[#6E6E6E]'
                            }`}
                        >
                            Move To Draft
                        </TabsTrigger>
                    </div>
                </TabsList>

                <TabsContent value="schedule" className="mt-4 space-y-6">
                    {[
                        {
                            label: 'Publish Date and Time',
                            date: publishDate,
                            setDate: setPublishDate,
                            time: publishTime,
                            setTime: setPublishTime,
                            error: errors.publishTime,
                        },
                        {
                            label: 'Assessment Start Date and Time',
                            date: startDate,
                            setDate: setStartDate,
                            time: startTime,
                            setTime: setStartTime,
                            error: errors.startTime,
                        },
                        {
                            label: 'Assessment End Date and Time',
                            date: endDate,
                            setDate: setEndDate,
                            time: endTime,
                            setTime: setEndTime,
                            error: errors.endTime,
                        },
                    ].map(
                        ({ label, date, setDate, time, setTime, error }, i) => (
                            <div key={i} className="space-y-1">
                                <label className="text-sm text-[#6E6E6E] font-medium block">
                                    {label}
                                </label>
                                <div className="flex items-center gap-4">
                                    {' '}
                                    {/* Changed items-start to items-center */}
                                    <div className="flex-1 mt-2">
                                        <Dialog
                                            open={scheduleCalendarOpen[i]}
                                            onOpenChange={(isOpen) =>
                                                setScheduleCalendarOpen(
                                                    (prev) => {
                                                        const newState = [
                                                            ...prev,
                                                        ]
                                                        newState[i] = isOpen
                                                        return newState
                                                    }
                                                )
                                            }
                                        >
                                            <DialogTrigger asChild>
                                                <Button className="border border-input bg-background hover:border-[rgb(81,134,114)] text-gray-600 w-full justify-start text-left font-normal">
                                                    {date ? (
                                                        format(
                                                            date,
                                                            'dd/MM/yyyy'
                                                        )
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            DD/MM/YYYY
                                                        </span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="w-auto">
                                                <Calendar
                                                    mode="single"
                                                    selected={date}
                                                    onSelect={(selected) => {
                                                        setDate(
                                                            selected ||
                                                                new Date()
                                                        )
                                                        setScheduleCalendarOpen(
                                                            (prev) => {
                                                                const newState =
                                                                    [...prev]
                                                                newState[i] =
                                                                    false
                                                                return newState
                                                            }
                                                        )
                                                    }}
                                                    disabled={disablePastDates}
                                                    initialFocus
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <div className="flex-1">
                                        {' '}
                                        {/* Removed flex flex-col */}
                                        <Input
                                            type="time"
                                            className="w-full flex flex-col"
                                            value={time}
                                            onChange={(e) =>
                                                setTime(e.target.value)
                                            }
                                        />
                                        {error && (
                                            <p className="text-xs text-red-500 leading-snug absolute">
                                                {error}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    )}{' '}
                    {/* scheduleAction error paragraph - kept separate for general form errors */}
                    {errors.scheduleAction && (
                        <p className="text-xs text-red-500 leading-snug absolute">
                            {errors.scheduleAction}
                        </p>
                    )}
                    <div className="flex justify-end gap-2 pt-4">
                        <DialogClose asChild>
                            <Button className="border border-input bg-background hover:border-[rgb(81,134,114)] text-gray-600">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            onClick={handleScheduleAssessment}
                            className="bg-success-dark opacity-75"
                        >
                            Schedule Assessment
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="now" className="mt-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                        The assessment will be published and start immediately.
                        End date and time are optional.
                    </p>
                    <div className="space-y-1">
                        <label className="text-sm font-medium block text-gray-600">
                            Assessment End Date and Time (Optional)
                        </label>
                        <div className="flex justify-start items-center gap-4">
                            {' '}
                            {/* Changed items-start to items-center */}
                            <div className="flex-1 mt-2">
                                <Dialog
                                    open={endNowCalendarOpen}
                                    onOpenChange={setEndNowCalendarOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button className="w-full text-left font-normal border border-input bg-background hover:border-[rgb(81,134,114)] text-gray-600">
                                            {endNowDate ? (
                                                format(endNowDate, 'dd/MM/yyyy')
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    DD/MM/YYYY
                                                </span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="w-auto p-4">
                                        <Calendar
                                            mode="single"
                                            selected={endNowDate}
                                            onSelect={(selectedDate) => {
                                                setEndNowDate(
                                                    selectedDate || new Date()
                                                )
                                                setEndNowCalendarOpen(false)
                                            }}
                                            disabled={disablePastDates}
                                            initialFocus
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <div className="flex-1 relative">
                                <Input
                                    type="time"
                                    className="w-full flex flex-col"
                                    value={endNowTime}
                                    onChange={(e) => {
                                        setEndNowTime(e.target.value)
                                        if (e.target.value)
                                            validateNowEndTime(
                                                endNowDate,
                                                e.target.value
                                            )
                                        else
                                            setErrors((prev) => ({
                                                ...prev,
                                                endNowTime: undefined,
                                            }))
                                    }}
                                />
                                {errors.endNowTime && (
                                    <p className="text-xs text-red-500 leading-snug absolute">
                                        {errors.endNowTime}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <DialogClose asChild>
                            <Button className="border border-input bg-background hover:border-[rgb(81,134,114)] text-gray-600">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            onClick={handlePublishNow}
                            className="bg-success-dark opacity-75"
                        >
                            Publish Assessment
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="draft" className="mt-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Moving this assessment to draft will unpublish it and
                        remove any scheduled dates.
                        {currentAssessmentStatus &&
                            ` The current status is: ${currentAssessmentStatus}. `}
                        Students will no longer be able to access or submit it
                        once it is in a draft state.
                    </p>
                    <p className="text-sm text-gray-600">
                        Clicking the button below will clear its current
                        publish, start, and end dates, reverting it to a draft
                        state.
                    </p>
                    <div className="flex justify-end gap-2 pt-4">
                        <DialogClose asChild>
                            <Button className="border border-input bg-background hover:border-[rgb(81,134,114)] text-gray-600">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            onClick={handleMoveToDraft}
                            variant="destructive"
                        >
                            Move to Draft
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </>
    )
}

export default PublishAssessmentDialog
