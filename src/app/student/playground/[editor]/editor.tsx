'use client'

import { Button } from '@/components/ui/button'
import api from '@/utils/axios.config'
import Editor from '@monaco-editor/react'
import { ArrowBigLeft, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function IDE({ params }: { params: { editor: string } }) {
    const [currentCode, setCurrentCode] = useState('')
    const [result, setResult] = useState('')
    const [languageId, setLanguageId] = useState(48)
    const [codeError, setCodeError] = useState('')
    const [language, setLanguage] = useState('c')
    const router = useRouter()

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
            const response = await api.post(`/codingPlatform/submit`, {
                languageId: getDataFromField(
                    editorLanguages,
                    languageId,
                    'lang',
                    'id'
                ),
                sourceCode: b64EncodeUnicode(currentCode),
                stdInput: 'aGVsbG8gd29ybGQ=',
            })
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

    const handleBack = () => {
        router.back()
    }
    return (
        <div className="grid grid-cols-2 gap-2">
            <div className="w-full max-w-4xl p-2 border bg-muted rounded-md text-left">
                <div className="flex items-center ">
                    <Button variant="ghost" size="icon" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl p-2">Add Two Numbers</h1>
                </div>
                <div className="px-2">
                    You are given two non-empty linked lists representing two
                    non-negative integers. The digits are stored in reverse
                    order, and each of their nodes contains a single digit. Add
                    the two numbers and return the sum as a linked list. You may
                    assume the two numbers do not contain any leading zero,
                    except the number 0 itself.
                </div>
            </div>
            <div className="flex-none justify-end items-start h-full ">
                <div className="w-full max-w-4xl p-2 border bg-muted rounded-md">
                    <form onSubmit={handleSubmit}>
                        <div>
                            <div className="text-2xl">Add your code</div>
                            <select
                                value={language}
                                onChange={(e) =>
                                    handleLanguageChange(e.target.value)
                                }
                                className="p-1 m-2 rounded-md"
                            >
                                {editorLanguages.map((lang) => (
                                    <option key={lang.id} value={lang.lang}>
                                        {lang.lang}
                                    </option>
                                ))}
                            </select>
                            <Editor
                                height="45vh"
                                language={language}
                                // defaultValue='console.log("Zuvy");'
                                theme="vs-dark"
                                value={currentCode}
                                onChange={handleEditorChange}
                            />
                        </div>
                        <div className="flex justify-between pt-2">
                            <div className="flex items-center space-x-5"></div>
                            <div className="flex-shrink-0">
                                <Button type="submit" size="sm">
                                    Run
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="w-full max-w-4xl p-2 mt-2 border bg-muted rounded-md ">
                    <div className="text-xl">Output Window</div>
                    <div className="h-[20vh] p-2 bg-accent text-white overflow-y-auto">
                        <pre>{result}</pre>
                    </div>
                </div>
            </div>
        </div>
    )
}
