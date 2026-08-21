'use client'
import { EditIcon, Eye, Pencil, Settings, ArrowRight, Sparkle } from 'lucide-react'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import {
    filterQuestions,
    getAllTags,
    getAllTagsWithoutFilter,
} from '@/utils/admin'
import OpenEndedQuestions from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/module/_components/Assessment/OpenEndedQuestions'
import QuizQuestions from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/module/_components/Assessment/QuizQuestions'
import CodingTopics from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/module/_components/codingChallenge/CodingTopics'
import CodingQuestions from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/module/_components/Assessment/CodingQuestions'
import { Button } from '@/components/ui/button'
import SettingsAssessment from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/module/_components/Assessment/SettingsAssessment'
import SelectedQuestions from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/module/_components/Assessment/SelectedQuestions'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import useDebounce from '@/app/[admin]/hooks/useDebounce'
import { getAssessmentPreviewStore, getUser } from '@/store/store'
import { useRouter, useSearchParams, useParams, usePathname } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/ui/use-toast'
import PermissionAlert from '@/app/_components/PermissionAlert'
import {
    AddAssessmentProps,
    McqAccumulator,
    CodingQuestiones,
} from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/module/_components/Assessment/ComponentAssessmentType'
import { AssessmentSkeleton } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminSkeleton'


import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import AdaptiveAssessment from '@/app/[admin]/courses/[courseId]/module/[moduleId]/chapter/[chapterId]/adaptiveAssessment/AdaptiveAssessmentConfigurationForm'

