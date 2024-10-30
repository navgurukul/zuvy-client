'use client'

import React, { useState, useEffect } from 'react'
import * as z from 'zod'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Plus, X } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { Spinner } from '@/components/ui/spinner'
import { api } from '@/utils/axios.config'
import axios from 'axios'

const noSpecialCharacters = /^[a-zA-Z0-9\s]*$/

// Define the schema for individual test cases
const testCaseSchema = z.object({
    input: z.string().min(1, 'Input cannot be empty.'),
    output: z.string().min(1, 'Output cannot be empty.'),
})

// Define the main form schema
const formSchema = z.object({
    title: z
        .string()
        .min(5, 'Title must be at least 5 characters long.')
        .max(25, 'Title must be at most 25 characters long.')
        .refine((value) => noSpecialCharacters.test(value), {
            message: 'Title must not contain special characters.',
        }),
    description: z
        .string()
        .min(10, 'Problem statement must be at least 10 characters long.'),
    constraints: z
        .string()
        .min(5, 'Constraints must be at least 5 characters long.'),
    difficulty: z.enum(['Easy', 'Medium', 'Hard'], {
        required_error: 'You need to select a Difficulty type.',
    }),
    tagId: z.number().min(1, 'You need to select a Topic'),
    inputFormat: z.enum(['str', 'int', 'float', 'arrayOfnum', 'arrayOfStr'], {
        required_error: 'You need to select an Input Format',
    }),
    outputFormat: z.enum(['str', 'int', 'float', 'arrayOfnum', 'arrayOfStr'], {
        required_error: 'You need to select an Output Format',
    }),
    testCases: z
        .array(testCaseSchema)
        .min(2, 'At least two test cases are required.'),
    bulkDifficulties: z.array(z.enum(['Easy', 'Medium', 'Hard'])).default([]),
    bulkTopicIds: z.array(z.number()).default([]),
    bulkQuantity: z
        .number()
        .min(1, 'Please enter at least 1 question.')
        .optional(), // Made optional to remove default value
})

type FormValues = z.infer<typeof formSchema>

// Helper function to process input based on format
const processInput = (input: string, format: string): any => {
    // Remove brackets if present
    const cleanedInput = input.replace(/[\[\]]/g, '').trim()

    switch (format) {
        case 'int':
            const intVal = parseInt(cleanedInput, 10)
            return isNaN(intVal) ? null : intVal
        case 'float':
            const floatVal = parseFloat(cleanedInput)
            return isNaN(floatVal) ? null : floatVal
        case 'str':
            return cleanedInput
        case 'arrayOfnum':
            return cleanedInput
                .split(',')
                .map((item) => parseFloat(item.trim()))
                .filter((item) => !isNaN(item))
        case 'arrayOfStr':
            return cleanedInput.split(',').map((item) => item.trim())
        default:
            return cleanedInput
    }
}

// Helper function to generate parameter names (a, b, c, ...)
const generateParameterName = (index: number): string => {
    return String.fromCharCode(97 + index)
}

const extractGeneratedText = (responseData: any): string | null => {
    if (responseData.candidates && responseData.candidates.length > 0) {
        const firstCandidate = responseData.candidates[0]
        if (firstCandidate.content?.parts[0]?.text) {
            return firstCandidate.content.parts[0].text.trim()
        }
    }
    return null
}

const mapFormat = (rawFormat: string): string => {
    const normalizedFormat = rawFormat.toLowerCase().trim()
    switch (normalizedFormat) {
        case 'string':
            return 'str'
        case 'number':
            return 'int'
        case 'float':
            return 'float'
        case 'array of numbers':
            return 'arrayOfnum'
        case 'array of strings':
            return 'arrayOfStr'
        default:
            console.warn(
                `Unknown format encountered: "${rawFormat}". Defaulting to 'int'.`
            )
            return 'int'
    }
}

