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

type Props = {}
const formSchema = z.object({
    title: z.string(),
    functionName: z.string(),
    shortDescriptionn: z.string(),
    problemStatement: z.string(),
    constraints: z.string(),
    difficulty: z.enum(['Easy', 'Medium', 'hard'], {
        required_error: 'You need to select a Difficulty  type.',
    }),
    allowedLanguages: z.enum(['All Languages', 'C++', 'Python'], {
        required_error: 'You need to select a Language',
    }),
    topics: z.enum(['Strings', 'DSA', 'Development'], {
        required_error: 'You need to select a Topic',
    }),
    inputFormat: z.enum(['Strings', 'Number', 'Float'], {
        required_error: 'You need to select a Input Format',
    }),
    outputFormat: z.enum(['Strings', 'Number', 'Float'], {
        required_error: 'You need to select a Output Format',
    }),
    testCaseInput: z.string(),
    testCaseOutput: z.string(),
})

const NewMcqProblemForm = (props: Props) => {
    const [testCases, setTestCases] = useState([{ id: 1 }])
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(0)
    const [options, setOptions] = useState(['Easy', 'Medium', 'Hard']) // Initial state with three options

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            functionName: '',
            shortDescriptionn: '',
            problemStatement: '',
            constraints: '',
            difficulty: 'Easy',
            allowedLanguages: 'All Languages',
            topics: 'DSA',
            inputFormat: 'Number',
            outputFormat: 'Strings',
            testCaseInput: '',
            testCaseOutput: '',
        },
    })

    // const accountType = form.watch('accountType')

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        console.log({ values })
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
                        render={({ field }) => {
                            return (
                                <FormField
                                    control={form.control}
                                    name="difficulty"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                    className="flex  space-y-1"
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
                            )
                        }}
                    />
                    <FormField
                        control={form.control}
                        name="allowedLanguages"
                        render={({ field }) => {
                            return (
                                <FormItem className="text-left">
                                    <FormLabel>Topics</FormLabel>
                                    <Select onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger className="w-1/2">
                                                <SelectValue placeholder="Choose Topic" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="w-1/2">
                                            <SelectItem value="All Languages">
                                                All Languages
                                            </SelectItem>
                                            <SelectItem value="C++">
                                                C++
                                            </SelectItem>
                                            <SelectItem value="Python">
                                                Python
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )
                        }}
                    />
                    <FormField
                        control={form.control}
                        name="problemStatement"
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
                        name="difficulty"
                        render={({ field }) => (
                            <FormItem className="space-y-3 w-full">
                                <FormLabel className="flex justify-start mt-5">
                                    Difficulty
                                </FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="space-y-1"
                                    >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="Easy" />
                                            </FormControl>
                                            <Input placeholder="Option 1" />
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="Medium" />
                                            </FormControl>
                                            <Input placeholder="Option 2" />
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="Hard" />
                                            </FormControl>
                                            <Input placeholder="Option 3" />
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="Hard" />
                                            </FormControl>
                                            <Input placeholder="Option 4" />
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                <div className="flex justify-start">
                                    <Button variant={'outline'}>
                                        <Plus
                                            size={20}
                                            className="text-secondary"
                                        />{' '}
                                        Add Options
                                    </Button>
                                </div>
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end">
                        <Button type="submit" className="w-1/2 ">
                            Create Problems
                        </Button>
                    </div>
                </form>
            </Form>
        </main>
    )
}

export default NewMcqProblemForm
