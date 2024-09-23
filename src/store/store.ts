import { set } from 'date-fns'
import { create } from 'zustand'
import { useEffect } from 'react'
import { api } from '@/utils/axios.config'
import { string } from 'zod'

type CounterStore = {
    studentData: {
        name: string
        profile_picture: string
        email: string
        id: number
        rolesList: string[]
    } | null
    studentsInfo: any[]
    setStudentsInfo: (newStudentsInfo: any[]) => void
    anotherStudentState: any[] // Add another state
    setAnotherStudentState: (newValue: any[]) => void
    token: any
}

interface CourseData {
    id: number
    name: string
    bootcampTopic: string
    coverImage: string
    duration: string
    language: string
    startTime: string
    unassigned_students: number
}

interface BatchData {
    id: number
    name: string
    bootcampId: number
    instructorId: number
    capEnrollment: number
    // createdAt: string,
    // updatedAt: string,
    students_enrolled: number
}

interface StoreCourseData {
    courseData: CourseData | null
    setCourseData: (newValue: CourseData) => void
    fetchCourseDetails: (courseId: number) => void
}

interface StoreBatchData {
    batchData: BatchData[] | null
    setBatchData: (newValue: BatchData[]) => void
    fetchBatches: (courseId: number) => void
}

export interface quiz {
    id: number
    question: string
    options: {
        [key: string]: string
    }
    correctOption: number
    marks: number
    difficulty: 'Easy' | 'Medium' | 'Hard'
    tagId: number
    usage: number
}

export const getCourseData = create<StoreCourseData>((set) => ({
    courseData: {
        id: 0,
        name: '',
        bootcampTopic: '',
        coverImage: '',
        duration: '',
        language: 'string',
        startTime: '',
        unassigned_students: 0,
    },
    setCourseData: (newValue: CourseData) => {
        set({ courseData: newValue })
    },
    fetchCourseDetails: async (courseId: number) => {
        try {
            const response = await api.get(`/bootcamp/${courseId}`)
            const data = response.data
            set({ courseData: data.bootcamp })
        } catch (error) {
            console.error('Error fetching course details:', error)
        }
    },
}))

export const getBatchData = create<StoreBatchData>((set) => ({
    batchData: [],
    setBatchData: (newValue: BatchData[]) => {
        set({ batchData: newValue })
    },
    fetchBatches: async (courseId: number) => {
        try {
            const response = await api.get(`/bootcamp/batches/${courseId}`)
            const data = response.data
            set({ batchData: data.data })
        } catch (error) {
            console.error('Error fetching batches', error)
        }
    },
}))
// ------------------------------
type deleteStudentStore = {
    isDeleteModalOpen: boolean
    setDeleteModalOpen: (newValue: boolean) => void
    deleteStudentId: any
    setDeleteStudentId: (newValue: any) => void
}

export const getDeleteStudentStore = create<deleteStudentStore>((set) => ({
    isDeleteModalOpen: false,
    setDeleteModalOpen: (newValue: boolean) => {
        set({ isDeleteModalOpen: newValue })
    },
    deleteStudentId: null,
    setDeleteStudentId: (newValue: any) => {
        set({ deleteStudentId: newValue })
    },
}))
// ------------------------------

// ------------------------------
// Define the type for the assessment store
type assessmentStore = {
    tabChangeInstance: number
    setTabChangeInstance: (newValue: number) => void
    fullScreenExitInstance: number
    setFullScreenExitInstance: (newValue: number) => void
    copyPasteAttempt: number
    setCopyPasteAttempt: (newValue: number) => void
}

export const getAssessmentStore = create<assessmentStore>((set) => ({
    tabChangeInstance: 0,
    setTabChangeInstance: (newValue: number) => {
        set({ tabChangeInstance: newValue })
    },
    fullScreenExitInstance: 0,
    setFullScreenExitInstance: (newValue: number) => {
        set({ fullScreenExitInstance: newValue })
    },
    copyPasteAttempt: 0,
    setCopyPasteAttempt: (newValue: number) => {
        set({ copyPasteAttempt: newValue })
    },
}))
// ------------------------------

type storeStudentData = {
    studentsData: any[]
    setStoreStudentData: (newValue: any[]) => void
}

