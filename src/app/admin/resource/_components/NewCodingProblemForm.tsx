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
import { cleanUpValues, getPlaceholder, showSyntaxErrors } from '@/utils/admin'
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
        })
        .refine((value) => !/^\d/.test(value), {
            message: 'Title must not start with a number.',
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
                    value: z.string()
                })
            ),
            output: z.object({
                type: z.enum(outputTypes),
                value: z.string()
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

    const [hasSyntaxErrors, setHasSyntaxErrors] = useState(false);

    let outputObjectRef = useRef('' as any);

    function formatFloat(num: any) {
        num = parseFloat(num);
        return num % 1 === 0 ? num.toFixed(1) : num;
    }

    const getAvailableInputTypes = (testCaseIndex: number) => {
        const usedTypes = testCases[testCaseIndex].inputs.map(input => input.type);
        return inputTypes.filter(type => !usedTypes.includes(type));
    }

    const handleAddInputType = (testCaseId: number) => {
        // Only allow adding inputs to the first test case
        if (testCaseId !== testCases[0].id) return;

        const availableTypes = getAvailableInputTypes(0); // Get all input types

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

    // Shared validation function for both inputs and outputs
    const validateFieldValue = (value: string, type: string) => {
        switch (type) {
            case 'arrayOfStr':
            case 'arrayOfnum': {
                break;
            }
            case 'str': {
                break;
            }
            case 'int': {
                if (!Number.isInteger(Number(value)) && value !== '') {
                    toast({
                        title: "Invalid Integer Input",
                        description: "Please enter a valid integer value",
                        className: "fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50",
                    });
                    return false;
                }
                break;
            }
            case 'float': {
                if (isNaN(Number(value)) && value !== '') {
                    toast({
                        title: "Invalid Float Input",
                        description: "Please enter a valid float value",
                        className: "fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50",
                    });
                    return false;
                }
                break;
            }
            case 'bool': {
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


                        >
                            {type} {!isCurrentType && isUsed}
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
        // Handle empty input cases first with appropriate defaults
        if (!input || input.trim() === '') {
            switch (format) {
                case 'arrayOfnum':
                case 'arrayOfStr':
                    return [];
                case 'int':
                    return 0;
                case 'float':
                    return 0.0;
                case 'str':
                    return "";
                case 'bool':
                    return false;
                case 'jsonType':
                    return null;
                default:
                    return "";
            }
        }

        const cleanedInput = cleanUpValues(input);

        const isValidNumber = (value: string) => !isNaN(Number(value));
        const isValidFloat = (value: string) => !isNaN(parseFloat(value));

        switch (format) {
            case 'arrayOfnum': {
                const values = JSON.parse(input);
                if (!values.every(isValidNumber)) {
                    return null;
                }
                return values.map(Number);
            }
            case 'arrayOfStr': {
                return JSON.parse(input);
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
                // Treat the entire input as a single string, even if it contains spaces
                return cleanedInput;
            }
            case 'bool': {
                if (cleanedInput === 'true' || cleanedInput === 'false') {
                    return cleanedInput === 'true';
                } else {
                    return false; // Default to false for invalid booleans
                }
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
                        description: "You can only add one float value as output",
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
        }
        return true;
    };

    const handleSubmit = (values: z.infer<typeof formSchema>) => {

      let hasErrors =  showSyntaxErrors(testCases);

        // If there are validation errors, return early and don't submit
        if (hasErrors) {
            return
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
                            // For null values (invalid inputs), use appropriate defaults
                            const defaultValue = input.type === 'arrayOfnum' || input.type === 'arrayOfStr'
                                ? []
                                : input.type === 'int'
                                    ? 0
                                    : input.type === 'float'
                                        ? 0.0
                                        : input.type === 'str'
                                            ? ""
                                            : false;

                            return [{
                                parameterType: input.type,
                                parameterValue: defaultValue,
                                parameterName: String.fromCharCode(97 + parameterNameCounter++)
                            }];
                        }

                        if (input.type === 'arrayOfnum' || input.type === 'arrayOfStr') {
                            return [{
                                parameterType: input.type,
                                parameterValue: processedValue,
                                parameterName: String.fromCharCode(97 + parameterNameCounter++)
                            }];
                        } else if (input.type === 'float') {
                            return [{
                                parameterType: input.type,
                                parameterValue: formatFloat(processedValue),
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
                }
                else if (testCase.output.type === 'float') {
                    processedOutput = formatFloat(testCase.output.value);
                }
                else if (testCase.output.type === 'arrayOfnum' || testCase.output.type === 'arrayOfStr') {
                    if (!testCase.output.value || testCase.output.value.trim() === '') {
                        processedOutput = [];
                    } else {
                        try {
                            processedOutput = JSON.parse(testCase.output.value);
                        }
                        catch (e) {
                            console.error('JSON parsing failed:', e);
                            return null;
                        }
                    }
                } else {
                    processedOutput = processInput(testCase.output.value, testCase.output.type);
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

        // Final check to ensure all test cases are valid
        if (formattedData.testCases.length !== testCases.length) {
            toast({
                title: 'Invalid Test Cases',
                description: 'Some test cases contain invalid data. Please correct them before submitting.',
                className: 'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            });
            return;
        }

        createCodingQuestion(formattedData);
        filteredCodingQuestions(
            setCodingQuestions,
            offset,
            position,
            difficulty,
            selectedOptions
        );
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
                            <FormItem className="space-y-3 text-left">
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
                                                    placeholder={getPlaceholder(input.type)}
                                                    value={input.value}
                                                    onChange={(e) => handleInputChange(e, testCaseIndex, inputIndex, testCases, setTestCases)}
                                                    className={input.type === 'jsonType' ? 'hidden' : ''} // Hide regular input for JSON type
                                                />
                                                {input.type === 'jsonType' && (
                                                    <Textarea
                                                        required
                                                        placeholder={`(Enter with brackets) - Object/ Array/ Array of Objects/ 2D Arrays.\nNote - Key should be in double quotes. Eg - {"Age": 25} or [{"Name": "John"}, {"Age": 25}] or {} or []`}
                                                        value={input.value}
                                                        onChange={(e) => handleInputChange(e, testCaseIndex, inputIndex, testCases, setTestCases)}
                                                        className="mt-2 overflow-auto"
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
                                                required
                                                placeholder={`(Enter with brackets) - Object/ Array/ Array of Objects/ 2D Arrays.\nNote - Key should be in double quotes. Eg - {"Age": 25} or [{"Name": "John"}, {"Age": 25}] or {} or []`}
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
                                                className="flex-grow overflow-auto"
                                            />
                                        ) : (
                                            <Input
                                                placeholder={getPlaceholder(testCase.output.type)}
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