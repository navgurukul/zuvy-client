'use client'

import { Button } from '@/components/ui/button'
import api from '@/utils/axios.config'
import Editor from '@monaco-editor/react'
import { SetStateAction, useState } from 'react'

export default function IDE() {
    const [currentCode, setCurrentCode] = useState('')
    const [result, setResult] = useState('')
    const [languageId, setLanguageId] = useState(48)
    const [codeError, setCodeError] = useState('')
    const editorLanguages = [
        { lang: 'java', id: 91 },
        { lang: 'python', id: 71 },
        { lang: 'javascript', id: 93 },
        { lang: 'cpp', id: 52 },
        { lang: 'c', id: 48 },
    ]
    const [language, setLanguage] = useState('c')
    const handleLanguageChange = (lang: string) => {
        setLanguage(lang)
        const langID = getDataFromField(editorLanguages, lang, 'lang', 'id')
        setLanguageId(langID)
    }

    const encodeToBase64 = (str: string) => {
        return btoa(str)
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
                sourceCode: encodeToBase64(currentCode),
                stdInput: 'aGVsbG8gd29ybGQ=',
            })

            console.log(response.data)
            setResult(response.data.stdout)
            setCodeError('')
        } catch (error: any) {
            setResult('')
            console.error('Error getting modules progress', error)
            setCodeError(error?.message)
        }
        console.log('Code Submitted')
    }
    function handleEditorChange(value: any) {
        setCurrentCode(value)
        console.log(currentCode)
    }
    return (
        <div className="grid grid-cols-2 ">
            <div className="w-full max-w-4xl p-2 border bg-muted rounded-md">
                <h1>Add Two Numbers</h1>
                You are given two non-empty linked lists representing two
                non-negative integers. The digits are stored in reverse order,
                and each of their nodes contains a single digit. Add the two
                numbers and return the sum as a linked list. You may assume the
                two numbers do not contain any leading zero, except the number 0
                itself.
            </div>
            <div className="flex-none justify-end items-start h-full ">
                <div className="w-full max-w-4xl p-2 border bg-muted rounded-md">
                    <form onSubmit={handleSubmit}>
                        <div>
                            <h6>Add your code</h6>
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
                                height="50vh"
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
                                <Button type="submit">Run</Button>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="w-full max-w-4xl p-2 mt-2 border bg-muted rounded-md">
                    <div>Output Window</div>
                    <div className="h-40 p-2 bg-accent text-white">
                        {result}
                        <div className="text-destructive">{codeError}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
