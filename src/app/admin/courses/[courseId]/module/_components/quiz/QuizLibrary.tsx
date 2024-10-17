// External imports
import React, { useCallback, useEffect, useMemo, useState } from 'react'

// Internal imports
import QuizList from './QuizList'
import { api } from '@/utils/axios.config'
import useDebounce from '@/hooks/useDebounce'
import CodingTopics from '../codingChallenge/CodingTopics'
export interface quizData {
    id: number
    question: string
    options: Options
    correctOption: string
    marks: number
    difficulty: string
    tagId: number
}

export interface Options {
    option1: string
    option2: string
    option3: string
    option4: string
}

interface Option {
    tagName: string
    id: number
}

function QuizLibrary({
    addQuestion,
    handleAddQuestion,
    tags,
}: {
    addQuestion: any
    handleAddQuestion: any
    tags: any
}) {
    const [search, setSearch] = useState<string>('')
    const debouncedSeatch = useDebounce(search, 1000)
    const [selectedOptions, setSelectedOptions] = useState<Option[]>([
        { id: -1, tagName: 'All Topics' },
    ])
    const [selectedDifficulty, setSelectedDifficulty] = useState([
        'Any Difficulty',
    ])
    const [quizData, setQuizData] = useState<{
        allQuestions: quizData[]
        easyQuestions: quizData[]
        mediumQuestions: quizData[]
        hardQuestions: quizData[]
    }>({
        allQuestions: [],
        easyQuestions: [],
        mediumQuestions: [],
        hardQuestions: [],
    })

    const fetchQuizQuestions = useCallback(
        async (
            searchTerm: string = '',
            selectedOptions: any[],
            selectedDifficulty: any[]
        ) => {
            try {
                let url = '/Content/allQuizQuestions'

                const queryParams = []

                let selectedTagIds = ''
                selectedOptions.forEach((topic: any) => {
                    if (topic.id !== -1 && topic.id !== 0) {
                        // Skip 'All Topics'
                        selectedTagIds += `&tagId=${topic.id}`
                    }
                })

                // Handle multiple selected difficulties, but ignore 'Any Difficulty'
                let selectedDiff = ''
                selectedDifficulty.forEach((difficulty: string) => {
                    if (difficulty !== 'Any Difficulty') {
                        selectedDiff += `&difficulty=${difficulty}`
                    }
                })

                if (selectedTagIds.length > 0) {
                    queryParams.push(selectedTagIds.substring(1)) // Remove the first '&'
                }
                if (selectedDiff.length > 0) {
                    queryParams.push(selectedDiff.substring(1)) // Remove the first '&'
                }
                if (searchTerm) {
                    queryParams.push(`searchTerm=${searchTerm}`)
                }

                // Combine query parameters into the URL
                if (queryParams.length > 0) {
                    url += '?' + queryParams.join('&')
                }

                const response = await api.get(url)

                const allQuestions: quizData[] = response.data

                const easyQuestions = allQuestions.filter(
                    (question) => question.difficulty === 'Easy'
                )
                const mediumQuestions = allQuestions.filter(
                    (question) => question.difficulty === 'Medium'
                )
                const hardQuestions = allQuestions.filter(
                    (question) => question.difficulty === 'Hard'
                )

                setQuizData({
                    allQuestions,
                    easyQuestions,
                    mediumQuestions,
                    hardQuestions,
                })
            } catch (error) {
                console.error('Error fetching quiz questions:', error)
            }
        },
        [debouncedSeatch, selectedOptions, selectedDifficulty]
    )

    useEffect(() => {
        fetchQuizQuestions(debouncedSeatch, selectedOptions, selectedDifficulty)
    }, [
        debouncedSeatch,
        fetchQuizQuestions,
        selectedOptions,
        selectedDifficulty,
    ])

    const renderQuizList = useMemo(() => {
        return (
            <QuizList
                addQuestion={addQuestion}
                handleAddQuestion={handleAddQuestion}
                questionData={quizData.allQuestions}
            />
        )
    }, [quizData, addQuestion, handleAddQuestion])

    return (
        <div className="w-1/2 flex flex-col gap-3">
            <h2 className="text-left text-gray-700 font-semibold">
                MCQ Library
            </h2>
            <div className="flex">
                <CodingTopics
                    setSearchTerm={setSearch}
                    searchTerm={search}
                    tags={tags}
                    selectedTopics={selectedOptions}
                    setSelectedTopics={setSelectedOptions}
                    selectedDifficulties={selectedDifficulty}
                    setSelectedDifficulties={setSelectedDifficulty}
                />
            </div>
            <div className="w-full h-max-content my-6">{renderQuizList}</div>
        </div>
    )
}

export default QuizLibrary
