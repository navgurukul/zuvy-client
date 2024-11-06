// External imports
import React, { useState, useEffect, useCallback, useRef } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash, X } from 'lucide-react'

// Internal imports
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
    SelectItem,
    Select,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { Tag } from '../mcq/page'
import { DialogFooter } from '@/components/ui/dialog'
import { getAllQuizQuestion } from '@/utils/admin'
import {
    getCodingQuestionTags,
    getmcqdifficulty,
    getMcqSearch,
} from '@/store/store'
import { error } from 'console'
import { Spinner } from '@/components/ui/spinner'

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

    questionText: z.string().min(1, {
        message: 'Question Text must be at least 10 characters.',
    }),
    options: z.array(z.string()),
    selectedOption: z.number(),
})

const EditQuizQuestion = ({
    setStoreQuizData,
    quizId,
}: {
    setStoreQuizData: any
    quizId: number
}) => {
    const [difficulty, setDifficulty] = useState<string>('Easy')
    const [selectedOption, setSelectedOption] = useState<any>('')
    const [options, setOptions] = useState<string[]>(['', ''])
    const [quizQuestionById, setQuizQuestionById] = useState<any>()
    const [loadingState, setLoadingState] = useState<string>('')
    const { tags } = getCodingQuestionTags()
    const { mcqDifficulty } = getmcqdifficulty()
    const { mcqSearch, setmcqSearch } = getMcqSearch()
    const initialQuizId = useRef(quizId)

    const fetchQuizQuestion = useCallback(async () => {
        setLoadingState('formIsLoading')
        try {
            await api
                .get(
                    `/Content/GetQuizQuestionById/${initialQuizId.current}
`
                )
                .then((res) => {
                    setQuizQuestionById(res.data.data[0])
                })
        } catch (error: any) {
            console.log(error.message)
        } finally {
            setLoadingState('formIsLoaded')
        }
    }, [quizId])

    useEffect(() => {
        fetchQuizQuestion()
    }, [fetchQuizQuestion, quizId])

    let selectedQuizQuestion = quizQuestionById
    let selectedTagId = selectedQuizQuestion?.tagId
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            difficulty: selectedQuizQuestion?.difficulty || 'Easy',
            topics: selectedQuizQuestion?.tagId || 0,
            questionText: selectedQuizQuestion?.question || '',
            options: selectedQuizQuestion?.options,
            selectedOption: selectedQuizQuestion?.correctOption || 0,
        },
    })

    useEffect(() => {
        const selectedQuizQuestion = quizQuestionById
        if (selectedQuizQuestion) {
            setOptions(Object.values(selectedQuizQuestion.options))
            setSelectedOption(
                (selectedQuizQuestion.correctOption - 1).toString()
            )
            setDifficulty(selectedQuizQuestion.difficulty)

            form.reset({
                difficulty: selectedQuizQuestion.difficulty,
                topics: selectedQuizQuestion.tagId,
                questionText: selectedQuizQuestion.question,
                options: Object.values(selectedQuizQuestion.options),
                selectedOption: selectedQuizQuestion.correctOption,
            })
        }
    }, [quizQuestionById, form])
    const addOption = () => {
        setOptions([...options, ''])
    }

    const removeOption = (index: number) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index)
            setOptions(newOptions)
            form.setValue('options', newOptions)
        }
    }

    const handleEditQuizQuestion = async (requestBody: RequestBodyType) => {
        try {
            await api.post('/Content/editquiz', requestBody).then((res) => {
                toast({
                    title: res.data.status || 'Success',
                    description: res.data.message || 'Quiz Question Created',
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                })
            })
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    'There was an error creating the quiz question. Please try again.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        const emptyOptions = values.options.some(
            (option) => option.trim() === ''
        )

        if (emptyOptions) {
            toast({
                title: 'Error',
                description: 'Options cannot be empty',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
            return
        }
        const optionsObject: { [key: number]: any } = options.reduce(
            (acc, option, index) => {
                acc[index + 1] = option
                return acc
            },
            {} as { [key: number]: any }
        )

        const formattedData = {
            id: quizId,
            question: values.questionText,
            options: optionsObject,
            correctOption: parseInt(selectedOption) + 1,
            tagId: values.topics,
            difficulty: values.difficulty,
        }

        const requestBody = {
            questions: [formattedData],
        }
        await handleEditQuizQuestion(requestBody)
        getAllQuizQuestion(setStoreQuizData, mcqDifficulty, mcqSearch)
    }

    return (
        <>
            {loadingState === 'formIsLoading' ? (
                <Spinner className="text-secondary" />
            ) : loadingState === 'formIsLoaded' ? (
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
                                                value={
                                                    tags.find(
                                                        (tag) =>
                                                            tag.id ===
                                                            field.value
                                                    )?.tagName ||
                                                    tags.find(
                                                        (tag) =>
                                                            tag.id ===
                                                            selectedQuizQuestion?.tagId
                                                    )?.tagName ||
                                                    ''
                                                }
                                                onValueChange={(value) => {
                                                    const selectedTag =
                                                        tags.find(
                                                            (tag: any) =>
                                                                tag?.tagName ===
                                                                value
                                                        )
                                                    if (selectedTag) {
                                                        field.onChange(
                                                            selectedTag.id
                                                        )
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
                                                                        selectedQuizQuestion?.tagId
                                                                )?.tagName ||
                                                                'Choose Topic'
                                                            }
                                                        />
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
                                name="questionText"
                                render={({ field }) => {
                                    return (
                                        <FormItem className="text-left">
                                            <FormLabel>Question Text</FormLabel>
                                            <FormControl>
                                                <pre>
                                                    <Textarea
                                                        placeholder="Write your Question here"
                                                        {...field}
                                                    />
                                                </pre>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />

                            <FormField
                                control={form.control}
                                name="selectedOption" // This is important to track the correct option separately
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="mt-5">
                                            Options
                                        </FormLabel>
                                        <RadioGroup
                                            onValueChange={(value) => {
                                                setSelectedOption(value)
                                                form.setValue(
                                                    'selectedOption',
                                                    +value
                                                )
                                            }}
                                            value={selectedOption}
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
                                                                const newOptions =
                                                                    [...options]
                                                                newOptions[
                                                                    index
                                                                ] =
                                                                    e.target.value
                                                                setOptions(
                                                                    newOptions
                                                                )
                                                                form.setValue(
                                                                    'options',
                                                                    newOptions
                                                                )
                                                            }}
                                                        />
                                                    </div>
                                                    {options.length > 2 &&
                                                        index >= 2 && (
                                                            <Button
                                                                variant={
                                                                    'ghost'
                                                                }
                                                                onClick={() =>
                                                                    removeOption(
                                                                        index
                                                                    )
                                                                }
                                                                type="button"
                                                            >
                                                                <X
                                                                    size={15}
                                                                    className="text-destructive"
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

                            <DialogFooter>
                                <Button type="submit" className="w-1/2 ">
                                    Edit MCQ
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </main>
            ) : (
                ''
            )}
        </>
    )
}

export default EditQuizQuestion
