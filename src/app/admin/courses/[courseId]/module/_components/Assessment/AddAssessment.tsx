import { PlusCircle, ExternalLink } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import {
    filteredCodingQuestions,
    filteredQuizQuestions,
    filteredOpenEndedQuestions,
    getChapterDetailsById,
} from '@/utils/admin'
import OpenEndedQuestions from '@/app/admin/courses/[courseId]/module/_components/Assessment/OpenEndedQuestions'
import QuizQuestions from '@/app/admin/courses/[courseId]/module/_components/Assessment/QuizQuestions'
import CodingTopics from '@/app/admin/courses/[courseId]/module/_components/codingChallenge/CodingTopics'
import CodingQuestions from '@/app/admin/courses/[courseId]/module/_components/Assessment/CodingQuestions'
import { Button } from '@/components/ui/button'
import SettingsAssessment from './SettingsAssessment'
import SelectedQuestions from './SelectedQuestions'

const AddAssessment = ({
    moduleId,
    content,
    fetchChapterContent,
    chapterData,
}: {
    moduleId: any
    content: any
    fetchChapterContent: any
    chapterData: any
}) => {
    const [selectedDifficulty, setSelectedDifficulty] =
        useState<string>('Any Difficulty')
    const [selectedTopic, setSelectedTopic] = useState<string>('All Topics')
    const [selectedLanguage, setSelectedLanguage] =
        useState<string>('All Languages')
    const [filteredQuestions, setFilteredQuestions] = useState<any[]>([])
    const [chapterTitle, setChapterTitle] = useState<string>('Untitled Chapter')
    const [questionType, setQuestionType] = useState<string>('coding')
    const [selectedCodingQuestions, setSelectedCodingQuestions] = useState<
        any[]
    >(content.codingQuesDetails || [])
    const [selectedQuizQuestions, setSelectedQuizQuestions] = useState<any[]>(
        content.mcqDetails || []
    )
    const [selectedOpenEndedQuestions, setSelectedOpenEndedQuestions] =
        useState<any[]>(content.openEndedQuesDetails || [])

    const [selectedCodingQuesIds, setSelectedCodingQuesIds] = useState<
        number[]
    >([])
    const [selectedQuizQuesIds, setSelectedQuizQuesIds] = useState<number[]>([])
    const [selectedOpenEndedQuesIds, setSelectedOpenEndedQuesIds] = useState<
        number[]
    >([])

    useEffect(() => {
        setChapterTitle(chapterData.chapterTitle)

        if (questionType === 'coding') {
            filteredCodingQuestions(
                setFilteredQuestions,
                selectedDifficulty,
                selectedTopic,
                selectedLanguage
            )
        } else if (questionType === 'mcq') {
            filteredQuizQuestions(
                setFilteredQuestions,
                selectedDifficulty,
                selectedTopic,
                selectedLanguage
            )
        } else {
            filteredOpenEndedQuestions(
                setFilteredQuestions,
                selectedDifficulty,
                selectedTopic,
                selectedLanguage
            )
        }
    }, [questionType, selectedDifficulty, selectedTopic, selectedLanguage])

    const handleCodingButtonClick = () => {
        setQuestionType('coding')
        filteredCodingQuestions(
            setFilteredQuestions,
            selectedDifficulty,
            selectedTopic,
            selectedLanguage
        )
    }

    const handleMCQButtonClick = () => {
        setQuestionType('mcq')
        filteredQuizQuestions(
            setFilteredQuestions,
            selectedDifficulty,
            selectedTopic,
            selectedLanguage
        )
    }

    const handleOpenEndedButtonClick = () => {
        setQuestionType('open-ended')
        filteredOpenEndedQuestions(
            setFilteredQuestions,
            selectedDifficulty,
            selectedTopic,
            selectedLanguage
        )
    }
    const handleSettingsButtonClick = () => {
        setQuestionType('settings')
    }

    useEffect(() => {
        fetchChapterContent(chapterData.chapterId)
    }, [fetchChapterContent])

    useEffect(() => {
        setSelectedCodingQuesIds(
            selectedCodingQuestions.map((question) => question.id)
        )
    }, [selectedCodingQuestions])

    useEffect(() => {
        setSelectedQuizQuesIds(
            selectedQuizQuestions.map((question) => question.id)
        )
    }, [selectedQuizQuestions])

    useEffect(() => {
        setSelectedOpenEndedQuesIds(
            selectedOpenEndedQuestions.map((question) => question.id)
        )
    }, [selectedOpenEndedQuestions])

    return (
        <div className="container mx-auto p-4">
            <div className="flex items-center mb-5">
                <Input
                    required
                    onChange={(e) => {
                        setChapterTitle(e.target.value)
                    }}
                    placeholder={chapterTitle}
                    className="p-0 text-3xl w-2/5 text-left font-semibold outline-none border-none focus:ring-0 capitalize"
                />
                <div className="text-secondary flex font-semibold items-center">
                    <h6 className="mr-2 text-sm">Preview</h6>
                    <ExternalLink size={15} />
                </div>
            </div>
            {/* select type of questions */}
            <div className="flex gap-2 mb-5">
                <Button
                    className={`${
                        questionType === 'coding'
                            ? ''
                            : 'bg-gray-200 text-gray-600'
                    }`}
                    onClick={handleCodingButtonClick}
                >
                    Coding Problems
                </Button>
                <Button
                    className={`${
                        questionType === 'mcq'
                            ? ''
                            : 'bg-gray-200 text-gray-600'
                    }`}
                    onClick={handleMCQButtonClick}
                >
                    MCQs
                </Button>
                <Button
                    className={`${
                        questionType === 'open-ended'
                            ? ''
                            : 'bg-gray-200 text-gray-600'
                    }`}
                    onClick={handleOpenEndedButtonClick}
                >
                    Open-Ended Questions
                </Button>
                <Button
                    onClick={handleSettingsButtonClick}
                    className={`${
                        questionType === 'settings'
                            ? ''
                            : 'bg-gray-200 text-gray-600'
                    }`}
                >
                    Settings
                </Button>
            </div>
            {/* DropDown Filters for questions:- */}
            {questionType !== 'settings' && (
                <>
                    <div className="mb-5 grid grid-cols-2">
                        <CodingTopics
                            selectedTopic={selectedTopic}
                            setSelectedTopic={setSelectedTopic}
                            selectedDifficulty={selectedDifficulty}
                            setSelectedDifficulty={setSelectedDifficulty}
                            selectedLanguage={selectedLanguage}
                            setSelectedLanguage={setSelectedLanguage}
                        />
                    </div>
                </>
            )}
            {/* Display & select questions + settings*/}
            <div className="grid grid-cols-2 ">
                <div>
                    <h3 className="text-left font-bold mb-5">
                        {questionType === 'coding'
                            ? 'Coding Problem Library'
                            : questionType === 'mcq'
                            ? 'MCQ Library'
                            : questionType === 'open-ended'
                            ? 'Open-Ended Question Library'
                            : ''}
                    </h3>
                    {questionType === 'coding' ? (
                        <CodingQuestions
                            questions={filteredQuestions}
                            setSelectedQuestions={setSelectedCodingQuestions}
                            selectedQuestions={selectedCodingQuestions}
                        />
                    ) : questionType === 'mcq' ? (
                        <QuizQuestions
                            questions={filteredQuestions}
                            setSelectedQuestions={setSelectedQuizQuestions}
                            selectedQuestions={selectedQuizQuestions}
                        />
                    ) : questionType == 'open-ended' ? (
                        <OpenEndedQuestions
                            questions={filteredQuestions}
                            setSelectedQuestions={setSelectedOpenEndedQuestions}
                            selectedQuestions={selectedOpenEndedQuestions}
                        />
                    ) : (
                        selectedOpenEndedQuestions && (
                            <SettingsAssessment
                                selectedCodingQuesIds={selectedCodingQuesIds}
                                selectedQuizQuesIds={selectedQuizQuesIds}
                                selectedOpenEndedQuesIds={
                                    selectedOpenEndedQuesIds
                                }
                                content={content}
                            />
                        )
                    )}
                </div>
                {questionType !== 'settings' && (
                    <>
                        <div className="">
                            <div>
                                {/* Display & remove the selected questions */}
                                <SelectedQuestions
                                    selectedCodingQuestions={
                                        selectedCodingQuestions
                                    }
                                    selectedQuizQuestions={
                                        selectedQuizQuestions
                                    }
                                    selectedOpenEndedQuestions={
                                        selectedOpenEndedQuestions
                                    }
                                    setSelectedCodingQuestions={
                                        setSelectedCodingQuestions
                                    }
                                    setSelectedQuizQuestions={
                                        setSelectedQuizQuestions
                                    }
                                    setSelectedOpenEndedQuestions={
                                        setSelectedOpenEndedQuestions
                                    }
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default AddAssessment
