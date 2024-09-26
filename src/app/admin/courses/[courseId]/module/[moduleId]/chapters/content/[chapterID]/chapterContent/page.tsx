// 'use client'

// import { useCallback, useEffect, useState, useRef } from 'react'
// import { useParams } from 'next/navigation'
// import { api } from '@/utils/axios.config'
// import AddVideo from '@/app/admin/courses/[courseId]/module/_components/video/AddVideo'
// import AddArticle from '@/app/admin/courses/[courseId]/module/_components/Article/AddArticle'
// import CodingChallenge from '@/app/admin/courses/[courseId]/module/_components/codingChallenge/CodingChallenge'
// import Quiz from '@/app/admin/courses/[courseId]/module/_components/quiz/Quiz'
// import Assignment from '@/app/admin/courses/[courseId]/module/_components/assignment/Assignment'
// import AddAssessment from '@/app/admin/courses/[courseId]/module/_components/Assessment/AddAssessment'
// import AddForm from '@/app/admin/courses/[courseId]/module/_components/form/AddForm'
// import { Spinner } from '@/components/ui/spinner'

// interface Module {
//     chapterId: number
//     topicName: string
//     chapterTitle: string
//     topicId: number
//     // include other properties as needed
// }

// type Chapter = {
//     chapterId: number
//     chapterTitle: string
//     topicId: number
//     topicName: string
//     order: number
// }

// export default function Page({
//     params,
// }: {
//     params: { moduleId: any; courseId: any }
// }) {
//     const { courseId, moduleId, chapterID } = useParams()
//     const chapter_id = Array.isArray(chapterID)
//         ? Number(chapterID[0])
//         : Number(chapterID)
//     const [chapterId, setChapterId] = useState<number>(0)
//     // const { chapterContent, setChapterContent } = getChapterContentState()
//     const [chapterContent, setChapterContent] = useState<any>([])
//     const [moduleData, setModuleData] = useState<Module[]>([])
//     const [topicId, setTopicId] = useState(1)
//     const [activeChapterTitle, setActiveChapterTitle] = useState('')
//     const [currentChapter, setCurrentChapter] = useState<Chapter[]>([])
//     const [activeChapter, setActiveChapter] = useState(chapter_id)
//     const [loading, setLoading] = useState(true)
//     const [key, setKey] = useState(0)

//     const fetchChapters = useCallback(async () => {
//         try {
//             const response = await api.get(
//                 `/Content/allChaptersOfModule/${moduleId}`
//             )
//             // const currentChapter = response.data.chapterWithTopic.find(
//             //     (item: any) => item.chapterId === chapter_id
//             // )
//             // setCurrentChapter(currentChapter)
//             // setChapterData(response.data.chapterWithTopic)
//             // setModuleName(response.data.moduleName)
//             setModuleData(response.data.chapterWithTopic)
//         } catch (error) {
//             console.error('Error fetching chapters:', error)
//             // Handle error as needed
//         }
//     }, [moduleId, chapter_id])

//     const fetchChapterContent = useCallback(
//         async (chapterId: number) => {
//             let topicId = moduleData.find(
//                 (myModule: any) => myModule.chapterId === chapterId
//             )?.topicId
//             try {
//                 const response = await api.get(
//                     `Content/chapterDetailsById/${chapterId}?bootcampId=${params.courseId}&moduleId=${params.moduleId}&topicId=${topicId}`
//                 )
//                 console.log('response', response)
//                 setChapterId(chapterId)
//                 const currentModule: any = moduleData.find(
//                     (myModule: any) => myModule.chapterId === chapterId
//                 )

//                 console.log('currentModule', currentModule)
//                 if (currentModule) {
//                     setActiveChapterTitle(currentModule?.chapterTitle)
//                     setCurrentChapter(currentModule)
//                 }
//                 if (currentModule?.topicName === 'Quiz') {
//                     setChapterContent(
//                         response.data
//                         // .quizQuestionDetails as QuizQuestionDetails[]
//                     )
//                 } else if (currentModule?.topicName === 'Coding Question') {
//                     setChapterContent(response.data)
//                 } else if (currentModule?.topicName === 'Form') {
//                     setChapterContent(response.data)
//                 } else {
//                     setChapterContent(response.data)
//                 }

//                 setChapterContent(response.data)

//                 setTopicId(currentModule?.topicId)
//                 setTimeout(() => {
//                     setLoading(false) // Set loading to false after the delay
//                 }, 500)

//                 // setTopicId(response.data.topicId)

//                 setActiveChapter(chapterId)
//                 setKey((prevKey) => prevKey + 1)
//             } catch (error) {
//                 console.error('Error fetching chapter content:', error)
//             }
//         },
//         [moduleData, params.courseId, params.moduleId]
//     )

