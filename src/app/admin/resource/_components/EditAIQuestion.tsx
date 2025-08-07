// External imports
import React, { useState, useEffect, useCallback, useRef } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'

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
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { DialogFooter } from '@/components/ui/dialog'
import { getGeneratedQuestions, getRequestBody } from '@/store/store'

const formSchema = z.object({
    questionText: z.string().min(1, {
        message: 'Question Text must be at least 10 characters.',
    }),
    options: z.array(z.string()),
    selectedOption: z.number(),
})

const EditAIQuestion = ({
    questionId,
    setEditModalOpen,
}: {
    questionId: string | number;
    setEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const [selectedOption, setSelectedOption] = useState<string>('')
    const [options, setOptions] = useState<string[]>(['', ''])
    const { generatedQuestions, setGeneratedQuestions } =
        getGeneratedQuestions()
    const { requestBody, setRequestBody } = getRequestBody()

    const question = generatedQuestions.find(
        (item) => item.questionId === questionId
    )

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            questionText: question?.question || '',
            options: question?.options,
            selectedOption: question?.correctOption || 0,
        },
    })

    useEffect(() => {
        setOptions(Object.values(question.options))
        setSelectedOption((question.correctOption - 1).toString())
        form.reset({
            questionText: question.question,
            options: Object.values(question.options),
            selectedOption: question.correctOption,
        })
    }, [questionId, form])

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

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        const optionObject: { [key: number]: string } = {}
        values.options.forEach((option, index) => {
            optionObject[index + 1] = option
        })

        question.options = optionObject
        question.question = values.questionText
        question.correctOption = values.selectedOption

        if (generatedQuestions.length > 0) {
            const bulkQuestions = generatedQuestions.map((question) => {
                return {
                    tagId: question.tagId,
                    difficulty: question.difficulty,
                    variantMCQs: [
                        {
                            question: question.question,
                            options: question.options,
                            correctOption: question.correctOption,
                        },
                    ],
                }
            })
            const requestBody = {
                quizzes: bulkQuestions,
            }
            setRequestBody(requestBody)
        }

        setEditModalOpen(false)
    }

    return (
        <>
            <main className="flex  flex-col p-3 ">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className=" max-w-md w-full flex flex-col gap-4"
                    >
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
                            name="selectedOption" // This is important to track the correct option separately
                            render={({ field }) => (
                                <FormItem className="text-left">
                                    <FormLabel className="mt-5">
                                        Answer Choices
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
                                                            const newOptions = [
                                                                ...options,
                                                            ]
                                                            newOptions[index] =
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
                                                            variant={'ghost'}
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
        </>
    )
}

export default EditAIQuestion
