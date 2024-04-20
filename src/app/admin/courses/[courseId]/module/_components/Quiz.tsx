import React from 'react'

interface QuizProps {
    content: Object
}

function Quiz({ content }: QuizProps) {
    console.log('first', content)
    return (
        <div className="m-auto w-[300px]">
            {content &&
                (content as { question: string; options: string[] }[])?.map(
                    ({ question, options }, index) => {
                        return (
                            <div key={index} className="text-start">
                                <p>
                                    Q{index + 1}. {question}
                                </p>
                                <ul className="text-start">
                                    {Object.values(options).map(
                                        (option, index) => {
                                            return (
                                                <li
                                                    key={index}
                                                    className="bg-muted rounded-sm my-1 p-2"
                                                >
                                                    {option}
                                                </li>
                                            )
                                        }
                                    )}
                                </ul>
                            </div>
                        )
                    }
                )}
        </div>
    )
}

export default Quiz
