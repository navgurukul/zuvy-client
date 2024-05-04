'use client'
import React, { useState } from 'react'

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
import NewMcqProblemForm from '../_components/NewMcqProblemForm'

type Props = {}

const Mcqs = (props: Props) => {
    const arr = ['AllTopics', 'Arrays', 'Linked Lists', 'Databases']
    const [selectedTopic, setSelectedTopic] = useState('')

    const handleTopicClick = (topic: any) => {
        setSelectedTopic(topic)
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
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>+ Create </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>New MCQ</DialogTitle>
                        </DialogHeader>
                        <div className="w-full">
                            <NewMcqProblemForm />
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
            {/* <div>
                {selectedTopic === 'All Topics' && (
                    <div>All topics content</div>
                )}
                {selectedTopic === 'Arrays' && <div>Arrays content</div>}
                {selectedTopic === 'Linked Lists' && (
                    <div>Linked Lists content</div>
                )}
                {selectedTopic === 'Databases' && <div>Databases content</div>}
            </div> */}
            <DataTable data={[]} columns={columns} />
        </MaxWidthWrapper>
    )
}

export default Mcqs
