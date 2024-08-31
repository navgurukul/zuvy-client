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
import NewOpenEndedQuestionForm from '@/app/admin/resource/_components/NewOpenEndedQuestionForm'
import { api } from '@/utils/axios.config'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { getCodingQuestionTags, getopenEndedQuestionstate } from '@/store/store'
import { getAllOpenEndedQuestions, getAllTags } from '@/utils/admin'
import EditOpenEndedQuestionForm from '../_components/EditOpenEndedQuestionForm'
import Image from 'next/image'
import { Spinner } from '@/components/ui/spinner'

type Props = {}

const OpenEndedQuestions = (props: Props) => {
    const [selectedTag, setSelectedTag] = useState({
        tagName: 'AllTopics',
        id: -1,
    })
    const { tags, setTags } = getCodingQuestionTags()
    const [selectedDifficulty, setSelectedDifficulty] = useState('any')
    const { openEndedQuestions, setOpenEndedQuestions } =
        getopenEndedQuestionstate()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)

    const handleTopicClick = (tag: any) => {
        setSelectedTag(tag)
    }

    const handleAllTopicsClick = () => {
        setSelectedTag({ id: -1, tagName: 'AllTopics' })
    }

    const filteredQuestions = openEndedQuestions?.filter((question: any) => {
        const difficultyMatches =
            selectedDifficulty !== 'any'
                ? question.difficulty === selectedDifficulty
                : true
        const tagMatches =
            selectedTag?.tagName !== 'AllTopics'
                ? question.tagId === selectedTag?.id
                : true
        const searchTermMatches =
            searchTerm !== ''
                ? question.question
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                : true

        const isQuestionIncluded =
            difficultyMatches && tagMatches && searchTermMatches
        return isQuestionIncluded
    })

    useEffect(() => {
        getAllTags(setTags)
    }, [setTags])

    useEffect(() => {
        getAllOpenEndedQuestions(setOpenEndedQuestions)
    }, [searchTerm, selectedTag, selectedDifficulty, setOpenEndedQuestions])

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    return (
        <>
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <Spinner className="text-secondary" />
                </div>
            ) : (
                <div>
                    {openEndedQuestions.length > 0 ? (
                        <MaxWidthWrapper>
                            <h1 className="text-left font-semibold text-2xl">
                                Resource Library - Open-Ended-Questions
                            </h1>
                            <div className="flex justify-between">
                                <div className="relative w-full">
                                    <Input
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        placeholder="Search for Name, Email"
                                        className="w-1/4 p-2 my-6 input-with-icon pl-8" // Add left padding for the icon
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                        <Search
                                            className="text-gray-400"
                                            size={20}
                                        />
                                    </div>
                                </div>
                                <Dialog
                                    onOpenChange={setIsDialogOpen}
                                    open={isDialogOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button> Create Question</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>
                                                New Open-Ended Questions
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="w-full">
                                            <NewOpenEndedQuestionForm
                                                tags={tags}
                                                setIsDialogOpen={
                                                    setIsDialogOpen
                                                }
                                                getAllOpenEndedQuestions={
                                                    getAllOpenEndedQuestions
                                                }
                                                setOpenEndedQuestions={
                                                    setOpenEndedQuestions
                                                }
                                            />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <div className="flex items-center">
                                <Select
                                    onValueChange={(value) =>
                                        setSelectedDifficulty(value)
                                    }
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Any Difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="any">
                                                Any Difficulty
                                            </SelectItem>
                                            <SelectItem value="Easy">
                                                Easy
                                            </SelectItem>
                                            <SelectItem value="Medium">
                                                Medium
                                            </SelectItem>
                                            <SelectItem value="Hard">
                                                Hard
                                            </SelectItem>
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
                                            onClick={() =>
                                                handleTopicClick(tag)
                                            }
                                        >
                                            {tag.tagName}
                                        </Button>
                                    ))}
                                </ScrollArea>
                            </div>

                            <DataTable
                                data={filteredQuestions}
                                columns={columns}
                            />
                        </MaxWidthWrapper>
                    ) : (
                        <>
                            <h1 className="text-left font-semibold text-2xl">
                                Resource Library - Open-Ended-Questions
                            </h1>
                            <MaxWidthWrapper className="flex flex-col justify-center items-center gap-5">
                                <div>
                                    <Image
                                        src="/resource_library_empty_state.svg"
                                        alt="Empty State"
                                        width={500}
                                        height={500}
                                    />
                                </div>
                                <h2>
                                    No open-ended questions have been created
                                    yet. Start by adding the first one
                                </h2>
                                <Dialog
                                    onOpenChange={setIsDialogOpen}
                                    open={isDialogOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button> Create Question</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>
                                                New Open-Ended Questions
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="w-full">
                                            <NewOpenEndedQuestionForm
                                                tags={tags}
                                                setIsDialogOpen={
                                                    setIsDialogOpen
                                                }
                                                getAllOpenEndedQuestions={
                                                    getAllOpenEndedQuestions
                                                }
                                                setOpenEndedQuestions={
                                                    setOpenEndedQuestions
                                                }
                                            />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </MaxWidthWrapper>
                        </>
                    )}
                </div>
            )}
        </>
    )
}

export default OpenEndedQuestions
