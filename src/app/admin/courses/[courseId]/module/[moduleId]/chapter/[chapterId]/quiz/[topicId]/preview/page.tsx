// // 'use client'

// // import React, { useEffect } from 'react'
// // import { getQuizPreviewStore } from '@/store/store'
// // import { fetchPreviewData } from '@/utils/admin'
// // import { ArrowLeft } from 'lucide-react'
// // import Link from 'next/link'
// // import { addClassToCodeTags } from '@/utils/admin'
// // import { Button } from '@/components/ui/button'
// // import { RemirrorForm } from '@/components/remirror-editor/RemirrorForm'

// // const PreviewQuiz = ({ params }: { params: any }) => {
// //     const { quizPreviewContent, setQuizPreviewContent } = getQuizPreviewStore()

// //     useEffect(() => {
// //         fetchPreviewData(params, setQuizPreviewContent)
// //     }, [params.chapterId, fetchPreviewData])

// //     return (
// //         <>
// //             <div className="fixed top-0 left-0 right-0 h-12 bg-[#518672] flex items-center justify-center z-50">
// //                 <h1 className="text-center text-[16px] text-[#FFFFFF]">
// //                     You are in the Admin Preview Mode. The questions cannot be
// //                     interacted with.
// //                 </h1>
// //             </div>

// //             {/* Go Back Button - Fixed positioning */}
// //             <Link
// //                 href={`/admin/courses/${params.courseId}/module/${params.moduleId}/chapters/${params.chapterId}`}
// //                 className="fixed left-4 top-16 flex items-center space-x-2 p-2 z-40"
// //             >
// //                 <ArrowLeft size={20} />
// //                 <p className="ml-1 text-sm font-medium text-gray-800">
// //                     Go back
// //                 </p>
// //             </Link>

// //             {/* Main Content - Centered */}
// //             <div className="flex justify-center mt-20 px-8">
// //                 <div className="w-full max-w-4xl pt-5">
// //                     <h1 className="text-center text-lg text-gray-600 font-semibold mb-6">
// //                         {quizPreviewContent?.title}
// //                     </h1>

// //                     <div className="flex flex-col items-center">
// //                         {quizPreviewContent?.quizQuestionDetails.map(
// //                             (question: any, index: number) => {
// //                                 return (
// //                                     <div key={question.id} className="mb-6 p-4 w-full max-w-3xl">
// //                                         <h3 className="font-semibold text-gray-600 text-[15px] text-left">
// //                                             Q{index + 1}.
// //                                         </h3>
// //                                         {/* Render question using RemirrorForm */}
// //                                         <div className="text-left text-gray-600 mb-2">
// //                                             <RemirrorForm
// //                                                 description={question.quizVariants[0].question}
// //                                                 preview={true} // Enable preview mode
// //                                             />
// //                                         </div>

// //                                         {/* Render options */}
// //                                         <div className="mt-2">
// //                                             {Object.entries(
// //                                                 question.quizVariants[0].options ||
// //                                                     {}
// //                                             ).map(([optionId, optionText]) => (
// //                                                 <div
// //                                                     key={optionId}
// //                                                     className="flex items-center p-3 text-gray-600"
// //                                                 >
// //                                                     <input
// //                                                         type="radio"
// //                                                         name={`question-${question.id}`}
// //                                                         value={optionId}
// //                                                         checked={
// //                                                             Number(optionId) ===
// //                                                             question.correctOption
// //                                                         }
// //                                                         readOnly
// //                                                         className="mr-5"
// //                                                     />
// //                                                     <label>
// //                                                         {optionText as String}
// //                                                     </label>
// //                                                     {Number(optionId) ===
// //                                                         question.correctOption && (
// //                                                         <span className="ml-5 text-green-600 font-bold">
// //                                                             (Correct)
// //                                                         </span>
// //                                                     )}
// //                                                 </div>
// //                                             ))}
// //                                         </div>
// //                                     </div>
// //                                 )
// //                             }
// //                         )}
// //                     </div>

// //                     {/* Submit Button with proper spacing */}
// //                     <div className="mt-8 mb-8 text-center">
// //                         <Button className='bg-success-dark opacity-75' disabled>Submit</Button>
// //                     </div>
// //                 </div>
// //             </div>
// //         </>
// //     )
// // }

// // export default PreviewQuiz

// 'use client'

// import React, { useEffect } from 'react'
// import { getQuizPreviewStore } from '@/store/store'
// import { fetchPreviewData } from '@/utils/admin'
// import { ArrowLeft } from 'lucide-react'
// import Link from 'next/link'
// import { addClassToCodeTags } from '@/utils/admin'
// import { Button } from '@/components/ui/button'
// import { RemirrorForm } from '@/components/remirror-editor/RemirrorForm'

// const PreviewQuiz = ({ params }: { params: any }) => {
//     const { quizPreviewContent, setQuizPreviewContent } = getQuizPreviewStore()

//     useEffect(() => {
//         fetchPreviewData(params, setQuizPreviewContent)
//     }, [params.chapterId, fetchPreviewData])

//     return (
//         <>
//             <div className="fixed top-0 left-0 right-0 h-12 bg-[#518672] flex items-center justify-center z-50">
//                 <h1 className="text-center text-[16px] text-[#FFFFFF]">
//                     You are in the Admin Preview Mode. The questions cannot be
//                     interacted with.
//                 </h1>
//             </div>

