'use client'
// External imports
import React, { useState } from 'react'
import * as z from 'zod'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
// import { Card } from '@/components/ui/card'
import { Card, CardHeader, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, difficultyQuestionBgColor } from '@/lib/utils'

// Internal imports
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectItem,
    Select,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { Spinner } from '@/components/ui/spinner'
import axios from 'axios'
import QuestionCard from '@/app/student/courses/[viewcourses]/modules/[moduleID]/assessment/[assessmentOutSourceId]/QuestionCard'

export type Tag = {
    label: string
    value: string
    id: number
    tagName: string
}

type Props = {}

export type RequestBodyType = {
    quizzes: {
        tagId: number
        difficulty: string
        variantMCQs: {
            question: string
            options: { 1: string; 2: string; 3: string; 4: string }
        }[]
    }[]
}

// const formSchema = z.object({
//     difficulty: z.enum(['Easy', 'Medium', 'Hard'], {
//         required_error: 'You need to select a Difficulty type.',
//     }),
//     topics: z.number().min(1, 'You need to select a Topic'),
//     questionText: z.string().min(1, {
//         message: 'Question Text must be at least 1 character.',
//     }),
//     options: z
//         .array(
//             z.object({
//                 value: z.string().min(1, 'Option cannot be empty.'),
//             })
//         )
//         .min(2, 'At least two options are required.'),
//     selectedOption: z.number().min(0, 'Please select the correct option.'),
// })

const formSchema = z.object({
    difficulty: z
        .array(z.enum(['Easy', 'Medium', 'Hard']), {
            required_error: 'You need to select at least one Difficulty type.',
        })
        .min(1, 'You need to select at least one Difficulty type.'),
    // topics: z.array(z.number().min(1, 'You need to select a Topic')),
    // topics: z.number().min(1, 'You need to select a Topic'),
    topics: z.array(
        z.object({
            value: z.number().min(1, 'You need to select a Topic'),
        })
    ),
    numbersOfQuestions: z.array(
        z.object({
            value: z.string().min(1, 'You need to select a Topic'),
        })
    ),
    questionText: z.string().min(1, {
        message: 'Question Text must be at least 1 character.',
    }),
    options: z
        .array(
            z.object({
                value: z.string().min(1, 'Option cannot be empty.'),
            })
        )
        .min(2, 'At least two options are required.'),
    selectedOption: z.number().min(0, 'Please select the correct option.'),
})

type FormValues = z.infer<typeof formSchema>

