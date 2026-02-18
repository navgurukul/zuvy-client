'use client'

import { PlusCircle, Pencil, SquareCode } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import { cn, difficultyBgColor, difficultyColor, ellipsis } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import CodingTopics from '@/app/[admin]/courses/[courseId]/module/_components/codingChallenge/CodingTopics'
import SelectedProblems from '@/app/[admin]/courses/[courseId]/module/_components/codingChallenge/SelectedProblems'
import { Input } from '@/components/ui/input'
import { api } from '@/utils/axios.config'
import useDebounce from '@/hooks/useDebounce'
import {
    getChapterUpdateStatus,
    getCodingQuestionTags,
    getUser,
} from '@/store/store'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import QuestionDescriptionModal from '../Assessment/QuestionDescriptionModal'
import { Button } from '@/components/ui/button'
import { handleSaveChapter } from '@/utils/admin'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import {
    CodingChallangesQuestion,
    ChallangesProps,
    CodingTopicsTag,
} from '@/app/[admin]/courses/[courseId]/module/_components/codingChallenge/ModuleCodingChallangeComponentType'
import { AnyARecord } from 'dns'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {CodingChallengeSkeleton} from '@/app/[admin]/courses/[courseId]/_components/adminSkeleton'
import PermissionAlert from '@/app/_components/PermissionAlert'

