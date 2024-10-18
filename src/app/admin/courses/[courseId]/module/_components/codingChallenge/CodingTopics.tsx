import React from 'react'
import { Input } from '@/components/ui/input'
import { Check, ChevronDown } from 'lucide-react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

interface CodingTopicsProps {
    setSearchTerm: (newSearchTerm: string) => void
    searchTerm: string
    tags: Tag[]
    selectedTopics: Tag[]
    setSelectedTopics: React.Dispatch<React.SetStateAction<Tag[]>>
    selectedDifficulties: string[]
    setSelectedDifficulties: React.Dispatch<React.SetStateAction<string[]>>
}

export type Tag = {
    id: number
    tagName: string
}

const difficulties = ['Any Difficulty', 'Easy', 'Medium', 'Hard']

const CodingTopics: React.FC<CodingTopicsProps> = ({
    setSearchTerm,
    searchTerm,
    tags,
    selectedTopics,
    setSelectedTopics,
    selectedDifficulties,
    setSelectedDifficulties,
}) => {
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value)
    }

    const handleTopicChange = (tag: Tag) => {
        setSelectedTopics((prev) => {
            if (tag.tagName === 'All Topics') {
                return prev.some((t) => t.tagName === 'All Topics') ? [] : [tag]
            } else {
                const newSelection = prev.filter(
                    (t) => t.tagName !== 'All Topics'
                )
                const tagIndex = newSelection.findIndex((t) => t.id === tag.id)
                if (tagIndex > -1) {
                    newSelection.splice(tagIndex, 1)
                } else {
                    newSelection.push(tag)
                }
                return newSelection.length === 0
                    ? [tags.find((t) => t.tagName === 'All Topics')!]
                    : newSelection
            }
        })
    }

    const handleDifficultyChange = (difficulty: string) => {
        setSelectedDifficulties((prev) => {
            if (difficulty === 'Any Difficulty') {
                return prev.includes('Any Difficulty') ? [] : ['Any Difficulty']
            } else {
                const newSelection = prev.filter((d) => d !== 'Any Difficulty')
                const difficultyIndex = newSelection.indexOf(difficulty)
                if (difficultyIndex > -1) {
                    newSelection.splice(difficultyIndex, 1)
                } else {
                    newSelection.push(difficulty)
                }
                return newSelection.length === 0
                    ? ['Any Difficulty']
                    : newSelection
            }
        })
    }

    return (
        <div className="flex flex-col mb-5">
            <Input
                placeholder="Search By Name"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full mb-2"
            />

            <div className="dropDownsContainer flex gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-48 sm:w-56 justify-between"
                        >
                            {selectedTopics?.length > 0
                                ? `${
                                      selectedTopics.length > 1
                                          ? `${selectedTopics.length} Topics Selected`
                                          : '1 Topic Selected'
                                  } `
                                : 'Choose Topics'}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 sm:w-56 p-0">
                        <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-green-100">
                            {tags?.map((tag) => (
                                <div
                                    key={tag.id}
                                    className="flex items-center px-3 py-2 hover:bg-secondary hover:text-[#FFFFFF]  cursor-pointer"
                                    onClick={() => handleTopicChange(tag)}
                                >
                                    <Check
                                        className={`mr-2 h-4 w-4 ${
                                            selectedTopics?.some(
                                                (t) => t.id === tag.id
                                            )
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        }`}
                                    />
                                    {tag.tagName}
                                </div>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-48 sm:w-56 justify-between"
                        >
                            {selectedDifficulties?.length > 0
                                ? `${
                                      selectedDifficulties.length > 1
                                          ? `${selectedDifficulties.length} Difficulties Selected`
                                          : '1 Difficulty Selected'
                                  } `
                                : 'Choose Difficulties'}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 sm:w-56 p-0">
                        <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-green-100">
                            {difficulties.map((difficulty) => (
                                <div
                                    key={difficulty}
                                    className="flex items-center px-3 py-2 hover:bg-secondary hover:text-[#FFFFFF] cursor-pointer"
                                    onClick={() =>
                                        handleDifficultyChange(difficulty)
                                    }
                                >
                                    <Check
                                        className={`mr-2 h-4 w-4 ${
                                            selectedDifficulties?.includes(
                                                difficulty
                                            )
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        }`}
                                    />
                                    {difficulty}
                                </div>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}

export default CodingTopics
