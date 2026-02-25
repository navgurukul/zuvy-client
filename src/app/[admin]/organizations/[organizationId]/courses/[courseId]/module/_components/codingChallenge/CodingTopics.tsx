import React, { useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Check, ChevronDown } from 'lucide-react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
    CodingTopicsProps,
    CodingTopicsTag,
} from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/module/_components/codingChallenge/ModuleCodingChallangeComponentType'
import { Search, X } from 'lucide-react'

const difficulties = ['Any Difficulty', 'Easy', 'Medium', 'Hard']

const CodingTopics: React.FC<CodingTopicsProps> = ({
    setSearchTerm,
    searchTerm,
    tags,
    selectedTopics,
    setSelectedTopics,
    selectedDifficulties,
    setSelectedDifficulties,
    canEdit = true,
}) => {
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!canEdit) return
        setSearchTerm(event.target.value)
    }

    const handleTopicChange = (tag: CodingTopicsTag) => {
        if (!canEdit) return
        setSelectedTopics((prev) => {
            if (tag.tagName === 'All Topics') {
                return prev.some((t) => t.tagName === 'All Topics') ? [] : [tag]
            } else {
                const newSelection = prev?.filter(
                    (t) => t?.tagName !== 'All Topics'
                )
                const tagIndex = newSelection.findIndex(
                    (t) => t?.id === tag?.id
                )
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
        if (!canEdit) return
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

    const getTopicsButtonText = () => {
        if (selectedTopics.length === 0) {
            return 'All Topics'
        } else if (selectedTopics.length === 1) {
            return selectedTopics[0].tagName
        } else {
            return `${selectedTopics.length} Topics Selected`
        }
    }

    const getDifficultiesButtonText = () => {
        if (selectedDifficulties.length === 0) {
            return 'Any Difficulty'
        } else if (selectedDifficulties.length === 1) {
            return selectedDifficulties[0]
        } else {
            return `${selectedDifficulties.length} Difficulties Selected`
        }
    }

    return (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-start mb-5">
            {/* Search Bar */}
            <div className="w-[50%]">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                        type="text"
                        placeholder="Search By Name"
                        className="bg-white w-full pl-9 pr-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={!canEdit}
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Dropdown */}
            <div className="w-[30%]">
                <div className="dropDownsContainer flex gap-2 mt-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                className="w-48 sm:w-56 justify-between border border-input bg-background text-gray-600 hover:bg-transparent]"
                                disabled={!canEdit}
                            >
                                {getTopicsButtonText()}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 sm:w-56 p-0">
                            <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-green-100">
                                {tags?.map((tag) => {
                                    const isSelected = selectedTopics.some(
                                        (t) => t?.id === tag?.id
                                    )
                                    return (
                                        <div
                                            key={tag.id}
                                            onClick={() =>
                                                handleTopicChange(tag)
                                            }
                                            className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-200
                                            ${isSelected && 'text-primary'}`}
                                        >
                                            <Check
                                                className={`mr-2 h-4 w-4 ${
                                                    selectedTopics.some(
                                                        (t) => t?.id === tag?.id
                                                    )
                                                        ? 'opacity-100'
                                                        : 'opacity-0'
                                                }`}
                                            />
                                            {tag.tagName}
                                        </div>
                                    )
                                })}
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                className="w-48 sm:w-56 justify-between border border-input bg-background text-gray-600 hover:bg-transparent]"
                                disabled={!canEdit}
                            >
                                {getDifficultiesButtonText()}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 sm:w-56 p-0">
                            <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-green-100">
                                {difficulties.map((difficulty) => {
                                    const isSelected =
                                        selectedDifficulties.includes(
                                            difficulty
                                        )
                                    return (
                                        <div
                                            key={difficulty}
                                            onClick={() =>
                                                handleDifficultyChange(
                                                    difficulty
                                                )
                                            }
                                            className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-200
                                            ${isSelected && 'text-primary'}`}
                                        >
                                            <Check
                                                className={`mr-2 h-4 w-4 ${
                                                    selectedDifficulties.includes(
                                                        difficulty
                                                    )
                                                        ? 'opacity-100'
                                                        : 'opacity-0'
                                                }`}
                                            />
                                            {difficulty}
                                        </div>
                                    )
                                })}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    )
}

export default CodingTopics
