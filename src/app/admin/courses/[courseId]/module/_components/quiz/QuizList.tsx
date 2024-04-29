import { Plus } from 'lucide-react'
import React from 'react'

function QuizList() {
    return (
        <div className="flex justify-between">
            <div className="flex gap-x-4 ">
                <h1 className="text-left font-semibold text-gray-600 ">
                    Using Which Block can we rotate the block ?
                </h1>
                <span className="font-semibold text-secondary">Easy</span>
            </div>
            <Plus className="text-secondary" />
        </div>
    )
}

export default QuizList
