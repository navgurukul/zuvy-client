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
import { columns } from '@/app/admin/resource/coding/column'
import NewCodingProblemForm from '@/app/admin/resource/_components/NewCodingProblemForm'
import { api } from '@/utils/axios.config'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { getcodingQuestionState } from '@/store/store'
import { getAllCodingQuestions } from '@/utils/admin'

type Props = {}

const CodingProblems = (props: Props) => {
    const { codingQuestions, setCodingQuestions } = getcodingQuestionState()

    const [searchTerm, setSearchTerm] = useState('')
    const [searchedQuestions, setSearchedQuestions] = useState([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [tags, setTags] = useState([])
    const [selectedTag, setSelectedTag] = useState({
        tagName: 'AllTopics',
        id: -1,
    })
    const [selectedDifficulty, setSelectedDifficulty] = useState('any')

    const handleTopicClick = (tag: any) => {
        setSelectedTag(tag)
    }

    const handleAllTopicsClick = () => {
        setSelectedTag({ id: -1, tagName: 'AllTopics' })
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

    const filteredQuestions = codingQuestions.filter((question: any) => {
        const difficultyMatches =
            selectedDifficulty !== 'any'
                ? question.difficulty === selectedDifficulty
                : true
        const tagMatches =
            selectedTag?.tagName !== 'AllTopics'
                ? question.tags === selectedTag?.id
                : true

        const isQuestionIncluded = difficultyMatches && tagMatches
        return isQuestionIncluded
    })

    useEffect(() => {
        getAllCodingQuestions(setCodingQuestions)
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
                                setCodingQuestions={setCodingQuestions}
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

                <ScrollArea className=" text-nowrap ">
                    <ScrollBar orientation="horizontal" />
                    <Button
                        className={`mx-3 rounded-3xl ${
                            selectedTag?.tagName === 'AllTopics'
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
                                selectedTag === tag
                                    ? 'bg-secondary text-white'
                                    : 'bg-gray-200 text-black'
                            }`}
                            key={tag?.id}
                            onClick={() => handleTopicClick(tag)}
                        >
                            {tag.tagName}
                        </Button>
                    ))}
                </ScrollArea>
            </div>

            <DataTable
                data={searchTerm ? searchedQuestions : filteredQuestions}
                columns={columns}
            />
        </MaxWidthWrapper>
    )
}

export default CodingProblems
