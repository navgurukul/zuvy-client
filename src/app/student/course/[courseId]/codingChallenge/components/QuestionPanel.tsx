import React from 'react';
import { QuestionDetails, TestCase, Input } from '@/utils/types/coding-challenge';
import{QuestionPanelProps} from '@/app/student/course/[courseId]/codingChallenge/components/courseCodingComponentType'




const formatValue = (value: any, type: string): string => {
    if (type === 'jsonType') {
        return JSON.stringify(value, null, 2);
    }

    if (Array.isArray(value)) {
        if (type === 'arrayOfNum') {
            return `[${value.join(', ')}]`;
        }
        if (type === 'arrayOfStr') {
            return `[${value.map((v) => `"${v}"`).join(', ')}]`;
        }
        return `[${value.join(', ')}]`;
    }

    switch (type) {
        case 'int':
        case 'float':
            return value.toString();
        case 'str':
            return `"${value}"`;
        default:
            return JSON.stringify(value);
    }
};

export function QuestionPanel({ questionDetails }: QuestionPanelProps) {
    return (
        <div className="h-full bg-card border-r border-border">
            <div className="h-full overflow-y-auto scrollbar-hide">
                <div className="p-6">
                    <div className="bg-card border border-border rounded-xl shadow-sm">
                        <div className="p-6 space-y-8">
                            {/* Problem Description */}
                            <div>
                                <h5 className="text-left mb-4 font-bold text-foreground">
                                    {questionDetails.title}
                                </h5>
                                <h2 className="text-lg font-semibold text-foreground mb-4 text-left flex items-center space-x-2">
                                    <span>Description</span>
                                </h2>
                                <div className="text-left">
                                    <div className="text-foreground leading-relaxed whitespace-pre-wrap text-[15px] text-left">
                                        {questionDetails.description}
                                    </div>
                                </div>
                            </div>

                            {/* Constraints */}
                            {questionDetails.constraints && (
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground mb-4 text-left flex items-center space-x-2">
                                        <span>Constraints</span>
                                    </h2>
                                    <div className="rounded-lg p-4">
                                        <div className="text-sm leading-relaxed whitespace-pre-wrap font-mono text-left">
                                            {questionDetails.constraints}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Test Cases */}
                            <div>
                                <h2 className="text-lg font-semibold text-foreground mb-4 text-left flex items-center space-x-2">
                                    <span>Examples</span>
                                </h2>
                                <div className="space-y-6">
                                    {questionDetails?.testCases?.slice(0, 2).map((testCase: TestCase, index: number) => (
                                        <div
                                            key={index}
                                            className="rounded-lg overflow-hidden"
                                        >
                                            <div className="bg-muted/30 px-4 py-3">
                                                <h4 className="font-semibold text-foreground text-sm text-left">
                                                    Example {index + 1}
                                                </h4>
                                            </div>

                                            <div className="p-4 space-y-4">
                                                {/* Input Section */}
                                                <div>
                                                    <div className="text-sm font-medium text-muted-foreground mb-2 text-left">
                                                        Input:
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3">
                                                        <pre className="text-sm font-mono text-foreground whitespace-pre-wrap text-left">
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
                                                    <div className="text-sm font-medium text-muted-foreground mb-2 text-left">
                                                        Output:
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3">
                                                        <pre className="text-sm font-mono text-foreground text-left">
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

                                    {questionDetails?.testCases && questionDetails.testCases.length > 3 && (
                                        <div className="text-left p-4 text-sm text-muted-foreground bg-muted/20 rounded-lg">
                                            + {questionDetails.testCases.length - 3} more test case{questionDetails.testCases.length - 3 !== 1 ? 's' : ''} available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 