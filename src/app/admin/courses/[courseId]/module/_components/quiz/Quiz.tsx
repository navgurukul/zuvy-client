import React, { useState } from 'react'

import Link from 'next/link'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { Separator } from '@/components/ui/separator'
import {
    ArrowUpRight,
    GripVertical,
    X,
    Plus,
    ExternalLink,
    PlusCircle,
} from 'lucide-react'
import QuizLibrary from './QuizLibrary'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'

interface QuizProps {
    content: Object
}
const FormSchema = z.object({
    type: z.enum(['option 1', 'option 2', 'option 3', 'option 4'], {
        required_error: 'You need to select a notification type.',
    }),
    questionInput: z.string().min(1, {
        message: 'Username must be at least 1 characters.',
    }),
    options: z.array(z.string()).nonempty({
        message: 'At least one option is required.',
    }),
})
function Quiz({ content }: QuizProps) {
    const [activeTab, setActiveTab] = useState('anydifficulty')
    const [addQuestion, setAddQuestion] = useState<any>([])

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            questionInput: '',
            options: [''],
        },
    })
    const handleAddOption = () => {
        form.setValue('options', [...form.getValues('options'), ''])
    }
    const handleRemoveOption = (index: number) => {
        const updatedOptions: any = [...form.getValues('options')]
        updatedOptions.splice(index, 1)
        form.setValue('options', updatedOptions)
    }
    function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log(data)
    }
    const handleAddQuestion = (data: any) => {
        setAddQuestion((prevQuestions: any) => [...prevQuestions, ...data])
    }
    const removeQuestionById = (questionId: number) => {
        setAddQuestion((prevQuestions: any) =>
            prevQuestions.filter((question: any) => question.id !== questionId)
        )
    }
    console.log(addQuestion)
    return (
        <>
            <div className="flex flex-row items-center justify-start gap-x-6 mb-10">
                <Input
                    placeholder="Untitled Quiz"
                    className="p-0 text-3xl w-1/5 text-left font-semibold outline-none border-none focus:ring-0 capitalize"
                />
                <Link
                    className="text-secondary font-semibold flex mt-2"
                    href={''}
                >
                    Preview
                    <ExternalLink size={20} />
                </Link>
            </div>

            <div className="flex gap-x-2">
                <QuizLibrary
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    addQuestion={addQuestion}
                    handleAddQuestion={handleAddQuestion}
                />
                <Separator
                    orientation="vertical"
                    className="mx-4 w-[2px] h-screen rounded "
                />
                <ScrollArea className="h-screen w-full rounded-md ">
                    <div className="flex flex-col gap-y-4">
                        {addQuestion.map((question: any, index: number) => {
                            return (
                                <div className="w-full" key={index}>
                                    <div className="flex justify-end w-full ">
                                        <X
                                            className="mr-5 cursor-pointer"
                                            onClick={() =>
                                                removeQuestionById(question.id)
                                            }
                                        />
                                    </div>
                                    <Form {...form}>
                                        <form
                                            onSubmit={form.handleSubmit(
                                                onSubmit
                                            )}
                                            className="w-full  space-y-6"
                                        >
                                            <FormField
                                                control={form.control}
                                                name="questionInput"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <div className="flex justify-start">
                                                            <FormLabel className="text-lg">
                                                                Question Text
                                                            </FormLabel>
                                                        </div>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Question Text"
                                                                {...field}
                                                            />
                                                        </FormControl>

                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="type"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-3 w-full">
                                                        <div className="flex justify-start">
                                                            <FormLabel className="text-lg ">
                                                                Answer Choices
                                                            </FormLabel>
                                                        </div>
                                                        <FormControl>
                                                            <RadioGroup
                                                                onValueChange={
                                                                    field.onChange
                                                                }
                                                                defaultValue={
                                                                    field.value
                                                                }
                                                                className="flex flex-col space-y-1 w-full"
                                                            >
                                                                {form
                                                                    .getValues(
                                                                        'options'
                                                                    )
                                                                    .map(
                                                                        (
                                                                            option,
                                                                            index
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className="flex items-center space-x-3 space-y-0"
                                                                            >
                                                                                <FormControl>
                                                                                    <RadioGroupItem
                                                                                        value={`option ${
                                                                                            index +
                                                                                            1
                                                                                        }`}
                                                                                    />
                                                                                </FormControl>
                                                                                <FormField
                                                                                    control={
                                                                                        form.control
                                                                                    }
                                                                                    name={`options.${index}`}
                                                                                    render={({
                                                                                        field,
                                                                                    }) => (
                                                                                        <FormItem className="w-[400px]">
                                                                                            <Input
                                                                                                placeholder={`Option ${
                                                                                                    index +
                                                                                                    1
                                                                                                }`}
                                                                                                {...field}
                                                                                            />
                                                                                            <FormMessage />
                                                                                        </FormItem>
                                                                                    )}
                                                                                />
                                                                                {index !==
                                                                                    0 && (
                                                                                    <Button
                                                                                        variant={
                                                                                            'ghost'
                                                                                        }
                                                                                        onClick={() =>
                                                                                            handleRemoveOption(
                                                                                                index
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <X />
                                                                                    </Button>
                                                                                )}
                                                                            </div>
                                                                        )
                                                                    )}
                                                            </RadioGroup>
                                                        </FormControl>
                                                        <FormMessage />
                                                        <Button
                                                            variant={'outline'}
                                                            onClick={
                                                                handleAddOption
                                                            }
                                                            className="flex justify-start text-secondary font-semibold "
                                                        >
                                                            <Plus
                                                                size={15}
                                                                className="text-secondary"
                                                            />
                                                            Add options
                                                        </Button>
                                                    </FormItem>
                                                )}
                                            />
                                            <Button
                                                className="flex justify-start"
                                                type="submit"
                                            >
                                                Submit
                                            </Button>
                                        </form>
                                    </Form>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>

                <div>
                    <div className="w-full mt-6">
                        {' '}
                        {content &&
                            (
                                content as {
                                    id: number
                                    question: string
                                    options: string[]
                                    correctOption: string
                                }[]
                            )?.map(
                                (
                                    { id, question, options, correctOption },
                                    index
                                ) => {
                                    return (
                                        <div
                                            key={id}
                                            className="text-start mb-5"
                                        >
                                            <p>
                                                Q{index + 1}. {question}
                                            </p>
                                            <ul className="text-start">
                                                {Object.entries(options).map(
                                                    ([key, value]) => {
                                                        return (
                                                            <li
                                                                key={key}
                                                                className={cn(
                                                                    'rounded-sm my-1 p-2',
                                                                    correctOption ===
                                                                        key.toString()
                                                                        ? 'bg-secondary text-white'
                                                                        : ''
                                                                )}
                                                            >
                                                                {value}
                                                            </li>
                                                        )
                                                    }
                                                )}
                                            </ul>
                                        </div>
                                    )
                                }
                            )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Quiz
