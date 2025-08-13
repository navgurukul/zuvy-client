import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn, difficultyBgColor, difficultyColor } from '@/lib/utils';
import {QuestionDescriptionModalProps } from "@/app/admin/courses/[courseId]/module/_components/Assessment/ComponentAssessmentType"

// Define the types for different question types


const QuestionDescriptionModal = ({ question, type, tagName }: QuestionDescriptionModalProps) => {
    return (
        <DialogContent className="max-w-2xl p-6">
        <div className="max-w-2xl p-6 ">
            <DialogHeader>
                <DialogTitle className="text-xl text-gray-600 font-bold">Coding Problem Preview

                    {tagName && (
                        <span className="text-[12px] text-[#518672] bg-[#DCE7E3] rounded-[100px] ml-2 py-1 px-[8px]">
                            {tagName}
                        </span>
                    )}

                    <span
                        className={cn(
                            `text-[12px] text-[#518672] bg-[#DCE7E3] rounded-[100px] ml-2 py-1 px-[8px]`,
                            difficultyColor(question.difficulty), // Text color
                            difficultyBgColor(question.difficulty) // Background color
                        )}
                    >
                        {question.difficulty}
                    </span>
                </DialogTitle>
            </DialogHeader>

            <div className="p-4 space-y-6 text-left">
                {/* Render question description */}
                <ScrollArea className="h-96 pr-4">
                    <ScrollBar orientation="vertical" />
                    <div>
                        <h4 className="font-semibold text-gray-600 text-lg">Title and Description:</h4>

                        <p className="text-gray-700">
                            <span className="font-semibold text-lg">{question.title}: </span>{question.description}</p>
                    </div>

                    {/* Conditional rendering based on question type */}
                    {type === 'coding' && 'testCases' in question && (
                        <div>
                            {/* Problem Statement */}
                            <div>
                                <h4 className="font-semibold text-gray-600 text-lg mb-1">Problem Statement:</h4>
                                <p className="text-gray-700 mb-3">
                                    {question.description}
                                </p>
                            </div>

                            {/* Constraints */}
                            <div>
                                <h4 className="font-semibold text-gray-600 text-lg mb-1">Constraints:</h4>
                                <p className="text-gray-700 mb-3">{question.constraints}</p>
                            </div>

                            {/* Function Name */}
                            <div>
                                <h4 className="font-semibold text-gray-600 text-lg mb-3">Function Name to Start With: <span className="font-light text-base">minJumps</span></h4>

                            </div>


                            {/* Input */}
                            <div>
                                <h4 className="font-semibold text-gray-600 text-lg mb-3">Input: <span className="font-light text-base">
                                    Array of integers arr and integer n (size of array)
                                </span></h4>

                            </div>

                            {/* Output */}
                            <div>
                                <h4 className="font-semibold text-gray-600 text-lg mb-3">Output: <span className="font-light text-base">
                                    Minimum number of jumps to reach destination (-1 if impossible)
                                </span></h4>
                                
                            </div>

                            {/* Test Cases */}
                            <div>
                                <h4 className="font-semibold text-gray-600 text-lg">Test Cases:</h4>
                                {question.testCases.map((testCase, index) => (
                                    <div key={testCase.id} className="px-4">
                                        <h5 className="font-semibold text-gray-600 text-[16px]">Example {index + 1}:</h5>

                                        {/* Input */}
                                        <div className="mb-2">
                                            <strong className='text-gray-600 text-[18px]'>Input:</strong>
                                            <pre className="ml-4 bg-gray-100 p-2 rounded-md text-gray-600 text-sm whitespace-pre-wrap">
                                                {testCase.inputs.map((input, idx) => {
                                                    const { parameterType, parameterValue } = input;
                                                    let formattedValue = "";
                                                    if (["str", "int", "float", "bool"].includes(parameterType)) {
                                                        formattedValue = String(parameterValue);
                                                    }
                                                    else if (parameterType === "arrayOfnum") {
                                                        formattedValue = `[${parameterValue.join(",")}]`;
                                                    }
                                                    // else if (parameterType === "arrayOfStr") {
                                                    //     formattedValue = `[${parameterValue.map((item: any) => (typeof item === "string" ? `"${item}"` : item)).join(",")}]`;
                                                    // }
                                                    else if (parameterType === "arrayOfStr") {
                                                        if (!Array.isArray(parameterValue)) {
                                                            formattedValue = `[${parameterValue.map((arr: any[]) => `[${arr.map((item: any) => (typeof item === "string" ? `"${item}"` : item)).join(",")}]`).join(",")}]`;
                                                        }
                                                    }
                                                    else if (parameterType === "jsonType" && Array.isArray(parameterValue) && parameterValue.every(obj => typeof obj === "object")) {
                                                        formattedValue = JSON.stringify(parameterValue, null, 2);
                                                    }
                                                    else if (parameterType === "jsonType" && typeof parameterValue === "object") {
                                                        formattedValue = JSON.stringify(parameterValue, null, 2);
                                                    }
                                                    else {
                                                        formattedValue = String(parameterValue);
                                                    }

                                                    return (
                                                        <span key={idx} className="block">
                                                            {formattedValue}
                                                        </span>
                                                    );
                                                })}
                                            </pre>
                                        </div>

                                        {/* Output */}
                                        <div>
                                            <strong className='text-gray-600 text-[18px]'>Output:</strong>
                                            <pre className="ml-4 bg-gray-100 p-2 rounded-md text-gray-600 text-sm whitespace-pre-wrap">
                                                {(() => {
                                                    const { parameterType, parameterValue } = testCase.expectedOutput;
                                                    if (["str", "int", "float", "bool"].includes(parameterType))
                                                        return String(parameterValue);
                                                    if (parameterType === "arrayOfnum")
                                                        if (Array.isArray(parameterValue)) {
                                                            return `[${parameterValue.join(",")}]`;
                                                        }
                                                    if (parameterType === "arrayOfStr")
                                                        if (!Array.isArray(parameterValue)) {
                                                            return `[${parameterValue?.map((arr: any[]) => `[${arr.map((item: any) => (typeof item === "string" ? `"${item}"` : item)).join(",")}]`).join(",")}]`;
                                                        }
                                                    if (parameterType === "jsonType" && Array.isArray(parameterValue) && parameterValue.every(obj => typeof obj === "object"))
                                                        return JSON.stringify(parameterValue, null, 2);
                                                    if (parameterType === "jsonType" && typeof parameterValue === "object")
                                                        return JSON.stringify(parameterValue, null, 2);

                                                    return String(parameterValue);
                                                })()}
                                            </pre>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </ScrollArea>

                {type === 'mcq' && 'options' in question && (
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Options:</h4>
                        <ul className="list-disc pl-6">
                            {question.options.map((option, idx) => (
                                <li key={idx}>{option}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {type === 'open-ended' && (
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Details:</h4>
                        <p>{question.description}</p>
                    </div>
                )}
            </div>
        </div>
        </DialogContent>
    );
};

export default QuestionDescriptionModal;