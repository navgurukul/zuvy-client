
import { b64DecodeUnicode } from '@/utils/base64'
import {TestCase,InputPage} from "@/app/admin/courses/[courseId]/submissionAssesments/[assessment_Id]/IndividualReport/[IndividualReport]/Report/[report]/ViewSolutionCodingQuestion/SubmissionViewPageType"
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MemoryStick, 
  Play,
  AlertTriangle,
  Terminal,
  TestTube2
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const TestCaseResults = ({ testCases }: any) => {
    const passedTestCases = testCases?.filter((tc: TestCase) => 
        tc.status === 'Accepted'
    )?.length || 0;
    const totalTestCases = testCases?.length || 0;
    const overallSuccess = passedTestCases === totalTestCases && totalTestCases > 0;

    return (
        <div className="w-full space-y-4">
            {testCases && testCases.length > 0 && (
                <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-muted/30 to-muted/10 px-6 py-4 border-b border-border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                                    <TestTube2 size={20} className="text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">Test Results</h2>
                                    <p className="text-sm text-muted-foreground">Execution analysis</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${overallSuccess ? 'bg-success' : 'bg-destructive'}`}></div>
                            </div>
                        </div>
                    </div>
                    <ScrollArea className="h-[600px] p-6">
                        <div className="space-y-6">
                            {testCases.map((testCase: TestCase, index: number) => {
                                const isPassed = testCase.status === 'Accepted';
                                return (
                                    <div key={index} className={`border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${isPassed ? 'border-success/30 bg-gradient-to-r from-success/5 to-success/10' : 'border-destructive/30 bg-gradient-to-r from-destructive/5 to-destructive/10'}`}>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-xl ${isPassed ? 'bg-success/20' : 'bg-destructive/20'}`}>
                                                    <Play size={16} className={isPassed ? 'text-success' : 'text-destructive'} />
                                                </div>
                                                <h3 className="font-bold text-foreground text-lg">Test Case {index + 1}</h3>
                                            </div>
                                            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold ${isPassed ? 'bg-success/20 text-success border border-success/30' : 'bg-destructive/20 text-destructive border border-destructive/30'}`}>
                                                {isPassed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                                <span>{isPassed ? 'PASSED' : 'FAILED'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {/* Inputs */}
                                            <div>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Play size={16} className="text-muted-foreground" />
                                                    <p className="font-semibold text-foreground">Inputs</p>
                                                </div>
                                                <div className="bg-muted/50 rounded-lg p-4 border border-border/50 overflow-x-auto">
                                                    <div className="space-y-2 text-left">
                                                        {testCase.testCases.inputs.map((input: InputPage, i: number) => (
                                                            <div key={i} className="my-1 text-[15px] max-w-full">
                                                                <div className="bg-gray-100 p-2 rounded-md break-all word-break overflow-hidden text-sm font-mono">
                                                                    {JSON.stringify(input.parameterValue)}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expected Output */}
                                            <div>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <CheckCircle2 size={16} className="text-muted-foreground" />
                                                    <p className="font-semibold text-foreground">Expected Output</p>
                                                </div>
                                                <div className="bg-muted/50 rounded-lg p-4 border border-border/50 font-mono text-sm overflow-x-auto">
                                                    <div className="bg-gray-100 p-2 rounded-md break-all word-break overflow-hidden text-sm font-mono text-left">
                                                        {testCase.testCases.expectedOutput.parameterType === 'arrayOfnum' ||
                                                        testCase.testCases.expectedOutput.parameterType === 'jsonType' ? 
                                                            JSON.stringify(testCase.testCases.expectedOutput.parameterValue) :
                                                            testCase.testCases.expectedOutput.parameterValue
                                                        }
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Your Output */}
                                            {testCase.stderr === null && (
                                                <div>
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <Terminal size={16} className="text-muted-foreground" />
                                                        <p className="font-semibold text-foreground">Your Output</p>
                                                    </div>
                                                    <div className="bg-muted/50 rounded-lg p-4 border border-border/50 font-mono text-sm overflow-x-auto">
                                                        <div className="bg-gray-100 p-2 rounded-md break-all word-break overflow-hidden text-sm font-mono text-left">
                                                            {Array.isArray(testCase.stdout) || testCase.stdout === 'jsonType' ? 
                                                                JSON.stringify(testCase.stdout) :
                                                                testCase.stdout === null ? 'null' : testCase.stdout
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Error Output */}
                                            {testCase.status !== 'Accepted' && (
                                                <div>
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <AlertTriangle size={16} className="text-destructive" />
                                                        <p className="font-semibold text-destructive">Error Output</p>
                                                    </div>
                                                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 font-mono text-sm text-destructive overflow-x-auto">
                                                        <div className="bg-gray-100 p-2 rounded-md break-all word-break overflow-hidden text-sm font-mono text-destructive">
                                                            {Array.isArray(testCase.stderr) || testCase.stderr === 'jsonType' ? 
                                                                JSON.stringify(testCase.stderr) :
                                                                testCase.stderr === null ? 'null' : testCase.stderr
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Performance Metrics */}
                                            {testCase.status === 'Accepted' && (testCase.memory || testCase.time) && (
                                                <div className="flex justify-around pt-4 border-t border-border/50">
                                                    {testCase.memory && (
                                                        <div className="text-center">
                                                            <div className="flex items-center justify-center space-x-1 mb-1">
                                                                <MemoryStick size={14} className="text-blue-500" />
                                                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Memory</p>
                                                            </div>
                                                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{testCase.memory}</p>
                                                        </div>
                                                    )}
                                                    {testCase.time && (
                                                        <div className="text-center">
                                                            <div className="flex items-center justify-center space-x-1 mb-1">
                                                                <Clock size={14} className="text-green-500" />
                                                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Time</p>
                                                            </div>
                                                            <p className="text-sm font-bold text-green-600 dark:text-green-400">{testCase.time}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    )
}

export default TestCaseResults