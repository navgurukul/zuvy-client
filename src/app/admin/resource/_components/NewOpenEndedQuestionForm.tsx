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
    questionDescription: z.string(),
    marks: z
        .string()
        .refine((val) => !isNaN(Number(val)), { message: 'Must be a number' })
        .transform((val) => Number(val)),
    topics: z.number(),
    difficulty: z.string(),
})

function NewOpenEndedQuestionForm({
    tags,
    setIsDialogOpen,
    getAllOpenEndedQuestions,
    setOpenEndedQuestions,
}: {
    tags: any
    setIsDialogOpen: any
    getAllOpenEndedQuestions: any
    setOpenEndedQuestions: any
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

            toast({
                title: 'Success',
                description: 'Open-Ended Question Created Successfully',
                className: 'text-start capitalize border border-secondary',
            })
            setIsDialogOpen(false)
        } catch (error: any) {
            toast({
                title: 'Error',
                description:
                    error?.response?.data?.message || 'An error occurred',
                className: 'text-start capitalize border border-destructive',
            })
        }
    }

    // const accountType = form.watch('accountType')

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        const formattedData = {
            question: values.questionDescription,
            tagId: values.topics,
            marks: values.marks,
            difficulty: values.difficulty,
        }
        createOpenEndedQuestion(formattedData)
        getAllOpenEndedQuestions(setOpenEndedQuestions)
    }

    return (
        <main className="flex  flex-col p-3 ">
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
                                                <RadioGroupItem value="Easy" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Easy
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="Medium" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Medium
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="Hard" />
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
                                                    tag.tagName === value
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
                                                    value={tag.tagName}
                                                >
                                                    {tag.tagName}
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
                        name="marks"
                        render={({ field }) => {
                            return (
                                <FormItem className="text-left">
                                    <FormLabel>
                                        Set the Marks for the Question
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="Enter the Marks for the Question"
                                            {...field}
                                        />
                                    </FormControl>
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
                        <Button type="submit" className="w-1/2 ">
                            Create Open-Ended Question
                        </Button>
                    </div>
                </form>
            </Form>
        </main>
    )
}

export default NewOpenEndedQuestionForm
