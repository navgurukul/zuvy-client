'use client'

import React, { useEffect } from 'react'
import { getFormPreviewStore } from '@/store/store'
import { fetchPreviewData } from '@/utils/admin'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { CalendarIcon } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
    Params,
    QuestionItem,
} from '@/app/[admin]/[organization]/courses/[courseId]/module/[moduleId]/chapter/[chapterId]/assignment/[topicId]/preview/TopicIdPageType'
const PreviewForm = ({ params }: { params: Params }) => {
    const { formPreviewContent, setFormPreviewContent } = getFormPreviewStore()

    useEffect(() => {
        fetchPreviewData(params, setFormPreviewContent)
    }, [params.chapterId, fetchPreviewData])

    return (
        <>
            <div className="fixed top-0 left-0 right-0 h-12 bg-[#518672] flex items-center justify-center z-50">
                <h1 className="text-center text-[16px] text-[#FFFFFF]">
                    You are in the Admin Preview Mode.
                </h1>
            </div>

            <div className="relative flex flex-col items-center justify-center px-4 py-8 mt-20">
                {/* Left Section: Go Back Button */}
                <Link
                    href={`/admin/courses/${params.courseId}/module/${params.moduleId}/chapters/${params.chapterId}`}
                    className="absolute left-0 top-0 flex items-center space-x-2 p-4"
                >
                    {' '}
                    {/* Absolute positioning */}
                    <ArrowLeft size={20} />
                    <p className="ml-1 text-sm font-medium text-gray-800">
                        Go back
                    </p>
                </Link>

                <div className="flex justify-center">
                    <div className="flex flex-col gap-5 text-left w-1/2">
                        <h1 className="text-lg font-bold text-gray-600">
                            {formPreviewContent?.title}
                        </h1>
                        <p className="text-lg text-gray-600">
                            {formPreviewContent?.description}
                        </p>
                        <div className="description bg-blue-100 p-5 rounded-lg">
                            <p className="text-lg text-gray-700">
                                Note: Please do not share any personal and
                                sensitive information in the responses. We will
                                never ask for such information from you
                            </p>
                        </div>

                        {formPreviewContent?.formQuestionDetails?.map(
                            (item: QuestionItem, index: number) => (
                                <div
                                    key={index}
                                    className="space-y-3 text-start"
                                >
                                    {item.typeId === 1 && (
                                        <div className="mt-6">
                                            <div className="flex flex-row gap-x-2 font-semibold text-gray-600">
                                                <p>{index + 1}.</p>
                                                <p>{item.question}</p>
                                            </div>

                                            <div className="space-y-3 text-start">
                                                <RadioGroup>
                                                    {Object.keys(
                                                        item.options
                                                    ).map((optionKey) => (
                                                        <div key={optionKey}>
                                                            <div className="flex items-center text-gray-600 w-full space-x-3 space-y-0">
                                                                <RadioGroupItem
                                                                    value={
                                                                        optionKey
                                                                    }
                                                                />
                                                                <label className="font-normal">
                                                                    {
                                                                        item
                                                                            .options[
                                                                            Number(
                                                                                optionKey
                                                                            )
                                                                        ]
                                                                    }
                                                                </label>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            </div>
                                        </div>
                                    )}

                                    {item.typeId === 2 && (
                                        <div className="mt-6">
                                            <div className="flex flex-row gap-x-2 font-semibold text-gray-600">
                                                <p>{index + 1}.</p>
                                                <p>{item.question}</p>
                                            </div>
                                            <div className="mt-2">
                                                {Object.keys(item.options).map(
                                                    (optionKey) => (
                                                        <div
                                                            key={optionKey}
                                                            className="flex text-gray-600"
                                                        >
                                                            <Checkbox
                                                                aria-label={
                                                                    item
                                                                        .options[
                                                                        Number(
                                                                            optionKey
                                                                        )
                                                                    ]
                                                                }
                                                                className="translate-y-[2px] mr-3"
                                                            />
                                                            <p>
                                                                {
                                                                    item
                                                                        .options[
                                                                        Number(
                                                                            optionKey
                                                                        )
                                                                    ]
                                                                }
                                                            </p>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {item.typeId === 3 && (
                                        <div className="mt-6">
                                            <div className="flex flex-row gap-x-2 font-semibold mb-3 text-gray-600">
                                                <p>{index + 1}.</p>
                                                <p>{item.question}</p>
                                            </div>
                                            <Textarea
                                                className="w-full h-[170px] px-3 py-2 border rounded-md text-gray-600" //w-[550px]
                                                placeholder="Type your answer..."
                                            />
                                        </div>
                                    )}

                                    {item.typeId === 4 && (
                                        <div className="mt-6">
                                            <div className="flex flex-row gap-x-2 font-semibold text-gray-600">
                                                <p>{index + 1}.</p>
                                                <p>{item.question}</p>
                                            </div>
                                            <div className="flex flex-row gap-x-2">
                                                <Button className="border border-input text-gray-600 bg-background hover:border-[rgb(81,134,114)]">
                                                    <span>Pick a date</span>
                                                    <CalendarIcon className="ml-3 h-4 w-4 opacity-50" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {item.typeId === 5 && (
                                        <div className="mt-6">
                                            <div className="flex flex-row gap-x-2 font-semibold text-gray-600">
                                                <p>{index + 1}.</p>
                                                <p>{item.question}</p>
                                            </div>
                                            <Input
                                                placeholder="Time"
                                                type="time"
                                                className="w-[100px] text-gray-600"
                                            />
                                        </div>
                                    )}
                                </div>
                            )
                        )}
                        <Button
                            type="submit"
                            className="mt-7 w-2/5 bg-success-dark opacity-75 disabled:pointer-events-auto disabled:cursor-not-allowed"
                            disabled
                        >
                            Submit Responses
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PreviewForm
