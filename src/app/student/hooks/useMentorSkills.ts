'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/utils/axios.config'
import { MentorSkill, MentorSkillsApiResponse } from './hookTypes'

type RawSkillList = Extract<MentorSkillsApiResponse, unknown[]>

const extractSkillList = (response: MentorSkillsApiResponse): RawSkillList => {
    if (Array.isArray(response)) return response
    if (Array.isArray(response?.skills)) return response.skills
    if (Array.isArray(response?.data)) return response.data
    if (response?.data && Array.isArray(response.data.skills)) return response.data.skills
    return []
}

const normalizeSkills = (response: MentorSkillsApiResponse): MentorSkill[] => {
    const seen = new Set<string>()

    return extractSkillList(response)
        .map((item, index): MentorSkill => {
            if (typeof item === 'string') {
                return { id: item, name: item.trim(), mentorCount: null }
            }

            const name = (item.name || item.skill || item.title || '').trim()
            const count = item.mentorCount ?? item.mentorsCount ?? item.count ?? item.usageCount
            return {
                id: item.id ?? name ?? index,
                name,
                mentorCount: typeof count === 'number' ? count : null,
            }
        })
        .filter((skill) => {
            const key = skill.name.toLowerCase()
            if (!skill.name || seen.has(key)) return false
            seen.add(key)
            return true
        })
        .sort((a, b) => a.name.localeCompare(b.name))
}

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to fetch skills'
}

/**
 * Query param that carries the dropdown's search text to GET /student/mentors/skills.
 * The backend's `search` currently matches mentors (name, email, title, skill)
 * and returns the skills those mentors have (with inUse=true). If the backend adds
 * a param that matches skill names only, change this to its name.
 */
const SKILL_SEARCH_PARAM = 'search'

/**
 * Skills for the expertise filter, searched on the server.
 * - empty search -> GET /student/mentors/skills?inUse=true
 * - with search  -> GET /student/mentors/skills?inUse=true&search=<text>
 */
export function useMentorSkills(search = '', initialFetch = true) {
    const [skills, setSkills] = useState<MentorSkill[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<string | null>(null)
    // Ignore responses from older requests that finish after a newer one
    const latestRequestId = useRef(0)

    const getMentorSkills = useCallback(async (searchTerm = '') => {
        const requestId = ++latestRequestId.current

        try {
            setLoading(true)
            setError(null)

            const queryParams = new URLSearchParams({ inUse: 'true' })
            const searchValue = searchTerm.trim()
            if (searchValue) {
                // inUse=true is kept so the API drops skills no matching mentor has;
                // without it the API returns every skill (mostly with 0 mentors).
                queryParams.append(SKILL_SEARCH_PARAM, searchValue)
            }

            const response = await api.get<MentorSkillsApiResponse>(
                `/student/mentors/skills?${queryParams.toString()}`
            )

            if (requestId !== latestRequestId.current) return
            setSkills(normalizeSkills(response.data))
        } catch (error) {
            if (requestId !== latestRequestId.current) return
            console.error('Error fetching mentor skills:', error)
            setSkills([])
            setError(getErrorMessage(error))
        } finally {
            if (requestId === latestRequestId.current) setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (initialFetch) getMentorSkills(search)
    }, [initialFetch, getMentorSkills, search])

    return {
        skills,
        loading,
        error,
        refetchMentorSkills: getMentorSkills,
    }
}
