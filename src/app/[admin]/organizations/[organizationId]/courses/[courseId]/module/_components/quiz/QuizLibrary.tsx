// External imports
import React, { useCallback, useEffect, useMemo, useState } from 'react'

// Internal imports
import QuizList from './QuizList'
import { api } from '@/utils/axios.config'
import useDebounce from '@/hooks/useDebounce'
import CodingTopics from '../codingChallenge/CodingTopics'
import {
    QuizDataLibrary,
    LibraryOption,
    Tag,
} from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/module/_components/quiz/ModuleQuizType'

function QuizLibrary({
    addQuestion,
    handleAddQuestion,
    tags,
    quizData,
    canEdit = true,
}: {
    addQuestion: any
    handleAddQuestion: any
    tags: any
    quizData: any
    canEdit?: boolean
}) {
    // const [search, setSearch] = useState<string>('')
    // const debouncedSeatch = useDebounce(search, 1000)
    // const [selectedOptions, setSelectedOptions] = useState<LibraryOption[]>([
    //     { id: -1, tagName: 'All Topics' },
    // ])
    // const [selectedDifficulty, setSelectedDifficulty] = useState([
    //     'Any Difficulty',
    // ])
    // const [quizData, setQuizData] = useState<{
    //     allQuestions:  QuizDataLibrary[]
    //     easyQuestions:  QuizDataLibrary[]
    //     mediumQuestions:  QuizDataLibrary[]
    //     hardQuestions:  QuizDataLibrary[]
    // }>({
    //     allQuestions: [],
    //     easyQuestions: [],
    //     mediumQuestions: [],
    //     hardQuestions: [],
    // })

    // const fetchQuizQuestions = useCallback(
    //     async (
    //         searchTerm: string = '',
    //         selectedOptions: any[],
    //         selectedDifficulty: any[]
    //     ) => {
    //         try {
    //             let url = '/Content/allQuizQuestions'

    //             const queryParams = []

    //             let selectedTagIds = ''
    //             selectedOptions.forEach((topic: any) => {
    //                 if (topic.id !== -1 && topic.id !== 0) {
    //                     // Skip 'All Topics'
    //                     selectedTagIds += `&tagId=${topic.id}`
    //                 }
    //             })

    //             // Handle multiple selected difficulties, but ignore 'Any Difficulty'
    //             let selectedDiff = ''
    //             selectedDifficulty.forEach((difficulty: string) => {
    //                 if (difficulty !== 'Any Difficulty') {
    //                     selectedDiff += `&difficulty=${difficulty}`
    //                 }
    //             })

    //             if (selectedTagIds.length > 0) {
    //                 queryParams.push(selectedTagIds.substring(1)) // Remove the first '&'
    //             }
    //             if (selectedDiff.length > 0) {
    //                 queryParams.push(selectedDiff.substring(1)) // Remove the first '&'
    //             }
    //             if (searchTerm) {
    //                 queryParams.push(`searchTerm=${searchTerm}`)
    //             }

    //             // Combine query parameters into the URL
    //             if (queryParams.length > 0) {
    //                 url += '?' + queryParams.join('&')
    //             }

    //             const response = await api.get(url)

    //             const allQuestions: QuizDataLibrary[] = response?.data?.data

    //             const easyQuestions = allQuestions.filter(
    //                 (question) => question.difficulty === 'Easy'
    //             )
    //             const mediumQuestions = allQuestions.filter(
    //                 (question) => question.difficulty === 'Medium'
    //             )
    //             const hardQuestions = allQuestions.filter(
    //                 (question) => question.difficulty === 'Hard'
    //             )

    //             setQuizData({
    //                 allQuestions,
    //                 easyQuestions,
    //                 mediumQuestions,
    //                 hardQuestions,
    //             })
    //         } catch (error) {
    //             console.error('Error fetching quiz questions:', error)
    //         }
    //     },
    //     [debouncedSeatch, selectedOptions, selectedDifficulty]
    // )

    // useEffect(() => {
    //     fetchQuizQuestions(debouncedSeatch, selectedOptions, selectedDifficulty)
    // }, [
    //     debouncedSeatch,
    //     fetchQuizQuestions,
    //     selectedOptions,
    //     selectedDifficulty,
    // ])

    const renderQuizList = useMemo(() => {
        return (
            <QuizList
                addQuestion={addQuestion}
                handleAddQuestion={handleAddQuestion}
                questionData={quizData.allQuestions}
                tags={tags}
                canEdit={canEdit}
            />
        )
    }, [quizData, addQuestion, handleAddQuestion, canEdit])

    return (
        <div className="w-full flex flex-col gap-3">
            <div className="w-full h-max-content mt-4">{renderQuizList}</div>
        </div>
    )
}

export default QuizLibrary
