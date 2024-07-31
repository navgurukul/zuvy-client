'use client'

// React and third-party libraries
import React, { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus } from 'lucide-react'

// Internal imports
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import FormSection from './FormSection'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'

type AddFormProps = {
    chapterData: any
    content: any
    fetchChapterContent: (chapterId: number) => void
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
})

const AddForm: React.FC<AddFormProps> = ({
    chapterData,
    content,
    fetchChapterContent,
    moduleId,
}) => {
    const [newContent, setNewContent] = useState<chapterDetails>({
        title: '',
        description: '',
    })
    const [forceUpdate, setForceUpdate] = useState(false)
    const [section, setSection] = useState(
        content.formQuestionDetails.length > 0
            ? content.formQuestionDetails
            : // ? [...content.formQuestionDetails]
              //   JSON.parse(JSON.stringify(content.formQuestionDetails))
              [
                  {
                      questionType: 'Multiple Choice',
                      typeId: 1,
                      question: 'Question 1',
                      options: ['Op1'],
                      isRequired: true,
                      key: 1,
                  },
              ]
    )

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: content?.title ?? '',
            description: content?.title ?? '',
        },
        values: {
            title: content?.title ?? '',
            description: content?.description ?? '',
        },
    })

    const addQuestion = () => {
        const newKey =
            section.length > 0 &&
            section[section.length - 1].hasOwnProperty('key')
                ? section[section.length - 1].key + 1
                : 1
        const newSection = {
            questionType: 'Multiple Choice',
            typeId: 1,
            question: 'Question 1',
            options: ['Op1'],
            isRequired: false,
            key: newKey,
        }
        setSection([...section, newSection])
    }

    //Delete question index wise from section

    // const deleteQuestion = useCallback(
    //     (idx: number) => {
    //         console.log('section', section)
    //         console.log('idx', idx)
    //         const updatedSection = section.filter((_, i) => i !== idx)
    //         console.log('updatedSection', updatedSection)
    //         setSection((prevSections) =>
    //             prevSections.filter((_, i) => i !== idx)
    //         )
    //     },
    //     [section]
    // )

    //Delete question key/id wise from section
    const deleteQuestion = (deleteItem: any) => {
        // console.log('section before delete:', section)
        // console.log('deleteItem:', deleteItem)

        let updatedSection
        let formQuestion = section.filter((item: any) => !item.id)
        const editFormQuestion = section.filter((item: any) => item.id)

        if (deleteItem.id) {
            updatedSection = editFormQuestion.filter(
                (item: any) => item.id !== deleteItem.id
            )
            setSection([...updatedSection, ...formQuestion])
        } else if (deleteItem.key) {
            updatedSection = formQuestion.filter(
                (item: any) => item.key !== deleteItem.key
            )
            setSection([...editFormQuestion, ...updatedSection])
        }
        console.log('updatedSection:', updatedSection)
    }

    useEffect(() => {
        console.log('section state updated:', section)
    }, [section])

    // console.log('content', content)

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log('section onSubmit', section)
        const questions = section.map((item: any, index: number) => {
            const options = item.options || {}
            const optionsObject = Object.keys(options).reduce((acc, key) => {
                acc[key] = options[key]
                return acc
            }, {} as { [key: string]: string })

            const { questionType, key, ...rest } = item

            return {
                ...rest,
                options: optionsObject,
            }
        })

        const formQuestionDto = questions.filter((item: any) => !item.id)
        const editFormQuestionDto = questions
            .filter((item: any) => item.id)
            .map((question: any) => ({
                id: question.id,
                typeId: question.typeId,
                isRequired: question.isRequired,
                options: question.options,
                question: question.question,
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

        // console.log('payload', payload)
        // console.log('questions', questions)
        try {
            const editChapterResponse = await api.put(
                `Content/editChapterOfModule/${moduleId}?chapterId=${content.id}`,
                values
            )

            const questionsRespons = await api.post(
                `Content/createAndEditForm/${content.id}`,
                payload
            )
            toast({
                title: 'Success',
                description: 'Form Edited Successfully',
                className: 'text-start capitalize border border-secondary',
            })
        } catch (error: any) {
            toast({
                title: 'Failed',
                description:
                    error.response?.data?.message || 'An error occurred.',
                className: 'text-start capitalize border border-destructive',
            })
        }
    }

    return (
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
                                    <Input
                                        {...field}
                                        placeholder="Untitled Form"
                                        className="p-0 text-3xl w-full text-left font-semibold outline-none border-none focus:ring-0"
                                    />
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
                                        placeholder="Placeholder"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {section.map((item: any, index: number) => (
                        <FormSection
                            // key={item.key}
                            key={item.id || `form-section-${index}`}
                            item={item}
                            index={index}
                            form={form}
                            addQuestion={addQuestion}
                            section={section}
                            setSection={setSection}
                            deleteQuestion={deleteQuestion}
                            formData={content.formQuestionDetails}
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
                    <div className="flex justify-start">
                        <Button type="submit" className="w-1/3">
                            Save
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default AddForm
