import React from 'react';
import { CodeResult } from '@/utils/types/coding-challenge';
import{OutputPanelProps} from '@/app/student/course/[courseId]/codingChallenge/components/courseCodingComponentType'

export function OutputPanel({ loading, codeError, codeResult }: OutputPanelProps) {
    return (
        <div className="h-full bg-white dark:bg-gray-950 flex flex-col">
            {/* Output Header */}
            <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-border p-3">
                <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-foreground text-sm">Output</h3>
                </div>
            </div>

            {/* Output Content */}
            <div
                style={{ height: 'calc(100% - 45px)' }}
                className="p-4 overflow-y-auto font-mono text-sm bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200"
            >
                {/* Loading State */}
                {loading && (
                    <div className="flex items-center space-x-2 text-gray-500 animate-pulse">
                        <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                        <span>Executing...</span>
                    </div>
                )}

                {/* Error Results (Compile/Runtime) */}
                {!loading && codeError && codeResult?.map((testCase: CodeResult, index: number) => (
                    <div key={index} className="mb-4">
                        <div className="flex items-center space-x-2 text-red-500 font-bold">
                            <span>[✗] Test Case #{index + 1}: {testCase.status}</span>
                        </div>
                        <div className="mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700 ml-1">
                            <div className="grid grid-cols-[max-content,1fr] gap-x-2 gap-y-1">
                                {testCase?.stdIn && (
                                    <>
                                        <span className="font-semibold text-gray-600 dark:text-gray-400 justify-self-end">Input:</span>
                                        <pre className="whitespace-pre-wrap break-all">{testCase.stdIn}</pre>
                                    </>
                                )}
                                {testCase?.expectedOutput && (
                                    <>
                                        <span className="font-semibold text-gray-600 dark:text-gray-400 justify-self-end">Expected:</span>
                                        <pre className="whitespace-pre-wrap break-all">{testCase.expectedOutput}</pre>
                                    </>
                                )}
                                {(testCase?.stdOut || testCase?.stdout) && (
                                    <>
                                        <span className="font-semibold text-gray-600 dark:text-gray-400 justify-self-end">Output:</span>
                                        <pre className="whitespace-pre-wrap break-all">{testCase?.stdOut || testCase?.stdout}</pre>
                                    </>
                                )}
                                {(testCase?.stdErr || testCase?.stderr) && (
                                    <>
                                        <span className="font-semibold text-red-500 justify-self-end">Error:</span>
                                        <pre className="text-red-500 whitespace-pre-wrap break-all">{testCase?.stdErr || testCase?.stderr}</pre>
                                    </>
                                )}
                                {testCase?.compileOutput && (
                                    <>
                                        <span className="font-semibold text-yellow-600 justify-self-end">Compile Msg:</span>
                                        <pre className="text-yellow-600 whitespace-pre-wrap break-all">{testCase.compileOutput}</pre>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Success/Run Results */}
                {!loading && !codeError && codeResult?.map((testCase: CodeResult, index: number) => (
                    <div key={index} className="mb-4">
                        {testCase.status === 'Accepted' ? (
                            <div className="flex items-center space-x-2 text-green-600 font-bold">
                                <span>[✓] Test Case #{index + 1}: Accepted</span>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center space-x-2 text-red-500 font-bold">
                                    <span>[✗] Test Case #{index + 1}: {testCase.status}</span>
                                </div>
                                <div className="mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700 ml-1">
                                    <div className="grid grid-cols-[max-content,1fr] gap-x-2 gap-y-1">
                                        {testCase?.stdIn && (
                                            <>
                                                <span className="font-semibold text-gray-600 dark:text-gray-400 justify-self-end">Input:</span>
                                                <pre className="whitespace-pre-wrap break-all">{testCase.stdIn}</pre>
                                            </>
                                        )}
                                        {testCase?.expectedOutput && (
                                            <>
                                                <span className="font-semibold text-gray-600 dark:text-gray-400 justify-self-end">Expected:</span>
                                                <pre className="whitespace-pre-wrap break-all">{testCase.expectedOutput}</pre>
                                            </>
                                        )}
                                        {(testCase?.stdOut || testCase?.stdout) && (
                                            <>
                                                <span className="font-semibold text-gray-600 dark:text-gray-400 justify-self-end">Your Output:</span>
                                                <pre className="whitespace-pre-wrap break-all">{testCase?.stdOut || testCase?.stdout}</pre>
                                            </>
                                        )}
                                        {testCase?.compileOutput && (
                                            <>
                                                <span className="font-semibold text-yellow-600 justify-self-end">Compile Msg:</span>
                                                <pre className="text-yellow-600 whitespace-pre-wrap break-all">{testCase.compileOutput}</pre>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Empty State */}
                {!loading && !codeResult?.length && (
                    <div className="flex items-center text-gray-400">
                        <span className="mr-2">&gt;</span>
                        <span>Console output will appear here.</span>
                        <span className="w-2 h-4 bg-primary ml-1 animate-pulse"></span>
                    </div>
                )}
            </div>
        </div>
    );
} 