import React from 'react'
import { useState } from 'react'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectItem,
    Select,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Plus, X } from 'lucide-react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'

const formSchema = z.object({
    questionDescription: z.string().min(5, {
        message: 'Description must be at least 5 characters long',
    }),

    topics: z.number().min(1, { message: 'You must select a topic' }),
    difficulty: z.string(),
})

function NewOpenEndedQuestionForm({
    tags,
    setIsDialogOpen,
    filteredOpenEndedQuestions,
    setOpenEndedQuestions,
    selectedOptions,
    difficulty,
    offset,
    position
}: {
    tags: any
    setIsDialogOpen: any
    setOpenEndedQuestions: any
    filteredOpenEndedQuestions: any
    selectedOptions?:any,
    difficulty?:any,
    offset?:number,
    position?:String
}) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            questionDescription: '',
            topics: 0,
            difficulty: 'Easy',
        },
    })

    async function createOpenEndedQuestion(data: any) {
        try {
            const response = await api.post(
                `Content/createOpenEndedQuestion`,
                data
            )

            toast.success({
                title: 'Success',
                description: 'Open-Ended Question Created Successfully',
            })
            setIsDialogOpen(false)
        } catch (error: any) {
            toast.error({
                title: 'Error',
                description:
                    error?.response?.data?.message || 'An error occurred',
            })
        }
    }

    // const accountType = form.watch('accountType')

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        const formattedData = {
            question: values.questionDescription,
            tagId: values.topics,
            difficulty: values.difficulty,
        }
        createOpenEndedQuestion(formattedData)
        filteredOpenEndedQuestions(setOpenEndedQuestions ,offset,position, difficulty,selectedOptions)
    }

    return (
        <main className="flex  flex-col p-3 text-gray-600">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className=" max-w-md w-full flex flex-col gap-4"
                >
                    <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex space-y-1"
                                    >
                                        <FormLabel className="mt-5">
                                            Difficulty
                                        </FormLabel>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="Easy" className="text-black border-black" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Easy
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="Medium" className="text-black border-black" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Medium
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="Hard" className="text-black border-black" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Hard
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="topics"
                        render={({ field }) => {
                            return (
                                <FormItem className="text-left w-full">
                                    <FormLabel>Topics</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            const selectedTag = tags.find(
                                                (tag: any) =>
                                                    tag?.tagName === value
                                            )
                                            if (selectedTag) {
                                                field.onChange(selectedTag.id)
                                            }
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose Topic" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {tags.map((tag: any) => (
                                                <SelectItem
                                                    key={tag.id}
                                                    value={tag?.tagName}
                                                >
                                                    {tag?.tagName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )
                        }}
                    />

                    <FormField
                        control={form.control}
                        name="questionDescription"
                        render={({ field }) => {
                            return (
                                <FormItem className="text-left">
                                    <FormLabel>
                                        Write the Question Descriptions
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Write your Question here"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )
                        }}
                    />
                    <div className="flex justify-end">
                        <Button type="submit" className="w-1/2 bg-success-dark opacity-75">
                            Create Open-Ended Question
                        </Button>
                    </div>
                </form>
            </Form>
        </main>
    )
}

export default NewOpenEndedQuestionForm