export const getStoreStudentData = create<storeStudentData>((set) => ({
    studentsData: [],
    setStoreStudentData: (newValue: any[]) => {
        set({ studentsData: newValue })
    },
}))
type storeBatchValue = {
    batchValueData: any
    setbatchValueData: (newValue: any) => void
}

export const setStoreBatchValue = create<storeBatchValue>((set) => ({
    batchValueData: '',
    setbatchValueData: (newValue: any) => {
        set({ batchValueData: newValue })
    },
}))

type storequizData = {
    quizData: quiz[]
    setStoreQuizData: (newValue: quiz[]) => void
}
export const getAllQuizData = create<storequizData>((set) => ({
    quizData: [],
    setStoreQuizData: (newValue: quiz[]) => {
        set({ quizData: newValue })
    },
}))

// ----------------Chapter state for Student side--------------

type studentChapterContent = {
    chapterContent: any
    setChapterContent: (newValue: any) => void
}

export const getStudentChapterContentState = create<studentChapterContent>((set) => ({
    chapterContent: {},
    setChapterContent: (newValue: any) => {
        set({ chapterContent: newValue })
    },
}))

type chapters = {
    chapters: any[]
    setChapters: (newValue: any[]) => void
}

export const getStudentChaptersState = create<chapters>((set) => ({
    chapters: [],
    setChapters: (newValue: any[]) => {
        set({ chapters: newValue })
    },
}))

type studentModuleName = {
    moduleName: string
    setModuleName: (newValue: string) => void
}

export const getModuleName = create<studentModuleName>((set) => ({
    moduleName: '',
    setModuleName: (newValue: string) => {
        set({ moduleName: newValue })
    },
}))

type scrollPosition = {
    scrollPosition: number
    setScrollPosition: (newValue: number) => void
}

export const getScrollPosition = create<scrollPosition>((set) => ({
    scrollPosition: 0,
    setScrollPosition: (newValue: number) => {
        set({ scrollPosition: newValue })
    },
}))

// ------------------------------

// ----------------Chapter state for Admin side--------------

type chapterContent = {
    chapterContent: any
    setChapterContent: (newValue: any) => void
}

export const getChapterContentState = create<chapterContent>((set) => ({
    chapterContent: null,
    setChapterContent: (newValue: any) => {
        set({ chapterContent: newValue })
    },
}))

type Chapter = {
    chapterId: number
    chapterTitle: string
    topicId: number
    topicName: string
    order: number
}

type chapterData = {
    chapterData: Chapter[]
    setChapterData: (newValue: Chapter[]) => void
}

export const getChapterDataState = create<chapterData>((set) => ({
    chapterData: [],
    setChapterData: (newValue: Chapter[]) => {
        set({ chapterData: newValue })
    },
}))

type currentChapter = {
    currentChapter: Chapter[]
    setCurrentChapter: (newValue: Chapter[]) => void
}

export const getCurrentChapterState = create<currentChapter>((set) => ({
    currentChapter: [],
    setCurrentChapter: (newValue: Chapter[]) => {
        set({ currentChapter: newValue })
    },
}))

type topicId = {
    topicId: number
    setTopicId: (newValue: number) => void
}

export const getTopicId = create<topicId>((set) => ({
    topicId: 1,
    setTopicId: (newValue: number) => {
        set({ topicId: newValue })
    },
}))

type moduleName = {
    moduleName: string
    setModuleName: (newValue: string) => void
}

export const getCurrentModuleName = create<moduleName>((set) => ({
    moduleName: '',
    setModuleName: (newValue: string) => {
        set({ moduleName: newValue })
    },
}))

// ------------------------------


type codingQuestions = {
    codingQuestions: any[]
    setCodingQuestions: (newValue: any[]) => void
}

export const getcodingQuestionState = create<codingQuestions>((set) => ({
    codingQuestions: [],
    setCodingQuestions: (newValue: any[]) => {
        set({ codingQuestions: newValue })
    },
}))

// ------------------------------

type deleteCodingQuestion = {
    isDeleteModalOpen: boolean
    setDeleteModalOpen: (newValue: boolean) => void
    deleteCodingQuestionId: null
    setDeleteCodingQuestionId: (newValue: any) => void
}

export const getDeleteCodingQuestion = create<deleteCodingQuestion>((set) => ({
    isDeleteModalOpen: false,
    setDeleteModalOpen: (newValue: boolean) => {
        set({ isDeleteModalOpen: newValue })
    },
    deleteCodingQuestionId: null,
    setDeleteCodingQuestionId: (newValue: any) => {
        set({ deleteCodingQuestionId: newValue })
    },
}))

