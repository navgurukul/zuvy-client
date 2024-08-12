'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from '@/components/ui/resizable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code, Lock, Play, Upload } from 'lucide-react'
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

interface questionDetails {
    title: string
    description: string
    examples: { input: number[]; output: number }
}

interface IDEProps {
    params: { editor: string }
    remainingTime?: any
    assessmentSubmitId?: number
}

const IDE: React.FC<IDEProps> = ({
    params,
    remainingTime,
    assessmentSubmitId,
}) => {
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
    const router = useRouter()
    const { toast } = useToast()

    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id

    const editorLanguages = [
        { lang: 'java', id: 91 },
        { lang: 'python', id: 71 },
        { lang: 'javascript', id: 93 },
        { lang: 'cpp', id: 52 },
        { lang: 'c', id: 48 },
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

    const handleSubmit = async (
        e: { preventDefault: () => void },
        action: string
    ) => {
        e.preventDefault()
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
            if (
                response.data.data.stderr ||
                response.data.data.compile_output ||
                response.data.data.stdout
            ) {
                let compileOutput =
                    response.data.data.compile_output?.replaceAll('\n', '') ||
                    response.data.data.stderr?.replaceAll('\n', '') ||
                    response.data.data.stdOut

                const encodedResult = b64DecodeUnicode(compileOutput)
                setResult(b64DecodeUnicode(response.data.data.stdOut))
            }
            if (response.data.data.status_id === 3) {
                toast({
                    title: `Test Cases Passed ${action === 'submit' ? ', Solution submitted' : ''
                        }`,
                    className: 'text-start capitalize border border-secondary',
                })
            } else {
                toast({
                    title: 'Test Cases Failed',
                    className:
                        'text-start capitalize border border-destructive',
                })
            }
            setCodeError('')
        } catch (error: any) {
            toast({
                title: 'Failed',
                description:
                    error.response?.data?.message || 'An error occurred.',
                className: 'text-start capitalize border border-destructive',
            })
            setCodeError(error?.message)
        }
    }

    function handleEditorChange(value: any) {
        setCurrentCode(value)
    }
    const getQuestionDetails = async () => {
        try {
            await api.get(`codingPlatform/get-coding-question/${params.editor}`)
                .then((response) => {
                    setQuestionDetails(response?.data.data)
                    setTestCases(response?.data?.data?.testCases)
                    setTemplates(response?.data?.data?.templates)
                    setExamples(response?.data[0].examples)
                })
        } catch (error) {
            console.error('Error fetching courses:', error)
        }
    }

    useEffect(() => {
        getQuestionDetails()
    }, [language])

    const handleBack = () => {
        router.back()
    }

    useEffect(()=>{
        if(templates?.[language]?.template){
            setCurrentCode(b64DecodeUnicode(templates?.[language]?.template))
        }
        
    },[language])



    return (
        <div>
            <div className="flex justify-between mb-2">
                <div>
                    <Button variant="ghost" size="icon" onClick={handleBack}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <SubmissionsList questionId={params.editor} />
                </div>
                <div>
                    <Button
                        onClick={(e) => handleSubmit(e, 'run')}
                        size="sm"
                        className="mr-2"
                    >
                        <Play size={20} />
                        <span className="ml-2 text-lg font-bold">Run</span>
                    </Button>
                    <Button
                        onClick={(e) => handleSubmit(e, 'submit')}
                        size="sm"
                    >
                        <Upload size={20} />
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
                            <div className="w-full max-w-12xl p-2  bg-muted text-left">
                                <div className="p-2">
                                    <h1 className="text-xl font-bold">
                                        {questionDetails?.title}
                                    </h1>
                                    <p>{questionDetails?.description}</p>

                                    {testCases?.slice(0, 2).map((testCase: any, index: any) => (
                                        <div key={index} className="bg-gray-200 shadow-sm rounded-lg p-4 my-4">
                                            <h2 className="text-xl font-semibold mb-2">Test Case {index + 1}</h2>
                                            {testCase.inputs.map((input: any, idx: any) => (
                                                <p key={idx} className="text-gray-700">
                                                    <span className="font-medium">Input {idx + 1}:</span> {input.parameterName} ({input.parameterType}) = {input.parameterValue}
                                                </p>
                                            ))}
                                            <p className="text-gray-700 mt-2">
                                                <span className="font-medium">Expected Output:</span> {testCase.expectedOutput.parameterType} = {testCase.expectedOutput.parameterValue}
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
                                    <div className="w-full max-w-5xl bg-muted p-2">
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
                                                    height="52vh"
                                                    language={language}
                                                    theme="vs-dark"
                                                    value={currentCode}
                                                    onChange={
                                                        handleEditorChange
                                                    }
                                                    className="p-2"
                                                    defaultValue='Please select a language above!'
                                                />
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={30}>
                                <div className="flex h-full ">
                                    <div className="w-full max-w-5xl  p-2  bg-muted  ">
                                        <div className="flex justify-between p-2">
                                            <p className="text-lg">
                                                Output Window
                                            </p>
                                            <div>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            Test Cases
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-[465px]">
                                                        <DialogHeader>
                                                            <DialogTitle>
                                                                <Tabs
                                                                    defaultValue="Test Case 1"
                                                                    className="w-[400px]"
                                                                >
                                                                    <TabsList className="grid w-full grid-cols-3">
                                                                        <TabsTrigger value="test case 1">
                                                                            Test
                                                                            Case
                                                                            1
                                                                        </TabsTrigger>
                                                                        <TabsTrigger
                                                                            value="test case 2"

                                                                        >
                                                                            Test
                                                                            Case
                                                                            2
                                                                        </TabsTrigger>
                                                                        <TabsTrigger
                                                                            value="test case 3"
                                                                        >
                                                                            Test
                                                                            Case
                                                                            3
                                                                        </TabsTrigger>
                                                                    </TabsList>
                                                                    <TabsContent value="test case 1">
                                                                        <Card>
                                                                            <CardHeader>
                                                                                <CardTitle>
                                                                                    Input
                                                                                    -
                                                                                    [
                                                                                    {testCases.input?.join(
                                                                                        ','
                                                                                    )}
                                                                                    ];
                                                                                    Output
                                                                                    -
                                                                                    [
                                                                                    {
                                                                                        testCases.output
                                                                                    }

                                                                                    ]
                                                                                </CardTitle>
                                                                            </CardHeader>
                                                                        </Card>
                                                                    </TabsContent>
                                                                    <TabsContent value="test case 2">
                                                                        <Card>
                                                                            <CardHeader>
                                                                                <CardTitle>
                                                                                    <Lock />
                                                                                </CardTitle>
                                                                            </CardHeader>
                                                                        </Card>
                                                                    </TabsContent>
                                                                    <TabsContent value="test case 3">
                                                                        <Card>
                                                                            <CardHeader>
                                                                                <CardTitle>
                                                                                    <Lock />
                                                                                </CardTitle>
                                                                            </CardHeader>
                                                                        </Card>
                                                                    </TabsContent>
                                                                </Tabs>
                                                            </DialogTitle>
                                                        </DialogHeader>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>
                                        <div className="h-full p-2 bg-accent text-white overflow-y-auto">
                                            <code>{result}</code>
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
