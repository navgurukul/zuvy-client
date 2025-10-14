'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { api } from '@/utils/axios.config';
import { toast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';
import {CodingSubmissionSkeleton} from "@/app/student/_components/Skeletons"
import { 
  ChevronLeft, 
  Code2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MemoryStick, 
  Play,
  AlertTriangle,
  FileText,
  TestTube2,
  Terminal,
  X,
  Moon,
  Sun
} from 'lucide-react';
import { decodeBase64 } from '@/utils/students';
import Editor from '@monaco-editor/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import{TestCase,TestCasesSubmission,CodingSubmissionData} from '@/app/student/course/[courseId]/codingChallengeResult/studentCourseCodingChallengesResultType'
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/store/store';

// Re-using interfaces from CodingSubmission.tsx for consistency
const CodingResultContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const questionId = searchParams.get('questionId');
    const [submissionData, setSubmissionData] = useState<CodingSubmissionData | null>(null);
    const [loading, setLoading] = useState(true);
    const moduleId = searchParams.get('moduleId');
    const params = useParams();
    const chapterId = searchParams.get('chapterId');
    const { isDark, toggleTheme } = useThemeStore();

    useEffect(() => {
        if (questionId) {
            const fetchSubmission = async () => {
                setLoading(true);
                try {
                    const res = await api.get(`/codingPlatform/submissions/questionId=${questionId}`);
                    if(res.data.isSuccess) {
                        setSubmissionData(res.data);
                    } else {
                        throw new Error(res.data.message || 'Failed to fetch submission data.');
                    }
                } catch (error: any) {
                    toast({
                        title: 'Error',
                        description: error.message || 'Could not load submission results.',
                        variant: 'destructive',
                    });
                    setSubmissionData({ status: 'error', message: error.message });
                } finally {
                    setLoading(false);
                }
            };
            fetchSubmission();
        } else {
            setLoading(false);
        }
    }, [questionId]);
    
    
  if (loading) return <CodingSubmissionSkeleton />


  if (!questionId) {
  return (
            <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
                <h2 className="text-xl font-semibold mb-4">No Challenge Selected</h2>
                <p className="text-muted-foreground">Please go back and select a coding challenge to view results.</p>
            </div>
        )
  }
  
  if (submissionData?.status === 'error') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div
          onClick={() => router.back()}
          className="cursor-pointer flex items-center space-x-2 text-primary hover:text-primary-dark mb-6 transition-colors duration-200"
        >
          <ChevronLeft size={20} className="text-primary" /> 
          <span className="font-medium">Back</span>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="bg-destructive-light border border-destructive rounded-lg p-6 shadow-error">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
                  <span className="text-destructive-foreground text-xs font-bold">!</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-destructive-dark mb-2">Error Loading Submission</h3>
                <p className="text-sm text-destructive-dark">{submissionData?.message}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { sourceCode, TestCasesSubmission } = submissionData?.data || {};

  const passedTestCases = TestCasesSubmission?.filter(tc => 
    tc.status === 'passed' || tc.status === 'Accepted' || tc.status === 'AC'
  )?.length || 0;
  const totalTestCases = TestCasesSubmission?.length || 0;
  const overallSuccess = passedTestCases === totalTestCases && totalTestCases > 0;

  const formatValue = (value: unknown): string => {
    if (Array.isArray(value)) {
      return `[${value.join(', ')}]`;
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const renderParameterValue = (parameterType: string, parameterValue: unknown) => {
    if (Array.isArray(parameterValue)) {
      if (parameterValue.every(item => typeof item === 'object' && item !== null)) {
        return (
          <>
            [ 
            {parameterValue.map((item, index) => (
              <span key={index}>
                {JSON.stringify(item)}
                {index < parameterValue.length - 1 && ', '}
              </span>
            ))}
            ]
          </>
        );
      }
      return `[ ${parameterValue.join(', ')} ]`;
    }
    if (typeof parameterValue === 'object' && parameterValue !== null) {
      return JSON.stringify(parameterValue);
    }
    return String(parameterValue);
  };

  const renderInputs = (inputs: TestCase['inputs'], index: number) => {
    if (Array.isArray(inputs)) {
      return (
        <div className="space-y-2 text-left">
          {inputs.map((input, i) => (
            <div key={i} className="flex flex-wrap items-start gap-2 text-left">
              <span className="font-medium text-accent-dark">{input.parameterName}:</span>
              <span className="text-muted-foreground font-mono break-all">
                {renderParameterValue(input.parameterType, input.parameterValue)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="space-y-2 text-left">
        {Object.entries(inputs).map(([key, value]) => (
          <div key={key} className="flex flex-wrap items-start gap-2 text-left">
            <span className="font-medium text-accent-dark">{key}:</span>
            <span className="text-muted-foreground font-mono break-all">
              {formatValue(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };
  const handleBacktoChapters = () => {
    router.push(`/student/course/${params.courseId}/modules/${moduleId}?chapterId=${chapterId}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className='flex items-center justify-between '>
      <div
          onClick={handleBacktoChapters}
          className="inline-flex text-left  items-center space-x-2 text-primary hover:text-primary-dark transition-colors duration-200 cursor-pointer group "
      >                <X size={18} />
               
      </div>
      <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-8 h-8 sm:w-9 sm:h-9 p-0  text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {isDark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

      </div>
      <div className="max-w-7xl mx-auto">
        <div className="bg-card border border-border rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              {/* <div className={`p-4 rounded-2xl ${overallSuccess ? 'bg-success/10' : 'bg-destructive/10'}`}>
                <Code2 size={32} className={overallSuccess ? 'text-success' : 'text-destructive'} />
              </div> */}
              <div>
                <h1 className="text-2xl text-left font-bold text-foreground mb-2">Coding Submission Result</h1>
                <p className="text-muted-foreground text-left">Detailed analysis of your solution</p>
              </div>
            </div>
            <div className={`flex items-center space-x-2 px-2 py-1 rounded-full ${overallSuccess ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'}`}>
              <span className={`text-md font-bold ${overallSuccess ? 'text-success' : 'text-destructive'}`}>{passedTestCases}/{totalTestCases}</span>
              <span className="text-sm text-muted-foreground">tests passed</span>
            </div>
          </div>
          <div className={`rounded-xl p-6 border-2 ${overallSuccess ? 'bg-gradient-to-r from-success/5 to-success/10 border-success/20' : 'bg-gradient-to-r from-destructive/5 to-destructive/10 border-destructive/20'}`}>
            <div className="flex items-center space-x-4">
              {/* <div className={`p-3 rounded-full ${overallSuccess ? 'bg-success/20' : 'bg-destructive/20'}`}>
                {overallSuccess ? <CheckCircle2 size={24} className="text-success" /> : <XCircle size={24} className="text-destructive" />}
              </div> */}
              <div>
                <h3 className={`text-xl font-bold text-left ${overallSuccess ? 'text-success' : 'text-destructive'}`}>{overallSuccess ? 'All Tests Passed!' : 'Some Tests Failed'}</h3>
                <p className="text-muted-foreground mt-1 text-left">{overallSuccess ? 'Congratulations! Your solution works perfectly.' : 'You can review your test case results below.'}</p>
              </div>
            </div>
          </div>
        </div>
        {(TestCasesSubmission?.[0]?.memory || TestCasesSubmission?.[0]?.time) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {TestCasesSubmission?.[0]?.memory && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    <MemoryStick size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h6 className="font-semibold text-foreground">Memory Usage</h6>
                    <p className="text-sm text-left text-muted-foreground">Peak consumption</p>
                  </div>
                </div>
                <p className="text-3xl text-left font-bold ml-16 text-blue-600 dark:text-blue-400">{TestCasesSubmission[0].memory} bytes</p>
              </div>
            )}
            {TestCasesSubmission?.[0]?.time && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                    <Clock size={24} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h6 className="font-semibold text-foreground">Execution Time</h6>
                    <p className="text-sm text-left  text-muted-foreground">Total runtime</p>
                  </div>
                </div>
                <p className="text-3xl text-left font-bold ml-16 text-green-600 dark:text-green-400">{TestCasesSubmission[0].time} s</p>
              </div>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {sourceCode && (
            <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-muted/30 to-muted/10 px-6 py-4 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                    <FileText size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Your Source Code</h2>
                    <p className="text-sm text-muted-foreground">Solution implementation</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <Editor height="600px" defaultLanguage="python" value={decodeBase64(sourceCode)} theme="vs-dark" options={{readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 14, lineHeight: 22, padding: { top: 20, bottom: 20 }, cursorStyle: 'line-thin', renderLineHighlight: 'none', wordWrap: 'on', folding: true, }} />
              </div>
            </div>
          )}
          {TestCasesSubmission && TestCasesSubmission.length > 0 && (
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
                  <div className="flex items-center space-x-2"><div className={`w-3 h-3 rounded-full ${overallSuccess ? 'bg-success' : 'bg-destructive'}`}></div></div>
                </div>
              </div>
              <ScrollArea className="h-[600px] p-6">
                <div className="space-y-6">
                  {TestCasesSubmission.map((testCase, index) => {
                    const isPassed = testCase.status === 'passed' || testCase.status === 'Accepted' || testCase.status === 'AC';
                    return (
                      <div key={index} className={`border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${isPassed ? 'border-success/30 bg-gradient-to-r from-success/5 to-success/10' : 'border-destructive/30 bg-gradient-to-r from-destructive/5 to-destructive/10'}`}>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-xl ${isPassed ? 'bg-success/20' : 'bg-destructive/20'}`}><Play size={16} className={isPassed ? 'text-success' : 'text-destructive'} /></div>
                            <h3 className="font-bold text-foreground text-lg">Test Case {index + 1}</h3>
                          </div>
                          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold ${isPassed ? 'bg-success/20 text-success border border-success/30' : 'bg-destructive/20 text-destructive border border-destructive/30'}`}>
                            {isPassed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                            <span>{isPassed ? 'PASSED' : 'FAILED'}</span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center space-x-2 mb-2"><Play size={16} className="text-muted-foreground" /><p className="font-semibold text-foreground">Inputs</p></div>
                            <div className="bg-muted/50 rounded-lg p-4 border border-border/50">{renderInputs(testCase.testCases.inputs, index)}</div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-2"><CheckCircle2 size={16} className="text-muted-foreground" /><p className="font-semibold text-foreground">Expected Output</p></div>
                            <div className="bg-muted/50 rounded-lg p-4 border border-border/50 font-mono text-sm">{formatValue(testCase.testCases.expectedOutput.parameterValue)}</div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-2"><Terminal size={16} className="text-muted-foreground" /><p className="font-semibold text-foreground">Your Output</p></div>
                            <div className={`rounded-lg p-4 border font-mono text-sm ${testCase.stdout ? 'bg-muted/50 border-border/50 text-foreground' : 'bg-muted/30 border-border/30 text-muted-foreground italic'}`}>{testCase.stdout || 'No output generated'}</div>
                          </div>
                          {testCase.stderr && (
                            <div>
                              <div className="flex items-center space-x-2 mb-2"><AlertTriangle size={16} className="text-destructive" /><p className="font-semibold text-destructive">Error Output</p></div>
                              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 font-mono text-sm text-destructive">{testCase.stderr}</div>
                            </div>
                          )}
                          {(testCase.memory || testCase.time) && (
                            <div className="flex justify-around pt-4 border-t border-border/50">
                              {testCase.memory && <div className="text-center"><div className="flex items-center justify-center space-x-1 mb-1"><MemoryStick size={14} className="text-blue-500" /><p className="text-xs text-muted-foreground uppercase tracking-wide">Memory</p></div><p className="text-sm font-bold text-blue-600 dark:text-blue-400">{testCase.memory}</p></div>}
                              {testCase.time && <div className="text-center"><div className="flex items-center justify-center space-x-1 mb-1"><Clock size={14} className="text-green-500" /><p className="text-xs text-muted-foreground uppercase tracking-wide">Time</p></div><p className="text-sm font-bold text-green-600 dark:text-green-400">{testCase.time}</p></div>}
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
      </div>
    </div>
  );
};

const Page = () => {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Spinner size="large" />
            </div>
        }>
            <CodingResultContent />
        </Suspense>
    );
};

export default Page;