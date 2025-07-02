'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Editor from '@monaco-editor/react'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'
import { b64EncodeUnicode, b64DecodeUnicode } from '@/utils/base64'
import { Button } from '@/components/ui/button'
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from '@/components/ui/resizable'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/ui/spinner'
import { ChevronLeft, Code, Play, Upload } from 'lucide-react'

interface Input {
    parameterName: string
    parameterType: string
    parameterValue: [] | {}
}

interface TestCase {
    inputs: Input[] | Record<string, unknown>
    expectedOutput: {
        parameterType: string
        parameterValue: [] | {}
    }
}

interface QuestionDetails {
    title: string
    description: string
    constraints?: string
    examples: any[]
    testCases: TestCase[]
    templates: Record<string, { template: string }>
}

const editorLanguages = [
    { lang: 'java', id: 96 },
    { lang: 'python', id: 100 },
    { lang: 'javascript', id: 102 },
]

const CodeEditorComponent = ({ questionId }: { questionId: string }) => {
    const router = useRouter()
    const { toast } = useToast()

    const [questionDetails, setQuestionDetails] =
        useState<QuestionDetails | null>(null)
    const [currentCode, setCurrentCode] = useState('')
    const [language, setLanguage] = useState('python')
    const [languageId, setLanguageId] = useState(100)
    const [loading, setLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [codeResult, setCodeResult] = useState<any[]>([])
    const [codeError, setCodeError] = useState('')

    const fetchQuestionDetails = useCallback(async () => {
        if (!questionId) return
        try {
            const response = await api.get(
                `/codingPlatform/get-coding-question/${questionId}`
            )
            setQuestionDetails(response.data.data)
            const initialTemplate =
                response.data.data?.templates?.[language]?.template
            if (initialTemplate) {
                setCurrentCode(b64DecodeUnicode(initialTemplate))
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch question details.',
                variant: 'destructive',
            })
        }
    }, [questionId, language, toast])

    useEffect(() => {
        fetchQuestionDetails()
    }, [fetchQuestionDetails])

    useEffect(() => {
        if (questionDetails?.templates?.[language]?.template) {
            setCurrentCode(
                b64DecodeUnicode(questionDetails.templates[language].template)
            )
        }
    }, [language, questionDetails])

    const handleLanguageChange = (lang: string) => {
        const selectedLang = editorLanguages.find((l) => l.lang === lang)
        if (selectedLang) {
            setLanguage(selectedLang.lang)
            setLanguageId(selectedLang.id)
        }
    }

    const formatValue = (value: any, type: string): string => {
        if (type === 'jsonType') {
            return JSON.stringify(value, null, 2)
        }

        if (Array.isArray(value)) {
            if (type === 'arrayOfNum') {
                return `[${value.join(', ')}]`
            }
            if (type === 'arrayOfStr') {
                return `[${value.map((v) => `"${v}"`).join(', ')}]`
            }
            return `[${value.join(', ')}]`
        }

        switch (type) {
            case 'int':
            case 'float':
                return value.toString()
            case 'str':
                return `"${value}"`
            default:
                return JSON.stringify(value)
        }
    }

    const handleSubmit = async (
        e: { preventDefault: () => void },
        action: 'run' | 'submit'
    ) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await api.post(
                `codingPlatform/practicecode/questionId=${questionId}?action=${action}`,
                {
                    languageId: languageId,
                    sourceCode: b64EncodeUnicode(currentCode),
                }
            )

            // Set the code result data
            setCodeResult(response.data.data)

            // Check if all test cases passed
            const allTestCasesPassed = response.data.data.every(
                (testCase: any) => testCase.status === 'Accepted'
            )

            if (action === 'submit') {
                setIsSubmitting(true)
                if (allTestCasesPassed) {
                    toast({
                        title: 'Success!',
                        description: 'Test Cases Passed, Solution submitted',
                    })
                } else {
                    toast({
                        title: 'Submitted',
                        description:
                            'Solution submitted but some test cases failed',
                        variant: 'destructive',
                    })
                }
            } else if (allTestCasesPassed && action === 'run') {
                toast({
                    title: 'Success',
                    description: 'Test Cases Passed',
                })
            } else {
                toast({
                    title: 'Failed',
                    description: 'Test Cases Failed',
                    variant: 'destructive',
                })
            }

            setCodeError('')
            setLoading(false)
        } catch (error: any) {
            setLoading(false)
            setCodeResult(error.response?.data?.data || [])
            toast({
                title: 'Failed',
                description:
                    error.response?.data?.message || 'Network connection lost.',
                variant: 'destructive',
            })
            setCodeError(
                error.response?.data?.data?.[0]?.stderr ||
                    'Error occurred during submission. Network connection lost.'
            )
        }
    }

    const handleBack = () => router.back()

    function handleEditorChange(value: any) {
        setCurrentCode(value || '')
    }

    if (!questionDetails) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-lg text-gray-500">Loading...</span>
            </div>
        )
    }

    console.log('questionDetails', questionDetails)

    return (
        <div className="min-h-screen bg-white">
            <div className="relative flex items-center justify-center p-2 border-b">
                {/* Left Icon */}
                <div className="absolute left-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. If you have not submitted your solution, it will be lost.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-red-500" onClick={handleBack}>
                                    Go Back
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                {/* Center Title */}
                <p className="text-[15px] font-bold text-[#1A1A1A] text-center">
                    {questionDetails.title}
                </p>
            </div>

            {questionDetails && (
                <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-73px)]">
                    <ResizablePanel defaultSize={40} className="bg-white">
                        <div className="h-full overflow-y-auto p-5 border-r border-gray-200">
                            <div className="max-w-[800px] mx-auto">
                                <div className="flex items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 text-xs bg-[#FFF3DC] text-[#664D03] rounded">Medium</span>
                                        <span className="px-2 py-1 text-xs bg-[#E7F1FF] text-[#084298] rounded">Arrays</span>
                                    </div>
                                </div>
                                <div className="bg-[#F8F9FA] border border-[#A0A0A0] rounded-lg p-6 text-start">
                                    <p className="text-[15px] leading-[1.2] text-[#1A1A1A] mb-6">
                                        {questionDetails.description}
                                    </p>
                                    <div className="space-y-4">
                                        {questionDetails.testCases?.slice(0, 1).map((testCase: TestCase, index: number) => (
                                            <div key={index}>
                                                <h3 className="text-sm font-medium text-[#1A1A1A] mb-2">Example:</h3>
                                                <div className="bg-white rounded p-3 text-sm">
                                                    <div className="mb-2">
                                                        <span className="text-[#666666]">Input: </span>
                                                        <code className="text-[#1A1A1A]">
                                                            {Array.isArray(testCase.inputs) 
                                                                ? testCase.inputs.map(input => formatValue(input.parameterValue, input.parameterType)).join(', ')
                                                                : Object.entries(testCase.inputs)
                                                                    .map(([key, value]) => `${key} = ${formatValue(value, typeof value === 'number' ? 'int' : 'str')}`)
                                                                    .join(', ')
                                                            }
                                                        </code>
                                                    </div>
                                                    <div>
                                                        <span className="text-[#666666]">Output: </span>
                                                        <code className="text-[#1A1A1A]">
                                                            {formatValue(testCase.expectedOutput.parameterValue, testCase.expectedOutput.parameterType)}
                                                        </code>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {questionDetails.constraints && (
                                            <div>
                                                <h3 className="text-sm font-medium text-[#1A1A1A] mb-2">Constraints:</h3>
                                                <ul className="list-disc pl-5 text-sm text-[#1A1A1A] space-y-1">
                                                    {questionDetails.constraints.split('\n').map((constraint, idx) => (
                                                        <li key={idx}>{constraint}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        <div>
                                            <h3 className="text-sm font-medium text-[#1A1A1A] mb-2">Function signature:</h3>
                                            <div className="bg-white rounded p-3">
                                                <code className="text-sm text-[#1A1A1A]">
                                                    function findPairs(nums, target) {'{'}
                                                    <br />
                                                    &nbsp;&nbsp;&nbsp;&nbsp;// Your code here
                                                    <br />
                                                    {'}'}
                                                </code>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    <ResizablePanel defaultSize={60}>
                        <ResizablePanelGroup direction="vertical">
                            <ResizablePanel defaultSize={70}>
                                <div className="h-full bg-white">
                                    <div className="flex gap-4 p-3 border-b">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[15px] text-[#1A1A1A] font-bold">Code Editor</span>
                                        </div>
                                        <Select
                                            value={language}
                                            onValueChange={handleLanguageChange}
                                        >
                                            <SelectTrigger className="w-[140px] h-8 bg-white border-gray-200 text-sm">
                                                <SelectValue placeholder="Select Language" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {editorLanguages.map((lang) => (
                                                    <SelectItem key={lang.id} value={lang.lang}>
                                                        {lang.lang}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Editor
                                        height="calc(100% - 57px)"
                                        language={language}
                                        theme="vs-light"
                                        value={currentCode}
                                        onChange={handleEditorChange}
                                        options={{
                                            wordWrap: 'on',
                                            minimap: { enabled: false },
                                            fontSize: 14,
                                            lineHeight: 21,
                                            padding: { top: 16, bottom: 16 },
                                            fontFamily: 'Menlo, Monaco, "Courier New", monospace'
                                        }}
                                    />
                                </div>
                            </ResizablePanel>

                            <ResizableHandle withHandle />

                            <div className="flex justify-between border-t p-3 bg-white">
                                <Button
                                    onClick={(e) => handleSubmit(e, 'run')}
                                    size="sm"
                                    className="bg-[#4169E1] hover:bg-[#4169E1]/90 text-white px-4"
                                    disabled={loading || isSubmitting}
                                >
                                    {loading ? <Spinner /> : <Play className="h-5 w-5" />}
                                    <span className="ml-2">Run Code</span>
                                </Button>
                                <Button
                                    onClick={(e) => handleSubmit(e, 'submit')}
                                    size="sm"
                                    className="bg-[#4169E1] hover:bg-[#4169E1]/90 text-white px-4"
                                    disabled={loading || isSubmitting}
                                >
                                    {loading ? <Spinner /> : <Upload className="h-5 w-5" />}
                                    <span className="ml-2">Submit</span>
                                </Button>
                            </div>

                            <ResizablePanel defaultSize={30}>
                                <div className="h-full bg-white border-t">
                                    <div className="flex items-center justify-between p-4 border-b">
                                        <span className="text-[15px] text-[#1A1A1A]">Output</span>
                                    </div>
                                    <div className="p-4 h-[calc(100%-57px)] overflow-y-auto font-mono text-sm">
                                        {loading ? (
                                            <div className="flex items-center justify-center h-full">
                                                <Spinner className="h-6 w-6 text-[#4169E1]" />
                                                <span className="ml-2 text-[#666666]">Running code...</span>
                                            </div>
                                        ) : (
                                            <div>
                                                {codeError && (
                                                    <div className="text-red-500 whitespace-pre-wrap">{codeError}</div>
                                                )}
                                                {!codeError && codeResult?.map((testCase: any, index: number) => (
                                                    <div key={index} className="mb-4 p-3 rounded border border-gray-200">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-[#1A1A1A]">Test Case {index + 1}:</span>
                                                            <span className={testCase.status === 'Accepted' ? 'text-green-600' : 'text-red-500'}>
                                                                {testCase.status}
                                                            </span>
                                                        </div>
                                                        {testCase.status !== 'Accepted' && (
                                                            <>
                                                                <div className="mb-2">
                                                                    <span className="text-[#666666]">Input:</span>
                                                                    <pre className="mt-1 text-[#1A1A1A] bg-[#F8F9FA] p-2 rounded">{testCase.stdIn || 'No input'}</pre>
                                                                </div>
                                                                <div className="mb-2">
                                                                    <span className="text-[#666666]">Your Output:</span>
                                                                    <pre className="mt-1 text-[#1A1A1A] bg-[#F8F9FA] p-2 rounded">{testCase.stdOut || 'No output'}</pre>
                                                                </div>
                                                                <div>
                                                                    <span className="text-[#666666]">Expected Output:</span>
                                                                    <pre className="mt-1 text-[#1A1A1A] bg-[#F8F9FA] p-2 rounded">{testCase.expectedOutput || 'No expected output'}</pre>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                </ResizablePanelGroup>
            )}
        </div>
    )
}

export default CodeEditorComponent
