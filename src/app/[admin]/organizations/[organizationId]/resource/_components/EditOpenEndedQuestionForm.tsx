import React, { useEffect } from 'react'
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
import {
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectContentWithScrollArea,
    SelectItem,
    Select,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { getEditOpenEndedDialogs, getCodingQuestionTags } from '@/store/store'
import {
    OpenEndedQuestion,
    Tag,
} from './adminResourceComponentType'
import { useParams } from 'next/navigation'
import useUpdateOpenEndedQuestion from '@/app/[admin]/hooks/useUpdateOpenEndedQuestion'

const formSchema = z.object({
    questionDescription: z.string(),
    topics: z.number(),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
})

function EditOpenEndedQuestionForm({
    setIsOpenEndDialogOpen,
    getAllOpenEndedQuestions,
    setOpenEndedQuestions,
    openEndedQuestions,
}: {
    setIsOpenEndDialogOpen: (value: boolean) => void
    getAllOpenEndedQuestions: any
    setOpenEndedQuestions: (questions: OpenEndedQuestion[]) => void
    openEndedQuestions: OpenEndedQuestion[]
}) {
    const { tags } = getCodingQuestionTags()
    const { updateOpenEndedQuestion, loading } = useUpdateOpenEndedQuestion()
    
    const { organizationId } = useParams()
    const orgId = Number(organizationId)

    const { editOpenEndedQuestionId } = getEditOpenEndedDialogs()
    const questionId = Number(editOpenEndedQuestionId)

    const selectedQuestion = openEndedQuestions.find((question: any) => {
        return question.id === questionId
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            questionDescription:
                selectedQuestion?.questionDescription ||
                selectedQuestion?.question ||
                '',
            topics: selectedQuestion?.tagId || 0,
            difficulty: selectedQuestion?.difficulty || 'Easy',
        },
    })

    useEffect(() => {
        if (selectedQuestion) {
            form.reset({
                questionDescription:
                    selectedQuestion.questionDescription ||
                    selectedQuestion.question,
                topics: selectedQuestion.tagId,
                difficulty: selectedQuestion.difficulty,
            })
        }
    }, [selectedQuestion, form])

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!questionId) {
            return
        }

        const formattedData = {
            question: values.questionDescription,
            tagId: values.topics,
            difficulty: values.difficulty,
        }
        const success = await updateOpenEndedQuestion(
            questionId,
            formattedData
        )

        if (success) {
            setIsOpenEndDialogOpen(false)
            getAllOpenEndedQuestions(setOpenEndedQuestions, orgId)
        }
    }

    return (
        <main className="flex flex-col p-3">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="max-w-md w-full flex flex-col gap-4"
                >
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
                                        <FormItem className="flex items-center space-x-1 space-y-0 ml-2">
                                            <FormControl>
                                                <RadioGroupItem
                                                    value="Easy"
                                                    className="text-primary border-primary"
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Easy
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-1 space-y-0 ml-2">
                                            <FormControl>
                                                <RadioGroupItem
                                                    value="Medium"
                                                    className="text-primary border-primary"
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Medium
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-1 space-y-0 ml-2">
                                            <FormControl>
                                                <RadioGroupItem
                                                    value="Hard"
                                                    className="text-primary border-primary"
                                                />
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
                                        value={
                                            tags.find(
                                                (tag) => tag.id === field.value
                                            )?.tagName ||
                                            tags.find(
                                                (tag) =>
                                                    tag.id ===
                                                    selectedQuestion?.tagId
                                            )?.tagName ||
                                            ''
                                        }
                                        onValueChange={(value) => {
                                            const selectedTag = tags.find(
                                                (tag: Tag) =>
                                                    tag?.tagName === value
                                            )
                                            if (selectedTag) {
                                                field.onChange(selectedTag.id)
                                            }
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={
                                                        tags.find(
                                                            (tag) =>
                                                                tag.id ===
                                                                selectedQuestion
                                                                    ?.tagId
                                                        )?.tagName ||
                                                        'Choose Topic'
                                                    }
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContentWithScrollArea>
                                            {tags
                                                .filter((tag) => tag.id !== -1) // Filter out "All Topics"
                                                .map((tag: Tag) => (
                                                    <SelectItem
                                                        key={tag.id}
                                                        value={tag?.tagName}
                                                    >
                                                        {tag?.tagName}
                                                    </SelectItem>
                                                ))}
                                        </SelectContentWithScrollArea>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )
                        }}
                    />

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            className="w-1/2 bg-primary hover:bg-primary-dark shadow-4dp"
                            disabled={loading}
                        >
                            {loading
                                ? 'Updating...'
                                : 'Edit Open-Ended Question'}
                        </Button>
                    </div>
                </form>
            </Form>
        </main>
    )
}

export default EditOpenEndedQuestionForm
