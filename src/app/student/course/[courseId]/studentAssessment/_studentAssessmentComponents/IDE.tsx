'use client'

import { Button } from '@/components/ui/button'

import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from '@/components/ui/resizable'
import { ChevronLeft, Code, Lock, Play, Upload, CheckCircle } from 'lucide-react'
import { useLazyLoadedStudentData } from '@/store/store'
import { api } from '@/utils/axios.config'
import Editor from '@monaco-editor/react'
import { ArrowLeft } from 'lucide-react'
import { useRouter, usePathname, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Spinner } from '@/components/ui/spinner'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { b64DecodeUnicode, b64EncodeUnicode } from '@/utils/base64'
import TimerDisplay from './TimerDisplay'
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
import { X } from 'lucide-react'
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

interface questionDetails {
    title: string
    description: string
    constraints?: string
    examples: { input: number[]; output: number }
}

interface IDEProps {
    params: { editor: string }
    onBack?: () => void
    remainingTime?: any
    assessmentSubmitId?: number
    selectedCodingOutsourseId?: number
    getAssessmentData?: any
    runCodeLanguageId?: number
    runSourceCode?: string
}

const IDE: React.FC<IDEProps> = ({
    params,
    onBack,
    remainingTime,
    assessmentSubmitId,
    selectedCodingOutsourseId,
    getAssessmentData,
    runCodeLanguageId,
    runSourceCode,
}) => {
    const pathname = usePathname()
    const router = useRouter()
    const { toast } = useToast()
    const { viewcourses, moduleID, chapterID } = useParams()
    const [questionDetails, setQuestionDetails] = useState<questionDetails>({
        title: '',
        description: '',
        examples: {
            input: [],
            output: 0,
        },
        constraints: '',
    })
    const [isDisabled, setIsDisabled] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [currentCode, setCurrentCode] = useState('')
    const [result, setResult] = useState('')
    const [codeResult, setCodeResult] = useState<any>([])
    const [languageId, setLanguageId] = useState(runCodeLanguageId)
    const [codeError, setCodeError] = useState('')

    const [testCases, setTestCases] = useState<any>([])
    const [templates, setTemplates] = useState<any>([])
    const [examples, setExamples] = useState<any>([])
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [modalType, setModalType] = useState<'success' | 'error'>('success')

    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id

    const editorLanguages = [
        { lang: 'java', id: 96 },
        { lang: 'python', id: 100 },
        { lang: 'javascript', id: 102 },
        // { lang: 'cpp', id: 105 },
        // { lang: 'c', id: 104 },
    ]

    const [language, setLanguage] = useState(
        runCodeLanguageId
            ? editorLanguages.find((lang) => lang.id === runCodeLanguageId)
                  ?.lang || ''
            : ''
    )

    const handleLanguageChange = (lang: string) => {
        setLanguage(lang)
        const langID = getDataFromField(editorLanguages, lang, 'lang', 'id')
        setLanguageId(langID)
    }

    const getDataFromField = (
        array: any[],
        searchValue: any,
        searchField: string | number,
        targetField: string | number
    ) => {
        let result = languageId
        array.forEach((obj) => {
            if (obj[searchField] === searchValue) {
                result = obj[targetField]
            }
        })
        return result
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
        action: string
    ) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await api.post(
                `/codingPlatform/practicecode/questionId=${params.editor}?action=${action}&submissionId=${assessmentSubmitId}&codingOutsourseId=${selectedCodingOutsourseId}`,
                {
                    languageId: Number(
                        getDataFromField(
                            editorLanguages,
                            languageId,
                            'lang',
                            'id'
                        )
                    ),
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
                setIsDisabled(true)
                setIsSubmitted(true)
                setIsOpen(true)

                // toast({
                //     title: 'You have submitted the question. You can go back and do other questions',
                //     className:
                //         'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-start border border-secondary max-w-sm px-6 py-5 box-border z-50',
                // })

                if (allTestCasesPassed) {
                    setModalType('success')
                    // toast({
                    //     title: `Test Cases Passed Solution submitted`,
                    //     className:
                    //         'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                    // })
                    getAssessmentData()

                    // if (onBack) {
                    //     onBack()
                    // }
                } else {
                    setModalType('error')
                }
            } else if (allTestCasesPassed && action === 'run') {
                toast.success({
                    title: 'Success',
                    description:'Test Cases Passed'
                })
            } else {
                toast({
                    title: 'Failed',
                    description:'Test Cases Failed'
                })
            }

            setCodeError('')

            // Trigger re-render for the output window
            setResult(
                response.data.data[0].stdOut ||
                    response.data.data[0].stdout ||
                    'No Output Available'
            )
            setLoading(false)

            const closeTimeout = setTimeout(() => {
                setIsOpen(false)
            }, 7000)
            return () => clearTimeout(closeTimeout)
        } catch (error: any) {
            setLoading(false)
            setCodeResult(error.response?.data?.data)
            toast.error({
                title: 'Failed',
                description:
                    error.response?.data?.message || 'Network connection lost.',
            })
            setCodeError(
                error.response?.data?.data?.[0]?.stderr || error.response?.data?.data?.[0]?.stdErr ||
                    'Error occurred during submission. Network connection lost.'
            )
        }
    }

    function handleEditorChange(value: any) {
        setCurrentCode(value)
    }

    const getQuestionDetails = async () => {
        try {
            await api
                .get(`codingPlatform/get-coding-question/${params.editor}`)
                .then((response) => {
                    setQuestionDetails(response?.data.data)

                    setTestCases(response?.data?.data?.testCases)

                    setTemplates(response?.data?.data?.templates)

                    setExamples(response?.data[0].examples)
                })
        } catch (error: any) {
            console.error('Error fetching courses:', error)
        }
    }

    useEffect(() => {
        getQuestionDetails()
    }, [language])

    useEffect(() => {
        if (templates?.[language]?.template) {
            setCurrentCode(b64DecodeUnicode(templates?.[language]?.template))
        }
    }, [language])

    useEffect(() => {
        if (runCodeLanguageId && runSourceCode) {
            const selectedLanguage = editorLanguages.find(
                (lang) => lang.id === runCodeLanguageId
            )
            if (selectedLanguage) {
                setLanguage(selectedLanguage.lang)
                setLanguageId(runCodeLanguageId)
                setCurrentCode(b64DecodeUnicode(runSourceCode))
            }
        }
    }, [runCodeLanguageId, runSourceCode])

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/5 to-accent-light/10">
            {/* Header Bar with Navigation and Actions */}
            <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-4dp">
                <div className="w-full px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Left: Back Button and Question Title */}
                        <div className="flex items-center space-x-4">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group bg-muted/50 hover:bg-muted px-3 py-2 rounded-lg">
                                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                                        <span className="font-medium">Back to Assessment</span>
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card border-border shadow-32dp">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-foreground">
                                            Are you absolutely sure?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-muted-foreground">
                                            This action cannot be undone. If you have not
                                            submitted your solution, it will be lost.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-muted hover:bg-muted-dark text-foreground border-border">
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive hover:bg-destructive-dark text-destructive-foreground"
                                            onClick={onBack}
                                        >
                                            Go Back
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            {questionDetails && (
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                                        <Code className="w-4 h-4 text-accent" />
                                    </div>
                                    <h1 className="text-xl font-bold text-foreground">
                                        {questionDetails.title}
                                    </h1>
                                </div>
                            )}
                        </div>

                        {/* Right: Timer and Action Buttons */}
                        <div className="flex items-center space-x-4">
                            <TimerDisplay remainingTime={remainingTime} />
                            <div className="flex items-center space-x-2">
                                <Button
                                    onClick={(e) => handleSubmit(e, 'run')}
                                    size="sm"
                                    variant="outline"
                                    className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                                    disabled={loading || isSubmitted}
                                >
                                    {loading ? <Spinner className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    <span className="ml-2 font-medium">Run Code</span>
                                </Button>
                                <Button
                                    onClick={(e) => handleSubmit(e, 'submit')}
                                    size="sm"
                                    className="bg-primary hover:bg-primary-dark text-primary-foreground"
                                    disabled={loading || isSubmitted}
                                >
                                    {loading ? <Spinner className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                                    <span className="ml-2 font-medium">Submit Solution</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success/Error Modal */}
            <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                <AlertDialogContent className="bg-card border-border shadow-32dp max-w-md">
                    <button
                        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors duration-200 p-1 rounded-lg hover:bg-muted"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <AlertDialogHeader className="text-center">
                        {modalType === 'success' ? (
                            <>
                                <div className="w-16 h-16 bg-success/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-success" />
                                </div>
                                <AlertDialogTitle className="text-success text-xl">
                                    🎉 Test Cases Passed!
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                    Great job! You have successfully submitted the question. You can
                                    go back and work on other questions.
                                </AlertDialogDescription>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-destructive/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <X className="w-8 h-8 text-destructive" />
                                </div>
                                <AlertDialogTitle className="text-destructive text-xl">
                                    ❌ Test Cases Failed
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                    Your solution didn't pass all test cases. You have submitted the question. You can
                                    go back and work on other questions.
                                </AlertDialogDescription>
                            </>
                        )}
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>

            {/* Main Content Area */}            {/* Main Content Area */}
            <div className="w-full" style={{ height: 'calc(100vh - 80px)' }}>
                {questionDetails && (
                    <ResizablePanelGroup
                        direction="horizontal"
                        className="w-full h-full"
                    >                        {/* Left Panel: Problem Description */}
                        <ResizablePanel defaultSize={50} minSize={25} maxSize={75}>
                            <div className="h-full bg-card border-r border-border">
                                <div className="h-full overflow-y-auto scrollbar-hide">
                                    <div className="p-6 space-y-6">
                                        {/* Problem Description */}
                                        <div>
                                            <div className="prose prose-neutral max-w-none">
                                                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                    {questionDetails.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Constraints */}
                                        {questionDetails.constraints && (
                                            <div className="bg-info-light border border-info/20 rounded-xl p-4">
                                                <h3 className="font-bold text-info-dark mb-2 flex items-center space-x-2">
                                                    <Code className="w-4 h-4" />
                                                    <span>Constraints</span>
                                                </h3>
                                                <p className="text-sm text-info-dark whitespace-pre-wrap">
                                                    {questionDetails.constraints}
                                                </p>
                                            </div>
                                        )}

                                        {/* Test Cases */}
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-foreground flex items-center space-x-2">
                                                <Play className="w-4 h-4 text-accent" />
                                                <span>Sample Test Cases</span>
                                            </h3>
                                            {testCases?.slice(0, 2).map((testCase: TestCase, index: number) => (
                                                <div
                                                    key={index}
                                                    className="bg-muted/30 border border-border rounded-xl p-4 space-y-3"
                                                >
                                                    <h4 className="font-semibold text-foreground">
                                                        Test Case {index + 1}
                                                    </h4>

                                                    <div className="space-y-2">
                                                        {/* Handle both array and object inputs */}
                                                        {Array.isArray(testCase.inputs)
                                                            ? testCase.inputs.map((input: Input, idx: number) => (
                                                                  <div key={idx} className="text-sm">
                                                                      <span className="font-medium text-muted-foreground">
                                                                          Input {idx + 1}:
                                                                      </span>
                                                                      <code className="ml-2 bg-muted px-2 py-1 rounded text-foreground font-mono">
                                                                          {formatValue(input.parameterValue, input.parameterType)}
                                                                      </code>
                                                                  </div>
                                                              ))
                                                            : Object.entries(testCase.inputs).map(([key, value], idx: number) => (
                                                                  <div key={key} className="text-sm">
                                                                      <span className="font-medium text-muted-foreground">
                                                                          {key}:
                                                                      </span>
                                                                      <code className="ml-2 bg-muted px-2 py-1 rounded text-foreground font-mono">
                                                                          {formatValue(value, typeof value === 'number' ? 'int' : 'str')}
                                                                      </code>
                                                                  </div>
                                                              ))}

                                                        <div className="text-sm">
                                                            <span className="font-medium text-muted-foreground">
                                                                Expected Output:
                                                            </span>
                                                            <code className="ml-2 bg-success/20 text-success px-2 py-1 rounded font-mono">
                                                                {formatValue(
                                                                    testCase.expectedOutput.parameterValue,
                                                                    testCase.expectedOutput.parameterType
                                                                )}
                                                            </code>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ResizablePanel>

                        <ResizableHandle withHandle />                        {/* Right Panel: Code Editor and Output */}
                        <ResizablePanel defaultSize={50}>
                            <ResizablePanelGroup direction="vertical">
                                {/* Code Editor Panel */}
                                <ResizablePanel defaultSize={65} minSize={30}>
                                    <div className="h-full bg-card">
                                        {/* Editor Header */}
                                        <div className="bg-card-elevated border-b border-border p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                                        <Code className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <h3 className="font-bold text-foreground">Code Editor</h3>
                                                </div>

                                                {/* Language Selector */}
                                                <Select
                                                    value={language}
                                                    onValueChange={(e: any) => handleLanguageChange(e)}
                                                >
                                                    <SelectTrigger className="w-48 border-border bg-muted">
                                                        <SelectValue placeholder="Select Language" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-card border-border">
                                                        {editorLanguages.map((lang) => (
                                                            <SelectItem
                                                                key={lang.id}
                                                                value={lang.lang}
                                                                className="hover:bg-muted cursor-pointer"
                                                            >
                                                                {lang.lang}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>                                        {/* Monaco Editor */}
                                        <div style={{ height: 'calc(100% - 80px)' }}>
                                            <Editor
                                                height="100%"
                                                language={language}
                                                theme="vs-dark"
                                                value={currentCode}
                                                onChange={handleEditorChange}
                                                defaultValue={language || 'Please Select a language above!'}
                                                options={{
                                                    wordWrap: 'on',
                                                    fontSize: 14,
                                                    lineHeight: 1.6,
                                                    minimap: { enabled: true },
                                                    scrollBeyondLastLine: false,
                                                    automaticLayout: true,
                                                    tabSize: 4,
                                                    insertSpaces: true,
                                                    renderWhitespace: 'selection',
                                                    bracketPairColorization: { enabled: true },
                                                }}
                                            />
                                        </div>
                                    </div>
                                </ResizablePanel>

                                <ResizableHandle withHandle />

                                {/* Output Panel */}
                                <ResizablePanel defaultSize={35} minSize={20}>
                                    <div className="h-full bg-card">
                                        {/* Output Header */}
                                        <div className="bg-card-elevated border-b border-border p-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                                                    <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                                                </div>
                                                <h3 className="font-bold text-foreground">Output Console</h3>
                                            </div>
                                        </div>                                        {/* Output Content */}
                                        <div style={{ height: 'calc(100% - 72px)' }} className="p-4 overflow-y-auto scrollbar-hide bg-gray-900 text-gray-100 font-mono text-sm">
                                            {/* Loading State */}
                                            {loading && (
                                                <div className="flex items-center justify-center py-8">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                                                        <span className="text-primary font-medium">
                                                            Executing your code...
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Error Results */}
                                            {!loading && codeError && codeResult?.map((testCase: any, index: any) => (
                                                <div
                                                    key={index}
                                                    className="mb-4 p-4 bg-destructive/20 border border-destructive/30 rounded-lg"
                                                >
                                                    {testCase.status !== 'Accepted' && (
                                                        <div className="space-y-2">
                                                            <p className="text-gray-200">
                                                                <span className="text-warning font-semibold">Output: </span>
                                                                <span className="font-mono">
                                                                    {testCase?.stdOut || testCase?.stdout || 'No output'}
                                                                </span>
                                                            </p>

                                                            <p className="text-gray-200">
                                                                <span className="text-warning font-semibold">Compile Output: </span>
                                                                <span className="font-mono">
                                                                    {testCase?.compileOutput || 'No compile output'}
                                                                </span>
                                                            </p>

                                                            <p className="text-gray-200">
                                                                <span className="text-destructive font-semibold">Error: </span>
                                                                <span className="font-mono text-destructive">
                                                                    {testCase?.stdErr || testCase?.stderr || 'No error'}
                                                                </span>
                                                            </p>

                                                            <p className="text-gray-200">
                                                                <span className="text-warning font-semibold">Status: </span>
                                                                <span className="font-mono text-destructive">
                                                                    {testCase.status}
                                                                </span>
                                                            </p>

                                                            <p className="text-gray-200">
                                                                <span className="text-info font-semibold">Input: </span>
                                                                <br />
                                                                <span className="font-mono text-info">
                                                                    {testCase?.stdIn || testCase?.stdin || 'No input'}
                                                                </span>
                                                            </p>

                                                            <p className="text-gray-200">
                                                                <span className="text-success font-semibold">Expected Output: </span>
                                                                <br />
                                                                <span className="font-mono text-success">
                                                                    {testCase?.expectedOutput || 'No expected output'}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Success Results */}
                                            {!loading && !codeError && codeResult?.map((testCase: any, index: any) => (
                                                <div
                                                    key={index}
                                                    className={`mb-4 p-4 rounded-lg border ${
                                                        testCase.status === 'Accepted'
                                                            ? 'bg-success/20 border-success/30'
                                                            : 'bg-destructive/20 border-destructive/30'
                                                    }`}
                                                >
                                                    {testCase.status !== 'Accepted' ? (
                                                        <div className="space-y-2">
                                                            <h4 className="text-lg font-semibold text-gray-200">
                                                                Test Case {index + 1}
                                                            </h4>
                                                            {/* Same error output structure as above */}
                                                            <p className="text-gray-200">
                                                                <span className="text-warning font-semibold">Your Output: </span>
                                                                <span className="font-mono">
                                                                    {testCase?.stdOut || testCase?.stdout || 'No output'}
                                                                </span>
                                                            </p>
                                                            {/* Additional fields... */}
                                                        </div>
                                                    ) : (
                                                        <p className="text-success font-semibold flex items-center space-x-2">
                                                            <CheckCircle className="w-4 h-4" />
                                                            <span>Test Case {index + 1}: {testCase.status}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Empty State */}
                                            {!loading && !codeResult?.length && (
                                                <div className="flex items-center justify-center py-8 text-muted-foreground">
                                                    <div className="text-center">
                                                        <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                        <p className="text-lg font-medium">No output yet</p>
                                                        <p className="text-sm">Click "Run Code" to test your solution</p>
                                                    </div>
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
        </div>
    )
}

export default IDE
