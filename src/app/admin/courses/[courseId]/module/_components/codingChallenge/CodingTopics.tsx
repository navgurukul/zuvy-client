import React from 'react'
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
                <Select>
                    <SelectTrigger className="">
                        <SelectValue placeholder={selectedTopic} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Topics</SelectLabel>
                            <SelectItem
                                onClick={() => setSelectedTopic('All Topics')}
                                value="alltopics"
                            >
                                All Topics
                            </SelectItem>
                            <SelectItem
                                onClick={() => setSelectedTopic('Frontend')}
                                value="Frontend"
                            >
                                Frontend
                            </SelectItem>
                            <SelectItem
                                onClick={() => setSelectedTopic('Backend')}
                                value="Backend"
                            >
                                Backend
                            </SelectItem>
                            <SelectItem
                                onClick={() => setSelectedTopic('DSA')}
                                value="DSA"
                            >
                                DSA
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger className="">
                        <SelectValue placeholder={selectedDifficulty} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Difficulty</SelectLabel>
                            <SelectItem
                                onClick={() =>
                                    setSelectedDifficulty('Any Difficulty')
                                }
                                value="anydifficulty"
                            >
                                Any Difficulty
                            </SelectItem>
                            <SelectItem
                                onClick={() => setSelectedDifficulty('Easy')}
                                value="Easy"
                            >
                                Easy
                            </SelectItem>
                            <SelectItem
                                onClick={() => setSelectedDifficulty('Medium')}
                                value="Medium"
                            >
                                Medium
                            </SelectItem>
                            <SelectItem
                                onClick={() => setSelectedDifficulty('Hard')}
                                value="Hard"
                            >
                                Hard
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger className="">
                        <SelectValue placeholder={selectedLanguage} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel> Languages</SelectLabel>
                            <SelectItem
                                onClick={() =>
                                    setSelectedLanguage('All Languages')
                                }
                                value="alllanguages"
                            >
                                All Languages
                            </SelectItem>
                            <SelectItem
                                onClick={() => setSelectedLanguage('Python')}
                                value="Python"
                            >
                                Python
                            </SelectItem>
                            <SelectItem
                                onClick={() => setSelectedLanguage('Java')}
                                value="Java"
                            >
                                Java
                            </SelectItem>
                            <SelectItem
                                onClick={() => setSelectedLanguage('React')}
                                value="React"
                            >
                                React
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

export default CodingTopics
