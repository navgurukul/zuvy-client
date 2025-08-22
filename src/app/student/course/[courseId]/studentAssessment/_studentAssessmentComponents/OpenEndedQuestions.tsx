import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Timer, Edit3, CheckCircle, AlertCircle } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import TimerDisplay from './TimerDisplay'
import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { useRouter } from 'next/navigation'
import {AssessmentProps,Question} from '@/app/student/course/[courseId]/studentAssessment/_studentAssessmentComponents/projectStudentAssessmentUtilsType'


const OpenEndedQuestions = ({
    onBack,
    remainingTime,
    questions,
    assessmentSubmitId,
    getSeperateOpenEndedQuestions,
    getAssessmentData
}: AssessmentProps) => {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const formSchema = z.object({
        answers: z.array(
            z.string().nonempty({ message: 'This question is required.' })
        ),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    useEffect(() => {
        const defaultValues = {
            answers: questions.map((question:Question) =>
                question.submissionsData && question.submissionsData.length > 0
                    ? question.submissionsData[0].answer
                    : ''
            ),
        }
        form.reset(defaultValues)
    }, [questions, form])

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsSubmitting(true)
        setIsDialogOpen(false)
        
        const openEndedQuestionSubmissionDto = data.answers.map(
            (answer, index) => ({
                questionId: questions[index].id,
                answer,
            })
        )
        try {
            const response = await api.patch(
                `/submission/openended/assessmentSubmissionId=${assessmentSubmitId}`,
                { openEndedQuestionSubmissionDto }
            )

            getAssessmentData()

            toast.success({
                title: 'Success',
                description: 'Open-ended questions submitted successfully',
            })

            getSeperateOpenEndedQuestions()

            setTimeout(() => {
                onBack()
            }, 3000)
        } catch (error: any) {
            toast.error({
                title: 'Error',
                description:
                    error?.response?.data?.message || 'An error occurred',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSubmitClick = async () => {
        const isValid = await form.trigger()
        if (isValid) {
            setIsDialogOpen(true)
        } else {
            toast.error({
                title: 'Error',
                description: 'Please answer all questions before submitting.',
            })        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/5 to-accent-light/10">
            <div className="max-w-4xl mx-auto p-6">
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
                                    This action is irreversible. If your answers haven&apos;t been submitted, your work will be lost.
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

                {/* Header Section */}
                <div className="bg-card border border-border rounded-2xl shadow-16dp mb-8 overflow-hidden">
                    <div className="bg-card-elevated border-b border-border p-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                                <Edit3 className="w-5 h-5 text-info" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Open-Ended Questions</h2>
                        </div>
                        <p className="text-muted-foreground mt-2">
                            Provide detailed answers to the questions below. Make sure to be thorough and clear in your responses.
                        </p>
                    </div>
                </div>

                {/* Questions Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {questions.map((question, index) => (
                            <div
                                key={question.id}
                                className="bg-card border border-border rounded-2xl shadow-8dp hover:shadow-16dp transition-all duration-300 overflow-hidden"
                            >
                                {/* Question Header */}
                                <div className="bg-card-elevated border-b border-border p-6">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-8 h-8 bg-info/10 rounded-lg flex items-center justify-center">
                                            <span className="text-sm font-bold text-info">{index + 1}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-foreground">Question {index + 1}</h3>
                                    </div>
                                    <p className="text-foreground leading-relaxed">
                                        {question.OpenEndedQuestion.question}
                                    </p>
                                </div>

                                {/* Answer Input */}
                                <div className="p-6">
                                    <FormField
                                        control={form.control}
                                        name={`answers.${index}`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-muted-foreground mb-3 block">
                                                    Your Answer
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Type your detailed answer here..."
                                                        className="min-h-[120px] resize-vertical border-border bg-muted/30 focus:border-primary focus:bg-background transition-all duration-200"
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                    />
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
                                disabled={isSubmitting}
                                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-8dp hover:shadow-16dp ${
                                    isSubmitting
                                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                        : 'bg-primary hover:bg-primary-dark text-primary-foreground'
                                }`}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
                                        <span>Submitting...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Submit Answers</span>
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Confirmation Dialog */}
                        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <AlertDialogContent className="bg-card border-border shadow-32dp">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-foreground">
                                        Submit Your Answers?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-muted-foreground">
                                        This action cannot be undone. Make sure you&apos;ve reviewed all your answers before submitting.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel
                                        onClick={() => setIsDialogOpen(false)}
                                        className="bg-muted hover:bg-muted-dark text-foreground border-border"
                                    >
                                        Review Again
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-primary hover:bg-primary-dark text-primary-foreground"
                                        onClick={form.handleSubmit(onSubmit)}
                                    >
                                        Submit Answers
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

export default OpenEndedQuestions