type deleteQuizQuestion = {
    isDeleteModalOpen: boolean
    setDeleteModalOpen: (newValue: boolean) => void
    deleteQuizQuestionId: null
    setDeleteQuizQuestionId: (newValue: any) => void
}

export const getDeleteQuizQuestion = create<deleteQuizQuestion>((set) => ({
    isDeleteModalOpen: false,
    setDeleteModalOpen: (newValue: boolean) => {
        set({ isDeleteModalOpen: newValue })
    },
    deleteQuizQuestionId: null,
    setDeleteQuizQuestionId: (newValue: any) => {
        set({ deleteQuizQuestionId: newValue })
    },
}))
// ------------------------------

type openEndedQuestions = {
    openEndedQuestions: any[]
    setOpenEndedQuestions: (newValue: any[]) => void
}

export const getopenEndedQuestionstate = create<openEndedQuestions>((set) => ({
    openEndedQuestions: [],
    setOpenEndedQuestions: (newValue: any[]) => {
        set({ openEndedQuestions: newValue })
    },
}))

// ------------------------------
type deleteOpenEndedQuestion = {
    isDeleteModalOpen: boolean
    setDeleteModalOpen: (newValue: boolean) => void
    deleteOpenEndedQuestionId: null
    setdeleteOpenEndedQuestionId: (newValue: any) => void
}

export const getdeleteOpenEndedQuestion = create<deleteOpenEndedQuestion>(
    (set) => ({
        isDeleteModalOpen: false,
        setDeleteModalOpen: (newValue: boolean) => {
            set({ isDeleteModalOpen: newValue })
        },
        deleteOpenEndedQuestionId: null,
        setdeleteOpenEndedQuestionId: (newValue: any) => {
            set({ deleteOpenEndedQuestionId: newValue })
        },
    })
)

type editQuizQuestion = {
    isEditQuizModalOpen: boolean
    setIsEditModalOpen: (newValue: boolean) => void
    quizQuestionId: number
    setIsQuizQuestionId: (newValue: number) => void
}

export const getEditQuizQuestion = create<editQuizQuestion>((set) => ({
    isEditQuizModalOpen: false,
    setIsEditModalOpen: (newValue: boolean) => {
        set({ isEditQuizModalOpen: newValue })
    },
    quizQuestionId: 0,
    setIsQuizQuestionId: (newValue: number) => {
        set({ quizQuestionId: newValue })
    },
}))

// ------------------------------
type saveParam = {
    paramBatchId: number
    setIsParamBatchId: (newValue: number) => void
}

export const getParamBatchId = create<saveParam>((set) => ({
    paramBatchId: 0,
    setIsParamBatchId: (newvalue: number) => {
        set({ paramBatchId: newvalue })
    },
}))

// ------------------------------
type editOpenEndedDialogs = {
    isOpenEndDialogOpen: boolean
    setIsOpenEndDialogOpen: (newValue: boolean) => void
    editOpenEndedQuestionId: null
    setEditOpenEndedQuestionId: (newValue: any) => void
}

export const getEditOpenEndedDialogs = create<editOpenEndedDialogs>((set) => ({
    isOpenEndDialogOpen: false,
    setIsOpenEndDialogOpen: (newValue: boolean) => {
        set({ isOpenEndDialogOpen: newValue })
    },
    editOpenEndedQuestionId: null,
    setEditOpenEndedQuestionId: (newValue: any) => {
        set({ editOpenEndedQuestionId: newValue })
    },
}))

// ------------------------------

// ------------------------------
type editCodingQuestionDialogs = {
    isCodingDialogOpen: boolean
    setIsCodingDialogOpen: (newValue: boolean) => void
    isCodingEditDialogOpen: boolean
    setIsCodingEditDialogOpen: (newValue: boolean) => void
    editCodingQuestionId: null
    setEditCodingQuestionId: (newValue: any) => void
}

export const getEditCodingQuestionDialogs = create<editCodingQuestionDialogs>(
    (set) => ({
        isCodingDialogOpen: false,
        setIsCodingDialogOpen: (newValue: boolean) => {
            set({ isCodingDialogOpen: newValue })
        },
        isCodingEditDialogOpen: false,
        setIsCodingEditDialogOpen: (newValue: boolean) => {
            set({ isCodingEditDialogOpen: newValue })
        },
        editCodingQuestionId: null,
        setEditCodingQuestionId: (newValue: any) => {
            set({ editCodingQuestionId: newValue })
        },
    })
)

