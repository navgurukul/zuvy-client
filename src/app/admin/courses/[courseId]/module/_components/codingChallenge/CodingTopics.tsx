import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface CodingTopicsProps {
    selectedTopic: string
    setSelectedTopic: any
    selectedDifficulty: string
    setSelectedDifficulty: React.Dispatch<React.SetStateAction<string>>
    selectedLanguage: string
    setSelectedLanguage: any
    searchQuestionsInAssessment: string
    setSearchQuestionsInAssessment: React.Dispatch<React.SetStateAction<string>>
    tags: any
}

const CodingTopics: React.FC<CodingTopicsProps> = ({
    selectedTopic,
    setSelectedTopic,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedLanguage,
    setSelectedLanguage,
    searchQuestionsInAssessment,
    setSearchQuestionsInAssessment,
    tags,
}) => {
    const allTopicsId: any = 0

    return (
        <div className="flex flex-col mb-5">
            <Input
                value={searchQuestionsInAssessment}
                onChange={(e) => setSearchQuestionsInAssessment(e.target.value)}
                placeholder="Search The Question By Name"
                className="w-full mb-2 "
            />

            <div className=" flex gap-2">
                <Select onValueChange={(value) => setSelectedTopic(value)}>
                    <SelectTrigger className="">
                        <SelectValue placeholder={selectedTopic} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Topics</SelectLabel>
                            <SelectItem value={allTopicsId}>
                                All Topics
                            </SelectItem>
                            {tags?.map((item: any) => {
                                return (
                                    <SelectItem key={item.id} value={item.id}>
                                        {item.tagName}
                                    </SelectItem>
                                )
                            })}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select onValueChange={(value) => setSelectedDifficulty(value)}>
                    <SelectTrigger className="">
                        <SelectValue placeholder={selectedDifficulty} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Difficulty</SelectLabel>
                            <SelectItem value="Any Difficulty">
                                Any Difficulty
                            </SelectItem>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

export default CodingTopics
