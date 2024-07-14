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
    const [section, setSection] = useState([
        {
            questionType: 'Multiple Choice',
            typeId: 1,
            question: 'Question 1',
            options: ['Op1'],
            // required: true,
        },
    ])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
        },
        values: {
            title: newContent?.title ?? '',
            description: newContent?.description ?? '',
        },
    })

    const addQuestion = () => {
        const newSection = {
            questionType: 'Multiple Choice',
            typeId: 1,
            question: 'Question 1',
            options: ['Op1'],
            // required: false,
        }
        setSection([...section, newSection])
    }

    //Delete question index wise from section

    const deleteQuestion = (idx: number) => {
        const sec = section.filter((_: any, i: number) => i !== idx)
        setSection(sec)
    }

    useEffect(() => {
        console.log('section updated')
    }, [section])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const payload = {
            ...values,
            questions: section,
        }

        const questions = section.map((item, index) => {
            const optionsObject: { [key: string]: string } =
                item.options.reduce<{ [key: string]: string }>(
                    (acc, value, index) => {
                        acc[(index + 1).toString()] = value
                        return acc
                    },
                    {}
                )
            const { questionType, ...rest } = item

            return {
                ...rest,
                options: optionsObject,
            }
        })

        // console.log('content', content)
        // console.log('content.id', content.tagId)
        // console.log('payload', payload)
        try {
            const response = await api.put(
                `/Content/editChapterOfModule/${moduleId}?chapterId=${content.id}`,
                values
            )
            const questionsRespons = await api.put(`Content/form`, {
                questions,
            })
            // console.log('response', response)
            // console.log('questionsRespons', questionsRespons)
            toast({
                title: 'Success',
                description: 'Form Created Successfully',
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

                    {section.map((item: any, index) => (
                        <FormSection
                            index={index}
                            form={form}
                            addQuestion={addQuestion}
                            section={section}
                            setSection={setSection}
                            deleteQuestion={deleteQuestion}
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
