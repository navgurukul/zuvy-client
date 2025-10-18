'use client'

// React and third-party libraries
import React, { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, PlusCircle } from 'lucide-react'
import { getUser } from '@/store/store'
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
import { getChapterUpdateStatus, getFormPreviewStore } from '@/store/store'
import { Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
// import useResponsiveHeight from '@/hooks/useResponsiveHeight'
import {
    AddFormProps,
    FormQuestionDetail,
} from '@/app/[admin]/courses/[courseId]/module/_components/form/ModuleFormType'

const formSchema = z.object({
    title: z
        .string()
        .min(2, {
            message: 'Form Title must be at least 2 characters.',
        })
        .max(50, { message: 'You can enter up to 50 characters only.' }),

    description: z
        .string()
        .refine((val) => val.trim().length > 0, {
            message: 'Please add a description.',
        })
        .refine((val) => val.trim().length >= 4, {
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
    courseId,
}) => {
    const router = useRouter()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const { isChapterUpdated, setIsChapterUpdated } = getChapterUpdateStatus()
    const { setFormPreviewContent } = getFormPreviewStore()
    const [titles, setTitles] = useState(content?.title || '')
    const [isSaved, setIsSaved] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    // const heightClass = useResponsiveHeight()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
        defaultValues: {
            title: content?.title ?? '',
            description: content?.description ?? '',
            questions:
                content.formQuestionDetails?.length > 0
                    ? content.formQuestionDetails.map(
                          (q: FormQuestionDetail) => ({
                              id: q.id.toString(),
                              question: q.question,
                              typeId: q.typeId,
                              isRequired: q.isRequired,
                              //   options: Object.values(q.options || {}),
                              options: q.options
                                  ? Object.values(q.options)
                                  : [],
                          })
                      )
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
                    ? content.formQuestionDetails.map(
                          (q: FormQuestionDetail) => ({
                              id: q.id.toString(),
                              question: q.question,
                              typeId: q.typeId,
                              isRequired: q.isRequired,
                              //   options: Object.values(q.options || {}),
                              options: q.options
                                  ? Object.values(q.options)
                                  : [],
                          })
                      )
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

    // ✅ CUSTOM VALIDATION FUNCTION
    const validateQuestionsWithOptions = (questions: any[]) => {
        const errors: { index: number; message: string }[] = []

        questions.forEach((question, index) => {
            // Multiple Choice (typeId: 1) or Checkbox (typeId: 2)
            const requiresOptions =
                question.typeId === 1 || question.typeId === 2

            if (requiresOptions) {
                const hasValidOptions =
                    question.options &&
                    question.options.length > 0 &&
                    question.options.some(
                        (opt: string) => opt.trim().length > 0
                    )

                if (!hasValidOptions) {
                    errors.push({
                        index,
                        message: `Question ${
                            index + 1
                        }: Please add at least one option for Multiple Choice or Checkbox questions.`,
                    })

                    // Set error directly in form
                    form.setError(`questions.${index}.options`, {
                        type: 'manual',
                        message:
                            'Please add at least one option for this question.',
                    })
                }
            }
        })

        return errors
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // ✅ VALIDATION CHECK
        const validationErrors = validateQuestionsWithOptions(values.questions)

        if (validationErrors.length > 0) {
            // toast notification
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: validationErrors[0].message,
            })

            // Scroll to first error (optional)
            const firstErrorIndex = validationErrors[0].index
            const errorElement = document.querySelector(
                `[data-question-index="${firstErrorIndex}"]`
            )
            errorElement?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })

            return
        }

        const { title, description, questions } = values

        if (!questions || questions.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Cannot create form',
                description:
                    'Please add at least one question before creating the form.',
            })
            setIsSubmitting(false)
            return
        }
        setIsSubmitting(true)

        const formQuestionDto = questions
            .filter((item) => item.id && item.id.startsWith('new-'))
            .map((item) => ({
                isRequired: item.isRequired,
                question: item.question,
                typeId: item.typeId,
                options: item.options?.reduce<Record<number, string>>(
                    (acc, option, index) => {
                        acc[index + 1] = option
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
                        acc[index + 1] = option
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
            toast.success({
                title: 'Success',
                description: 'Form Edited Successfully',
            })
            setIsChapterUpdated(!isChapterUpdated)
            setIsSaved(true)
        } catch (error: any) {
            toast.error({
                title: 'Failed',
                description:
                    error.response?.data?.message || 'An error occurred.',
            })
        } finally {
            setIsSubmitting(false) // Reset loading state
        }
    }

    function previewForm() {
        if (!isSaved) {
            toast({
                variant: 'destructive',
                title: 'Please save the form first',
                description: 'Preview is only available after saving the form.',
            })
            return
        }
        if (content) {
            setFormPreviewContent(content)
            router.push(
                `/${userRole}/courses/${courseId}/module/${content.moduleId}/chapter/${content.id}/form/${content.topicId}/preview`
            )
        }
    }

    return (
        <ScrollArea className="h-dvh pr-4 pb-24" type="hover">
            <ScrollBar className="h-dvh " orientation="vertical" />
            {/* <div className="flex flex-col gap-y-8 mx-auto px-5 items-center justify-center w-1/2"> */}
            <div className="flex flex-col gap-y-8 px-5 justify-center mx-auto w-full max-w-[52rem] bg-card rounded-lg shadow-sm border">
                <div className="w-2/6 flex justify-start align-middle items-center relative pt-4">
                    <p className="text-2xl font-bold">Create Feedback Form</p>
                </div>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full items-left justify-left flex flex-col space-y-8 pb-4"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        {/* <div className="flex justify-between items-center">
                                            <div className="w-2/6 flex justify-center align-middle items-center relative">
                                                <p className="flex text-left text-lg mt-4">
                                                    Title
                                                </p>
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
                                                    className="text-md p-2 focus-visible:ring-0 placeholder:text-foreground"
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
                                                <Button
                                                    type="submit"
                                                    className="w-3/3 bg-success-dark opacity-75"
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                        </div> */}
                                        <>
                                            <FormLabel className="flex text-left text-sm text-gray-600 font-semibold mb-1">
                                                Form Title
                                            </FormLabel>
                                            <Input
                                                required
                                                {...field}
                                                onChange={(e) => {
                                                    setTitles(e.target.value)
                                                    field.onChange(e)
                                                }}
                                                placeholder="Untitled Form"
                                                className="text-md p-2 focus-visible:ring-0 placeholder:text-foreground"
                                            />
                                        </>
                                    </FormControl>
                                    {/* <div className="flex items-center justify-between">
                                        <div
                                            id="previewForm"
                                            onClick={previewForm}
                                            className="flex w-[80px] text-gray-600 hover:bg-gray-300 rounded-md p-1 cursor-pointer"
                                        >
                                            <Eye size={18} />
                                            <h6 className="ml-1 text-sm">
                                                Preview
                                            </h6>
                                        </div>
                                    </div> */}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex text-left text-sm text-gray-600 font-semibold mb-1">
                                        Description
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="w-full px-3 py-2 border text-gray-600 rounded-md"
                                            placeholder="Add Description"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-between items-center">
                            <p className="font-bold">Questions</p>
                            <div className="flex justify-start">
                                <Button
                                    // variant={'secondary'}
                                    // variant="outline"
                                    type="button"
                                    onClick={addQuestion}
                                    className="gap-x-2 border-none border"
                                    // className="gap-x-2 border-none border hover:text-[rgb(81,134,114)] hover:bg-popover"
                                >
                                    <PlusCircle size={15} /> Add Question
                                </Button>
                            </div>
                        </div>

                        {questions.map((item, index) => (
                            <div
                                key={item.id || `form-section-${index}`}
                                data-question-index={index}
                            >
                                <FormSection
                                    item={item}
                                    index={index}
                                    form={form}
                                    deleteQuestion={deleteQuestion}
                                    formData={questions}
                                />
                                {/* ✅ ERROR MESSAGE DISPLAY */}
                                {form.formState.errors.questions?.[index]
                                    ?.options && (
                                    <p className="text-sm text-red-500 mt-2">
                                        {
                                            form.formState.errors.questions[
                                                index
                                            ]?.options?.message
                                        }
                                    </p>
                                )}
                            </div>
                        ))}

                        <div className="flex justify-start">
                            <Button
                                type="submit"
                                disabled={
                                    !form.formState.isValid || isSubmitting
                                }
                                aria-label="Save form changes"
                                aria-busy={isSubmitting}
                                className="w-3/3 bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </ScrollArea>
    )
}

export default AddForm
