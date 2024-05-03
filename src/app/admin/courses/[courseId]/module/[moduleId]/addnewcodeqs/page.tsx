'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, Plus } from 'lucide-react'

interface CodingProblemProps {
    onSubmit: (data: CodingProblemData) => void
}

interface CodingProblemData {
    title: string
    description: string
    difficulty: string
    tags: number
    constraints: string
    authorId: number
    examples: { input: number[]; output: number[] }[]
    testCases: { input: number[]; output: number[] }[]
    expectedOutput: number[]
    solution: string
    createdAt: string
    updatedAt: string
}

function CodingProblem() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [difficulty, setDifficulty] = useState('Easy')
    const [tags, setTags] = useState(2) // Assuming initial value for tags is 2
    const [constraints, setConstraints] = useState('')
    const [authorId] = useState(45499) // Assuming authorId is fixed

    const [examples, setExamples] = useState<{ input: any[]; output: any[] }[]>(
        []
    )
    const [testCases, setTestCases] = useState<
        { input: any[]; output: any[] }[]
    >([])
    const [expectedOutput, setExpectedOutput] = useState<number[]>([])
    const [solution, setSolution] = useState('')

    const handleExampleChange = (
        index: number,
        type: string,
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newExamples: any = [...examples]
        newExamples[index][type] = e.target.value
        setExamples(newExamples)
    }

    const handleTestCaseChange = (
        index: number,
        type: string,
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newTestCases: any = [...testCases]
        newTestCases[index][type] = e.target.value
        setTestCases(newTestCases)
    }

    const handleSubmit = () => {
        const data: CodingProblemData = {
            title,
            description,
            difficulty,
            tags,
            constraints,
            authorId,
            examples,
            testCases,
            expectedOutput,
            solution,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    }

    return (
        <div className="flex flex-col justify-center items-center w-full">
            <div className="w-full p-10">
                <div className="flex ">
                    <Input
                        placeholder="Add a title here..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-2/5 text-2xl text-left font-semibold border-0 bg-gray-100 rounded-md py-2 px-4 focus:outline-none"
                    />
                </div>
                <div className="text-left text-gray-700 font-semibold my-6">
                    <Input
                        placeholder="Add a description here..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="text-2xl text-left font-semibold border-0 bg-gray-100 rounded-md py-2 px-4 focus:outline-none"
                    />
                </div>
                <div className=" flex flex-col ">
                    <Input
                        placeholder="Add constraints here..."
                        value={constraints}
                        onChange={(e) => setConstraints(e.target.value)}
                        className=" border-gray-400 rounded-lg "
                    />
                    {/* Examples */}
                    <div className="">
                        <h1 className="text-left font-semibold">Examples</h1>
                        {examples.map((example, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-center"
                            >
                                <Input
                                    type="number"
                                    placeholder="Input"
                                    value={example.input.toString()}
                                    onChange={(e) =>
                                        handleExampleChange(index, 'input', e)
                                    }
                                    className="w-full border-gray-400 rounded-lg  no-spinners"
                                />
                                <Input
                                    type="number"
                                    placeholder="Output"
                                    value={example.output.toString()}
                                    onChange={(e) =>
                                        handleExampleChange(index, 'output', e)
                                    }
                                    className="w-full border-gray-400 rounded-lg no-spinners"
                                />
                            </div>
                        ))}
                        <Button
                            onClick={() =>
                                setExamples([
                                    ...examples,
                                    { input: [], output: [] },
                                ])
                            }
                            className="mt-2"
                        >
                            Add Example
                        </Button>
                    </div>
                    {/* Test Cases */}
                    <div className="w-full my-6">
                        <h1 className="text-left font-semibold">Test Cases</h1>
                        {testCases.map((testCase, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-center "
                            >
                                <Input
                                    type="number"
                                    placeholder="Input"
                                    value={testCase.input.toString()}
                                    onChange={(e) =>
                                        handleTestCaseChange(index, 'input', e)
                                    }
                                    className="w-full border-gray-400 rounded-lg p-2 no-spinners"
                                />
                                <Input
                                    type="number"
                                    placeholder="Output"
                                    value={testCase.output.toString()}
                                    onChange={(e) =>
                                        handleTestCaseChange(index, 'output', e)
                                    }
                                    className="w-full border-gray-400 rounded-lg p-2 no-spinners"
                                />
                            </div>
                        ))}
                        <Button
                            onClick={() =>
                                setTestCases([
                                    ...testCases,
                                    { input: [], output: [] },
                                ])
                            }
                            className="mt-2"
                        >
                            Add Test Case
                        </Button>
                    </div>
                    <Input
                        placeholder="Solution"
                        value={solution}
                        onChange={(e) => setSolution(e.target.value)}
                        className=" border-gray-400 rounded-lg "
                    />
                    <Button onClick={handleSubmit} className="mt-4">
                        Submit
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default CodingProblem
