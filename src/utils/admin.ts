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
        const tagArr = [
            { tagName: 'All Topics', id: -1 },
            ...response.data.allTags,
        ]
        setTags(tagArr)
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

        console.log("gh",response.data)

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
    console.log()
    try {
        let url = `/Content/allQuizQuestions`

        const queryParams = []

        if (debouncedSearch) {
            queryParams.push(`searchTerm=${debouncedSearch}`)
        }
        if (selectedTopic?.id !== -1) {
            queryParams.push(`tagId=${selectedTopic.id}`)
        }
       
         
        if (selectedDifficulty !== 'Any Difficulty') {
            queryParams.push(`difficulty=${selectedDifficulty}`)
        }
        // Add more conditions here as needed, e.g., selectedLanguage, etc.

        if (queryParams.length > 0) {
            url += '?' + queryParams.join('&')
        }

        const response = await api.get(url)
        console.log("nikit",response.data)

        const filtered = response.data.filter(
            (question: any) =>
                selectedDifficulty === 'Any Difficulty' ||
                question.difficulty === selectedDifficulty
            // Uncomment and modify the following lines if needed:
            // && (selectedTopic === 'All Topics' || question.tags.includes(selectedTopic))
            && (selectedLanguage === 'All Languages' || question.language === selectedLanguage)
        )
        console.log("fgg",selectedTopic)
        console.log("rrr",selectedLanguage)
        // console.log(filtered)
        setFilteredQuestions(response.data)
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

export async function getChapterDetailsById(chapterId: any, setChapter: any) {
    try {
        const response = await api.get(
            `Content/chapterDetailsById/${chapterId}`
        )
        setChapter(response.data)
    } catch (error) {
        console.error('Error:', error)
    }
}

type FetchStudentsHandlerParams = {
    courseId: string
    limit: number
    offset: number
    searchTerm: string
    setLoading: (value: boolean) => void
    setStudents: (students: any[]) => void
    setTotalPages: (pages: number) => void
    setTotalStudents: (total: number) => void
    setCurrentPage: (page: number) => void
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
