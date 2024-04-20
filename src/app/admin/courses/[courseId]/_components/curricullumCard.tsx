import {
    Clock1,
    Code,
    FileQuestion,
    PencilLine,
    ScrollText,
} from 'lucide-react'
import React from 'react'

type Props = {
    index: number
    name: string
    order: number
    description: string
    quizCount: number
    assignmentCount: number
    codingProblemsCount: number
    articlesCount: number
}

const CurricullumCard = ({
    index,
    name,
    order,
    description,
    quizCount,
    assignmentCount,
    codingProblemsCount,
    articlesCount,
}: Props) => {
    return (
        <div className="w-full flex items-center justify-between gap-y-2  ">
            <div className="flex gap-y-2 flex-col p-2  ">
                <div className="text-md font-semibold capitalize text-black text-start">
                    {`Module ${order}`} : {name}
                </div>
                <p className="text-start">{description}</p>
                <div className="flex flex-wrap justify-start  gap-x-4">
                    <div className="flex  items-center justify-start gap-x-2 ">
                        <Clock1 size={15} />
                        <p className="text-md font-semibold capitalize text-gray-600">
                            2 weeks
                        </p>
                    </div>
                    {articlesCount > 0 ? (
                        <div className="flex  items-center justify-start gap-x-2 ">
                            <ScrollText size={15} />
                            <p className="text-md font-semibold capitalize text-gray-600">
                                {articlesCount} articles
                            </p>
                        </div>
                    ) : null}
                    {assignmentCount > 0 ? (
                        <div className="flex  items-center justify-start gap-x-2 ">
                            <PencilLine size={15} />
                            <p className="text-md font-semibold capitalize text-gray-600">
                                {assignmentCount} assignments
                            </p>
                        </div>
                    ) : null}
                    {quizCount > 0 ? (
                        <div className="flex  items-center justify-start gap-x-2 ">
                            <FileQuestion size={15} />
                            <p className="text-md font-semibold capitalize text-gray-600">
                                {quizCount} Quiz
                            </p>
                        </div>
                    ) : null}
                    {codingProblemsCount > 0 ? (
                        <div className="flex  items-center justify-start gap-x-2 ">
                            <Code size={15} />
                            <p className="text-md font-semibold capitalize text-gray-600">
                                {codingProblemsCount} challenges
                            </p>
                        </div>
                    ) : null}
                </div>
            </div>
            {/* <div className="">
                <CircularLoader />
              </div> */}
        </div>
    )
}

export default CurricullumCard
