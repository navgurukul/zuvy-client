'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Timer } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
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
import { fetchPreviewData } from '@/utils/admin'
import {
    PageQuizQuestion,
    MCQParams,
} from '@/app/[admin]/[organization]/courses/[courseId]/module/[moduleId]/chapter/[chapterId]/assessment/[topicId]/preview/allquestions/mcq/ArticleMcqPageType'

const OpenEndedPreview = ({ params }: { params: MCQParams[] }) => {
    const router = useRouter()
    const [assessmentPreviewContent, setAssessmentPreviewContent] =
        useState<any>([])

    // Fetching assessment data
    useEffect(() => {
        fetchPreviewData(params, setAssessmentPreviewContent)
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
        <div className="px-4">
            <div className="flex items-center justify-between gap-2 mb-5">
                <div
                    className="flex items-center cursor-pointer"
                    onClick={router.back}
                >
                    <ChevronLeft strokeWidth={2} size={24} />
                    <h1 className="font-extrabold text-[15px]">
                        All Questions
                    </h1>
                </div>

                <div></div>
            </div>
            <Separator />
            <Form {...form}>
                <form className="flex flex-col items-center mt-10">
                    {assessmentPreviewContent?.OpenEndedQuestions?.map(
                        (question: PageQuizQuestion, index: number) => (
                            <FormField
                                key={question.id}
                                control={form.control}
                                name={`answers.${index}`}
                                render={({ field }) => (
                                    <FormItem className="flex flex-col items-start mb-10 w-full max-w-md">
                                        <FormLabel>
                                            {index + 1}. {question.question}
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                disabled
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
                        )
                    )}
                </form>
            </Form>
        </div>
    )
}

export default OpenEndedPreview
