import React, { useEffect, useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getUser } from '@/store/store'
import * as z from 'zod'
import { ChevronLeft, AlertCircle, Info } from 'lucide-react'
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
import { getChapterUpdateStatus } from '@/store/store'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { proctoringOptions } from '@/utils/admin'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
// import {PublishAssessmentDialog} from '../PublishDialog';
import {
    PublishData,
    PublishAssessmentDialogs,
} from '@/app/[admin]/courses/[courseId]/module/_components/ModuleComponentType'
import { Badge } from '@/components/ui/badge'
import { SettingsAssessmentProps } from '@/app/[admin]/courses/[courseId]/module/_components/Assessment/ComponentAssessmentType'
import PublishAssessmentDialog from '../PublishDialog'
import { useRouter, useSearchParams } from 'next/navigation'

const SettingsAssessment: React.FC<SettingsAssessmentProps> = ({
    selectedCodingQuesIds,
    selectedQuizQuesIds,
    selectedOpenEndedQuesIds,
    selectedCodingQuesTagIds,
    selectedQuizQuesTagIds,
    content,
    fetchChapterContent,
    chapterTitle,
    saveSettings,
    setSaveSettings,
    setQuestionType,
    selectCodingDifficultyCount, // Prop is already typed
    selectQuizDifficultyCount, // Prop is already typed
    topicId,
    isNewQuestionAdded,
    setIsNewQuestionAdded,
    setChapterTitle,
}) => {
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const { courseId, moduleId, chapterID } = useParams()
    const codingMax = selectedCodingQuesIds.length
    const mcqMax = selectedQuizQuesIds.length
    const [codingWeightageDisabled, setCodingWeightageDisabled] =
        useState(false)
    const [mcqsWeightageDisabled, setMcqsWeightageDisabled] = useState(false)
    const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false) // Added state for dialog
    const [currentAssessmentStatus, setCurrentAssessmentStatus] = useState(
        content?.currentState
    )
    const router = useRouter()

    useEffect(() => {
        setCurrentAssessmentStatus(content?.currentState)
    }, [content?.currentState])

    const fetchCooldown = useRef(false)

    useEffect(() => {
        const { currentState, publishDatetime, startDatetime, endDatetime } =
            content
        if (!currentState) return

        // The date strings from the backend are in UTC. new Date().getTime() is also UTC-based.
        const now = new Date().getTime()

        let transitionTimeStr: string | null | undefined = null

        if (currentState === 'DRAFT' && publishDatetime) {
            transitionTimeStr = publishDatetime
        } else if (currentState === 'PUBLISHED' && startDatetime) {
            transitionTimeStr = startDatetime
        } else if (currentState === 'ACTIVE' && endDatetime) {
            transitionTimeStr = endDatetime
        }

        if (!transitionTimeStr) {
            return // No scheduled transition for the current state
        }

        const transitionTime = new Date(transitionTimeStr).getTime()
        const delay = transitionTime - now

        if (delay > 0) {
            // To prevent a race condition with the backend, we wait 10 seconds after the scheduled
            // transition time before fetching the updated content.
            const timerId = setTimeout(() => {
                fetchChapterContent(chapterID, topicId)
            }, delay + 3000) // Add 3-second delay

            return () => clearTimeout(timerId) // Cleanup timer
        } else {
            // The transition time is in the past.
            // We fetch the content to ensure the UI is up-to-date.
            // A cooldown and a 10-second delay are used to prevent API errors if the
            // backend is slow to update.
            if (!fetchCooldown.current) {
                fetchCooldown.current = true
                setTimeout(() => {
                    fetchChapterContent(chapterID, topicId)
                }, 10000) // Wait 10 seconds before fetching

                // Reset cooldown after 20s to allow another check later if needed.
                setTimeout(() => {
                    fetchCooldown.current = false
                }, 20000)
            }
        }
    }, [content, fetchChapterContent, chapterID, topicId])

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
    const hours = Array.from({ length: 5 }, (_, i) => i + 1)
    const minutes = [0, 15, 30, 45]
    const { isChapterUpdated, setIsChapterUpdated } = getChapterUpdateStatus()
    const [description, setDescription] = useState(
        content?.ModuleAssessment?.description || ''
    )

    const handleDialogSave = (publishData: PublishData) => {
        // Trigger RHF submit which then calls onSubmit with both form and publish data.
        form.handleSubmit((formValues) => onSubmit(formValues, publishData))()
        setIsPublishDialogOpen(false) // Close dialog after save attempt
    }

    const formSchema = z
        .object({
            codingProblemsEasy: z
                .number()
                .min(0)
                .max(selectCodingDifficultyCount.codingProblemsEasy || 0, {
                    message: `Cannot exceed ${
                        selectCodingDifficultyCount.codingProblemsEasy || 0
                    }`,
                }),
            codingProblemsMedium: z
                .number()
                .min(0)
                .max(selectCodingDifficultyCount.codingProblemsMedium || 0, {
                    message: `Cannot exceed ${
                        selectCodingDifficultyCount.codingProblemsMedium || 0
                    }`,
                }),
            codingProblemsHard: z
                .number()
                .min(0)
                .max(selectCodingDifficultyCount.codingProblemsHard || 0, {
                    message: `Cannot exceed ${
                        selectCodingDifficultyCount.codingProblemsHard || 0
                    }`,
                }),
            mcqsEasy: z
                .number()
                .min(0)
                .max(selectQuizDifficultyCount.mcqsEasy || 0, {
                    message: `Cannot exceed ${
                        selectQuizDifficultyCount.mcqsEasy || 0
                    }`,
                }),
            mcqsMedium: z
                .number()
                .min(0)
                .max(selectQuizDifficultyCount.mcqsMedium || 0, {
                    message: `Cannot exceed ${
                        selectQuizDifficultyCount.mcqsMedium || 0
                    }`,
                }),
            mcqsHard: z
                .number()
                .min(0)
                .max(selectQuizDifficultyCount.mcqsHard || 0, {
                    message: `Cannot exceed ${
                        selectQuizDifficultyCount.mcqsHard || 0
                    }`,
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
                {
                    name: 'codingProblemsEasy',
                    count: selectCodingDifficultyCount.codingProblemsEasy,
                },
                {
                    name: 'codingProblemsMedium',
                    count: selectCodingDifficultyCount.codingProblemsMedium,
                },
                {
                    name: 'codingProblemsHard',
                    count: selectCodingDifficultyCount.codingProblemsHard,
                },
            ]

            codingCounts.forEach(({ name, count }) => {
                if (count > 0 && data[name as keyof typeof data] === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `At least 1 question is required for ${name.replace(
                            'codingProblems',
                            ''
                        )} difficulty`,
                        path: [name],
                    })
                }
            })

            // Custom validation for MCQs
            const mcqCounts = [
                { name: 'mcqsEasy', count: selectQuizDifficultyCount.mcqsEasy },
                {
                    name: 'mcqsMedium',
                    count: selectQuizDifficultyCount.mcqsMedium,
                },
                { name: 'mcqsHard', count: selectQuizDifficultyCount.mcqsHard },
            ]

            mcqCounts.forEach(({ name, count }) => {
                if (count > 0 && data[name as keyof typeof data] === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `At least 1 question is required for ${name.replace(
                            'mcqs',
                            ''
                        )} difficulty`,
                        path: [name],
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
        setIsNewQuestionAdded(false)
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
        const value = e.target.value === '' ? null : Number(e.target.value)

        // Determine which weightage field is being changed
        const isCodeField = field.name === 'codingProblemsWeightage'
        const otherField = isCodeField
            ? 'mcqsWeightage'
            : 'codingProblemsWeightage'

        // Set the value for the current field
        field.onChange(value)

        // Automatically update the other field to total 100
        const otherFieldValue = value ? 100 - value : 100
        form.setValue(otherField, otherFieldValue, {
            shouldValidate: true,
        })
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

    async function onSubmit(values: any, publishData?: PublishData) {
        setIsNewQuestionAdded(false)
        const timeLimit =
            Number(values.hour) * 3600 + Number(values.minute) * 60

        const totalCodingQuestions =
            (Number(values.codingProblemsEasy) || 0) +
            (Number(values.codingProblemsMedium) || 0) +
            (Number(values.codingProblemsHard) || 0)

        const totalMcqQuestions =
            (Number(values.mcqsEasy) || 0) +
            (Number(values.mcqsMedium) || 0) +
            (Number(values.mcqsHard) || 0)

        const data: any = {
            title: chapterTitle,
            description: description,
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
            totalCodingQuestions: totalCodingQuestions,
            totalMcqQuestions: totalMcqQuestions,
            easyMcqQuestions: Number(values.mcqsEasy),
            mediumMcqQuestions: Number(values.mcqsMedium),
            hardMcqQuestions: Number(values.mcqsHard),
            weightageCodingQuestions: Number(values.codingProblemsWeightage),
            weightageMcqQuestions: Number(values.mcqsWeightage),
        }

        if (publishData) {
            // If publishData is present, assign its date properties to the data object.
            // This will correctly pass along string dates, nulls, or undefined.
            // JSON.stringify will include keys with null values, and omit keys with undefined values.
            data.publishDatetime = publishData.publishDateTime
            data.startDatetime = publishData.startDateTime
            data.endDatetime = publishData.endDateTime
        }

        if (publishData?.action === 'publishNow') {
            const nowUTC = new Date().toISOString()
            // If current state is PUBLISHED or ACTIVE, keep existing publish time and update start time to now.
            if (
                content?.currentState === 'PUBLISHED' ||
                content?.currentState === 'ACTIVE'
            ) {
                data.startDatetime = nowUTC
                data.publishDatetime = content?.publishDatetime || nowUTC // Preserve existing publish time if available
            } else {
                // For DRAFT or CLOSED states, set both publish and start to now.
                data.publishDatetime = nowUTC
                data.startDatetime = nowUTC
            }
        }

        try {
            const response = await api.put(
                `Content/editAssessment/${content.assessmentOutsourseId}/${chapterID}`,
                data
            )

            fetchChapterContent(chapterID, topicId)
            setIsChapterUpdated(!isChapterUpdated)

            const updatedContent = await fetchChapterContent(chapterID, topicId)
            setCurrentAssessmentStatus(updatedContent?.currentState)

            toast({
                title: 'Assessment Updated Successfully',
                description: 'Assessment has been updated successfully',
            })
        } catch (error) {
            console.error(error)
            toast({
                title: 'Error Updating Assessment',
                description: 'There was an error updating the assessment.',
                variant: 'destructive',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }

    // Show Selections on page load as it is coming from the api:-
    useEffect(() => {
        form.reset({
            codingProblemsEasy: content?.easyCodingQuestions || 0,
            codingProblemsMedium: content?.mediumCodingQuestions || 0,
            codingProblemsHard: content?.hardCodingQuestions || 0,
            mcqsEasy: content?.easyMcqQuestions || 0,
            mcqsMedium: content?.mediumMcqQuestions || 0,
            mcqsHard: content?.hardMcqQuestions || 0,
            codingProblemsWeightage:
                codingMax > 0 && mcqMax > 0
                    ? content?.weightageCodingQuestions || 50
                    : codingMax > 0
                    ? 100
                    : 0,
            mcqsWeightage:
                codingMax > 0 && mcqMax > 0
                    ? content?.weightageMcqQuestions || 50
                    : mcqMax > 0
                    ? 100
                    : 0,
            canCopyPaste:
                content?.canCopyPaste !== null &&
                content?.canCopyPaste !== undefined
                    ? content.canCopyPaste
                    : true,
            tabSwitch:
                content?.canTabChange !== null &&
                content?.canTabChange !== undefined
                    ? content.canTabChange
                    : true,
            screenExit:
                content?.canScreenExit !== null &&
                content?.canScreenExit !== undefined
                    ? content.canScreenExit
                    : true,
            eyeTracking:
                content?.canEyeTrack !== null &&
                content?.canEyeTrack !== undefined
                    ? content.canEyeTrack
                    : true,
            hour: content.timeLimit
                ? String(Math.floor(content.timeLimit / 3600))
                : '2',
            minute: content.timeLimit
                ? String(Math.floor((Number(content.timeLimit) % 3600) / 60))
                : '15',
            passPercentage: content?.passPercentage || 70,
        })
        // Apply weightage disabling logic
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

    // Remove randomization of questions if new questions are added:
    useEffect(() => {
        if (isNewQuestionAdded) {
            form.setValue(
                'codingProblemsEasy',
                selectCodingDifficultyCount?.codingProblemsEasy || 0
            )
            form.setValue(
                'codingProblemsMedium',
                selectCodingDifficultyCount?.codingProblemsMedium || 0
            )
            form.setValue(
                'codingProblemsHard',
                selectCodingDifficultyCount?.codingProblemsHard || 0
            )
            setTotalSelectedCodingQues(codingMax)
            form.setValue('mcqsEasy', selectQuizDifficultyCount?.mcqsEasy || 0)
            form.setValue(
                'mcqsMedium',
                selectQuizDifficultyCount?.mcqsMedium || 0
            )
            form.setValue('mcqsHard', selectQuizDifficultyCount?.mcqsHard || 0) // selectQuizDifficultyCount is typed via props
            setTotalSelectedQuizQues(mcqMax)
            setTotalQuestions({
                codingProblemsEasy:
                    selectCodingDifficultyCount?.codingProblemsEasy || 0,
                codingProblemsMedium:
                    selectCodingDifficultyCount?.codingProblemsMedium || 0,
                codingProblemsHard:
                    selectCodingDifficultyCount?.codingProblemsHard || 0,
                mcqsEasy: selectQuizDifficultyCount?.mcqsEasy || 0,
                mcqsMedium: selectQuizDifficultyCount?.mcqsMedium || 0,
                mcqsHard: selectQuizDifficultyCount?.mcqsHard || 0,
            })
            // Apply weightage disabling logic
            if (codingMax === 0 && mcqMax === 0) {
                setCodingWeightageDisabled(true)
                setMcqsWeightageDisabled(true)
                form.setValue('codingProblemsWeightage', 0)
                form.setValue('mcqsWeightage', 0)
            } else if (codingMax === 0 && mcqMax > 0) {
                setCodingWeightageDisabled(true)
                setMcqsWeightageDisabled(true)
                form.setValue('codingProblemsWeightage', 0)
                form.setValue('mcqsWeightage', 100)
            } else if (mcqMax === 0 && codingMax > 0) {
                setCodingWeightageDisabled(true)
                setMcqsWeightageDisabled(true)
                form.setValue('codingProblemsWeightage', 100)
                form.setValue('mcqsWeightage', 0)
            } else if (codingMax > 0 && mcqMax > 0) {
                setCodingWeightageDisabled(false)
                setMcqsWeightageDisabled(false)
                form.setValue('codingProblemsWeightage', 50)
                form.setValue('mcqsWeightage', 50)
            }
        }
    }, [selectCodingDifficultyCount, selectQuizDifficultyCount])

    const backToAssessment = () => {
        setQuestionType('coding')
        router.push(
            `/${userRole}/courses/${courseId}/module/${moduleId}/chapters/${chapterID}`
        )
    }

    return (
        <ScrollArea className="h-screen pb-24 pr-10">
            <ScrollBar orientation="vertical" className="" />
            <main className="pb-6 w-full bg-card text-left">
                <div
                    onClick={backToAssessment}
                    className="flex items-center mb-6 cursor-pointer box-border"
                >
                    <ChevronLeft className="w-4 h-4 mr-2 box-border text-muted-dark" />
                    <span className="font-semibold text-muted-dark">
                        Back to{' '}
                        {/* {content?.ModuleAssessment?.title || 'Assessment'} */}
                        {chapterTitle}
                    </span>
                </div>

                <Form {...form}>
                    <form
                        // onSubmit={form.handleSubmit(onSubmit)} // Submission is now triggered by dialog save
                        className="mt-4 ml-1"
                    >
                        <div className="flex justify-between w-full items-center mb-6">
                            <div className="flex items-center">
                                <h1 className="text-lg font-bold text-muted-dark">
                                    Manage Settings
                                </h1>
                                {currentAssessmentStatus && (
                                    <Badge
                                        variant={
                                            currentAssessmentStatus === 'ACTIVE'
                                                ? 'secondary'
                                                : currentAssessmentStatus ===
                                                  'PUBLISHED'
                                                ? 'default'
                                                : currentAssessmentStatus ===
                                                  'DRAFT'
                                                ? 'yellow'
                                                : currentAssessmentStatus ===
                                                  'CLOSED'
                                                ? 'default'
                                                : 'destructive'
                                        }
                                        className="ml-3 text-sm"
                                    >
                                        {currentAssessmentStatus
                                            .charAt(0)
                                            .toUpperCase() +
                                            currentAssessmentStatus
                                                .slice(1)
                                                .toLowerCase()}
                                    </Badge>
                                )}
                            </div>

                            <Dialog
                                open={isPublishDialogOpen}
                                onOpenChange={setIsPublishDialogOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="default"
                                        className="w-auto px-6 bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        Publish Options
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <PublishAssessmentDialog
                                        onSave={handleDialogSave} // Use the new handler
                                        currentAssessmentStatus={
                                            currentAssessmentStatus
                                        }
                                        initialPublishDate={
                                            content?.publishDatetime
                                        }
                                        initialStartDate={
                                            content?.startDatetime
                                        }
                                        initialEndDate={content?.endDatetime}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="flex items-center mb-6 text-muted-dark">
                            <label
                                className="font-semibold mr-2 mt-1"
                                htmlFor="description"
                            >
                                Description:{' '}
                            </label>
                            <Input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter description (optional)"
                                type="text"
                                className="w-1/2"
                                id="description"
                            />
                        </div>

                        {/* Section 1: Choose number of questions */}
                        <section>
                            <h2 className="font-semibold mb-2 text-muted-dark text-[15px]">
                                Choose number of questions shown to students
                            </h2>
                            <p className="text-sm text-muted-dark mb-4">
                                Students will receive at least 1 question from
                                each difficulty level of each question type.
                                Additionally, the questions will be randomized
                                for each question type.
                            </p>

                            <div className="flex justify-between items-start text-muted-dark">
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
                                        <h3 className="font-semibold mb-2 text-[15px]">
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
                                                                            ? 'border-destructive outline-destructive text-destructive'
                                                                            : 'border-gray-300'
                                                                    }`}
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        handleInputChange(
                                                                            field.name as keyof typeof totalQuestions,
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }}
                                                                    onFocus={() => {
                                                                        setIsNewQuestionAdded(
                                                                            false
                                                                        )
                                                                        setEditingFields(
                                                                            (
                                                                                prev: any
                                                                            ) => ({
                                                                                ...prev,
                                                                                [field.name]:
                                                                                    true,
                                                                            })
                                                                        )
                                                                    }}
                                                                    onBlur={() => {
                                                                        setIsNewQuestionAdded(
                                                                            false
                                                                        )
                                                                        setEditingFields(
                                                                            (
                                                                                prev: any
                                                                            ) => ({
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
                                                                            ][
                                                                                idx
                                                                            ]
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
                                                                    <div className="flex items-center gap-1 mt-1 text-destructive">
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
                                    <h3 className="font-semibold mb-2 mr-3 text-[15px]">
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
                                                    : totalQuestions.codingProblemsEasy +
                                                      totalQuestions.codingProblemsMedium +
                                                      totalQuestions.codingProblemsHard
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
                                                    : totalQuestions.mcqsEasy +
                                                      totalQuestions.mcqsMedium +
                                                      totalQuestions.mcqsHard
                                            } out of ${mcqMax}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Individual Section Weightage */}
                        <div className="flex space-x-48 my-8 ">
                            <section>
                                <h2 className="font-semibold mb-2 text-muted-dark text-[15px]">
                                    Individual Section Weightage
                                </h2>
                                <p className="text-sm text-muted-dark mb-4">
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
                                                                    ? 'border-destructive outline-destructive text-destructive'
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
                                                                ? 'text-destructive'
                                                                : 'text-muted-dark'
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
                                        <FormMessage className="text-destructive text-sm mt-1">
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
                                        <FormMessage className="text-destructive text-sm mt-1">
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
                                <h2 className="font-semibold mb-4 text-muted-dark text-[15px]">
                                    Manage Proctoring Settings
                                </h2>
                                {proctoringOptions.map((option, index) => (
                                    <FormField
                                        key={index}
                                        control={form.control}
                                        name={option.name}
                                        render={({ field }) => (
                                            <FormItem>
                                                <div
                                                    className={`flex items-center justify-between mb-4 w-3/4 ${
                                                        option.name ===
                                                        'screenExit'
                                                            ? 'hidden'
                                                            : ''
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between space-x-2 w-1/3">
                                                        <div>
                                                            <FormLabel className="text-sm text-center font-normal text-muted-dark">
                                                                {option.label}
                                                            </FormLabel>
                                                        </div>
                                                        <div className="mt-2">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger
                                                                        onClick={(
                                                                            e
                                                                        ) =>
                                                                            e.preventDefault()
                                                                        }
                                                                    >
                                                                        <Info className="text-muted-dark w-4 h-4 cursor-default" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p className="text-sm max-w-xs">
                                                                            {
                                                                                option.tooltip
                                                                            }
                                                                        </p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <FormControl>
                                                            <ToggleSwitch
                                                                isChecked={
                                                                    field.value as boolean
                                                                }
                                                                onToggle={
                                                                    field.onChange
                                                                }
                                                                className={
                                                                    field.value
                                                                        ? 'bg-primary'
                                                                        : 'bg-muted-light'
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
                            <section className="w-1/4">
                                <h2 className="font-semibold mb-4 text-muted-dark text-[15px]">
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
                                                            <SelectTrigger className="focus:outline-none focus:ring-0">
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
                                                            <SelectTrigger className="focus:outline-none focus:ring-0">
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
                                <h2 className="font-semibold mb-4 text-muted-dark text-[15px]">
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
                                                                ? 'border-destructive outline-destructive text-destructive'
                                                                : 'border-muted-light'
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
                                                            ? 'border-destructive outline-destructive text-destructive'
                                                            : 'border-muted-light'
                                                    }`}
                                                >
                                                    %
                                                </div>
                                            </div>
                                            {form.formState.errors
                                                .passPercentage && (
                                                <div className="flex items-center gap-2 mt-1 text-destructive">
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
