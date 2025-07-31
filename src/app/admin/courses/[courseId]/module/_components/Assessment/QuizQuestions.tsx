
import React from 'react'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { cn, difficultyBgColor, difficultyColor, ellipsis } from '@/lib/utils'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTrigger,
} from '@/components/ui/dialog'
import QuestionDescriptionModal from './QuestionDescriptionModal'
import PreviewMCQ from '@/app/admin/resource/_components/PreviewMcq'

interface MCQQuestion {
    id: number
    question: string
    options: Record<string, string>
    correctOption: number
    marks: number | null
    difficulty: string
    tagId: number
    usage: number
    quizVariants: any
}

const QuizQuestions = ({
    questions,
    setSelectedQuestions,
    selectedQuestions,
    tags,
    setIsNewQuestionAdded,
}: {
    questions: MCQQuestion[]
    setSelectedQuestions: React.Dispatch<React.SetStateAction<MCQQuestion[]>>
    selectedQuestions: MCQQuestion[]
    tags: any
    setIsNewQuestionAdded: React.Dispatch<React.SetStateAction<boolean>>
}) => {

    const handleQuestionSelection = (
        question: MCQQuestion,
        selectedQuestions: MCQQuestion[],
        setSelectedQuestions: React.Dispatch<React.SetStateAction<MCQQuestion[]>>,
        setIsNewQuestionAdded: React.Dispatch<React.SetStateAction<boolean>>
      ) => {
        if (!selectedQuestions.some((q) => q.id === question.id)) {
          setSelectedQuestions([...selectedQuestions, question]);
        }
        setIsNewQuestionAdded(true);
    };

    const renderQuestionContent = (question: MCQQuestion) => {
        const questionText = question?.quizVariants?.[0]?.question || question.question;

        console.log('questionText', questionText)
        
        // Check if question contains code blocks
        const hasCodeBlock = questionText && (questionText.includes('<pre') && questionText.includes('<code'));
        
        if (hasCodeBlock) {
            // For code questions, extract text and show preview
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = questionText;
            const textContent = tempDiv.textContent || tempDiv.innerText || '';
            const preview = textContent.length > 50 ? textContent.substring(0, 50) + '...' : textContent;
            
            return (
                <div className="p-2 text-sm text-gray-700">
                    {preview}
                </div>
            );
        } else {
            // For regular questions, handle cases where the first content is an image
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = questionText;

            // Remove all <img> tags
            tempDiv.querySelectorAll('img').forEach((img) => img.remove());

            // Convert heading tags (e.g., <h1>, <h2>, etc.) to plain text
            tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
                const textNode = document.createTextNode(heading.textContent || '');
                heading.replaceWith(textNode);
            });

            // Extract the remaining HTML content
            const sanitizedHTML = tempDiv.innerHTML;

            // Truncate the content if it's too long
            const truncatedQuestion = ellipsis(sanitizedHTML, 40);

            return (
                <span
                    dangerouslySetInnerHTML={{ __html: truncatedQuestion }}
                />
            );
        }
    };

    return (
        <ScrollArea className="h-[calc(100vh-200px)] pb-44  pr-4">
            {/* <ScrollBar orientation="vertical" className="h-dvh" /> */}
            {questions.map((question: MCQQuestion) => {
                const tag = tags?.find(
                    (tag: any) => tag?.id === question?.tagId
                )
                return (
                    <div
                        key={question.id}
                        className={`py-5 pl-2 pr-5 rounded-sm border-b border-gray-200 mb-4`}
                    >
                        <div className="flex justify-between text-start items-center">
                            <div className="w-full">
                                <div className="flex items-center  justify-between gap-2">
                                    <h2 className="font-bold text-[1rem] text-gray-600">
                                        {question?.quizVariants?.map(
                                            (ques: any) => {
                                                return (
                                                    <div className="text-[#4A4A4A] mt-1 overflow-hidden text-ellipsis font-semibold"
                                                        style={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 3,
                                                            WebkitBoxOrient: 'vertical',
                                                        }}>
                                                        {renderQuestionContent(question)}
                                                    </div>
                                                )
                                            }
                                        )}
                                        {/* {ellipsis(question.question, 35)} */}
                                    </h2>
                                    <div className="flex items-center gap-x-2">
                                        <div className="space-x-2">
                                            {tag && (
                                                <span className="text-sm text-[#518672] bg-[#DCE7E3] p-1 rounded-[100px] px-[8px]">
                                                    {tag?.tagName}
                                                </span>
                                            )}
                                            <span
                                                className={cn(
                                                    `text-[12px] rounded-[100px] px-1.5 py-1 `,
                                                    difficultyColor(
                                                        question.difficulty
                                                    ), // Text color
                                                    difficultyBgColor(
                                                        question.difficulty
                                                    ) // Background color
                                                )}
                                            >
                                                {question.difficulty}
                                            </span>
                                        </div>
                                        <div className="flex">
                                            {selectedQuestions.some(
                                                (q: MCQQuestion) =>
                                                    q.id === question.id
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
                                                    handleQuestionSelection(
                                                      question,
                                                      selectedQuestions,
                                                      setSelectedQuestions,
                                                      setIsNewQuestionAdded
                                                    );
                                                  }}
                                                    className="text-[rgb(81,134,114)] cursor-pointer"
                                                    size={20}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* <div className="w-full">
                                    <p className="text-[#4A4A4A] mt-1 font-[14px">
                                        {ellipsis(question.question, 60)}
                                    </p>
                                    <div className="text-[#4A4A4A] mt-1 font-[14px] overflow-hidden text-ellipsis font-semibold"
                                        style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                        }}>
                                        {renderQuestionContent(question)}
                                    </div>
                                </div> */}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <p className="font-bold text-sm mt-2 text-[#518672] cursor-pointer">
                                            View Full Description
                                        </p>
                                    </DialogTrigger>
                                    <DialogOverlay />
                                    <DialogContent>
                                        <PreviewMCQ
                                            quizQuestionId={question.id}
                                            tags={tags}
                                            assesmentSide={true}
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>
                )
            })}
        </ScrollArea>
    )
}

export default QuizQuestions