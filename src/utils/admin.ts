import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'

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
                className: 'text-start capitalize border border-secondary',
            })
            getAllCodingQuestions(setCodingQuestions)
        })
        .catch((error) => {
            toast({
                title: 'Error',
                description:
                    error.response?.data?.message || 'An error occurred',
                className: 'text-start capitalize border border-destructive',
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
                className: 'text-start capitalize border border-secondary',
            })
            getAllOpenEndedQuestions(setOpenEndedQuestions)
        })
        .catch((error) => {
            toast({
                title: 'Error',
                description:
                    error?.response?.data?.message || 'An error occurred',
                className: 'text-start capitalize border border-destructive',
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
                className: 'text-start capitalize border border-secondary',
            })
            getAllQUizQuestions(setQuizQuestions)
        })
        .catch((error) => {
            toast({
                title: 'Error',
                description:
                    error.response?.data?.message || 'An error occurred',
                className: 'text-start capitalize border border-destructive',
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

export async function getAllQuizQuestion(setQuizQuestion: any) {
    try {
        let url = `/Content/allQuizQuestions`
        const storedTag = localStorage.getItem('currentTag')
        const tag = storedTag !== null && JSON.parse(storedTag)
        const tagId = tag && tag.id
        if (tagId && tagId !== -1) {
            url = `/Content/allQuizQuestions?tagId=${tagId}`
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
    setIsCodingDialogOpen: any,
    setEditCodingQuestionId: any
) => {
    setIsCodingDialogOpen(true)
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
        setTags(response.data.allTags)
    }
}
// --------------------------------------------
// AddAssessment.tsx functions:-
export async function filteredCodingQuestions(
    setFilteredQuestions: any,
    selectedDifficulty: string,
    selectedTopic: string,
    selectedLanguage: string
) {
    try {
        const response = await api.get('/Content/allCodingQuestions')
        const filtered = response.data.filter(
            (question: any) =>
                selectedDifficulty === 'Any Difficulty' ||
                question.difficulty === selectedDifficulty
            // &&(selectedTopic === 'All Topics' || question.tags.includes(selectedTopic)) &&
            // (selectedLanguage === 'All Languages' || question.language === selectedLanguage)
        )
        setFilteredQuestions(filtered)
    } catch (error) {
        console.error('Error:', error)
    }
}

export async function filteredQuizQuestions(
    setFilteredQuestions: any,
    selectedDifficulty: string,
    selectedTopic: string,
    selectedLanguage: string
) {
    try {
        let url = `/Content/allQuizQuestions`
        const storedTag = localStorage.getItem('currentTag')
        const tag = storedTag !== null && JSON.parse(storedTag)
        const tagId = tag && tag.id
        if (tagId && tagId !== -1) {
            url = `/Content/allQuizQuestions?tagId=${tagId}`
        }
        const response = await api.get(url)
        const filtered = response.data.filter(
            (question: any) =>
                selectedDifficulty === 'Any Difficulty' ||
                question.difficulty === selectedDifficulty
            // &&(selectedTopic === 'All Topics' || question.tags.includes(selectedTopic)) &&
            // (selectedLanguage === 'All Languages' || question.language === selectedLanguage)
        )
        setFilteredQuestions(filtered)
    } catch (error) {
        console.error('Error:', error)
    }
}

export async function filteredOpenEndedQuestions(
    setFilteredQuestions: any,
    selectedDifficulty: string,
    selectedTopic: string,
    selectedLanguage: string
) {
    try {
        const response = await api.get('/Content/openEndedQuestions')
        const filtered = response.data.data.filter(
            (question: any) =>
                selectedDifficulty === 'Any Difficulty' ||
                question.difficulty === selectedDifficulty
            // && (selectedTopic === 'All Topics' || question.tags.includes(selectedTopic)) &&
            // (selectedLanguage === 'All Languages' || question.language === selectedLanguage)
        )
        setFilteredQuestions(filtered)
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
}: FetchStudentsHandlerParams) => {
    setLoading(true)

    const endpoint = searchTerm
        ? `/bootcamp/students/${courseId}?searchTerm=${searchTerm}`
        : `/bootcamp/students/${courseId}?limit=${limit}&offset=${offset}`

    try {
        const res = await api.get(endpoint)
        setStudents(res.data.modifiedStudentInfo || [])
        setTotalPages(res.data.totalPages || 0)
        setTotalStudents(res.data.totalStudentsCount || 0)
        setCurrentPage(res.data.currentPage || 1)
    } catch (error) {
        toast({
            title: 'Error',
            description: 'Failed to fetch the data',
        })
    } finally {
        setLoading(false)
    }
}

// --------------------------
