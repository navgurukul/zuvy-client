'use client'

import { useState } from 'react'
import { api } from '@/utils/axios.config'

export interface MarkMentorAttendancePayload {
    joinedAt: string
    leftAt: string
}

interface MarkAttendanceResponse {
    message?: string
    joinedAt?: string
    leftAt?: string
    durationAttended?: number
    [key: string]: unknown
}

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to mark attendance'
}

const isValidDate = (value: string) => !Number.isNaN(new Date(value).getTime())

export function useMarkMentorSlotAttendance() {
    const [isMarkingAttendance, setIsMarkingAttendance] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [attendanceData, setAttendanceData] =
        useState<MarkAttendanceResponse | null>(null)

    const markAttendance = async (
        bookingId: number,
        payload: MarkMentorAttendancePayload
    ): Promise<boolean> => {
        const joinedAtDate = new Date(payload.joinedAt)
        const leftAtDate = new Date(payload.leftAt)

        if (!isValidDate(payload.joinedAt) || !isValidDate(payload.leftAt)) {
            setError('joinedAt and leftAt must be valid datetime values')
            return false
        }

        if (leftAtDate <= joinedAtDate) {
            setError('leftAt must be greater than joinedAt')
            return false
        }

        try {
            setIsMarkingAttendance(true)
            setError(null)
            setAttendanceData(null)

            const response = await api.post<MarkAttendanceResponse>(
                `/mentor-slots/${bookingId}/attendance`,
                payload
            )

            setAttendanceData(response.data || null)
            return true
        } catch (error) {
            console.error('Error marking attendance:', error)
            setError(getErrorMessage(error))
            return false
        } finally {
            setIsMarkingAttendance(false)
        }
    }

    return {
        isMarkingAttendance,
        error,
        attendanceData,
        markAttendance,
    }
}