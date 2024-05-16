'use client'
import React, { useEffect, useState } from 'react'

import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Separator } from '@/components/ui/separator'
import { DataTable } from '@/app/_components/datatable/data-table'
import { columns } from './column'
import NewCodingProblemForm from '../_components/NewCodingProblemForm'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import * as z from 'zod'

type Props = {}

const CodingProblems = (props: Props) => {
    const arr = ['AllTopics', 'Arrays', 'Linked Lists', 'Databases']
    const [selectedTopic, setSelectedTopic] = useState('')
    const [codingQuestions, setCodingQuestions] = useState([])
    const [selectedDifficulty, setSelectedDifficulty] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [searchedQuestions, setSearchedQuestions] = useState([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [tags, setTags] = useState([])

    const handleTopicClick = (topic: any) => {
        setSelectedTopic(topic)
    }
    async function getAllCodingQuestions() {
        // fetch all Coding Questions
        const response = await api.get('Content/allCodingQuestions')
        setCodingQuestions(response.data)
    }
    async function getSearchQuestions() {
        // fetch all Searched Coding Questions
        if (selectedDifficulty !== 'any') {
            const response = await api.get(
                `Content/allCodingQuestions?difficulty=${selectedDifficulty}&searchTerm=${searchTerm}`
            )
            setSearchedQuestions(response.data)
        } else {
            const response = await api.get(
                `Content/allCodingQuestions?searchTerm=${searchTerm}`
            )
            setSearchedQuestions(response.data)
        }
    }

    async function getAllTags() {
        const response = await api.get('Content/allTags')
        if (response) {
            setTags(response.data.allTags)
        }
    }

    const filteredQuestions =
        selectedDifficulty && selectedDifficulty !== 'any'
            ? codingQuestions.filter(
                  (question: any) => question.difficulty === selectedDifficulty
              )
            : codingQuestions

    useEffect(() => {
        getAllCodingQuestions()
        getAllTags()
    }, [])

    useEffect(() => {
        searchTerm.trim() !== '' && getSearchQuestions()
    }, [searchTerm])

    return (
        <MaxWidthWrapper>
            <h1 className="text-left font-semibold text-2xl">
                Resource Library - Coding Problems
            </h1>
            <div className="flex justify-between">
                <div className="relative w-full">
                    <Input
                        placeholder="Problem Name..."
                        className="w-1/4 p-2 my-6 input-with-icon pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <Search className="text-gray-400" size={20} />
                    </div>
                </div>
                <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>+ Create Problems</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>New Coding Problem</DialogTitle>
                        </DialogHeader>
                        <div className="w-full">
                            <NewCodingProblemForm
                                tags={tags}
                                setIsDialogOpen={setIsDialogOpen}
                                getAllCodingQuestions={getAllCodingQuestions}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="flex items-center">
                <Select onValueChange={(value) => setSelectedDifficulty(value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="any">Any Difficulty</SelectItem>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Separator
                    orientation="vertical"
                    className="w-1 h-12 ml-4 bg-gray-400 rounded-lg"
                />
                {arr.map((topic) => (
                    <Button
                        className={`mx-3 rounded-3xl ${
                            selectedTopic === topic
                                ? 'bg-secondary text-white'
                                : 'bg-gray-200 text-black'
                        }`}
                        key={topic}
                        onClick={() => handleTopicClick(topic)}
                    >
                        {topic}
                    </Button>
                ))}
            </div>

            <DataTable
                data={searchTerm ? searchedQuestions : filteredQuestions}
                columns={columns}
            />
        </MaxWidthWrapper>
    )
}

export default CodingProblems
