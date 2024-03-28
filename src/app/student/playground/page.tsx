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

const CodingPlayground = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedTopic, setSelectedTopic] = useState('All Topics')
    const problems = [
        {
            title: 'Invert a Linked List in Python and pass the two tests',
            difficulty: 'Medium',
            status: 'Not Attempted Yet',
            link: '/student/playground/editor',
        },
        {
            title: 'Invert a Linked List in Python and pass the two tests',
            difficulty: 'Medium',
            status: 'Not Attempted Yet',
            link: '/student/playground/editor',
        },
        {
            title: 'Invert a Linked List in Python and pass the two tests',
            difficulty: 'Easy',
            status: 'Needs to Attempt',
            link: '/student/playground/editor',
        },
        {
            title: 'Invert a Linked List in Python and pass the two tests',
            difficulty: 'Easy',
            status: 'Not Attempted Yet',
            link: '/problems/4',
        },
        {
            title: 'Invert a Linked List in Python and pass the two tests',
            difficulty: 'Medium',
            status: 'Accepted',
            link: '/student/playground/editor',
        },
        {
            title: 'Invert a Linked List in Python and pass the two tests',
            difficulty: 'Hard',
            status: 'Not Attempted Yet',
            link: '/student/playground/editor',
        },
        {
            title: 'Invert a Linked List in Python and pass the two tests',
            difficulty: 'Hard',
            status: 'Not Attempted Yet',
            link: '/problems/7',
        },
        {
            title: 'Invert a Linked List in Python and pass the two tests',
            difficulty: 'Hard',
            status: 'Not Attempted Yet',
            link: '/student/playground/editor',
        },
        {
            title: 'Invert a Linked List in Python and pass the two tests',
            difficulty: 'Hard',
            status: 'Not Attempted Yet',
            link: '/student/playground/editor',
        },
        {
            title: 'Invert a Linked List in Python and pass the two tests',
            difficulty: 'Hard',
            status: 'Not Attempted Yet',
            link: '/student/playground/editor',
        },
    ]
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
        return problems.filter((problem) =>
            problem.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }

    useEffect(() => {
        const filtered = filterProblems()
        setFilteredProblems(filtered)
    }, [searchTerm])

    const [filteredProblems, setFilteredProblems] = useState(filterProblems())

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Coding Playground</h1>
            <p className="mb-4">
                Practice problems for AFE + NavGurukul Python Course
            </p>
            <div className="flex mb-4">
                <Input
                    type="text"
                    placeholder="Problem Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger className="border border-gray-300">
                        <SelectValue placeholder="All Topics" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All Topics">All Topics</SelectItem>
                        <SelectItem value="Arrays">Arrays</SelectItem>
                        <SelectItem value="Linked Lists">
                            Linked Lists
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {typeof window !== 'undefined' && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Problem Title</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead>Solution Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="w-full max-w-4xl">
                        {filteredProblems.map((problem, index) => (
                            <TableRow
                                key={index}
                                className="w-full max-w-4xl cursor-pointer hover:bg-background"
                            >
                                <TableCell>
                                    <Link href={problem.link} passHref>
                                        {problem.title}
                                    </Link>
                                </TableCell>
                                <TableCell>{problem.difficulty}</TableCell>
                                <TableCell>{problem.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}

export default CodingPlayground
