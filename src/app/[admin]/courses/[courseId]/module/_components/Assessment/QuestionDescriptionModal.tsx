import {
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn, difficultyBgColor, difficultyColor } from '@/lib/utils'
import { QuestionDescriptionModalProps } from '@/app/[admin]/courses/[courseId]/module/_components/Assessment/ComponentAssessmentType'
import {
    ReactElement,
    JSXElementConstructor,
    ReactNode,
    ReactPortal,
    PromiseLikeOfReactNode,
    Key,
} from 'react'

// Define the types for different question types

const QuestionDescriptionModal = ({
    question,
    type,
    tagName,
}: QuestionDescriptionModalProps) => {
    return (
        <DialogContent className="max-w-2xl p-6">
            <div className="max-w-2xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl text-gray-900 font-bold flex items-center gap-2">
                        Coding Problem Preview
                        {tagName && (
                            <span className="text-xs text-green-700 bg-green-100 rounded-full py-1 px-3">
                                {tagName}
                            </span>
                        )}
                        <span
                            className={cn(
                                `text-xs rounded-full py-1 px-3`,
                                difficultyColor(question.difficulty),
                                difficultyBgColor(question.difficulty)
                            )}
                        >
                            {question.difficulty}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4 space-y-4 text-left">
                    <ScrollArea className="h-96 pr-4">
                        <ScrollBar orientation="vertical" />
                        
                        {/* Title and Description */}
                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 text-base mb-2">
                                Title and Description:
                            </h4>
                            <p className="text-gray-700 text-sm ml-2">
                                <span className="font-semibold">
                                    {question.title}:{' '}
                                </span>
                                {question.description}
                            </p>
                        </div>

                        {type === 'coding' && 'testCases' in question && (
                            <div className="space-y-4">
                                {/* Problem Statement */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-base mb-2">
                                        Problem Statement:
                                    </h4>
                                    <p className="text-gray-700 text-sm ml-2">
                                        {question.description}
                                    </p>
                                </div>

                                {/* Constraints */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-base mb-2">
                                        Constraints:
                                    </h4>
                                    <p className="text-gray-700 text-sm ml-2">
                                        {question.constraints}
                                    </p>
                                </div>

                                {/* Function Name */}
                                {/* <div>
                                    <h4 className="font-semibold text-foreground text-lg mb-3">
                                        Function Name to Start With:{' '}
                                        <span className="font-light text-base">
                                            minJumps
                                        </span>
                                    </h4>
                                </div> */}

                                {/* Input */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-base">
                                        Input:{' '}
                                        <span className="font-normal text-gray-700 text-sm">
                                            Array of integers arr and integer n (size of array)
                                        </span>
                                    </h4>
                                </div>

                                {/* Output */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-base">
                                        Output:{' '}
                                        <span className="font-normal text-gray-700 text-sm">
                                            Minimum number of jumps to reach destination (-1 if impossible)
                                        </span>
                                    </h4>
                                </div>

                                {/* Test Cases */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-base mb-2">
                                        Test Cases:
                                    </h4>
                                    {question.testCases.map(
                                        (
                                            testCase: {
                                                id: Key | null | undefined
                                                inputs: any[]
                                                expectedOutput: {
                                                    parameterType: any
                                                    parameterValue: any
                                                }
                                            },
                                            index: number
                                        ) => (
                                            <div
                                                key={testCase.id}
                                                className="ml-4 space-y-4 mb-6"
                                            >
                                                <h5 className="font-semibold bg-muted/50 text-gray-900 px-4 py-2 text-sm mb-3 rounded-md">
                                                    Example {index + 1}:
                                                </h5>

                                                {/* Input */}
                                                <div className="mb-2">
                                                    <strong className="text-sm font-medium text-muted-foreground ml-4">
                                                        Input:
                                                    </strong>
                                                    <pre className="ml-4 bg-muted/30 p-2 space-y-4 rounded-md text-gray-900 text-sm whitespace-pre-wrap">
                                                        {testCase.inputs.map(
                                                            (
                                                                input: {
                                                                    parameterType: any
                                                                    parameterValue: any
                                                                },
                                                                idx: Key | null | undefined
                                                            ) => {
                                                                const {
                                                                    parameterType,
                                                                    parameterValue,
                                                                } = input
                                                                let formattedValue = ''
                                                                
                                                                if (
                                                                    ['str', 'int', 'float', 'bool'].includes(parameterType)
                                                                ) {
                                                                    formattedValue = String(parameterValue)
                                                                } else if (parameterType === 'arrayOfnum') {
                                                                    formattedValue = `[${parameterValue.join(',')}]`
                                                                } else if (parameterType === 'arrayOfStr') {
                                                                    if (!Array.isArray(parameterValue)) {
                                                                        formattedValue = `[${parameterValue
                                                                            .map((arr: any[]) =>
                                                                                `[${arr.map((item: any) =>
                                                                                    typeof item === 'string' ? `"${item}"` : item
                                                                                ).join(',')}]`
                                                                            )
                                                                            .join(',')}]`
                                                                    }
                                                                } else if (
                                                                    parameterType === 'jsonType' &&
                                                                    Array.isArray(parameterValue) &&
                                                                    parameterValue.every((obj) => typeof obj === 'object')
                                                                ) {
                                                                    formattedValue = JSON.stringify(parameterValue, null, 2)
                                                                } else if (
                                                                    parameterType === 'jsonType' &&
                                                                    typeof parameterValue === 'object'
                                                                ) {
                                                                    formattedValue = JSON.stringify(parameterValue, null, 2)
                                                                } else {
                                                                    formattedValue = String(parameterValue)
                                                                }

                                                                return (
                                                                    <span key={idx} className="block">
                                                                        {formattedValue}
                                                                    </span>
                                                                )
                                                            }
                                                        )}
                                                    </pre>
                                                </div>

                                                {/* Output */}
                                                <div>
                                                    <strong className="text-sm font-medium text-muted-foreground ml-4 mb-3">
                                                        Output:
                                                    </strong>
                                                    <pre className="ml-4 bg-muted/30 p-2 space-y-4 rounded-md text-gray-900 text-sm whitespace-pre-wrap">
                                                        {(() => {
                                                            const {
                                                                parameterType,
                                                                parameterValue,
                                                            } = testCase.expectedOutput
                                                            
                                                            if (['str', 'int', 'float', 'bool'].includes(parameterType))
                                                                return String(parameterValue)
                                                            if (parameterType === 'arrayOfnum')
                                                                if (Array.isArray(parameterValue)) {
                                                                    return `[${parameterValue.join(',')}]`
                                                                }
                                                            if (parameterType === 'arrayOfStr')
                                                                if (!Array.isArray(parameterValue)) {
                                                                    return `[${parameterValue
                                                                        ?.map((arr: any[]) =>
                                                                            `[${arr.map((item: any) =>
                                                                                typeof item === 'string' ? `"${item}"` : item
                                                                            ).join(',')}]`
                                                                        )
                                                                        .join(',')}]`
                                                                }
                                                            if (
                                                                parameterType === 'jsonType' &&
                                                                Array.isArray(parameterValue) &&
                                                                parameterValue.every((obj) => typeof obj === 'object')
                                                            )
                                                                return JSON.stringify(parameterValue, null, 2)
                                                            if (
                                                                parameterType === 'jsonType' &&
                                                                typeof parameterValue === 'object'
                                                            )
                                                                return JSON.stringify(parameterValue, null, 2)

                                                            return String(parameterValue)
                                                        })()}
                                                    </pre>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </ScrollArea>

                    {type === 'mcq' && 'options' in question && (
                        <div>
                            <h4 className="font-semibold text-base mb-2">
                                Options:
                            </h4>
                            <ul className="list-disc pl-6">
                                {question.options.map(
                                    (
                                        option:
                                            | string
                                            | number
                                            | boolean
                                            | ReactElement<any, string | JSXElementConstructor<any>>
                                            | Iterable<ReactNode>
                                            | ReactPortal
                                            | PromiseLikeOfReactNode
                                            | null
                                            | undefined,
                                        idx: Key | null | undefined
                                    ) => (
                                        <li key={idx}>{option}</li>
                                    )
                                )}
                            </ul>
                        </div>
                    )}

                    {type === 'open-ended' && (
                        <div>
                            <h4 className="font-semibold text-base mb-2">
                                Details:
                            </h4>
                            <p>{question.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </DialogContent>
    )
}

export default QuestionDescriptionModal