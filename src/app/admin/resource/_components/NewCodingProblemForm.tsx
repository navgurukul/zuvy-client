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
import { cleanUpValues } from '@/utils/admin'
import { Toast } from '@/components/ui/toast'

// Regular expression to check for special characters
const noSpecialCharacters = /^[a-zA-Z0-9\s]*$/;

const formSchema = z.object({
    title: z.string()
        .min(5, 'Title must be at least 5 characters long.')
        .max(25, 'Title must be at most 25 characters long.')
        .refine(value => noSpecialCharacters.test(value), {
            message: 'Title must not contain special characters.',
        }),
    problemStatement: z.string().min(10, 'Problem statement must be at least 10 characters long.'),
    constraints: z.string().min(5, 'Constraints must be at least 5 characters long.'),
    difficulty: z.enum(['Easy', 'Medium', 'Hard'], {
        required_error: 'You need to select a Difficulty type.',
    }),
    topics: z.number().min(1, 'You need to select a Topic'),
    inputFormat: z.enum(['str', 'int', 'float', 'arrayOfnum', 'arrayOfStr'], {
        required_error: 'You need to select an Input Format',
    }),
    outputFormat: z.enum(['str', 'int', 'float', 'arrayOfnum', 'arrayOfStr'], {
        required_error: 'You need to select an Output Format',
    }),
    testCases: z.array(
        z.object({
            input: z.string().min(1, 'Input cannot be empty.'),
            output: z.string().min(1, 'Output cannot be empty.'),
        })
    ),
});

