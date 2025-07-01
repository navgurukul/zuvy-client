'use client'

import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarIcon, Clock, Loader2 } from 'lucide-react'
import { useFeedbackForm } from '@/hooks/useFeedbackForm'
import { format } from 'date-fns'
import { formatDate } from '@/lib/utils'

interface FeedbackFormContentProps {
    chapterDetails: {
        id: number
        title: string
        description: string | null
        status: string
        moduleId: string
        courseId: number
    }
    completeChapter: () => void
}

const FeedbackFormContent: React.FC<FeedbackFormContentProps> = ({
    chapterDetails,
    completeChapter,
}) => {
    const {
        questions,
        status,
        isLoading,
        getAllQuestions,
        submitForm,
        setQuestions,
    } = useFeedbackForm({
        moduleId: chapterDetails.moduleId,
        chapterId: chapterDetails.id,
        courseId: chapterDetails.courseId,
        completeChapter,
    })

    useEffect(() => {
        getAllQuestions()
    }, [getAllQuestions])

    if (isLoading) {
        return (
            <div className="w-full h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const isCompleted = status === 'Completed'

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        submitForm({ section: questions })
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-[600px] mx-auto px-6 py-8"
        >
            <div className="mb-6 text-left">
                <h1 className="text-xl font-semibold mb-2">
                    {chapterDetails.title || 'Module 2 Feedback'}
                </h1>
                {status === 'Completed' && (
                    <div className="text-md mb-4 bg-[#E5FFF3] text-[#00B37E] p-3 rounded-md">
                        Your feedback has been submitted successfully
                    </div>
                )}
                <p className="text-md text-muted-foreground">
                    Share your feedback about this module to help us improve.
                </p>
            </div>

            <div className="space-y-8">
                {questions.map((item, index) => (
                    <div key={item.id} className="space-y-3">
                        <div className="flex items-start">
                            <span className="mr-2 text-sm">{index + 1}.</span>
                            <span className="font-bold text-sm">
                                {item.question}
                            </span>
                        </div>

                        {/* Radio buttons (typeId: 1) */}
                        {item.typeId === 1 && (
                            <div className="ml-1 space-y-0">
                                {isCompleted ? (
                                    <RadioGroup
                                        value={item.formTrackingData?.[0]?.chosenOptions?.[0]?.toString()}
                                        disabled
                                        className="space-y-0"
                                    >
                                        {Object.entries(item.options).map(
                                            ([key, value]) => (
                                                <div key={key} className="flex">
                                                    <RadioGroupItem
                                                        value={key}
                                                        id={`q${item.id}_${key}`}
                                                        className="data-[state=checked]:border-[#4F46E5]"
                                                    />
                                                    <Label
                                                        htmlFor={`q${item.id}_${key}`}
                                                        className="ml-2 text-sm leading-tight"
                                                    >
                                                        {value}
                                                    </Label>
                                                </div>
                                            )
                                        )}
                                    </RadioGroup>
                                ) : (
                                    <RadioGroup
                                        value={item.answer as string}
                                        onValueChange={(value) => {
                                            const updatedQuestions = [
                                                ...questions,
                                            ]
                                            updatedQuestions[index] = {
                                                ...item,
                                                answer: value,
                                            }
                                            setQuestions(updatedQuestions)
                                        }}
                                        className="space-y-0"
                                    >
                                        {Object.entries(item.options).map(
                                            ([key, value]) => (
                                                <div key={key} className="flex">
                                                    <RadioGroupItem
                                                        value={key}
                                                        id={`q${item.id}_${key}`}
                                                        className="data-[state=checked]:border-[#4F46E5]"
                                                    />
                                                    <Label
                                                        htmlFor={`q${item.id}_${key}`}
                                                        className="ml-2 text-sm leading-tight"
                                                    >
                                                        {value}
                                                    </Label>
                                                </div>
                                            )
                                        )}
                                    </RadioGroup>
                                )}
                            </div>
                        )}

                        {/* Checkboxes (typeId: 2) */}
                        {item.typeId === 2 && (
                            <div className="ml-1 space-y-0">
                                {isCompleted ? (
                                    <div className="space-y-0">
                                        {Object.entries(item.options).map(
                                            ([key, value]) => {
                                                const answer =
                                                    item.formTrackingData?.[0]
                                                        ?.chosenOptions || []
                                                return (
                                                    <div
                                                        key={key}
                                                        className="flex"
                                                    >
                                                        <Checkbox
                                                            id={`q${item.id}_${key}`}
                                                            checked={answer.includes(
                                                                Number(key)
                                                            )}
                                                            disabled
                                                            className="data-[state=checked]:bg-[#4F46E5] data-[state=checked]:border-[#4F46E5]"
                                                        />
                                                        <Label
                                                            htmlFor={`q${item.id}_${key}`}
                                                            className="ml-2 text-sm leading-tight"
                                                        >
                                                            {value}
                                                        </Label>
                                                    </div>
                                                )
                                            }
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-0">
                                        {Object.entries(item.options).map(
                                            ([key, value]) => {
                                                const currentAnswers =
                                                    (item.answer as string[]) ||
                                                    []
                                                return (
                                                    <div
                                                        key={key}
                                                        className="flex"
                                                    >
                                                        <Checkbox
                                                            id={`q${item.id}_${key}`}
                                                            checked={currentAnswers.includes(
                                                                key
                                                            )}
                                                            onCheckedChange={(
                                                                checked
                                                            ) => {
                                                                const newAnswers =
                                                                    checked
                                                                        ? [
                                                                              ...currentAnswers,
                                                                              key,
                                                                          ]
                                                                        : currentAnswers.filter(
                                                                              (
                                                                                  a
                                                                              ) =>
                                                                                  a !==
                                                                                  key
                                                                          )
                                                                const updatedQuestions =
                                                                    [
                                                                        ...questions,
                                                                    ]
                                                                updatedQuestions[
                                                                    index
                                                                ] = {
                                                                    ...item,
                                                                    answer: newAnswers,
                                                                }
                                                                setQuestions(
                                                                    updatedQuestions
                                                                )
                                                            }}
                                                            className="data-[state=checked]:bg-[#4F46E5] data-[state=checked]:border-[#4F46E5]"
                                                        />
                                                        <Label
                                                            htmlFor={`q${item.id}_${key}`}
                                                            className="ml-2 text-sm leading-tight"
                                                        >
                                                            {value}
                                                        </Label>
                                                    </div>
                                                )
                                            }
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Text area (typeId: 3) */}
                        {item.typeId === 3 && (
                            <>
                                {isCompleted ? (
                                    <Textarea
                                        value={
                                            item.formTrackingData?.[0]?.answer
                                        }
                                        onChange={(e) => {
                                            const updatedQuestions = [
                                                ...questions,
                                            ]
                                            updatedQuestions[index] = {
                                                ...item,
                                                answer: e.target.value,
                                            }
                                            setQuestions(updatedQuestions)
                                        }}
                                        disabled={true}
                                        placeholder="Type your answer here..."
                                        className="min-h-[100px] resize-none mt-2 w-full"
                                    />
                                ) : (
                                    <Textarea
                                        value={item.answer as string}
                                        onChange={(e) => {
                                            const updatedQuestions = [
                                                ...questions,
                                            ]
                                            updatedQuestions[index] = {
                                                ...item,
                                                answer: e.target.value,
                                            }
                                            setQuestions(updatedQuestions)
                                        }}
                                        placeholder="Type your answer here..."
                                        className="min-h-[100px] resize-none mt-2 w-full"
                                    />
                                )}
                            </>
                        )}

                        {/* Date picker (typeId: 4) */}
                        {item.typeId === 4 && (
                            <>
                                {isCompleted ? (
                                    <div className="flex items-center mt-2">
                                        <Popover>
                                            <PopoverTrigger>
                                                <Button
                                                    variant="outline"
                                                    disabled
                                                    className="mt-2 w-[130px] justify-start text-left font-normal"
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {format(
                                                        new Date(
                                                            item
                                                                .formTrackingData?.[0]
                                                                ?.answer as string
                                                        ),
                                                        'd/M/yyyy'
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                        </Popover>
                                    </div>
                                ) : (
                                    <div className="flex items-center mt-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="mt-2 w-[230px] justify-start text-left font-normal"
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {item.answer
                                                        ? format(
                                                              new Date(
                                                                  item.answer as string
                                                              ),
                                                              'PPP'
                                                          )
                                                        : 'Pick a date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={
                                                        item.answer
                                                            ? new Date(
                                                                  item.answer as string
                                                              )
                                                            : undefined
                                                    }
                                                    onSelect={(date) => {
                                                        const updatedQuestions =
                                                            [...questions]
                                                        updatedQuestions[
                                                            index
                                                        ] = {
                                                            ...item,
                                                            answer: date?.toISOString(),
                                                        }
                                                        setQuestions(
                                                            updatedQuestions
                                                        )
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Time input (typeId: 5) */}
                        {item.typeId === 5 && (
                            <>
                                {isCompleted ? (
                                    <div className="flex items-center mt-2">
                                        <Input
                                            type="time"
                                            value={
                                                item.formTrackingData?.[0]
                                                    ?.answer
                                            }
                                            disabled
                                            onChange={(e) => {
                                                const updatedQuestions = [
                                                    ...questions,
                                                ]
                                                updatedQuestions[index] = {
                                                    ...item,
                                                    answer: e.target.value,
                                                }
                                                setQuestions(updatedQuestions)
                                            }}
                                            className="w-[100px]"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center mt-2">
                                        <Input
                                            type="time"
                                            value={item.answer as string}
                                            onChange={(e) => {
                                                const updatedQuestions = [
                                                    ...questions,
                                                ]
                                                updatedQuestions[index] = {
                                                    ...item,
                                                    answer: e.target.value,
                                                }
                                                setQuestions(updatedQuestions)
                                            }}
                                            className="w-[100px]"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>

            {isCompleted ? (
                <div className="mt-8 mb-6">
                    <Button
                        type="submit"
                        disabled
                        className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6"
                    >
                        Submitted ✓
                    </Button>
                </div>
            ) : (
                <div className="mt-8 mb-6">
                    <Button
                        type="submit"
                        className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6"
                    >
                        Submit Responses
                    </Button>
                </div>
            )}
        </form>
    )
}

export default FeedbackFormContent
