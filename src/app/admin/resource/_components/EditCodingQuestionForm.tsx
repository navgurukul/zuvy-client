'use client'
import { useEffect, useState } from 'react'

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
import {
    getCodingQuestionTags,
    getEditCodingQuestionDialogs,
} from '@/store/store'

const formSchema = z.object({
    title: z.string(),
    description: z.string(),
    problemStatement: z.string(),
    constraints: z.string(),
    difficulty: z.enum(['Easy', 'Medium', 'Hard'], {
        required_error: 'You need to select a Difficulty  type.',
    }),
    topics: z.number().min(1, 'You need to select a Topic'),
    inputFormat: z.enum(['Strings', 'Number', 'Float'], {
        required_error: 'You need to select an Input Format',
    }),
    outputFormat: z.enum(['Strings', 'Number', 'Float'], {
        required_error: 'You need to select an Output Format',
    }),
    testCases: z.array(
        z.object({
            input: z.string(),
            output: z.string(),
        })
    ),
})

export default function EditCodingQuestionForm({
    setIsCodingDialogOpen,
    getAllCodingQuestions,
    setCodingQuestions,
    codingQuestions,
}: {
    setIsCodingDialogOpen: any
    getAllCodingQuestions: any
    setCodingQuestions: any
    codingQuestions: any
}) {
    const [testCases, setTestCases] = useState([
        { id: 1, input: '', output: '' },
    ])

    const { tags } = getCodingQuestionTags()
    const { editCodingQuestionId } = getEditCodingQuestionDialogs()

    let selectCodingQuestion = codingQuestions.filter((question: any) => {
        return question.id === editCodingQuestionId
    })

    const handleAddTestCase = () => {
        setTestCases((prevTestCases) => [
            ...prevTestCases,
            { id: prevTestCases.length + 1, input: '', output: '' },
        ])
    }

    const handleRemoveTestCase = (id: number) => {
        setTestCases((prevTestCases) =>
            prevTestCases.filter((testCase) => testCase.id !== id)
        )
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: selectCodingQuestion[0]?.title || '',
            description: selectCodingQuestion[0]?.description || '',
            problemStatement: selectCodingQuestion[0]?.description || '',
            constraints: selectCodingQuestion[0]?.constraints || '',
            difficulty: selectCodingQuestion[0]?.difficulty || 'Easy',
            topics: selectCodingQuestion[0]?.tags || 0,
            inputFormat: 'Number',
            outputFormat: 'Strings',
            testCases:
                selectCodingQuestion[0]?.testCases.map((testCase: any) => ({
                    input: testCase.input[0],
                    output: testCase.output[0],
                })) || [],
        },
    })

    async function editCodingQuestion(data: any) {
        try {
            const response = await api.patch(
                `Content/updateCodingQuestion/${editCodingQuestionId}`,
                data
            )

            toast({
                title: 'Success',
                description: 'Question Edited Successfully',
                className: 'text-start capitalize border border-secondary',
            })
            setIsCodingDialogOpen(false)
        } catch (error: any) {
            toast({
                title: 'Error',
                description:
                    error?.response?.data?.message || 'An error occurred',
                className: 'text-start capitalize border border-destructive',
            })
        }
    }

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        const auth = JSON.parse(localStorage.getItem('AUTH') || '{}')
        const authorId = Number(auth.id)

        const formattedData = {
            title: values.title,
            description: values.problemStatement,
            difficulty: values.difficulty,
            tags: values.topics,
            constraints: values.constraints,
            authorId: authorId,
            examples: values.testCases.map((testCase) => ({
                inputs: {
                    input: [testCase.input],
                    output: [testCase.output],
                },
            })),
            testCases: values.testCases.map((testCase) => ({
                inputs: {
                    input: [testCase.input],
                    output: [testCase.output],
                },
            })),
            expectedOutput: [
                values.testCases.map((testCase) => testCase.output).join(', '),
            ],
            solution: 'solution of the coding question',
        }
        editCodingQuestion(formattedData)
        getAllCodingQuestions(setCodingQuestions)
    }

    useEffect(() => {
        if (selectCodingQuestion) {
            form.reset({
                title: selectCodingQuestion[0].title,
                description: selectCodingQuestion[0].description,
                problemStatement: selectCodingQuestion[0].description,
                constraints: selectCodingQuestion[0].constraints,
                difficulty: selectCodingQuestion[0].difficulty,
                topics: selectCodingQuestion[0].tags,
                inputFormat: 'Number',
                outputFormat: 'Strings',
                testCases: selectCodingQuestion[0].testCases.map(
                    (testCase: any) => ({
                        input: testCase.input[0],
                        output: testCase.output[0],
                    })
                ),
            })
            setTestCases(
                selectCodingQuestion[0].testCases.map(
                    (testCase: any, index: number) => ({
                        id: index + 1,
                        input: testCase.input[0],
                        output: testCase.output[0],
                    })
                )
            )
        }
    }, [selectCodingQuestion[0]])

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
                                                            selectCodingQuestion[0]
                                                                .difficulty
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
                                                onValueChange={(value) => {
                                                    const selectedTag =
                                                        tags.find(
                                                            (tag: any) =>
                                                                tag.tagName ===
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
                                                                        selectCodingQuestion[0]
                                                                            ?.tags
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
                        </div>
                        <div className="flex justify-between gap-2">
                            {/* <FormField
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
                            /> */}
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
                                        name={`testCases.${index}.input`}
                                        render={({ field }) => (
                                            <FormItem className="text-left">
                                                <Input
                                                    placeholder="Input"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`testCases.${index}.output`}
                                        render={({ field }) => (
                                            <FormItem className="text-left">
                                                <Input
                                                    placeholder="Output"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
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
                                </div>
                            ))}
                            <Button
                                variant={'outline'}
                                type="button"
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
                                Edit Coding Question
                            </Button>
                        </div>
                    </form>
                </Form>
            </main>
        </ScrollArea>
    )
}
