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
