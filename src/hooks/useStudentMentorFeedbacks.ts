'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface StudentFeedbackEntry {
    id: number
    bookingId: number
    studentName?: string | null
    studentUserName?: string | null
    studentFullName?: string | null
    learnerName?: string | null
    rating?: number
    studentRating?: number
    feedback?: string | null
    notes?: string | null
    createdAt?: string | null
    submittedAt?: string | null
    date?: string | null
}

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to fetch student feedback'
}

export function useStudentMentorFeedbacks(filter = '30days', isInstructor = false, initialFetch = true) {
    const [feedbacks, setFeedbacks] = useState<StudentFeedbackEntry[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<string | null>(null)

    const fetchFeedbacks = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            
            const basePath = isInstructor
                ? '/instructor/mentor-slots/feedbacks'
                : '/student/mentor-slots/feedbacks'

            const response = await api.get<StudentFeedbackEntry[] | { data: StudentFeedbackEntry[] }>(
                `${basePath}?filter=${filter}`
            )
            
            if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
                setFeedbacks(response.data.data)
            } else if (Array.isArray(response.data)) {
                setFeedbacks(response.data)
            } else {
                setFeedbacks([])
            }
        } catch (error) {
            console.error('Error fetching student feedbacks:', error)
            setFeedbacks([])
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [filter, isInstructor])

    useEffect(() => {
        if (initialFetch) {
            fetchFeedbacks()
        }
    }, [initialFetch, fetchFeedbacks])

    return {
        feedbacks,
        loading,
        error,
        refetchFeedbacks: fetchFeedbacks,
    }
}
