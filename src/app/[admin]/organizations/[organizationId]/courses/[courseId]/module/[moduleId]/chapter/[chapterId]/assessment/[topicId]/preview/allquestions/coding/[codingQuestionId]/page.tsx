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
} from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/module/[moduleId]/chapter/[chapterId]/assessment/[topicId]/preview/allquestions/coding/[codingQuestionId]/articleCodingPageType'

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
        <div>
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
                            <div className="w-full max-w-12xl p-2 bg-muted text-left">
                                <div className="p-2">
                                    <h1 className="text-xl font-bold">
                                        {questionDetails?.title}
                                    </h1>
                                    <p>{questionDetails?.description}</p>
                                    <p className="mt-3">
                                        <span className="font-bold">
                                            Constraints:
                                        </span>{' '}
                                        {questionDetails?.constraints}
                                    </p>

                                    {testCases
                                        ?.slice(0, 2)
                                        .map(
                                            (
                                                testCase: QuestionIdTestCase,
                                                index: number
                                            ) => (
                                                <div
                                                    key={index}
                                                    className="bg-gray-200 shadow-sm rounded-lg p-4 my-4"
                                                >
                                                    <h2 className="text-xl font-semibold mb-2">
                                                        Test Case {index + 1}
                                                    </h2>

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
                                                                      key={idx}
                                                                      className="text-gray-700"
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
                                                                  [key, value],
                                                                  idx: number
                                                              ) => (
                                                                  <p
                                                                      key={key}
                                                                      className="text-gray-700"
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

                                                    <p className="text-gray-700 mt-2">
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
                                                    theme="vs-dark"
                                                    value={currentCode}
                                                    onChange={
                                                        handleEditorChange
                                                    }
                                                    className="p-2"
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
                                    <div className="w-full max-w-5xl bg-muted p-2 mx-2">
                                        <div className="flex justify-between p-2 bg-gray-800 border-b border-gray-700">
                                            <p className="text-lg text-gray-300">
                                                Output Window
                                            </p>
                                        </div>
                                        <div className="h-full p-4 text-start text-gray-100 overflow-y-auto font-mono bg-gray-900 border border-gray-700 rounded-b-lg"></div>
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
