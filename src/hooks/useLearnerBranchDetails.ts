'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'
import type { LearnerDegreeDetail } from './useLearnerDegreeDetails'

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
        degrees?: LearnerDegreeDetail[]
        branches?: LearnerBranchDetail[] | string[]
    } | LearnerDegreeDetail[] | LearnerBranchDetail[] | string[]
}

const normalizeBranchName = (item: LearnerBranchDetail | string, index: number): LearnerBranchDetail => {
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
}

const getDegreeKey = (value?: string | number | null) => {
    if (value === undefined || value === null) return ''
    return String(value).trim()
}

const buildBranchLookup = (degrees: LearnerDegreeDetail[] | LearnerBranchDetail[] | string[] | undefined) => {
    const branchDetails: LearnerBranchDetail[] = []
    const branchesByDegreeKey: Record<string, LearnerBranchDetail[]> = {}

    if (!Array.isArray(degrees)) {
        return { branchDetails, branchesByDegreeKey }
    }

    degrees.forEach((item, index) => {
        if (typeof item === 'string') {
            branchDetails.push(normalizeBranchName(item, index))
            return
        }

        const degreeBranches = Array.isArray(item.branches)
            ? item.branches
            : Array.isArray(item.specializations)
                ? item.specializations
                : []

        const normalizedBranches = degreeBranches
            .map((branch, branchIndex) => normalizeBranchName(branch, branchIndex))
            .filter((branch) => branch.name)

        if (!normalizedBranches.length) {
            return
        }

        const degreeId = getDegreeKey(item.id ?? index)
        const degreeName = getDegreeKey(item.name || item.degree || item.title)

        branchDetails.push(...normalizedBranches)

        if (degreeId) {
            branchesByDegreeKey[degreeId] = normalizedBranches
        }

        if (degreeName) {
            branchesByDegreeKey[degreeName] = normalizedBranches
        }
    })

    return {
        branchDetails: Array.from(
            new Map(branchDetails.map((branch) => [getDegreeKey(branch.id ?? branch.name), branch])).values()
        ),
        branchesByDegreeKey,
    }
}

export function useLearnerBranchDetails(initialFetch = true) {
    const [branchDetails, setBranchDetails] = useState<LearnerBranchDetail[]>([])
    const [branchesByDegreeKey, setBranchesByDegreeKey] = useState<Record<string, LearnerBranchDetail[]>>({})
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<unknown>(null)

    const fetchLearnerBranchDetails = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get<LearnerBranchDetailsResponse>('/basic/learner-degree-details-with-branches')
            const responseData = res.data?.data

            let normalizedData: LearnerDegreeDetail[] | LearnerBranchDetail[] | string[] | undefined

            if (Array.isArray(responseData)) {
                normalizedData = responseData as LearnerDegreeDetail[] | LearnerBranchDetail[] | string[]
            } else if (responseData && typeof responseData === 'object') {
                if ('degrees' in responseData && Array.isArray(responseData.degrees)) {
                    normalizedData = responseData.degrees
                } else if ('branches' in responseData && Array.isArray(responseData.branches)) {
                    normalizedData = responseData.branches
                }
            }

            const normalizedBranches = buildBranchLookup(normalizedData)

            setBranchDetails(normalizedBranches.branchDetails)
            setBranchesByDegreeKey(normalizedBranches.branchesByDegreeKey)
            setError(null)
            return res.data
        } catch (err) {
            setError(err)
            setBranchDetails([])
            setBranchesByDegreeKey({})
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
        branchesByDegreeKey,
        getBranchesForDegree: (degreeId?: string | number | null) => {
            const key = getDegreeKey(degreeId)
            return key ? branchesByDegreeKey[key] || [] : branchDetails
        },
        refetchLearnerBranchDetails: fetchLearnerBranchDetails,
    }
}

export default useLearnerBranchDetails