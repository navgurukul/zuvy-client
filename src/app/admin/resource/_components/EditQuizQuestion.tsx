import React from 'react'
import { useState, useEffect } from 'react'

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
import { Plus, Trash, X } from 'lucide-react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { Tag } from '../mcq/page'
import { quizData } from '../../courses/[courseId]/module/_components/quiz/QuizLibrary'
import { getAllQuizData } from '@/store/store'

type Props = {}
export type RequestBodyType = {
    questions: {
        question: string
        options: { [key: number]: string }
        correctOption: number
        tagId: number
        difficulty: string
    }[]
}
const formSchema = z.object({
    difficulty: z.enum(['Easy', 'Medium', 'Hard'], {
        required_error: 'You need to select a Difficulty  type.',
    }),

    topics: z.number().min(1, 'You need to select a Topic'),

    questionText: z
        .string()
        .min(10, {
            message: 'Question Text must be at least 10 characters.',
        })
        .max(160, {
            message: 'Question Text must not be longer than 30 characters.',
        }),
    options: z.array(z.string().max(30)),
    selectedOption: z.number(),
})

const EditQuizQuestion = ({
    tags,
    closeModal,
    setStoreQuizData,
    getAllQuizQuesiton,
    quizQuestionId,
    quizQuestion,
}: {
    tags: Tag[]
    closeModal: () => void
    setStoreQuizData: any
    getAllQuizQuesiton: any
    quizQuestionId: number
    quizQuestion: any
}) => {
    const { quizData } = getAllQuizData()
    const [difficulty, setDifficulty] = useState<string>('Easy')
    const [selectedOption, setSelectedOption] = useState<string>('')
    const [selectedQuizQuestion, setSelectedQuizQuestion] = useState<any>(null)
    const [options, setOptions] = useState<string[]>([''])

    const addOption = () => {
        setOptions([...options, ''])
    }

    const removeOption = (index: number) => {
        if (options.length > 1) {
            const newOptions = options.filter((_, i) => i !== index)
            setOptions(newOptions)
            form.setValue('options', newOptions)
        }
    }

    const handleEditQuizQuestion = async (requestBody: RequestBodyType) => {
        try {
            await api.post(`/Content/editquiz`, requestBody).then((res) => {
                toast({
                    title: res.data.status || 'Success',
                    description: res.data.message || 'Quiz Question Created',
                })
            })
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    'There was an error creating the quiz question. Please try again.',
            })
        }
    }
    console.log(selectedQuizQuestion)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            difficulty: undefined,
            topics: 0,
            questionText: '',
            options: options,
            selectedOption: 0,
        },
    })
    useEffect(() => {
        const selected = quizData.find(
            (question) => question.id === quizQuestionId
        )
        if (selected) {
            setSelectedQuizQuestion(selected)
            setOptions(Object.values(selected.options))
            setSelectedOption((selected.correctOption - 1).toString())
            setDifficulty(selected.difficulty)
            form.reset({
                difficulty: selected.difficulty,
                topics: selected.tagId,
                questionText: selected.question,
                options: Object.values(selected.options),
                selectedOption: selected.correctOption - 1,
            })
        }
    }, [quizQuestionId, quizData, form])

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        const optionsObject: { [key: number]: string } = options.reduce(
            (acc, option, index) => {
                acc[index + 1] = option
                return acc
            },
            {} as { [key: number]: string }
        )

        const formattedData = {
            id: quizQuestionId,
            question: values.questionText,
            options: optionsObject,
            correctOption: +selectedOption + 1,
            tagId: values.topics,
            difficulty: values.difficulty,
        }

        const requestBody = {
            questions: [formattedData],
        }
        console.log(requestBody)
        await handleEditQuizQuestion(requestBody)
        getAllQuizQuesiton(setStoreQuizData)
        closeModal()
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
                                        onValueChange={(value) => {
                                            setDifficulty(value)
                                            field.onChange(value)
                                        }}
                                        value={difficulty}
                                        className="flex space-y-1"
                                    >
                                        <FormLabel className="mt-5">
                                            Difficulty
                                        </FormLabel>
                                        <FormItem className="flex  items-center space-x-3 space-y-0">
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
                                            const selectedTag = tags?.find(
                                                (tag: Tag) =>
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
                        name="questionText"
                        render={({ field }) => {
                            return (
                                <FormItem className="text-left">
                                    <FormLabel>Question Text</FormLabel>
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
                        name="options"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="mt-5">Options</FormLabel>
                                <RadioGroup
                                    onValueChange={(value) => {
                                        setSelectedOption(value)
                                        field.onChange(value)
                                    }}
                                    defaultValue={selectedOption}
                                    className="space-y-1"
                                >
                                    {options.map((option, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-3 space-y-0"
                                        >
                                            <div className="flex gap-x-3 items-center">
                                                <RadioGroupItem
                                                    value={index.toString()}
                                                />
                                                <Input
                                                    placeholder={`Option ${
                                                        index + 1
                                                    }`}
                                                    {...form.register(
                                                        `options.${index}`
                                                    )}
                                                    className="w-[350px]"
                                                    value={option}
                                                    onChange={(e) => {
                                                        const newOptions = [
                                                            ...options,
                                                        ]
                                                        newOptions[index] =
                                                            e.target.value
                                                        setOptions(newOptions)
                                                        field.onChange(
                                                            newOptions
                                                        )
                                                    }}
                                                />
                                            </div>
                                            {options.length > 1 && (
                                                <Button
                                                    variant={'ghost'}
                                                    onClick={() =>
                                                        removeOption(index)
                                                    }
                                                    type="button"
                                                >
                                                    <X
                                                        size={20}
                                                        className="text-secondary"
                                                    />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </RadioGroup>
                                <FormMessage />
                                <div className="flex justify-start">
                                    <Button
                                        variant={'outline'}
                                        onClick={addOption}
                                        type="button"
                                    >
                                        <Plus
                                            size={20}
                                            className="text-secondary"
                                        />{' '}
                                        Add Option
                                    </Button>
                                </div>
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-1/2 ">
                        Edit Quiz Question
                    </Button>
                </form>
            </Form>
        </main>
    )
}

export default EditQuizQuestion
