'use client'

import React, { useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useLazyLoadedStudentData } from '@/store/store'
import { ArrowBigLeft, CheckCircle2 } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { select } from '@nextui-org/react'
import { set } from 'date-fns'
import parse from 'html-react-parser'
import Link from 'next/link'

// Define the type for module data
// index is a property coming from and not any index of an array/object
interface ModuleDataItem {
    id: number
    index: number
    label: string
    name?: string
    content?: string
    questions?: Question[]
    completed?: boolean
}

interface Question {
    id: number
    question: string
    options: Option[]
}

interface Option {
    text: string
    correct: boolean
    number: number
}

// -----------------------------------
interface ChapterData {
    name: string
    label: string
    index: number
    createdAt: string
    updatedAt: string
    publishedAt: string
    time_limit: null | string
    zuvy_article_components: ZuvyArticleComponents
}

interface ZuvyArticleComponents {
    data: DataItem[]
}

interface DataItem {
    id: number
    attributes: Attributes
}

interface Attributes {
    tag_name: string
    tag_value: string
    createdAt: string
    updatedAt: string
    publishedAt: string | null
    name: string
}

interface DynamicTagProps {
    tagName: string
    tagValue: string
    name?: string
}

// -----------------------------------

// Create a component to render the HTML content with Tailwind CSS styles applied
interface ContentComponentProps {
    content: string
    isQuiz?: boolean
}

const ContentComponent: React.FC<ContentComponentProps> = ({
    content,
    isQuiz,
}) => {
    // Remove inline styles for quiz questions as it has text color white:-
    const sanitizedContent = isQuiz
        ? content.replace(/style=".*?"/g, '')
        : content

    return (
        <div
            className={`text-start max-w-3xl mx-auto py-4 ${
                isQuiz ? 'text-black' : ''
            }`}
        >
            {/* Render the HTML content */}
            <div>{parse(sanitizedContent)}</div>
        </div>
    )
}

