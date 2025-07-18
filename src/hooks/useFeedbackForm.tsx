import { useState, useCallback, useEffect } from 'react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import * as z from 'zod'
import {UseFeedbackFormProps,FeedbackFormResponse,} from '@/hooks/type'

export const formSchema = z.object({
    section: z.array(
        z.object({
            id: z.number(),
            question: z.string(),
            options: z.record(z.string(), z.string()),
            typeId: z.number(),
            isRequired: z.boolean(),
            answer: z
                .union([z.string(), z.array(z.string()), z.date()])
                .optional(),
        })
    ),
})

export type FormSchema = z.infer<typeof formSchema>


export const useFeedbackForm = ({
    moduleId,
    chapterId,
    bootcampId,
    onSuccess,
}: UseFeedbackFormProps) => {
    const [questions, setQuestions] = useState<any[]>([])
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchQuestions = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const res = await api.get(
                `/tracking/getAllFormsWithStatus/${moduleId}?chapterId=${chapterId}`
            )
            if (res.data && res.data.questions) {
                setQuestions(res.data.questions)
                setStatus('Not completed')
            } else {
                setQuestions(res.data.trackedData)
                setStatus('Completed')
            }
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                    'An error occurred while fetching the questions'
            )
            toast.error({
                title: 'Error',
                description: 'An error occurred while fetching the questions',
            })
        } finally {
            setLoading(false)
        }
    }, [moduleId, chapterId])
    
    const submitForm = async (values: FormSchema) => {
        try {
            setLoading(true)
            const transformedData = {
                submitForm: values.section.map((item) => {
                    let chosenOptions: number[] = []
                    let answer: string = ''

                    if (item.typeId === 1 || item.typeId === 2) {
                        // For multiple choice or checkbox
                        if (Array.isArray(item.answer)) {
                            chosenOptions = item.answer.map(Number)
                        } else if (typeof item.answer === 'string') {
                            chosenOptions = [Number(item.answer)]
                        }
                        return {
                            questionId: item.id,
                            chosenOptions,
                        }
                    } else {
                        // For other types (like paragraph, date, time)
                        answer = item.answer?.toString() || ''
                        return {
                            questionId: item.id,
                            answer,
                        }
                    }
                }),
            }

            const res = await api.post(
                `/tracking/updateFormStatus/${bootcampId}/${moduleId}?chapterId=${chapterId}`,
                transformedData
            )

            if (res) {
                await api.post<FeedbackFormResponse>(
                    `/tracking/updateChapterStatus/${bootcampId}/${moduleId}?chapterId=${chapterId}`,
                    transformedData
                )

                toast.success({
                    title: res.data.status,
                    description: 'Form has been submitted successfully!',
                })

                onSuccess?.()
                setStatus('Completed')
                fetchQuestions()
                return true
            }
            return false
        } catch (err: any) {
            toast.error({
                title: 'Error',
                description: 'Error submitting form',
            })
            return false
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchQuestions()
    }, [fetchQuestions])

    return {
        questions,
        status,
        loading,
        error,
        submitForm,
        // getAllQuestions,
        setQuestions,
        refetch: fetchQuestions,
    }
}