'use client'
import React, { useEffect, useState } from 'react'
import { ChevronLeft, Search } from 'lucide-react'
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
import {
    getCodingQuestionTags,
    getEditCodingQuestionDialogs,
    getcodingQuestionState,
} from '@/store/store'
import { getAllCodingQuestions, filteredCodingQuestions } from '@/utils/admin'
import Image from 'next/image'
import { Spinner } from '@/components/ui/spinner'
import EditCodingQuestionForm from '../_components/EditCodingQuestionForm'
import useDebounce from '@/hooks/useDebounce'

export type Tag = {
    id: number
    tagName: string
}

const CodingProblems = () => {
    const { codingQuestions, setCodingQuestions } = getcodingQuestionState()
    const [allCodingQuestions, setAllCodingQuestions] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 500)
    const {
        setEditCodingQuestionId,
        isCodingEditDialogOpen,
        setIsCodingEditDialogOpen,
        isCodingDialogOpen,
        setIsCodingDialogOpen,
    } = getEditCodingQuestionDialogs()
    const { tags, setTags } = getCodingQuestionTags()
    const [selectedTag, setSelectedTag] = useState<Tag>(() => {
        if (typeof window !== 'undefined') {
            const storedTag = localStorage.getItem('codingCurrentTag')
            return storedTag !== null
                ? JSON.parse(storedTag)
                : { tagName: 'All Topics', id: -1 }
        }
        return { tagName: 'All Topics', id: -1 }
    })
    const [selectedDifficulty, setSelectedDifficulty] = useState('None')
    const [loading, setLoading] = useState(true)
    const [openEditDialog, setOpenEditDialog] = useState(false)
    const selectedLanguage = ''

    const handleTopicClick = (value: string) => {
        const tag = tags.find((t: Tag) => t.tagName === value) || {
            tagName: 'All Topics',
            id: -1,
        }
        setSelectedTag(tag)
        localStorage.setItem('codingCurrentTag', JSON.stringify(tag))
    }

    async function getAllTags() {
        const response = await api.get('Content/allTags')
        if (response) {
            const tagArr = [
                { tagName: 'All Topics', id: -1 },
                ...response.data.allTags,
            ]
            setTags(tagArr)
        }
    }

    useEffect(() => {
        getAllTags()
    }, [])

    useEffect(() => {
        getAllCodingQuestions(setAllCodingQuestions)
        filteredCodingQuestions(
            setCodingQuestions,
            selectedDifficulty,
            selectedTag,
            selectedLanguage,
            debouncedSearch
        )
    }, [searchTerm, selectedTag.id, selectedDifficulty, debouncedSearch, isCodingDialogOpen, openEditDialog])

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        setOpenEditDialog(isCodingEditDialogOpen)
    }, [isCodingEditDialogOpen])

    return (
        <>
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <Spinner className="text-secondary" />
                </div>
            ) : openEditDialog ? (
                <EditCodingQuestionForm />
            ) : (
                <div>
                    {allCodingQuestions.length > 0 && !isCodingDialogOpen ? (
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
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                        <Search
                                            className="text-gray-400"
                                            size={20}
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setIsCodingDialogOpen(true)}
                                >
                                    + Create Problems
                                </Button>
                            </div>
                            <div className="flex items-center">
                                <Select
                                    onValueChange={(value) =>
                                        setSelectedDifficulty(value)
                                    }
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="None">
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
                                    className="w-1 h-12 mx-4 bg-gray-400 rounded-lg"
                                />
                                <Select
                                    value={selectedTag.tagName}
                                    onValueChange={handleTopicClick}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Choose Topic" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tags.map((tag: Tag) => (
                                            <SelectItem
                                                key={tag.id}
                                                value={tag.tagName}
                                            >
                                                {tag.tagName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <DataTable
                                data={codingQuestions}
                                columns={columns}
                            />
                        </MaxWidthWrapper>
                    ) : (
                        <>
                            {!isCodingDialogOpen &&
                            !isCodingEditDialogOpen &&
                            codingQuestions.length === 0 ? (
                                <>
                                    <h1 className="text-left font-semibold text-2xl">
                                        Resource Library - Coding Problems
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
                                            No coding problems have been created
                                            yet. Start by adding the first one
                                        </h2>
                                        <Button
                                            onClick={() =>
                                                setIsCodingDialogOpen(true)
                                            }
                                        >
                                            + Create Problems
                                        </Button>
                                    </MaxWidthWrapper>
                                </>
                            ) : (
                                <>
                                    {isCodingDialogOpen &&
                                        !isCodingEditDialogOpen && (
                                            <MaxWidthWrapper className="flex flex-col justify-center items-center gap-5">
                                                <div
                                                    onClick={() =>
                                                        setIsCodingDialogOpen(
                                                            false
                                                        )
                                                    }
                                                    className="text-secondary cursor-pointer self-start flex"
                                                >
                                                    {' '}
                                                    <ChevronLeft /> Coding
                                                    Problems
                                                </div>
                                                <NewCodingProblemForm
                                                    tags={tags}
                                                    setIsDialogOpen={
                                                        setIsCodingDialogOpen
                                                    }
                                                    getAllCodingQuestions={
                                                        getAllCodingQuestions
                                                    }
                                                    setCodingQuestions={
                                                        setCodingQuestions
                                                    }
                                                />
                                            </MaxWidthWrapper>
                                        )}
                                    {isCodingEditDialogOpen &&
                                        !isCodingDialogOpen && (
                                            <EditCodingQuestionForm />
                                        )}
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </>
    )
}

export default CodingProblems