function Page({
    params,
}: {
    params: { viewcourses: string; moduleID: string }
}) {
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id
    const router = useRouter()
    const moduleID = params.moduleID
    const [moduleData, setModuleData] = useState<ModuleDataItem[]>([])
    const [selectedChapter, setSelectedChapter] = useState<{
        index: number | null
        id: number | null
    }>({
        index: null,
        id: null,
    })

    const [chapterData, setChapterData] = useState<ChapterData | null>(null)

    const [assignmentLink, setAssignmentLink] = useState('')
    const [assignmentId, setAssignmentId] = useState(0)
    const [articleId, setArticleId] = useState(0)
    const [quizId, setQuizId] = useState(0)
    const [articleCompleted, setArticleCompleted] = useState(false)
    const [selectedChapterQuestions, setSelectedChapterQuestions] = useState<
        Question[]
    >([])

    const [selectedChapterLabel, setSelectedChapterLabel] = useState<string>('')

    const [selectedOptions, setSelectedOptions] = useState<{
        [key: number]: number
    }>({})

    useEffect(() => {
        const getModuleData = async () => {
            try {
                const response = await api.get(
                    `/Content/chapter/${moduleID}?user_id=${userID}`
                )
                const data: ModuleDataItem[] = response.data

                const sortedData = data.sort((a, b) => {
                    return a.index - b.index
                })

                setModuleData(sortedData)

                // Set selectedChapterID to the ID of the first module
                if (data.length > 0) {
                    setSelectedChapter({ index: data[0].index, id: data[0].id })
                    setArticleCompleted(data[0]?.completed || false)
                    setSelectedChapterQuestions(data[0]?.questions || [])
                    setSelectedChapterLabel(data[0]?.label)
                }
            } catch (error) {
                console.error('Error fetching module data:', error)
            }
        }
        if (userID) getModuleData()
    }, [moduleID, userID, articleId, assignmentId, quizId])

    useEffect(() => {
        const getchapterData = async () => {
            try {
                const response = await fetch(
                    `https://merd-strapi.merakilearn.org/api/zuvy-articles/${selectedChapter.id}?populate=zuvy_article_components`
                )
                    .then((res) => {
                        return res.json()
                    })
                    .then((data) => {
                        setChapterData(data.data.attributes)
                    })
            } catch (error) {
                console.error('Error fetching chapter data:', error)
            }
        }
        if (userID) getchapterData()
    }, [selectedChapter])

    const handleAssignmentLinkChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setAssignmentLink(event.target.value)
    }

    const handleAssignmentSubmit = async () => {
        try {
            const response = await api.post(
                `/tracking/assignment?bootcampId=${params.viewcourses}`,
                {
                    userId: userID,
                    assignmentId: selectedChapter.id,
                    moduleId: parseInt(moduleID),
                    projectUrl: assignmentLink,
                }
            )
            const data = response.data
            toast({
                title: 'Successfully Submitted Assignment',
                description: response.data.projectUrl,
                className: 'text-start capitalize bg-green-500 text-white',
            })
            setAssignmentId(selectedChapter.id ?? 0)

            // get the index of the current chapter:
            const currentIndex = moduleData.findIndex(
                (item) => item.index === selectedChapter.index
            )

            // Add any additional logic here after successful form submission
        } catch (error: any) {
            console.error('Assignment Not Submitted:', error)
            toast({
                title: 'Error Submitting',
                description: error.response.data.message,
                className: 'text-start capitalize bg-red-500 text-white',
            })
        }

        return false
    }

    const handleArticleComplete = async () => {
        try {
            const response = await api.post(
                `/tracking/article?bootcampId=${params.viewcourses}`,
                {
                    userId: userID,
                    articleId: selectedChapter.id,
                    moduleId: moduleID,
                }
            )
            const data = response.data

            toast({
                title: 'Completed Article Successfully',
                description: 'You have completed the article successfully',
                className: 'text-start capitalize bg-green-500 text-white',
            })
            setArticleId(selectedChapter.id ?? 0)
        } catch (error: any) {
            console.error('Error Completing Article:', error)
            toast({
                title: 'Error',
                description: error.response.data.message,
                className: 'text-start capitalize bg-red-500 text-white',
            })
        }
    }

    const handleQuizSubmit = async () => {
        try {
            const moduleItem = moduleData.find(
                (item) => item.index === selectedChapter.index
            )

            if (!moduleItem) {
                console.error('Module not found')
                return
            }

            const totalQuestions = moduleItem.questions
                ? moduleItem.questions.length
                : 0
            const totalSelectedOptions = Object.keys(selectedOptions).length

            if (totalQuestions !== totalSelectedOptions) {
                // If the number of questions is not equal to the number of selected options,
                // show an error indicating that all questions must be answered.
                toast({
                    title: 'Error',
                    description:
                        'Please answer all questions before submitting the quiz.',
                    className: 'text-start capitalize bg-red-500 text-white',
                })
                return
            }

            // All questions have been answered, proceed with submission
            const selectedOptionsArray = Object.entries(selectedOptions).map(
                ([questionId, selectedOptionNumber]) => {
                    const question = moduleItem?.questions?.find(
                        (q) => q.id === parseInt(questionId)
                    )

                    const option = question?.options.find(
                        (opt) => opt.number === selectedOptionNumber
                    )

                    return {
                        mcqId: parseInt(questionId),
                        chossenOption: selectedOptionNumber,
                        status: option?.correct ? 'pass' : 'fail',
                        attemptCount: 1,
                    }
                }
            )

            const response = await api.post('/tracking/quiz', {
                userId: userID,
                bootcampId: 9,
                moduleId: moduleID,
                quizId: selectedChapter.id,
                quiz: selectedOptionsArray ?? [],
            })

            const data = response.data

            toast({
                title: 'Quiz Submitted Successfully',
                description: 'Successfully submitted the quiz',
                className: 'text-start capitalize bg-green-500 text-white',
            })
            setQuizId(selectedChapter.id ?? 0)
        } catch (error) {
            console.error('Error creating course:', error)
            toast({
                title: 'Error',
                description: 'Cannot submit the quiz',
                className: 'text-start capitalize bg-red-500 text-white',
            })
        }
    }

    const DynamicTag: React.FC<DynamicTagProps> = ({
        tagName,
        tagValue,
        name,
    }) => {
        switch (tagName) {
            case 'img':
                const regex = /src="(.*?)"/
                const match = tagValue.match(regex)
                const imgUrl = match ? match[1] : ''
                return <img src={imgUrl} alt={name || 'Image'} />
            default:
                return parse(tagValue)
        }
    }

    function openAssessmentTab() {
        setSelectedChapterLabel('Assessment')
        setChapterData(null)
        setSelectedChapter({ index: null, id: null })
    }

    function startAssessment() {
        router.push(
            `/student/courses/${params.viewcourses}/modules/${moduleID}/assessment`
        )
    }

    return (
        <div className="flex">
            {/* Sidebar with labels */}

            <div className="w-1/4 border-r-2 text-left p-4">
                {/* Go back Arrow button below */}
                <button
                    onClick={() =>
                        router.push(`/student/courses/${params.viewcourses}`)
                    }
                >
                    <ArrowBigLeft className="text-[#518672]" />
                </button>

                <h4 className="text-lg font-bold mb-2 mt-5">Chapter List</h4>
                <ul>
                    <li
                        className={`flex justify-between cursor-pointer capitalize py-2 px-4 hover:bg-gray-300 ${
                            selectedChapterLabel === 'Assessment'
                                ? 'font-bold'
                                : ''
                        }`}
                        onClick={openAssessmentTab}
                    >
                        Assessment
                    </li>
                </ul>
                <ul>
                    {moduleData.map((item, index) => (
                        <li
                            key={index}
                            className={`flex justify-between cursor-pointer capitalize py-2 px-4 hover:bg-gray-300 ${
                                selectedChapter.index === item.index
                                    ? 'font-bold'
                                    : ''
                            }`}
                            onClick={() => {
                                setSelectedChapter({
                                    index: item.index,
                                    id: item.id,
                                })
                                setArticleCompleted(item?.completed || false)
                                setSelectedChapterQuestions(
                                    item?.questions || []
                                )
                                setSelectedChapterLabel(item?.label)
                            }}
                        >
                            <div className="flex items-center">
                                {`${item.label}: ${item.name ? item.name : ''}`}
                                {/* Show number of questions for Quiz and MCQ */}
                                {['quiz'].includes(item.label) && (
                                    <span className="text-sm ml-2 text-gray-500">
                                        (
                                        {item.questions
                                            ? item.questions.length
                                            : 0}{' '}
                                        questions)
                                    </span>
                                )}
                            </div>
                            {item.completed && (
                                <CheckCircle2
                                    size={18}
                                    className="text-[#518672] ml-1 mt-1"
                                />
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            {/* Right side content */}
            <div className="w-2/4 m-10 flex flex-col text-left">
                {chapterData === null &&
                    selectedChapterLabel === 'Assessment' && (
                        <>
                            <h1>Welcome to Assessment!</h1>
                            <p>
                                This is the assessment page. You can take the
                                assessment here.
                            </p>

                            <Button onClick={startAssessment}>
                                Start Assessment
                            </Button>
                        </>
                    )}

                {chapterData?.label === 'article' &&
                    selectedChapterLabel != 'quiz' && (
                        <>
                            {chapterData?.zuvy_article_components?.data?.map(
                                (item, index) => (
                                    <DynamicTag
                                        key={index}
                                        tagName={item.attributes.tag_name}
                                        tagValue={item.attributes.tag_value}
                                        name={item.attributes.name}
                                    />
                                )
                            )}

                            <Button
                                className="m-auto w-1/5"
                                disabled={articleCompleted}
                                onClick={() => {
                                    handleArticleComplete()
                                }}
                            >
                                Complete
                            </Button>
                        </>
                    )}

                {chapterData?.label === 'assignment' &&
                    selectedChapterLabel != 'quiz' && (
                        <div>
                            {chapterData?.zuvy_article_components?.data?.map(
                                (item, index) => (
                                    <DynamicTag
                                        key={index}
                                        tagName={item.attributes.tag_name}
                                        tagValue={item.attributes.tag_value}
                                        name={item.attributes.name}
                                    />
                                )
                            )}

                            {/* Only render form if label is "assignment" */}
                            <form className="mt-5">
                                {/* Form input fields */}
                                <input
                                    type="text"
                                    placeholder="Assignment Link"
                                    value={assignmentLink}
                                    onChange={handleAssignmentLinkChange}
                                    disabled={articleCompleted}
                                    className="border border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md px-4 py-2 outline-none"
                                />
                                {/* Submit button */}
                                <Button
                                    disabled={articleCompleted}
                                    onClick={handleAssignmentSubmit}
                                    type="button"
                                >
                                    Submit
                                </Button>
                            </form>
                        </div>
                    )}

                {selectedChapterLabel === 'quiz' &&
                    moduleData
                        .filter((item) => item.index === selectedChapter.index)
                        .map((item, index) => (
                            <div key={index}>
                                <ul>
                                    {item.questions &&
                                        item.questions.map((question) => (
                                            <li key={question.id}>
                                                <ContentComponent
                                                    content={question.question}
                                                    isQuiz={true}
                                                />

                                                <div className="flex justify-start  ">
                                                    <RadioGroup
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setSelectedOptions(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [question.id]:
                                                                        typeof value ===
                                                                        'string'
                                                                            ? parseInt(
                                                                                  value,
                                                                                  10
                                                                              )
                                                                            : value,
                                                                })
                                                            )
                                                        }
                                                        className="flex"
                                                        value={selectedOptions[
                                                            question.id
                                                        ]?.toString()}
                                                    >
                                                        {question.options.map(
                                                            (option) => (
                                                                <p
                                                                    key={
                                                                        option.number
                                                                    }
                                                                >
                                                                    <RadioGroupItem
                                                                        value={option.number.toString()}
                                                                        className="mr-2"
                                                                    />
                                                                    <label>
                                                                        {
                                                                            option.text
                                                                        }
                                                                    </label>
                                                                </p>
                                                            )
                                                        )}
                                                    </RadioGroup>
                                                </div>
                                            </li>
                                        ))}
                                </ul>
                                {/* Submit button for quiz */}
                                <Button
                                    disabled={item?.completed}
                                    className="mt-5"
                                    onClick={handleQuizSubmit}
                                >
                                    Submit Quiz
                                </Button>
                            </div>
                        ))}
            </div>
        </div>
    )
}

export default Page
