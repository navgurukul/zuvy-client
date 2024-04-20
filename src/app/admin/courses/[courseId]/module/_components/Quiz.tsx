import React from 'react'

interface QuizProps {
    content: Object
}

function Quiz({ content }: QuizProps) {
    console.log('first', content)
    return (
        <div className="m-auto w-[300px]">
            {content &&
                (
                    content as {
                        id: number
                        question: string
                        options: string[]
                    }[]
                )?.map(({ id, question, options }, index) => {
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
                                            className="bg-muted rounded-sm my-1 p-2"
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
