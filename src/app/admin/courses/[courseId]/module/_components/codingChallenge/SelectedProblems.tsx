import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { cn, difficultyColor, ellipsis } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'

const SelectedProblems = ({
    selectedQuestions,
    setSelectedQuestions,
    content,
    moduleId,
    chapterTitle,
}: {
    selectedQuestions: any
    setSelectedQuestions: any
    content: any
    moduleId: string
    chapterTitle: string
}) => {
    async function handleSaveChapter() {
        const response = await api.put(
            `/Content/editChapterOfModule/${moduleId}?chapterId=${content.id}`,
            chapterTitle
                ? {
                      title: chapterTitle,
                      codingQuestions: selectedQuestions[0]?.id,
                  }
                : {
                      codingQuestions: selectedQuestions[0]?.id,
                  }
        )
        if (response) {
            toast({
                title: 'Success',
                description: 'Chapter saved successfully',
                className: 'text-start capitalize border border-secondary',
            })
        }
    }

    return (
        <div className="ml-5 pl-5 border-l-2 text-start">
            <h2 className="font-semibold mb-5">Selected Coding Problems</h2>
            <div>
                {selectedQuestions.map((selectedQuestion: any, index: any) => (
                    <div
                        key={index}
                        className="flex justify-between items-start mb-7"
                    >
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg">
                                    {selectedQuestion.title}
                                </h3>
                                <span
                                    className={cn(
                                        `font-semibold text-secondary`,
                                        difficultyColor(
                                            selectedQuestion.difficulty
                                        )
                                    )}
                                >
                                    {selectedQuestion.difficulty}
                                </span>
                            </div>
                            <p className=" text-gray-600 mt-1">
                                {ellipsis(selectedQuestion.description, 50)}
                            </p>
                            <Link
                                href={''}
                                className="text-sm font-semibold mt-1 text-secondary"
                            >
                                View Full Description
                            </Link>
                        </div>
                        <XCircle
                            className="text-destructive ml-5 cursor-pointer"
                            size={20}
                            onClick={() => {
                                setSelectedQuestions([])
                            }}
                        />
                    </div>
                ))}
                {selectedQuestions.length > 0 && (
                    <Button onClick={handleSaveChapter}>Save</Button>
                )}
            </div>
        </div>
    )
}

export default SelectedProblems
