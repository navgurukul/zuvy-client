'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/utils/axios.config'
import { OverallAnalysisPayload, UseOverallAnalysisArgs } from './hookType'

const toValidNumber = (value?: number | string) => {
    const numericValue = Number(value)
    return Number.isFinite(numericValue) && numericValue > 0
        ? numericValue
        : undefined
}

const getPayloadData = (responseData: unknown): OverallAnalysisPayload => {
    if (
        responseData &&
        typeof responseData === 'object' &&
        !Array.isArray(responseData) &&
        'data' in responseData
    ) {
        return ((responseData as { data?: OverallAnalysisPayload }).data ||
            {}) as OverallAnalysisPayload
    }

    return (responseData || {}) as OverallAnalysisPayload
}

export default function useOverallAnalysis({
    batchId,
    userId,
    auto = true,
}: UseOverallAnalysisArgs) {
    const [data, setData] = useState<OverallAnalysisPayload | null>(null)
    const [loading, setLoading] = useState<boolean>(!!auto)
    const [error, setError] = useState<unknown>(null)
    const inFlightKeyRef = useRef('')
    const lastKeyRef = useRef('')

    const fetchOverallAnalysis = useCallback(async () => {
        const numericBatchId = toValidNumber(batchId)
        const numericUserId = toValidNumber(userId)
        const key = `${numericBatchId ?? ''}|${numericUserId ?? ''}`

        if (!numericBatchId) {
            setData(null)
            setLoading(false)
            return
        }

        if (key === inFlightKeyRef.current || key === lastKeyRef.current) {
            return
        }

        try {
            inFlightKeyRef.current = key
            setLoading(true)
            setError(null)

            const response = await api.get('/admin/overall-analysis', {
                params: {
                    batchId: numericBatchId,
                    ...(numericUserId ? { userId: numericUserId } : {}),
                },
            })

            const apiData = getPayloadData(response?.data)
            const students = Array.isArray(apiData?.students)
                ? apiData.students
                : []

            const selectedStudent = numericUserId
                ? students.find(
                      (item) =>
                          String(item?.userId ?? item?.id ?? '') ===
                          String(numericUserId)
                  ) || students[0]
                : undefined

            setData({
                ...apiData,
                students: numericUserId
                    ? selectedStudent
                        ? [selectedStudent]
                        : []
                    : students,
            })
            lastKeyRef.current = key
        } catch (err) {
            setError(err)
            setData(null)
            lastKeyRef.current = key
        } finally {
            if (inFlightKeyRef.current === key) {
                inFlightKeyRef.current = ''
            }
            setLoading(false)
        }
    }, [batchId, userId])

    useEffect(() => {
        if (auto) {
            fetchOverallAnalysis()
        }
    }, [auto, fetchOverallAnalysis])

    const refetch = useCallback(async () => {
        lastKeyRef.current = ''
        await fetchOverallAnalysis()
    }, [fetchOverallAnalysis])

    return {
        data,
        loading,
        error,
        refetch,
    }
}