export default function NewCodingProblemForm({
    tags,
    setIsDialogOpen,
    getAllCodingQuestions,
    setCodingQuestions,
}: {
    tags: any
    setIsDialogOpen: any
    getAllCodingQuestions: any
    setCodingQuestions: any
}) {
    const [testCases, setTestCases] = useState([
        { id: 1, input: '', output: '' },
        { id: 2, input: '', output: '' },
    ])

    const handleAddTestCase = () => {
        setTestCases((prevTestCases: any) => [
            ...prevTestCases,
            { id: Date.now(), input: '', output: '' }, // Temporary ID
        ])
    }

    const handleRemoveTestCase = (id: number) => {
        setTestCases((prevTestCases: any) =>
            prevTestCases.filter((testCase: any) => testCase.id !== id)
        )

    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            problemStatement: '',
            constraints: '',
            difficulty: 'Easy',
            topics: 0,
            inputFormat: 'int',
            outputFormat: 'int',
            testCases: [],
        },
    })

    async function createCodingQuestion(data: any) {
        try {
            const response = await api.post(
                `codingPlatform/create-question`,
                data
            )

            toast({
                title: 'Success',
                description: 'Question Created Successfully',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })
            setIsDialogOpen(false)
        } catch (error: any) {
            toast({
                title: 'Error',
                description:
                    error?.response?.data?.message || 'An error occurred',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }


    const handleSubmit = (values: z.infer<typeof formSchema>) => {

        const processInput = (input: string, format: string) => {
            const cleanedInput = cleanUpValues(input);
    
            const isValidNumber = (value: string) => !isNaN(Number(value));
            const isValidFloat = (value: string) => !isNaN(parseFloat(value));
    
            switch (format) {
                case 'arrayOfnum': {
                    const values = cleanedInput.split(',');
                    if (!values.every(isValidNumber)) {
                        toast({
                            title: 'Invalid number value.',
                            description: 'Please enter a valid number.',
                            className:
                                'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                        });
                        return null;
                    }
                    return values.map(Number);
                }
                case 'arrayOfStr': {
                    return cleanedInput.split(',');
                }
                case 'int': {
                    const values = cleanedInput.split(' ');
                    if (!values.every(isValidNumber)) {
                        toast({
                            title: 'Invalid number value.',
                            description: 'Please enter a valid number.',
                            className:
                                'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                        });
                        return null;
                    }
                    return values.length === 1 ? Number(values[0]) : values.map(Number);
                }
                case 'float': {
                    if (!isValidFloat(cleanedInput)) {
                        toast({
                            title: 'Invalid float value.',
                            description: 'Please enter a valid float value.',
                            className:
                                'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                        });
                        return null;
                    }
                    return parseFloat(cleanedInput);
                }
                case 'str': 
                    return cleanedInput;
                default:
                    return cleanedInput;
            }
        };
    
        const generateParameterName = (index: number) => {
            return String.fromCharCode(97 + index); // a, b, c, etc.
        };
    
        const formattedData = {
            title: values.title,
            description: values.problemStatement,
            difficulty: values.difficulty,
            tagId: values.topics,
            constraints: values.constraints,
            testCases: values.testCases.map((testCase) => {
                const processedInput = processInput(
                    testCase.input,
                    values.inputFormat
                );
    
                if (processedInput === null) {
                    return null;
                }
    
                let inputs;
    
                if (Array.isArray(processedInput) && 
                    (values.inputFormat === 'arrayOfnum' || values.inputFormat === 'arrayOfStr')) {
                    inputs = [
                        {
                            parameterType: values.inputFormat,
                            parameterValue: processedInput,
                            parameterName: 'a',
                        },
                    ];
                } else {
                    const inputValues = cleanUpValues(testCase.input)
                        .trim()
                        .split(' ')
                        .filter(Boolean);
    
                    inputs = inputValues.map((value, index) => ({
                        parameterType: values.inputFormat,
                        parameterValue: processInput(value, values.inputFormat),
                        parameterName: generateParameterName(index),
                    }));
    
                }
    
                const expectedOutput = processInput(
                    testCase.output,
                    values.outputFormat
                );
    
                if (expectedOutput === null) {
                    return null;
                }
    
                return {
                    inputs,
                    expectedOutput: {
                        parameterType: values.outputFormat,
                        parameterValue: expectedOutput,
                    },
                };
            }).filter(Boolean), 
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            content: {},
        };
    
        const hasInvalidTestCase = formattedData.testCases.some((testCase:any) => {
            return testCase?.inputs?.parameterValue === null ||
                   testCase?.expectedOutput.parameterValue === null;
        });
    
        if (hasInvalidTestCase || formattedData.testCases.length === 0) {
            toast({
                title: 'Please enter valid test cases.',
                description: 'Submission failed: One or more test cases have invalid inputs or outputs.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            });
            return;
        }
    
        createCodingQuestion(formattedData);
        getAllCodingQuestions(setCodingQuestions);
    };
    
    
    

    return (
        <main className="flex flex-col p-3 w-full items-center">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="w-2/4 flex flex-col gap-4"
                >
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="text-left">
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Title" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="problemStatement"
                        render={({ field }) => (
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
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="constraints"
                        render={({ field }) => (
                            <FormItem className="text-left">
                                <FormLabel>Constraints</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Write the Constraints Here"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Difficulty</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex space-y-1"
                                    >
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
                        render={({ field }) => (
                            <FormItem className="text-left w-full">
                                <FormLabel>Topics</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        const selectedTag = tags.find(
                                            (tag: any) => tag.tagName === value
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
                        )}
                    />

                        <h6 className='text-left text-sm font-semibold'> Note: Max 20 test cases supported & a minimum of 2 test cases should be provided</h6>
                    <div className="flex justify-between gap-2">
                        <FormField
                            control={form.control}
                            name="inputFormat"
                            render={({ field }) => (
                                <FormItem className="text-left w-full">
                                    <FormLabel>Input format</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={String(field.value)}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose Input Format" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="str">
                                                String
                                            </SelectItem>
                                            <SelectItem value="int">
                                                Number
                                            </SelectItem>
                                            <SelectItem value="float">
                                                Float
                                            </SelectItem>
                                            <SelectItem value="arrayOfnum">
                                                Array Of Numbers
                                            </SelectItem>
                                            <SelectItem value="arrayOfStr">
                                                Array Of Strings
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="outputFormat"
                            render={({ field }) => (
                                <FormItem className="text-left w-full">
                                    <FormLabel>Output Format</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={String(field.value)}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose Output Format" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="str">
                                                String
                                            </SelectItem>
                                            <SelectItem value="int">
                                                Number
                                            </SelectItem>
                                            <SelectItem value="float">
                                                Float
                                            </SelectItem>
                                            <SelectItem value="arrayOfnum">
                                                Array Of Numbers
                                            </SelectItem>
                                            <SelectItem value="arrayOfStr">
                                                Array Of Strings
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="text-left">
                        <FormLabel>Test Cases</FormLabel>
                        {testCases.map((testCase: any, index: number) => (
                            <div
                                key={testCase.id} // Use `testCase.id` as the key for unique identification
                                className="flex items-center gap-2 mt-2"
                            >
                                <FormField
                                    control={form.control}
                                    name={`testCases.${index}.input`}
                                    render={({ field }) => (
                                        <FormItem className="text-left w-full">
                                            <Input
                                                placeholder="Input"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                {form.watch('inputFormat') ===
                                                    'arrayOfnum' ||
                                                    form.watch('inputFormat') ===
                                                    'arrayOfStr'
                                                    ? 'Max 1 array accepted (e.g., 1,2,3,4)'
                                                    : 'Enter values separated by spaces (e.g., 2 3 4)'}
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`testCases.${index}.output`}
                                    render={({ field }) => (
                                        <FormItem className="text-left w-full">
                                            <Input
                                                placeholder="Output"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                {form.watch('outputFormat') ===
                                                    'arrayOfnum' ||
                                                    form.watch('outputFormat') ===
                                                    'arrayOfStr'
                                                    ? 'Max 1 array accepted (e.g., 1,2,3,4)'
                                                    : 'Only one value accepted (e.g., 55)'}
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {
                                    <X
                                        className="cursor-pointer"
                                        onClick={() =>
                                            handleRemoveTestCase(testCase.id)
                                        } // Pass `testCase.id` to remove the correct test case
                                    />
                                }
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
                        <Button type="submit" className="w-1/2">
                            Create Question
                        </Button>
                    </div>
                </form>
            </Form>
        </main>
    )
}
