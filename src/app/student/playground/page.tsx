'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
    // misc
    const router = useRouter()
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id

    // state and variables
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedTopic, setSelectedTopic] = useState('')
    const [questions, setQuestions] = useState([])
    const [filteredQuestions, setFilteredQuestions] = useState([])

    const difficultyColors = {
        Easy: 'secondary',
        Medium: 'yellow-dark',
        Hard: 'destructive',
    }
    const statusColors = {
        null: 'gray-300',
        'Needs to Attempt': 'destructive',
        Accepted: 'secondary',
    }

    // func
    const handleQuestionRoute = (id: string) => {
        router.push(`/student/playground/${id}  `)
    }

    const getQuestions = async () => {
        try {
            await api
                .get(`/codingPlatform/allQuestions/${userID}`)
                .then((response) => {
                    setQuestions(response.data)
                })
        } catch (error) {
            console.error('Error fetching courses:', error)
        }
    }

    // async
    useEffect(() => {
        if (userID) {
            getQuestions()
        }
    }, [userID])

    useEffect(() => {
        const filterQuestions = () => {
            setFilteredQuestions(
                questions.filter((question: Question) =>
                    question.title
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                )
            )
        }

        filterQuestions()

        return () => {
            setFilteredQuestions([])
        }
    }, [questions, searchTerm])

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
            <div className="mt-10">
                <Table>
                    <TableHeader className="bg-muted">
                        <TableRow>
                            <TableHead className="font-bold text-black">
                                ID
                            </TableHead>
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
                        {filteredQuestions &&
                            filteredQuestions.map(
                                ({ id, title, difficulty, status }) => (
                                    <TableRow
                                        key={id}
                                        className={`w-full max-w-4xl cursor-pointer font-medium hover:bg-secondary/20 `}
                                        onClick={() => handleQuestionRoute(id)}
                                    >
                                        <TableCell>{id}</TableCell>
                                        <TableCell>{title}</TableCell>
                                        <TableCell
                                            className={`text-${difficultyColors[difficulty]}`}
                                        >
                                            {difficulty}
                                        </TableCell>
                                        <TableCell
                                            className={`text-${statusColors[status]}`}
                                        >
                                            {status
                                                ? status
                                                : 'Not Appeared Yet'}
                                        </TableCell>
                                    </TableRow>
                                )
                            )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default CodingPlayground
