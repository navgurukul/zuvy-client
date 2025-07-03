import React, { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CalendarIcon, Clock } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@radix-ui/react-popover'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { api } from '@/utils/axios.config'
import { formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import {Question,FetchFormRes,Props} from "@/app/student/courses/[viewcourses]/modules/_components/type";
const formSchema = z.object({
    section: z.array(
        z.object({
            id: z.number(),
            question: z.string(),
            options: z.record(z.string(), z.string()),
            typeId: z.number(),
            isRequired: z.boolean(),
            answer: z
                .union([z.string(), z.array(z.string()), z.date()])
                .optional(),
        })
    ),
})


const FeedbackForm = (props: Props) => {
    const [questions, setQuestions] = useState<Question[]>([])
    const [status, setStatus] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const getAllQuizQuestionHandler = useCallback(async () => {
        try {
            const res = await api.get<FetchFormRes>(
                `/tracking/getAllFormsWithStatus/${props.moduleId}?chapterId=${props.chapterId}`
            )
            if (res.data && res.data.questions) {
                setQuestions(res.data.questions)
                setStatus('Not completed')
            } else {
                setQuestions(res.data.trackedData || [])
                setStatus('Completed')
            }
        } catch (error) {
            toast.error({
                title: 'Error',
                description: 'An error occured while fetching the questions',
            })
            console.error('Error fetching quiz questions:', error)
        }
    }, [props.moduleId, props.chapterId, submitted])

    useEffect(() => {
        getAllQuizQuestionHandler()
    }, [getAllQuizQuestionHandler])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            section: [],
        },
    })

    useEffect(() => {
        if (questions?.length > 0) {
            form.reset({ section: questions })
        }
    }, [questions, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const transformedData = {
            submitForm: values.section.map((item) => {
                let chosenOptions: number[] = []
                let answer: string = ''

                if (item.typeId === 1 || item.typeId === 2) {
                    // For multiple choice or checkbox
                    if (Array.isArray(item.answer)) {
                        chosenOptions = item.answer.map(Number)
                    } else if (typeof item.answer === 'string') {
                        chosenOptions = [Number(item.answer)]
                    }
                    return {
                        questionId: item.id,
                        chosenOptions,
                    }
                } else {
                    // For other types (like paragraph, date, time)
                    answer = item.answer?.toString() || ''
                    return {
                        questionId: item.id,
                        answer,
                    }
                }
            }),
        }

        // Here you would typically send this data to your API
        try {
            const res = await api.post<Props>(
                `/tracking/updateFormStatus/${props.bootcampId}/${props.moduleId}?chapterId=${props.chapterId}`,
                transformedData
            )
            if (res) setSubmitted(true)
            const updateChapterResponse = await api.post(
                `/tracking/updateChapterStatus/${props.bootcampId}/${props.moduleId}?chapterId=${props.chapterId}`,
                transformedData
            )
            props.completeChapter()
            toast.success({
                title: res.data.data,
                description: 'Form has been submitted successfully!',
               
            })
        } catch (error) {
            toast.error({
                title: 'Error',
                description: 'Error fetching form questions:',
            })
        }
    }

    return (
        <>
           <ScrollArea className='h-[calc(100vh-110px)] lg:h-screen md:h-screen'>
           <div className="flex justify-center mt-6 md:mt-24 lg:mt-24 mr-3 md:mr-0 lg:mr-0">
                <div className="flex flex-col gap-5 text-left w-full md:w-1/2 lg:w-1/2">
                    <h1 className="text-xl font-bold text-secondary-foreground">
                        {props.content.title}
                    </h1>
                    <p className="text-lg">{props.content.description}</p>
                    <div className="description bg-blue-100 p-5 rounded-lg">
                        {status === 'Completed' ? (
                            <p className="text-lg">
                                You answers has been submitted..!
                            </p>
                        ) : (
                            <p className="text-lg">
                                Note: Please do not share any personal and
                                sensitive information in the responses. We will
                                never ask for such information from you
                            </p>
                        )}
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            {questions?.map((item, index) => (
                                <div
                                    key={index}
                                    className="space-y-3 text-start"
                                >
                                    {item.typeId === 1 && (
                                        <div className="mt-6">
                                            <div className="flex flex-row gap-x-2 font-semibold">
                                                <p>{index + 1}.</p>
                                                <p>{item.question}</p>
                                            </div>
                                            {status === 'Completed' ? (
                                                <div className="space-y-3 text-start mt-2 mb-10">
                                                    <RadioGroup
                                                        value={String
                                                            (item
                                                                .formTrackingData?.[0]
                                                                .chosenOptions?.[0]?? '')
                                                        }
                                                    >
                                                        {Object.keys(
                                                            item.options
                                                        ).map((option) => {
                                                            const answer =
                                                                item
                                                                    .formTrackingData[0]
                                                                    .chosenOptions[0]
                                                            return (
                                                                <div
                                                                    key={option}
                                                                    className={`flex space-x-2 mr-4 mt-1 p-3 ${
                                                                        answer ==
                                                                            option &&
                                                                        'border border-gray-800 rounded-lg'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center w-full space-x-3 space-y-0">
                                                                        <RadioGroupItem
                                                                            value={
                                                                                option
                                                                            }
                                                                            checked={
                                                                                answer ==
                                                                                option
                                                                            }
                                                                            disabled
                                                                        />
                                                                        <label className="font-normal">
                                                                            {
                                                                                item
                                                                                    .options[
                                                                                    option
                                                                                ]
                                                                            }
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </RadioGroup>
                                                </div>
                                            ) : (
                                                <FormField
                                                    control={form.control}
                                                    name={`section.${index}.answer`}
                                                    render={({ field }) => (
                                                        <div className="space-y-3 text-start">
                                                            <RadioGroup
                                                                onValueChange={
                                                                    field.onChange
                                                                }
                                                                value={
                                                                    field.value as string
                                                                }
                                                            >
                                                                {Object.keys(
                                                                    item.options
                                                                ).map(
                                                                    (
                                                                        optionKey
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                optionKey
                                                                            }
                                                                            className={`flex space-x-2 mr-4 mt-1 p-3 ${
                                                                                (field.value as string) ===
                                                                                    optionKey &&
                                                                                `border border-secondary rounded-lg`
                                                                            }`}
                                                                        >
                                                                            <div className="flex items-center w-full space-x-3 space-y-0">
                                                                                <RadioGroupItem
                                                                                    value={
                                                                                        optionKey
                                                                                    }
                                                                                />
                                                                                <label className="font-normal">
                                                                                    {
                                                                                        item
                                                                                            .options[
                                                                                            optionKey
                                                                                        ]
                                                                                    }
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </RadioGroup>
                                                        </div>
                                                    )}
                                                />
                                            )}
                                        </div>
                                    )}

                                    {item.typeId === 2 && (
                                        <div className="mt-6">
                                            <div className="flex flex-row gap-x-2 font-semibold">
                                                <p>{index + 1}.</p>
                                                <p>{item.question}</p>
                                            </div>
                                            {status === 'Completed' ? (
                                                <div className="mt-2 mb-10">
                                                    {Object.keys(
                                                        item.options
                                                    ).map((option) => {
                                                        const answer =
                                                            item
                                                                .formTrackingData[0]
                                                                .chosenOptions
                                                        const optionNumber =
                                                            Number(option)
                                                        return (
                                                            <div
                                                                key={option}
                                                                className={`flex space-x-2 mr-4 mt-1 p-3 ${
                                                                    answer.includes(
                                                                        optionNumber
                                                                    ) &&
                                                                    'border border-gray-800 rounded-lg'
                                                                }`}
                                                            >
                                                                <Checkbox
                                                                    checked={answer.includes(
                                                                        optionNumber
                                                                    )}
                                                                    disabled
                                                                    aria-label={
                                                                        option
                                                                    }
                                                                    className={`translate-y-[2px] mr-1 ${
                                                                        answer.includes(
                                                                            optionNumber
                                                                        ) &&
                                                                        'bg-green-500'
                                                                    }`}
                                                                />
                                                                {
                                                                    item
                                                                        .options[
                                                                        option
                                                                    ]
                                                                }
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="mt-2">
                                                    {Object.keys(
                                                        item.options
                                                    ).map((optionKey) => (
                                                        <FormField
                                                            key={optionKey}
                                                            control={
                                                                form.control
                                                            }
                                                            name={`section.${index}.answer`}
                                                            render={({
                                                                field,
                                                            }) => {
                                                                const fieldValue =
                                                                    (
                                                                        Array.isArray(
                                                                            field.value
                                                                        )
                                                                            ? field.value
                                                                            : []
                                                                    ) as string[] // Initialize with empty array if undefined
                                                                return (
                                                                    <div
                                                                        className={`flex space-x-2 mr-4 mt-1 p-3 ${
                                                                            fieldValue.includes(
                                                                                optionKey
                                                                            ) &&
                                                                            'border border-secondary rounded-lg'
                                                                        }`}
                                                                    >
                                                                        <FormItem>
                                                                            <FormControl>
                                                                                <Checkbox
                                                                                    checked={fieldValue.includes(
                                                                                        optionKey
                                                                                    )}
                                                                                    onCheckedChange={(
                                                                                        checked
                                                                                    ) => {
                                                                                        const newValue =
                                                                                            checked
                                                                                                ? [
                                                                                                      ...fieldValue,
                                                                                                      optionKey,
                                                                                                  ]
                                                                                                : fieldValue.filter(
                                                                                                      (
                                                                                                          val
                                                                                                      ) =>
                                                                                                          val !==
                                                                                                          optionKey
                                                                                                  )
                                                                                        field.onChange(
                                                                                            newValue
                                                                                        )
                                                                                    }}
                                                                                    aria-label={
                                                                                        item
                                                                                            .options[
                                                                                            optionKey
                                                                                        ]
                                                                                    }
                                                                                    className="translate-y-[2px] mr-1"
                                                                                />
                                                                            </FormControl>
                                                                            <FormLabel className="text-md font-light">
                                                                                {
                                                                                    item
                                                                                        .options[
                                                                                        optionKey
                                                                                    ]
                                                                                }
                                                                            </FormLabel>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    </div>
                                                                )
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {item.typeId === 3 && (
                                        <div className="mt-6">
                                            <div className="flex flex-row gap-x-2 font-semibold mb-3">
                                                <p>{index + 1}.</p>
                                                <p>{item.question}</p>
                                            </div>
                                            {status === 'Completed' ? (
                                                <p className="mt-2 mb-10">
                                                    {
                                                        item.formTrackingData[0]
                                                            ?.answer
                                                    }
                                                </p>
                                            ) : (
                                                <FormField
                                                    control={form.control}
                                                    name={`section.${index}.answer`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Textarea
                                                                    {...field}
                                                                    className="w-11/12 md:w-full lg:w-full h-[170px] px-3 py-2 border mx-auto mb-4 rounded-md" //w-[550px]
                                                                    placeholder="Type your answer..."
                                                                    value={
                                                                        field.value as string
                                                                    } // Ensured `value` is a string
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        field.onChange(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    } // Managed the change event
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                        </div>
                                    )}

                                    {item.typeId === 4 && (
                                        <div className="mt-6 mb-20 lg:mb-0 md:mb-0">
                                            <div className="flex flex-row gap-x-2 font-semibold">
                                                <p>{index + 1}.</p>
                                                <p>{item.question}</p>
                                            </div>
                                            {status === 'Completed' ? (
                                                <div className="flex flex-row gap-x-1 mt-2 mb-10">
                                                    <CalendarIcon className="h-4 w-4 opacity-50 m-1" />
                                                    <p>
                                                        {formatDate(
                                                            item
                                                                .formTrackingData[0]
                                                                ?.answer ?? ''
                                                        )}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-row gap-x-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`section.${index}.answer`}
                                                        render={({ field }) => {
                                                            const dateValue =
                                                                field.value instanceof
                                                                Date
                                                                    ? field.value
                                                                    : new Date() // Ensure field.value is a Date object

                                                            return (
                                                                <div className="flex item-start justify-start mt-2">
                                                                    <FormItem>
                                                                        <Popover>
                                                                            <PopoverTrigger
                                                                                asChild
                                                                            >
                                                                                <FormControl>
                                                                                    <Button
                                                                                        variant={
                                                                                            'outline'
                                                                                        }
                                                                                        className={`w-[230px] pl-3 text-left font-normal ${
                                                                                            !dateValue &&
                                                                                            'text-muted-foreground'
                                                                                        }`}
                                                                                    >
                                                                                        {dateValue ? (
                                                                                            format(
                                                                                                dateValue,
                                                                                                'PPP'
                                                                                            )
                                                                                        ) : (
                                                                                            <span>
                                                                                                Pick
                                                                                                a
                                                                                                date
                                                                                            </span>
                                                                                        )}
                                                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                                    </Button>
                                                                                </FormControl>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent
                                                                                className="w-auto bg-popover rounded-lg shadow-md p-6 my-3"
                                                                                align="start"
                                                                            >
                                                                                <Calendar
                                                                                    mode="single"
                                                                                    selected={
                                                                                        dateValue
                                                                                    }
                                                                                    onSelect={(
                                                                                        date
                                                                                    ) => {
                                                                                        if (
                                                                                            date
                                                                                        ) {
                                                                                            field.onChange(
                                                                                                date
                                                                                            )
                                                                                        }
                                                                                    }}
                                                                                    initialFocus
                                                                                />
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    </FormItem>
                                                                </div>
                                                            )
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {item.typeId === 5 && (
                                        <div className="mt-6">
                                            <div className="flex flex-row gap-x-2 font-semibold">
                                                <p>{index + 1}.</p>
                                                <p>{item.question}</p>
                                            </div>
                                            {status === 'Completed' ? (
                                                <div className="flex flex-row gap-x-1 mt-2 mb-10">
                                                    <Clock className="h-4 w-4 opacity-50 m-1" />
                                                    <p>
                                                        {
                                                            item
                                                                .formTrackingData[0]
                                                                ?.answer
                                                        }
                                                    </p>
                                                </div>
                                            ) : (
                                                <FormField
                                                    control={form.control}
                                                    name={`section.${index}.answer`}
                                                    render={({ field }) => (
                                                        <FormItem className="text-left flex flex-col w-[100px]">
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Time"
                                                                    {...field}
                                                                    type="time"
                                                                    value={
                                                                        field.value as string
                                                                    }
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {status !== 'Completed' && (
                                <Button type="submit" className="mt-0 md:mt-7 lg:mt-7 mb-24 lg:mb-0 md:mb-0">
                                    Submit Responses
                                </Button>
                            )}
                        </form>
                    </Form>
                </div>
            </div>
           </ScrollArea> 
        </>
    )
}

export default FeedbackForm
