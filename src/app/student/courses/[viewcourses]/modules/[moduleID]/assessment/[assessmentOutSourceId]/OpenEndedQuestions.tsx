import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Timer } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import TimerDisplay from './TimerDisplay'
import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'

const OpenEndedQuestions = ({
    onBack,
    remainingTime,
    questions,
    assessmentSubmitId,
}: {
    onBack: () => void
    remainingTime: number
    questions: any[]
    assessmentSubmitId: number
}) => {
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
            answers: questions.map((question) =>
                question.submissionsData && question.submissionsData.length > 0
                    ? question.submissionsData[0].answer
                    : ''
            ),
        }
        form.reset(defaultValues)
    }, [questions, form])

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
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
            toast({
                title: 'Success',
                description: 'Open-ended questions submitted successfully',
                className: 'text-start capitalize border border-secondary',
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description:
                    error?.response?.data?.message || 'An error occurred',
                className: 'text-start capitalize border border-destructive',
                variant: 'destructive',
            })
        }
    }

    return (
        <div className="px-4">
            <div className="flex items-center justify-between gap-2">
                <div
                    className="flex items-center cursor-pointer"
                    onClick={onBack}
                >
                    <ChevronLeft strokeWidth={2} size={18} />
                    <h1 className="font-extrabold">Open-Ended Questions</h1>
                </div>
                <div className="flex items-center">
                    <TimerDisplay remainingTime={remainingTime} />
                </div>
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
                                        {index + 1}.{' '}
                                        {question.OpenEndedQuestion.question}
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Type your answer here..."
                                            className="w-full"
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                    <Button type="submit" className="mt-10">
                        Save Answers
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export default OpenEndedQuestions
