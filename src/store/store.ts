import { set } from 'date-fns'
import { create } from 'zustand'
import { useEffect } from 'react'
import { api } from '@/utils/axios.config'

type CounterStore = {
    studentData: {
        name: string
        profile_picture: string
        email: string
        id: number
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

// ------------------------------
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
