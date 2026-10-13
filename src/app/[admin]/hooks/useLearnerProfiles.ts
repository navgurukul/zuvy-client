'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface LearnerProfile {
    id?: number
    fullName?: string
    userId?: number
    phoneNumber?: string
    email?: string
    linkedinProfile?: string
    collegeName?: string
    degree?: string
    branch?: string
    yearOfStudy?: string
    graduationMonth?: number
    graduationYear?: number
    currentStatus?: string
    technicalSkills?: string[]
    projects?: Array<{
        title?: string
        demoUrl?: string | null
        githubUrl?: string | null
        techStack?: string[]
        description?: string
        projectType?: string
        detailedDescription?: string
    }>
    collegeStream?: string
    collegeScore?: string | number | null
    collegeScoreType?: string | null
    class12Board?: string | null
    class12Score?: string | number | null
    class12ScoreType?: string | null
    class10Board?: string | null
    class10Score?: string | number | null
    class10ScoreType?: string | null
    hasWorkExperience?: boolean
    workExperiences?: Array<{ companyName?: string; role?: string; designation?: string }>
    leetcodeProfiles?: Array<{ username?: string; rank?: number }>
    codechefProfiles?: Array<{ username?: string; rating?: number }>
    codeforcesProfiles?: Array<{ username?: string; rating?: number | string }>
    targetRoles?: string[]
    preferredLocations?: string[]
    openToRemote?: boolean
    internshipStipend?: string | number | null
    fullTimeCtc?: string | number | null
    preferredContactMethods?: string[]
    profileVisibility?: boolean
    termsAndCondition?: boolean
    resumeUrl?: string | null
    originalFilename?: string | null
}

interface LearnerProfilesResponse {
    data?: LearnerProfile[]
}

export function useLearnerProfiles(studentId: string | number, initialFetch = true) {
    const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null)
    const [loading, setLoading] = useState<boolean>(initialFetch)
    const [error, setError] = useState<unknown>(null)

    const fetchLearnerProfile = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await api.get<LearnerProfilesResponse>('/learner-profile/admin', {
                params: { userId: studentId },
            })
            const profiles = Array.isArray(response.data?.data) ? response.data.data : []
            const profile = profiles[0] || null

            setLearnerProfile(profile)
            return profile
        } catch (err) {
            console.error('Failed to fetch learner profile:', err)
            setError(err)
            setLearnerProfile(null)
            return null
        } finally {
            setLoading(false)
        }
    }, [studentId])

    useEffect(() => {
        if (initialFetch) {
            fetchLearnerProfile()
        }
    }, [initialFetch, fetchLearnerProfile])

    return {
        learnerProfile,
        loading,
        error,
        refetchLearnerProfile: fetchLearnerProfile,
    }
}

export default useLearnerProfiles