//     // useEffect(() => {
//     //     if (chapterData.length > 0) {
//     //         // const firstChapterId = chapterData[0].chapterId
//     //         const currentChapter = chapterData.find(
//     //             (item) => item.chapterId === chapter_id
//     //         )
//     //         if (currentChapter && currentChapter.topicId) {
//     //             setTopicId(currentChapter.topicId)
//     //             setActiveChapterTitle(currentChapter.chapterTitle)
//     //             fetchChapterContent(chapter_id)
//     //         }
//     //     } else {
//     //         setActiveChapter(0)
//     //         setChapterContent([])
//     //         setActiveChapterTitle('')
//     //         setTopicId(0)
//     //     }
//     // }, [chapterData, fetchChapterContent])

//     useEffect(() => {
//         // fetchCourseModules()
//         if (params.moduleId) {
//             fetchChapters()
//         }
//     }, [params, fetchChapters])

//     useEffect(() => {
//         fetchChapterContent(chapter_id)
//     }, [fetchChapterContent])

//     console.log('chapterContent', chapterContent)
//     console.log('topicIdddd', topicId)

//     const renderChapterContent = () => {
//         // if (
//         //     topicId &&
//         //     chapterContent &&
//         //     (chapterContent?.id === chapter_id ||
//         //         chapterContent?.chapterId === chapter_id)
//         // ) {
//         switch (topicId) {
//             case 1:
//                 return (
//                     <AddVideo
//                         key={chapterId}
//                         moduleId={params.moduleId}
//                         content={chapterContent}
//                         fetchChapterContent={fetchChapterContent}
//                     />
//                 )
//             case 2:
//                 return <AddArticle key={chapterId} content={chapterContent} />

//             case 3:
//                 return (
//                     <CodingChallenge
//                         key={chapterId}
//                         moduleId={params.moduleId}
//                         content={chapterContent}
//                         activeChapterTitle={activeChapterTitle}
//                     />
//                 )
//             case 4:
//                 return (
//                     <Quiz
//                         key={chapterId}
//                         chapterId={chapterId}
//                         moduleId={params.moduleId}
//                         content={chapterContent.quizQuestionDetails}
//                     />
//                 )
//             case 5:
//                 return <Assignment key={chapterId} content={chapterContent} />
//             case 6:
//                 return (
//                     <AddAssessment
//                         key={chapterId}
//                         chapterData={currentChapter}
//                         content={chapterContent}
//                         fetchChapterContent={fetchChapterContent}
//                         moduleId={params.moduleId}
//                     />
//                 )
//             case 7:
//                 return (
//                     <AddForm
//                         key={chapterId}
//                         chapterData={currentChapter}
//                         content={chapterContent}
//                         fetchChapterContent={fetchChapterContent}
//                         moduleId={params.moduleId}
//                     />
//                 )
//             default:
//                 return <h1>Create New Chapter</h1>
//         }
//         // } else {
//         //     return (
//         //         <>
//         //             {loading ? (
//         //                 <div className="my-5 flex justify-center items-center">
//         //                     <div className="absolute h-screen">
//         //                         <div className="relative top-[70%]">
//         //                             <Spinner className="text-secondary" />
//         //                         </div>
//         //                     </div>
//         //                 </div>
//         //             ) : (
//         //                 <h1>Create New Chapter</h1>
//         //             )}
//         //         </>
//         //     )
//         // }
//     }

//     return (
//         <div
//             className="col-span-3 mx-4 h-[690px] overflow-y-auto"
//             style={{
//                 scrollbarWidth: 'none', // Firefox
//                 msOverflowStyle: 'none', // IE and Edge
//             }}
//         >
//             {renderChapterContent()}
//         </div>
//     )
// }


"use client"

