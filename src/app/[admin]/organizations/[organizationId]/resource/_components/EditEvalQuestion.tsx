'use client'

import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useZuvyEvalQuestionById } from '@/app/[admin]/hooks/useZuvyEvalQuestionById'
import { Pencil } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getDifficultyColor } from '@/lib/utils'


import { useUpdateQuestion } from '@/hooks/useUpdateQuestion'
import { toast } from 'react-toastify'
import { QuestionOptionMap } from '@/hooks/hookType'

interface EditZuvyEvalQuestionProps {
    questionId: number
    onUpdated?: () => void
}

const EditZuvyEvalQuestion = ({
    questionId,
    onUpdated,
}: EditZuvyEvalQuestionProps) => {
    const [open, setOpen] = useState(false)

    const { question, loading, error } = useZuvyEvalQuestionById({
        questionId,
        enabled: open,
    })
    const { updateQuestion, isUpdating } = useUpdateQuestion()

    const [questionText, setQuestionText] = useState('')
    const [options, setOptions] = useState<QuestionOptionMap>({
        '1': '',
        '2': '',
        '3': '',
        '4': '',
    })
    const [correctOption, setCorrectOption] = useState<number>(1)

    useEffect(() => {
        if (question) {
            setQuestionText(question.question)
            setOptions({
                '1': question.options?.['1'] ?? '',
                '2': question.options?.['2'] ?? '',
                '3': question.options?.['3'] ?? '',
                '4': question.options?.['4'] ?? '',
            })
            setCorrectOption(Number(question.correctOption))
        }
    }, [question])

    useEffect(() => {
        if (!open) {
            setQuestionText('')
            setOptions({ '1': '', '2': '', '3': '', '4': '' })
            setCorrectOption(1)
        }
    }, [open])

    const sortedOptionKeys = (Object.keys(options) as Array<keyof QuestionOptionMap>).sort(
        (a, b) => Number(a) - Number(b)
    )

    const handleSave = async () => {
        const result = await updateQuestion(questionId, {
            question: questionText,
            options,
            correctOption,
        })

        if (result) {
            toast.success('Question updated')
            setOpen(false)
            onUpdated?.()
        } else {
            toast.error('Failed to update question')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Pencil size={18} className="ml-5 cursor-pointer" />
            </DialogTrigger>
            <DialogContent className="max-w-[37rem]">
                <div className="w-full max-h-[600px] flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                        <div className="flex gap-x-3 text-foreground">
                            Edit Question
                            {question && (
                                <div className="flex gap-x-3 items-center flex-wrap">
                                    <span className="font-md text-[14px] text-success bg-success-foreground px-2 py-0.5 my-0.5 rounded-md">
                                        {question.domainName || 'No Domain'}
                                    </span>
                                    <span className="font-md text-[14px] text-success bg-success-foreground px-2 py-0.5 my-0.5 rounded-md">
                                        {question.topicName || 'No Topic'}
                                    </span>
                                    <span
                                        className={`font-normal text-[14px] px-2 py-0.5 my-0.5 rounded-md ${getDifficultyColor(
                                            question.difficulty
                                        )}`}
                                    >
                                        {question.difficulty}
                                    </span>
                                </div>
                            )}
                        </div>
                    </DialogHeader>

                    {loading && (
                        <div className="flex justify-center py-6">
                            <Spinner />
                        </div>
                    )}

                    {!loading && error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}

                    {!loading && !error && question && (
                        <div className="flex-1 min-h-0 mt-5">
                            <ScrollArea className="h-full pr-3">
                                <div className="mb-4 p-2">
                                    <div className="text-left text-gray-600 mb-2">
                                        <Textarea
                                            value={questionText}
                                            placeholder="Enter question text"
                                            className="min-h-[140px]"
                                            disabled
                                        />
                                    </div>
                                    <ul className="list-none pl-1">
                                        {sortedOptionKeys.map((key, index) => (
                                            <li
                                                key={key}
                                                className="mt-1 flex gap-x-2 items-center text-gray-600"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setCorrectOption(Number(key))}
                                                    disabled={isUpdating}
                                                    className={`w-5 h-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center ${
                                                        Number(key) === correctOption
                                                            ? 'border-[rgb(81,134,114)]'
                                                            : 'border-gray-300'
                                                    }`}
                                                    title="Mark as correct option"
                                                >
                                                    {Number(key) === correctOption && (
                                                        <span className="w-2.5 h-2.5 rounded-full bg-[rgb(81,134,114)]" />
                                                    )}
                                                </button>
                                                <p>{index + 1}.</p>
                                                <Input
                                                    value={options[key]}
                                                    disabled
                                                    className={
                                                        Number(key) === correctOption
                                                            ? 'border-2 border-[rgb(81,134,114)] text-[rgb(81,134,114)]'
                                                            : 'border-gray-300'
                                                    }
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </ScrollArea>
                        </div>
                    )}

                    <DialogFooter className="flex-shrink-0 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isUpdating}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isUpdating || loading}>
                            {isUpdating ? 'Saving...' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default EditZuvyEvalQuestion