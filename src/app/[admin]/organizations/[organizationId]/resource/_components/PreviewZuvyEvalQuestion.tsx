'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { useZuvyEvalQuestionById } from '@/hooks/useZuvyEvalQuestionById'
import { Eye } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RemirrorForm } from '@/components/remirror-editor/RemirrorForm'

interface PreviewZuvyEvalQuestionProps {
    questionId: number
}

const PreviewZuvyEvalQuestion = ({ questionId }: PreviewZuvyEvalQuestionProps) => {
    const [open, setOpen] = useState(false)
    const { question, loading, error } = useZuvyEvalQuestionById({
        questionId,
        enabled: open,
    })

    const options = question?.options
        ? Object.entries(question.options).sort(
              ([a], [b]) => Number(a) - Number(b)
          )
        : []

    const difficultyColor = (difficulty: string) => {
        switch ((difficulty || '').toLowerCase()) {
            case 'easy':
                return 'bg-green-100 text-secondary'
            case 'medium':
                return 'bg-orange-100 text-yellow-dark'
            case 'hard':
                return 'bg-red-100 text-destructive'
            default:
                return 'bg-gray-200 text-gray-800'
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Eye 
                    size={18}
                    className="ml-5 cursor-pointer" 
                />
            </DialogTrigger>
            <DialogContent className="max-w-[37rem]">
                <div className="w-full max-h-[500px] flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                        <div className="flex gap-x-3 text-foreground">
                            Question Preview
                            {question && (
                                <div className="flex gap-x-3 items-center flex-wrap">
                                    <span className="font-md text-[14px] text-success bg-success-foreground px-2 py-0.5 my-0.5 rounded-md">
                                        {question.domainName || 'No Domain'}
                                    </span>
                                    <span className="font-md text-[14px] text-success bg-success-foreground px-2 py-0.5 my-0.5 rounded-md">
                                        {question.topicName || 'No Topic'}
                                    </span>
                                    <span
                                        className={`font-normal text-[14px] px-2 py-0.5 my-0.5 rounded-md ${difficultyColor(
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
                                        <RemirrorForm
                                            description={question.question}
                                            preview={true}
                                        />
                                    </div>
                                    <ul className="list-none pl-1">
                                        {options.map(([key, value], index) => (
                                            <li
                                                key={key}
                                                className="mt-1 flex gap-x-2 items-center text-gray-600"
                                            >
                                                <p>{index + 1}.</p>
                                                <Input
                                                    value={value as string}
                                                    readOnly
                                                    className={
                                                        Number(key) === Number(question.correctOption)
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
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default PreviewZuvyEvalQuestion