function CodingChallenge({
    content,
    activeChapterTitle,
    moduleId,
    courseId,
    canEdit = true,
}: ChallangesProps) {
    const router = useRouter()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const [alertOpen, setAlertOpen] = useState(!canEdit)

    const chapterSchema = z.object({
        title: z
            .string()
            .min(1, 'Chapter title is required')
            .max(50, 'Chapter title must be at most 50 characters'),
    })

    const form = useForm<z.infer<typeof chapterSchema>>({
        resolver: zodResolver(chapterSchema),
         mode: 'onChange',
        defaultValues: {
            title: activeChapterTitle || '',
        },
       
    })
    // ====
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 1000)
    const { tags, setTags } = getCodingQuestionTags()

    // SIMPLE FIX: Direct computation instead of useEffect
    const codingQuestions = content?.codingQuestionDetails || []
    const [selectedQuestions, setSelectedQuestions] =
        useState<CodingChallangesQuestion[]>(codingQuestions)
    const [savedQuestions, setSavedQuestions] =
        useState<CodingChallangesQuestion[]>(codingQuestions)

    const [selectedTopic, setSelectedTopic] = useState<string>('All Topics')
    const [selectedTag, setSelectedTag] = useState<CodingTopicsTag>({
        tagName: 'All Topics',
        id: -1,
    })
    const [selectedOptions, setSelectedOptions] = useState<CodingTopicsTag[]>([
        { id: -1, tagName: 'All Topics' },
    ])
    const [selectedDifficulty, setSelectedDifficulty] = useState([
        'Any Difficulty',
    ])
    const [selectedLanguage, setSelectedLanguage] =
        useState<string>('All Languages')
    const [filteredQuestions, setFilteredQuestions] = useState<
        CodingChallangesQuestion[]
    >([])
    const [chapterTitle, setChapterTitle] = useState<string>(activeChapterTitle)
    const { isChapterUpdated, setIsChapterUpdated } = getChapterUpdateStatus()
    const [isDataLoading, setIsDataLoading] = useState(true)
    const hasLoaded = useRef(false)

    const [isSaved, setIsSaved] = useState<boolean>(true)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    // FORCE UPDATE: Use a key to force re-render when content changes
    const contentKey = `${content?.id}-${
        content?.codingQuestionDetails?.length || 0
    }`

    const [initialTitle] = useState<string>(activeChapterTitle)
    const [savedTitle, setSavedTitle] = useState<string>(activeChapterTitle)
    const [hasTitleChanged, setHasTitleChanged] = useState(false)

    const handleSaveClick = async (data: { title: string }) => {
        if (!canEdit) {
            return
        }
        setIsSubmitting(true)
        try {
            const titleToSave =
                data.title.trim() === '' ? savedTitle : data.title

            await handleSaveChapter(moduleId, content.id, {
                title: titleToSave,
                codingQuestions: selectedQuestions[0]?.id,
            })

            setIsChapterUpdated(!isChapterUpdated)
            setIsSaved(true)
            setSavedQuestions([...selectedQuestions])
            setSavedTitle(titleToSave)
            setHasTitleChanged(false)

            toast.success({
                title: 'Success',
                description: 'Chapter edited successfully',
            })
        } catch (error) {
            toast.error({
                title: 'Error',
                description: 'Failed to save changes',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value
        setChapterTitle(newTitle)
        setHasTitleChanged(newTitle !== savedTitle)
        form.setValue('title', newTitle, { shouldValidate: true })
        form.trigger('title')
    }
    useEffect(() => {
        const newQuestions = content?.codingQuestionDetails || []
        setSelectedQuestions(newQuestions)
        setSavedQuestions(newQuestions)
        setIsSaved(true)

        // Reset title changes when content changes
        setChapterTitle(activeChapterTitle)
        setSavedTitle(activeChapterTitle)
        setHasTitleChanged(false)
    }, [content?.id]) // Only depend on content.id

    // Function to check if current selection matches saved questions
    const checkIfSaved = () => {
        if (!selectedQuestions || !savedQuestions) {
            return true
        }
        if (selectedQuestions.length !== savedQuestions.length) {
            return false
        }

        // Check if all selected questions are in saved questions
        return selectedQuestions.every((selectedQ) =>
            savedQuestions.some((savedQ) => savedQ.id === selectedQ.id)
        )
    }

    // IMMEDIATE UPDATE: React to content prop changes immediately
    useEffect(() => {
        const newCodingQuestions = content?.codingQuestionDetails || []
        setSelectedQuestions(newCodingQuestions)
        setSavedQuestions(newCodingQuestions)
        setIsSaved(true)
    }, [contentKey]) // Use contentKey instead of content

    useEffect(() => {
        setIsSaved(checkIfSaved())
    }, [selectedQuestions, savedQuestions])

    // Disable Save button after save, re-enable if there are unsaved changes
    // Enable save if a coding problem is selected and title is being edited
    const isSaveButtonDisabled =
        !canEdit ||
        isSubmitting ||
        selectedQuestions.length === 0 ||
        !chapterTitle?.trim() ||
        !!form.formState.errors.title ||
        (isSaved && !hasTitleChanged);


useEffect(() => {
    async function getAllCodingQuestions() {
        try {

            let url = '/Content/allCodingQuestions'
            const queryParams = []

            let selectedTagIds = ''
            selectedOptions.forEach((topic: any) => {
                if (topic.id !== -1 && topic.id !== 0) {
                    selectedTagIds += `&tagId=${topic.id}`
                }
            })

            let selectedDiff = ''
            selectedDifficulty.forEach((difficulty: string) => {
                if (difficulty !== 'Any Difficulty') {
                    selectedDiff += `&difficulty=${difficulty}`
                }
            })

            if (selectedTagIds.length > 0) {
                queryParams.push(selectedTagIds.substring(1))
            }

            if (selectedDiff.length > 0) {
                queryParams.push(selectedDiff.substring(1))
            }

            if (debouncedSearch) {
                queryParams.push(
                    `searchTerm=${encodeURIComponent(debouncedSearch)}`
                )
            }

            if (queryParams.length > 0) {
                url += `?${queryParams.join('&')}`
            }

            const response = await api.get(url)
            setFilteredQuestions(response.data.data)

            setIsDataLoading(false)

        } catch (error) {
            console.error('Error:', error)
        }
    }

    getAllCodingQuestions()
}, [selectedDifficulty, selectedQuestions, debouncedSearch, selectedOptions])



    async function getAllTags() {
        try {
            const response = await api.get('Content/allTags')
            if (response) {
                const tagArr = [
                    { tagName: 'All Topics', id: -1 },
                    ...response.data.allTags,
                ]
                setTags(tagArr)
            }
        } catch (error) {
            console.error('Error fetching tags:', error)
        } 
        
    }

    useEffect(() => {
        if (hasLoaded.current) return
        hasLoaded.current = true
        getAllTags()
    }, [])

    // Update chapter title when activeChapterTitle prop changes
    useEffect(() => {
        setChapterTitle(activeChapterTitle)
    }, [activeChapterTitle])

    if (isDataLoading) {
        return<CodingChallengeSkeleton/>
    }
    return (
        <>
            <div key={contentKey}>
                {/* SearchBar component */}
                {!canEdit && (
                    <PermissionAlert
                        alertOpen={alertOpen}
                        setAlertOpen={setAlertOpen}
                    />
                )}
                <div className={canEdit ? '' : 'pointer-events-none opacity-60'}>   
                <div className="px-5 pb-4 border-b border-gray-200">
                    <div className="flex flex-col items-start mb-15">
                        <div className="flex justify-between items-center w-full">

                            <form
                                onSubmit={form.handleSubmit(handleSaveClick)}
                                className="flex justify-between items-center w-full gap-4"
                            >
                                <div className="w-2/4 relative">
                                    <Input
                                        {...form.register('title', { onChange: handleTitleChange })}
                                        value={chapterTitle}
                                        placeholder="Untitled Coding Problem"
                                        className="text-lg font-semibold border px-2 focus-visible:ring-0 placeholder:text-foreground w-full"
                                        disabled={!canEdit}
                                    />
                                    {!form.getValues('title') && (
                                        <Pencil
                                            fill="true"
                                            fillOpacity={0.4}
                                            size={20}
                                            className="absolute text-gray-100 pointer-events-none mt-1 right-5"
                                        />
                                    )}
                                    {form.formState.errors.title && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {
                                                form.formState.errors.title
                                                    .message
                                            }
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">

                                    <Button
                                        type="submit"
                                        disabled={isSaveButtonDisabled}
                                        className={`bg-primary text-white ${
                                            isSaveButtonDisabled
                                                ? 'opacity-50 cursor-not-allowed'
                                                : ''
                                        }`}
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                        <div className="flex items-center gap-2 pb-4">
                            <SquareCode
                                size={20}
                                className="transition-colors"
                            />
                            <p className="text-muted-foreground">
                                Coding Problems
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-5 pt-4 bg-card">
                    <CodingTopics
                        setSearchTerm={setSearchTerm}
                        searchTerm={searchTerm}
                        selectedTopics={selectedOptions}
                        setSelectedTopics={setSelectedOptions}
                        selectedDifficulties={selectedDifficulty}
                        setSelectedDifficulties={setSelectedDifficulty}
                        tags={tags}
                        selectedQuestions={undefined}
                        setSelectedQuestions={function (
                            value: React.SetStateAction<AnyARecord[]>
                        ): void {
                            throw new Error('Function not implemented.')
                        }}
                        content={undefined}
                        moduleId={''}
                        chapterTitle={''}
                        canEdit={canEdit}
                    />
                    <h1 className="text-left text-[15px] text-gray-600 font-bold mt-5 pb-3">
                        Coding Library
                    </h1>

                    <div className="grid grid-cols-2">
                        <div className="">
                            <div className="">
                                <ScrollArea className="h-screen pb-80">
                                    {filteredQuestions?.map((question: any) => {
                                        const selectedTagName = tags?.filter(
                                            (tag: any) =>
                                                tag.id == question.tagId
                                        )
                                        return (
                                            <div
                                                key={question.id}
                                                className="py-4 px-8 rounded-lg border border-gray-200 bg-white mb-4"
                                            >
                                                <div className="flex justify-between text-start items-center w-full">
                                                    <div className="w-full">
                                                        <div className="flex items-center gap-2 justify-between">
                                                            <h2 className="font-bold text-[16px] text-gray-600">
                                                                {ellipsis(
                                                                    question.title,
                                                                    30
                                                                )}
                                                            </h2>

                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-[#518672] bg-[#DCE7E3] py-1 rounded-2xl px-2">
                                                                    {
                                                                        selectedTagName[0]
                                                                            ?.tagName
                                                                    }
                                                                </span>

                                                                <span
                                                                    className={cn(
                                                                        `text-sm rounded-xl p-1 `,
                                                                        difficultyColor(
                                                                            question.difficulty
                                                                        ), // Text color
                                                                        difficultyBgColor(
                                                                            question.difficulty
                                                                        ) // Background color
                                                                    )}
                                                                >
                                                                    {
                                                                        question.difficulty
                                                                    }
                                                                </span>

                                                                <div>
                                                                    {selectedQuestions?.some(
                                                                        (
                                                                            selectedQuestion
                                                                        ) =>
                                                                            selectedQuestion?.id ===
                                                                            question.id
                                                                    ) ? (
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="20"
                                                                            height="20"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            strokeWidth="2"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            className="lucide lucide-circle-check"
                                                                        >
                                                                            <circle
                                                                                cx="12"
                                                                                cy="12"
                                                                                r="10"
                                                                            />
                                                                            <path d="m9 12 2 2 4-4" />
                                                                        </svg>
                                                                    ) : (
                                                                        <PlusCircle
                                                                            onClick={() => {
                                                                                if (!canEdit) return
                                                                                setSelectedQuestions(
                                                                                    [
                                                                                        question,
                                                                                    ]
                                                                                )
                                                                            }}
                                                                            className={`text-primary ${
                                                                                canEdit
                                                                                    ? 'cursor-pointer'
                                                                                    : 'opacity-40 cursor-not-allowed'
                                                                            }`}
                                                                            size={
                                                                                20
                                                                            }
                                                                        />

                                                                         
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="w-full">
                                                            <p className="text-gray-600 text-[15px] mt-1">
                                                                {ellipsis(
                                                                    question.description,
                                                                    60
                                                                )}
                                                            </p>
                                                        </div>
                                                        <Dialog>
                                                            <DialogTrigger
                                                                asChild
                                                            >
                                                                <p className="font-bold text-sm mt-2 text-primary cursor-pointer">
                                                                    View Full
                                                                    Description
                                                                </p>
                                                            </DialogTrigger>
                                                            <DialogOverlay />
                                                            <QuestionDescriptionModal
                                                                question={
                                                                    question
                                                                }
                                                                type="coding"
                                                            />
                                                        </Dialog>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </ScrollArea>
                            </div>
                        </div>
                        {/* FORCE RE-RENDER: Pass contentKey as key */}
                        <SelectedProblems
                            key={contentKey}
                            chapterTitle={chapterTitle}
                            selectedQuestions={
                                selectedQuestions as CodingChallangesQuestion[]
                            }
                            setSelectedQuestions={
                                setSelectedQuestions as React.Dispatch<
                                    React.SetStateAction<
                                        CodingChallangesQuestion[]
                                    >
                                >
                            }
                            content={content}
                            moduleId={moduleId}
                            tags={tags}
                            setSearchTerm={function (
                                newSearchTerm: string
                            ): void {
                                throw new Error('Function not implemented.')
                            }}
                            searchTerm={''}
                            selectedTopics={[]}
                            setSelectedTopics={function (
                                value: React.SetStateAction<CodingTopicsTag[]>
                            ): void {
                                throw new Error('Function not implemented.')
                            }}
                            selectedDifficulties={[]}
                            setSelectedDifficulties={function (
                                value: React.SetStateAction<string[]>
                            ): void {
                                throw new Error('Function not implemented.')
                            }}
                        canEdit={canEdit}
                        />
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}
export default CodingChallenge
