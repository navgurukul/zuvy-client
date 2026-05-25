'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface LearnerDegreeDetail {
    id?: number | string
    name: string
    branches?: string[]
    [key: string]: any
}

interface LearnerDegreeDetailsResponse {
    status?: string
    message?: string
    code?: number
    data?: {
        degrees?: LearnerDegreeDetail[]
    } | LearnerDegreeDetail[] | string[]
}

const normalizeDegreeDetails = (data: LearnerDegreeDetail[] | string[] | undefined): LearnerDegreeDetail[] => {
    if (!Array.isArray(data)) return []

    return data
        .map((item, index) => {
            if (typeof item === 'string') {
                return {
                    id: index,
                    name: item,
                    branches: [],
                }
            }

            return {
                ...item,
                id: item.id ?? index,
                name: item.name || item.degree || item.title || '',
                branches: Array.isArray(item.branches)
                    ? item.branches
                    : Array.isArray(item.specializations)
                        ? item.specializations
                        : [],
            }
        })
        .filter((item) => item.name)
}

export function useLearnerDegreeDetails(initialFetch = true) {
    const [degreeDetails, setDegreeDetails] = useState<LearnerDegreeDetail[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<unknown>(null)

    const fetchLearnerDegreeDetails = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get<LearnerDegreeDetailsResponse>('/besic/learner-degree-details')
            // Access degrees array from nested data structure
            let degreesData: LearnerDegreeDetail[] | string[] | undefined
            
            if (res.data?.data && typeof res.data.data === 'object' && 'degrees' in res.data.data) {
                degreesData = res.data.data.degrees
            } else {
                degreesData = res.data?.data as LearnerDegreeDetail[] | string[] | undefined
            }
            
            setDegreeDetails(normalizeDegreeDetails(degreesData))
            setError(null)
            return res.data
        } catch (err) {
            setError(err)
            setDegreeDetails([])
            console.error('Error fetching learner degree details:', err)
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (initialFetch) fetchLearnerDegreeDetails()
    }, [initialFetch, fetchLearnerDegreeDetails])

    return {
        degreeDetails,
        loading,
        error,
        refetchLearnerDegreeDetails: fetchLearnerDegreeDetails,
    }
}

export default useLearnerDegreeDetails
