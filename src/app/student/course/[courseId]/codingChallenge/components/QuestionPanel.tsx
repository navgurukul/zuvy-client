import React from 'react';
import { QuestionDetails, TestCase, Input } from '@/utils/types/coding-challenge';
import{QuestionPanelProps} from '@/app/student/course/[courseId]/codingChallenge/components/courseCodingComponentType'
import{formatValue} from "@/utils/students"

// const formatValue = (value: any, type: string): string => {
//     if (type === 'jsonType') {
//         return JSON.stringify(value);
//     }

//     if (Array.isArray(value)) {
//         if (type === 'arrayOfNum') {
//             return `[${value.join(', ')}]`;
//         }
//         if (type === 'arrayOfStr') {
//             return `[${value.map((v) => `"${v}"`).join(', ')}]`;
//         }
//         return `[${value.join(', ')}]`;
//     }

//     switch (type) {
//         case 'int':
//         case 'float':
//             return value.toString();
//         case 'str':
//             return `"${value}"`;
//         default:
//             return JSON.stringify(value);
//     }
// };



export function QuestionPanel({ questionDetails }: QuestionPanelProps) {
    return (
        <div className="h-full border-r border-border text-left">
            <div className="h-full overflow-y-auto scrollbar-hide">
                <div className="p-4">
                    <div className="space-y-6">
                        {/* Problem Title */}
                        <div>
                            <h1 className="text-xl font-semibold text-foreground mb-4">
                                {questionDetails.title}
                            </h1>
                        </div>

                        {/* Problem Description */}
                        <div>
                            <h2 className="text-base font-semibold text-foreground mb-3">
                                Description
                            </h2>
                            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                {questionDetails.description}
                            </div>
                        </div>

                        {/* Constraints */}
                        {questionDetails.constraints && (
                            <div>
                                <h2 className="text-base font-semibold text-foreground mb-3">
                                    Constraints
                                </h2>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap font-mono text-foreground">
                                    {questionDetails.constraints}
                                </div>
                            </div>
                        )}

                        {/* Test Cases */}
                        <div>
                            <h2 className="text-base font-semibold text-foreground mb-3">
                                Examples
                            </h2>
                            <div className="space-y-4">
                                {questionDetails?.testCases?.slice(0, 2).map((testCase: TestCase, index: number) => (
                                    <div
                                        key={index}
                                        className="border border-border rounded-lg overflow-hidden"
                                    >
                                        <div className="bg-muted/50 px-4 py-2">
                                            <h4 className="font-medium text-foreground text-sm">
                                                Example {index + 1}
                                            </h4>
                                        </div>

                                        <div className="p-4 space-y-3">
                                            {/* Input Section */}
                                            <div>
                                                <div className="text-sm font-medium text-muted-foreground mb-2">
                                                    Input:
                                                </div>
                                                <div className="bg-muted/30 rounded-md p-3 border">
                                                    <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">
                                                        {Array.isArray(testCase.inputs)
                                                            ? testCase.inputs.map((input: Input, idx: number) => (
                                                                <div key={idx}>
                                                                    {input.parameterName || `param${idx + 1}`} = {formatValue(input.parameterValue, input.parameterType)}
                                                                </div>
                                                            ))
                                                            : Object.entries(testCase.inputs).map(([key, value]) => (
                                                                <div key={key}>
                                                                    {key} = {formatValue(value, typeof value === 'number' ? 'int' : 'str')}
                                                                </div>
                                                            ))
                                                        }
                                                    </pre>
                                                </div>
                                            </div>

                                            {/* Output Section */}
                                            <div>
                                                <div className="text-sm font-medium text-muted-foreground mb-2">
                                                    Output:
                                                </div>
                                                <div className="bg-muted/30 rounded-md p-3 border">
                                                    <pre className="text-sm font-mono text-foreground">
                                                        {formatValue(
                                                            testCase.expectedOutput.parameterValue,
                                                            testCase.expectedOutput.parameterType
                                                        )}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {questionDetails?.testCases && questionDetails.testCases.length > 2 && (
                                    <div className="text-sm text-muted-foreground bg-muted/20 rounded-lg p-3 text-center">
                                        + {questionDetails.testCases.length - 2} more test case{questionDetails.testCases.length - 2 !== 1 ? 's' : ''} available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 