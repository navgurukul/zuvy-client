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
import {
    IDEProps,
    IDEInput,
    TestCase,
    questionDetails,
} from '@/app/[admin]/courses/[courseId]/module/_components/ModuleComponentType'

// export interface questionDetails{
//     title: string
//     description: string
//     constraints?: string
//     examples: { input: number[]; output: number }
// }

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
        // { lang: 'c++', id: 105 },
        { lang: 'cpp', id: 105 },
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
                return '${value}'
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
                    //     title: Test Cases Passed Solution submitted,
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
                    description: 'Test Cases Passed',
                })
            } else {
                toast({
                    title: 'Failed',
                    description: 'Test Cases Failed',
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
        <div className="min-h-screen">
            <div className="flex justify-end mb-2">
                {/* <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <ChevronLeft fontSize={24} />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. If you have not
                                submitted your solution, it will be lost.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-red-500"
                                onClick={onBack}
                            >
                                Go Back
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog> */}

                <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                    <AlertDialogContent className="max-w-[350px]">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                            onClick={() => setIsOpen(false)}
                        >
                            <X size={18} />
                        </button>
                        <AlertDialogHeader>
                            {modalType === 'success' ? (
                                <>
                                    <AlertDialogTitle>
                                        🎉 Test Cases Passed!
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You have submitted the question. You can
                                        go back and do other questions
                                    </AlertDialogDescription>
                                </>
                            ) : (
                                <>
                                    {/* ⚠ */}
                                    <AlertDialogTitle>
                                        ❌ Test Cases Failed
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You have submitted the question. You can
                                        go back and do other questions
                                    </AlertDialogDescription>
                                </>
                            )}
                        </AlertDialogHeader>
                    </AlertDialogContent>
                </AlertDialog>

                {/* <div className="font-bold text-xl">
                    <TimerDisplay remainingTime={remainingTime} />
                </div> */}
                <div className='flex gap-3'>
                    <Button
                        onClick={(e) => handleSubmit(e, 'run')}
                        size="sm"
                        className="border bg-background hover:bg-primary/10 border-primary hover:border-primary h-9 rounded-md px-3 text-black"
                        disabled={true}
                    >
                        {loading ? <Spinner /> : <Play size={20} />}
                        <span className="ml-2 text-lg font-bold">Run</span>
                    </Button>
                    <Button
                        onClick={(e) => handleSubmit(e, 'submit')}
                        size="sm"
                        disabled={true}
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
                            <div className="w-full max-w-12xl p-4 bg-white text-left border rounded-lg shadow-sm overflow-y-auto">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <h1 className="text-xl font-bold text-gray-900">
                                            {questionDetails?.title}
                                        </h1>
                                    </div>

                                    <div className="border rounded-lg overflow-hidden shadow-sm">
                                        <div className="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                                            Description
                                        </div>
                                        <div className="bg-white px-4 py-3 text-gray-700">
                                            {questionDetails?.description}
                                        </div>
                                    </div>

                                    <div className="border rounded-lg overflow-hidden shadow-sm">
                                        <div className="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                                            Constraints
                                        </div>
                                        <div className="bg-white px-4 py-3 text-gray-700">
                                            {questionDetails?.constraints}
                                        </div>
                                    </div>

                                    {testCases
                                        ?.slice(0, 2)
                                        .map(
                                            (
                                                testCase: TestCase,
                                                index: number
                                            ) => (
                                                <div
                                                    key={index}
                                                    className="border rounded-lg overflow-hidden shadow-sm"
                                                >
                                                    <div className="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                                                        Test Case {index + 1}
                                                    </div>
                                                    <div className="bg-white px-4 py-3 space-y-2 text-gray-700">
                                                        {/* Handle both array and object inputs */}
                                                        {Array.isArray(
                                                            testCase.inputs
                                                        )
                                                            ? testCase.inputs.map(
                                                                  (
                                                                      input: IDEInput,
                                                                      idx: number
                                                                  ) => (
                                                                      <p
                                                                          key={
                                                                              idx
                                                                          }
                                                                          className="text-gray-800"
                                                                      >
                                                                          <span className="font-medium">
                                                                              Input{' '}
                                                                              {idx +
                                                                                  1}
                                                                              :
                                                                          </span>{' '}
                                                                          {formatValue(
                                                                              input.parameterValue,
                                                                              input.parameterType
                                                                          )}
                                                                      </p>
                                                                  )
                                                              )
                                                            : Object.entries(
                                                                  testCase.inputs
                                                              ).map(
                                                                  (
                                                                      [
                                                                          key,
                                                                          value,
                                                                      ],
                                                                      idx: number
                                                                  ) => (
                                                                      <p
                                                                          key={
                                                                              key
                                                                          }
                                                                          className="text-gray-800"
                                                                      >
                                                                          <span className="font-medium">
                                                                              Input{' '}
                                                                              {idx +
                                                                                  1}
                                                                              :
                                                                          </span>{' '}
                                                                          {key} ={' '}
                                                                          {formatValue(
                                                                              value,
                                                                              typeof value ===
                                                                                  'number'
                                                                                  ? 'int'
                                                                                  : 'str'
                                                                          )}
                                                                      </p>
                                                                  )
                                                              )}

                                                        <p className="text-gray-800 pt-2 border-t border-gray-100">
                                                            <span className="font-medium">
                                                                Expected Output:
                                                            </span>{' '}
                                                            {formatValue(
                                                                testCase
                                                                    .expectedOutput
                                                                    .parameterValue,
                                                                testCase
                                                                    .expectedOutput
                                                                    .parameterType
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={50}>
                        <ResizablePanelGroup direction="vertical">
                            <ResizablePanel defaultSize={70}>
                                <div className="flex h-full">
                                    <div className="w-full max-w-9xl bg-white p-4 border rounded-lg shadow-sm">
                                        <form>
                                            <div>
                                                <div className="flex justify-between items-center p-2 border-b bg-gray-50 rounded-t-lg">
                                                    <div className="flex gap-2 items-center">
                                                        <Code size={20} />
                                                        <p className="text-lg font-semibold text-gray-800">
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
                                                        <SelectTrigger className="border w-[180px] bg-white">
                                                            <SelectValue placeholder="Select language" />
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
                                                                        {lang.lang === "cpp" ? "c++" : lang.lang}
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Editor
                                                    height="90vh"
                                                    language={language}
                                                    theme="vs"
                                                    value={currentCode}
                                                    onChange={
                                                        handleEditorChange
                                                    }
                                                    className="p-2 border rounded-b-lg bg-white"
                                                    defaultValue={
                                                        language ||
                                                        'Please Select a language above!'
                                                    }
                                                    options={{
                                                        wordWrap: 'on',
                                                    }}
                                                />
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel className="" defaultSize={40}>
                                <div className="flex h-full">
                                    <div className="w-full max-w-9xl bg-white px-2 p-4 border rounded-lg shadow-sm">
                                        <div className="flex justify-between p-3 bg-gray-50 border-b rounded-t-lg">
                                            <p className="text-lg text-gray-800 font-semibold">
                                                Output Window
                                            </p>
                                        </div>

                                        <div className="h-full p-4 text-start text-gray-800 overflow-y-auto font-mono  border border-gray-100 rounded-b-lg">
                                            {/* Loader */}
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
                                                                className="shadow-sm rounded-lg p-4 my-4 bg-gray-100 border border-gray-200"
                                                            >
                                                                {testCase.status !==
                                                                    'Accepted' && (
                                                                    <>
                                                                        <p>
                                                                            <span className="text-gray-700 font-medium">
                                                                                Your
                                                                                Output:{' '}
                                                                            </span>
                                                                            {`${testCase?.stdout}`}
                                                                        </p>

                                                                        <p>
                                                                            <span className="text-gray-700 font-medium">
                                                                                compileOutput:{' '}
                                                                            </span>
                                                                            {`${testCase?.compileOutput}`}
                                                                        </p>

                                                                        <p>
                                                                            <span className="text-gray-700 font-medium">
                                                                                Error:{' '}
                                                                            </span>
                                                                            <span className="font-mono text-destructive">{`${
                                                                                testCase?.stdErr ||
                                                                                'No error'
                                                                            }`}</span>
                                                                        </p>

                                                                        <p>
                                                                            <span className="text-gray-700 font-medium">
                                                                                Status:{' '}
                                                                            </span>
                                                                            <span className="font-mono text-destructive">
                                                                                {' '}
                                                                                {
                                                                                    testCase.status
                                                                                }
                                                                            </span>
                                                                        </p>

                                                                        <p>
                                                                            <span className="text-gray-700 font-medium">
                                                                                Input:{' '}
                                                                            </span>
                                                                            <br />
                                                                            {`${
                                                                                testCase?.stdIn ||
                                                                                'No input'
                                                                            }`}
                                                                        </p>

                                                                        <p>
                                                                            <span className="text-gray-700 font-medium">
                                                                                Expected
                                                                                Output:{' '}
                                                                            </span>
                                                                            <br />
                                                                            {`${
                                                                                testCase?.expectedOutput ||
                                                                                'No expected output'
                                                                            }`}
                                                                        </p>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                            </p>
                                            {!loading &&
                                                !codeError &&
                                                codeResult?.map(
                                                    (
                                                        testCase: any,
                                                        index: any
                                                    ) => (
                                                        <div
                                                            key={index}
                                                            className="shadow-sm rounded-lg p-4 my-4 bg-gray-100 border border-gray-200"
                                                        >
                                                            {testCase.status !==
                                                            'Accepted' ? (
                                                                <>
                                                                    <h2 className="text-xl font-semibold mb-2 text-gray-800">
                                                                        Test
                                                                        Case{' '}
                                                                        {index +
                                                                            1}
                                                                    </h2>

                                                                    <p className="text-gray-800 whitespace-normal break-words">
                                                                        <span className="font-medium">
                                                                            Your
                                                                            Output:
                                                                        </span>
                                                                        {`${testCase?.stdout}`}
                                                                    </p>

                                                                    <p>
                                                                        <span className="font-medium">
                                                                            compileOutput:{' '}
                                                                        </span>
                                                                        {`${testCase?.compileOutput}`}
                                                                    </p>

                                                                    <p>
                                                                        <span className="font-medium">
                                                                            Error:{' '}
                                                                        </span>
                                                                        {`${
                                                                            testCase?.stdErr ||
                                                                            'No error'
                                                                        }`}
                                                                    </p>

                                                                    <p>
                                                                        <span className="font-medium">
                                                                            Input:{' '}
                                                                        </span>
                                                                        <br />
                                                                        {`${
                                                                            testCase?.stdIn ||
                                                                            'No input'
                                                                        }`}
                                                                    </p>

                                                                    <p>
                                                                        <span className="font-medium">
                                                                            Expected
                                                                            Output:{' '}
                                                                        </span>
                                                                        <br />
                                                                        {`${
                                                                            testCase?.expectedOutput ||
                                                                            'No expected output'
                                                                        }`}
                                                                    </p>

                                                                    <p>
                                                                        {' '}
                                                                        <span className="font-medium">
                                                                            {' '}
                                                                            Status:{' '}
                                                                        </span>
                                                                        <span
                                                                            className={`${
                                                                                testCase.status ===
                                                                                'Accepted'
                                                                                    ? 'text-green-600'
                                                                                    : 'text-red-600'
                                                                            }`}
                                                                        >
                                                                            {
                                                                                testCase.status
                                                                            }
                                                                        </span>
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                <p
                                                                    className={`${
                                                                        testCase.status ===
                                                                        'Accepted'
                                                                            ? 'text-green-600'
                                                                            : 'text-red-600'
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
