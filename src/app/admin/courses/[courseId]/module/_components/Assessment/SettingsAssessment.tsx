import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ChevronLeft, AlertCircle } from 'lucide-react'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import ToggleSwitch from './ToggleSwitch'
import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'
import { useParams } from 'next/navigation'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

type SettingsAssessmentProps = {
    selectedCodingQuesIds: any
    selectedQuizQuesIds: any
    selectedOpenEndedQuesIds: any
    selectedCodingQuesTagIds: any
    selectedQuizQuesTagIds: any
    content: any
    fetchChapterContent: any
    chapterData: any
    chapterTitle: string
    saveSettings: boolean
    setSaveSettings: (value: boolean) => void
    setQuestionType: (value: string) => void
    selectCodingDifficultyCount: any
    selectQuizDifficultyCount: any
    topicId: number
}

const SettingsAssessment: React.FC<SettingsAssessmentProps> = ({
    selectedCodingQuesIds,
    selectedQuizQuesIds,
    selectedOpenEndedQuesIds,
    selectedCodingQuesTagIds,
    selectedQuizQuesTagIds,
    content,
    fetchChapterContent,
    chapterData,
    chapterTitle,
    saveSettings,
    setSaveSettings,
    setQuestionType,
    selectCodingDifficultyCount,
    selectQuizDifficultyCount,
    topicId,
}) => {
    const { chapterID } = useParams()
    const codingMax = selectedCodingQuesIds.length
    const mcqMax = selectedQuizQuesIds.length
    const [codingWeightageDisabled, setCodingWeightageDisabled] =
        useState(false)
    const [mcqsWeightageDisabled, setMcqsWeightageDisabled] = useState(false)

    const [totalQuestions, setTotalQuestions] = useState({
        codingProblemsEasy: content?.easyCodingQuestions || 0,
        codingProblemsMedium: content?.mediumCodingQuestions || 0,
        codingProblemsHard: content?.hardCodingQuestions || 0,
        mcqsEasy: content?.easyMcqQuestions || 0,
        mcqsMedium: content?.mediumMcqQuestions || 0,
        mcqsHard: content?.hardMcqQuestions || 0,
    })

    const [totalSelectedCodingQues, setTotalSelectedCodingQues] = useState(0)
    const [totalSelectedQuizQues, setTotalSelectedQuizQues] = useState(0)
    const [editingFields, setEditingFields] = useState<any>({})
    const hours = Array.from({ length: 6 }, (_, i) => i)
    const minutes = [15, 30, 45]

    const formSchema = z
        .object({
            codingProblemsEasy: z.number().min(0).max(selectCodingDifficultyCount.codingProblemsEasy || 0, {
                message: `Cannot exceed ${selectCodingDifficultyCount.codingProblemsEasy || 0}`
            }),
            codingProblemsMedium: z.number().min(0).max(selectCodingDifficultyCount.codingProblemsMedium || 0, {
                message: `Cannot exceed ${selectCodingDifficultyCount.codingProblemsMedium || 0}`
            }),
            codingProblemsHard: z.number().min(0).max(selectCodingDifficultyCount.codingProblemsHard || 0, {
                message: `Cannot exceed ${selectCodingDifficultyCount.codingProblemsHard || 0}`
            }),
            mcqsEasy: z.number().min(0).max(selectQuizDifficultyCount.mcqsEasy || 0, {
                message: `Cannot exceed ${selectQuizDifficultyCount.mcqsEasy || 0}`
            }),
            mcqsMedium: z.number().min(0).max(selectQuizDifficultyCount.mcqsMedium || 0, {
                message: `Cannot exceed ${selectQuizDifficultyCount.mcqsMedium || 0}`
            }),
            mcqsHard: z.number().min(0).max(selectQuizDifficultyCount.mcqsHard || 0, {
                message: `Cannot exceed ${selectQuizDifficultyCount.mcqsHard || 0}`
            }),
            codingProblemsWeightage: z.number().min(0),
            mcqsWeightage: z.number().min(0),
            canCopyPaste: z.boolean(),
            tabSwitch: z.boolean(),
            screenExit: z.boolean(),
            eyeTracking: z.boolean(),
            hour: z.string().max(5),
            minute: z.string().max(59),
            passPercentage: z.number().min(0).max(100),
        })
        .refine(
            (data) => data.codingProblemsWeightage + data.mcqsWeightage === 100,
            {
                message: 'Total weightage should be 100%',
                path: ['codingProblemsWeightage'],
            }
        )
        .superRefine((data, ctx) => {
            // Custom validation for coding problems
            const codingCounts = [
                { name: 'codingProblemsEasy', count: selectCodingDifficultyCount.codingProblemsEasy },
                { name: 'codingProblemsMedium', count: selectCodingDifficultyCount.codingProblemsMedium },
                { name: 'codingProblemsHard', count: selectCodingDifficultyCount.codingProblemsHard }
            ]

            codingCounts.forEach(({ name, count }) => {
                if (count > 0 && data[name as keyof typeof data] === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `At least 1 question is required for ${name.replace('codingProblems', '')} difficulty`,
                        path: [name]
                    })
                }
            })

            // Custom validation for MCQs
            const mcqCounts = [
                { name: 'mcqsEasy', count: selectQuizDifficultyCount.mcqsEasy },
                { name: 'mcqsMedium', count: selectQuizDifficultyCount.mcqsMedium },
                { name: 'mcqsHard', count: selectQuizDifficultyCount.mcqsHard }
            ]

            mcqCounts.forEach(({ name, count }) => {
                if (count > 0 && data[name as keyof typeof data] === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `At least 1 question is required for ${name.replace('mcqs', '')} difficulty`,
                        path: [name]
                    })
                }
            })
        })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            codingProblemsEasy: 0,
            codingProblemsMedium: 0,
            codingProblemsHard: 0,
            mcqsEasy: 0,
            mcqsMedium: 0,
            mcqsHard: 0,
            codingProblemsWeightage: 0,
            mcqsWeightage: 0,
            canCopyPaste: false,
            tabSwitch: false,
            screenExit: false,
            eyeTracking: false,
            hour: content.timeLimit
                ? String(Math.floor(content.timeLimit / 3600))
                : '2',
            minute: content.timeLimit
                ? String(Math.floor((content.timeLimit % 3600) / 60))
                : '15',
            passPercentage: 70,
        },
    })

    const handleInputChange = (
        field: keyof typeof totalQuestions,
        value: string
    ) => {
        // Allow empty string, which will be handled by validation
        const numericValue: any = value === '' ? null : Number(value)
        
        // Update total questions state 
        setTotalQuestions((prevValues) => ({
            ...prevValues,
            [field]: numericValue,
        }))
        
        // Update form value
        form.setValue(field, numericValue, {
            shouldValidate: true,
            shouldDirty: true,
        })
    }

    const handleWeightageChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: any
    ) => {
        const value = e.target.value
        field.onChange(value === '' ? null : Number(value))
    }

    useEffect(() => {
        if (
            totalQuestions.codingProblemsEasy ||
            totalQuestions.codingProblemsMedium ||
            totalQuestions.codingProblemsHard
        ) {
            const codingTotal =
                totalQuestions.codingProblemsEasy +
                totalQuestions.codingProblemsMedium +
                totalQuestions.codingProblemsHard
            setTotalSelectedCodingQues(Number(codingTotal))
        } else {
            const codingTotal =
                content?.easyCodingQuestions +
                content?.mediumCodingQuestions +
                content?.hardCodingQuestions
            setTotalSelectedCodingQues(Number(codingTotal))
        }

        if (
            totalQuestions.mcqsEasy ||
            totalQuestions.mcqsMedium ||
            totalQuestions.mcqsHard
        ) {
            const quizTotal =
                totalQuestions.mcqsEasy +
                totalQuestions.mcqsMedium +
                totalQuestions.mcqsHard
            setTotalSelectedQuizQues(Number(quizTotal))
        } else {
            const quizTotal =
                content?.easyMcqQuestions +
                content?.mediumMcqQuestions +
                content?.hardMcqQuestions
            setTotalSelectedQuizQues(Number(quizTotal))
        }
    }, [totalQuestions, content])

    // useEffect(()=>{
    //     if(topicId && chapterID){
    //         fetchChapterContent(chapterID, topicId);
    //     }
    // },[chapterID, topicId])

    async function onSubmit(values: any) {
        const timeLimit =
            Number(values.hour) * 3600 + Number(values.minute) * 60
        const data = {
            title: chapterTitle,
            description:
                'This assessment has 2 dsa problems, 5 mcq and 3 theory questions',
            codingProblemIds: selectedCodingQuesIds,
            mcqIds: selectedQuizQuesIds,
            openEndedQuestionIds: selectedOpenEndedQuesIds,
            passPercentage: Number(values.passPercentage),
            timeLimit: Number(timeLimit),
            canEyeTrack: values.eyeTracking,
            canTabChange: values.tabSwitch,
            canScreenExit: values.screenExit,
            canCopyPaste: values.canCopyPaste,
            codingQuestionTagId: selectedCodingQuesTagIds,
            mcqTagId: selectedQuizQuesTagIds,
            easyCodingQuestions: Number(values.codingProblemsEasy),
            mediumCodingQuestions: Number(values.codingProblemsMedium),
            hardCodingQuestions: Number(values.codingProblemsHard),
            easyMcqQuestions: Number(values.mcqsEasy),
            mediumMcqQuestions: Number(values.mcqsMedium),
            hardMcqQuestions: Number(values.mcqsHard),
            weightageCodingQuestions: Number(values.codingProblemsWeightage),
            weightageMcqQuestions: Number(values.mcqsWeightage),
        }

        try {
            await api
                .put(
                    `Content/editAssessment/${content.assessmentOutsourseId}/${chapterID}`,
                    data
                )
                .then((res: any) => {
                    fetchChapterContent(chapterID, topicId)
                })
            toast({
                title: 'Assessment Updated Successfully',
                description: 'Assessment has been updated successfully',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        form.reset({
            codingProblemsEasy: content?.easyCodingQuestions || 0,
            codingProblemsMedium: content?.mediumCodingQuestions || 0,
            codingProblemsHard: content?.hardCodingQuestions || 0,
            mcqsEasy: content?.easyMcqQuestions || 0,
            mcqsMedium: content?.mediumMcqQuestions || 0,
            mcqsHard: content?.hardMcqQuestions || 0,
            codingProblemsWeightage:
                codingMax > 0 && mcqMax > 0 ? 50 : codingMax > 0 ? 100 : 0,
            mcqsWeightage:
                codingMax > 0 && mcqMax > 0 ? 50 : mcqMax > 0 ? 100 : 0,
            canCopyPaste: content?.canCopyPaste || false,
            tabSwitch: content?.canTabChange || false,
            screenExit: content?.canScreenExit || false,
            eyeTracking: content?.canEyeTrack || false,
            hour: content.timeLimit
                ? String(Math.floor(content.timeLimit / 3600))
                : '2',
            minute: content.timeLimit
                ? String(Math.floor((Number(content.timeLimit) % 3600) / 60))
                : '15',
            passPercentage: content?.passPercentage || 70,
        })
        // Apply disabling logic
        if (codingMax === 0 && mcqMax === 0) {
            setCodingWeightageDisabled(true)
            setMcqsWeightageDisabled(true)
        } else if (codingMax === 0 && mcqMax > 0) {
            setCodingWeightageDisabled(true)
            setMcqsWeightageDisabled(true)
        } else if (mcqMax === 0 && codingMax > 0) {
            setCodingWeightageDisabled(true)
            setMcqsWeightageDisabled(true)
        } else if (codingMax > 0 && mcqMax > 0) {
            setCodingWeightageDisabled(false)
            setMcqsWeightageDisabled(false)
        }
    }, [content])

    return (
        <ScrollArea className="h-screen pb-24">
            <ScrollBar orientation="vertical" className="" />
            <main className="pb-6 w-full  bg-white text-left">
                <div
                    onClick={() => setQuestionType('coding')}
                    className="flex items-center mb-6 cursor-pointer box-border"
                >
                    <ChevronLeft className="w-4 h-4 mr-2 box-border" />
                    <span className="font-semibold">
                        Back to{' '}
                        {content?.ModuleAssessment?.title || 'Assessment'}
                    </span>
                </div>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="mt-4"
                    >
                        {/* Submit Button */}
                        <div className="flex justify-between w-full">
                            <h1 className="text-lg font-bold">
                                Manage Settings
                            </h1>
                            {/* Section 6: Submit button */}
                            <Button type="submit" className="w-1/5 mr-3">
                                Save Settings
                            </Button>
                        </div>

                        {/* Section 1: Choose number of questions */}
                        <section>
                            <h2 className="font-semibold mb-2">
                                Choose number of questions shown to students
                            </h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Students will receive at least 1 question from
                                each difficulty level of each question type.
                                Additionally, the questions will be randomized
                                for each question type.
                            </p>

                        <div className="flex justify-between items-start">
                            {[
                                {
                                    title: 'Coding Problems',
                                    fields: [
                                        'codingProblemsEasy',
                                        'codingProblemsMedium',
                                        'codingProblemsHard',
                                    ],
                                    counts: selectCodingDifficultyCount,
                                    max: codingMax,
                                },
                                {
                                    title: 'MCQs',
                                    fields: [
                                        'mcqsEasy',
                                        'mcqsMedium',
                                        'mcqsHard',
                                    ],
                                    mcqCounts: selectQuizDifficultyCount,
                                    max: mcqMax,
                                },
                            ].map((category, index) => (
                                <div key={index} className="mb-4">
                                    <h3 className="font-semibold mb-2">
                                        {category.title}
                                    </h3>
                                    {category.fields.map((field, idx) => (
                                        <FormField
                                            key={field}
                                            control={form.control}
                                            name={
                                                field as keyof typeof totalQuestions
                                            }
                                            render={({ field }) => {
                                                const isError = Boolean(
                                                    form.formState.errors[
                                                        field.name
                                                    ]
                                                )
                                                return (
                                                    <FormItem className="flex items-center mb-2">
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                className={`w-16 mr-2 no-spinners ${
                                                                    form
                                                                        .formState
                                                                        .errors[
                                                                        field
                                                                            .name
                                                                    ]
                                                                        ? 'border-red-500 outline-red-500 text-red-500'
                                                                        : 'border-gray-300'
                                                                }`}
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    handleInputChange(
                                                                        field.name as keyof typeof totalQuestions,
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }}
                                                                onFocus={() => {
                                                                    setEditingFields(
                                                                        (prev:any) => ({
                                                                            ...prev,
                                                                            [field.name]:
                                                                                true,
                                                                        })
                                                                    )
                                                                }}
                                                                onBlur={() => {
                                                                    setEditingFields(
                                                                        (prev:any) => ({
                                                                            ...prev,
                                                                            [field.name]:
                                                                                false,
                                                                        })
                                                                    )
                                                                }}
                                                                value={
                                                                     field.value
                                                                }
                                                            />
                                                        </FormControl>
                                                        <div className="flex flex-col">
                                                            {!isError && (
                                                                <FormLabel className="text-sm m-0 p-0">
                                                                    {
                                                                        [
                                                                            'Easy',
                                                                            'Medium',
                                                                            'Hard',
                                                                        ][idx]
                                                                    }{' '}
                                                                    question(s)
                                                                    out of{' '}
                                                                    {category.title ===
                                                                    'Coding Problems'
                                                                        ? (category.counts &&
                                                                              category
                                                                                  .counts[
                                                                                  `codingProblems${
                                                                                      [
                                                                                          'Easy',
                                                                                          'Medium',
                                                                                          'Hard',
                                                                                      ][
                                                                                          idx
                                                                                      ]
                                                                                  }`
                                                                              ]) ||
                                                                          0
                                                                        : (category.mcqCounts &&
                                                                              category
                                                                                  .mcqCounts[
                                                                                  `${
                                                                                      [
                                                                                          'mcqsEasy',
                                                                                          'mcqsMedium',
                                                                                          'mcqsHard',
                                                                                      ][
                                                                                          idx
                                                                                      ]
                                                                                  }`
                                                                              ]) ||
                                                                          0}
                                                                </FormLabel>
                                                            )}
                                                            {form.formState
                                                                .errors[
                                                                field.name
                                                            ] && (
                                                                <div className="flex items-center gap-1 mt-1 text-red-500">
                                                                    <AlertCircle color="#db3939" />
                                                                    <FormMessage className="text-sm">
                                                                        {
                                                                            form
                                                                                .formState
                                                                                .errors[
                                                                                field
                                                                                    .name
                                                                            ]
                                                                                ?.message
                                                                        }
                                                                    </FormMessage>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </FormItem>
                                                )
                                            }}
                                        />
                                    ))}
                                </div>
                            ))}

                                <div className="mb-4">
                                    <h3 className="font-semibold mb-2 mr-3">
                                        Total Selected Questions
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm ml-2 mb-2">
                                            <span className="text-sm font-bold">
                                                Coding:{' '}
                                            </span>
                                            {`${
                                                Number.isNaN(
                                                    totalSelectedCodingQues
                                                )
                                                    ? 0
                                                    : totalSelectedCodingQues
                                            } out of ${codingMax}`}
                                        </p>
                                        <p className="text-sm ml-2">
                                            <span className="text-sm font-bold ">
                                                Quiz:{' '}
                                            </span>
                                            {`${
                                                Number.isNaN(
                                                    totalSelectedQuizQues
                                                )
                                                    ? 0
                                                    : totalSelectedQuizQues
                                            } out of ${mcqMax}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Individual Section Weightage */}
                        <div className="flex space-x-48 my-8 ">
                            <section>
                                <h2 className="font-semibold mb-2">
                                    Individual Section Weightage
                                </h2>
                                <p className="text-sm text-gray-600 mb-4">
                                    Total from both categories should be 100%
                                </p>
                                {[
                                    {
                                        title: 'Coding Problems',
                                        field: 'codingProblemsWeightage',
                                        disabled: codingWeightageDisabled,
                                        max: codingMax,
                                    },
                                    {
                                        title: 'MCQs',
                                        field: 'mcqsWeightage',
                                        disabled: mcqsWeightageDisabled,
                                        max: mcqMax,
                                    },
                                ].map((category: any, index: any) => {
                                    // Check if there's an error for either codingProblemsWeightage or mcqsWeightage
                                    const isError =
                                        form.formState.errors
                                            .codingProblemsWeightage ||
                                        form.formState.errors.mcqsWeightage
                                    return (
                                        <FormField
                                            key={index}
                                            control={form.control}
                                            name={category.field}
                                            render={({ field }) => (
                                                <FormItem className="flex items-center mb-2">
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            className={`w-16 mr-2 no-spinners ${
                                                                isError
                                                                    ? 'border-red-500 outline-red-500 text-red-500'
                                                                    : 'border-gray-300'
                                                            }`}
                                                            disabled={
                                                                category.disabled
                                                            }
                                                            onChange={(
                                                                e: any
                                                            ) =>
                                                                handleWeightageChange(
                                                                    e,
                                                                    field
                                                                )
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormLabel
                                                        className={`text-sm ${
                                                            isError
                                                                ? 'text-red-500'
                                                                : 'text-gray-700'
                                                        }`}
                                                    >
                                                        {category.title}
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    )
                                })}
                                {/* Display error messages if any */}
                                {form.formState.errors
                                    .codingProblemsWeightage && (
                                    <div className="flex gap-2">
                                        <AlertCircle color="#db3939" />
                                        <FormMessage className="text-red-500 text-sm mt-1">
                                            {
                                                form.formState.errors
                                                    .codingProblemsWeightage
                                                    .message
                                            }
                                        </FormMessage>
                                    </div>
                                )}
                                {form.formState.errors.mcqsWeightage && (
                                    <div className="flex gap-2">
                                        <AlertCircle color="#db3939" />
                                        <FormMessage className="text-red-500 text-sm mt-1">
                                            {
                                                form.formState.errors
                                                    .mcqsWeightage.message
                                            }
                                        </FormMessage>
                                    </div>
                                )}
                            </section>

                            {/* Section 3: Manage Proctoring Settings */}
                            <section className="w-1/3">
                                <h2 className="font-semibold mb-4">
                                    Manage Proctoring Settings
                                </h2>
                                {[
                                    {
                                        label: 'Copy Paste',
                                        name: 'canCopyPaste' as const,
                                    },
                                    {
                                        label: 'Tab Change',
                                        name: 'tabSwitch' as const,
                                    },
                                    {
                                        label: 'Screen Exit',
                                        name: 'screenExit' as const,
                                    },
                                    {
                                        label: 'Eye Tracking',
                                        name: 'eyeTracking' as const,
                                    },
                                ].map((option, index) => (
                                    <FormField
                                        key={index}
                                        control={form.control}
                                        name={option.name}
                                        render={({ field }) => (
                                            <FormItem className="">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <FormLabel className="text-sm text-center font-normal text-gray-600">
                                                            {option.label}
                                                        </FormLabel>
                                                    </div>
                                                    <div>
                                                        <FormControl>
                                                            <ToggleSwitch
                                                                initialChecked={
                                                                    field.value as boolean
                                                                }
                                                                onToggle={
                                                                    field.onChange
                                                                }
                                                            />
                                                        </FormControl>
                                                    </div>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </section>
                        </div>

                        {/* Section 4: Time limit */}
                        <div className="flex space-x-44">
                            {/* Section 1: Time Limit */}
                            <section className="w-1/4 mr-5">
                                <h2 className="font-semibold mb-4">
                                    Time limit
                                </h2>
                                <div className="flex flex-col space-y-4 ">
                                    {' '}
                                    {/* Stack inputs vertically with space-y-4 */}
                                    {/* Hour Selector */}
                                    <div>
                                        <FormField
                                            control={form.control}
                                            name="hour"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        defaultValue={field.value.toString()}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select hour" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {hours.map(
                                                                    (hour) => (
                                                                        <SelectItem
                                                                            key={
                                                                                hour
                                                                            }
                                                                            value={hour.toString()}
                                                                        >
                                                                            {hour >
                                                                            1
                                                                                ? `${hour} Hours`
                                                                                : `${hour} Hour`}
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    {/* Minute Selector */}
                                    <div>
                                        <FormField
                                            control={form.control}
                                            name="minute"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        defaultValue={field.value.toString()}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select minute" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {minutes.map(
                                                                    (
                                                                        minute
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                minute
                                                                            }
                                                                            value={minute.toString()}
                                                                        >
                                                                            {
                                                                                minute
                                                                            }{' '}
                                                                            Min
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Section 5: Set Pass Percentage */}
                            <section className="">
                                <h2 className="font-semibold mb-4">
                                    Pass Percentage (Out Of 100)
                                </h2>
                                <FormField
                                    control={form.control}
                                    name="passPercentage"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col items-start">
                                            <div className="flex items-center">
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        className={`w-16 mr-2 no-spinners ${
                                                            form.formState
                                                                .errors
                                                                .passPercentage
                                                                ? 'border-red-500 outline-red-500 text-red-500'
                                                                : 'border-gray-300'
                                                        }`}
                                                        onChange={(e) => {
                                                            const value =
                                                                e.target.value
                                                            field.onChange(
                                                                value === ''
                                                                    ? null
                                                                    : Number(
                                                                          value
                                                                      )
                                                            )
                                                        }}
                                                    />
                                                </FormControl>
                                                <div
                                                    className={`text-md ${
                                                        form.formState.errors
                                                            .passPercentage
                                                            ? 'border-red-500 outline-red-500 text-red-500'
                                                            : 'border-gray-300'
                                                    }`}
                                                >
                                                    %
                                                </div>
                                            </div>
                                            {form.formState.errors
                                                .passPercentage && (
                                                <div className="flex items-center gap-2 mt-1 text-red-500">
                                                    <AlertCircle color="#db3939" />
                                                    <FormMessage className="text-sm">
                                                        {
                                                            form.formState
                                                                .errors
                                                                .passPercentage
                                                                .message
                                                        }
                                                    </FormMessage>
                                                </div>
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </section>
                        </div>
                    </form>
                </Form>
            </main>
        </ScrollArea>
    )
}

export default SettingsAssessment
