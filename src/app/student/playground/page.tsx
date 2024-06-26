'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useLazyLoadedStudentData } from '@/store/store'
import { api } from '@/utils/axios.config'
import Image from 'next/image'
import { difficultyColor } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

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

    // const difficultyColors = {
    //     Easy: 'secondary',
    //     Medium: 'yellow-dark',
    //     Hard: 'destructive',
    // }
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

    return (
        <div>
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
                    <Select
                        value={selectedTopic}
                        onValueChange={setSelectedTopic}
                    >
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
                        <ToggleGroupItem
                            value="Arrays"
                            aria-label="Toggle Arrays"
                        >
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
                            {questions &&
                                questions.map(
                                    ({ id, title, difficulty, status }) => (
                                        <TableRow
                                            key={id}
                                            className={`w-full max-w-4xl cursor-pointer font-medium hover:bg-secondary/20 `}
                                            onClick={() =>
                                                handleQuestionRoute(id)
                                            }
                                        >
                                            <TableCell>{id}</TableCell>
                                            <TableCell>{title}</TableCell>
                                            <TableCell
                                                className={difficultyColor(
                                                    difficulty
                                                )}
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

            <div>
                <div className="flex justify-center">
                    <Image
                        src="/emptyStates/coming_soon.svg"
                        alt="Coding Playground"
                        width={250}
                        height={250}
                    />
                </div>
                <p className="text-lg mt-2 font-semibold">Coming Soon</p>
            </div>
        </div>
    )
}

export default CodingPlayground
