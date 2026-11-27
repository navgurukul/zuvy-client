'use client'

import { useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

/**
 * GET /instructor/mentor-slots/licence-check
 * The slot form's check before saving (reserves nothing).
 */
export interface SlotLicenceCheck {
    /** Zoom licence free at that time */
    available: boolean
    nextAvailableAt: string | null
    /** Licence message, e.g. "No Zoom licence is free at this time. The next free time is ..." */
    message: string | null
    /** Licence free AND lead time met */
    canCreate?: boolean
    leadTime?: {
        ok: boolean
        /** e.g. "Slots need to start at least 4 days from now. Pick a time from 8 Nov 2026, 6:00 pm on." */
        message: string | null
        minSlotLeadDays: number
        earliestStart: string
    }
    /** Students can book the slot until then (noticeHours before it starts) */
    studentsCanBookUntil?: string
    serverTime?: string
}

const CHECK_DEBOUNCE_MS = 400

/** Checks the time on the form whenever it changes (debounced). Pass nulls to skip. */
export function useSlotLicenceCheck(
    slotStartDateTime: string | null,
    slotEndDateTime: string | null
) {
    const [check, setCheck] = useState<SlotLicenceCheck | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        if (!slotStartDateTime || !slotEndDateTime) {
            setCheck(null)
            setLoading(false)
            return
        }

        let cancelled = false
        setLoading(true)
        const timer = setTimeout(async () => {
            try {
                const response = await api.get<SlotLicenceCheck>(
                    '/instructor/mentor-slots/licence-check',
                    { params: { slotStartDateTime, slotEndDateTime } }
                )
                if (!cancelled) setCheck(response.data ?? null)
            } catch (error) {
                // The create call runs the same checks, so a failed check only hides the hint
                console.error('Error checking slot licence:', error)
                if (!cancelled) setCheck(null)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }, CHECK_DEBOUNCE_MS)

        return () => {
            cancelled = true
            clearTimeout(timer)
        }
    }, [slotStartDateTime, slotEndDateTime])

    return { check, loading }
}
