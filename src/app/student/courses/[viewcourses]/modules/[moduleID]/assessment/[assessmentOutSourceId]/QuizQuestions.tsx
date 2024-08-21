import React, { useEffect, useState } from 'react'
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
import { useRouter } from 'next/navigation'

const QuizQuestions = ({
    onBack,
    remainingTime,
    questions,
    assessmentSubmitId,
    getSeperateQuizQuestions,
}: {
    onBack: () => void
    remainingTime: number
    questions: any[]
    assessmentSubmitId: number
    getSeperateQuizQuestions: () => void
}) => {
    const router = useRouter()
    // Define the Zod schema for form validation
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
        const defaultValues = {
            answers: questions.map((question) =>
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
            questionId: questions[index].id,
            attemptCount: 1,
            chosenOption: Number(chosenOption),
        }))

        try {
            const response = await api.patch(
                `/submission/quiz/assessmentSubmissionId=${assessmentSubmitId}`,
                { quizSubmissionDto }
            )
            toast({
                title: 'Success',
                description: 'Quiz Submitted Successfully',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })

            getSeperateQuizQuestions()

            setTimeout(() => {
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

    return (
        <div>
            <div className="flex items-center justify-between gap-2">
                <div
                    className="flex items-center cursor-pointer"
                    onClick={onBack}
                >
                    <ChevronLeft strokeWidth={2} size={24} />
                    <h1 className="font-extrabold"></h1>
                </div>
                <div className="font-bold text-xl">
                    <TimerDisplay remainingTime={remainingTime} />
                </div>
                <div></div>
            </div>
            <Separator />
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col items-center mt-10"
                >
                    {questions.map((question, index) => (
                        <FormField
                            key={question.id}
                            control={form.control}
                            name={`answers.${index}`}
                            render={({ field }) => (
                                <FormItem className="flex flex-col items-start mb-10 w-full max-w-md">
                                    <FormLabel>
                                        {index + 1}. {question.Quiz.question}
                                    </FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            {Object.keys(
                                                question.Quiz.options
                                            ).map((key) => (
                                                <div
                                                    key={key}
                                                    className="flex items-center gap-2 mb-2"
                                                >
                                                    <RadioGroupItem
                                                        value={key}
                                                    />
                                                    <p>
                                                        {
                                                            question.Quiz
                                                                .options[key]
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
                    ))}
                    <Button type="submit" className="mt-10">
                        Submit Quiz
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export default QuizQuestions
