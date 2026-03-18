'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface LearnerProfileProject {
    title: string
    description: string
    techStack?: string[]
}

export interface LearnerWorkExperience {
    [key: string]: unknown
}

export interface LearnerProfileData {
    id: number
    userId: number
    fullName: string | null
    phoneNumber: string | null
    email: string | null
    linkedinProfile: string | null
    collegeName: string | null
    otherCollegeName: string | null
    degree: string | null
    branch: string | null
    yearOfStudy: string | null
    graduationMonth: string | null
    graduationYear: string | null
    currentStatus: string | null
    technicalSkills: string[]
    projects: LearnerProfileProject[]
    collegeStream: string | null
    collegeScore: string | number | null
    collegeScoreType: string | null
    class12Board: string | null
    class12Score: string | number | null
    class12ScoreType: string | null
    class10Board: string | null
    class10Score: string | number | null
    class10ScoreType: string | null
    hasWorkExperience: boolean
    workExperiences: LearnerWorkExperience[]
    leetcodeProfiles: string[]
    codechefProfiles: string[]
    codeforcesProfiles: string[]
    targetRoles: string[]
    preferredLocations: string[]
    openToRemote: boolean
    internshipStipend: string | number | null
    fullTimeCtc: string | number | null
    preferredContactMethods: string[]
    resumeUrl: string | null
    originalFilename: string | null
    createdAt: string
    updatedAt: string
}

export interface LearnerProfileResponse {
    success: boolean
    data: LearnerProfileData
}

export function useLearnerProfile(initialFetch = true) {
    const [learnerProfile, setLearnerProfile] = useState<LearnerProfileData | null>(null)
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<unknown>(null)

    const fetchLearnerProfile = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get<LearnerProfileResponse>('/learner-profile')
            setLearnerProfile(res.data?.data ?? null)
            setError(null)
            return res.data
        } catch (err) {
            setError(err)
            setLearnerProfile(null)
            console.error('Error fetching learner profile:', err)
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (initialFetch) fetchLearnerProfile()
    }, [initialFetch, fetchLearnerProfile])

    return {
        learnerProfile,
        loading,
        error,
        refetchLearnerProfile: fetchLearnerProfile,
    }
}

export default useLearnerProfile
