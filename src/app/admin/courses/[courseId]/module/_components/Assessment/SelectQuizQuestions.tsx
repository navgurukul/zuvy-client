import React from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'
import { cn, difficultyBgColor, difficultyColor, ellipsis } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTrigger,
} from '@/components/ui/dialog'
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
}

const SelectQuizQuestions = ({
    setSelectedQuestions,
    selectedQuestions,
    tags,
    type,
    setIsNewQuestionAdded,
}: {
    setSelectedQuestions: any
    selectedQuestions: any
    tags: any
    type: string
    setIsNewQuestionAdded: any
}) => {

    const handleQuestionRemoval = (
        question: { id: number }, // Assuming 'id' is a number, adjust as needed
        selectedQuestions: { id: number }[], // Adjust type as needed
        setSelectedQuestions: React.Dispatch<React.SetStateAction<{ id: number }[]>>, // Adjust type as needed
        setIsNewQuestionAdded: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
        setSelectedQuestions(selectedQuestions.filter((q) => q.id !== question.id));
        setIsNewQuestionAdded(true);
    };

    const renderQuestionContent = (question: any) => {
        const questionText = question?.quizVariants?.[0]?.question || question.question;
        
        // Check if question contains code blocks
        const hasCodeBlock = questionText && (questionText.includes('<pre') && questionText.includes('<code'));
        
        if (hasCodeBlock) {
            // For code questions, extract text and show preview
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = questionText;
            const textContent = tempDiv.textContent || tempDiv.innerText || '';
            const preview = textContent.length > 50 ? textContent.substring(0, 50) + '...' : textContent;
            
            return preview;
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

            return truncatedQuestion;
        }
    };

    return (
        <>
            <div className="w-full">
                {selectedQuestions.map((question: any) => {
                    // Find the tag name corresponding to the question's tagId
                    const tag = tags?.find((tag: any) => tag.id === question.tagId)
                    const isQuizVariantExists = question.quizVariants.length > 0

                    return (
                        <React.Fragment key={question.id}>

                            <div className="p-5 rounded-sm border-b border-gray-200 mb-4">
                                <div className="flex justify-between items-start w-full">
                                    <div className="w-full">
                                        <div className="flex items-center gap-2">
                                            <h2 className="font-bold text-[15px] text-gray-600">
                                                {isQuizVariantExists ? (
                                                    <span
                                                        key={question}
                                                        dangerouslySetInnerHTML={{
                                                            __html: renderQuestionContent(question),
                                                        }}
                                                    ></span>
                                                ) : ''}

                                                {/* {ellipsis(question.question, 35)} */}
                                            </h2>

                                        </div>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <p className="font-bold text-sm mt-2 text-[#518672] cursor-pointer text-left">
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
                                        </Dialog>{' '}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {tag && (
                                            <span className="text-[12px] text-[#518672] bg-[#DCE7E3] rounded-[100px] px-[8px]">
                                                {tag?.tagName}
                                            </span>
                                        )}
                                        <span
                                            className={cn(
                                                `text-[12px] rounded-[100px] px-[8px]`,
                                                difficultyColor(question.difficulty), // Text color
                                                difficultyBgColor(question.difficulty) // Background color
                                            )}
                                        >
                                            {question.difficulty}
                                        </span>
                                        <X
                                            onClick={() => {
                                                handleQuestionRemoval(
                                                    question,
                                                    selectedQuestions,
                                                    setSelectedQuestions,
                                                    setIsNewQuestionAdded
                                                );
                                            }}
                                            className="text-[#A3A3A3] cursor-pointer ml-4"
                                            size={20}
                                        />
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    )
                })}
            </div>
        </>
    )
}

export default SelectQuizQuestions