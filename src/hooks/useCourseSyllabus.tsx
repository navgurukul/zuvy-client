import { useState, useEffect, useCallback } from 'react'
import { api } from '@/utils/axios.config'

interface Chapter {
    chapterId: number
    chapterName: string
    chapterDescription: string | null
    chapterType: string
    chapterDuration: string
    chapterOrder: number
}

interface Module {
    moduleId: number
    moduleName: string
    moduleDescription: string
    moduleDuration: string
    chapters: Chapter[]
}

interface CourseSyllabusData {
    bootcampId: number
    bootcampName: string
    bootcampDescription: string
    collaboratorName: string
    courseDuration: string
    totalStudentsInCourse: number
    studentBatchId: number
    studentBatchName: string
    instructorName: string
    instructorProfilePicture: string | null
    modules: Module[]
    coverImage: string
    collaboratorImage: string
}

interface ApiResponse {
    message: string
    code: number
    isSuccess: boolean
    data: CourseSyllabusData
}

interface UseCourseSyllabusReturn {
    syllabusData: CourseSyllabusData | null
    loading: boolean
    error: string | null
    refetch: () => void
}

const useCourseSyllabus = (
    courseId: string | string[] | undefined
): UseCourseSyllabusReturn => {
    const [syllabusData, setSyllabusData] = useState<CourseSyllabusData | null>(
        null
    )
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const fetchSyllabus = useCallback(async () => {
        if (!courseId) {
            setError('Course ID is required')
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)

            const response = await api.get<ApiResponse>(
                `/student/syllabus/${courseId}`
            )

            if (response.data.isSuccess) {
                setSyllabusData(response.data.data)
            } else {
                throw new Error(
                    response.data.message || 'Failed to fetch syllabus'
                )
            }
        } catch (err: any) {
            console.error('Error fetching course syllabus:', err)
            setError(
                err.response?.data?.message ||
                    err.message ||
                    'Failed to fetch course syllabus'
            )
            setSyllabusData(null)
        } finally {
            setLoading(false)
        }
    }, [courseId])

    useEffect(() => {
        fetchSyllabus()
    }, [fetchSyllabus])

    const refetch = () => {
        fetchSyllabus()
    }

    return {
        syllabusData,
        loading,
        error,
        refetch,
    }
}

export default useCourseSyllabus
