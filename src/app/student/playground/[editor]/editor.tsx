'use client'

import { Button } from '@/components/ui/button'
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from '@/components/ui/resizable'
import { useLazyLoadedStudentData } from '@/store/store'
import api from '@/utils/axios.config'
import Editor from '@monaco-editor/react'
import { ArrowBigLeft, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface questionDetails {
    title: string
    description: string
}
export default function IDE({ params }: { params: { editor: string } }) {
    const [questionDetails, setQuestionDetails] = useState<questionDetails>({
        title: '',
        description: '',
    })
    const [currentCode, setCurrentCode] = useState('')
    const [result, setResult] = useState('')
    const [languageId, setLanguageId] = useState(48)
    const [codeError, setCodeError] = useState('')
    const [language, setLanguage] = useState('c')
    const router = useRouter()

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
                function (match, p1) {
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

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault()
        try {
            const response = await api.post(
                `/codingPlatform/submit?userId=${userID}&questionId=${params.editor}`,
                {
                    languageId: getDataFromField(
                        editorLanguages,
                        languageId,
                        'lang',
                        'id'
                    ),
                    sourceCode: b64EncodeUnicode(currentCode),
                    stdInput: 'aGVsbG8gd29ybGQ=',
                }
            )
            if (
                response.data.stderr ||
                response.data.compile_output ||
                response.data.stdout
            ) {
                let compileOutput =
                    response.data.stderr?.replaceAll('\n', '') ||
                    response.data.compile_output?.replaceAll('\n', '') ||
                    response.data.stdout?.replaceAll('\n', '')
                setResult(b64DecodeUnicode(compileOutput))
            }
            setCodeError('')
        } catch (error: any) {
            setResult('')
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
                    console.log('details', response.data[0])
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
        questionDetails && (
            <ResizablePanelGroup
                direction="horizontal"
                className="w-full max-w-12xl rounded-lg border"
            >
                <ResizablePanel defaultSize={50}>
                    <div className="flex h-[90vh]">
                        <div className="w-full max-w-12xl p-2 border bg-muted rounded-md text-left">
                            <div className="flex items-center ">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleBack}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <h1 className="text-2xl p-2">
                                    {questionDetails?.title}
                                </h1>
                            </div>
                            <div className="px-2">
                                {questionDetails?.description}
                            </div>
                        </div>
                    </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50}>
                    <ResizablePanelGroup direction="vertical">
                        <ResizablePanel defaultSize={75}>
                            <div className="flex h-full">
                                <div className="w-full max-w-5xl bg-muted rounded-md">
                                    <form onSubmit={handleSubmit}>
                                        <div>
                                            <div className="text-2xl">
                                                Add your code
                                            </div>
                                            <select
                                                value={language}
                                                onChange={(e) =>
                                                    handleLanguageChange(
                                                        e.target.value
                                                    )
                                                }
                                                className="p-1 m-2 rounded-md"
                                            >
                                                {editorLanguages.map((lang) => (
                                                    <option
                                                        key={lang.id}
                                                        value={lang.lang}
                                                    >
                                                        {lang.lang}
                                                    </option>
                                                ))}
                                            </select>
                                            <Editor
                                                height="52vh"
                                                language={language}
                                                // defaultValue='console.log("Zuvy");'
                                                theme="vs-dark"
                                                value={currentCode}
                                                onChange={handleEditorChange}
                                                className="p-2"
                                            />
                                        </div>
                                        <div className="flex justify-end px-2">
                                            <Button type="submit" size="sm">
                                                Run
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={25}>
                            <div className="flex h-full ">
                                <div className="w-full max-w-5xl  p-2 border bg-muted rounded-md ">
                                    <div className="text-xl">Output Window</div>
                                    <div className="h-[20vh] max-h-[90vh] p-2 bg-accent text-white overflow-y-auto">
                                        <pre>{result}</pre>
                                    </div>
                                </div>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        )
    )
}
