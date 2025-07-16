import React, { useEffect, useState } from 'react'
import { DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { addClassToCodeTags } from '@/utils/admin'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, difficultyBgColor, difficultyColor } from '@/lib/utils'
import { getCodingQuestionTags } from '@/store/store'

interface OpenEndedQuestion {
    id: number
    difficulty: string
    question: string
    tagId: number
    marks: number
    usage: number
}

type Question = OpenEndedQuestion

type Props = {
    question: Question
    tag?: any
}

const PreviewOpenEnded = ({ question, tag }: Props) => {
    const { tags } = getCodingQuestionTags()
    const [tagName, setTagName] = useState<string | null>(tag?.tagName || null)
    const codeBlockClass =
        'text-gray-800 font-light bg-gray-300 p-4 rounded-lg text-left whitespace-pre-wrap w-full'

    useEffect(() => {
        if (!tag) {
            const matchingTag = tags.find(
                (tag: any) => tag.id === question.tagId
            )
            setTagName(matchingTag ? matchingTag.tagName : null)
        }
    }, [question.tagId])

    return (
        <div className="w-full max-h-[500px]">
            <DialogHeader className="">
                <DialogTitle className="text-xl font-bold text-gray-600">
                    Question Preview
                    {tagName && (
                        <span className="text-[12px] text-[#518672] bg-[#DCE7E3] rounded-[100px] ml-2 py-1 px-[8px]">
                            {tagName}
                        </span>
                    )}
                    <span
                        className={cn(
                            `text-[12px] text-[#518672] bg-[#DCE7E3] rounded-[100px] ml-2 py-1 px-[8px]`,
                            difficultyColor(question.difficulty), // Text color
                            difficultyBgColor(question.difficulty) // Background color
                        )}
                    >
                        {question.difficulty}
                    </span>
                </DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-6 text-left">
                {/* Render question description */}
                <ScrollArea className="pr-4">
                    <div>
                        <h4 className="font-semibold text-lg mb-5 text-gray-600">
                            Title and Description:
                        </h4>
                        <div className="text-left flex gap-2 mb-2">
                            <span className="font-bold flex text-gray-600">
                                <h6>Q.</h6>
                            </span>
                            <div
                                className={` text-wrap text-[16px] text-gray-600 ${
                                    question.question.includes('pre') &&
                                    'overflow-scroll'
                                } `}
                                dangerouslySetInnerHTML={{
                                    __html: addClassToCodeTags(
                                        question.question,
                                        codeBlockClass
                                    ),
                                }}
                            />
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}

export default PreviewOpenEnded
