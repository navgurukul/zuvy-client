import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ChevronLeft } from 'lucide-react'
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

type SettingsAssessmentProps = {
    selectedCodingQuesIds: any
    selectedQuizQuesIds: any
    selectedOpenEndedQuesIds: any
    content: any
    fetchChapterContent: any
    chapterData: any
    chapterTitle: string
    saveSettings: boolean
    setSaveSettings: (value: boolean) => void
    setQuestionType: (value: string) => void
    selectCodingDifficultyCount: any
    selectQuizDifficultyCount: any
}

const SettingsAssessment: React.FC<SettingsAssessmentProps> = ({
    selectedCodingQuesIds,
    selectedQuizQuesIds,
    selectedOpenEndedQuesIds,
    content,
    fetchChapterContent,
    chapterData,
    chapterTitle,
    saveSettings,
    setSaveSettings,
    setQuestionType,
    selectCodingDifficultyCount,
    selectQuizDifficultyCount,
}) => {
    const codingMax = selectedCodingQuesIds.length
    const mcqMax = selectedQuizQuesIds.length
    // Add state for disabling the inputs
    const [codingWeightageDisabled, setCodingWeightageDisabled] =
        useState(false)
    const [mcqsWeightageDisabled, setMcqsWeightageDisabled] = useState(false)

    const hours = Array.from({ length: 6 }, (_, i) => i)
    const minutes = [15, 30, 45]

    const formSchema = z
        .object({
            codingProblemsEasy: z
                .number()
                .min(0)
                .max(
                    selectCodingDifficultyCount.codingProblemsEasy || codingMax,
                    {
                        message: `Cannot exceed ${
                            selectCodingDifficultyCount.codingProblemsEasy ||
                            codingMax
                        }`,
                    }
                ),
            codingProblemsMedium: z
                .number()
                .min(0)
                .max(
                    selectCodingDifficultyCount.codingProblemsMedium ||
                        codingMax,
                    {
                        message: `Cannot exceed ${
                            selectCodingDifficultyCount.codingProblemsMedium ||
                            codingMax
                        }`,
                    }
                ),
            codingProblemsHard: z
                .number()
                .min(0)
                .max(
                    selectCodingDifficultyCount.codingProblemsHard || codingMax,
                    {
                        message: `Cannot exceed ${
                            selectCodingDifficultyCount.codingProblemsHard ||
                            codingMax
                        }`,
                    }
                ),
            mcqsEasy: z
                .number()
                .min(0)
                .max(selectQuizDifficultyCount.mcqsEasy || mcqMax, {
                    message: `Cannot exceed ${
                        selectQuizDifficultyCount.mcqsEasy || mcqMax
                    }`,
                }),
            mcqsMedium: z
                .number()
                .min(0)
                .max(selectQuizDifficultyCount.mcqsMedium || mcqMax, {
                    message: `Cannot exceed ${
                        selectQuizDifficultyCount.mcqsMedium || mcqMax
                    }`,
                }),
            mcqsHard: z
                .number()
                .min(0)
                .max(selectQuizDifficultyCount.mcqsHard || mcqMax, {
                    message: `Cannot exceed ${
                        selectQuizDifficultyCount.mcqsHard || mcqMax
                    }`,
                }),
            codingProblemsWeightage: z.number().min(0).max(100),
            mcqsWeightage: z.number().min(0).max(100),
            copyPaste: z.boolean(),
            tabSwitch: z.boolean(),
            screenExit: z.boolean(),
            eyeTracking: z.boolean(),
            hour: z.number().min(0).max(5),
            minute: z.number().min(15).max(59),
            passPercentage: z.number().min(0).max(100),
        })
        .refine(
            (data) => data.codingProblemsWeightage + data.mcqsWeightage === 100,
            {
                message:
                    'Total weightage for Coding Problems and MCQs must be 100%',
                path: ['codingProblemsWeightage'], // You can add path to indicate which field to highlight in case of an error
            }
        )

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
            copyPaste: true,
            tabSwitch: true,
            screenExit: false,
            eyeTracking: false,
            hour: 2,
            minute: 15,
            passPercentage: 70,
        },
    })

    useEffect(() => {
        form.reset({
            codingProblemsEasy: 0,
            codingProblemsMedium: 0,
            codingProblemsHard: 0,
            mcqsEasy: 0,
            mcqsMedium: 0,
            mcqsHard: 0,
            codingProblemsWeightage: 0,
            mcqsWeightage: 0,
            copyPaste: true,
            tabSwitch: true,
            screenExit: false,
            hour: 2,
            minute: 15,
            passPercentage: 70,
        })
    }, [content])

    async function onSubmit(values: any) {
        console.log('values', values)
        const timeLimit = values.hour * 3600 + values.minute * 60
        const data = {
            title: chapterTitle,
            description:
                'This assessment has 2 dsa problems, 5 mcq and 3 theory questions',
            codingProblemIds: selectedCodingQuesIds,
            mcqIds: selectedQuizQuesIds,
            openEndedQuestionIds: selectedOpenEndedQuesIds,
            passPercentage: Number(values.passPercentage),
            timeLimit: Number(timeLimit),
            copyPaste: values.copyPaste,
            tabChange: values.tabSwitch,
            screenRecord: values.screenExit,
        }

        try {
            await api.put(
                `Content/editAssessment/${content.id}/${chapterData.chapterId}`,
                data
            )
            fetchChapterContent(chapterData.chapterId)
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

    // useEffect to handle logic based on codingMax and mcqMax
    useEffect(() => {
        if (codingMax === 0 && mcqMax === 0) {
            form.setValue('codingProblemsWeightage', 0)
            form.setValue('mcqsWeightage', 0)
            setCodingWeightageDisabled(true)
            setMcqsWeightageDisabled(true)
        } else if (codingMax === 0) {
            form.setValue('codingProblemsWeightage', 0)
            form.setValue('mcqsWeightage', 100)
            setCodingWeightageDisabled(true)
            setMcqsWeightageDisabled(true)
        } else if (mcqMax === 0) {
            form.setValue('codingProblemsWeightage', 100)
            form.setValue('mcqsWeightage', 0)
            setCodingWeightageDisabled(true)
            setMcqsWeightageDisabled(true)
        } else {
            setCodingWeightageDisabled(false)
            setMcqsWeightageDisabled(false)
        }
    }, [codingMax, mcqMax, form])

    return (
        <main className="pb-6 bg-white text-left">
            <div
                onClick={() => setQuestionType('coding')}
                className="flex items-center mb-6 cursor-pointer box-border"
            >
                <ChevronLeft className="w-4 h-4 mr-2 box-border" />
                <span className="font-semibold">
                    Back to {content?.ModuleAssessment?.title || 'Assessment'}
                </span>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
                    {/* Submit Button */}
                    <div className="flex justify-between w-full">
                        <h1 className="text-lg font-bold">Manage Settings</h1>
                        {/* Section 6: Submit button */}
                        <Button type="submit" className="w-1/5">
                            Save Settings
                        </Button>
                    </div>

                    {/* Section 1: Choose number of questions */}
                    <section>
                        <h2 className="font-semibold mb-2">
                            Choose number of questions shown to students
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Students will receive at least 1 question from each
                            difficulty level of each question type.
                            Additionally, the questions will be randomized for
                            each question type.
                        </p>

                        <div className="flex justify-between">
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
                                <div
                                    key={index}
                                    className={
                                        category.title === 'MCQs' ? 'mr-10' : ''
                                    }
                                >
                                    <h3 className="font-semibold mb-2">
                                        {category.title}
                                    </h3>
                                    {category.fields.map(
                                        (field: any, idx: any) => (
                                            <FormField
                                                key={field}
                                                control={form.control}
                                                name={field}
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center mb-2">
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                className="w-16 mr-2 no-spinners"
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const value =
                                                                        e.target
                                                                            .value
                                                                    field.onChange(
                                                                        value ===
                                                                            ''
                                                                            ? null
                                                                            : Number(
                                                                                  value
                                                                              )
                                                                    )
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <div className="flex flex-col">
                                                            <FormLabel className="text-sm m-0 p-0">
                                                                {
                                                                    [
                                                                        'Easy',
                                                                        'Medium',
                                                                        'Hard',
                                                                    ][idx]
                                                                }{' '}
                                                                question(s) out
                                                                of{' '}
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
                                                            <FormMessage className="inline m-0 p-0" />
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 2: Individual Section Weightage */}
                    <div className="flex gap-10 my-8">
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
                            ].map((category: any, index: any) => (
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
                                                    className="w-16 mr-4 no-spinners"
                                                    disabled={category.disabled} // Disable input if needed
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value
                                                        field.onChange(
                                                            value === ''
                                                                ? null
                                                                : Number(value)
                                                        )
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="text-sm">
                                                {category.title} - Total{' '}
                                                {category.max}
                                            </FormLabel>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </section>

                        {/* Section 3: Manage Proctoring Settings */}
                        <section className="w-1/3 ml-12">
                            <h2 className="font-semibold mb-4">
                                Manage Proctoring Settings
                            </h2>
                            {[
                                {
                                    label: 'Copy Paste',
                                    name: 'copyPaste' as const,
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
                    <div className="flex">
                        {/* Section 1: Time Limit */}
                        <section className="w-1/4 mr-5">
                            <h2 className="font-semibold mb-4">Time limit</h2>
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
                                                                (minute) => (
                                                                    <SelectItem
                                                                        key={
                                                                            minute
                                                                        }
                                                                        value={minute.toString()}
                                                                    >
                                                                        {minute}{' '}
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
                        <section className="ml-20">
                            <h2 className="font-semibold mb-4">
                                Pass Percentage (Out Of 100)
                            </h2>
                            <FormField
                                control={form.control}
                                name="passPercentage"
                                render={({ field }) => (
                                    <FormItem className="flex items-center">
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                className="w-16 mr-2 no-spinners"
                                            />
                                        </FormControl>
                                        <FormLabel className="text-sm">
                                            %
                                        </FormLabel>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </section>
                    </div>
                </form>
            </Form>
        </main>
    )
}

export default SettingsAssessment
