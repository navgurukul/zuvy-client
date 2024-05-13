'use client'
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

const formSchema = z.object({
    title: z.string(),
    description: z.string(),
    problemStatement: z.string(),
    constraints: z.string(),
    difficulty: z.enum(['Easy', 'Medium', 'hard'], {
        required_error: 'You need to select a Difficulty  type.',
    }),
    // allowedLanguages: z.enum(['All Languages', 'C++', 'Python'], {
    //     required_error: 'You need to select a Language',
    // }),
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

export default function NewCodingProblemForm() {
    const [testCases, setTestCases] = useState([{ id: 1 }])

    const handleAddTestCase = () => {
        const newTestCase = { id: testCases.length + 1 }
        setTestCases([...testCases, newTestCase])
    }

    const handleRemoveTestCase = (id: number) => {
        if (testCases.length === 1) return
        setTestCases(testCases.filter((testCase) => testCase.id !== id))
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            problemStatement: '',
            constraints: '',
            difficulty: 'Easy',
            // allowedLanguages: 'All Languages',
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
        <ScrollArea className="h-[calc(100vh-200px)] w-full rounded-md  ">
            <main className="flex  flex-col p-3 ">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className=" max-w-md w-full flex flex-col gap-4"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => {
                                return (
                                    <FormItem className="text-left">
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Title"
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
                            name="description"
                            render={({ field }) => {
                                return (
                                    <FormItem className="text-left">
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Description"
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
                            name="problemStatement"
                            render={({ field }) => {
                                return (
                                    <FormItem className="text-left">
                                        <FormLabel>Problem Statement</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Write the Detailed Description Here"
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
                            name="constraints"
                            render={({ field }) => {
                                return (
                                    <FormItem className="text-left">
                                        <FormLabel>Constraints </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Write the Detailed Description Here"
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
                                                        defaultValue={
                                                            field.value
                                                        }
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
                        <div className="flex justify-between gap-2">
                            {/* <FormField
                                control={form.control}
                                name="allowedLanguages"
                                render={({ field }) => {
                                    return (
                                        <FormItem className="text-left w-full">
                                            <FormLabel>
                                                Allowed Languages
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose Language" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
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
                            /> */}
                            <FormField
                                control={form.control}
                                name="topics"
                                render={({ field }) => {
                                    return (
                                        <FormItem className="text-left w-full">
                                            <FormLabel>Topics</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose Topic" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="DSA">
                                                        DSA
                                                    </SelectItem>
                                                    <SelectItem value="Strings">
                                                        Strings
                                                    </SelectItem>
                                                    <SelectItem value="Development">
                                                        Development
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />
                        </div>
                        <div className="flex justify-between gap-2">
                            <FormField
                                control={form.control}
                                name="inputFormat"
                                render={({ field }) => {
                                    return (
                                        <FormItem className="text-left w-full">
                                            <FormLabel>Input format</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose Input Format" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="String">
                                                        String
                                                    </SelectItem>
                                                    <SelectItem value="Number">
                                                        Number
                                                    </SelectItem>
                                                    <SelectItem value="Float">
                                                        Float
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
                                name="outputFormat"
                                render={({ field }) => {
                                    return (
                                        <FormItem className="text-left w-full">
                                            <FormLabel>Output Format</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose Output Format" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="String">
                                                        String
                                                    </SelectItem>
                                                    <SelectItem value="Number">
                                                        Number
                                                    </SelectItem>
                                                    <SelectItem value="Float">
                                                        Float
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />
                        </div>
                        <div className="text-left ">
                            {/* <div className="flex justify-start"> */}
                            <FormLabel>Test Cases</FormLabel>
                            {/* </div> */}
                            {testCases.map((testCase, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2"
                                >
                                    <FormField
                                        control={form.control}
                                        name={`testCaseInput`}
                                        render={({ field }) => (
                                            <FormItem className="text-left">
                                                <Input
                                                    placeholder="Input"
                                                    {...field}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`testCaseOutput`}
                                        render={({ field }) => (
                                            <FormItem className="text-left">
                                                <Input
                                                    placeholder="Output"
                                                    {...field}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {index !== 0 && (
                                        <X
                                            className="cursor-pointer"
                                            onClick={() =>
                                                handleRemoveTestCase(
                                                    testCase.id
                                                )
                                            }
                                        />
                                    )}
                                    {/* <div className="">
                                        {hoveredIndex === index &&
                                            testCases.length > 1 && (
                                                
                                            )}
                                    </div> */}
                                </div>
                            ))}
                            <Button
                                variant={'outline'}
                                className="mt-2"
                                onClick={handleAddTestCase}
                            >
                                <Plus size={20} />
                                <p className="text-secondary font-bold">
                                    Add Test Cases
                                </p>
                            </Button>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" className="w-1/2 ">
                                Create Problems
                            </Button>
                        </div>
                    </form>
                </Form>
            </main>
        </ScrollArea>
    )
}
