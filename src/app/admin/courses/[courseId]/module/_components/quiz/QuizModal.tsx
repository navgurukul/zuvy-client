import React from 'react'
import { Button } from '@/components/ui/button'
import { cn, difficultyBgColor, difficultyColor, ellipsis } from '@/lib/utils'
import { Edit, XCircle } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTrigger,
} from '@/components/ui/dialog'
import PreviewMCQ from '@/app/admin/resource/_components/PreviewMcq'

type Props = {}

// ✅ Helper function to extract clean text from HTML
const extractTextFromHTML = (html: string): string => {
    if (!html) return ''
    
    try {
        if (typeof window === 'undefined') {
            return html
                .replace(/<[^>]*>/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/\s+/g, ' ')
                .trim()
        }
        
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html
        return tempDiv.textContent || tempDiv.innerText || ''
    } catch (error) {
        console.warn('Error extracting text from HTML:', error)
        return html
    }
}

// ✅ Helper function to check if question has code block
const isCodeQuestion = (question: string): boolean => {
    if (!question || typeof question !== 'string') return false
    return question.includes('<pre') && question.includes('<code')
}

// ✅ Function to render question text properly
const renderQuestionText = (question: string) => {
    if (!question) return 'No question available'
    
    const hasCodeBlock = isCodeQuestion(question)
    
    if (hasCodeBlock) {
        // For code questions, extract clean text and apply ellipsis
        const cleanText = extractTextFromHTML(question)
        return ellipsis(cleanText, 40)
    } else {
        // For regular questions, use dangerouslySetInnerHTML as before
        return <span dangerouslySetInnerHTML={{ __html: ellipsis(question, 40) }} />
    }
}

const QuizModal = ({
    data,
    removeQuestionById,
    tags,
    addQuestion,
    saveQuizQuestionHandler,
}: any) => {
    const handleClick = async () => {
        removeQuestionById(data.id)
        if (addQuestion.length == 1) {
            const requestBody = {
                quizQuestions: [],
            }
            await saveQuizQuestionHandler(requestBody)
        }
    }
    
    const filteredTag = tags?.filter((tag: any) => tag.id == data.tagId)
    const question = data?.quizVariants[0]?.question
    const hasCodeBlock = isCodeQuestion(question)
    const questionText = renderQuestionText(question)

    return (
        <div className="flex w-full justify-between py-3 items-center border-b h-30 border-gray-200">
            <div className="flex flex-col gap-2 w-full">
                <div className="flex flex-col gap-2 w-full">
                    <div className="font-semibold flex justify-between w-full">
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Question Text */}
                            <span className={`text-gray-600 text-[16px] ${hasCodeBlock ? 'font-mono text-sm' : ''}`}>
                                {typeof questionText === 'string' ? questionText : questionText}
                            </span>
                        </div>
                        {/* {ellipsis(data?.quizVariants[0]?.question, 40)} */}
                        <div className="mr-4 space-x-2 ">
                            <span className="text-sm text-[#518672] bg-[#DCE7E3] p-1 rounded-[100px] px-[8px]">
                                {filteredTag[0]?.tagName}
                            </span>
                            <span
                                className={cn(
                                    `text-[12px] rounded-[100px] py-1 px-1 `,
                                    difficultyColor(data.difficulty), // Text color
                                    difficultyBgColor(data.difficulty) // Background color
                                )}
                            >
                                {data.difficulty}
                            </span>
                        </div>
                    </div>            
                    <Dialog>
                        <DialogTrigger asChild>
                            <p className=" text-left font-bold text-sm  text-[#518672] cursor-pointer">
                                View Description
                            </p>
                        </DialogTrigger>
                        <DialogOverlay />
                        <DialogContent>
                            <PreviewMCQ
                                quizQuestionId={data.id}
                                tags={tags}
                                tagId={data.tagId}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            
            <XCircle
                size={20}
                onClick={handleClick}
                className="cursor-pointer text-red-600 mb-5 hover:text-red-800 transition-colors flex-shrink-0"
            />
        </div>
    )
}

export default QuizModal