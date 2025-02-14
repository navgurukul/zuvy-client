'use client'

import { useEffect, useRef, useState } from 'react'
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
import { Plus, PlusCircleIcon, X } from 'lucide-react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { cleanUpValues } from '@/utils/admin'
import test from 'node:test'

const noSpecialCharacters = /^[a-zA-Z0-9\s]*$/

const inputTypes = ['str', 'int', 'float', 'arrayOfnum', 'arrayOfStr', 'bool', 'jsonType'] as const
const outputTypes = ['str', 'int', 'float', 'arrayOfnum', 'arrayOfStr', 'bool', 'jsonType'] as const

const formSchema = z.object({
    title: z
        .string()
        .min(5, 'Title must be at least 5 characters long.')
        .max(60, 'Title must be at most 60 characters long.')
        .refine((value) => noSpecialCharacters.test(value), {
            message: 'Title must not contain special characters.',
        }),
    problemStatement: z
        .string()
        .min(10, 'Problem statement must be at least 10 characters long.'),
    constraints: z
        .string()
        .min(5, 'Constraints must be at least 5 characters long.'),
    difficulty: z.enum(['Easy', 'Medium', 'Hard'], {
        required_error: 'You need to select a Difficulty type.',
    }),
    topics: z.number().min(1, 'You need to select a Topic'),
    testCases: z.array(
        z.object({
            inputs: z.array(
                z.object({
                    type: z.enum(inputTypes),
                    value: z.string().min(1, 'Input cannot be empty.')
                })
            ),
            output: z.object({
                type: z.enum(outputTypes),
                value: z.string().min(1, 'Output cannot be empty.')
            })
        })
    ),
})

