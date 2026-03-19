'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface LearnerBranchDetail {
    id?: number | string
    name: string
    [key: string]: any
}

interface LearnerBranchDetailsResponse {
    status?: string
    message?: string
    code?: number
    data?: {
        branches?: LearnerBranchDetail[]
    } | LearnerBranchDetail[] | string[]
}

const normalizeBranchDetails = (data: LearnerBranchDetail[] | string[] | undefined): LearnerBranchDetail[] => {
    if (!Array.isArray(data)) return []

    return data
        .map((item, index) => {
            if (typeof item === 'string') {
                return {
                    id: index,
                    name: item,
                }
            }

            return {
                ...item,
                id: item.id ?? index,
                name: item.name || item.branch || item.title || '',
            }
        })
        .filter((item) => item.name)
}

export function useLearnerBranchDetails(initialFetch = true) {
    const [branchDetails, setBranchDetails] = useState<LearnerBranchDetail[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<unknown>(null)

    const fetchLearnerBranchDetails = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get<LearnerBranchDetailsResponse>('http://localhost:5000/besic/learner-education-branch-details')
            // Access branches array from nested data structure
            let branchesData: LearnerBranchDetail[] | string[] | undefined
            
            if (res.data?.data && typeof res.data.data === 'object' && 'branches' in res.data.data) {
                branchesData = res.data.data.branches
            } else {
                branchesData = res.data?.data as LearnerBranchDetail[] | string[] | undefined
            }
            
            setBranchDetails(normalizeBranchDetails(branchesData))
            setError(null)
            return res.data
        } catch (err) {
            setError(err)
            setBranchDetails([])
            console.error('Error fetching learner branch details:', err)
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (initialFetch) fetchLearnerBranchDetails()
    }, [initialFetch, fetchLearnerBranchDetails])

    return {
        branchDetails,
        loading,
        error,
        refetchLearnerBranchDetails: fetchLearnerBranchDetails,
    }
}

export default useLearnerBranchDetails