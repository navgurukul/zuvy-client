'use client'

// External imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// Internal imports
import { useLazyLoadedStudentData, getCodingQuestionTags } from '@/store/store'
import { api } from '@/utils/axios.config'
import { getAllTags } from '@/utils/admin'
import { difficultyColor } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { toast } from '@/components/ui/use-toast'

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
    const userID = studentData?.id

    // state and variables
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedTopic, setSelectedTopic] = useState({
        tagName: 'All Topics',
        id: -1,
    })
    const [selectedDifficulty, setSelectedDifficulty] = useState('All')
    const [questions, setQuestions] = useState([])
    const { tags, setTags } = getCodingQuestionTags()

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
            await api.get(`/Content/allCodingQuestions`).then((response) => {
                setQuestions(response.data.data)
            })
        } catch (error) {
            toast({
                title: 'Error:',
                description:
                    'An error occurred while fetching coding questions',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
            // console.error('Error fetching courses:', error)
        }
    }

    // async
    useEffect(() => {
        if (userID) {
            getQuestions()
        }
    }, [userID])

    useEffect(() => {
        getAllTags(setTags)
    }, [])

    const handleTopicClick = (tag: any) => {
        setSelectedTopic(tag)
    }

    const handleAllTopicsClick = () => {
        setSelectedTopic({ id: -1, tagName: 'All Topics' })
    }

    const filteredQuestions = questions.filter((question: any) => {
        return (
            (selectedDifficulty === 'All' ||
                question.difficulty === selectedDifficulty) &&
            (selectedTopic.id === -1 || question.tagId === selectedTopic.id) &&
            (searchTerm === '' ||
                question.title.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    })

    return (
        <div>
            {questions.length > 0 ? (
                <div className="p-4 text-left">
                    <h1 className="text-2xl font-bold mb-4">
                        Coding Playground
                    </h1>
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
                            // value={selectedTopic.tagName}
                            // onValueChange={(value) =>
                            //     setSelectedTopic(
                            //         tags.find((tag) => tag?.tagName === value)
                            //     )
                            // }
                            value={selectedDifficulty}
                            onValueChange={(value) =>
                                setSelectedDifficulty(value)
                            }
                        >
                            <SelectTrigger className="border border-secondary w-[180px]">
                                <SelectValue placeholder="Difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">
                                    Select Difficulty Level
                                </SelectItem>
                                <SelectItem value="Easy">Easy</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Hard">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                        <ScrollArea className="flex text-nowrap mx-2">
                            <ScrollBar orientation="horizontal" />
                            <Button
                                className={`mx-3 rounded-3xl ${
                                    selectedTopic.tagName === 'All Topics'
                                        ? 'bg-secondary text-white'
                                        : 'bg-gray-200 text-black'
                                }`}
                                onClick={handleAllTopicsClick}
                            >
                                All Topics
                            </Button>
                            {tags.map((tag: any) => (
                                <Button
                                    className={`mx-3 rounded-3xl ${
                                        selectedTopic === tag
                                            ? 'bg-secondary text-white'
                                            : 'bg-gray-200 text-black'
                                    }`}
                                    key={tag.id}
                                    onClick={() => handleTopicClick(tag)}
                                >
                                    {tag?.tagName}
                                </Button>
                            ))}
                        </ScrollArea>
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
                                {/* {questions &&
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
                                    )} */}
                                {filteredQuestions.map(
                                    ({ id, title, difficulty, status }) => (
                                        <TableRow
                                            key={id}
                                            className={`w-full max-w-4xl cursor-pointer font-medium hover:bg-secondary/20`}
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
            ) : (
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
            )}
        </div>
    )
}

export default CodingPlayground
