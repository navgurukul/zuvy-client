import { difficultyColor } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'
import { useEffect, useRef } from 'react'
import useDebounce from '@/hooks/useDebounce'
import { getMcqSearch } from '@/store/store'

export function handleDelete(
    deleteCodingQuestionId: any,
    getAllCodingQuestions: any,
    setCodingQuestions: any
) {
    api({
        method: 'delete',
        url: 'Content/deleteCodingQuestion',
        data: {
            questionIds: [deleteCodingQuestionId],
        },
    })
        .then((res) => {
            toast({
                title: 'Success',
                description: res.data.message,
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })
            getAllCodingQuestions(setCodingQuestions)
        })
        .catch((error) => {
            toast({
                title: 'Error',
                description:
                    error.response?.data?.message || 'An error occurred',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        })
}

export function deleteOpenEndedQuestion(
    deleteOpenEndedQuestionId: any,
    getAllOpenEndedQuestions: any,
    setOpenEndedQuestions: any
) {
    api({
        method: 'delete',
        url: 'Content/deleteOpenEndedQuestion',
        data: {
            questionIds: [deleteOpenEndedQuestionId],
        },
    })
        .then((res) => {
            toast({
                title: 'Success',
                description: res.data.message,
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })
            getAllOpenEndedQuestions(setOpenEndedQuestions)
        })
        .catch((error) => {
            toast({
                title: 'Error',
                description:
                    error?.response?.data?.message || 'An error occurred',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        })
}

export const handleDeleteModal = (
    setDeleteModalOpen: any,
    setDeleteCodingQuestionId: any,
    codingQuestion: any
) => {
    setDeleteModalOpen(true)
    setDeleteCodingQuestionId(codingQuestion.id)
}

export const handleConfirm = (
    handleDelete: any,
    setDeleteModalOpen: any,
    deleteCodingQuestionId: any,
    getAllCodingQuestions: any,
    setCodingQuestions: any
) => {
    handleDelete(
        deleteCodingQuestionId,
        getAllCodingQuestions,
        setCodingQuestions
    )
    setDeleteModalOpen(false)
}

export async function getAllCodingQuestions(setCodingQuestions: any) {
    try {
        const response = await api.get('Content/allCodingQuestions')
        setCodingQuestions(response.data)
    } catch (error) {
        console.error(error)
    }
}
export function handleQuizDelete(
    deleteQuizQuestionId: any,
    getAllQUizQuestions: any,
    setQuizQuestions: any
) {
    api({
        method: 'delete',
        url: 'Content/deleteQuizQuestion',
        data: {
            questionIds: [deleteQuizQuestionId],
        },
    })
        .then((res) => {
            toast({
                title: 'Success',
                description: res.data.message,
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })
            getAllQUizQuestions(setQuizQuestions)
        })
        .catch((error) => {
            toast({
                title: 'Error',
                description:
                    error.response?.data?.message || 'An error occurred',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        })
}

export const handleDeleteQuizModal = (
    setDeleteModalOpen: any,
    setDeleteQuizQuestionId: any,
    quizQuestion: any
) => {
    setDeleteModalOpen(true)
    setDeleteQuizQuestionId(quizQuestion.id)
}

export const handleQuizConfirm = (
    handleQuizDelete: any,
    setDeleteModalOpen: any,
    deleteQuizQuestionId: any,
    getAllQuizQuestions: any,
    setQuizQuestions: any
) => {
    handleQuizDelete(
        deleteQuizQuestionId,
        getAllQuizQuestions,
        setQuizQuestions
    )
    setDeleteModalOpen(false)
}

export async function getAllQuizQuestion(
    setQuizQuestion: any,
    difficulty?: string,
    mcqSearch?: string
) {
    try {
        const mcqtagId: any = localStorage.getItem('MCQCurrentTag')
        const MCQCurrentTagId = JSON.parse(mcqtagId)
        let url = `/Content/allQuizQuestions`
        const queryParams: string[] = []

        if (mcqSearch && mcqSearch !== 'None') {
            queryParams.push(`searchTerm=${mcqSearch}`)
        }
        if (MCQCurrentTagId?.id !== undefined && MCQCurrentTagId?.id !== -1) {
            queryParams.push(`tagId=${MCQCurrentTagId.id}`)
        }

        if (difficulty && difficulty !== 'None') {
            queryParams.push(`difficulty=${difficulty}`)
        }

        if (queryParams.length > 0) {
            url += `?${queryParams.join('&')}`
        }

        const response = await api.get(url)
        setQuizQuestion(response.data)
    } catch (error) {
        console.error(error)
    }
}

export const getAllOpenEndedQuestions = async (
    setAllOpenEndedQuestions: any
) => {
    try {
        const response = await api.get('/Content/openEndedQuestions')
        setAllOpenEndedQuestions(response.data.data)
    } catch (error) {
        console.error(error)
    }
}

export const handleEditOpenEndedQuestion = (
    openEndedQuestion: any,
    setIsOpenEndDialogOpen: any,
    setEditOpenEndedQuestionId: any
) => {
    setIsOpenEndDialogOpen(true)
    setEditOpenEndedQuestionId(openEndedQuestion.id)
}
export const handleEditCodingQuestion = (
    codingQuestion: any,
    setIsCodingEditDialogOpen: any,
    setEditCodingQuestionId: any
) => {
    setIsCodingEditDialogOpen(true)
    setEditCodingQuestionId(codingQuestion.id)
}
export const handlerQuizQuestions = (
    quizQuestion: any,
    setIsEditModalOpen: any,
    setIsQuizQuestionId: any
) => {
    setIsEditModalOpen(true)
    setIsQuizQuestionId(quizQuestion.id)
}

export async function getAllTags(setTags: any) {
    const response = await api.get('Content/allTags')
    if (response) {
        const transformedData = response.data.allTags.map(
            (item: { id: any; tagName: any }) => ({
                value: item.id.toString(),
                label: item.tagName,
            })
        )
        const tagArr = [
            { value: '-1', label: 'All Topics' },
            ...transformedData,
        ]
        setTags(tagArr)
    }
}

// get tags without filtering:

export async function getAllTagsWithoutFilter(setTags: any) {
    const response = await api.get('Content/allTags')
    if (response) {
        setTags([{ id: -1, tagName: 'All Topics' }, ...response.data.allTags])
    }
}

// --------------------------------------------
// AddAssessment.tsx functions:-
export async function filteredCodingQuestions(
    setFilteredQuestions: any,
    selectedDifficulty: string,
    selectedTopic: any,
    selectedLanguage: string,
    debouncedSearch: string
) {
    try {
        let url = `/Content/allCodingQuestions`

        const queryParams = []

        if (selectedTopic?.id !== -1) {
            queryParams.push(`tagId=${selectedTopic.id}`)
        }
        if (
            selectedDifficulty &&
            selectedDifficulty !== 'None' &&
            selectedDifficulty !== 'Any Difficulty'
        ) {
            queryParams.push(`difficulty=${selectedDifficulty}`)
        }
        if (debouncedSearch) {
            queryParams.push(`searchTerm=${debouncedSearch}`)
        }

        if (queryParams.length > 0) {
            url += '?' + queryParams.join('&')
        }

        const response = await api.get(url)

        setFilteredQuestions(response.data)
    } catch (error) {
        console.error('Error:', error)
    }
}

export async function filteredQuizQuestions(
    setFilteredQuestions: any,
    selectedDifficulty: string,
    selectedTopic: any,
    selectedLanguage: string,
    debouncedSearch: string
) {
    try {
        let url = `/Content/allQuizQuestions`

        const queryParams = []

        if (debouncedSearch) {
            queryParams.push(`searchTerm=${debouncedSearch}`)
        }
        if (selectedTopic !== 'All Topics' && selectedTopic != 0) {
            queryParams.push(`tagId=${+selectedTopic}`)
        }
        if (selectedDifficulty !== 'Any Difficulty') {
            queryParams.push(`difficulty=${selectedDifficulty}`)
        }
        // Add more conditions here as needed, e.g., selectedLanguage, etc.

        if (queryParams.length > 0) {
            url += '?' + queryParams.join('&')
        }

        const response = await api.get(url)

        const filtered = response.data.filter(
            (question: any) =>
                selectedDifficulty === 'Any Difficulty' ||
                question.difficulty === selectedDifficulty
            // Uncomment and modify the following lines if needed:
            // && (selectedTopic === 'All Topics' || question.tags.includes(selectedTopic))
            // && (selectedLanguage === 'All Languages' || question.language === selectedLanguage)
        )

        setFilteredQuestions(filtered)
    } catch (error) {
        console.error('Error:', error)
    }
}

export async function filteredOpenEndedQuestions(
    setFilteredQuestions: any,
    selectedDifficulty: string,
    selectedTopic: any,
    selectedLanguage: string,
    debouncedSearch: string
) {
    try {
        let url = `/Content/openEndedQuestions`

        const queryParams = []

        if (selectedTopic?.id !== -1) {
            queryParams.push(`tagId=${selectedTopic.id}`)
        }
        if (
            selectedDifficulty &&
            selectedDifficulty !== 'None' &&
            selectedDifficulty !== 'Any Difficulty'
        ) {
            queryParams.push(`difficulty=${selectedDifficulty}`)
        }
        if (debouncedSearch) {
            queryParams.push(`searchTerm=${debouncedSearch}`)
        }
        // Add more conditions here as needed, e.g., selectedLanguage, etc.

        if (queryParams.length > 0) {
            url += '?' + queryParams.join('&')
        }

        const response = await api.get(url)
        setFilteredQuestions(response.data.data)
    } catch (error) {
        console.error('Error:', error)
    }
}

export async function filterQuestions(
    setFilteredQuestions: any,
    selectedDifficulties: any[],   // Array of difficulties
    selectedTopics: any[],         // Array of topics
    selectedLanguage: string,
    debouncedSearch: string,
    questionType: string // Type of question to determine the endpoint
) {
    try {
        // Set the endpoint based on question type
        let url = ''

        switch (questionType) {
            case 'coding':
                url = `/Content/allCodingQuestions`
                break
            case 'mcq':
                url = `/Content/allQuizQuestions`
                break
            case 'open-ended':
                url = `/Content/openEndedQuestions`
                break
        }

        const queryParams: string[] = []

        // Handle multiple selected topics (tags), but ignore 'All Topics' (id: -1 or 0)
        let selectedTagIds = ''
        selectedTopics.forEach((topic: any) => {
            if (topic.id !== -1 && topic.id !== 0) { // Skip 'All Topics'
                selectedTagIds += `&tagId=${topic.id}`
            }
        })

        // Handle multiple selected difficulties, but ignore 'Any Difficulty'
        let selectedDiff = ''
        selectedDifficulties.forEach((difficulty: string) => {
            if (difficulty !== 'Any Difficulty') {
                selectedDiff += `&difficulty=${difficulty}`
            }
        })

        // Add valid topics to query params
        if (selectedTagIds.length > 0) {
            queryParams.push(selectedTagIds.substring(1)) // Remove the first '&'
        }

        // Add valid difficulties to query params
        if (selectedDiff.length > 0) {
            queryParams.push(selectedDiff.substring(1)) // Remove the first '&'
        }

        // Add search term if provided
        if (debouncedSearch) {
            queryParams.push(`searchTerm=${debouncedSearch}`)
        }

        // Combine query parameters into the URL
        if (queryParams.length > 0) {
            url += '?' + queryParams.join('&')
        }

        const response = await api.get(url)

        // Additional filtering for quiz questions, if needed
        if (questionType === 'quiz') {
            const filtered = response.data.filter(
                (question: any) =>
                    selectedDifficulties.includes('Any Difficulty') ||
                    selectedDifficulties.includes(question.difficulty)
            )
            setFilteredQuestions(filtered)
        } else {
            setFilteredQuestions(response.data.data || response.data)
        }
    } catch (error) {
        console.error('Error:', error)
    }
}


interface FetchStudentsParams {
    courseId: string
    limit: number
    offset: number
    searchTerm: string
    setLoading: (loading: boolean) => void
    setStudents: (students: any[]) => void
    setTotalPages: (totalPages: number) => void
    setTotalStudents: (totalStudents: number) => void
    setCurrentPage: (currentPage: number) => void
}

export const fetchStudentsHandler = async ({
    courseId,
    limit,
    offset,
    searchTerm,
    setLoading,
    setStudents,
    setTotalPages,
    setTotalStudents,
    setCurrentPage,
}: FetchStudentsParams) => {
    setLoading(true)

    const endpoint = searchTerm
        ? `/bootcamp/students/${courseId}?searchTerm=${searchTerm}`
        : `/bootcamp/students/${courseId}?limit=${limit}&offset=${offset}`

    try {
        const res = await api.get(endpoint)
        setStudents(res.data.modifiedStudentInfo)
        setTotalPages(res.data.totalPages)
        setTotalStudents(res.data.totalStudentsCount)
        setCurrentPage(res.data.currentPage)
    } catch (error) {
        toast({
            title: 'Error',
            description: 'Failed to fetch the data',
            className:
                'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
        })
    } finally {
        setLoading(false)
    }
}

export function cleanUpValues(value: string) {
    if (!value) return ''

    value = value.toString().trim()

    // Remove extra commas, spaces, and clean up the value
    value = value.replace(/,\s*,+/g, ',') // Remove extra commas
    value = value.replace(/\s{2,}/g, ' ') // Remove extra spaces
    value = value.replace(/,\s*$/, '') // Remove trailing commas
    value = value.replace(/^\s*,/, '') // Remove leading commas

    return value
}

// --------------------------
export const convertSeconds = (seconds: number) => {
    const SECONDS_IN_A_MINUTE = 60
    const SECONDS_IN_AN_HOUR = 60 * SECONDS_IN_A_MINUTE
    const SECONDS_IN_A_DAY = 24 * SECONDS_IN_AN_HOUR
    const SECONDS_IN_A_WEEK = 7 * SECONDS_IN_A_DAY
    const SECONDS_IN_A_MONTH = 28 * SECONDS_IN_A_DAY
    const months = Math.floor(seconds / SECONDS_IN_A_MONTH)
    seconds %= SECONDS_IN_A_MONTH
    const weeks = Math.floor(seconds / SECONDS_IN_A_WEEK)
    seconds %= SECONDS_IN_A_WEEK
    const days = Math.floor(seconds / SECONDS_IN_A_DAY)
    seconds %= SECONDS_IN_A_DAY
    return {
        months: months,
        weeks: weeks,
        days: days,
    }
}

// --------------------------------------------
// Preview Assessment Page functions:-

export async function fetchPreviewAssessmentData(
    params: any,
    setAssessmentPreviewContent: any
) {
    try {
        const response = await api.get(
            `Content/chapterDetailsById/${params?.chapterId}?bootcampId=${params?.courseId}&moduleId=${params?.moduleId}&topicId=${params?.topicId}`
        )

        setAssessmentPreviewContent(response.data)
    } catch (error) {
        console.error('Error fetching chapter content:', error)
    }
}