const chapterSchema = z.object({
    title: z
        .string()
        .min(1, 'Assessment title is required.')
        .max(50, 'You can enter up to 50 characters only.'),
})
const AddAssessment: React.FC<AddAssessmentProps> = ({
    chapterData,
    content,
    fetchChapterContent,
    moduleId,
    topicId,
    activeChapterTitle,
    canEdit = true,
}) => {
    const form = useForm<z.infer<typeof chapterSchema>>({
        resolver: zodResolver(chapterSchema),
        defaultValues: { title: activeChapterTitle || '' },
        mode: 'onChange',
    })
    const [alertOpen, setAlertOpen] = useState(!canEdit);
    const [open, setOpen] = useState(true); // initially true when !canEdit
    const searchParams = useSearchParams()
    const { organizationId } = useParams()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const orgId = Number(organizationId) || user?.orgId;
    const initialTab = searchParams.get('tab') || ''
    const [isDataLoading, setIsDataLoading] = useState(true)
    const [searchQuestionsInAssessment, setSearchQuestionsInAssessment] =
        useState<string>('')

    const [selectedDifficulties, setSelectedDifficulties] = useState([
        'Any Difficulty',
    ])

    const [selectedTopics, setSelectedTopics] = useState([
        {
            tagName: 'All Topics',
            id: -1,
        },
    ])

    const [selectedLanguage, setSelectedLanguage] =
        useState<string>('All Languages')

    const [filteredQuestions, setFilteredQuestions] = useState<any[]>([])

    const [chapterTitle, setChapterTitle] = useState<string>(activeChapterTitle)

    const [questionType, setQuestionType] = useState<string>('coding')

    const [selectedCodingQuestions, setSelectedCodingQuestions] = useState<
        any[]
    >([])

    const [selectedQuizQuestions, setSelectedQuizQuestions] = useState<any[]>(
        []
    )

    const [selectedOpenEndedQuestions, setSelectedOpenEndedQuestions] =
        useState<any[]>([])

    const [selectedCodingQuesIds, setSelectedCodingQuesIds] = useState<
        number[]
    >([])
    const [selectedCodingQuesTagIds, setSelectedCodingQuesTagIds] = useState<
        number[]
    >([])

    const [selectedQuizQuesIds, setSelectedQuizQuesIds] = useState<number[]>([])
    const [selectedQuizQuesTagIds, setSelectedQuizQuesTagIds] = useState<
        number[]
    >([])

    const [selectedOpenEndedQuesIds, setSelectedOpenEndedQuesIds] = useState<
        number[]
    >([])

    const debouncedSearch = useDebounce(searchQuestionsInAssessment, 500)

    const [saveSettings, setSaveSettings] = useState(false)

    const [tags, setTags] = useState<any>()

    const { setAssessmentPreviewContent } = getAssessmentPreviewStore()

    const router = useRouter()

    const [isNewQuestionAdded, setIsNewQuestionAdded] = useState(false)

    const [selectCodingDifficultyCount, setSelectCodingDifficultyCount] =
        useState<Object>({})
    const [selectQuizDifficultyCount, setSelectQuizDifficultyCount] =
        useState<Object>({})
    const hasLoaded = useRef(false)
    const inFlightQuestionRequest = useRef<string | null>(null)
    // Track the last chapter ID whose questions were loaded from server content.
    // This lets us reset selected questions ONLY when the chapter changes,
    // not on every content reference update (e.g. after router.push to settings).
    const prevChapterIdRef = useRef<number | null>(null)

    useEffect(() => {
        if (initialTab === 'setting') {
            setQuestionType('settings')
        }
    }, [initialTab])

    // FIX 1: Trigger form validation on mount so that `form.formState.isValid`
    // reflects the pre-filled `activeChapterTitle` defaultValue immediately.
    // React Hook Form with `mode: 'onChange'` does NOT validate defaultValues on
    // mount — `isValid` stays `false` until the user fires a change event.
    // Without this, the "Next" button stays disabled even when the title is valid.
    useEffect(() => {
        form.trigger('title')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleCodingButtonClick = () => {
        setQuestionType('coding')
        setSearchQuestionsInAssessment('')
    }

    const handleMCQButtonClick = () => {
        setQuestionType('mcq')
        setSearchQuestionsInAssessment('')
    }

    const handleOpenEndedButtonClick = () => {
        setQuestionType('open-ended')
        setSearchQuestionsInAssessment('')
    }
    const handleSettingsButtonClick = () => {
        setQuestionType('settings')
        router.push(
            `/${userRole}/organizations/${orgId}/courses/${content.bootcampId}/module/${content.moduleId}/chapters/${content.chapterId}?tab=setting`
        )
    }

    const handleAdaptiveAssessmentButtonClick = () => {
        setQuestionType('adaptive-assessment')
    }

    function previewAssessment() {
        if (
            content.Quizzes.length > 0 ||
            content.CodingQuestions.length > 0 ||
            content.OpenEndedQuestions.length > 0
        ) {
            setAssessmentPreviewContent(content)
            router.push(
                `/${userRole}/organizations/${orgId}/courses/${content.bootcampId}/module/${content.moduleId}/chapter/${content.chapterId}/assessment/${topicId}/preview`
            )
        } else {
            toast.error({
                title: 'No questions to preview',
                description: 'Please save the assessment first to preview.',
            })
        }
    }

    useEffect(() => {
        if (!['coding', 'mcq', 'open-ended'].includes(questionType)) return

        const requestKey = JSON.stringify({
            orgId,
            questionType,
            selectedDifficulties,
            selectedTopics,
            selectedLanguage,
            debouncedSearch,
        })

        if (inFlightQuestionRequest.current === requestKey) return

        inFlightQuestionRequest.current = requestKey
        void filterQuestions(
            setFilteredQuestions,
            orgId,
            selectedDifficulties,
            selectedTopics,
            selectedLanguage,
            debouncedSearch,
            questionType
        ).finally(() => {
            if (inFlightQuestionRequest.current === requestKey) {
                inFlightQuestionRequest.current = null
            }
        })
    }, [
        questionType,
        orgId,
        selectedDifficulties,
        selectedTopics,
        selectedLanguage,
        debouncedSearch,
    ])

    useEffect(() => {
        const difficultyCount = selectedCodingQuestions.reduce(
            (acc: McqAccumulator, question: CodingQuestiones) => {
                const key = `codingProblems${question.difficulty}` // Construct the key
                acc[key] = acc[key] ? acc[key] + 1 : 1 // Increment the count
                return acc
            },
            {}
        )

        setSelectCodingDifficultyCount(difficultyCount)
    }, [selectedCodingQuestions])

    useEffect(() => {
        const difficultyCount = selectedQuizQuestions.reduce(
            (acc: McqAccumulator, question: CodingQuestiones) => {
                const key = `mcqs${question.difficulty}` // Construct the key
                acc[key] = acc[key] ? acc[key] + 1 : 1 // Increment the count
                return acc
            },
            {}
        )

        setSelectQuizDifficultyCount(difficultyCount)
    }, [selectedQuizQuestions])

    useEffect(() => {
        // FIX 2: Guard question resets against stale content updates.
        //
        // Previously this effect ran on every `content` reference change, which
        // includes re-fetches triggered by `router.push(...?tab=setting)`. That
        // wiped any locally-selected-but-unsaved questions the moment the user
        // navigated to the settings step and the fetch resolved.
        //
        // Now we only reset the selected questions when the chapter ID actually
        // changes (i.e. the user switched to a different chapter), NOT on every
        // incidental re-render of the same chapter's content.
        const incomingChapterId = content?.chapterId ?? content?.id ?? null
        if (prevChapterIdRef.current === incomingChapterId) {
            // Same chapter — preserve the user's in-progress question selection.
            return
        }
        prevChapterIdRef.current = incomingChapterId

        // Ensure unique coding questions
        const uniqueCodingQuestions = Array.from(
            new Set(
                content.CodingQuestions?.map(
                    (question: CodingQuestiones) => question.id
                )
            )
        ).map((id) =>
            content.CodingQuestions.find(
                (question: CodingQuestiones) => question.id === id
            )
        )
        setSelectedCodingQuestions(uniqueCodingQuestions || [])

        // Ensure unique quiz questions
        const uniqueQuizQuestions = Array.from(
            new Set(
                content.Quizzes?.map(
                    (question: CodingQuestiones) => question.id
                )
            )
        ).map((id) =>
            content.Quizzes.find(
                (question: CodingQuestiones) => question.id === id
            )
        )
        setSelectedQuizQuestions(uniqueQuizQuestions || [])

        // Ensure unique open-ended questions
        const uniqueOpenEndedQuestions = Array.from(
            new Set(
                content.OpenEndedQuestions?.map(
                    (question: CodingQuestiones) => question.id
                )
            )
        ).map((id) =>
            content.OpenEndedQuestions.find(
                (question: any) => question.id === id
            )
        )
        setSelectedOpenEndedQuestions(uniqueOpenEndedQuestions || [])
    }, [content])

    useEffect(() => {
        setSelectedCodingQuesIds(
            Array.from(
                new Set(selectedCodingQuestions.map((question) => question.id))
            )
        )
        setSelectedCodingQuesTagIds(
            Array.from(
                new Set(
                    selectedCodingQuestions.map((question) => question.tagId)
                )
            )
        )
    }, [selectedCodingQuestions])

    useEffect(() => {
        setSelectedQuizQuesIds(
            Array.from(
                new Set(selectedQuizQuestions.map((question) => question.id))
            )
        )
        setSelectedQuizQuesTagIds(
            Array.from(
                new Set(selectedQuizQuestions.map((question) => question.tagId))
            )
        )
    }, [selectedQuizQuestions])

    useEffect(() => {
        setSelectedOpenEndedQuesIds(
            Array.from(
                new Set(
                    selectedOpenEndedQuestions.map((question) => question.id)
                )
            )
        )
    }, [selectedOpenEndedQuestions])

    useEffect(() => {
        if (chapterData.id && topicId > 0) {
            fetchChapterContent(chapterData.id, topicId)
            // Use the saved assessment title from the API if available,
            // otherwise fall back to the chapter title.
            const savedTitle = content.ModuleAssessment?.title
            const resolvedTitle = savedTitle || activeChapterTitle || ''
            setChapterTitle(resolvedTitle)
            form.setValue('title', resolvedTitle, { shouldValidate: true })
        }
        setIsDataLoading(false)
    }, [chapterData.id, topicId, activeChapterTitle])







    useEffect(() => {
        if (hasLoaded.current) return
        hasLoaded.current = true

        const loadTags = async () => {
            try {
                await getAllTagsWithoutFilter(setTags)
            } catch (error) {
                console.error('Error loading tags:', error)
            }

        }
        loadTags()
    }, [])

    useEffect(() => {
        if (activeChapterTitle) {
            setChapterTitle(activeChapterTitle)
            form.setValue('title', activeChapterTitle, { shouldValidate: true })
            form.trigger('title')
        }
    }, [activeChapterTitle])


    if (isDataLoading) {
        return <AssessmentSkeleton />
    }

    return (
        <div className="w-full pb-2">
            {!canEdit && (
                <PermissionAlert
                    alertOpen={alertOpen}
                    setAlertOpen={setAlertOpen}
                />
            )}
            <div className={canEdit ? '' : 'pointer-events-none opacity-60'}>
                <div className="px-5 border-b border-gray-200">
                    {questionType !== 'settings' && (
                        <div className="flex items-center mb-5 w-full justify-between">
                            <div className="w-2/6 relative">
                                <Input
                                    {...form.register('title')}
                                    placeholder="Untitled Assessmen"
                                    // className="text-lg font-semibold border-none p-0 focus-visible:ring-0 placeholder:text-foreground w-full"
                                        className="text-lg font-semibold border-none p-0 focus-visible:ring-0 placeholder:text-muted-foreground text-foreground w-full"

                                />
                                {form.formState.errors.title && (
                                    <p className="text-destructive text-sm mt-1">
                                        {form.formState.errors.title.message}
                                    </p>
                                )}
                            </div>

                            <form
                                onSubmit={form.handleSubmit((data) => {
                                    // Save the validated title
                                    setChapterTitle(data.title)
                                    handleSettingsButtonClick()
                                })}
                                className="flex items-center gap-2"
                            >
                                {/* FIX 3: Next button requires both a valid title AND at least
                                one question selected across any question type. Previously it
                                only checked `form.formState.isValid` (title), so question
                                selection had no effect on the button state. */}
                                <Button
                                    type="submit"
                                    disabled={
                                        !form.formState.isValid ||
                                        form.formState.isSubmitting ||
                                        (selectedCodingQuestions.length === 0 &&
                                            selectedQuizQuestions.length === 0 &&
                                            selectedOpenEndedQuestions.length === 0)
                                    }
                                    className={`flex items-center gap-1 ${!form.formState.isValid ||
                                            form.formState.isSubmitting ||
                                            (selectedCodingQuestions.length === 0 &&
                                                selectedQuizQuestions.length === 0 &&
                                                selectedOpenEndedQuestions.length === 0)
                                            ? 'opacity-50 cursor-not-allowed'
                                            : ''
                                        }`}
                                >
                                    <h6 className="mx-1 text-sm">Next</h6>
                                    <ArrowRight size={20} />
                                </Button>
                            </form>
                        </div>
                    )}
                    {/* select type of questions */}
                    {questionType !== 'settings' && (
                        <div className="flex gap-2 mb-5 border-b border-muted-light w-1/2">
                            <Button
                                className={`flex items-center gap-3 text-[1rem] pb-2 border-b-2 transition-colors bg-transparent ${questionType === 'coding'
                                        ? 'border-primary text-foreground hover:bg-transparent'
                                        : 'border-transparent text-muted-dark hover:text-foreground hover:bg-gray-100'
                                    }`}
                                onClick={handleCodingButtonClick}
                            >
                                Coding Problems ({selectedCodingQuestions.length})
                            </Button>
                            <Button
                                className={`flex items-center gap-3 text-[1rem] pb-2 border-b-2 transition-colors bg-transparent ${questionType === 'mcq'
                                        ? 'border-primary text-foreground hover:bg-transparent'
                                        : 'border-transparent text-muted-dark hover:text-foreground hover:bg-gray-100'
                                    }`}
                                onClick={handleMCQButtonClick}
                            >
                                MCQs ({selectedQuizQuestions.length})
                            </Button>
                            <Button
                                className={`flex items-center gap-3 text-[1rem] pb-2 border-b-2 transition-colors bg-transparent ${questionType === 'open-ended'
                                        ? 'border-primary text-foreground hover:bg-transparent'
                                        : 'border-transparent text-muted-dark hover:text-foreground hover:bg-gray-100'
                                    }`}
                                onClick={handleOpenEndedButtonClick}
                            >
                                Open-Ended Questions (
                                {selectedOpenEndedQuestions.length})
                            </Button>
                            {/* <Button
                            className={`flex items-center gap-3 text-[1rem] pb-2 border-b-2 transition-colors bg-transparent ${
                                questionType === 'adaptive-assessment'
                                    ? 'border-primary text-foreground hover:bg-transparent'
                                    : 'border-transparent text-muted-dark hover:text-foreground hover:bg-gray-100'
                            }`}
                            onClick={handleAdaptiveAssessmentButtonClick}
                        >
                            <Sparkle size={18} className='text-primary' />
                       Create Adaptive Assessment
                        </Button> */}
                        </div>
                    )}
                </div>
                <div className="px-5 pt-4 bg-card">
                    {/* DropDown Filters for questions:- */}
                    {questionType !== 'settings' && questionType !== 'adaptive-assessment' && (
                        <>
                            <div className="flex mb-3">
                                <CodingTopics
                                    searchTerm={searchQuestionsInAssessment}
                                    setSearchTerm={setSearchQuestionsInAssessment}
                                    tags={tags}
                                    selectedTopics={selectedTopics}
                                    setSelectedTopics={setSelectedTopics}
                                    selectedDifficulties={selectedDifficulties}
                                    setSelectedDifficulties={
                                        setSelectedDifficulties
                                    }
                                    selectedQuestions={undefined}
                                    setSelectedQuestions={undefined}
                                    content={undefined}
                                    moduleId={''}
                                    chapterTitle={''}
                                />
                            </div>
                            <div className="flex justify-between w-2/3">
                                <h3 className="text-left text-[15px] text-muted-dark font-bold mb-5 ml-2">
                                    {questionType === 'coding'
                                        ? 'Coding Problem Library'
                                        : questionType === 'mcq'
                                            ? 'MCQ Library'
                                            : questionType === 'open-ended'
                                                ? 'Open-Ended Question Library'
                                                : questionType === 'adaptive-assessment'
                                                    ? 'Adaptive Assessment'
                                                    : ''}
                                </h3>
                                <h1 className="text-left text-[15px] text-muted-dark font-bold mb-5 mr-3">
                                    Selected Questions
                                </h1>
                            </div>
                        </>
                    )}

                    <div className="h-full">
                        {/* <ScrollBar orientation="vertical" className="h-dvh" /> */}
                        <div
                            className={`${questionType == 'settings' || questionType == 'adaptive-assessment'
                                    ? 'grid grid-cols-1'
                                    : 'grid grid-cols-[1fr_2px_1fr]'
                                } h-screen `}
                        >
                            <div className="h-full">
                                {questionType === 'coding' && (
                                    <CodingQuestions
                                        questions={filteredQuestions}
                                        setSelectedQuestions={
                                            setSelectedCodingQuestions
                                        }
                                        selectedQuestions={selectedCodingQuestions}
                                        tags={tags}
                                        setIsNewQuestionAdded={
                                            setIsNewQuestionAdded
                                        }
                                    />
                                )}
                                {questionType === 'mcq' && (
                                    <QuizQuestions
                                        questions={filteredQuestions}
                                        setSelectedQuestions={
                                            setSelectedQuizQuestions
                                        }
                                        selectedQuestions={selectedQuizQuestions}
                                        tags={tags}
                                        setIsNewQuestionAdded={
                                            setIsNewQuestionAdded
                                        }
                                        type={''}
                                    />
                                )}
                                {questionType === 'open-ended' && (
                                    <OpenEndedQuestions
                                        questions={filteredQuestions}
                                        setSelectedQuestions={
                                            setSelectedOpenEndedQuestions
                                        }
                                        selectedQuestions={
                                            selectedOpenEndedQuestions
                                        }
                                        tags={tags}
                                    />
                                )}

                                {questionType === 'settings' && (
                                    <div className="">
                                        <SettingsAssessment
                                            selectedCodingQuesIds={
                                                selectedCodingQuesIds
                                            }
                                            selectedQuizQuesIds={
                                                selectedQuizQuesIds
                                            }
                                            selectedOpenEndedQuesIds={
                                                selectedOpenEndedQuesIds
                                            }
                                            selectedCodingQuesTagIds={
                                                selectedCodingQuesTagIds
                                            }
                                            selectedQuizQuesTagIds={
                                                selectedQuizQuesTagIds
                                            }
                                            content={content}
                                            fetchChapterContent={
                                                fetchChapterContent
                                            }
                                            chapterTitle={chapterTitle}
                                            setChapterTitle={setChapterTitle}
                                            saveSettings={saveSettings}
                                            setSaveSettings={setSaveSettings}
                                            setQuestionType={setQuestionType}
                                            selectCodingDifficultyCount={
                                                selectCodingDifficultyCount
                                            }
                                            selectQuizDifficultyCount={
                                                selectQuizDifficultyCount
                                            }
                                            topicId={topicId}
                                            isNewQuestionAdded={isNewQuestionAdded}
                                            setIsNewQuestionAdded={
                                                setIsNewQuestionAdded
                                            }
                                        />
                                    </div>
                                )}

                            </div>

                            <Separator
                                orientation="vertical"
                                className="mx-4 w-[2px] h-96 ml-8 rounded bg-card"
                            />

                            {questionType !== 'settings' && questionType !== 'adaptive-assessment' && (
                                <div className="h-screen border-l border-muted-light pl-4">
                                    <ScrollArea className="h-96 px-2 pb-4">
                                        <ScrollBar
                                            orientation="vertical"
                                            className=""
                                        />

                                        {selectedCodingQuesIds.length > 0 ||
                                            selectedQuizQuesIds.length > 0 ||
                                            selectedOpenEndedQuesIds.length > 0 ? (
                                            <SelectedQuestions
                                                selectedCodingQuestions={
                                                    selectedCodingQuestions
                                                }
                                                selectedQuizQuestions={
                                                    selectedQuizQuestions
                                                }
                                                selectedOpenEndedQuestions={
                                                    selectedOpenEndedQuestions
                                                }
                                                setSelectedCodingQuestions={
                                                    setSelectedCodingQuestions
                                                }
                                                setSelectedQuizQuestions={
                                                    setSelectedQuizQuestions
                                                }
                                                setSelectedOpenEndedQuestions={
                                                    setSelectedOpenEndedQuestions
                                                }
                                                questionType={questionType}
                                                tags={tags}
                                                setIsNewQuestionAdded={
                                                    setIsNewQuestionAdded
                                                }
                                            />
                                        ) : (
                                            <h1 className="text-left text-muted-dark text-[18px] italic pl-5">
                                                No Selected questions
                                            </h1>
                                        )}
                                    </ScrollArea>
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </div>
        </div>
    )
}

export default AddAssessment
