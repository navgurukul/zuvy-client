import React, { useEffect } from 'react'
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
    setSelectedTopic: React.Dispatch<React.SetStateAction<string>>
    selectedDifficulty: string
    setSelectedDifficulty: React.Dispatch<React.SetStateAction<string>>
    selectedLanguage: string
    setSelectedLanguage: React.Dispatch<React.SetStateAction<string>>
}

const CodingTopics: React.FC<CodingTopicsProps> = ({
    selectedTopic,
    setSelectedTopic,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedLanguage,
    setSelectedLanguage,
}) => {
    return (
        <div className="flex flex-col mb-5">
            <Input placeholder="Search By Name " className="w-full mb-2 " />

            <div className="dropDownsContainer flex gap-2">
                <Select onValueChange={(value) => setSelectedTopic(value)}>
                    <SelectTrigger className="">
                        <SelectValue placeholder={selectedTopic} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Topics</SelectLabel>
                            <SelectItem value="alltopics">
                                All Topics
                            </SelectItem>
                            <SelectItem value="Frontend">Frontend</SelectItem>
                            <SelectItem value="Backend">Backend</SelectItem>
                            <SelectItem value="DSA">DSA</SelectItem>
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
                <Select onValueChange={(value) => setSelectedLanguage(value)}>
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
                </Select>
            </div>
        </div>
    )
}

export default CodingTopics
