import React, { useMemo, useEffect, useState } from 'react'
import { useSearchParams, useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Clock } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useFeedbackForm, formSchema } from '@/app/student/hooks/useFeedbackForm'
import {FeedbackFormContentProps,FeedbackQuestion,QuestionItem} from '@/app/student/_components/chapter-content/componentChapterType'
import useWindowSize from '@/hooks/useHeightWidth'
import {FeedbackFormSkeleton} from "@/app/student/_components/Skeletons";
import { toast } from '@/components/ui/use-toast'
import { CAREER_TOUR_BOOTCAMP_IDS, isNumberQuestion } from '@/lib/utils'

const FeedbackFormContent: React.FC<FeedbackFormContentProps> = ({
    chapterDetails,
    onChapterComplete,
}) => {
    const { courseId: courseIdParam, moduleId: moduleIdParam } = useParams()
    const router = useRouter()
    const { width } = useWindowSize();
    const isMobile = width < 768;

    const moduleId = useMemo(
        () =>
            chapterDetails.moduleId?.toString() ||
            moduleIdParam?.toString() ||
            null,
        [chapterDetails.moduleId, moduleIdParam]
    )
    const bootcampId = useMemo(
        () => courseIdParam?.toString() || null,
        [courseIdParam]
    )
    const isCareerTour = CAREER_TOUR_BOOTCAMP_IDS.includes(Number(bootcampId))
    const chapterId = useMemo(
        () => chapterDetails.id?.toString() || null,
        [chapterDetails.id]
    )

    const { questions, status, loading, submitForm, setQuestions } =
        useFeedbackForm({
            moduleId: moduleId ?? '',
            chapterId: chapterId ? Number(chapterId) : 0,
            bootcampId: bootcampId ? Number(bootcampId) : 0,
            onSuccess: () => {
                onChapterComplete() 
            },
        })
    const [emailErrors, setEmailErrors] = useState<Record<number, boolean>>({})
    const [numberErrors, setNumberErrors] = useState<Record<number, boolean>>({})

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            section: questions || [],
        },
    })

    useEffect(() => {
        if (questions?.length > 0) {
            form.reset({ section: questions })
        }
    }, [questions, form])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const invalidEmails = isCareerTour
                ? Object.fromEntries(
                      questions
                          .filter((q) => /\b(e-?mail)(\s+address)?\b/i.test(q.question || ''))
                          .filter((q) => {
                              const answer = typeof q.answer === 'string' ? q.answer.trim() : ''
                              return answer !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer)
                          })
                          .map((q) => [q.id, true])
                  )
                : {}
            const invalidNumbers = isCareerTour
                ? Object.fromEntries(
                      questions
                          .filter((q) => isNumberQuestion(q.question))
                          .filter((q) => {
                              const answer = typeof q.answer === 'string' ? q.answer : ''
                              return answer !== '' && !/^\d+$/.test(answer)
                          })
                          .map((q) => [q.id, true])
                  )
                : {}
            setEmailErrors(invalidEmails)
            setNumberErrors(invalidNumbers)
            if (Object.keys(invalidEmails).length > 0 || Object.keys(invalidNumbers).length > 0) return

            const result = formSchema.safeParse({ section: questions })
            if (!result.success) {
                result.error.errors.forEach((error) => {
                    toast({
                        title: 'Error Submitting Feedback',
                        description: error.message,
                        variant: 'destructive',
                    })
                })
                return
            }

            const formData = {
                section: questions.map((q) => ({
                    ...q,
                    // Keep the selected option key unchanged. The radio group
                    // and the tracking API both use the option key directly.
                    answer: q.answer || null,
                })),
            }
            await submitForm(formData)
        } catch (error) {
            console.error('Form submission error:', error)
        }
    }

      if (loading) {
        return <FeedbackFormSkeleton/>;
    }
    const isCompleted = status === 'Completed'

    return (
        <div className={`${isMobile ? '' : 'pt-10'} min-h-full bg-gradient-to-br from-background via-card-light to-background  px-2 sm:px-0`}>
            <div className="max-w-4xl mx-auto">
                <ScrollArea className={`${isMobile ? 'h-[75vh]' : 'h-[80vh]'}`}  >
                <form
                    onSubmit={handleSubmit}
                    className="w-full"
                >
            <div className="mb-6 text-left">
                <h5 className=" font-semibold mb-2">
                    {chapterDetails.title || 'Module 2 Feedback'}
                </h5>
                {status === 'Completed' && (
                    <div className="text-md mb-4 rounded-md bg-[#E5FFF3] p-3 text-[#00B37E] dark:bg-[#12352B] dark:text-[#4ADEA8]">
                        Registered successfully
                    </div>
                )}
                <p className={`text-md text-muted-foreground ${isCareerTour ? 'hidden' : ''}`}>
                    Share your feedback about this module to help us improve.
                </p>
            </div>

            <div className="space-y-8 ">
                {questions?.map((item:QuestionItem , index:number) => (
                    <div key={item.id} className="space-y-3">
                        <div className="flex items-center">
                            <span className="mr-2 text-sm">{index + 1}.</span>
                            <span className="font-bold text-sm">
                                {item.question}
                            </span>
                            {item.isRequired && (
                                <span className="text-red-500 text-xs ml-2">
                                    (Required)
                                </span>
                            )}
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
                                                        {value as string}
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
                                                        {value as string}
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
                                                            {value as string}
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
                                                    (item.answer as unknown as string[]) ||
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
                                                            {value as string}
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
                                        rows={1}
                                        className="mt-2 h-9 min-h-0 w-[90%] ml-5 resize-y overflow-auto"
                                    />
                                ) : (
                                    <Textarea
                                        value={item.answer as string}
                                        onChange={(e) => {
                                            const answer = isCareerTour && isNumberQuestion(item.question)
                                                ? e.target.value.replace(/\D/g, '')
                                                : e.target.value
                                            const updatedQuestions = [
                                                ...questions,
                                            ]
                                            updatedQuestions[index] = {
                                                ...item,
                                                answer,
                                            }
                                            setQuestions(updatedQuestions)
                                        }}
                                        inputMode={isCareerTour && isNumberQuestion(item.question) ? 'numeric' : undefined}
                                        placeholder="Type your answer here..."
                                        rows={1}
                                        className="mt-2 h-9 min-h-0 w-[90%] ml-5 resize-y overflow-auto"
                                    />
                                )}
                                {emailErrors[item.id] && (
                                    <p className="mt-1 ml-5 text-sm text-red-500">Enter a valid email address.</p>
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
                                                    {item.formTrackingData?.[0]
                                                        ?.answer &&
                                                        format(
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
                                           value={item.formTrackingData?.[0]?.answer}
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
                                            className="w-[7rem]"
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
                                            className="w-[7rem]"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>

            {isCompleted? (
                <div className="mt-8 mb-6">
                    <Button
                        type="submit"
                        disabled
                        className="bg-primary hover:bg-primary-dark text-primary-foreground px-6"
                    >
                        Submitted ✓
                    </Button>
                </div>
            ) : (
                <div className="mt-8 mb-6">
                    <Button
                        type="submit"
                        className="bg-primary hover:bg-primary-dark text-primary-foreground px-6"
                    >
                        Submit Feedback
                    </Button>
                </div>
            )}
                </form>
                </ScrollArea>
            </div>
        </div>
    )
}

export default FeedbackFormContent
