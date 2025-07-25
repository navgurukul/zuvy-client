import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import TimerDisplay from './TimerDisplay'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn, difficultyColor } from '@/lib/utils'
import { RemirrorForm } from '@/components/remirror-editor/RemirrorForm'
import type {QuizQuestionsProps,QuizQuestion} from '@/app/student/course/[courseId]/studentAssessment/_studentAssessmentComponents/courseStudentAssesmentStudentTypes';

const QuizQuestions = ({
    onBack,
    weightage,
    remainingTime,
    questions,
    assessmentSubmitId,
    getSeperateQuizQuestions,
    getAssessmentData,
}:QuizQuestionsProps ) => {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams();
    const assessmentOutSourceId = searchParams.get('assessmentId');

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined
    )
    const [isDisabled, setIsDisabled] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isAlertModal, setIsAlertModal] = useState(false)

    const codeBlockClass =
        'text-gray-800 font-light bg-gray-300 p-4 rounded-lg text-left whitespace-pre-wrap w-full'

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    const formSchema = z.object({
        answers: z.array(z.string().optional()),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    useEffect(() => {
        const defaultValues = {
            answers: questions?.data?.mcqs?.map((question: QuizQuestion) =>
                question.submissionsData && question.submissionsData.length > 0
                    ? question.submissionsData[0].chosenOption.toString()
                    : ''
            ),
        }
        form.reset(defaultValues)
    }, [questions, form])

    const handleSubmitClick = async () => {
        // Validate the form before opening the dialog
        const isValid = await form.trigger()
        if (isValid) {
            setIsDialogOpen(true)
        } else {
            // Show toast notification for missing answers
            toast.error({
                title: 'Error',
                description: 'Please answer all questions before submitting.',
            })
        }
    }

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsDisabled(true)
        setIsDialogOpen(false)

        try {
            // Create submission data array with all answers
            const quizSubmissionData = data.answers.map(
                (chosenOption: string | undefined, index:number) => {
                    const question = questions.data.mcqs[index]
                    return {
                        questionId: Number(question?.outsourseQuizzesId),
                        variantId: question.variantId,
                        attemptCount: 1,
                        chosenOption: parseInt(chosenOption|| "0"),
                    }
                }
            )
            const quizSubmissionDto = quizSubmissionData.filter(
                (quizData) => quizData.chosenOption == quizData.chosenOption
            )
            if (quizSubmissionDto.length === 0) {
                setIsAlertModal(true)
                return
            } else {
                const response = await api.patch(
                    `/submission/quiz/assessmentSubmissionId=${assessmentSubmitId}?assessmentOutsourseId=${assessmentOutSourceId}`,
                    { quizSubmissionDto }
                )

                getAssessmentData()

                toast.success({
                    title: 'Success',
                    description: 'Quiz Submitted Successfully',
                })

                getSeperateQuizQuestions()

                timeoutRef.current = setTimeout(() => {
                    onBack()
                }, 3000)
            }

            // Make the API call with the properly structured data
        } catch (error: any) {
            setIsDisabled(false)
            toast.error({
                title: 'Error',
                description:
                    error?.response?.data?.message || 'An error occurred',
            })        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/5 to-accent-light/10">
            <div className="max-w-4xl mx-auto p-6">
                {/* Alert Modal for No Selection */}
                <AlertDialog open={isAlertModal}>
                    <AlertDialogContent className="bg-card border-border shadow-32dp">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-foreground flex items-center space-x-2">
                                <AlertCircle className="w-5 h-5 text-warning" />
                                <span>Cannot Submit</span>
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground">
                                Please select at least one answer before submitting the quiz.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                onClick={() => setIsAlertModal(false)}
                                className="bg-muted hover:bg-muted-dark text-foreground border-border"
                            >
                                Cancel
                            </AlertDialogCancel>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Header with Back Button and Timer */}
                <div className="flex items-center justify-between mb-8">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button className="flex items-center space-x-2 text-primary hover:text-primary-dark transition-colors duration-200 group">
                                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                                <span className="font-medium">Back to Overview</span>
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card border-border shadow-32dp">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-foreground">
                                    Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                    This action is irreversible. If your quiz hasn&apos;t been submitted, your selections will be lost.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-muted hover:bg-muted-dark text-foreground border-border">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive-dark text-destructive-foreground"
                                    onClick={onBack}
                                >
                                    Go Back
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <div className="fixed top-6 right-6 z-50">
                        <TimerDisplay remainingTime={remainingTime} />
                    </div>
                </div>

                {/* Quiz Form */}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        {questions?.data?.mcqs?.map((question:QuizQuestion, index: number) => (
                            <div
                                key={question.id}
                                className="bg-card border border-border rounded-2xl shadow-8dp hover:shadow-16dp transition-all duration-300 overflow-hidden"
                            >
                                {/* Question Header */}
                                <div className="bg-card-elevated border-b border-border p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <span className="text-sm font-bold text-primary">{index + 1}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-foreground">Question {index + 1}</h3>
                                        </div>
                                        
                                        <div className="flex items-center space-x-3">
                                            <span className={cn(
                                                'px-3 py-1 rounded-full text-xs font-medium border',
                                                difficultyColor(question.difficulty)
                                            )}>
                                                {question.difficulty}
                                            </span>
                                            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
                                                {Math.trunc(Number(question.mark))} Marks
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Question Content */}
                                <div className="p-6">
                                    <FormField
                                        control={form.control}
                                        name={`answers.${index}`}
                                        render={({ field }) => (
                                            <FormItem className="space-y-4">
                                                <FormLabel className="text-base">
                                                    <div className="prose prose-neutral max-w-none">
                                                        <RemirrorForm
                                                            description={question.question}
                                                            preview={true}
                                                            bigScreen={true}
                                                        />
                                                    </div>
                                                </FormLabel>

                                                <FormControl>
                                                    <RadioGroup
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                        className="space-y-3"
                                                    >

                                                        {Object.keys(question.options).map((key) => (
                                                            <div
                                                                key={key}
                                                                className={cn(
                                                                    "flex items-start space-x-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:border-primary/30 hover:bg-primary/5",
                                                                    field.value === key 
                                                                        ? "border-primary bg-primary/10" 
                                                                        : "border-border bg-muted/30"
                                                                )}
                                                            >
                                                                <RadioGroupItem
                                                                    value={key}
                                                                    className="mt-0.5"
                                                                />
                                                                <label 
                                                                    htmlFor={key}
                                                                    className="flex-1 cursor-pointer text-foreground leading-relaxed"
                                                                >
                                                                    {question.options[Number(key)]}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Submit Button */}
                        <div className="flex justify-center pt-8">
                            <button
                                type="button"
                                onClick={handleSubmitClick}
                                disabled={isDisabled}
                                className={cn(
                                    "px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-8dp hover:shadow-16dp",
                                    isDisabled
                                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                                        : "bg-primary hover:bg-primary-dark text-primary-foreground"
                                )}
                            >
                                {isDisabled ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
                                        <span>Submitting...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Submit Quiz</span>
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Confirmation Dialog */}
                        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <AlertDialogContent className="bg-card border-border shadow-32dp">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-foreground">
                                        Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-muted-foreground">
                                        This action cannot be undone and you can submit the quiz only once.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel
                                        onClick={() => setIsDialogOpen(false)}
                                        className="bg-muted hover:bg-muted-dark text-foreground border-border"
                                    >
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-primary hover:bg-primary-dark text-primary-foreground"
                                        onClick={form.handleSubmit(onSubmit)}
                                    >
                                        Submit Quiz
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </form>
                </Form>
            </div>
        </div>
    )
}

export default QuizQuestions