const parseGeneratedText = (text: string) => {
    const titleMatch = text.match(/Title:\s*(.+)/i)
    const problemStatementMatch = text.match(
        /Problem Statement:\s*([\s\S]*?)(?=Constraints:|$)/i
    )
    const constraintsMatch = text.match(
        /Constraints:\s*([\s\S]*?)(?=Input format:|$)/i
    )
    const inputFormatMatch = text.match(/Input format:\s*(.+)/i)
    const outputFormatMatch = text.match(/Output format:\s*(.+)/i)
    const testCasesMatch = text.match(/Test Cases:\s*([\s\S]*?)(?=---|$)/i)

    const cleanText = (text: string) => text.replace(/[*#"]/g, '').trim()

    const title = titleMatch ? cleanText(titleMatch[1]) : ''
    const problemStatement = problemStatementMatch
        ? cleanText(problemStatementMatch[1])
        : ''
    const constraints = constraintsMatch ? cleanText(constraintsMatch[1]) : ''
    const inputFormatRaw = inputFormatMatch
        ? cleanText(inputFormatMatch[1])
        : 'Number'
    const outputFormatRaw = outputFormatMatch
        ? cleanText(outputFormatMatch[1])
        : 'Number'

    const inputFormat = mapFormat(inputFormatRaw)
    const outputFormat = mapFormat(outputFormatRaw)

    const testCases: { input: string; output: string }[] = []
    if (testCasesMatch) {
        const testCasesText = testCasesMatch[1]
        const testCaseRegex = /\d+\.\s*Input:\s*(.+?)\s*Output:\s*(.+)/gi
        const matchesIterator = testCasesText.matchAll(testCaseRegex)
        const matches = Array.from(matchesIterator)

        for (const match of matches) {
            if (match.length === 3) {
                const input = cleanText(match[1])
                const output = cleanText(match[2])
                testCases.push({ input, output })
            }
        }
    }

    if (
        !title ||
        !problemStatement ||
        !constraints ||
        !inputFormat ||
        !outputFormat ||
        testCases.length < 2
    ) {
        return null
    }

    return {
        title,
        problemStatement,
        constraints,
        inputFormat,
        outputFormat,
        testCases,
    }
}

const prepareFormattedData = (
    parsedData: any,
    difficulty: string,
    tagId: number
) => {
    return {
        title: parsedData.title,
        description: parsedData.problemStatement,
        constraints: parsedData.constraints,
        difficulty: difficulty,
        tagId: tagId,
        testCases: parsedData.testCases
            .map((testCase: any) => {
                const processedInput = processInput(
                    testCase.input,
                    parsedData.inputFormat
                )

                if (processedInput === null) {
                    return null
                }

                let inputs

                if (
                    Array.isArray(processedInput) &&
                    (parsedData.inputFormat === 'arrayOfnum' ||
                        parsedData.inputFormat === 'arrayOfStr')
                ) {
                    inputs = [
                        {
                            parameterType: parsedData.inputFormat,
                            parameterValue: processedInput,
                            parameterName: 'a',
                        },
                    ]
                } else {
                    const inputValues = testCase.input
                        .trim()
                        .split(' ')
                        .filter(Boolean)

                    inputs = inputValues.map(
                        (value: string, index: number) => ({
                            parameterType: parsedData.inputFormat,
                            parameterValue: processInput(
                                value,
                                parsedData.inputFormat
                            ),
                            parameterName: generateParameterName(index),
                        })
                    )
                }

                const expectedOutput = processInput(
                    testCase.output,
                    parsedData.outputFormat
                )

                if (expectedOutput === null) {
                    return null
                }

                return {
                    inputs,
                    expectedOutput: {
                        parameterType: parsedData.outputFormat,
                        parameterValue: expectedOutput,
                    },
                }
            })
            .filter(Boolean),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        content: {},
    }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const jaccardSimilarity = (str1: string, str2: string): number => {
    const set1 = Array.from(new Set(str1.toLowerCase().split(/\s+/)))
    const set2 = Array.from(new Set(str2.toLowerCase().split(/\s+/)))
    const intersection = set1.filter((x) => set2.includes(x))
    const union = Array.from(new Set([...set1, ...set2]))
    return union.length === 0 ? 0 : intersection.length / union.length
}

export default function NewCodingProblemForm({
    tags,
    setIsDialogOpen,
    getAllCodingQuestions,
    setCodingQuestions,
}: {
    tags: any
    setIsDialogOpen: any
    getAllCodingQuestions: any
    setCodingQuestions: any
}) {
    const [loadingAI, setLoadingAI] = useState<boolean>(false)
    const [bulkLoading, setBulkLoading] = useState<boolean>(false)
    const [generatedCount, setGeneratedCount] = useState<number>(0)
    const [duplicatesSkipped, setDuplicatesSkipped] = useState<number>(0)
    const [totalToGenerate, setTotalToGenerate] = useState<number>(0)
    const [codingQuestionsLocal, setCodingQuestionsLocal] = useState<any[]>([])

    useEffect(() => {
        const storedQuestions = localStorage.getItem('codingQuestions')
        if (storedQuestions) {
            const parsedQuestions = JSON.parse(storedQuestions)
            setCodingQuestionsLocal(parsedQuestions)
            setCodingQuestions(parsedQuestions)
        }
    }, [setCodingQuestions])

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            constraints: '',
            difficulty: 'Easy',
            tagId: 0,
            inputFormat: 'int',
            outputFormat: 'int',
            testCases: [
                { input: '', output: '' },
                { input: '', output: '' },
            ],
            bulkDifficulties: [],
            bulkTopicIds: [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'testCases',
    })

    const handleAddTestCase = () => {
        if (fields.length < 20) {
            append({ input: '', output: '' })
        } else {
            toast({
                title: 'Limit Reached',
                description: 'Maximum of 20 test cases allowed.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-warning max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }

    const handleRemoveTestCase = (index: number) => {
        if (fields.length > 2) {
            remove(index)
        }
    }

    const saveQuestionsToLocal = (questions: any[]) => {
        localStorage.setItem('codingQuestions', JSON.stringify(questions))
        setCodingQuestionsLocal(questions)
        setCodingQuestions(questions)
    }

    // Function for single question creation
    async function generateCodingProblemUsingGemini() {
        setLoadingAI(true)
        try {
            const difficulty = form.getValues('difficulty')
            const topicId = form.getValues('tagId')
            const topic =
                tags.find((t: any) => t.id === topicId)?.tagName || 'General'

            const promptText = `You are an assistant that creates coding problems. Please generate a ${difficulty.toLowerCase()} difficulty coding problem on the topic "${topic}" with the following strict structure. Do not add any additional information or explanations.

---
Title: [Problem Title]

Problem Statement: [Detailed problem description here.]

Constraints: [List of constraints here.]

Input format: [A single letter representing the input format. Choose from String, Number, Float, Array Of Numbers, Array Of Strings.]

Output format: [A single letter representing the output format. Choose from String, Number, Float, Array Of Numbers, Array Of Strings.]

Test Cases:
1. Input: [First test case input]
   Output: [First test case output]
2. Input: [Second test case input]
   Output: [Second test case output] (similarly add more test cases)
---
Only provide the content between the '---' markers in the specified format.`

            const apiKey =
                process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
                'AIzaSyAm3e9-VoLFVVVLRIla-cZ40jwAqqd1FDY'

            if (!apiKey) {
                throw new Error(
                    'Gemini API key is not set. Please configure it properly.'
                )
            }

            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
                {
                    contents: [
                        {
                            parts: [
                                {
                                    text: promptText,
                                },
                            ],
                        },
                    ],
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )

            const responseData = response.data
            const generatedText = extractGeneratedText(responseData)
            console.log('Generated Text:', generatedText)

            if (generatedText) {
                const parsedData = parseGeneratedText(generatedText)

                if (parsedData) {
                    const existingTitles = codingQuestionsLocal.map(
                        (q) => q.title
                    )
                    let isUnique = true
                    for (let existingTitle of existingTitles) {
                        const similarity = jaccardSimilarity(
                            existingTitle,
                            parsedData.title
                        )
                        if (similarity >= 0.8) {
                            isUnique = false
                            break
                        }
                    }

                    if (!isUnique) {
                        toast({
                            title: 'Duplicate Detected',
                            description:
                                'Generated question is too similar to an existing question. Skipping.',
                            className:
                                'fixed bottom-4 right-4 text-start capitalize border border-warning max-w-sm px-6 py-5 box-border z-50',
                        })
                    } else {
                        const formattedData = prepareFormattedData(
                            parsedData,
                            difficulty,
                            topicId
                        )

                        await api.post(
                            'codingPlatform/create-question',
                            formattedData
                        )
                        toast({
                            title: 'Success',
                            description:
                                'Coding problem generated successfully using Gemini.',
                            className:
                                'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                        })
                        setIsDialogOpen(false)
                        getAllCodingQuestions(setCodingQuestions)
                        form.reset()
                    }
                } else {
                    toast({
                        title: 'Error',
                        description:
                            'Failed to parse the coding problem correctly. Please try generating again.',
                        className:
                            'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                    })
                }
            } else {
                toast({
                    title: 'Error',
                    description:
                        "Failed to generate coding problem. Couldn't understand the response from the API.",
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                })
            }
        } catch (error: any) {
            console.error('Error generating coding problem:', error)
            let errorMessage =
                'Failed to generate coding problem. Please try again.'
            if (error.response) {
                errorMessage = `Error ${error.response.status}: ${
                    error.response.data.error.message || 'An error occurred.'
                }`
            } else if (error.request) {
                errorMessage =
                    'No response from the server. Please check your network connection.'
            } else {
                errorMessage = error.message
            }

            toast({
                title: 'Error',
                description: errorMessage,
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
        setLoadingAI(false)
    }

    // Function to handle form submission for single question
    const handleSubmitForm = async (values: FormValues) => {
        const formattedData = {
            title: values.title,
            description: values.description,
            constraints: values.constraints,
            difficulty: values.difficulty,
            tagId: values.tagId,
            testCases: values.testCases
                .map((testCase) => {
                    const processedInput = processInput(
                        testCase.input,
                        values.inputFormat
                    )

                    if (processedInput === null) {
                        return null
                    }

                    let inputs

                    if (
                        Array.isArray(processedInput) &&
                        (values.inputFormat === 'arrayOfnum' ||
                            values.inputFormat === 'arrayOfStr')
                    ) {
                        inputs = [
                            {
                                parameterType: values.inputFormat,
                                parameterValue: processedInput,
                                parameterName: 'a',
                            },
                        ]
                    } else {
                        const inputValues = testCase.input
                            .trim()
                            .split(' ')
                            .filter(Boolean)

                        inputs = inputValues.map(
                            (value: string, index: number) => ({
                                parameterType: values.inputFormat,
                                parameterValue: processInput(
                                    value,
                                    values.inputFormat
                                ),
                                parameterName: generateParameterName(index),
                            })
                        )
                    }

                    const expectedOutput = processInput(
                        testCase.output,
                        values.outputFormat
                    )

                    if (expectedOutput === null) {
                        return null
                    }

                    return {
                        inputs,
                        expectedOutput: {
                            parameterType: values.outputFormat,
                            parameterValue: expectedOutput,
                        },
                    }
                })
                .filter(Boolean),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            content: {},
        }

        const hasInvalidTestCase = formattedData.testCases.some(
            (testCase: any) => {
                return (
                    testCase?.inputs?.some(
                        (input: any) => input.parameterValue === null
                    ) || testCase?.expectedOutput.parameterValue === null
                )
            }
        )

        if (hasInvalidTestCase || formattedData.testCases.length === 0) {
            toast({
                title: 'Please enter valid test cases.',
                description:
                    'Submission failed: One or more test cases have invalid inputs or outputs.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
            return
        }

        try {
            console.log('Formatted Data to API:', formattedData)
            await api.post('codingPlatform/create-question', formattedData)
            toast({
                title: 'Success',
                description: 'Coding problem created successfully.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })
            setIsDialogOpen(false)
            getAllCodingQuestions(setCodingQuestions)
            form.reset()
        } catch (error: any) {
            console.error('Error creating coding questions:', error)
            toast({
                title: 'Error',
                description:
                    error?.response?.data?.message ||
                    'An error occurred while saving the questions.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }

    const bulkGenerateCodingProblems = async () => {
        const { bulkDifficulties, bulkTopicIds, bulkQuantity } =
            form.getValues()

        // Validation checks
        if (bulkDifficulties.length === 0 || bulkTopicIds.length === 0) {
            toast({
                title: 'Validation Error',
                description:
                    'Please select at least one difficulty and one topic for bulk generation.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
            return
        }

        if (!bulkQuantity || bulkQuantity < 1) {
            toast({
                title: 'Validation Error',
                description:
                    'Please enter a valid number of questions to generate.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
            return
        }

        setBulkLoading(true)
        setTotalToGenerate(bulkQuantity)
        setGeneratedCount(0)
        setDuplicatesSkipped(0)

        let localGeneratedCount = 0
        let localDuplicatesSkipped = 0

        const existingQuestions: string[] = codingQuestionsLocal.map(
            (q) => q.title
        )

        const batchSize = 5
        const delayBetweenBatches = 7000

        let attempts = 0
        const maxAttempts = bulkQuantity * 10 // Prevent infinite loops

        while (localGeneratedCount < bulkQuantity && attempts < maxAttempts) {
            const currentBatchSize = Math.min(
                batchSize,
                bulkQuantity - localGeneratedCount
            )
            const batchPromises = []

            for (let i = 0; i < currentBatchSize; i++) {
                // Select random difficulty and topic from selected options
                const randomDifficulty =
                    bulkDifficulties[
                        Math.floor(Math.random() * bulkDifficulties.length)
                    ]
                const randomTopicId =
                    bulkTopicIds[
                        Math.floor(Math.random() * bulkTopicIds.length)
                    ]
                const randomTopic =
                    tags.find((t: any) => t.id === randomTopicId)?.tagName ||
                    'General'

                const generateQuestion = async () => {
                    try {
                        const promptText = `You are an assistant that creates coding problems. Please generate a ${randomDifficulty.toLowerCase()} difficulty coding problem on the topic "${randomTopic}" with the following strict structure. Do not add any additional information or explanations.
                        
---
Title: [Problem Title]

Problem Statement: [Detailed problem description here.]

Constraints: [List of constraints here.]

Input format: [A single letter representing the input format. Choose from String, Number, Float, Array Of Numbers, Array Of Strings.]

Output format: [A single letter representing the output format. Choose from String, Number, Float, Array Of Numbers, Array Of Strings.]

Test Cases:
1. Input: [First test case input]
   Output: [First test case output]
2. Input: [Second test case input]
   Output: [Second test case output] (similarly add more test cases)
---
Only provide the content between the '---' markers in the specified format.`

                        const apiKey =
                            process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
                            'AIzaSyAm3e9-VoLFVVVLRIla-cZ40jwAqqd1FDY'

                        if (!apiKey) {
                            throw new Error(
                                'Gemini API key is not set. Please configure it properly.'
                            )
                        }

                        const response = await axios.post(
                            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
                            {
                                contents: [
                                    {
                                        parts: [
                                            {
                                                text: promptText,
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            }
                        )

                        const responseData = response.data
                        const generatedText = extractGeneratedText(responseData)
                        console.log(
                            `Generated Text for Question ${
                                localGeneratedCount + 1
                            }:`,
                            generatedText
                        )

                        if (generatedText) {
                            const parsedData = parseGeneratedText(generatedText)

                            if (parsedData) {
                                let isUnique = true
                                for (let existingTitle of existingQuestions) {
                                    const similarity = jaccardSimilarity(
                                        existingTitle,
                                        parsedData.title
                                    )
                                    if (similarity >= 0.8) {
                                        isUnique = false
                                        break
                                    }
                                }

                                if (isUnique) {
                                    const formattedData = prepareFormattedData(
                                        parsedData,
                                        randomDifficulty,
                                        randomTopicId
                                    )

                                    await api.post(
                                        'codingPlatform/create-question',
                                        formattedData
                                    )

                                    existingQuestions.push(parsedData.title)

                                    localGeneratedCount += 1
                                    setGeneratedCount(localGeneratedCount)

                                    toast({
                                        title: `Success`,
                                        description: `Question ${localGeneratedCount} generated successfully.`,
                                        className:
                                            'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                                    })
                                } else {
                                    localDuplicatesSkipped += 1
                                    setDuplicatesSkipped(localDuplicatesSkipped)
                                    console.log(
                                        `Question ${
                                            localGeneratedCount + 1
                                        } is a duplicate. Skipping.`
                                    )
                                }
                            } else {
                                // Parsing failed, increment duplicatesSkipped
                                localDuplicatesSkipped += 1
                                setDuplicatesSkipped(localDuplicatesSkipped)
                                console.log(
                                    `Failed to parse the coding problem correctly for question ${
                                        localGeneratedCount + 1
                                    }. Skipping.`
                                )
                            }
                        } else {
                            // No text generated, increment duplicatesSkipped
                            localDuplicatesSkipped += 1
                            setDuplicatesSkipped(localDuplicatesSkipped)
                            console.log(
                                `No text generated from AI for question ${
                                    localGeneratedCount + 1
                                }. Skipping.`
                            )
                        }
                    } catch (error: any) {
                        console.error(
                            `Error generating question ${
                                localGeneratedCount + 1
                            }:`,
                            error
                        )
                    }
                }

                batchPromises.push(generateQuestion())
            }

            await Promise.all(batchPromises)

            if (localGeneratedCount < bulkQuantity) {
                console.log(
                    `Waiting for ${
                        delayBetweenBatches / 1000
                    } seconds before next batch...`
                )
                await sleep(delayBetweenBatches)
            }

            attempts++
        }

        setBulkLoading(false)
        toast({
            title: 'Bulk Generation Complete',
            description: `${localGeneratedCount} out of ${bulkQuantity} questions generated successfully. ${localDuplicatesSkipped} duplicates were skipped.`,
            className:
                'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
        })

        getAllCodingQuestions(setCodingQuestions)
    }

    return (
        <main className="flex flex-col p-3 w-full items-center">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmitForm)}
                    className="w-2/4 flex flex-col gap-4"
                >
                    {/* Title Field */}
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="text-left">
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Title" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Problem Statement Field */}
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="text-left">
                                <FormLabel>Problem Statement</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Write the Detailed Description Here"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Constraints Field */}
                    <FormField
                        control={form.control}
                        name="constraints"
                        render={({ field }) => (
                            <FormItem className="text-left">
                                <FormLabel>Constraints</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Write the Constraints Here"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Difficulty Field */}
                    <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Difficulty</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className="flex space-y-1"
                                    >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="Easy" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Easy
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="Medium" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Medium
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
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
                    />

                    {/* Topics Field */}
                    <FormField
                        control={form.control}
                        name="tagId"
                        render={({ field }) => (
                            <FormItem className="text-left w-full">
                                <FormLabel>Topics</FormLabel>
                                <Select
                                    onValueChange={(value: string) => {
                                        // Added type annotation
                                        const selectedTag = tags.find(
                                            (tag: any) => tag.tagName === value
                                        )
                                        if (selectedTag) {
                                            field.onChange(selectedTag.id)
                                        }
                                    }}
                                    value={
                                        tags.find(
                                            (tag: any) => tag.id === field.value
                                        )?.tagName || ''
                                    }
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose Topic" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {tags.map((tag: any) => (
                                            <SelectItem
                                                key={tag?.id}
                                                value={tag?.tagName}
                                            >
                                                {tag?.tagName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Input and Output Format Fields */}
                    <h6 className="text-left text-sm font-semibold">
                        {' '}
                        Note: Max 20 test cases supported & a minimum of 2 test
                        cases should be provided
                    </h6>
                    <div className="flex justify-between gap-2">
                        <FormField
                            control={form.control}
                            name="inputFormat"
                            render={({ field }) => (
                                <FormItem className="text-left w-full">
                                    <FormLabel>Input format</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose Input Format" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="str">
                                                String
                                            </SelectItem>
                                            <SelectItem value="int">
                                                Number
                                            </SelectItem>
                                            <SelectItem value="float">
                                                Float
                                            </SelectItem>
                                            <SelectItem value="arrayOfnum">
                                                Array Of Numbers
                                            </SelectItem>
                                            <SelectItem value="arrayOfStr">
                                                Array Of Strings
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="outputFormat"
                            render={({ field }) => (
                                <FormItem className="text-left w-full">
                                    <FormLabel>Output Format</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose Output Format" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="str">
                                                String
                                            </SelectItem>
                                            <SelectItem value="int">
                                                Number
                                            </SelectItem>
                                            <SelectItem value="float">
                                                Float
                                            </SelectItem>
                                            <SelectItem value="arrayOfnum">
                                                Array Of Numbers
                                            </SelectItem>
                                            <SelectItem value="arrayOfStr">
                                                Array Of Strings
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Test Cases Section */}
                    <div className="text-left">
                        <FormLabel>Test Cases</FormLabel>
                        {fields.map((fieldItem, index) => (
                            <div
                                key={fieldItem.id}
                                className="flex items-center gap-2 mt-2"
                            >
                                <FormField
                                    control={form.control}
                                    name={`testCases.${index}.input`}
                                    render={({ field }) => (
                                        <FormItem className="text-left w-full">
                                            <Input
                                                placeholder="Input"
                                                {...field}
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                {form.watch('inputFormat') ===
                                                    'arrayOfnum' ||
                                                form.watch('inputFormat') ===
                                                    'arrayOfStr'
                                                    ? 'Max 1 array accepted (e.g., 1,2,3,4)'
                                                    : 'Enter values separated by spaces (e.g., 2 3 4)'}
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`testCases.${index}.output`}
                                    render={({ field }) => (
                                        <FormItem className="text-left w-full">
                                            <Input
                                                placeholder="Output"
                                                {...field}
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                {form.watch('outputFormat') ===
                                                    'arrayOfnum' ||
                                                form.watch('outputFormat') ===
                                                    'arrayOfStr'
                                                    ? 'Max 1 array accepted (e.g., 1,2,3,4)'
                                                    : 'Only one value accepted (e.g., 55)'}
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {fields.length > 2 && (
                                    <X
                                        className="cursor-pointer"
                                        onClick={() =>
                                            handleRemoveTestCase(index)
                                        }
                                    />
                                )}
                            </div>
                        ))}
                        <Button
                            variant={'outline'}
                            type="button"
                            className="mt-2"
                            onClick={handleAddTestCase}
                        >
                            <Plus size={20} />
                            <p className="text-secondary font-bold">
                                Add Test Cases
                            </p>
                        </Button>
                    </div>

                    {/* Bulk Generation Section */}
                    <div className="border-t border-gray-300 mt-6 pt-6">
                        <h2 className="text-xl font-semibold">
                            Bulk Generate Coding Problems
                        </h2>
                        <div className="mt-4 space-y-4">
                            {/* Difficulty Selection */}
                            <FormItem className="space-y-1">
                                <FormLabel>Select Difficulty Levels</FormLabel>
                                <div className="flex flex-wrap gap-4">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            value="Easy"
                                            checked={form
                                                .watch('bulkDifficulties')
                                                .includes('Easy')}
                                            onChange={(
                                                e: React.ChangeEvent<HTMLInputElement>
                                            ) => {
                                                // Added type annotation
                                                const selected =
                                                    form.watch(
                                                        'bulkDifficulties'
                                                    )
                                                if (e.target.checked) {
                                                    form.setValue(
                                                        'bulkDifficulties',
                                                        [...selected, 'Easy']
                                                    )
                                                } else {
                                                    form.setValue(
                                                        'bulkDifficulties',
                                                        selected.filter(
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
                                            checked={form
                                                .watch('bulkDifficulties')
                                                .includes('Medium')}
                                            onChange={(
                                                e: React.ChangeEvent<HTMLInputElement>
                                            ) => {
                                                // Added type annotation
                                                const selected =
                                                    form.watch(
                                                        'bulkDifficulties'
                                                    )
                                                if (e.target.checked) {
                                                    form.setValue(
                                                        'bulkDifficulties',
                                                        [...selected, 'Medium']
                                                    )
                                                } else {
                                                    form.setValue(
                                                        'bulkDifficulties',
                                                        selected.filter(
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
                                            checked={form
                                                .watch('bulkDifficulties')
                                                .includes('Hard')}
                                            onChange={(
                                                e: React.ChangeEvent<HTMLInputElement>
                                            ) => {
                                                // Added type annotation
                                                const selected =
                                                    form.watch(
                                                        'bulkDifficulties'
                                                    )
                                                if (e.target.checked) {
                                                    form.setValue(
                                                        'bulkDifficulties',
                                                        [...selected, 'Hard']
                                                    )
                                                } else {
                                                    form.setValue(
                                                        'bulkDifficulties',
                                                        selected.filter(
                                                            (d) => d !== 'Hard'
                                                        )
                                                    )
                                                }
                                            }}
                                        />
                                        <span>Hard</span>
                                    </label>
                                </div>
                                <FormMessage />
                            </FormItem>

                            {/* Topics Selection */}
                            <FormItem className="space-y-1">
                                <FormLabel>Select Topics</FormLabel>
                                <div className="flex flex-wrap gap-4">
                                    {tags.map((tag: any) => (
                                        <label
                                            key={tag.id}
                                            className="flex items-center space-x-2"
                                        >
                                            <input
                                                type="checkbox"
                                                value={tag.id}
                                                checked={form
                                                    .watch('bulkTopicIds')
                                                    .includes(tag.id)}
                                                onChange={(
                                                    e: React.ChangeEvent<HTMLInputElement>
                                                ) => {
                                                    // Added type annotation
                                                    const selected =
                                                        form.watch(
                                                            'bulkTopicIds'
                                                        )
                                                    const id = Number(
                                                        e.target.value
                                                    )
                                                    if (e.target.checked) {
                                                        form.setValue(
                                                            'bulkTopicIds',
                                                            [...selected, id]
                                                        )
                                                    } else {
                                                        form.setValue(
                                                            'bulkTopicIds',
                                                            selected.filter(
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
                                <FormMessage />
                            </FormItem>

                            {/* Number of Questions */}
                            <FormField
                                name="bulkQuantity"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel>
                                            Number of Questions
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                {...field} // Spread the field props to properly register the input
                                                placeholder="Enter number of questions"
                                                className="w-full"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Progress Display */}
                            {bulkLoading && (
                                <div className="bg-gray-100 p-4 rounded-md">
                                    <p className="text-sm text-gray-700">
                                        Generating Coding Problems:{' '}
                                        {generatedCount} / {totalToGenerate}
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
                                    {duplicatesSkipped > 0 && (
                                        <p className="text-sm text-gray-500 mt-2">
                                            Duplicates Skipped:{' '}
                                            {duplicatesSkipped}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Bulk Generate Button */}
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={bulkGenerateCodingProblems}
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
                                    'Bulk Generate Using AI'
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center mt-8">
                        {/* Single Generate Button */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={generateCodingProblemUsingGemini}
                            disabled={
                                loadingAI ||
                                !form.watch('difficulty') ||
                                !form.watch('tagId')
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
                        </Button>
                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                            className="w-1/3 flex items-center justify-center"
                        >
                            {form.formState.isSubmitting ? (
                                <>
                                    <Spinner size="small" className="mr-2" />
                                    Saving...
                                </>
                            ) : (
                                '+ Create Question'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </main>
    )
}