const NewMcqProblemForm = ({
    tags,
    closeModal,
    setStoreQuizData,
    getAllQuizQuesiton,
}: {
    tags: Tag[]
    closeModal: () => void
    setStoreQuizData: any
    getAllQuizQuesiton: any
}) => {
    const [loadingAI, setLoadingAI] = useState<boolean>(false)
    const [saving, setSaving] = useState<boolean>(false)
    const [bulkDifficulties, setBulkDifficulties] = useState<string[]>([])
    const [bulkTopicIds, setBulkTopicIds] = useState<number[]>([])
    const [bulkQuantity, setBulkQuantity] = useState<number>(50) // Default to 50
    const [bulkLoading, setBulkLoading] = useState<boolean>(false)
    const [requestBody, setRequestBody] = useState<RequestBodyType>({
        quizzes: [],
    })

    // **New State Variables for Progress Tracking**
    const [generatedQuestions, setGeneratedQuestions] = useState<any>([])
    //     {
    //         correctOption: 2,
    //         difficulty: 'Hard',
    //         mark: 1,
    //         options: {
    //             1: '0 1 2 3 4 5 6 7 8 9',
    //             2: '0 2 4 6 8',
    //             3: '1 3 5 7 9',
    //             4: '0 1 2 3 4 5 6 7 8 9 10',
    //         },
    //         question:
    //             'Consider the following code snippet:\n\n```python\ni = 0\nwhile i < 10:\n if i % 2 == 0:\n print(i)\n i += 1\n```\n\nWhat will be the output of this code?',
    //         tagId: 4,
    //     },
    //     {
    //         correctOption: 2,
    //         difficulty: 'Hard',
    //         mark: 1,
    //         options: {
    //             1: '0 1 2 3 4 5 6 7 8 9',
    //             2: '0 2 4 6 8',
    //             3: '1 3 5 7 9',
    //             4: '0 1 2 3 4 5 6 7 8 9 10',
    //         },
    //         question:
    //             'Consider the following code snippet:\n\n```python\ni = 0\nwhile i < 10:\n if i % 2 == 0:\n print(i)\n i += 1\n```\n\nWhat will be the output of this code?',
    //         tagId: 4,
    //     },
    // ])
    const [generatedCount, setGeneratedCount] = useState<number>(0)
    const [totalToGenerate, setTotalToGenerate] = useState<number>(0)

    // const form = useForm<FormValues>({
    //     resolver: zodResolver(formSchema),
    //     defaultValues: {
    //         difficulty: 'Easy',
    //         topics: 0,
    //         questionText: '',
    //         options: [{ value: '' }, { value: '' }],
    //         selectedOption: 0,
    //     },
    // })

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            difficulty: [], // Starts with no difficulties selected
            // topics: [0],
            topics: [{ value: 0 }],
            // topics: 0,
            numbersOfQuestions: [{ value: '' }],
            questionText: '',
            options: [{ value: '' }, { value: '' }],
            selectedOption: 0,
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        // name: 'options',
        name: 'topics',
    })

    const {
        fields: numQuestionsFields,
        append: appendNumQuestions,
        remove: removeNumQuestions,
    } = useFieldArray({
        control: form.control,
        name: 'numbersOfQuestions',
    })

    // const { fields: topicFields, append: appendTopic } = useFieldArray({
    //     control: form.control,
    //     name: 'topics', // Now targets the topics field in form
    // });

    const addTopicField = () => {
        append({ value: 0 })
        appendNumQuestions({ value: '' })
    }

    // Utility function to pause execution for given milliseconds
    const sleep = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms))

    const handleCreateQuizQuestion = async (requestBody: RequestBodyType) => {
        console.log('requestBody', requestBody)
        try {
            const res = await api.post(`/Content/quiz`, requestBody)
            console.log('res', res)
            toast({
                title: res.data.status || 'Success',
                description: res.data.message || 'Quiz Question Created',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    'There was an error creating the quiz question. Please try again.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }

    const { control, handleSubmit, setValue } = form

    const handleSubmitForm = async (values: FormValues) => {
        console.log('values', values)
        const emptyOptions = values.options.some(
            (option) => option.value.trim() === ''
        )

        if (emptyOptions) {
            toast({
                title: 'Error',
                description: 'Options cannot be empty',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
            return
        }

        const optionsObject: { [key: number]: string } = values.options.reduce(
            (acc, option, index) => {
                acc[index + 1] = option.value
                return acc
            },
            {} as { [key: number]: string }
        )

        const formattedData = {
            question: values.questionText,
            options: optionsObject,
            correctOption: values.selectedOption + 1,
            mark: 1,
            tagId: values.topics,
            difficulty: values.difficulty,
        }

        // const requestBody = {
        //     questions: [formattedData],
        // }

        // console.log('requestBody single', requestBody)

        setSaving(true)
        if (requestBody) await handleCreateQuizQuestion(requestBody)
        await getAllQuizQuesiton(setStoreQuizData)
        setSaving(false)
        closeModal()
    }

    const generateQuestions = async () => {
        const fieldValues = form.watch()
        if (
            fieldValues.numbersOfQuestions &&
            (fieldValues.numbersOfQuestions?.length > 1 ||
                Number(fieldValues.numbersOfQuestions[0].value) > 1)
        ) {
            console.log('Generating in bulk')
            bulkGenerateMCQUsingGemini()
        } else {
            console.log('Generating single question')
            generateMCQUsingGemini()
        }
    }

    const generateMCQUsingGemini = async () => {
        setLoadingAI(true)
        try {
            const apiKey =
                process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
                'AIzaSyAm3e9-VoLFVVVLRIla-cZ40jwAqqd1FDY'

            const generatedQuestions: any[] = []
            const difficulty = form.getValues('difficulty')
            const topicId = form.getValues('topics')
            const topic =
                tags.find((t) => t.id === topicId[0].value)?.tagName ||
                'General'
            // console.log('topic', topic)
            // tags.find((t) => t.id === topicId[0])?.tagName || 'General'
            // tags.find((t) => t.id === topicId)?.tagName || 'General'
            // console.log('difficulty', difficulty)

            const promptText = `Create a ${difficulty[0].toLowerCase()} difficulty Multiple Choice Question (MCQ) on the topic "${topic}" with the following format. Please ensure that the response strictly follows this format without any deviations:

Question: [Write your full question here, including any necessary code blocks or descriptions]

Option 1: [Write the first option here]
Option 2: [Write the second option here]
Option 3: [Write the third option here]
Option 4: [Write the fourth option here]

Correct Answer: [Write the correct option number here]

**Important:** 
- Do not include any additional text or explanations outside of this format.
- Ensure that the Correct Answer is a number between 1 and 4 corresponding to the correct option.
- Avoid using quotes or any special characters in the options.`

            const requestBodyAI = {
                contents: [
                    {
                        parts: [
                            {
                                text: promptText,
                            },
                        ],
                    },
                ],
            }

            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
                requestBodyAI,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )

            const responseData = response.data

            const generatedText =
                responseData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

            if (generatedText) {
                const questionMatch = generatedText.match(
                    /Question:\s*([\s\S]*?)(?=Option 1:|$)/i
                )
                const option1Match = generatedText.match(/Option 1:\s*(.+)/i)
                const option2Match = generatedText.match(/Option 2:\s*(.+)/i)
                const option3Match = generatedText.match(/Option 3:\s*(.+)/i)
                const option4Match = generatedText.match(/Option 4:\s*(.+)/i)
                const correctAnswerMatch = generatedText.match(
                    /Correct Answer:\s*(\d+)/i
                )

                const cleanText = (text: string) =>
                    text.replace(/[*#"]/g, '').trim()

                const question = questionMatch
                    ? cleanText(questionMatch[1])
                    : ''
                const opt1 = option1Match
                    ? cleanText(option1Match[1] as string)
                    : ''
                const opt2 = option2Match
                    ? cleanText(option2Match[1] as string)
                    : ''
                const opt3 = option3Match
                    ? cleanText(option3Match[1] as string)
                    : ''
                const opt4 = option4Match
                    ? cleanText(option4Match[1] as string)
                    : ''
                let correctAnswer: number | null = null

                if (correctAnswerMatch) {
                    const parsedAnswer =
                        parseInt(correctAnswerMatch[1] as string, 10) - 1
                    if (
                        !isNaN(parsedAnswer) &&
                        parsedAnswer >= 0 &&
                        parsedAnswer < 4
                    ) {
                        correctAnswer = parsedAnswer
                    }
                }

                if (
                    !question ||
                    !opt1 ||
                    !opt2 ||
                    !opt3 ||
                    !opt4 ||
                    correctAnswer === null
                ) {
                    toast({
                        title: 'Error',
                        description:
                            'Failed to parse the MCQ correctly. Please try generating again.',
                        className:
                            'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                    })
                    setLoadingAI(false)
                    return
                }

                const newOptions = [
                    { value: opt1 },
                    { value: opt2 },
                    { value: opt3 },
                    { value: opt4 },
                ]
                let newSelectedOption = 0

                if (
                    correctAnswer !== null &&
                    correctAnswer >= 0 &&
                    correctAnswer < newOptions.length
                ) {
                    newSelectedOption = correctAnswer
                } else {
                    toast({
                        title: 'Warning',
                        description:
                            'Correct Answer could not be determined. Defaulting to the first option.',
                        className:
                            'fixed bottom-4 right-4 text-start capitalize border border-warning max-w-sm px-6 py-5 box-border z-50',
                    })
                }

                generatedQuestions.push({
                    question,
                    options: {
                        1: opt1,
                        2: opt2,
                        3: opt3,
                        4: opt4,
                    },
                    correctOption: correctAnswer + 1,
                    mark: 1,
                    tagId: topicId[0].value,
                    difficulty: difficulty[0],
                })

                if (generatedQuestions.length > 0) {
                    // const requestBody = {
                    //     questions: generatedQuestions,
                    // }
                    const requestBody = {
                        quizzes: [
                            {
                                // question,
                                // options: {
                                //     1: opt1,
                                //     2: opt2,
                                //     3: opt3,
                                //     4: opt4,
                                // },
                                // correctOption: correctAnswer + 1,
                                // mark: 1,
                                tagId: topicId[0].value,
                                difficulty: difficulty[0],
                                variantMCQs: [
                                    {
                                        question: question,
                                        options: {
                                            1: opt1,
                                            2: opt2,
                                            3: opt3,
                                            4: opt4,
                                        },
                                        correctOption: correctAnswer + 1,
                                    },
                                ],
                            },
                        ],
                        // generatedQuestions,
                    }
                    setGeneratedQuestions(generatedQuestions)

                    setRequestBody(requestBody)
                    console.log('requestBody in single ', requestBody)
                    // await handleCreateQuizQuestion(requestBody)
                    await getAllQuizQuesiton(setStoreQuizData)
                    closeModal()
                }

                // form.reset({
                //     difficulty: difficulty,
                //     topics: topicId,
                //     questionText: question,
                //     options:
                //         newOptions.length >= 2
                //             ? newOptions.slice(0, 4)
                //             : [{ value: '' }, { value: '' }],
                //     selectedOption: newSelectedOption,
                // })

                toast({
                    title: 'Success',
                    description: 'MCQ generated successfully using AI.',
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                })
            } else {
                console.warn('Unexpected response structure:', responseData)
                toast({
                    title: 'Error',
                    description:
                        "Failed to generate MCQ. I'm sorry, I couldn't understand the response from the API.",
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                })
            }
        } catch (error: any) {
            console.error('Error generating MCQ:', error)
            toast({
                title: 'Error',
                description: 'Failed to generate MCQ. Please try again.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
        setLoadingAI(false)
    }

    const bulkGenerateMCQUsingGemini = async () => {
        setBulkLoading(true)
        setGeneratedCount(0) // Reset generated count
        // setTotalToGenerate(numbersOfQuestions) // Set total to generate
        try {
            const difficulties = form.getValues('difficulty')
            const topicId = form.getValues('topics')
            const topicIds = topicId.map((item) => item.value)

            const numbersOfQuestions = form.getValues('numbersOfQuestions')
            const totalNumbersOfQuestions = numbersOfQuestions.reduce(
                (acc, curr) => acc + Number(curr.value),
                0
            )

            setTotalToGenerate(totalNumbersOfQuestions) // Set total to generate

            const apiKey =
                process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
                'AIzaSyAm3e9-VoLFVVVLRIla-cZ40jwAqqd1FDY'

            // if (bulkDifficulties.length === 0) {
            if (difficulties.length === 0) {
                toast({
                    title: 'Error',
                    description: 'Please select at least one difficulty level.',
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                })
                setBulkLoading(false)
                return
            }

            // if (bulkTopicIds.length === 0) {
            if (topicIds.length === 0) {
                toast({
                    title: 'Error',
                    description: 'Please select at least one topic.',
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                })
                setBulkLoading(false)
                return
            }

            if (totalNumbersOfQuestions < 1) {
                toast({
                    title: 'Error',
                    description: 'Please enter a valid number of questions.',
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                })
                setBulkLoading(false)
                return
            }

            const existingQuestionsResponse = await api.get(
                '/Content/allQuizQuestions'
            )
            const existingQuestions: string[] =
                existingQuestionsResponse.data.questions?.map((q: any) =>
                    q.question.toLowerCase()
                ) || []

            const generatedQuestions: any[] = []
            let attempts = 0
            const maxAttempts = totalNumbersOfQuestions * 5 // Allow up to 5 attempts per required question

            while (
                generatedQuestions.length < totalNumbersOfQuestions &&
                attempts < maxAttempts
            ) {
                attempts += 1

                const difficulty =
                    difficulties[
                        Math.floor(Math.random() * difficulties.length)
                    ]

                const topicId =
                    topicIds[Math.floor(Math.random() * topicIds.length)]

                // const topic = tags.map((t) => t.tagName)

                // let string = ''
                // const topicssss = string.join('&')
                // console.log
                const topic =
                    tags.find((t) => t.id === topicId)?.tagName || 'General'

                // queryParams.join('&')

                const promptText = `Create a ${difficulty.toLowerCase()} difficulty Multiple Choice Question (MCQ) on the topic "${topic}" with the following format. Please ensure that the response strictly follows this format without any deviations:

Question: [Write your full question here, including any necessary code blocks or descriptions]

Option 1: [Write the first option here]
Option 2: [Write the second option here]
Option 3: [Write the third option here]
Option 4: [Write the fourth option here]

Correct Answer: [Write the correct option number here]

**Important:** 
- Do not include any additional text or explanations outside of this format.
- Ensure that the Correct Answer is a number between 1 and 4 corresponding to the correct option.
- Avoid using quotes or any special characters in the options.`

                const requestBodyAI = {
                    contents: [
                        {
                            parts: [
                                {
                                    text: promptText,
                                },
                            ],
                        },
                    ],
                }

                try {
                    const response = await axios.post(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
                        requestBodyAI,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }
                    )

                    const responseData = response.data

                    const generatedText =
                        responseData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

                    if (generatedText) {
                        const questionMatch = generatedText.match(
                            /Question:\s*([\s\S]*?)(?=Option 1:|$)/i
                        )
                        const option1Match =
                            generatedText.match(/Option 1:\s*(.+)/i)
                        const option2Match =
                            generatedText.match(/Option 2:\s*(.+)/i)
                        const option3Match =
                            generatedText.match(/Option 3:\s*(.+)/i)
                        const option4Match =
                            generatedText.match(/Option 4:\s*(.+)/i)
                        const correctAnswerMatch = generatedText.match(
                            /Correct Answer:\s*(\d+)/i
                        )

                        const cleanText = (text: string) =>
                            text.replace(/[*#"]/g, '').trim()

                        const question = questionMatch
                            ? cleanText(questionMatch[1])
                            : ''
                        const opt1 = option1Match
                            ? cleanText(option1Match[1] as string)
                            : ''
                        const opt2 = option2Match
                            ? cleanText(option2Match[1] as string)
                            : ''
                        const opt3 = option3Match
                            ? cleanText(option3Match[1] as string)
                            : ''
                        const opt4 = option4Match
                            ? cleanText(option4Match[1] as string)
                            : ''
                        let correctAnswer: number | null = null

                        if (correctAnswerMatch) {
                            const parsedAnswer =
                                parseInt(correctAnswerMatch[1] as string, 10) -
                                1
                            if (
                                !isNaN(parsedAnswer) &&
                                parsedAnswer >= 0 &&
                                parsedAnswer < 4
                            ) {
                                correctAnswer = parsedAnswer
                            }
                        }

                        if (
                            !question ||
                            !opt1 ||
                            !opt2 ||
                            !opt3 ||
                            !opt4 ||
                            correctAnswer === null
                        ) {
                            console.warn('Failed to parse MCQ correctly.')
                            continue
                        }

                        // Check for uniqueness
                        const isDuplicate = existingQuestions.some(
                            (existingQ) =>
                                jaccardSimilarity(
                                    existingQ,
                                    question.toLowerCase()
                                ) > 0.8
                        )

                        if (isDuplicate) {
                            console.warn(
                                'Duplicate question detected:',
                                question
                            )
                            continue
                        }

                        const isBatchDuplicate = generatedQuestions.some(
                            (generatedQ) =>
                                jaccardSimilarity(
                                    generatedQ.question.toLowerCase(),
                                    question.toLowerCase()
                                ) > 0.8
                        )

                        if (isBatchDuplicate) {
                            console.warn(
                                'Batch duplicate question detected:',
                                question
                            )
                            continue
                        }

                        generatedQuestions.push({
                            question,
                            options: {
                                1: opt1,
                                2: opt2,
                                3: opt3,
                                4: opt4,
                            },
                            correctOption: correctAnswer + 1,
                            mark: 1,
                            tagId: topicId,
                            difficulty: difficulty,
                        })

                        existingQuestions.push(question.toLowerCase())
                        setGeneratedCount(generatedQuestions.length) // **Update Generated Count**
                        console.log(
                            `Generated ${generatedQuestions.length}/${totalNumbersOfQuestions} MCQs`
                        )
                    } else {
                        console.warn(
                            'Unexpected response structure:',
                            responseData
                        )
                        continue
                    }
                } catch (error: any) {
                    console.error('Error generating MCQ:', error)
                    continue
                }

                // **Change Delay from 5-10 seconds to 3-4 seconds**
                const randomDelay = Math.floor(Math.random() * 1000) + 3000
                console.log(
                    `Waiting for ${
                        randomDelay / 1000
                    } seconds before next request...`
                )
                await sleep(randomDelay)
            }

            if (generatedQuestions.length === 0) {
                toast({
                    title: 'Error',
                    description:
                        'Failed to generate unique MCQs. Please try again.',
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                })
                setBulkLoading(false)
                return
            }

            if (generatedQuestions.length < totalNumbersOfQuestions) {
                toast({
                    title: 'Warning',
                    description: `Only ${generatedQuestions.length} unique MCQs were generated.`,
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-warning max-w-sm px-6 py-5 box-border z-50',
                })
            } else {
                toast({
                    title: 'Success',
                    description: `${generatedQuestions.length} MCQs generated and saved successfully.`,
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                })
            }

            if (generatedQuestions.length > 0) {
                const requestBody = {
                    questions: generatedQuestions,
                }
                setGeneratedQuestions(generatedQuestions)

                console.log('requestBody', requestBody)
                // await handleCreateQuizQuestion(requestBody)
                await getAllQuizQuesiton(setStoreQuizData)
                closeModal()
            }
        } catch (error: any) {
            console.error('Error generating bulk MCQs:', error)
            toast({
                title: 'Error',
                description: 'Failed to generate bulk MCQs. Please try again.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
        setBulkLoading(false)
    }

    const jaccardSimilarity = (text1: string, text2: string): number => {
        const arr1 = text1.split(/\s+/)
        const arr2 = text2.split(/\s+/)

        const set1: { [key: string]: boolean } = {}
        const set2: { [key: string]: boolean } = {}

        arr1.forEach((word) => {
            set1[word] = true
        })

        arr2.forEach((word) => {
            set2[word] = true
        })

        let intersection = 0
        let union = 0

        for (const word in set1) {
            if (set2[word]) {
                intersection += 1
            }
            union += 1
        }

        for (const word in set2) {
            if (!set1[word]) {
                union += 1
            }
        }

        return union === 0 ? 0 : intersection / union
    }

    // console.log('form.watch', form.watch())

    // console.log('generatedQuestions', generatedQuestions)

    return (
        <main className="flex flex-col px-3 h-full">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmitForm)}
                    className="max-w-2xl mx-auto w-full flex flex-col gap-6 h-full"
                >
                    {/* Difficulty Field */}
                    {/* <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                            <FormItem className="space-y-3 flex flex-row items-center">
                                <FormLabel className="text-lg font-medium">
                                    Difficulty
                                </FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className="flex flex-row justify-start space-x-4 items-center"
                                    >
                                        <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                                <RadioGroupItem value="Easy" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Easy
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                                <RadioGroupItem value="Medium" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Medium
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                                <RadioGroupItem value="Hard" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Hard
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    /> */}
                    <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-x-6">
                                <FormLabel className="text-lg font-semibold mt-8">
                                    Difficulty
                                </FormLabel>
                                {/* Checkbox options */}
                                <FormControl>
                                    <div className="flex flex-row space-x-4 items-center">
                                        {/* Easy option */}
                                        <FormItem className="flex items-center space-x-2">
                                            <Checkbox
                                                checked={field.value.includes(
                                                    'Easy'
                                                )}
                                                onCheckedChange={(checked) => {
                                                    const newValue = checked
                                                        ? [
                                                              ...field.value,
                                                              'Easy',
                                                          ]
                                                        : field.value.filter(
                                                              (val) =>
                                                                  val !== 'Easy'
                                                          )
                                                    field.onChange(newValue)
                                                }}
                                                aria-label="Select Easy"
                                                className="translate-y-[2px]"
                                            />
                                            <FormLabel className="text-lg">
                                                Easy
                                            </FormLabel>
                                        </FormItem>

                                        {/* Medium option */}
                                        <FormItem className="flex items-center space-x-2">
                                            <Checkbox
                                                checked={field.value.includes(
                                                    'Medium'
                                                )}
                                                onCheckedChange={(checked) => {
                                                    const newValue = checked
                                                        ? [
                                                              ...field.value,
                                                              'Medium',
                                                          ]
                                                        : field.value.filter(
                                                              (val) =>
                                                                  val !==
                                                                  'Medium'
                                                          )
                                                    field.onChange(newValue)
                                                }}
                                                aria-label="Select Medium"
                                                className="translate-y-[2px]"
                                            />
                                            <FormLabel className="text-lg">
                                                Medium
                                            </FormLabel>
                                        </FormItem>

                                        {/* Hard option */}
                                        <FormItem className="flex items-center space-x-2">
                                            <Checkbox
                                                checked={field.value.includes(
                                                    'Hard'
                                                )}
                                                onCheckedChange={(checked) => {
                                                    const newValue = checked
                                                        ? [
                                                              ...field.value,
                                                              'Hard',
                                                          ]
                                                        : field.value.filter(
                                                              (val) =>
                                                                  val !== 'Hard'
                                                          )
                                                    field.onChange(newValue)
                                                }}
                                                aria-label="Select Hard"
                                                className="translate-y-[2px]"
                                            />
                                            <FormLabel className="text-lg">
                                                Hard
                                            </FormLabel>
                                        </FormItem>
                                    </div>
                                </FormControl>

                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Topics Field */}
                    {/* <div className="flex flex-col"> */}
                    {/* <p className="text-lg font-semibold text-start">
                            Topic Name and No. of Questions
                        </p> */}
                    <div className="flex flex-row gap-6">
                        {/* <FormField
                            control={form.control}
                            name="topics"
                            render={({ field }) => {
                                console.log('field', field)
                                return (
                                    <FormItem className="text-left w-full my-2">
                                        <FormLabel className="text-lg font-semibold">
                                            Topic Name and No. of Questions
                                        </FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                console.log('value', value)
                                                const selectedTag = tags?.find(
                                                    (tag: Tag) =>
                                                        tag?.tagName === value
                                                    // tag?.tagName === value[0]
                                                )
                                                console.log(
                                                    'selectedTag',
                                                    selectedTag
                                                )
                                                if (selectedTag) {
                                                    field.onChange(
                                                        selectedTag.id
                                                    )
                                                }
                                            }}
                                            value={
                                                tags.find(
                                                    (tag) =>
                                                        // tag.id === field.value
                                                        // tag.id ===
                                                        // field.value[0]
                                                        tag.id ===
                                                        field.value[0].value
                                                )?.tagName || ''
                                            }
                                        >
                                            <FormControl>
                                                <SelectTrigger className="rounded-md">
                                                    <SelectValue placeholder="Choose Topic" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {tags.map((tag: any) => (
                                                    <SelectItem
                                                        key={tag.id}
                                                        value={tag?.tagName}
                                                    >
                                                        {tag?.tagName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        /> */}
                        {/* <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex text-left text-md font-semibold mb-1">
                                        Description
                                    </FormLabel>
                                    <FormControl> */}
                        {/* <Input
                            // {...field}
                            className="w-[350px] px-3 mt-11 border rounded-md"
                            placeholder="Placeholder"
                        /> */}
                        {/* </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        /> */}
                    </div>
                    {/* </div> */}

                    <div className="flex flex-col gap-4">
                        <p className="text-lg font-semibold text-start">
                            Topic Name and No. of Questions
                        </p>
                        {/* <div className="flex flex-row gap-6"> */}
                        {fields.map((field, index) => (
                            <div className="flex flex-row gap-6">
                                <FormField
                                    key={field.id}
                                    control={form.control}
                                    name={`topics.${index}.value`}
                                    render={({ field }) => (
                                        <FormItem className="text-left w-full my-2">
                                            {/* <FormLabel className="text-lg font-semibold">
                                                Topic Name
                                            </FormLabel> */}
                                            <Select
                                                onValueChange={(value) => {
                                                    const selectedTag =
                                                        tags.find(
                                                            (tag) =>
                                                                tag.tagName ===
                                                                value
                                                        )
                                                    if (selectedTag) {
                                                        field.onChange(
                                                            selectedTag.id
                                                        )
                                                    }
                                                }}
                                                value={
                                                    tags.find(
                                                        (tag) =>
                                                            tag.id ===
                                                            field.value
                                                    )?.tagName || ''
                                                }
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="rounded-md">
                                                        <SelectValue placeholder="Choose Topic" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {tags.map((tag) => (
                                                        <SelectItem
                                                            key={tag.id}
                                                            value={tag.tagName}
                                                        >
                                                            {tag.tagName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`numbersOfQuestions.${index}.value`}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            className="w-[350px] px-3 border rounded-md"
                                            placeholder="Min 1 to Max 40"
                                        />
                                    )}
                                />
                            </div>
                        ))}
                        {/* <Input
                                // {...field}
                                className="w-[350px] px-3 border rounded-md"
                                placeholder="Placeholder"
                            />
                        </div> */}

                        {/* Add Topic Button */}
                        <Button
                            type="button"
                            variant={'ghost'}
                            onClick={addTopicField}
                            className="mt-4 justify-start"
                        >
                            + Add Topic
                        </Button>
                    </div>

                    {/* Question Text Field */}
                    {/* <FormField
                        control={form.control}
                        name="questionText"
                        render={({ field }) => {
                            return (
                                <FormItem className="text-left">
                                    <FormLabel>Question Text</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Write your Question here"
                                            {...field}
                                            className="h-32"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )
                        }}
                    /> */}

                    {/* Options Field */}
                    {/* <FormField
                        control={form.control}
                        name="options"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="mt-5 text-lg font-medium">
                                    Options
                                </FormLabel>
                                <RadioGroup
                                    onValueChange={(value) => {
                                        const numericValue = Number(value)
                                        form.setValue(
                                            'selectedOption',
                                            numericValue
                                        )
                                    }}
                                    value={form
                                        .watch('selectedOption')
                                        .toString()}
                                    className="space-y-2"
                                >
                                    {fields.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center space-x-3"
                                        >
                                            <RadioGroupItem
                                                value={index.toString()}
                                            />
                                            <Controller
                                                control={form.control}
                                                name={`options.${index}.value`}
                                                render={({ field }) => (
                                                    <Input
                                                        placeholder={`Option ${
                                                            index + 1
                                                        }`}
                                                        {...field}
                                                        className="w-full"
                                                    />
                                                )}
                                            />
                                            {fields.length > 2 &&
                                                index >= 2 && (
                                                    <Button
                                                        variant={'ghost'}
                                                        onClick={() =>
                                                            remove(index)
                                                        }
                                                        type="button"
                                                        size="icon"
                                                    >
                                                        <X
                                                            size={15}
                                                            className="text-destructive"
                                                        />
                                                    </Button>
                                                )}
                                        </div>
                                    ))}
                                </RadioGroup>
                                <FormMessage />
                                <div className="flex justify-start">
                                    <Button
                                        variant={'outline'}
                                        onClick={() => append({ value: 0 })}
                                        type="button"
                                        className="flex items-center mt-2"
                                    >
                                        <Plus
                                            size={20}
                                            className="text-secondary mr-2"
                                        />{' '}
                                        Add Option
                                    </Button>
                                </div>
                            </FormItem>
                        )}
                    /> */}

                    <div className="border-t border-gray-300"></div>

                    <div className="flex justify-end items-center gap-4">
                        <Button
                            type="button"
                            onClick={generateMCQUsingGemini}
                            className="flex items-center bg-gray-300 text-black"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            // onClick={generateMCQUsingGemini}
                            onClick={generateQuestions}
                            className="flex items-center"
                        >
                            {loadingAI ? (
                                <>
                                    <Spinner size="small" className="mr-2" />
                                    Generating...
                                </>
                            ) : (
                                'Generate Questions'
                            )}
                        </Button>
                    </div>
                    {/* Bulk Generate Section */}
                    {/* <div className="border-t border-gray-300 mt-6 pt-6">
                        <h2 className="text-xl font-semibold">
                            Bulk Generate MCQs
                        </h2>
                        <div className="mt-4 space-y-4">
                            Difficulty Selection
                            <FormItem className="space-y-1">
                                <FormLabel>Select Difficulty Levels</FormLabel>
                                <div className="flex flex-wrap gap-4">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            value="Easy"
                                            checked={bulkDifficulties.includes(
                                                'Easy'
                                            )}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setBulkDifficulties([
                                                        ...bulkDifficulties,
                                                        'Easy',
                                                    ])
                                                } else {
                                                    setBulkDifficulties(
                                                        bulkDifficulties.filter(
                                                            (d) => d !== 'Easy'
                                                        )
                                                    )
                                                }
                                            }}
                                        />
                                        <span>Easy</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            value="Medium"
                                            checked={bulkDifficulties.includes(
                                                'Medium'
                                            )}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setBulkDifficulties([
                                                        ...bulkDifficulties,
                                                        'Medium',
                                                    ])
                                                } else {
                                                    setBulkDifficulties(
                                                        bulkDifficulties.filter(
                                                            (d) =>
                                                                d !== 'Medium'
                                                        )
                                                    )
                                                }
                                            }}
                                        />
                                        <span>Medium</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            value="Hard"
                                            checked={bulkDifficulties.includes(
                                                'Hard'
                                            )}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setBulkDifficulties([
                                                        ...bulkDifficulties,
                                                        'Hard',
                                                    ])
                                                } else {
                                                    setBulkDifficulties(
                                                        bulkDifficulties.filter(
                                                            (d) => d !== 'Hard'
                                                        )
                                                    )
                                                }
                                            }}
                                        />
                                        <span>Hard</span>
                                    </label>
                                </div>
                            </FormItem>

                            Topics Selection
                            <FormItem className="space-y-1">
                                <FormLabel>Select Topics</FormLabel>
                                <div className="flex flex-wrap gap-4">
                                    {tags.map((tag: Tag) => (
                                        <label
                                            key={tag.id}
                                            className="flex items-center space-x-2"
                                        >
                                            <input
                                                type="checkbox"
                                                value={tag.id}
                                                checked={bulkTopicIds.includes(
                                                    tag.id
                                                )}
                                                onChange={(e) => {
                                                    const id = Number(
                                                        e.target.value
                                                    )
                                                    if (e.target.checked) {
                                                        setBulkTopicIds([
                                                            ...bulkTopicIds,
                                                            id,
                                                        ])
                                                    } else {
                                                        setBulkTopicIds(
                                                            bulkTopicIds.filter(
                                                                (tid) =>
                                                                    tid !== id
                                                            )
                                                        )
                                                    }
                                                }}
                                            />
                                            <span>{tag.tagName}</span>
                                        </label>
                                    ))}
                                </div>
                            </FormItem>

                            Number of Questions
                            <FormField
                                name="bulkQuantity"
                                render={() => (
                                    <FormItem className="space-y-1">
                                        <FormLabel>
                                            Number of Questions
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={bulkQuantity}
                                                onChange={(e) =>
                                                    setBulkQuantity(
                                                        parseInt(
                                                            e.target.value,
                                                            10
                                                        )
                                                    )
                                                }
                                                placeholder="Enter number of questions"
                                                className="w-full"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            **Progress Display**
                            {bulkLoading && (
                                <div className="bg-gray-100 p-4 rounded-md">
                                    <p className="text-sm text-gray-700">
                                        Generating MCQs: {generatedCount} /{' '}
                                        {totalToGenerate}
                                    </p>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{
                                                width: `${
                                                    (generatedCount /
                                                        totalToGenerate) *
                                                    100
                                                }%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            Bulk Generate Button
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={bulkGenerateMCQUsingGemini}
                                disabled={bulkLoading}
                                className="w-full flex items-center justify-center"
                            >
                                {bulkLoading ? (
                                    <>
                                        <Spinner
                                            size="small"
                                            className="mr-2"
                                        />
                                        Generating...
                                    </>
                                ) : (
                                    'Bulk Generate AI'
                                )}
                            </Button>
                        </div>
                    </div> */}

                    {generatedQuestions.length > 0 && (
                        <>
                            <p className="text-2xl font-semibold text-start">
                                {generatedQuestions.length} MCQs generated
                            </p>
                            {generatedQuestions.map((item: any, index: any) => (
                                <Card className="bg-white rounded-lg shadow-md p-5">
                                    {/* <Card className="bg-white rounded-lg p-5 border-non shadow-[0px_1px_5px_2px_#4A4A4A14,0px_2px_1px_1px_#4A4A4A0A,0px_1px_2px_1px_#4A4A4A0F]"> */}
                                    {/* <CardBody className="px-6 py-4"> */}
                                    <div className="flex flex-row gap-4">
                                        <Badge
                                            // variant="yellow"
                                            className="mb-3 text-white"
                                        >
                                            {
                                                tags.find(
                                                    (t) => t.id === item.tagId
                                                )?.tagName
                                            }
                                        </Badge>
                                        <Badge
                                            variant="yellow"
                                            // className="mb-3 bg-gray-400 text-white"
                                            className={cn(
                                                `mb-3 text-white`,
                                                difficultyQuestionBgColor(
                                                    item.difficulty
                                                )
                                            )}
                                        >
                                            {item.difficulty}
                                            {/* {difficultyQuestionBgColor(item.difficulty)} */}
                                        </Badge>
                                    </div>

                                    <p className="ml-4 text-start text-md font-semibold">
                                        {item.question}
                                    </p>
                                    {/* tags.find((t) => t.id === topicId[0].value)?.tagName */}
                                    <div className="space-y-2 mt-4">
                                        <div className="flex items-center px-4 py-3 rounded-md hover:bg-gray-100 cursor-pointer">
                                            <span className="font-medium mr-2">
                                                A.
                                            </span>
                                            <span>{item.options[1]}</span>
                                        </div>
                                        <div className="flex items-center px-4 py-3 rounded-md hover:bg-gray-100 cursor-pointer">
                                            <span className="font-medium mr-2">
                                                B.
                                            </span>
                                            <span>{item.options[2]}</span>
                                        </div>
                                        <div className="flex items-center px-4 py-3 rounded-md hover:bg-gray-100 cursor-pointer">
                                            <span className="font-medium mr-2">
                                                C.
                                            </span>
                                            <span>{item.options[3]}</span>
                                        </div>
                                        <div className="flex items-center px-4 py-3 rounded-md hover:bg-gray-100 cursor-pointer">
                                            <span className="font-medium mr-2">
                                                D.
                                            </span>
                                            <span>{item.options[4]}</span>
                                        </div>
                                    </div>
                                    {/* </CardBody> */}
                                    {/* <CardFooter className="flex justify-end px-6 py-4 border-t">
                            <Button variant="primary">Submit</Button>
                        </CardFooter> */}
                                </Card>
                                // <QuestionCard
                                //   key={index}
                                //   question={question.question}
                                //   options={question.options}
                                //   correctOption={question.correctOption}
                                // />
                            ))}
                        </>
                    )}

                    {/* Action Buttons */}
                    {generatedQuestions.length > 0 && (
                        <div className="flex justify-end items-center gap-4">
                            {/* <Button
                            type="button"
                            variant="outline"
                            onClick={generateMCQUsingGemini}
                            disabled={
                                loadingAI ||
                                !form.watch('difficulty') ||
                                !form.watch('topics')
                            }
                            className="flex items-center"
                        >
                            {loadingAI ? (
                                <>
                                    <Spinner size="small" className="mr-2" />
                                    Generating...
                                </>
                            ) : (
                                'Generate Using AI'
                            )}
                        </Button> */}
                            <Button
                                type="button"
                                // variant="outline"
                                // onClick={setGeneratedQuestions([])}
                                // disabled={
                                //     loadingAI ||
                                //     !form.watch('difficulty') ||
                                //     !form.watch('topics')
                                // }
                                className="flex items-center bg-gray-300 text-black"
                            >
                                Clear Questions
                            </Button>
                            {/* <Button
                                type="submit"
                                disabled={saving}
                                className="w-1/3 flex items-center justify-center"
                            >
                                {saving ? (
                                    <>
                                        <Spinner
                                            size="small"
                                            className="mr-2"
                                        />
                                        Saving...
                                    </>
                                ) : (
                                    'Add Questions'
                                )}
                            </Button> */}
                            <Button
                                type="button"
                                // disabled={saving}
                                onClick={() =>
                                    handleCreateQuizQuestion(requestBody)
                                }
                                className="w-1/3 flex items-center justify-center"
                            >
                                {/* {saving ? (
                                    <>
                                        <Spinner
                                            size="small"
                                            className="mr-2"
                                        />
                                        Saving...
                                    </>
                                ) : (
                                    'Add Questions'
                                )} */}
                                Add Questions
                            </Button>
                        </div>
                    )}
                </form>
            </Form>
        </main>
    )
}

export default NewMcqProblemForm
