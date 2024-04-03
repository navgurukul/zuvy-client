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
import api from '@/utils/axios.config'
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

interface questionDetails {
    title: string
    description: string
    examples: { input: number[]; output: number }
}
export default function IDE({ params }: { params: { editor: string } }) {
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
    const [languageId, setLanguageId] = useState(48)
    const [codeError, setCodeError] = useState('')
    const [language, setLanguage] = useState('c')
    const [testCases, setTestCases] = useState<any>([])
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

    // Encoding UTF-8 ⇢ base64

    function b64EncodeUnicode(str: string) {
        return btoa(
            encodeURIComponent(str).replace(
                /%([0-9A-F]{2})/g,
                function (_match, p1) {
                    return String.fromCharCode(parseInt(p1, 16))
                }
            )
        )
    }

    // Decoding base64 ⇢ UTF-8

    function b64DecodeUnicode(str: string) {
        return decodeURIComponent(
            Array.prototype.map
                .call(atob(str), function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                })
                .join('')
        )
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
                `/codingPlatform/submit?userId=${userID}&questionId=${params.editor}&action=${action}`,
                {
                    languageId: getDataFromField(
                        editorLanguages,
                        languageId,
                        'lang',
                        'id'
                    ),
                    sourceCode: b64EncodeUnicode(currentCode),
                }
            )
            if (
                response.data.stderr ||
                response.data.compile_output ||
                response.data.stdout
            ) {
                let compileOutput =
                    response.data.compile_output?.replaceAll('\n', '') ||
                    response.data.stderr?.replaceAll('\n', '') ||
                    response.data.stdout?.replaceAll('\n', '')

                const encodedResult = b64DecodeUnicode(compileOutput)
                setResult(encodedResult)
            }
            if (response.data.status_id === 3) {
                toast({
                    title: `Test Cases Passed ${
                        action === 'submit' ? ', Solution submitted' : ''
                    }`,
                })
            } else {
                toast({
                    title: 'Test Cases Failed',
                    variant: 'destructive',
                })
            }
            setCodeError('')
        } catch (error: any) {
            console.error('Error getting modules progress', error)
            setCodeError(error?.message)
        }
    }

    function handleEditorChange(value: any) {
        setCurrentCode(value)
    }
    const getQuestionDetails = async () => {
        try {
            await api
                .get(`/codingPlatform/questionById/${params.editor}`)
                .then((response) => {
                    setQuestionDetails(response.data[0])
                    setTestCases(response.data[0].testCases[0])
                })
        } catch (error) {
            console.error('Error fetching courses:', error)
        }
    }

    useEffect(() => {
        getQuestionDetails()
    }, [])
    const handleBack = () => {
        router.back()
    }

    return (
        <div>
            <div className="flex justify-between mb-2">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
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
                                    <h1 className="text-xl">
                                        {questionDetails?.title}
                                    </h1>
                                    <p>{questionDetails?.description}</p>
                                    <p>
                                        Examples : Input -{' '}
                                        {questionDetails?.examples?.input.join(
                                            ','
                                        )}{' '}
                                        ; Output :{' '}
                                        {questionDetails?.examples?.output}
                                    </p>
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
                                                            <SelectValue placeholder="Difficulty" />
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
                                                    // defaultValue='console.log("Zuvy");'
                                                    theme="vs-dark"
                                                    value={currentCode}
                                                    onChange={
                                                        handleEditorChange
                                                    }
                                                    className="p-2"
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
                                                                            disabled
                                                                        >
                                                                            Test
                                                                            Case
                                                                            2
                                                                        </TabsTrigger>
                                                                        <TabsTrigger
                                                                            value="test case 3"
                                                                            disabled
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
                                            <pre>{result}</pre>
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
