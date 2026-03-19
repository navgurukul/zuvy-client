'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface LearnerTechnicalSkill {
    id?: number | string
    name: string
    [key: string]: any
}

interface LearnerTechnicalSkillsResponse {
    status?: string
    message?: string
    code?: number
    data?: {
        skills?: LearnerTechnicalSkill[]
    } | LearnerTechnicalSkill[] | string[]
}

const normalizeTechnicalSkills = (data: LearnerTechnicalSkill[] | string[] | undefined): LearnerTechnicalSkill[] => {
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
                name: item.name || item.skill || item.title || '',
            }
        })
        .filter((item) => item.name)
}

export function useLearnerTechnicalSkills(initialFetch = true) {
    const [technicalSkills, setTechnicalSkills] = useState<LearnerTechnicalSkill[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<unknown>(null)

    const fetchLearnerTechnicalSkills = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get<LearnerTechnicalSkillsResponse>('http://localhost:5000/besic/learner-technical-skills')
            // Access skills array from nested data structure
            let skillsData: LearnerTechnicalSkill[] | string[] | undefined
            
            if (res.data?.data && typeof res.data.data === 'object' && 'skills' in res.data.data) {
                skillsData = res.data.data.skills
            } else {
                skillsData = res.data?.data as LearnerTechnicalSkill[] | string[] | undefined
            }
            
            setTechnicalSkills(normalizeTechnicalSkills(skillsData))
            setError(null)
            return res.data
        } catch (err) {
            setError(err)
            setTechnicalSkills([])
            console.error('Error fetching learner technical skills:', err)
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (initialFetch) fetchLearnerTechnicalSkills()
    }, [initialFetch, fetchLearnerTechnicalSkills])

    return {
        technicalSkills,
        loading,
        error,
        refetchLearnerTechnicalSkills: fetchLearnerTechnicalSkills,
    }
}

export default useLearnerTechnicalSkills