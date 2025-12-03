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
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectContentWithScrollArea,
    SelectItem,
    Select,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, X } from 'lucide-react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import {
    getcodingQuestionState,
    getCodingQuestionTags,
    getEditCodingQuestionDialogs,
} from '@/store/store'
import {
    cleanUpValues,
    getAllCodingQuestions,
    getPlaceholder,
    showSyntaxErrors,
} from '@/utils/admin'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { create } from 'domain'
import {
    TestCaseInput,
    TestCases,
} from '@/app/[admin]/resource/_components/adminResourceComponentType'
import { Input as PostcssInput } from 'postcss'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEditCodingQuestion } from '@/hooks/useEditCodingQuestion'

const noSpecialCharacters = /^[a-zA-Z0-9\s]*$/

const inputTypes = [
    'str',
    'int',
    'float',
    'arrayOfnum',
    'arrayOfStr',
    'bool',
    'jsonType',
] as const
const outputTypes = [
    'str',
    'int',
    'float',
    'arrayOfnum',
    'arrayOfStr',
    'bool',
    'jsonType',
] as const

function formatFloat(num: string | number): string {
    num = parseFloat(num as string)
    return num % 1 === 0 ? num.toFixed(1) : num.toString()
}

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
                    value: z.string(),
                })
            ),
            output: z.object({
                type: z.enum(outputTypes),
                value: z.string(),
            }),
        })
    ),
})

