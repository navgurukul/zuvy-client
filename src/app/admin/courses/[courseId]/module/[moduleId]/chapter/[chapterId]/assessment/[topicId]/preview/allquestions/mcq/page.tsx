'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { useRouter } from 'next/navigation'
import { fetchPreviewAssessmentData } from '@/utils/admin'

const McqPreview = ({ params }: { params: any[] }) => {
    const router = useRouter()
    const [assessmentPreviewContent, setAssessmentPreviewContent] =
        useState<any>([])

    // Fetching assessment data
    useEffect(() => {
        fetchPreviewAssessmentData(params, setAssessmentPreviewContent)
    }, [params])

    // Zod schema for validation
    const formSchema = z.object({
        answers: z.array(
            z.string().nonempty({ message: 'This question is required.' })
        ),
    })

    // Initialize the form with react-hook-form and the Zod resolver
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    return (
        <div>
            <div className="flex items-center justify-between gap-2 mb-5">
                <div
                    className="flex items-center cursor-pointer"
                    onClick={router.back}
                >
                    <ChevronLeft strokeWidth={2} size={24} />
                    <h1 className="font-extrabold">All Questions</h1>
                </div>
                <div>
                    <Button>Shuffle Quiz Qs</Button>
                </div>
            </div>
            <Separator />
            <Form {...form}>
                <form className="flex flex-col items-center mt-10 text-left">
                    {/* Map through the quizzes and display them */}
                    {assessmentPreviewContent?.Quizzes?.map(
                        (question: any, index: any) => (
                            <FormField
                                key={question.id}
                                control={form.control}
                                name={`answers.${index}`}
                                render={({ field }) => (
                                    <FormItem className="flex flex-col items-start mb-10 w-full max-w-md">
                                        <FormLabel className="text-[#4A4A4A] font-semibold text-md">
                                            {index + 1}.{' '}
                                            {
                                                question?.quizVariants[0]
                                                    ?.question
                                            }
                                        </FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                {question?.quizVariants.length >
                                                    0 &&
                                                    Object.keys(
                                                        question
                                                            ?.quizVariants[0]
                                                            ?.options
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
                                                                    question
                                                                        ?.quizVariants[0]
                                                                        ?.options[
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
                        )
                    )}
                </form>
            </Form>
        </div>
    )
}

export default McqPreview
