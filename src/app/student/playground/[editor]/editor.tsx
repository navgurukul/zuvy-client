'use client'

import { Button } from '@/components/ui/button'

import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from '@/components/ui/resizable'
import { ChevronLeft, Code, Lock, Play, Upload } from 'lucide-react'
import { useLazyLoadedStudentData } from '@/store/store'
import { api } from '@/utils/axios.config'
import Editor from '@monaco-editor/react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import SubmissionsList from '../_components/submissions-list'
import { b64DecodeUnicode, b64EncodeUnicode } from '@/utils/base64'
import { usePathname } from 'next/navigation'
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

interface Input {
    parameterName: string;
    parameterType: string;
    parameterValue: [] | {};
}

interface TestCase {
    inputs: Input[] | Record<string, unknown>;
    expectedOutput: {
        parameterType: string;
        parameterValue: [] | {};
    };
}
interface questionDetails {
    title: string
    description: string
    constraints?: string
    examples: { input: number[]; output: number }
}

interface IDEProps {
    params: { editor: string }
    remainingTime?: any
    assessmentSubmitId?: number
    onBack?: () => void
    selectedCodingOutsourseId?: any
}

const IDE: React.FC<IDEProps> = ({
    params,
    remainingTime,
    assessmentSubmitId,
    onBack,
    selectedCodingOutsourseId,
}) => {
    const pathname = usePathname()
    const [questionDetails, setQuestionDetails] = useState<questionDetails>({
        title: '',
        description: '',
        examples: {
            input: [],
            output: 0,
        },
    })
    const [currentCode, setCurrentCode] = useState('')
    const [result, setResult] = useState('')
    const [languageId, setLanguageId] = useState(93)
    const [codeError, setCodeError] = useState('')
    const [language, setLanguage] = useState('')
    const [testCases, setTestCases] = useState<any>([])
    const [templates, setTemplates] = useState<any>([])
    const [examples, setExamples] = useState<any>([])
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const [codeResult, setCodeResult] = useState([])

    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id
    const codePanel = pathname?.includes('/codepanel')
    const admin = pathname?.includes('/admin')

    const editorLanguages = [
        { lang: 'java', id: 96 },
        { lang: 'python', id: 100 },
        { lang: 'javascript', id: 102 },
        { lang: 'cpp', id: 105 },
        { lang: 'c', id: 104 },
    ]

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
            return JSON.stringify(value, null, 2);
        }
    
        if (Array.isArray(value)) {
            if (type === 'arrayOfNum') {
                return `[${value.join(', ')}]`;
            }
            if (type === 'arrayOfStr') {
                return `[${value.map(v => `"${v}"`).join(', ')}]`;
            }
            return `[${value.join(', ')}]`;
        }
    
        switch (type) {
            case 'int':
            case 'float':
                return value.toString();
            case 'str':
                return `"${value}"`;
            default:
                return JSON.stringify(value);
        }
    };
    

    const handleSubmit = async (
        e: { preventDefault: () => void },
        action: string
    ) => {
        e.preventDefault()
        setLoading(true)

        if (admin) return

        try {
            const response = await api.post(
                `codingPlatform/practicecode/questionId=${params.editor}?action=${action}`,
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
            if (action === 'submit') {
                setIsSubmitted(true)
            }
            setResult(
                response.data.data[0].stdOut ||
                response.data.data[0].stdout ||
                'No Output Available'
            )
            setCodeResult(response.data.data)
            const testCases = response.data.data
            const allTestCasesPassed = testCases.every(
                (testCase: any) => testCase.status === 'Accepted'
            )

            setResult(testCases[0].stdOut)

            if (allTestCasesPassed) {
                toast({
                    title: `Test Cases Passed${action === 'submit' ? ', Solution submitted' : ''
                        }`,
                    className: 'text-start capitalize border border-secondary',
                })
            } else {
                toast({
                    title: 'Test Cases Failed',
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                })
            }
            setCodeError('')
            setLoading(false)
        } catch (error: any) {
                setLoading(false)
                setCodeResult(error.response?.data?.data)
            toast({
                title: 'Failed',
                description:
                    error.response?.data?.message || 'Network connection lost.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
            setCodeError(
                error.response?.data?.data?.[0]?.stderr ||
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
                    setQuestionDetails(response?.data?.data)
                    setTestCases(response?.data?.data?.testCases)
                    setTemplates(response?.data?.data?.templates)
                    setExamples(response?.data[0]?.examples)
                })
        } catch (error) {
            console.error('Error fetching courses:', error)
        }
    }

    const getSubmissionDetails = async () => {
        try {
            await api
                .get(`codingPlatform/submissions/questionId=${params.editor}`)
                .then((response) => {
                    setLanguageId(response?.data.data.languageId)
                    setCurrentCode(b64DecodeUnicode(response?.data.data.sourceCode))
                    setLanguage(editorLanguages.find(lang => lang.id === response?.data.data.languageId)?.lang || '')
                })
        } catch (error) {
            console.error('Error fetching courses:', error)
        }
    }
    

    useEffect(() => {
        getQuestionDetails()
        getSubmissionDetails()
    }, [language, params.editor])

    const handleBack = () => {
            // document?.exitFullscreen()
        router.back()
    }

    useEffect(() => {
        if (templates?.[language]?.template) {
            setCurrentCode(b64DecodeUnicode(templates?.[language]?.template))
        }
    }, [language])
    // 
    return (
        <div>
            <div className="flex justify-between mb-2">
                <div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. If you have
                                    not submitted your solution, it will be
                                    lost.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-red-500"
                                    onClick={handleBack}
                                >
                                    Go Back
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    {/* <SubmissionsList questionId={params.editor} admin={admin} /> */}
                </div>

                <div>
                    <Button
                        onClick={(e) => handleSubmit(e, 'run')}
                        size="sm"
                        className="mr-2"
                        disabled={
                            admin || loading || (codePanel && isSubmitted)
                        }
                    >
                        {loading ? <Spinner /> : <Play size={20} />}
                        <span className="ml-2 text-lg font-bold">Run</span>
                    </Button>
                    <Button
                        onClick={(e) => handleSubmit(e, 'submit')}
                        size="sm"
                        disabled={
                            admin || loading || (codePanel && isSubmitted)
                        }
                    >
                        {loading ? <Spinner /> : <Upload size={20} />}
                        <span className="ml-2 text-lg font-bold">Submit</span>
                    </Button>
                </div>
            </div>

            {questionDetails && (
                <ResizablePanelGroup
                    direction="horizontal"
                    className="w-full max-w-12xl rounded-lg "
                >
                    <ResizablePanel defaultSize={50}>
                        <div className="flex h-[90vh]">
                            <div className="w-full max-w-12xl p-2 bg-muted text-left">
                                <div className="p-2">
                                    <h1 className="text-xl font-bold">
                                        {questionDetails?.title}
                                    </h1>
                                    <p>{questionDetails?.description}</p>
                                    <p className='mt-3'><span className='font-bold'>Constraints:</span> {questionDetails?.constraints}</p>

                                    {testCases
                                        ?.slice(0, 2)
                                        .map((testCase: TestCase, index: number) => (
                                            <div
                                                key={index}
                                                className="bg-gray-200 shadow-sm rounded-lg p-4 my-4"
                                            >
                                                <h2 className="text-xl font-semibold mb-2">
                                                    Test Case {index + 1}
                                                </h2>

                                                {/* Handle both array and object inputs */}
                                                {Array.isArray(testCase.inputs) ? (
                                                    testCase.inputs.map((input: Input, idx: number) => (
                                                        <p key={idx} className="text-gray-700">
                                                            <span className="font-medium">
                                                                Input {idx + 1}:
                                                            </span>{' '}
                                                            {formatValue(input.parameterValue, input.parameterType)}
                                                        </p>
                                                    ))
                                                ) : (
                                                    Object.entries(testCase.inputs).map(([key, value], idx: number) => (
                                                        <p key={key} className="text-gray-700">
                                                            <span className="font-medium">
                                                                Input {idx + 1}:
                                                            </span>{' '}
                                                            {key} = {formatValue(value, typeof value === 'number' ? 'int' : 'str')}
                                                        </p>
                                                    ))
                                                )}

                                                <p className="text-gray-700 mt-2">
                                                    <span className="font-medium">
                                                        Expected Output:
                                                    </span>{' '}
                                                    {formatValue(testCase.expectedOutput.parameterValue, testCase.expectedOutput.parameterType)}
                                                </p>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={50}>
                        <ResizablePanelGroup direction="vertical">
                            <ResizablePanel defaultSize={70}>
                                <div className="flex h-full">
                                    <div className="w-full max-w-9xl bg-muted p-2">
                                        <form>
                                            <div>
                                                <div className="flex justify-between p-2">
                                                    <div className="flex gap-2 items-center">
                                                        <Code size={20} />
                                                        <p className="text-lg">
                                                            Code
                                                        </p>
                                                    </div>

                                                    <Select
                                                        value={language}
                                                        onValueChange={(
                                                            e: any
                                                        ) =>
                                                            handleLanguageChange(
                                                                e
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="border border-secondary w-[180px]">
                                                            <SelectValue placeholder="Select Language" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {editorLanguages.map(
                                                                (lang) => (
                                                                    <SelectItem
                                                                        key={
                                                                            lang.id
                                                                        }
                                                                        value={
                                                                            lang.lang
                                                                        }
                                                                    >
                                                                        {
                                                                            lang.lang
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Editor
                                                    height="90vh"
                                                    language={language}
                                                    theme="vs-dark"
                                                    value={currentCode}
                                                    onChange={
                                                        handleEditorChange
                                                    }
                                                    className="p-2"
                                                    defaultValue="Please select a language above!"
                                                    options={{
                                                        wordWrap: "on",
                                                    }}
                                                />
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel className="" defaultSize={40}>
                                <div className="flex h-full ">
                                    <div className="w-full max-w-9xl bg-muted px-4 pt-2 pb-10">
                                        <div className="flex justify-between p-2 bg-gray-800 border-b border-gray-700">
                                            <p className="text-lg text-gray-300">
                                                Output Window
                                            </p>
                                        </div>

                                        <div className="h-full p-4 text-start text-gray-100 overflow-y-auto font-mono bg-gray-900 border border-gray-700 rounded-b-lg">
                                            {loading && (
                                                <div className="flex justify-center items-center my-4">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                                    <span className="ml-2 text-lg text-gray-500">
                                                        Processing...
                                                    </span>
                                                </div>
                                            )}
                                           <p>
                                                {!loading &&
                                                    codeError &&
                                                    codeResult?.map(
                                                        (
                                                            testCase: any,
                                                            index: any
                                                        ) => (
                                                            <div
                                                                key={index}
                                                                className="shadow-sm rounded-lg p-4 my-4 bg-gray-800 border border-gray-700"
                                                            >
                                                                {(testCase.status !=='Accepted') && (
                                                                    <>
                                                                        <p>
                                                                        <span className='text-yellow-200'>Your Output: </span>
                                                                            {`${testCase?.stdOut}`}
                                                                        </p>
    
                                                                        <p>
                                                                        <span className='text-yellow-200'>compileOutput: </span>
                                                                            {`${testCase?.compileOutput}`}
                                                                        </p>
    
                                                                        <p>
                                                                            <span className='text-yellow-200'>Error: </span>
                                                                            <span className="font-mono text-destructive">{`${testCase?.stdErr}`}</span>
                                                                        </p>

                                                                        <p >
                                                                        <span className='text-yellow-200'>Status: </span>
                                                                            <span className="font-mono text-destructive">
                                                                            {
                                                                                testCase.status
                                                                            }
                                                                            </span>
                                                                        </p>
    
                                                                        <p>
                                                                            <span className='text-yellow-200'>Input: </span><br />
                                                                            {`${testCase?.stdIn}`}
                                                                        </p>
    
                                                                        <p>
                                                                            <span className='text-yellow-200'>Expected Output: </span><br />
                                                                            {`${testCase?.expectedOutput}`}
                                                                        </p>
    
                                                                     
                                                                    </>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                            </p>
                                            {!loading && !codeError &&
                                                codeResult?.map(
                                                    (
                                                        testCase: any,
                                                        index: any
                                                    ) => (
                                                        <div
                                                            key={index}
                                                            className="shadow-sm rounded-lg p-4 my-4 bg-gray-800 border border-gray-700"
                                                        >
                                                            {(testCase.status !=='Accepted') ? (
                                                                <>
                                                                    <h2 className="text-xl font-semibold mb-2 text-gray-300">
                                                                        Test
                                                                        Case{' '}
                                                                        {index +
                                                                            1}
                                                                    </h2>
                                                                    

                                                                    <p className="text-gray-300 whitespace-normal break-words">
                                                                        <span className="text-yellow-200">
                                                                            Your
                                                                            Output:
                                                                        </span>
                                                                        {testCase?.stdOut}
                                                                    </p>

                                                                    <p>
                                                                    <span className='text-yellow-200'>compileOutput: </span>
                                                                        {`${testCase?.compileOutput}`}
                                                                    </p>

                                                                    <p>
                                                                        <span className='text-yellow-200'>Error: </span>
                                                                        {`${testCase?.stdErr}`}
                                                                    </p>

                                                                    <p>
                                                                        <span className='text-yellow-200'>Input: </span><br />
                                                                        {`${testCase?.stdIn}`}
                                                                    </p>

                                                                    <p>
                                                                        <span className='text-yellow-200'>Expected Output: </span><br />
                                                                        {`${testCase?.expectedOutput}`}
                                                                    </p>

                                                                    <p >
                                                                        <span className='text-yellow-200'>Status: </span>
                                                                            <span className="font-mono text-destructive">
                                                                            {
                                                                                testCase.status
                                                                            }
                                                                            </span>
                                                                        </p>
                                                                 
                                                                </>
                                                            ) : (
                                                                <p
                                                                    className={`text-gray-300 ${testCase.status ===
                                                                        'Accepted'
                                                                        ? 'text-green-500'
                                                                        : 'text-red-500'
                                                                        }`}
                                                                >
                                                                    Test Case{' '}
                                                                    {index + 1}{' '}
                                                                    status:{' '}
                                                                    {
                                                                        testCase.status
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                        </div>
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

export default IDE
