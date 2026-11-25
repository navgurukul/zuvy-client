'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'
import { MentorSkill, MentorSkillsApiResponse } from './hookTypes'

type RawSkillList = Extract<MentorSkillsApiResponse, unknown[]>

/** Same shape as the backend slugs, e.g. "Node.js" -> "node-js" (used only if the API sends no slug). */
export const toSkillSlug = (value: string): string =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

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
                const name = item.trim()
                return { id: item, name, slug: toSkillSlug(name), mentorCount: null }
            }

            const name = (item.name || item.skill || item.title || '').trim()
            const count = item.mentorCount ?? item.mentorsCount ?? item.count ?? item.usageCount
            return {
                id: item.id ?? name ?? index,
                name,
                slug: item.slug?.trim() || toSkillSlug(name),
                mentorCount: typeof count === 'number' ? count : null,
            }
        })
        .filter((skill) => {
            if (!skill.name || !skill.slug || seen.has(skill.slug)) return false
            seen.add(skill.slug)
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
 * Skills for the expertise filter: GET /student/mentors/skills?inUse=true,
 * fetched once on mount. Mentors are then filtered with
 * GET /student/mentors?expertise=<slug,slug> (see useMentors).
 */
export function useMentorSkills(initialFetch = true) {
    const [skills, setSkills] = useState<MentorSkill[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<string | null>(null)

    const getMentorSkills = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await api.get<MentorSkillsApiResponse>(
                '/student/mentors/skills?inUse=true'
            )
            setSkills(normalizeSkills(response.data))
        } catch (error) {
            console.error('Error fetching mentor skills:', error)
            setSkills([])
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (initialFetch) getMentorSkills()
    }, [initialFetch, getMentorSkills])

    return {
        skills,
        loading,
        error,
        refetchMentorSkills: getMentorSkills,
    }
}
