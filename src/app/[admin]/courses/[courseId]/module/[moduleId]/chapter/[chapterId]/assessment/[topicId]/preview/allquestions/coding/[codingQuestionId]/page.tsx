'use client'

import { Button } from '@/components/ui/button'
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from '@/components/ui/resizable'
import { ChevronLeft, Code } from 'lucide-react'
import { api } from '@/utils/axios.config'
import Editor from '@monaco-editor/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { b64DecodeUnicode } from '@/utils/base64'
import {
    QuestionIdquestionDetails,
    QuestionIdTestCase,
    QuestionIdInput,
    QuestionParams,
} from '@/app/[admin]/courses/[courseId]/module/[moduleId]/chapter/[chapterId]/assessment/[topicId]/preview/allquestions/coding/[codingQuestionId]/articleCodingPageType'

function IdePreview({ params }: { params: QuestionParams }) {
    const [questionDetails, setQuestionDetails] =
        useState<QuestionIdquestionDetails>({
            title: '',
            description: '',
            constraints: '',
            testCases: [],
            examples: {
                input: [],
                output: 0,
            },
        })
    const [currentCode, setCurrentCode] = useState('')
    const [languageId, setLanguageId] = useState(93)
    const [language, setLanguage] = useState('')
    const [testCases, setTestCases] = useState<any>([])
    const [templates, setTemplates] = useState<any>([])
    const router = useRouter()

    const editorLanguages = [
        { lang: 'java', id: 91 },
        { lang: 'python', id: 71 },
        { lang: 'javascript', id: 93 },
        { lang: 'cpp', id: 105 },
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

    function handleEditorChange(value: any) {
        setCurrentCode(value)
    }

    const getQuestionDetails = async () => {
        try {
            await api
                .get(
                    `codingPlatform/get-coding-question/${params.codingQuestionId}`
                )
                .then((response) => {
                    setQuestionDetails(response?.data.data)

                    setTestCases(response?.data?.data?.testCases)

                    setTemplates(response?.data?.data?.templates)
                })
        } catch (error) {
            console.error('Error fetching courses:', error)
        }
    }

    const formatValue = (value: any, type: string): string => {
        if (Array.isArray(value)) {
            if (type === 'arrayOfNum') {
                return `[${(value as number[]).join(', ')}]`
            }
            if (type === 'arrayOfStr') {
                return `[${(value as string[])
                    .map((v) => `"${v}"`)
                    .join(', ')}]`
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

    useEffect(() => {
        getQuestionDetails()
    }, [language])

    useEffect(() => {
        if (templates?.[language]?.template) {
            setCurrentCode(b64DecodeUnicode(templates?.[language]?.template))
        }
    }, [language])

    return (
        <div className="min-h-screen">
            <div className="flex justify-between mb-5">
                <div
                    className="flex items-center cursor-pointer"
                    onClick={router.back}
                >
                    <ChevronLeft strokeWidth={2} size={24} />
                    <h1 className="font-extrabold text-[15px]">
                        All Questions
                    </h1>
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
                                                testCase: QuestionIdTestCase,
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
                                                                      input: QuestionIdInput,
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
                                                                          {
                                                                              input.parameterName
                                                                          }{' '}
                                                                          (
                                                                          {
                                                                              input.parameterType
                                                                          }
                                                                          ) ={' '}
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
                                                            {
                                                                testCase
                                                                    .expectedOutput
                                                                    .parameterType
                                                            }{' '}
                                                            {'='}{' '}
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
                                    <div className="w-full max-w-5xl bg-white p-4 border rounded-lg shadow-sm">
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
                                                    height="52vh"
                                                    language={language}
                                                    theme="vs"
                                                    value={currentCode}
                                                    onChange={
                                                        handleEditorChange
                                                    }
                                                    className="p-2 border rounded-b-lg bg-white"
                                                    defaultValue="Please Select a language above! "
                                                />
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel className="" defaultSize={40}>
                                <div className="flex h-full">
                                    <div className="w-full max-w-5xl bg-white p-4 mx-2 border rounded-lg shadow-sm">
                                        <div className="flex justify-between p-3 bg-gray-50 border-b rounded-t-lg">
                                            <p className="text-lg text-gray-800 font-semibold">
                                                Output Window
                                            </p>
                                        </div>
                                        <div className="h-full p-4 text-start text-gray-800 overflow-y-auto font-mono bg-gray-50 border border-gray-100 rounded-b-lg"></div>
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

export default IdePreview
