'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface ParsedResumeData {
    name: string
    email: string
    phone: string
    linkedin: string
    github: string
    skills: string[]
    education: string[]
    projects: any[]
    [key: string]: any
}

export interface ParsedResumeResponse {
    success?: boolean
    resumeUrl?: string
    originalFilename?: string
    data?: ParsedResumeData
    [key: string]: any
}

const normalizeParsedResumeData = (value: any): ParsedResumeData => ({
    name: value?.name || '',
    email: value?.email || '',
    phone: value?.phone || '',
    linkedin: value?.linkedin || '',
    github: value?.github || '',
    skills: Array.isArray(value?.skills) ? value.skills : [],
    education: Array.isArray(value?.education) ? value.education : [],
    projects: Array.isArray(value?.projects) ? value.projects : [],
    ...value,
})

export function useParsedResume(initialFetch = true) {
    const [parsedResume, setParsedResume] = useState<ParsedResumeData | null>(null)
    const [resumeUrl, setResumeUrl] = useState<string>('')
    const [originalFilename, setOriginalFilename] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<string | null>(null)

    const fetchParsedResume = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get<ParsedResumeResponse>('/resume/parsed')
            const payload = res?.data || {}

            setResumeUrl(payload?.resumeUrl || '')
            setOriginalFilename(payload?.originalFilename || '')
            setParsedResume(payload?.data ? normalizeParsedResumeData(payload.data) : null)
            setError(null)
            return payload
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Failed to fetch parsed resume.'
            setError(message)
            setParsedResume(null)
            setResumeUrl('')
            setOriginalFilename('')
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (initialFetch) fetchParsedResume()
    }, [initialFetch, fetchParsedResume])

    return {
        parsedResume,
        resumeUrl,
        originalFilename,
        loading,
        error,
        refetchParsedResume: fetchParsedResume,
    }
}

export default useParsedResume
