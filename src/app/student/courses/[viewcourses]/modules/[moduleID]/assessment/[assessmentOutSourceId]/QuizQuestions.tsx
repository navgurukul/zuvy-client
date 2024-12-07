import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Timer } from 'lucide-react'
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
import { useParams, useRouter } from 'next/navigation'
import { addClassToCodeTags } from '@/utils/admin'

// component
const QuizQuestions = ({
    onBack,
    remainingTime,
    questions,
    assessmentSubmitId,
    getSeperateQuizQuestions,
}: {
    onBack: () => void
    remainingTime: number
    questions: any
    assessmentSubmitId: number
    getSeperateQuizQuestions: () => void
}) => {
    const router = useRouter()
    const params = useParams()
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined
    ) // Correct type
    // Define the Zod schema for form validation

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
        answers: z.array(
            z.string().nonempty({ message: 'This question is required.' })
        ),
    })

    // Initialize the form with react-hook-form and the Zod resolver
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    // Set default values based on submissionsData when the component mounts or questions change
    useEffect(() => {
        console.log('questions', questions)
        const defaultValues = {
            answers: questions?.data?.mcqs?.map((question: any) =>
                question.submissionsData && question.submissionsData.length > 0
                    ? question.submissionsData[0].chosenOption.toString()
                    : ''
            ),
        }
        form.reset(defaultValues)
    }, [questions, form])

    // Handle form submission
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        const quizSubmissionDto = data.answers.map((chosenOption, index) => ({
            questionId: questions.data.mcqs[index].quizId,
            variantId: questions.data.mcqs[index].variantId,
            attemptCount: 1,
            chosenOption: Number(chosenOption),
        }))

        try {
            const response = await api.patch(
                `/submission/quiz/assessmentSubmissionId=${assessmentSubmitId}?assessmentOutsourseId=${params.assessmentOutSourceId}`,
                { quizSubmissionDto }
            )
            toast({
                title: 'Success',
                description: 'Quiz Submitted Successfully',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })

            getSeperateQuizQuestions()

            // Set the timeout and store the timeout ID
            timeoutRef.current = setTimeout(() => {
                onBack()
            }, 3000)
        } catch (error: any) {
            toast({
                title: 'Error',
                description:
                    error?.response?.data?.message || 'An error occurred',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',

                variant: 'destructive',
            })
        }
    }

    useEffect(() => {
        console.log('questions', questions)
    }, [questions])

    return (
        <div className="p-6 space-y-6">
            {/* Header with back button and timer */}
            <div className="flex items-center justify-between gap-2">
                <div
                    className="flex items-center cursor-pointer"
                    onClick={onBack}
                >
                    <ChevronLeft strokeWidth={2} size={24} />
                    <h1 className="font-extrabold text-lg ml-2">Back</h1>
                </div>
                <div className="font-bold text-xl">
                    <TimerDisplay remainingTime={remainingTime} />
                </div>
            </div>
            <Separator />

            {/* Quiz Form */}
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col items-center gap-6 mt-10"
                >
                    {/* Render Questions */}
                    {questions?.data?.mcqs?.map(
                        (question: any, index: number) => {
                            const additionalClass = 'bg-red-400'
                            const processedHtml = addClassToCodeTags(
                                question.question,
                                additionalClass
                            )

                            return (
                                <div
                                    key={question.id}
                                    className="w-full max-w-2xl border text-left border-gray-200 rounded-lg p-4 shadow-sm"
                                >
                                    <FormField
                                        control={form.control}
                                        name={`answers.${index}`}
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col items-start mb-10 w-full max-w-2xl">
                                                <FormLabel className="text-lg font-semibold text-left">
                                                    {index + 1}.{' '}
                                                    <span
                                                        className="text-gray-800"
                                                        dangerouslySetInnerHTML={{
                                                            __html: addClassToCodeTags(
                                                                question.question,
                                                                codeBlockClass
                                                            ),
                                                        }}
                                                    />
                                                </FormLabel>

                                                <FormControl>
                                                    <RadioGroup
                                                        value={field.value}
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        className="flex flex-col gap-3"
                                                    >
                                                        {Object.keys(
                                                            question.options
                                                        ).map((key) => (
                                                            <div
                                                                key={key}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <RadioGroupItem
                                                                    value={key}
                                                                />
                                                                <p className="text-gray-700">
                                                                    {
                                                                        question
                                                                            .options[
                                                                            key
                                                                        ]
                                                                    }
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )
                        }
                    )}

                    {/* Submit Button */}
                    <Button type="submit" className="mt-4">
                        Submit Quiz
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export default QuizQuestions
