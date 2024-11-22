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
            prevQuestions.filter((question: any) => question.id !== questionId)
        )
    }
    const saveQuizQUestionHandler = async () => {
        const selecedtedId = addQuestion?.map((item) => item.id)
        const transformedObject = {
            quizQuestions: selecedtedId,
        }

        await api
            .put(
                `/Content/editChapterOfModule/${props.moduleId}?chapterId=${props.chapterId}`,
                transformedObject
            )
            .then((res: any) => {
                toast({
                    title: 'Success',
                    description: res.message,
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                })
            })
            .catch((error: any) => {
                toast({
                    title: 'Error',
                    description:
                        'An error occurred while saving the chapter the chapter.',
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                })
            })
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

    console.log(props)
    return (
        <>
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

            <div className="flex gap-x-2">
                <QuizLibrary
                    addQuestion={addQuestion}
                    handleAddQuestion={handleAddQuestion}
                    tags={tags}
                />
                <Separator
                    orientation="vertical"
                    className="mx-4 w-[2px] h-screen rounded"
                />
                <ScrollArea className="h-screen w-full rounded-md">
                    <div>
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
                            <div className="text-end mt-2">
                                <Button onClick={saveQuizQUestionHandler}>
                                    Save
                                </Button>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </>
    )
}

export default Quiz
