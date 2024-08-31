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
import useDebounce from '@/hooks/useDebounce'

interface CodingTopicsProps {
    setSearchTerm: (newSearchTerm: string) => void
    searchTerm: string
    selectedTopic: string
    setSelectedTopic: React.Dispatch<React.SetStateAction<string>>
    selectedDifficulty: string
    setSelectedDifficulty: React.Dispatch<React.SetStateAction<string>>
    selectedLanguage: string
    setSelectedLanguage: React.Dispatch<React.SetStateAction<string>>
    tags: any
    selectedTag: any
    setSelectedTag: React.Dispatch<React.SetStateAction<Tag>>
}

export type Tag = {
    id: number
    tagName: string
}

const CodingTopics: React.FC<CodingTopicsProps> = ({
    setSearchTerm,
    searchTerm,
    selectedTopic,
    setSelectedTopic,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedLanguage,
    setSelectedLanguage,
    tags,
    selectedTag,
    setSelectedTag,
}) => {

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value)
    }

    const handleTopicClick = (value: string) => {
        const tag = tags.find((t: Tag) => t.tagName === value) || {
            tagName: 'All Topics',
            id: -1,
        }
        setSelectedTag(tag)
    }
    
    return (
        <div className="flex flex-col mb-5">
            <Input
                placeholder="Search By Name "
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full mb-2 "
            />

            <div className="dropDownsContainer flex gap-2">
                <Select
                    value={selectedTag?.tagName}
                    onValueChange={handleTopicClick}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Choose Topic" />
                    </SelectTrigger>
                    <SelectContent>
                        {tags?.map((tag: Tag) => (
                            <SelectItem key={tag.id} value={tag.tagName}>
                                {tag.tagName}
                            </SelectItem>
                        ))}
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
                {/* <Select onValueChange={(value) => setSelectedLanguage(value)}>
                    <SelectTrigger className="">
                        <SelectValue placeholder={selectedLanguage} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel> Languages</SelectLabel>
                            <SelectItem value="alllanguages">
                                All Languages
                            </SelectItem>
                            <SelectItem value="Python">Python</SelectItem>
                            <SelectItem value="Java">Java</SelectItem>
                            <SelectItem value="React">React</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select> */}
            </div>
        </div>
    )
}

export default CodingTopics