export default function EditCodingQuestionForm() {
    const [testCases, setTestCases] = useState([
        {
            id: 1,
            inputs: [{ id: Date.now(), type: 'int', value: '' }],
            output: { type: 'int', value: '' },
        },
    ])

    let outputObjectRef = useRef('' as any)

    // Use the hook
    const { editQuestion, loading, error } = useEditCodingQuestion()

    const [hasSyntaxErrors, setHasSyntaxErrors] = useState(false)
    const [activeTab, setActiveTab] = useState('details')

    // Shared validation function for both inputs and outputs
    const validateFieldValue = (value: string, type: string) => {
        switch (type) {
            case 'arrayOfStr':
            case 'arrayOfnum': {
                break
            }
            case 'str': {
                // Allow strings with spaces, treat the entire input as a single string
                break
            }
            case 'int': {
                if (!Number.isInteger(Number(value)) && value !== '') {
                    toast.error({
                        title: 'Invalid Integer Input',
                        description: 'Please enter a valid integer value',
                    })
                    return false
                }
                break
            }
            case 'float': {
                if (isNaN(Number(value)) && value !== '') {
                    toast.error({
                        title: 'Invalid Float Input',
                        description: 'Please enter a valid float value',
                    })
                    return false
                }
                break
            }
            case 'bool': {
                if (
                    value &&
                    !/^(true|false)$/.test(value) &&
                    !/^(t(r(u(e)?)?)?|f(a(l(s(e)?)?)?)?)$/.test(value)
                ) {
                    toast.error({
                        title: 'Invalid Boolean Input',
                        description: "Please enter either 'true' or 'false'",
                    })
                    return false
                }
                break
            }
        }
        return true
    }

    const validateOutputValue = (value: string, type: string): boolean => {
        switch (type) {
            case 'int': {
                if (value.includes(' ')) {
                    toast.error({
                        title: 'Invalid Output Format',
                        description: 'You can only add one integer as output',
                    })
                    return false
                }
                if (!Number.isInteger(Number(value)) && value !== '') {
                    toast.error({
                        title: 'Invalid Integer Output',
                        description: 'Please enter a valid integer value',
                    })
                    return false
                }
                break
            }
            case 'float': {
                if (value.includes(' ')) {
                    toast.error({
                        title: 'Invalid Output Format',
                        description:
                            'You can only add one float number as output',
                    })
                    return false
                }
                if (isNaN(Number(value)) && value !== '') {
                    toast.error({
                        title: 'Invalid Float Output',
                        description: 'Please enter a valid float value',
                        className:
                            'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                    })
                    return false
                }
                break
            }
            // case 'str': {
            //     if (value.includes(' ')) {
            //         toast.error({
            //             title: "Invalid Output Format",
            //             description: "You can only add one string as output",
            //             className: "fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50",
            //         });
            //         return false;
            //     }
            //     break;
            // }
        }
        return true
    }

    const handleInputChange = (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>,
        testCaseIndex: number,
        inputIndex: number,
        testCases: any[],
        setTestCases: React.Dispatch<React.SetStateAction<any[]>>
    ) => {
        const newValue = e.target.value
        const inputType = testCases[testCaseIndex].inputs[inputIndex].type

        // Only validate the format, not the size
        if (!validateFieldValue(newValue, inputType)) {
            return
        }

        const newTestCases = [...testCases]
        newTestCases[testCaseIndex].inputs[inputIndex].value = newValue
        setTestCases(newTestCases)
    }

    const isTypeUsedInTestCase = (
        testCaseIndex: number,
        inputIndex: number,
        type: string
    ) => {
        return testCases[testCaseIndex].inputs.some(
            (input, idx) => idx !== inputIndex && input.type === type
        )
    }

    const getAvailableInputTypes = (testCaseIndex: number) => {
        const usedTypes = testCases[testCaseIndex].inputs.map(
            (input) => input.type
        )
        return inputTypes.filter((type) => !usedTypes.includes(type))
    }

    const handleAddInputType = (testCaseId: number) => {
        // Only allow adding inputs to the first test case
        if (testCaseId !== testCases[0].id) return

        const availableTypes = getAvailableInputTypes(0) // Get all input types
        if (availableTypes.length === 0) {
            toast.error({
                title: 'Cannot Add Input',
                description:
                    'All input types have been used in this test case.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
            return
        }

        // Create new input for first test case and propagate to all test cases
        const newInput = { id: Date.now(), type: availableTypes[0], value: '' }
        setTestCases((prevTestCases) =>
            prevTestCases.map((testCase) => ({
                ...testCase,
                inputs: [
                    ...testCase.inputs,
                    { ...newInput, id: Date.now() + Math.random() },
                ],
            }))
        )
    }

    const handleRemoveInput = (testCaseId: number, inputIndex: number) => {
        // Only allow removing inputs from the first test case
        if (testCaseId !== testCases[0].id) return

        // Remove the input at the specified index from all test cases
        setTestCases((prevTestCases) =>
            prevTestCases.map((testCase) => ({
                ...testCase,
                inputs: testCase.inputs.filter((_, idx) => idx !== inputIndex),
            }))
        )
    }

    const handleInputTypeChange = (
        testCaseIndex: number,
        inputIndex: number,
        newType: string
    ) => {
        if (testCaseIndex === 0) {
            // For the first test case, update all test cases to maintain consistency
            const newTestCases = testCases.map((tc) => ({
                ...tc,
                inputs: tc.inputs.map((inp, idx) =>
                    idx === inputIndex
                        ? { ...inp, type: newType, value: '' }
                        : inp
                ),
            }))
            setTestCases(newTestCases)
        }
    }

    const { tags } = getCodingQuestionTags()
    const { editCodingQuestionId, isQuestionUsed } =
        getEditCodingQuestionDialogs()

    const {
        setEditCodingQuestionId,
        isCodingEditDialogOpen,
        setIsCodingEditDialogOpen,
    } = getEditCodingQuestionDialogs()

    const { codingQuestions, setCodingQuestions } = getcodingQuestionState()

    let selectCodingQuestion = codingQuestions.filter((question: any) => {
        return question.id === editCodingQuestionId
    })

    const InputTypeSelect = ({
        testCaseIndex,
        inputIndex,
        currentType,
    }: {
        testCaseIndex: number
        inputIndex: number
        currentType: string
    }) => (
        <Select
            value={currentType}
            onValueChange={(newType) =>
                handleInputTypeChange(testCaseIndex, inputIndex, newType)
            }
            disabled={testCaseIndex !== 0}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Input Type" />
            </SelectTrigger>
            <SelectContent>
                {inputTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                        {type}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )

    const handleAddTestCase = () => {
        setTestCases((prevTestCases) => {
            if (prevTestCases.length === 0) {
                // If no test case exists, add a default one
                return [
                    {
                        id: Date.now(),
                        inputs: [{ id: Date.now(), type: 'int', value: '' }], // Default input
                        output: { type: 'int', value: '' }, // Default output
                    },
                ]
            }

            // Copy input fields from the first test case
            const firstTestCase = prevTestCases[0]
            const newTestCase = {
                id: Date.now(),
                inputs: firstTestCase.inputs.map((input) => ({
                    id: Date.now() + Math.random(), // Unique ID
                    type: input.type,
                    value: input.type === 'jsonType' ? '' : '', // Initialize JSON inputs with empty string
                })),
                output: {
                    type: firstTestCase.output.type,
                    value: '',
                },
            }

            return [...prevTestCases, newTestCase]
        })
    }

    const handleRemoveTestCase = (id: number) => {
        setTestCases((prevTestCases) =>
            prevTestCases.filter((testCase) => testCase.id !== id)
        )
    }

    const processInput = (input: string, format: string) => {
        // Handle empty input cases first with appropriate defaults
        if (!input || input.trim() === '') {
            switch (format) {
                case 'arrayOfnum':
                case 'arrayOfStr':
                    return []
                case 'int':
                    return 0
                case 'float':
                    return 0.0
                case 'str':
                    return ''
                case 'bool':
                    return false
                case 'jsonType':
                    // We'll determine this later based on context
                    return null
                default:
                    return ''
            }
        }

        const cleanedInput = cleanUpValues(input)

        const isValidNumber = (value: string) => !isNaN(Number(value))
        const isValidFloat = (value: string) => !isNaN(parseFloat(value))

        switch (format) {
            case 'arrayOfnum': {
                const values = JSON.parse(input)
                if (!values.every(isValidNumber)) {
                    return null
                }
                return values.map(Number)
            }
            case 'arrayOfStr': {
                try {
                    // Try to parse the JSON string
                    return JSON.parse(input)
                } catch (e) {
                    console.error(
                        'Invalid JSON format for arrayOfStr:',
                        input,
                        e
                    )
                    return []
                }
            }
            case 'int': {
                const values = cleanedInput.split(' ')
                if (!values.every(isValidNumber)) {
                    return null
                }
                return values.length === 1
                    ? Number(values[0])
                    : values.map(Number)
            }
            case 'float': {
                const values = cleanedInput.split(' ')
                if (!values.every(isValidFloat)) {
                    return null
                }
                return values.length === 1
                    ? parseFloat(values[0])
                    : values.map(Number)
            }
            case 'str': {
                // Treat the entire input as a single string, even if it contains spaces
                return cleanedInput
            }
            case 'bool': {
                if (cleanedInput === 'true' || cleanedInput === 'false') {
                    return cleanedInput === 'true'
                } else {
                    return false // Default to false for invalid booleans
                }
            }
            case 'jsonType': {
                try {
                    const parsed = JSON.parse(input)
                    outputObjectRef.current = parsed
                    return parsed
                } catch (e) {
                    console.error('JSON parsing failed:', e)
                    return null
                }
            }
            default:
                return cleanedInput
        }
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: selectCodingQuestion[0]?.title || '',
            problemStatement: selectCodingQuestion[0]?.description || '',
            constraints: selectCodingQuestion[0]?.constraints || '',
            difficulty: selectCodingQuestion[0]?.difficulty || 'Easy',
            topics: selectCodingQuestion[0]?.tagId,
            testCases:
                selectCodingQuestion[0]?.testCases?.map((testCase: any) => ({
                    id: testCase.id, // Ensure this is correctly mapped
                    input: JSON.stringify(
                        testCase.inputs.map((input: TestCaseInput) =>
                            String(input.parameterValue)
                        )
                    ),
                    output: JSON.stringify(
                        testCase.expectedOutput.parameterValue
                    ),
                    isExisting: true, // Mark existing test cases
                })) || [],
        },
    })

    useEffect(() => {
        if (selectCodingQuestion.length > 0) {
            const question = selectCodingQuestion[0]

            const mappedTestCases = question.testCases.map(
                (testCase: TestCases) => ({
                    id: testCase.id,
                    inputs: testCase.inputs.map((input: TestCaseInput) => ({
                        id: Date.now() + Math.random(),
                        type: input.parameterType,
                        value:
                            input.parameterType === 'jsonType'
                                ? JSON.stringify(input.parameterValue, null, 2)
                                : input.parameterType === 'arrayOfnum' ||
                                  input.parameterType === 'arrayOfStr'
                                ? Array.isArray(input.parameterValue)
                                    ? JSON.stringify(input.parameterValue) // This preserves quotes around strings
                                    : String(input.parameterValue)
                                : String(input.parameterValue),
                    })),
                    output: {
                        type: testCase.expectedOutput.parameterType,
                        value:
                            testCase.expectedOutput.parameterType === 'jsonType'
                                ? JSON.stringify(
                                      testCase.expectedOutput.parameterValue,
                                      null,
                                      2
                                  )
                                : testCase.expectedOutput.parameterType ===
                                      'arrayOfnum' ||
                                  testCase.expectedOutput.parameterType ===
                                      'arrayOfStr'
                                ? Array.isArray(
                                      testCase.expectedOutput.parameterValue
                                  )
                                    ? JSON.stringify(
                                          testCase.expectedOutput.parameterValue
                                      )
                                    : String(
                                          testCase.expectedOutput.parameterValue
                                      )
                                : String(
                                      testCase.expectedOutput.parameterValue
                                  ),
                    },
                })
            )

            setTestCases(mappedTestCases)
            form.reset({
                title: question.title,
                problemStatement: question.description,
                constraints: question.constraints,
                difficulty: question.difficulty,
                topics: question.tagId,
                testCases: mappedTestCases,
            })
        }
    }, [])

    const handleEditSubmit = async (values: z.infer<typeof formSchema>) => {
        let hasErrors = showSyntaxErrors(testCases)

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
            testCases: testCases
                .map((testCase: any) => {
                    let parameterNameCounter = 0

                    // Group JSON inputs together
                    const jsonInputs = testCase.inputs
                        .filter(
                            (input: TestCaseInput) => input.type === 'jsonType'
                        )
                        .map((input: TestCaseInput) => {
                            try {
                                return JSON.parse(input.value)
                            } catch (e) {
                                console.error('JSON parsing failed:', e)
                                return null
                            }
                        })
                        .filter(Boolean)

                    // Process non-JSON inputs
                    const otherInputs = testCase.inputs
                        .filter(
                            (input: TestCaseInput) => input.type !== 'jsonType'
                        )
                        .flatMap((input: TestCaseInput) => {
                            const processedValue = processInput(
                                input.value,
                                input.type
                            )

                            if (processedValue === null) {
                                // For null values (invalid inputs), use appropriate defaults
                                const defaultValue =
                                    input.type === 'arrayOfnum' ||
                                    input.type === 'arrayOfStr'
                                        ? []
                                        : input.type === 'int'
                                        ? 0
                                        : input.type === 'float'
                                        ? 0.0
                                        : input.type === 'str'
                                        ? ''
                                        : false

                                return [
                                    {
                                        parameterType: input.type,
                                        parameterValue: defaultValue,
                                        parameterName: String.fromCharCode(
                                            97 + parameterNameCounter++
                                        ),
                                    },
                                ]
                            }

                            if (
                                input.type === 'arrayOfnum' ||
                                input.type === 'arrayOfStr'
                            ) {
                                return [
                                    {
                                        parameterType: input.type,
                                        parameterValue: processedValue,
                                        parameterName: String.fromCharCode(
                                            97 + parameterNameCounter++
                                        ),
                                    },
                                ]
                            } else if (input.type === 'float') {
                                return [
                                    {
                                        parameterType: input.type,
                                        parameterValue:
                                            formatFloat(processedValue),
                                        parameterName: String.fromCharCode(
                                            97 + parameterNameCounter++
                                        ),
                                    },
                                ]
                            }

                            const values = Array.isArray(processedValue)
                                ? processedValue
                                : [processedValue]
                            return values.map((value) => ({
                                parameterType: input.type,
                                parameterValue: value,
                                parameterName: String.fromCharCode(
                                    97 + parameterNameCounter++
                                ),
                            }))
                        })

                    // Combine all inputs
                    const finalInputs =
                        jsonInputs.length > 0
                            ? [
                                  {
                                      parameterType: 'jsonType',
                                      parameterValue:
                                          jsonInputs.length === 1
                                              ? jsonInputs[0]
                                              : jsonInputs,
                                      parameterName: String.fromCharCode(
                                          97 + parameterNameCounter++
                                      ),
                                  },
                                  ...otherInputs,
                              ]
                            : otherInputs

                    // Process output
                    let processedOutput
                    if (testCase.output.type === 'jsonType') {
                        try {
                            processedOutput = JSON.parse(testCase.output.value)
                        } catch (e) {
                            console.error('Output JSON parsing failed:', e)
                            return null
                        }
                    } else if (testCase.output.type === 'float') {
                        processedOutput = formatFloat(testCase.output.value)
                    } else if (
                        testCase.output.type === 'arrayOfnum' ||
                        testCase.output.type === 'arrayOfStr'
                    ) {
                        if (
                            !testCase.output.value ||
                            testCase.output.value.trim() === ''
                        ) {
                            processedOutput = []
                        } else {
                            try {
                                processedOutput = JSON.parse(
                                    testCase.output.value
                                )
                            } catch (e) {
                                toast.error({
                                    title: 'Invalid Output Format',
                                    description:
                                        'Please enter a valid array format',
                                })
                                return null
                            }
                        }
                    } else {
                        processedOutput = processInput(
                            testCase.output.value,
                            testCase.output.type
                        )
                    }

                    return {
                        inputs: finalInputs,
                        expectedOutput: {
                            parameterType: testCase.output.type,
                            parameterValue: processedOutput,
                        },
                    }
                })
                .filter(Boolean),
            updatedAt: new Date().toISOString(),
            content: {},
        }

        // Final check to ensure all test cases are valid
        if (formattedData.testCases.length !== testCases.length) {
            toast.error({
                title: 'Invalid Test Cases',
                description:
                    'Some test cases contain invalid data. Please correct them before submitting.',
            })
            return
        }

        // Use hook instead of direct API call
        const success = await editQuestion(editCodingQuestionId, formattedData)

        if (success) {
            // Close dialog
            setIsCodingEditDialogOpen(false)

            // Refresh data
            getAllCodingQuestions(setCodingQuestions)
        }
        // Error case automatically handled by hook
    }

    return (
        <main className="flex flex-col p-3 w-full items-center text-foreground">
            {/* Remove this navigation:
            <div
                className="flex align-middle self-start text-[rgb(81,134,114)] cursor-pointer"
                onClick={() => setIsCodingEditDialogOpen(false)}
            >
                <p><ChevronLeft /></p>
                <p>Coding Problems</p>
            </div>
            */}

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleEditSubmit)}
                    className="w-full flex flex-col gap-4"
                >
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-2 bg-white">
                            <TabsTrigger
                              value="details"
                              className="
                                bg-white text-black
                                data-[state=active]:bg-primary
                                data-[state=active]:text-white
                              "
                            >
                              Details
                            </TabsTrigger>
                        
                            <TabsTrigger
                              value="testcases"
                              className="
                                bg-white text-black
                                data-[state=active]:bg-primary
                                data-[state=active]:text-white
                              "
                            >
                              Test Cases
                            </TabsTrigger>
                          </TabsList>

                        {/* Details Tab */}
                        <TabsContent value="details" className="space-y-4 mt-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
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
                                                className="min-h-[120px]"
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
                                                className="min-h-[100px]"
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
                                                <FormItem className="flex items-center space-x-1 space-y-0 ml-2">
                                                    <FormControl>
                                                        <RadioGroupItem
                                                            value="Easy"
                                                            className="text-primary border-primary"
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Easy
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-1 space-y-0 ml-2">
                                                    <FormControl>
                                                        <RadioGroupItem
                                                            value="Medium"
                                                            className="text-primary border-primary"
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Medium
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-1 space-y-0 ml-2">
                                                    <FormControl>
                                                        <RadioGroupItem
                                                            value="Hard"
                                                            className="text-primary border-primary"
                                                        />
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
                                                    (tag: any) =>
                                                        tag?.tagName === value
                                                )
                                                if (selectedTag) {
                                                    field.onChange(
                                                        selectedTag.id
                                                    )
                                                }
                                            }}
                                            value={
                                                tags.find(
                                                    (tag: any) =>
                                                        tag.id === field.value
                                                )?.tagName || ''
                                            }
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose Topic" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContentWithScrollArea>
                                                {tags.map((tag: any) => (
                                                    <SelectItem
                                                        key={tag.id}
                                                        value={tag?.tagName}
                                                    >
                                                        {tag?.tagName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContentWithScrollArea>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </TabsContent>

                        {/* Test Cases Tab */}
                        <TabsContent
                            value="testcases"
                            className="space-y-4 mt-6"
                        >
                            <div className="text-left">
                                <FormLabel className="text-lg font-semibold mb-4 block">
                                    Test Cases
                                </FormLabel>
                                {testCases.map((testCase, testCaseIndex) => (
                                    <div
                                        key={testCase.id}
                                        className="my-4 p-4 border rounded-lg border-green-100 bg-muted-light"
                                    >
                                        <h3 className="text-lg font-semibold mb-3 text-foreground">
                                            Test Case {testCaseIndex + 1}
                                        </h3>

                                        {/* Input Section */}
                                        <div className="mb-4">
                                            <h4 className="text-sm font-semibold mb-2">
                                                Input
                                            </h4>
                                            <div className="space-y-2">
                                                {testCase.inputs.map(
                                                    (input, inputIndex) => (
                                                        <div
                                                            key={input.id}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <InputTypeSelect
                                                                testCaseIndex={
                                                                    testCaseIndex
                                                                }
                                                                inputIndex={
                                                                    inputIndex
                                                                }
                                                                currentType={
                                                                    input.type
                                                                }
                                                            />

                                                            <Input
                                                                placeholder={getPlaceholder(
                                                                    input.type
                                                                )}
                                                                value={
                                                                    input.value
                                                                }
                                                                onChange={(e) =>
                                                                    handleInputChange(
                                                                        e,
                                                                        testCaseIndex,
                                                                        inputIndex,
                                                                        testCases,
                                                                        setTestCases
                                                                    )
                                                                }
                                                                className={
                                                                    input.type ===
                                                                    'jsonType'
                                                                        ? 'hidden'
                                                                        : ''
                                                                }
                                                            />
                                                            {input.type ===
                                                                'jsonType' && (
                                                                <Textarea
                                                                    required
                                                                    placeholder={`(Enter with brackets) - Object/ Array/ Array of Objects/ 2D Arrays.\nNote - Key should be in double quotes. Eg - {"Age": 25} or [{"Name": "John"}, {"Age": 25}] or {} or []`}
                                                                    value={
                                                                        input.value
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleInputChange(
                                                                            e,
                                                                            testCaseIndex,
                                                                            inputIndex,
                                                                            testCases,
                                                                            setTestCases
                                                                        )
                                                                    }
                                                                    className="mt-2 overflow-auto"
                                                                />
                                                            )}

                                                            {testCase.inputs
                                                                .length > 1 &&
                                                                testCaseIndex ===
                                                                    0 && (
                                                                    <X
                                                                        className="cursor-pointer text-red-500 hover:text-red-700"
                                                                        onClick={() => {
                                                                            if (
                                                                                testCaseIndex ===
                                                                                0
                                                                            ) {
                                                                                const newTestCases =
                                                                                    testCases.map(
                                                                                        (
                                                                                            tc
                                                                                        ) => ({
                                                                                            ...tc,
                                                                                            inputs: tc.inputs.filter(
                                                                                                (
                                                                                                    _,
                                                                                                    idx
                                                                                                ) =>
                                                                                                    idx !==
                                                                                                    inputIndex
                                                                                            ),
                                                                                        })
                                                                                    )
                                                                                setTestCases(
                                                                                    newTestCases
                                                                                )
                                                                            } else {
                                                                                handleRemoveInput(
                                                                                    testCase.id,
                                                                                    inputIndex
                                                                                )
                                                                            }
                                                                        }}
                                                                    />
                                                                )}
                                                        </div>
                                                    )
                                                )}
                                                {testCaseIndex === 0 && (
                                                    <Button
                                                        type="button"
                                                        onClick={() =>
                                                            handleAddInputType(
                                                                testCase.id
                                                            )
                                                        }
                                                        className="mt-2 text-gray-600 border border-input bg-background hover:border-[rgb(81,134,114)]"
                                                        disabled={
                                                            testCase.inputs
                                                                .length >=
                                                            inputTypes.length
                                                        }
                                                    >
                                                        <Plus
                                                            size={16}
                                                            className="mr-2"
                                                        />
                                                        Add Input
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Output Section */}
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2">
                                                Output
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <Select
                                                    value={testCase.output.type}
                                                    onValueChange={(
                                                        newType
                                                    ) => {
                                                        if (
                                                            testCaseIndex === 0
                                                        ) {
                                                            const newTestCases =
                                                                testCases.map(
                                                                    (tc) => ({
                                                                        ...tc,
                                                                        output: {
                                                                            ...tc.output,
                                                                            type: newType,
                                                                            value: '',
                                                                        },
                                                                    })
                                                                )
                                                            setTestCases(
                                                                newTestCases
                                                            )
                                                        }
                                                    }}
                                                    disabled={
                                                        testCaseIndex !== 0
                                                    }
                                                >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Output Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {outputTypes.map(
                                                            (type) => (
                                                                <SelectItem
                                                                    key={type}
                                                                    value={type}
                                                                >
                                                                    {type}
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>

                                                {testCase.output.type ===
                                                'jsonType' ? (
                                                    <Textarea
                                                        required
                                                        placeholder={`(Enter with brackets) - Object/ Array/ Array of Objects/ 2D Arrays.\nNote - Key should be in double quotes. Eg - {"Age": 25} or [{"Name": "John"}, {"Age": 25}] or {} or []`}
                                                        value={
                                                            testCase.output
                                                                .value
                                                        }
                                                        onChange={(e) => {
                                                            const newValue =
                                                                e.target.value
                                                            if (
                                                                !validateFieldValue(
                                                                    newValue,
                                                                    testCase
                                                                        .output
                                                                        .type
                                                                )
                                                            ) {
                                                                return
                                                            }
                                                            const newTestCases =
                                                                [...testCases]
                                                            newTestCases[
                                                                testCaseIndex
                                                            ].output.value =
                                                                newValue
                                                            setTestCases(
                                                                newTestCases
                                                            )
                                                        }}
                                                        className="flex-grow overflow-auto"
                                                    />
                                                ) : (
                                                    <Input
                                                        placeholder={getPlaceholder(
                                                            testCase.output.type
                                                        )}
                                                        value={
                                                            testCase.output
                                                                .value
                                                        }
                                                        onChange={(e) => {
                                                            const newValue =
                                                                e.target.value
                                                            if (
                                                                [
                                                                    'int',
                                                                    'float',
                                                                    'str',
                                                                ].includes(
                                                                    testCase
                                                                        .output
                                                                        .type
                                                                )
                                                            ) {
                                                                if (
                                                                    !validateOutputValue(
                                                                        newValue,
                                                                        testCase
                                                                            .output
                                                                            .type
                                                                    )
                                                                ) {
                                                                    return
                                                                }
                                                            } else if (
                                                                !validateFieldValue(
                                                                    newValue,
                                                                    testCase
                                                                        .output
                                                                        .type
                                                                )
                                                            ) {
                                                                return
                                                            }
                                                            const newTestCases =
                                                                [...testCases]
                                                            newTestCases[
                                                                testCaseIndex
                                                            ].output.value =
                                                                newValue
                                                            setTestCases(
                                                                newTestCases
                                                            )
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
                                                onClick={() =>
                                                    handleRemoveTestCase(
                                                        testCase.id
                                                    )
                                                }
                                            >
                                                <X size={16} className="mr-2" />
                                                Remove Test Case
                                            </Button>
                                        )}
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    className="mt-4 text-primary bg-background hover:bg-accent hover:text-accent-foreground"
                                    onClick={handleAddTestCase}
                                >
                                    <Plus size={20} className="mr-2" />
                                    Add Test Case
                                </Button>
                            </div>

                            {/* Navigation & Submit Buttons */}
                            <div className="flex justify-end pt-6 border-t">
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setIsCodingEditDialogOpen(false)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-primary hover:bg-primary-dark"
                                    >
                                        Update Question
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </form>
            </Form>
        </main>
    )
}
