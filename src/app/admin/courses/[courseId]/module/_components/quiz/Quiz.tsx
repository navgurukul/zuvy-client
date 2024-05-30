import React, { useState } from 'react'

import Link from 'next/link'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { Separator } from '@/components/ui/separator'
import { ExternalLink } from 'lucide-react'
import QuizLibrary from './QuizLibrary'
import { quizData, Options } from './QuizLibrary'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import QuizModal from './QuizModal'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import NewMcqProblemForm from '@/app/admin/resource/_components/NewMcqProblemForm'
import { api } from '@/utils/axios.config'
import { Tag } from '@/app/admin/resource/mcq/page'
import { toast } from '@/components/ui/use-toast'
import { RequestBodyType } from '@/app/admin/resource/_components/NewMcqProblemForm'

interface QuizProps {
    content: Object
}

function Quiz({ content }: QuizProps) {
    const [activeTab, setActiveTab] = useState('anydifficulty')
    const [tags, setTags] = useState<Tag[]>([])
    const [isOpen, setIsOpen] = useState(false)

    const [addQuestion, setAddQuestion] = useState<quizData[]>([])

    const handleAddQuestion = (data: any) => {
        const uniqueData = data.filter((question: quizData) => {
            return !addQuestion.some(
                (existingQuestion: quizData) =>
                    existingQuestion.id === question.id
            )
        })
        setAddQuestion((prevQuestions: quizData[]) => [
            ...prevQuestions,
            ...uniqueData,
        ])
    }
    const openModal = () => setIsOpen(true)
    const closeModal = () => setIsOpen(false)
    async function getAllTags() {
        const response = await api.get('Content/allTags')
        if (response) {
            setTags(response.data.allTags)
        }
    }
    const removeQuestionById = (questionId: number) => {
        setAddQuestion((prevQuestions: any) =>
            prevQuestions.filter((question: any) => question.id !== questionId)
        )
    }

    const handleCreateQuizQuestion = async (requestBody: RequestBodyType) => {
        try {
            const res = await api
                .post(`/Content/quiz`, requestBody)
                .then((res) => {
                    toast({
                        title: res.data.status || 'Success',
                        description:
                            res.data.message || 'Quiz Question Created',
                    })
                })
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    'There was an error creating the quiz question. Please try again.',
            })
        }
    }

    return (
        <>
            <div className="flex flex-row items-center justify-start gap-x-6 mb-10">
                <Input
                    placeholder="Untitled Quiz"
                    className="p-0 text-3xl w-1/5 text-left font-semibold outline-none border-none focus:ring-0 capitalize"
                />
                <Link
                    className="text-secondary font-semibold flex mt-2"
                    href=""
                >
                    Preview
                    <ExternalLink size={20} />
                </Link>
            </div>

            <div className="flex gap-x-2">
                <QuizLibrary
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    addQuestion={addQuestion}
                    handleAddQuestion={handleAddQuestion}
                />
                <Separator
                    orientation="vertical"
                    className="mx-4 w-[2px] h-screen rounded"
                />
                <ScrollArea className="h-screen w-full rounded-md">
                    <div className="flex flex-col gap-y-4">
                        {addQuestion.map(
                            (questions: quizData, index: number) => (
                                <QuizModal
                                    key={index}
                                    data={questions}
                                    removeQuestionById={removeQuestionById}
                                />
                            )
                        )}
                        {addQuestion.length > 0 && (
                            <Button
                                variant={'outline'}
                                className="text-secondary font-semibold"
                            >
                                Save
                            </Button>
                        )}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="text-secondary font-semibold"
                                >
                                    Add Question
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>New MCQ</DialogTitle>
                                </DialogHeader>
                                <div className="w-full">
                                    <NewMcqProblemForm
                                        handleCreateQuizQuestion={
                                            handleCreateQuizQuestion
                                        }
                                        tags={tags}
                                        closeModal={closeModal}
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </ScrollArea>

                <div className="w-full mt-6">
                    {content &&
                        (
                            content as {
                                id: number
                                question: string
                                options: string[]
                                correctOption: string
                            }[]
                        ).map(
                            (
                                { id, question, options, correctOption },
                                index
                            ) => (
                                <div key={id} className="text-start mb-5">
                                    <p>
                                        Q{index + 1}. {question}
                                    </p>
                                    <ul className="text-start">
                                        {Object.entries(options).map(
                                            ([key, value]) => (
                                                <li
                                                    key={key}
                                                    className={`rounded-sm my-1 p-2 ${
                                                        correctOption ===
                                                        key.toString()
                                                            ? 'bg-secondary text-white'
                                                            : ''
                                                    }`}
                                                >
                                                    {value}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            )
                        )}
                </div>
            </div>
        </>
    )
}

export default Quiz
