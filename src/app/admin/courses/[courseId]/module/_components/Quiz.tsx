import { cn } from '@/lib/utils'
import React from 'react'

interface QuizProps {
    content: Object
}

function Quiz({ content }: QuizProps) {
    return (
        <div className="m-auto w-[300px]">
            {content &&
                (
                    content as {
                        id: number
                        question: string
                        options: string[]
                        correctOption: string
                    }[]
                )?.map(({ id, question, options, correctOption }, index) => {
                    return (
                        <div key={id} className="text-start mb-5">
                            <p>
                                Q{index + 1}. {question}
                            </p>
                            <ul className="text-start">
                                {Object.entries(options).map(([key, value]) => {
                                    return (
                                        <li
                                            key={key}
                                            className={cn(
                                                'rounded-sm my-1 p-2',
                                                correctOption === key.toString()
                                                    ? 'bg-secondary text-white'
                                                    : ''
                                            )}
                                        >
                                            {value}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    )
                })}
        </div>
    )
}

export default Quiz