//             {/* Go Back Button - Fixed positioning */}
//             <Link
//                 href={`/admin/courses/${params.courseId}/module/${params.moduleId}/chapters/${params.chapterId}`}
//                 className="fixed left-4 top-16 flex items-center space-x-2 p-2 z-40"
//             >
//                 <ArrowLeft size={20} />
//                 <p className="ml-1 text-sm font-medium text-gray-800">
//                     Go back
//                 </p>
//             </Link>

//             {/* Main Content - Centered */}
//             <div className="flex justify-center mt-20 px-8">
//                 <div className="pt-5">
//                     <h1 className="text-center text-lg text-gray-600 font-semibold mb-6">
//                         {quizPreviewContent?.title}
//                     </h1>

//                     {quizPreviewContent?.quizQuestionDetails.map(
//                         (question: any, index: number) => {
//                             return (
//                                 <div key={question.id} className="mb-4 p-4 ">
//                                     <h3 className="font-semibold text-gray-600 text-[15px] text-left">
//                                         Q{index + 1}.
//                                     </h3>
//                                     {/* Render question using RemirrorForm */}
//                                     <div className="text-left text-gray-600 mb-2">
//                                         <RemirrorForm
//                                             description={question.quizVariants[0].question}
//                                             preview={true} // Enable preview mode
//                                         />
//                                     </div>

//                                     {/* Render options */}
//                                     <div className="mt-2">
//                                         {Object.entries(
//                                             question.quizVariants[0].options ||
//                                             {}
//                                         ).map(([optionId, optionText]) => (
//                                             <div
//                                                 key={optionId}
//                                                 className="flex items-center p-3 text-gray-600"
//                                             >
//                                                 <input
//                                                     type="radio"
//                                                     name={`question-${question.id}`}
//                                                     value={optionId}
//                                                     checked={
//                                                         Number(optionId) ===
//                                                         question.correctOption
//                                                     }
//                                                     readOnly
//                                                     className="mr-5"
//                                                 />
//                                                 <label>
//                                                     {optionText as String}
//                                                 </label>
//                                                 {Number(optionId) ===
//                                                     question.correctOption && (
//                                                         <span className="ml-5 text-green-600 font-bold">
//                                                             (Correct)
//                                                         </span>
//                                                     )}
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )
//                         }
//                     )}
//                     <div className="mt-8 mb-8 text-right">
//                     <Button className='bg-success-dark opacity-75' disabled>Submit</Button>
//                     </div>
//                 </div>
//             </div>
//         </>
//     )
// }

// export default PreviewQuiz


'use client'

import React, { useEffect } from 'react'
import { getQuizPreviewStore } from '@/store/store'
import { fetchPreviewData } from '@/utils/admin'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { addClassToCodeTags } from '@/utils/admin'
import { Button } from '@/components/ui/button'
import { RemirrorForm } from '@/components/remirror-editor/RemirrorForm'

const PreviewQuiz = ({ params }: { params: any }) => {
    const { quizPreviewContent, setQuizPreviewContent } = getQuizPreviewStore()

    useEffect(() => {
        fetchPreviewData(params, setQuizPreviewContent)
    }, [params.chapterId, fetchPreviewData])

    return (
        <>
            <div className="fixed top-0 left-0 right-0 h-12 bg-[#518672] flex items-center justify-center z-50">
                <h1 className="text-center text-[16px] text-[#FFFFFF]">
                    You are in the Admin Preview Mode. The questions cannot be
                    interacted with.
                </h1>
            </div>

            {/* Go Back Button - Fixed positioning */}
            <Link
                href={`/admin/courses/${params.courseId}/module/${params.moduleId}/chapters/${params.chapterId}`}
                className="fixed left-4 top-16 flex items-center space-x-2 p-2 z-40"
            > 
                {' '}
                {/* Absolute positioning */}
                <ArrowLeft size={20} />
                <p className="ml-1 text-sm font-medium text-gray-800">
                    Go back
                </p>
            </Link>

            {/* Main Content - Centered */}
            <div className="flex justify-center mt-20 px-8">
                <div className="pt-5">
                    <h1 className="text-start text-lg text-gray-600 font-semibold mb-6">
                        {quizPreviewContent?.title}
                    </h1>
                    
                    {quizPreviewContent?.quizQuestionDetails.map(
                        (question: any, index: number) => {
                            return (
                                <div key={question.id} className="mb-4 p-4 ">
                                    <h3 className="font-semibold text-gray-600 text-[15px] text-left">
                                        Q{index + 1}.
                                    </h3>
                                    {/* Render question using RemirrorForm */}
                                    <div className="text-left text-gray-600 mb-2">
                                        <RemirrorForm
                                            description={question.quizVariants[0].question}
                                            preview={true} // Enable preview mode
                                        />
                                    </div>

                                    {/* Render options */}
                                    <div className="mt-2">
                                        {Object.entries(
                                            question.quizVariants[0].options ||
                                                {}
                                        ).map(([optionId, optionText]) => (
                                            <div
                                                key={optionId}
                                                className="flex items-center p-3 text-gray-600"
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${question.id}`}
                                                    value={optionId}
                                                    checked={
                                                        Number(optionId) ===
                                                        question.correctOption
                                                    }
                                                    readOnly
                                                    className="mr-5"
                                                />
                                                <label>
                                                    {optionText as String}
                                                </label>
                                                {Number(optionId) ===
                                                    question.correctOption && (
                                                    <span className="ml-5 text-green-600 font-bold">
                                                        (Correct)
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        }
                    )}
                    </div>
                    
                    {/* Submit Button with proper spacing */}
            </div>
            
            <div className="fixed bottom-5 right-8">
                <Button className='bg-success-dark opacity-75' disabled>Submit</Button>
            </div>
        </>
    )
}

export default PreviewQuiz