import { useCallback, useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/utils/axios.config'
import AddVideo from '@/app/admin/courses/[courseId]/module/_components/video/AddVideo'
import AddArticle from '@/app/admin/courses/[courseId]/module/_components/Article/AddArticle'
import CodingChallenge from '@/app/admin/courses/[courseId]/module/_components/codingChallenge/CodingChallenge'
import Quiz from '@/app/admin/courses/[courseId]/module/_components/quiz/Quiz'
import Assignment from '@/app/admin/courses/[courseId]/module/_components/assignment/Assignment'
import AddAssessment from '@/app/admin/courses/[courseId]/module/_components/Assessment/AddAssessment'
import AddForm from '@/app/admin/courses/[courseId]/module/_components/form/AddForm'

interface Module {
    chapterId: number
    topicName: string
    chapterTitle: string
    topicId: number
    // include other properties as needed
}

type Chapter = {
    chapterId: number
    chapterTitle: string
    topicId: number
    topicName: string
    order: number
}

interface QuizOptions {
    option1: string
    option2: string
    option3: string
    option4: string
}

interface QuizQuestionDetails {
    id: number
    question: string
    options: QuizOptions
    correctOption: string
    marks: null | number
    difficulty: string
    tagId: number
}

export default function Page({
    params,
}: {
    params: { moduleId: any; courseId: any }
}) {
    const { courseId, moduleId, chapterID } = useParams()
    const moduleID = Array.isArray(moduleId) ? moduleId[0] : moduleId
    const chapter_id = Array.isArray(chapterID)
    ? Number(chapterID[0])
    : Number(chapterID)
    const [moduleData, setModuleData] = useState<Module[]>([])
    const [chapterData, setChapterData] = useState([])
    const [chapterContent, setChapterContent] = useState<any>([])
    const [chapterId, setChapterId] = useState<number>(0)
    const [activeChapterTitle, setActiveChapterTitle] = useState('')
    const [currentChapter, setCurrentChapter] = useState<Chapter[]>([])
    const [activeChapter, setActiveChapter] = useState(chapter_id)
    const [topicId, setTopicId] = useState(1)
    const [key, setKey] = useState(0)

    const fetchChapters = useCallback(async () => {
        try {
            const response = await api.get(
                `/Content/allChaptersOfModule/${moduleId}`
            )
            console.log('response of allChaptersOfModule', response)
            const currentChapter = response.data.chapterWithTopic.find(
                (item: any) => item.chapterId === chapter_id
            )
            // console.log('currentChapter', currentChapter)
            // setCurrentChapter(currentChapter)
            setChapterData(response.data.chapterWithTopic)
            // setModuleName(response.data.moduleName)
            setModuleData(response.data.chapterWithTopic)
        } catch (error) {
            console.error('Error fetching chapters:', error)
            // Handle error as needed
        }
    }, [moduleId, chapter_id])

    const fetchChapterContent = useCallback(
        async (chapterId: number) => {
            let topicId = moduleData.find(
                (myModule: any) => myModule.chapterId === chapterId
            )?.topicId
            try {
                const response = await api.get(
                    `Content/chapterDetailsById/${chapterId}?bootcampId=${courseId}&moduleId=${moduleId}&topicId=${topicId}`
                )
                console.log('response of chapterDetailsById', response)
                setChapterId(chapterId)
                const currentModule: any = moduleData.find(
                    (myModule: any) => myModule.chapterId === chapterId
                )

                if (currentModule) {
                    setActiveChapterTitle(currentModule?.chapterTitle)
                    setCurrentChapter(currentModule)
                }

                if (currentModule?.topicName === 'Quiz') {
                    setChapterContent(
                        response.data
                            .quizQuestionDetails as QuizQuestionDetails[]
                    )
                } else if (currentModule?.topicName === 'Coding Question') {
                    setChapterContent(response.data)
                } else if (currentModule?.topicName === 'Form') {
                    setChapterContent(response.data)
                } else {
                    setChapterContent(response.data)
                }

                setTopicId(currentModule?.topicId)

                // setTopicId(response.data.topicId)

                setActiveChapter(chapterId)
                setKey((prevKey:any) => prevKey + 1)
            } catch (error) {
                console.error('Error fetching chapter content:', error)
            }
        },
        [moduleData, courseId, moduleId]
    )

    useEffect(() => {
        // fetchCourseModules()
        if (moduleId) {
            fetchChapters()
        }
    }, [courseId, moduleId, fetchChapters])

    useEffect(() => {
        if (chapterData.length > 0) {
            // const firstChapterId = chapterData[0].chapterId
            fetchChapterContent(chapter_id)
        } else {
            setActiveChapter(0)
            setChapterContent([])
            setActiveChapterTitle('')
            setTopicId(0)
        }
    }, [chapterData, fetchChapterContent])

    const renderChapterContent = () => {
        switch (topicId) {
            case 1:
                return (
                    <AddVideo
                        key={chapterId}
                        moduleId={moduleID}
                        content={chapterContent}
                        fetchChapterContent={fetchChapterContent}
                    />
                )
            case 2:
                return <AddArticle key={chapterId} content={chapterContent} />
            case 3:
                return (
                    <CodingChallenge
                        key={chapterId}
                        moduleId={moduleID}
                        content={chapterContent}
                        activeChapterTitle={activeChapterTitle}
                    />
                )
            case 4:
                return (
                    <Quiz
                        key={chapterId}
                        chapterId={chapterId}
                        moduleId={moduleID}
                        content={chapterContent}
                    />
                )
            case 5:
                return <Assignment key={chapterId} content={chapterContent} />
            case 6:
                return (
                    <AddAssessment
                        key={chapterId}
                        chapterData={currentChapter}
                        content={chapterContent}
                        fetchChapterContent={fetchChapterContent}
                        moduleId={moduleID}
                    />
                )
            case 7:
                return (
                    <AddForm
                        key={chapterId}
                        chapterData={currentChapter}
                        content={chapterContent}
                        fetchChapterContent={fetchChapterContent}
                        moduleId={moduleID}
                    />
                )
            default:
                return <h1>Create New Chapter</h1>
        }
        // return <h1>Create New Chapter</h1>
    }


    return (
        <div>{renderChapterContent()}</div>
    )
}
