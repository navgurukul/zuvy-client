'use client'
import React, { useState, useEffect } from 'react'

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
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Separator } from '@/components/ui/separator'
import { DataTable } from '@/app/_components/datatable/data-table'

import { columns } from './column'
import NewMcqProblemForm from '../_components/NewMcqProblemForm'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { getAllQuizData } from '@/store/store'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { RequestBodyType } from '../_components/NewMcqProblemForm'

type Props = {}
export type Tag = {
    id: number
    tagName: string
}

const Mcqs = (props: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [tags, setTags] = useState<Tag[]>([])
    const [selectedTag, setSelectedTag] = useState({
        tagName: 'AllTopics',
        id: -1,
    })

    const { quizData, setStoreQuizData } = getAllQuizData()
    const handleTopicClick = (tag: Tag) => {
        setSelectedTag(tag)
    }

    const handleAllTopicsClick = () => {
        setSelectedTag({ id: -1, tagName: 'AllTopics' })
    }

    const openModal = () => setIsOpen(true)
    const closeModal = () => setIsOpen(false)

    async function getAllTags() {
        const response = await api.get('Content/allTags')
        if (response) {
            setTags(response.data.allTags)
        }
    }

    async function getAllQuizQuestion() {
        await api.get(`/Content/allQuizQuestions`).then((res) => {
            setStoreQuizData(res.data)
        })
    }

    useEffect(() => {
        getAllTags()
        getAllQuizQuestion()
    }, [])

    console.log(quizData)
    const handleCreateQuizQuestion = async (requestBody: RequestBodyType) => {
        try {
            const res = await api.post(`/Content/quiz`, requestBody)
            console.log('Response:', res.data)
            toast({
                title: res.data.status || 'Success',
                description: res.data.message || 'Quiz Question Created',
            })
        } catch (error) {
            console.error('Error creating quiz question:', error)
            toast({
                title: 'Error',
                description:
                    'There was an error creating the quiz question. Please try again.',
            })
        }
    }
    return (
        <MaxWidthWrapper>
            <h1 className="text-left font-semibold text-2xl">
                Resource Library - MCQs
            </h1>
            <div className="flex justify-between">
                <div className="relative w-full">
                    <Input
                        placeholder="Search for Name, Email"
                        className="w-1/4 p-2 my-6 input-with-icon pl-8" // Add left padding for the icon
                    />
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <Search className="text-gray-400" size={20} />
                    </div>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>+ Create </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>New MCQ</DialogTitle>
                        </DialogHeader>
                        <div className="w-full">
                            <NewMcqProblemForm
                                handleCreateQuizQuestion={
                                    handleCreateQuizQuestion
                                }
                                tags={tags}
                                closeModal={closeModal}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="flex items-center">
                <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="DIfficulty" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="apple">Easy</SelectItem>
                            <SelectItem value="banana">Medium</SelectItem>
                            <SelectItem value="blueberry">Hard</SelectItem>
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

                    {tags.map((tag: Tag) => (
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

            <DataTable data={quizData} columns={columns} />
        </MaxWidthWrapper>
    )
}

export default Mcqs
