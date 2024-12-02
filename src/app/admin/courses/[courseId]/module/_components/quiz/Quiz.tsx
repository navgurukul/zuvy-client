import React, { useEffect, useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import QuizLibrary from './QuizLibrary'
import { quizData, Options } from './QuizLibrary'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import QuizModal from './QuizModal'
import { api } from '@/utils/axios.config'
import { Tag } from '@/app/admin/resource/mcq/page'
import { toast } from '@/components/ui/use-toast'
import { getAllQuizQuestion } from '@/utils/admin'
import { getAllQuizData } from '@/store/store'

function Quiz(props: any) {
    const [tags, setTags] = useState<Tag[]>([])
    const [isOpen, setIsOpen] = useState(false)

    const [addQuestion, setAddQuestion] = useState<quizData[]>([])
    const [questionId, setQuestionId] = useState()
    const { quizData, setStoreQuizData } = getAllQuizData()

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
            // setTags(response.data.allTags)
            const transformedData = response.data.allTags.map(
                (item: { id: any; tagName: any }) => ({
                    id: item.id.toString(),
                    tagName: item.tagName,
                })
            )
            const tagArr = [
                { id: -1, tagName: 'All Topics' },
                ...transformedData,
            ]
            setTags(tagArr)
        }
    }
    const removeQuestionById = (questionId: number) => {
        setAddQuestion((prevQuestions: any) =>
            prevQuestions.filter((question: any) => question?.id !== questionId)
        )
    }
    // const saveQuizQUestionHandler = async () => {
    //     const selecedtedId = addQuestion?.map((item) => item.id)
    //     const transformedObject = {
    //         quizQuestions: selecedtedId,
    //     }

    //     await api
    //         .put(
    //             `/Content/editChapterOfModule/${props.moduleId}?chapterId=${props.chapterId}`,
    //             transformedObject
    //         )
    //         .then((res: any) => {
    //             toast({
    //                 title: 'Success',
    //                 description: res.message,
    //                 className:
    //                     'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
    //             })
    //         })
    //         .catch((error: any) => {
    //             toast({
    //                 title: 'Error',
    //                 description:
    //                     'An error occurred while saving the chapter the chapter.',
    //                 className:
    //                     'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
    //             })
    //         })
    // }
    const saveQuizQuestionHandler = async (
        requestBody: Record<string, any>
    ) => {
        try {
            const response = await api.put(
                `/Content/editChapterOfModule/${props.moduleId}?chapterId=${props.chapterId}`,
                requestBody
            )
            toast({
                title: 'Success',
                description: response?.data?.message || 'Saved successfully!',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'An error occurred while saving the chapter.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }

    const handleSaveQuiz = () => {
        const selectedIds = addQuestion?.map((item) => item.id)
        const requestBody = {
            quizQuestions: selectedIds,
        }

        saveQuizQuestionHandler(requestBody)
    }

    const getAllSavedQuizQuestion = useCallback(async () => {
        await api
            .get(`/Content/chapterDetailsById/${props.chapterId}`)
            .then((res) => {
                setAddQuestion(res.data.quizQuestionDetails)
            })
    }, [props.chapterId])

    useEffect(() => {
        getAllTags()
        getAllSavedQuizQuestion()
    }, [getAllSavedQuizQuestion])

    return (
        <div className="ml-12">
            <div className="flex flex-row items-center justify-start gap-x-6 mb-10">
                <Input
                    placeholder="Untitled Quiz"
                    className="p-0 text-3xl w-1/5 text-left font-semibold outline-none border-none focus:ring-0 capitalize"
                />
                {/* <Link
                    className="text-secondary font-semibold flex mt-2"
                    href=""
                >
                    Preview
                    <ExternalLink size={20} />
                </Link> */}
            </div>

            <div className="flex ">
                <QuizLibrary
                    addQuestion={addQuestion}
                    handleAddQuestion={handleAddQuestion}
                    tags={tags}
                />
                <Separator
                    orientation="vertical"
                    className="mx-4 w-[2px] h-96 mt-36 rounded"
                />
                <ScrollArea className={` w-full rounded-md`}>
                    <div className="">
                        <div className="flex flex-col items-center justify-between ">
                            <div className="flex justify-between w-full mt-36 ">
                                <h2 className="text-left text-gray-700 w-full font-semibold">
                                    Selected Question
                                </h2>
                                <div>
                                    {addQuestion?.length > 0 && (
                                        <div className="text-end  mr-10">
                                            <Button
                                                onClick={handleSaveQuiz}
                                                className="  h-8 "
                                            >
                                                Save
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-left w-full ">
                                {addQuestion?.length == 0 && (
                                    <h1 className="text-left italic">
                                        No Selected Questions
                                    </h1>
                                )}
                            </div>
                        </div>
                        <div className="h-96 overflow-y-scroll ">
                            {addQuestion?.map(
                                (questions: quizData, index: number) => (
                                    <QuizModal
                                        key={index}
                                        tags={tags}
                                        data={questions}
                                        addQuestion={addQuestion}
                                        removeQuestionById={removeQuestionById}
                                        saveQuizQuestionHandler={
                                            saveQuizQuestionHandler
                                        }
                                    />
                                )
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}

export default Quiz
