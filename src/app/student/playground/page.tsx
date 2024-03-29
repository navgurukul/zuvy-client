'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    TableHead,
    TableHeader,
    TableRow,
    TableBody,
    TableCell,
    Table,
} from '@/components/ui/table'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useLazyLoadedStudentData } from '@/store/store'
import api from '@/utils/axios.config'

interface Question {
    title: string
    status: string
    difficulty: string // URL for the course image
    id: string
}

const CodingPlayground = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedTopic, setSelectedTopic] = useState('')
    const [questions, setQuestions] = useState<Question[]>([])

    const difficultyColors = {
        Easy: 'bg-green-200',
        Medium: 'bg-yellow-200',
        Hard: 'bg-red-200',
    }
    const statusColors = {
        'Not Attempted Yet': 'bg-gray-300',
        'Needs to Attempt': 'bg-orange-300',
        Accepted: 'bg-green-400',
    }

    const filterProblems = () => {
        return questions.filter((question) =>
            question.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id

    useEffect(() => {
        const filtered = filterProblems()
        setFilteredProblems(filtered)
    }, [searchTerm, questions])

    const [filteredProblems, setFilteredProblems] = useState(filterProblems())

    const getQuestions = async () => {
        try {
            await api
                .get(`/codingPlatform/allQuestions/${userID}`)
                .then((response) => {
                    setQuestions(response.data)
                    console.log(response.data)
                })
        } catch (error) {
            console.error('Error fetching courses:', error)
        }
    }

    useEffect(() => {
        console.log('id', userID)
        getQuestions()
    }, [userID])
    return (
        <div className="p-4 text-left">
            <h1 className="text-2xl font-bold mb-4">Coding Playground</h1>
            <p className="mb-4">
                Practice problems for AFE + NavGurukul Python Course
            </p>
            <div className="flex mb-2 w-1/4">
                <Input
                    type="text"
                    placeholder="Problem Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex mb-2">
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger className="border border-secondary w-[180px]">
                        <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                </Select>
                <ToggleGroup type="multiple" className="mx-2">
                    <ToggleGroupItem
                        value="All Topics"
                        aria-label="Toggle All Topics"
                    >
                        All Topics
                    </ToggleGroupItem>
                    <ToggleGroupItem value="Arrays" aria-label="Toggle Arrays">
                        Arrays
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="Linked Lists"
                        aria-label="Toggle Linked Lists"
                    >
                        Linked Lists
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="font-bold text-black">
                            Problem Title
                        </TableHead>
                        <TableHead className="font-bold text-black">
                            Difficulty
                        </TableHead>
                        <TableHead className="font-bold text-black">
                            Solution Status
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="w-full max-w-4xl">
                    {questions &&
                        filteredProblems.map((question, index) => (
                            <TableRow
                                key={index}
                                className="w-full max-w-4xl cursor-pointer hover:bg-secondary/20 "
                            >
                                <TableCell>
                                    <Link
                                        href={`/student/playground/${question.id}`}
                                        passHref
                                    >
                                        {question.title}
                                    </Link>
                                </TableCell>
                                <TableCell>{question.difficulty}</TableCell>
                                <TableCell>
                                    {question.status
                                        ? question.status
                                        : 'Not Appeared Yet'}
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default CodingPlayground
