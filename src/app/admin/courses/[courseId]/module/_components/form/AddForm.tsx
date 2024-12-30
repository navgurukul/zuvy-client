'use client'

// React and third-party libraries
import React, { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, Plus } from 'lucide-react'

// Internal imports
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import FormSection from './FormSection'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { getChapterUpdateStatus } from '@/store/store'
// import useResponsiveHeight from '@/hooks/useResponsiveHeight'

type AddFormProps = {
    chapterData: any
    content: any
    // fetchChapterContent: any
    moduleId: any
}

interface chapterDetails {
    title: string
    description: string
}

const formSchema = z.object({
    title: z.string().min(2, {
        message: 'Video Title must be at least 2 characters.',
    }),

    description: z.string().min(4, {
        message: 'Description must be at least 4 characters.',
    }),
    questions: z.array(
        z.object({
            id: z.string().optional() || z.number().optional(),
            question: z.string().min(1, { message: 'Question is required' }),
            typeId: z.number(),
            isRequired: z.boolean(),
            options: z.array(z.string()).optional(),
            //  ||
            // z.object({ 0: z.string() }).optional(),
        })
    ),
})

const AddForm: React.FC<AddFormProps> = ({
    chapterData,
    content,
    // fetchChapterContent,
    moduleId,
}) => {
    const { isChapterUpdated, setIsChapterUpdated } = getChapterUpdateStatus()
    const [titles, setTitles] = useState(content?.title || '')
    // const heightClass = useResponsiveHeight()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: content?.title ?? '',
            description: content?.description ?? '',
            questions:
                content.formQuestionDetails?.length > 0
                    ? content.formQuestionDetails.map((q: any) => ({
                        id: q.id.toString(),
                        question: q.question,
                        typeId: q.typeId,
                        isRequired: q.isRequired,
                        //   options: Object.values(q.options || {}),
                        options: q.options ? Object.values(q.options) : [],
                    }))
                    : [
                        {
                            //   id: 'initial-1',
                            questionType: 'Multiple Choice',
                            id: 'new-1',
                            question: 'Question 1',
                            typeId: 1,
                            isRequired: true,
                            options: ['', ''],
                        },
                    ],
        },
        values: {
            title: content?.title ?? '',
            description: content?.description ?? '',
            questions:
                content.formQuestionDetails?.length > 0
                    ? content.formQuestionDetails.map((q: any) => ({
                        id: q.id.toString(),
                        question: q.question,
                        typeId: q.typeId,
                        isRequired: q.isRequired,
                        //   options: Object.values(q.options || {}),
                        options: q.options ? Object.values(q.options) : [],
                    }))
                    : [
                        {
                            //   id: 'initial-1',
                            questionType: 'Multiple Choice',
                            id: 'new-1',
                            question: 'Question 1',
                            typeId: 1,
                            isRequired: true,
                            options: ['', ''],
                        },
                    ],
        },
    })

    const questions = form.watch('questions')

    const addQuestion = () => {
        const newQuestion = {
            questionType: 'Multiple Choice',
            typeId: 1,
            question: '',
            options: ['', ''],
            isRequired: false,
            id: `new-${Date.now()}`,
        }
        form.setValue('questions', [
            ...form.getValues('questions'),
            newQuestion,
        ])
    }

    // *************** This one is working... Left one empty input field when delete multiple choice *************

    // const deleteQuestion = (id: string) => {
    //     const currentQuestions = form.getValues('questions');

    //     // Find the index of the question with the given id
    //     const index = currentQuestions.findIndex((question) => question.id === id);

    //     if (index === -1) {
    //         console.warn(`Question with id ${id} not found.`);
    //         return;
    //     }

    //     // Safeguard: Ensure the question exists and has options
    //     if (currentQuestions[index] && Array.isArray(currentQuestions[index].options)) {
    //         // Unregister all options related to the deleted question
    //         currentQuestions[index].options.forEach((_, optionIndex) => {
    //             form.unregister(`questions.${index}.options.${optionIndex}`);
    //         });
    //     }

    //     // Remove the question from the form
    //     const updatedQuestions = currentQuestions.filter((question) => question.id !== id);
    //     form.setValue('questions', updatedQuestions);

    //     // Re-register options for remaining questions
    //     updatedQuestions.forEach((question, qIndex) => {
    //         if (Array.isArray(question.options)) {
    //             question.options.forEach((option, optionIndex) => {
    //                 form.register(`questions.${qIndex}.options.${optionIndex}`);
    //             });
    //         }
    //     });
    // };

    const deleteQuestion = (id: string) => {
        const currentQuestions = form.getValues('questions')
        const questionIndex = currentQuestions.findIndex((q) => q.id == id)

        if (questionIndex === -1) return

        // Unregister the question's options
        const question = currentQuestions[questionIndex]
        if (question?.options && Array.isArray(question.options)) {
            question.options.forEach((_: any, optionIndex: any) => {
                form.unregister(
                    `questions.${questionIndex}.options.${optionIndex}`
                )
            })
        }

        // Remove the question
        const updatedQuestions = currentQuestions.filter(
            (_, i) => i !== questionIndex
        )
        form.setValue('questions', updatedQuestions)
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const { title, description, questions } = values

        const formQuestionDto = questions
            .filter((item) => item.id && item.id.startsWith('new-'))
            .map((item) => ({
                isRequired: item.isRequired,
                question: item.question,
                typeId: item.typeId,
                options: item.options?.reduce<Record<number, string>>(
                    (acc, option, index) => {
                        acc[index] = option
                        return acc
                    },
                    {}
                ),
            }))

        const editFormQuestionDto = questions
            .filter((item) => item.id && !item.id.startsWith('new-'))
            .map((item) => ({
                ...item,
                id: item.id && Number(item.id),
                options: item.options?.reduce<Record<number, string>>(
                    (acc, option, index) => {
                        acc[index] = option
                        return acc
                    },
                    {}
                ),
            }))

        let payload = {}
        if (formQuestionDto.length > 0 && editFormQuestionDto.length > 0) {
            payload = {
                formQuestionDto: {
                    questions: formQuestionDto,
                },
                editFormQuestionDto: {
                    questions: editFormQuestionDto,
                },
            }
        } else if (formQuestionDto.length > 0) {
            payload = {
                formQuestionDto: {
                    questions: formQuestionDto,
                },
            }
        } else {
            payload = {
                editFormQuestionDto: {
                    questions: editFormQuestionDto,
                },
            }
        }

        try {
            const editChapterResponse = await api.put(
                `Content/editChapterOfModule/${moduleId}?chapterId=${content.id}`,
                { title, description }
            )

            const questionsRespons = await api.post(
                `Content/createAndEditForm/${content.id}`,
                payload
            )
            toast({
                title: 'Success',
                description: 'Form Edited Successfully',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })
            setIsChapterUpdated(!isChapterUpdated)
        } catch (error: any) {
            toast({
                title: 'Failed',
                description:
                    error.response?.data?.message || 'An error occurred.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }

    return (
        <ScrollArea className="h-dvh pr-4 pb-24" type="hover">
            <ScrollBar className="h-dvh " orientation="vertical" />
            <div className="flex flex-col gap-y-8 mx-auto px-5 items-center justify-center w-1/2">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full items-left justify-left flex flex-col space-y-8"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="flex justify-between items-center">
                                            <div className="w-2/6 flex justify-center align-middle items-center relative">
                                                <Input
                                                    required
                                                    {...field}
                                                    onChange={(e) => {
                                                        setTitles(
                                                            e.target.value
                                                        )
                                                        field.onChange(e)
                                                    }}
                                                    placeholder="Untitled Form"
                                                    className="pl-1 pr-8 text-xl text-left font-semibold capitalize placeholder:text-gray-400 placeholder:font-bold border-x-0 border-t-0 border-b-2 border-gray-400 border-dashed focus:outline-none"
                                                    autoFocus
                                                />
                                                {!titles && (
                                                    <Pencil
                                                        fill="true"
                                                        fillOpacity={0.4}
                                                        size={20}
                                                        className="absolute text-gray-100 pointer-events-none mt-2 right-3"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex justify-start">
                                                <Button type="submit" className="w-3/3">
                                                    Save
                                                </Button>
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex text-left text-md font-semibold mb-1">
                                        Description
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="w-[450px] px-3 py-2 border rounded-md"
                                            placeholder="Add Description"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {questions.map((item, index) => (
                            <FormSection
                                key={item.id || `form-section-${index}`}
                                item={item}
                                index={index}
                                form={form}
                                deleteQuestion={deleteQuestion}
                                formData={questions}
                            />
                        ))}

                        <div className="flex justify-start">
                            <Button
                                variant={'secondary'}
                                type="button"
                                onClick={addQuestion}
                                className="gap-x-2 border-none hover:text-secondary hover:bg-popover"
                            >
                                <Plus /> Add Question
                            </Button>
                        </div>

                    </form>
                </Form>
            </div>
        </ScrollArea>
    )
}

export default AddForm