export default function NewCodingProblemForm({
    tags,
    setIsDialogOpen,
    filteredCodingQuestions,
    setCodingQuestions,
    selectedOptions,
    difficulty,
    offset,
    position,
}: {
    tags: any
    setIsDialogOpen: any
    setCodingQuestions: any
    filteredCodingQuestions?: any
    selectedOptions?: any
    difficulty?: any
    offset?: number
    position?: String
}) {
    const [testCases, setTestCases] = useState([
        {
            id: 1,
            inputs: [{ id: Date.now(), type: 'int', value: '' }],
            output: { type: 'int', value: '' }
        }
    ])

    let outputObjectRef = useRef('' as any);

    const getAvailableInputTypes = (testCaseIndex: number) => {
        const usedTypes = testCases[testCaseIndex].inputs.map(input => input.type);
        return inputTypes.filter(type => !usedTypes.includes(type));
    }

    const handleAddInputType = (testCaseId: number) => {
        // Only allow adding inputs to the first test case
        if (testCaseId !== testCases[0].id) return;

        const availableTypes = getAvailableInputTypes(0);
        if (availableTypes.length === 0) {
            toast({
                title: "Cannot Add Input",
                description: "All input types have been used in this test case.",
                className: "fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50",
            });
            return;
        }

        // Create new input for first test case and propagate to all test cases
        const newInput = { id: Date.now(), type: availableTypes[0], value: '' };
        setTestCases(prevTestCases =>
            prevTestCases.map(testCase => ({
                ...testCase,
                inputs: [...testCase.inputs, { ...newInput, id: Date.now() + Math.random() }]
            }))
        );
    };

    const handleRemoveInput = (testCaseId: number, inputIndex: number) => {
        // Only allow removing inputs from the first test case
        if (testCaseId !== testCases[0].id) return;

        // Remove the input at the specified index from all test cases
        setTestCases(prevTestCases =>
            prevTestCases.map(testCase => ({
                ...testCase,
                inputs: testCase.inputs.filter((_, idx) => idx !== inputIndex)
            }))
        );
    };

    const handleInputTypeChange = (testCaseIndex: number, inputIndex: number, newType: string) => {
        if (testCaseIndex === 0) {
            // For the first test case, update all test cases to maintain consistency
            const newTestCases = testCases.map(tc => ({
                ...tc,
                inputs: tc.inputs.map((inp, idx) =>
                    idx === inputIndex ? { ...inp, type: newType, value: '' } : inp
                )
            }));
            setTestCases(newTestCases);
        }
    }

    const validateInputSize = (value: string, type: string, inputIndex: number, testCaseIndex: number, testCases: any[]) => {
        if (testCaseIndex === 0) return true;

        const firstTestCase = testCases[0];
        const firstTestCaseInput = firstTestCase.inputs[inputIndex];

        if (!firstTestCaseInput.value.trim()) return true;

        switch (type) {
            case 'int':
            case 'float':
            case 'str': {
                const currentValues = value.trim().split(' ').filter(Boolean);
                const referenceValues = firstTestCaseInput.value.trim().split(' ').filter(Boolean);
                return currentValues.length <= referenceValues.length;
            }
            case 'bool': {
                return value === 'true' || value === 'false' || value === '';
            }
            case 'jsonType': {
                try {
                    JSON.parse(value);
                    return true;
                } catch (e) {
                    return false;
                }
            }
            default:
                return true;
        }
    };

    // Shared validation function for both inputs and outputs
    const validateFieldValue = (value: string, type: string) => {
        switch (type) {
            case 'arrayOfStr':
            case 'arrayOfnum': {
                if (value.includes(' ')) {
                    toast({
                        title: "Invalid Format",
                        description: "Please use commas to separate elements in an array (e.g., 1,2,3) or (e.g., hello,world)",
                        className: "fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50",
                    });
                    return false;
                }
                break;
            }
            case 'str': {
                if (value.includes(',')) {
                    toast({
                        title: "Invalid Format",
                        description: "Please use spaces to separate elements (e.g., hello world)",
                        className: "fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50",
                    });
                    return false;
                }
                break;
            }
            case 'int': {
                if (value.includes(',')) {
                    toast({
                        title: "Invalid Integer Input",
                        description: "Please use spaces to separate elements (e.g., 1 2 3)",
                        className: "fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50",
                    })
                    return false;
                }
                if (value.includes(',')) {
                    toast({
                        title: "Invalid Integer Input",
                        description: "Please use spaces to separate elements (e.g., 1 2 3)",
                        className: "fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50",
                    })
                    return false;
                }
                break;
            }
            case 'float': {
                if (value.includes(',')) {
                    toast({
                        title: "Invalid Float Input",
                        description: "Please use spaces to separate elements (e.g., 1.43 2.0 3.09)",
                        className: "fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50",
                    })
                    return false;
                }
                else if (isNaN(Number(value))) {
                    toast({
                        title: "Invalid Float Input",
                        description: "Please enter a valid float (e.g., 3.14, -0.001)",
                        className: "fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50",
                    });
                    return false;
                }
                break;
            }
            case 'bool': {
                // Allow partial inputs like 't', 'tr', 'tru', etc.
                if (value && !/^(true|false)$/.test(value) && !/^(t(r(u(e)?)?)?|f(a(l(s(e)?)?)?)?)$/.test(value)) {
                    toast({
                        title: "Invalid Boolean Input",
                        description: "Please enter either 'true' or 'false'",
                        className: "fixed bottom-4 right-4 text-start border border-destructive max-w-sm px-6 py-5 box-border z-50",
                    });
                    return false;
                }
                break;
            }
        }
        return true;
    };
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>,
        testCaseIndex: number,
        inputIndex: number,
        testCases: any[],
        setTestCases: React.Dispatch<React.SetStateAction<any[]>>
    ) => {
        const newValue = e.target.value;
        const inputType = testCases[testCaseIndex].inputs[inputIndex].type;

        // Only validate the format, not the size
        if (!validateFieldValue(newValue, inputType)) {
            return;
        }

        const newTestCases = [...testCases];
        newTestCases[testCaseIndex].inputs[inputIndex].value = newValue;
        setTestCases(newTestCases);
    };

    const isTypeUsedInTestCase = (testCaseIndex: number, inputIndex: number, type: string) => {
        return testCases[testCaseIndex].inputs.some((input, idx) =>
            idx !== inputIndex && input.type === type
        );
    }

    const InputTypeSelect = ({ testCaseIndex, inputIndex, currentType }: {
        testCaseIndex: number,
        inputIndex: number,
        currentType: string
    }) => (
        <Select
            value={currentType}
            onValueChange={(newType) => handleInputTypeChange(testCaseIndex, inputIndex, newType)}
            disabled={testCaseIndex !== 0}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Input Type" />
            </SelectTrigger>
            <SelectContent>
                {inputTypes.map(type => {
                    const isUsed = isTypeUsedInTestCase(testCaseIndex, inputIndex, type);
                    const isCurrentType = type === currentType;
                    return (
                        <SelectItem
                            key={type}
                            value={type}
                            disabled={!isCurrentType && isUsed}
                            className={!isCurrentType && isUsed ? "opacity-50 cursor-not-allowed" : ""}
                        >
                            {type} {!isCurrentType && isUsed && "(already used)"}
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );

    const handleAddTestCase = () => {
        // Copy the input structure from the first test case
        const inputStructure = testCases[0].inputs.map(input => ({
            id: Date.now() + Math.random(),
            type: input.type,
            value: ''
        }));

        setTestCases(prevTestCases => [
            ...prevTestCases,
            {
                id: Date.now(),
                inputs: inputStructure,
                output: {
                    type: testCases[0].output.type,  // Copy output type from first test case
                    value: ''
                }
            }
        ]);
    };

    const handleRemoveTestCase = (id: number) => {
        setTestCases(prevTestCases =>
            prevTestCases.filter(testCase => testCase.id !== id)
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
            testCases: [],
        },
    })

    const processInput = (input: string, format: string) => {
        const cleanedInput = cleanUpValues(input);

        const isValidNumber = (value: string) => !isNaN(Number(value));
        const isValidFloat = (value: string) => !isNaN(parseFloat(value));

        switch (format) {
            case 'arrayOfnum': {
                const values = cleanedInput.split(',');
                if (!values.every(isValidNumber)) {
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
                    return null;
                }
                return values.length === 1
                    ? Number(values[0])
                    : values.map(Number);
            }
            case 'float': {
                const values = cleanedInput.split(' ');
                if (!values.every(isValidFloat)) {
                    return null;
                }
                return values.length === 1
                    ? parseFloat(values[0])
                    : values.map(Number);
            }
            case 'str': {
                const values = cleanedInput.split(' ');
                return values.length === 1 ? values[0] : values;
            }
            case 'bool':
                if (cleanedInput === 'true' || cleanedInput === 'false') {
                    return cleanedInput === 'true';
                } else {
                    return null;
                }
            case 'jsonType': {
                try {
                    const parsed = JSON.parse(input);
                    outputObjectRef.current = parsed;
                    return parsed;
                } catch (e) {
                    console.error('JSON parsing failed:', e);
                    return null;
                }
            }

            default:
                return cleanedInput;
        }
    };

    const validateTestCasesBeforeSubmit = (testCases: any[]) => {
        const firstTestCase = testCases[0];

        // Validate each test case against the first test case
        for (let i = 1; i < testCases.length; i++) {
            const currentTestCase = testCases[i];

            // Check each input
            for (let j = 0; j < currentTestCase.inputs.length; j++) {
                const currentInput = currentTestCase.inputs[j];
                const firstCaseInput = firstTestCase.inputs[j];

                if (currentInput.type === 'jsonType') {
                    try {
                        const firstJson = JSON.parse(firstCaseInput.value);
                        const currentJson = JSON.parse(currentInput.value);

                        // Check if both are arrays
                        if (Array.isArray(firstJson) && Array.isArray(currentJson)) {
                            if (firstJson.length !== currentJson.length) {
                                toast({
                                    title: "JSON Array Size Mismatch",
                                    description: `Test case ${i + 1} JSON array should have ${firstJson.length} elements to match the first test case`,
                                    className: "fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50",
                                });
                                return false;
                            }
                        }
                    } catch (e) {
                        toast({
                            title: "Invalid JSON",
                            description: `Invalid JSON in test case ${i + 1}`,
                            className: "fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50",
                        });
                        return false;
                    }
                } else if (['int', 'str', 'float'].includes(currentInput.type)) {
                    const firstElements = firstCaseInput.value.trim().split(' ').filter(Boolean);
                    const currentElements = currentInput.value.trim().split(' ').filter(Boolean);

                    if (currentElements.length !== firstElements.length) {
                        toast({
                            title: "Input Size Mismatch",
                            description: `Test case ${i + 1} ${currentInput.type} input should have ${firstElements.length} elements to match the first test case`,
                            className: "fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50",
                        });
                        return false;
                    }
                } 
            }

            // Check output
            if (currentTestCase.output.type === 'jsonType') {
                try {
                    const firstJson = JSON.parse(firstTestCase.output.value);
                    const currentJson = JSON.parse(currentTestCase.output.value);

                    if (Array.isArray(firstJson) && Array.isArray(currentJson)) {
                        if (firstJson.length !== currentJson.length) {
                            toast({
                                title: "Output JSON Array Size Mismatch",
                                description: `Test case ${i + 1} output JSON array should have ${firstJson.length} elements to match the first test case`,
                                className: "fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50",
                            });
                            return false;
                        }
                    }
                } catch (e) {
                    toast({
                        title: "Invalid Output JSON",
                        description: `Invalid JSON in test case ${i + 1} output`,
                        className: "fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50",
                    });
                    return false;
                }
            } else if (['int', 'str', 'float'].includes(currentTestCase.output.type)) {
                const firstElements = firstTestCase.output.value.trim().split(' ').filter(Boolean);
                const currentElements = currentTestCase.output.value.trim().split(' ').filter(Boolean);

                if (currentElements.length !== firstElements.length) {
                    toast({
                        title: "Output Size Mismatch",
                        description: `Test case ${i + 1} output should have ${firstElements.length} elements to match the first test case`,
                        className: "fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50",
                    });
                    return false;
                }
            }
        }

        return true;
    };

        const validateOutputValue = (value: string, type: string): boolean => {
        switch (type) {
            case 'int': {
                if (value.includes(' ')) {
                    toast({
                        title: "Invalid Output Format",
                        description: "You can only add one integer as output",
                        className: "fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50",
                    });
                    return false;
                }
                if (!Number.isInteger(Number(value)) && value !== '') {
                    toast({
                        title: "Invalid Integer Output",
                        description: "Please enter a valid integer value",
                        className: "fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50",
                    });
                    return false;
                }
                break;
            }
            case 'float': {
                if (value.includes(' ')) {
                    toast({
                        title: "Invalid Output Format",
                        description: "You can only add one float number as output",
                        className: "fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50",
                    });
                    return false;
                }
                if (isNaN(Number(value)) && value !== '') {
                    toast({
                        title: "Invalid Float Output",
                        description: "Please enter a valid float value",
                        className: "fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50",
                    });
                    return false;
                }
                break;
            }
            case 'str': {
                if (value.includes(' ')) {
                    toast({
                        title: "Invalid Output Format",
                        description: "You can only add one string as output",
                        className: "fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50",
                    });
                    return false;
                }
                break;
            }
        }
        return true;
    };

    const handleSubmit = (values: z.infer<typeof formSchema>) => {

          // First validate test cases
          if (!validateTestCasesBeforeSubmit(testCases)) {
            return; // Stop submission if validation fails
        }

        const formattedData = {
            title: values.title,
            description: values.problemStatement,
            difficulty: values.difficulty,
            tagId: values.topics,
            constraints: values.constraints,
            testCases: testCases.map(testCase => {
                let parameterNameCounter = 0;

                // Group JSON inputs together
                const jsonInputs = testCase.inputs
                    .filter(input => input.type === 'jsonType')
                    .map(input => {
                        try {
                            return JSON.parse(input.value);
                        } catch (e) {
                            console.error('JSON parsing failed:', e);
                            return null;
                        }
                    })
                    .filter(Boolean);

                // Process non-JSON inputs
                const otherInputs = testCase.inputs
                    .filter(input => input.type !== 'jsonType')
                    .flatMap(input => {
                        const processedValue = processInput(input.value, input.type);

                        if (processedValue === null) {
                            console.error('Processing returned null for:', input);
                            return [];
                        }

                        if (input.type === 'arrayOfnum' || input.type === 'arrayOfStr') {
                            return [{
                                parameterType: input.type,
                                parameterValue: processedValue,
                                parameterName: String.fromCharCode(97 + parameterNameCounter++)
                            }];
                        }

                        const values = Array.isArray(processedValue) ? processedValue : [processedValue];
                        return values.map(value => ({
                            parameterType: input.type,
                            parameterValue: value,
                            parameterName: String.fromCharCode(97 + parameterNameCounter++)
                        }));
                    });

                // Combine all inputs
                const finalInputs = jsonInputs.length > 0
                    ? [
                        {
                            parameterType: 'jsonType',
                            parameterValue: jsonInputs.length === 1 ? jsonInputs[0] : jsonInputs,
                            parameterName: String.fromCharCode(97 + parameterNameCounter++)
                        },
                        ...otherInputs
                    ]
                    : otherInputs;

                // Process output
                let processedOutput;
                if (testCase.output.type === 'jsonType') {
                    try {
                        processedOutput = JSON.parse(testCase.output.value);
                    } catch (e) {
                        console.error('Output JSON parsing failed:', e);
                        return null;
                    }
                } else {
                    // Process array types specifically
                    if (testCase.output.type === 'arrayOfnum' || testCase.output.type === 'arrayOfStr') {
                        processedOutput = testCase.output.value.split(',').map(item => {
                            const trimmedItem = item.trim();
                            return testCase.output.type === 'arrayOfnum' ? Number(trimmedItem) : trimmedItem;
                        });
                    } else {
                        processedOutput = processInput(testCase.output.value, testCase.output.type);
                    }
                }

                return {
                    inputs: finalInputs,
                    expectedOutput: {
                        parameterType: testCase.output.type,
                        parameterValue: processedOutput
                    },
                };
            }).filter(Boolean),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            content: {},
        };

        // if (formattedData.testCases.some((tc: any) => tc.inputs.length === 0 || formattedData.testCases.length < 3 || formattedData.testCases.length > 20))

        if (formattedData.testCases.some((tc: any) => tc.inputs.length === 0)) {
            toast({
                title: 'Test Cases Required',
                description: 'Add minimum 3 valid test cases or maximum of 20 valid test cases with proper input and output values.',
                className: 'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            });
            return;
        }

        createCodingQuestion(formattedData)
        filteredCodingQuestions(
            setCodingQuestions,
            offset,
            position,
            difficulty,
            selectedOptions
        )
    }

    async function createCodingQuestion(data: any) {
        try {
            const response = await api.post(`codingPlatform/create-question`, data)

            toast({
                title: 'Success',
                description: 'Question Created Successfully',
                className: 'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })
            setIsDialogOpen(false)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'An error occurred',
                className: 'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }


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
                                            (tag: any) => tag?.tagName === value
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
                                                value={tag?.tagName}
                                            >
                                                {tag?.tagName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="text-left">
                        <FormLabel className=''>Test Cases</FormLabel>
                        {testCases.map((testCase, testCaseIndex) => (
                            <div key={testCase.id} className="my-4 p-3 border rounded border-green-100 bg-green-50">
                                {/* Input Section */}
                                <div className="mb-4">
                                    <h2 className='text-sm font-semibold mb-2'>Input</h2>
                                    <div className="space-y-2">
                                        {testCase.inputs.map((input, inputIndex) => (
                                            <div key={input.id} className="flex items-center gap-2">
                                                <InputTypeSelect
                                                    testCaseIndex={testCaseIndex}
                                                    inputIndex={inputIndex}
                                                    currentType={input.type}
                                                />

                                                <Input
                                                    placeholder={`Input ${inputIndex + 1}`}
                                                    value={input.value}
                                                    onChange={(e) => handleInputChange(e, testCaseIndex, inputIndex, testCases, setTestCases)}
                                                    className={input.type === 'jsonType' ? 'hidden' : ''} // Hide regular input for JSON type
                                                />
                                                {input.type === 'jsonType' && (
                                                    <Textarea
                                                        placeholder={`Input ${inputIndex + 1} (JSON)`}
                                                        value={input.value}
                                                        onChange={(e) => handleInputChange(e, testCaseIndex, inputIndex, testCases, setTestCases)}
                                                        className="mt-2"
                                                    />
                                                )}

                                                {testCase.inputs.length > 1 && testCaseIndex === 0 && (
                                                    <X
                                                        className="cursor-pointer"
                                                        onClick={() => {
                                                            if (testCaseIndex === 0) {
                                                                const newTestCases = testCases.map(tc => ({
                                                                    ...tc,
                                                                    inputs: tc.inputs.filter((_, idx) => idx !== inputIndex)
                                                                }));
                                                                setTestCases(newTestCases);
                                                            } else {
                                                                handleRemoveInput(testCase.id, input.id);
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                        {testCaseIndex === 0 && (
                                            <Button
                                                variant="outline"
                                                type="button"
                                                onClick={() => handleAddInputType(testCase.id)}
                                                className="mt-2"
                                                disabled={testCase.inputs.length >= inputTypes.length}
                                            >
                                                <Plus size={16} className="mr-2" />
                                                Add Input
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Output Section */}
                                <div>
                                    <h2 className='text-sm font-semibold mb-2'>Output</h2>
                                    <div className="flex items-center gap-2">
                                        <Select
                                            value={testCase.output.type}
                                            onValueChange={(newType) => {
                                                if (testCaseIndex === 0) {
                                                    const newTestCases = testCases.map(tc => ({
                                                        ...tc,
                                                        output: { ...tc.output, type: newType, value: '' }
                                                    }));
                                                    setTestCases(newTestCases);
                                                }
                                            }}
                                            disabled={testCaseIndex !== 0}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Output Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {outputTypes.map(type => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        {testCase.output.type === 'jsonType' ? (
                                            <Textarea
                                                placeholder="Output (JSON)"
                                                value={testCase.output.value}
                                                onChange={(e) => {
                                                    const newValue = e.target.value;
                                                    if (!validateFieldValue(newValue, testCase.output.type)) {
                                                        return;
                                                    }
                                                    const newTestCases = [...testCases];
                                                    newTestCases[testCaseIndex].output.value = newValue;
                                                    setTestCases(newTestCases);
                                                }}
                                                className="flex-grow"
                                            />
                                        ) : (
                                            <Input
                                                placeholder="Output"
                                                value={testCase.output.value}
                                                onChange={(e) => {
                                                    const newValue = e.target.value;
                                                    // First check if it's a single value type (int, float, str)
                                                    if (['int', 'float', 'str'].includes(testCase.output.type)) {
                                                        if (!validateOutputValue(newValue, testCase.output.type)) {
                                                            return;
                                                        }
                                                    }
                                                    // Then check the general format
                                                    else if (!validateFieldValue(newValue, testCase.output.type)) {
                                                        return;
                                                    }
                                                    const newTestCases = [...testCases];
                                                    newTestCases[testCaseIndex].output.value = newValue;
                                                    setTestCases(newTestCases);
                                                }}
                                                className="flex-grow"
                                            />
                                        )}
                                    </div>
                                </div>

                                {testCases.length > 1 && (
                                    <Button
                                        variant="ghost"
                                        className="mt-4 text-destructive hover:text-destructive"
                                        onClick={() => handleRemoveTestCase(testCase.id)}
                                    >
                                        <X size={16} className="mr-2" />
                                        Remove Test Case
                                    </Button>
                                )}
                            </div>
                        ))}

                        <Button
                            variant="outline"
                            type="button"
                            className="mt-2"
                            onClick={handleAddTestCase}
                        >
                            <Plus size={20} className="mr-2" />
                            Add Test Case
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