// ------------------------------

type codingQuestionTags = {
    tags: any[]
    setTags: (newValue: any[]) => void
}

export const getCodingQuestionTags = create<codingQuestionTags>((set) => ({
    tags: [],
    setTags: (newValue: any[]) => {
        set({ tags: newValue })
    },
}))

// ------------------------------

export const useStudentData = create<CounterStore>((set) => ({
    studentData: null,
    studentsInfo: [],
    token: null,
    setStudentsInfo: (newStudentsInfo: any[]) => {
        set({ studentsInfo: newStudentsInfo })
    },
    anotherStudentState: [],
    setAnotherStudentState: (newValue: any[]) => {
        set({ anotherStudentState: newValue })
    },
}))

export const initializeStudentData = () => {
    if (typeof window !== 'undefined') {
        const storedData = localStorage.getItem('AUTH')
        const token = localStorage.getItem('token')

        return {
            studentData: JSON.parse(storedData || '{}'),
            token: token || null,
        }
    }

    return { studentData: null, token: null }
}

export const useLazyLoadedStudentData = () => {
    const {
        studentData,
        studentsInfo,
        token,
        setStudentsInfo,
        anotherStudentState,
        setAnotherStudentState,
    } = useStudentData()

    useEffect(() => {
        const initializeData = async () => {
            const { studentData: initializedData, token } =
                initializeStudentData()
            useStudentData.setState({ studentData: initializedData })

            // Now you have access to the token and can use it as needed
        }

        initializeData()
    }, []) // Empty dependency array ensures useEffect runs only once when the component mounts

    return {
        studentData,
        studentsInfo,
        setStudentsInfo,
        anotherStudentState,
        setAnotherStudentState,
    }
}

type proctoringDataType = {
    proctoringData: any
    setproctoringData: (newValue: any) => void
    fetchProctoringData: (submissionId: string, studentId: string) => void
}

export const getProctoringDataStore = create<proctoringDataType>((set) => ({
    proctoringData: {},
    setproctoringData: (newValue: any) => {
        set({ proctoringData: newValue })
    },
    fetchProctoringData: async (submissionId, studentId) => {
        await api
            .get(
                `/tracking/assessment/submissionId=${submissionId}?studentId=${studentId}`
            )
            .then((res) => {
                set({ proctoringData: res.data })
            })
    },
}))

type StoreStudentDataNew = {
    students: any
    totalPages: any
    loading: any
    offset: any
    totalStudents: any
    currentPage: any
    limit: any
    search: any
    setStudents: (newValue: any) => void
    setTotalPages: (newValue: any) => void
    setLoading: (newValue: any) => void
    setOffset: (newValue: number | ((prevValue: number) => number)) => void
    setTotalStudents: (newValue: any) => void
    setCurrentPage: (newValue: any) => void
    setLimit: (newValue: any) => void
    setSearch: (newValue: any) => void
}

export const getStoreStudentDataNew = create<StoreStudentDataNew>((set) => ({
    students: [],
    totalPages: 0,
    loading: false,
    offset: 0,
    totalStudents: 0,
    currentPage: 1,
    limit: 10,
    search: '',
    setStudents: (newValue: any) => set({ students: newValue }),
    setTotalPages: (newValue: any) => set({ totalPages: newValue }),
    setLoading: (newValue: any) => set({ loading: newValue }),
    setOffset: (newValue) =>
        set((state) => ({
            offset:
                typeof newValue === 'function'
                    ? newValue(state.offset)
                    : newValue,
        })),
    setTotalStudents: (newValue: any) => set({ totalStudents: newValue }),
    setCurrentPage: (newValue: any) => set({ currentPage: newValue }),
    setLimit: (newValue: any) => set({ limit: newValue }),
    setSearch: (newValue: any) => set({ search: newValue }),
}))

type storeBatchData = {
    studentsBatchData: any[]
    setStoreStudentBatchData: (newValue: any[]) => void
}

export const getStoreStudentBatchData = create<storeBatchData>((set) => ({
    studentsBatchData: [],
    setStoreStudentBatchData: (newValue: any[]) => {
        set({ studentsBatchData: newValue })
    },
}))
