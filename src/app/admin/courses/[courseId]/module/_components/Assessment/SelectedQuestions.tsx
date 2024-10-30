import React from 'react'
import SelectCodingQuestions from './SelectCodingQuestions'
import SelectOpenEndedQuestions from './SelectOpenEndedQuestions'
import SelectQuizQuestions from './SelectQuizQuestions'

const selectedQuestions = ({
    selectedCodingQuestions,
    selectedQuizQuestions,
    selectedOpenEndedQuestions,
    setSelectedCodingQuestions,
    setSelectedQuizQuestions,
    setSelectedOpenEndedQuestions,
}: {
    selectedCodingQuestions: any
    selectedQuizQuestions: any
    selectedOpenEndedQuestions: any
    setSelectedCodingQuestions: any
    setSelectedQuizQuestions: any
    setSelectedOpenEndedQuestions: any
}) => {
    return (
        <>
            <SelectCodingQuestions
                selectedQuestions={selectedCodingQuestions}
                setSelectedQuestions={setSelectedCodingQuestions}
            />
            <SelectQuizQuestions
                selectedQuestions={selectedQuizQuestions}
                setSelectedQuestions={setSelectedQuizQuestions}
            />
            <SelectOpenEndedQuestions
                selectedQuestions={selectedOpenEndedQuestions}
                setSelectedQuestions={setSelectedOpenEndedQuestions}
            />
        </>
    )
}

export default selectedQuestions
