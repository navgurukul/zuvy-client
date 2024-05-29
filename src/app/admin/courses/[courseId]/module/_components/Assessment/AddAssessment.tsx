import { PlusCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import {
    filteredCodingQuestions,
    filteredQuizQuestions,
    filteredOpenEndedQuestions,
} from '@/utils/admin'
import OpenEndedQuestions from '@/app/admin/courses/[courseId]/module/_components/Assessment/OpenEndedQuestions'
import QuizQuestions from '@/app/admin/courses/[courseId]/module/_components/Assessment/QuizQuestions'
import CodingTopics from '@/app/admin/courses/[courseId]/module/_components/codingChallenge/CodingTopics'
import CodingQuestions from '@/app/admin/courses/[courseId]/module/_components/Assessment/CodingQuestions'
import { Button } from '@/components/ui/button'
import { cn, difficultyColor, ellipsis } from '@/lib/utils'

const AddAssessment = ({ moduleId }: { moduleId: any }) => {
    const [selectedQuestions, setSelectedQuestions] = useState<any[]>([])
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
    >([])
    const [selectedQuizQuestions, setSelectedQuizQuestions] = useState<any[]>(
        []
    )
    const [selectedOpenEndedQuestions, setSelectedOpenEndedQuestions] =
        useState<any[]>([])

    useEffect(() => {
        setChapterTitle('Untitled Assessment')
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
                <Button className={`bg-gray-200 text-gray-600`}>
                    Settings
                </Button>
            </div>
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
            <div className="grid grid-cols-2 ">
                <div>
                    <h3 className="text-left font-bold">
                        {questionType === 'coding'
                            ? 'Coding Problem Library'
                            : questionType === 'mcq'
                            ? 'MCQ Library'
                            : 'Open-Ended Question Library'}
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
                    ) : (
                        <OpenEndedQuestions
                            questions={filteredQuestions}
                            setSelectedQuestions={setSelectedOpenEndedQuestions}
                            selectedQuestions={selectedOpenEndedQuestions}
                        />
                    )}
                </div>
                <div className="">
                    <div>
                        {/* Display the selected question */}
                        {questionType === 'coding' &&
                            selectedCodingQuestions && (
                                <div>
                                    <h3>Coding Question</h3>
                                    {selectedCodingQuestions.map(
                                        (question: any) => (
                                            <>
                                                <p>{question?.title}</p>
                                                <p>{question?.description}</p>
                                            </>
                                        )
                                    )}
                                </div>
                            )}
                        {questionType === 'mcq' && selectedQuizQuestions && (
                            <div>
                                <h3>Quiz Question</h3>
                                {selectedQuizQuestions.map((question: any) => (
                                    <>
                                        <p>{question?.question}</p>
                                    </>
                                ))}
                            </div>
                        )}
                        {questionType === 'open-ended' &&
                            selectedOpenEndedQuestions && (
                                <div className="w-full">
                                    <h3>Open-Ended Question</h3>
                                    {selectedOpenEndedQuestions.map(
                                        (question: any) => (
                                            <>
                                                <div
                                                    key={question.id}
                                                    className={`p-5 rounded-sm border border-gray-200 mb-4`}
                                                >
                                                    <div className="flex justify-between text-start items-center">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h2 className="font-bold text-lg">
                                                                    {ellipsis(
                                                                        question.question,
                                                                        30
                                                                    )}
                                                                </h2>
                                                                <span
                                                                    className={cn(
                                                                        `font-semibold text-secondary`,
                                                                        difficultyColor(
                                                                            question.difficulty
                                                                        )
                                                                    )}
                                                                >
                                                                    {
                                                                        question.difficulty
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="w-full">
                                                                <p className="text-gray-600 mt-1">
                                                                    {ellipsis(
                                                                        question.question,
                                                                        60
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <Link
                                                                href={''}
                                                                className="font-semibold text-sm mt-2 text-secondary"
                                                            >
                                                                View Full
                                                                Description
                                                            </Link>
                                                        </div>
                                                        <div className="flex">
                                                            <PlusCircle
                                                                onClick={() =>
                                                                    setSelectedQuestions(
                                                                        [
                                                                            ...selectedQuestions,
                                                                            question,
                                                                        ]
                                                                    )
                                                                }
                                                                className="text-secondary cursor-pointer"
                                                                size={20}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )
                                    )}
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddAssessment
