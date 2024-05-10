import React, { useState } from 'react'

import Link from 'next/link'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { Separator } from '@/components/ui/separator'
import { ArrowUpRight, GripVertical, X, Plus, ExternalLink } from 'lucide-react'
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
import { Button } from '@/components/ui/button'

interface QuizProps {
    content: Object
}
const FormSchema = z.object({
    type: z.enum(['option 1', 'option 2', 'option 3', 'option 4'], {
        required_error: 'You need to select a notification type.',
    }),
    questionInput: z.string().min(2, {
        message: 'Username must be at least 2 characters.',
    }),
    option1: z.string().min(2, {
        message: 'Username must be at least 2 characters.',
    }),
    option2: z.string().min(2, {
        message: 'Username must be at least 2 characters.',
    }),
    option3: z.string().min(2, {
        message: 'Username must be at least 2 characters.',
    }),
    option4: z.string().min(2, {
        message: 'Username must be at least 2 characters.',
    }),
})
function Quiz({ content }: QuizProps) {
    const [activeTab, setActiveTab] = useState('anydifficulty')
    const [search, setSearch] = useState<string>()
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            questionInput: '',
            option1: '',
            option2: '',
            option3: '',
            option4: '',
        },
    })

    console.log(search)

    function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log(data)
    }
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
                />
                <Separator
                    orientation="vertical"
                    className="mx-4 w-[2px] h-screen rounded "
                />
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full space-y-6"
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
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1 w-full"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="option 1" />
                                                </FormControl>
                                                <FormField
                                                    control={form.control}
                                                    name="option1"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Option 1"
                                                                    className="w-[450px]"
                                                                    {...field}
                                                                />
                                                            </FormControl>

                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="option 2" />
                                                </FormControl>
                                                <FormField
                                                    control={form.control}
                                                    name="option2"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Option 2"
                                                                    className="w-[450px]"
                                                                    {...field}
                                                                />
                                                            </FormControl>

                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="option 3" />
                                                </FormControl>
                                                <FormField
                                                    control={form.control}
                                                    name="option3"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    className="w-[450px]"
                                                                    placeholder="Option 3"
                                                                    {...field}
                                                                />
                                                            </FormControl>

                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="option 4" />
                                                </FormControl>
                                                <FormField
                                                    control={form.control}
                                                    name="option4"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Option 4"
                                                                    className="w-[450px]"
                                                                    {...field}
                                                                />
                                                            </FormControl>

                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button className="flex justify-start" type="submit">
                            Submit
                        </Button>
                    </form>
                </Form>
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
