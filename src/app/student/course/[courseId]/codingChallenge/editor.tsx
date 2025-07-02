'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/utils/axios.config';
import { b64EncodeUnicode, b64DecodeUnicode } from '@/utils/base64';
import { Button } from '@/components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/ui/spinner';
import { ChevronLeft, Code, Play, Upload, CheckCircle, X } from 'lucide-react';
import useChapterCompletion from '@/hooks/useChapterCompletion';

interface Input {
    parameterName: string
    parameterType: string
    parameterValue: [] | {}
}

interface TestCase {
    inputs: Input[] | Record<string, unknown>
    expectedOutput: {
        parameterType: string
        parameterValue: [] | {}
    }
}

interface QuestionDetails {
    title: string;
    description: string;
    constraints?: string;
    examples: any[];
    testCases: TestCase[];
    templates: Record<string, { template: string }>;
}

interface CodeEditorProps {
    questionId: string;
    chapterId?: number;
    onChapterComplete?: () => void;
}

const editorLanguages = [
    { lang: 'java', id: 96 },
    { lang: 'python', id: 100 },
    { lang: 'javascript', id: 102 },
];

const CodeEditorComponent = ({ questionId,  onChapterComplete }: CodeEditorProps) => {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const chapterId = searchParams.get('chapterId');
    const moduleId = searchParams.get('moduleId');

    const [questionDetails, setQuestionDetails] = useState<QuestionDetails | null>(null);
    const [currentCode, setCurrentCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [languageId, setLanguageId] = useState(100);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [codeResult, setCodeResult] = useState<any[]>([]);
    const [codeError, setCodeError] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [modalType, setModalType] = useState<'success' | 'error'>('success');
    const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
    const [localIsCompleted, setLocalIsCompleted] = useState(false);

    // Chapter completion hook
    const { isCompleting, completeChapter } = useChapterCompletion({
        courseId: params.courseId as string,
        moduleId: moduleId as string,
        chapterId: chapterId?.toString() || '',
        onSuccess: () => {
            setLocalIsCompleted(true);
            if (onChapterComplete) {
                onChapterComplete();
            }
        },
    });

    const fetchSubmissionDetails = useCallback(async () => {
        if (!questionId) return;
        try {
            const response = await api.get(`/codingPlatform/submissions/questionId=${questionId}`);
            if (response.data.isSuccess && response.data.data) {
                const submissionData = response.data.data;
                
                // If action is submit, mark as already submitted
                if (submissionData.action === 'submit') {
                    setIsAlreadySubmitted(true);
                    setLocalIsCompleted(true);
                }
                
                // Set the language and code from previous submission
                if (submissionData.programLangId && submissionData.sourceCode) {
                    const langId = parseInt(submissionData.programLangId);
                    const selectedLang = editorLanguages.find(l => l.id === langId);
                    if (selectedLang) {
                        setLanguage(selectedLang.lang);
                        setLanguageId(langId);
                        setCurrentCode(b64DecodeUnicode(submissionData.sourceCode));
                    }
                }
            }
        } catch (error) {
            // No previous submission found, this is fine
            console.log('No previous submission found');
        }
    }, [questionId]);

    const fetchQuestionDetails = useCallback(async () => {
        if (!questionId) return;
        try {
            const response = await api.get(`/codingPlatform/get-coding-question/${questionId}`);
            setQuestionDetails(response.data.data);
            const initialTemplate = response.data.data?.templates?.[language]?.template;
            if (initialTemplate && !isAlreadySubmitted) {
                setCurrentCode(b64DecodeUnicode(initialTemplate));
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch question details.',
                variant: 'destructive',
            });
        }
    }, [questionId, language, toast, isAlreadySubmitted]);

    useEffect(() => {
        fetchSubmissionDetails();
    }, [fetchSubmissionDetails]);

    useEffect(() => {
        fetchQuestionDetails();
    }, [fetchQuestionDetails]);

    useEffect(() => {
        if (questionDetails?.templates?.[language]?.template && !isAlreadySubmitted) {
            setCurrentCode(b64DecodeUnicode(questionDetails.templates[language].template));
        }
    }, [language, questionDetails, isAlreadySubmitted]);

    const handleLanguageChange = (lang: string) => {
        const selectedLang = editorLanguages.find(l => l.lang === lang);
        if (selectedLang) {
            setLanguage(selectedLang.lang);
            setLanguageId(selectedLang.id);
        }
    };

    const formatValue = (value: any, type: string): string => {
        if (type === 'jsonType') {
            return JSON.stringify(value, null, 2)
        }

        if (Array.isArray(value)) {
            if (type === 'arrayOfNum') {
                return `[${value.join(', ')}]`
            }
            if (type === 'arrayOfStr') {
                return `[${value.map((v) => `"${v}"`).join(', ')}]`
            }
            return `[${value.join(', ')}]`
        }

        switch (type) {
            case 'int':
            case 'float':
                return value.toString()
            case 'str':
                return `"${value}"`
            default:
                return JSON.stringify(value)
        }
    }

    const handleSubmit = async (
        e: { preventDefault: () => void },
        action: 'run' | 'submit'
    ) => {
        e.preventDefault()
        setLoading(true)

        try {
            // First, submit to coding platform
            const response = await api.post(`codingPlatform/practicecode/questionId=${questionId}?action=${action}`, {
                languageId: languageId,
                sourceCode: b64EncodeUnicode(currentCode),
            });
            
            // Set the code result data
            setCodeResult(response.data.data);

            // Check if all test cases passed
            const allTestCasesPassed = response.data.data.every(
                (testCase: any) => testCase.status === 'Accepted'
            )

            if (action === 'submit') {
                setIsSubmitting(true)
                setIsAlreadySubmitted(true)
                setIsOpen(true)
                
                if (allTestCasesPassed) {
                    setModalType('success')
                    toast({
                        title: 'Success!',
                        description: 'Test Cases Passed, Solution submitted',
                    })
                } else {
                    setModalType('error')
                    toast({
                        title: 'Submitted',
                        description: 'Solution submitted but some test cases failed',
                        variant: 'destructive',
                    })
                }

                await completeChapter();
                // Complete chapter after successful submission to coding platform
                
                
            } else if (allTestCasesPassed && action === 'run') {
                toast({
                    title: 'Success',
                    description: 'Test Cases Passed'
                })
            } else {
                toast({
                    title: 'Failed',
                    description: 'Test Cases Failed',
                    variant: 'destructive'
                })
            }

            setCodeError('')
            setLoading(false)

            if (action === 'submit') {
                const closeTimeout = setTimeout(() => {
                    setIsOpen(false)
                }, 7000)
                return () => clearTimeout(closeTimeout)
            }
        } catch (error: any) {
            setLoading(false)
            setCodeResult(error.response?.data?.data || [])
            toast({
                title: 'Failed',
                description: error.response?.data?.message || 'Network connection lost.',
                variant: 'destructive',
            })
            setCodeError(
                error.response?.data?.data?.[0]?.stderr || error.response?.data?.data?.[0]?.stdErr ||
                    'Error occurred during submission. Network connection lost.'
            )
        }
    };

    const handleBack = () => router.back();

    function handleEditorChange(value: any) {
        setCurrentCode(value || '')
    }

    if (!questionDetails) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-lg text-gray-500">Loading...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/5 to-accent-light/10">
            {/* Header Bar with Navigation and Actions */}
            <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-4dp">
                <div className="w-full px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Left: Back Button and Question Title */}
                        <div className="flex items-center space-x-4">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group bg-muted/50 hover:bg-muted px-3 py-2 rounded-lg">
                                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                                        <span className="font-medium">Back to Challenges</span>
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card border-border shadow-32dp">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-foreground">
                                            Are you absolutely sure?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-muted-foreground">
                                            This action cannot be undone. If you have not
                                            submitted your solution, it will be lost.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-muted hover:bg-muted-dark text-foreground border-border">
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive hover:bg-destructive-dark text-destructive-foreground"
                                            onClick={handleBack}
                                        >
                                            Go Back
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            {questionDetails && (
                                <div className="flex items-center space-x-3">
                                    {/* <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                                        <Code className="w-4 h-4 text-accent" />
                                    </div> */}
                                    <h1 className="text-xl font-bold text-foreground">
                                        {questionDetails.title}
                                    </h1>
                                    {isAlreadySubmitted && (
                                        <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                            Submitted
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right: Action Buttons */}
                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={(e) => handleSubmit(e, 'run')}
                                size="sm"
                                variant="outline"
                                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                                disabled={loading || isSubmitting || isAlreadySubmitted}
                            >
                                {loading ? <Spinner className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                <span className="ml-2 font-medium">Run Code</span>
                            </Button>
                            <Button
                                onClick={(e) => handleSubmit(e, 'submit')}
                                size="sm"
                                className="bg-primary hover:bg-primary-dark text-primary-foreground"
                                disabled={loading || isSubmitting || isAlreadySubmitted || isCompleting}
                            >
                                {loading || isCompleting ? <Spinner className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                                <span className="ml-2 font-medium">
                                    {isAlreadySubmitted ? 'Already Submitted' : 'Submit Solution'}
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success/Error Modal */}
            <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                <AlertDialogContent className="bg-card border-border shadow-32dp max-w-md">
                    <button
                        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors duration-200 p-1 rounded-lg hover:bg-muted"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <AlertDialogHeader className="text-center">
                        {modalType === 'success' ? (
                            <>
                                <div className="w-16 h-16 bg-success/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-success" />
                                </div>
                                <AlertDialogTitle className="text-success text-xl">
                                    🎉 Test Cases Passed!
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                    Great job! You have successfully solved this coding challenge.
                                </AlertDialogDescription>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-destructive/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <X className="w-8 h-8 text-destructive" />
                                </div>
                                <AlertDialogTitle className="text-destructive text-xl">
                                    ❌ Test Cases Failed
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                    Your solution didn&apos;t pass all test cases. Review your code and try again.
                                </AlertDialogDescription>
                            </>
                        )}
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>

            {/* Main Content Area */}
            <div className="w-full" style={{ height: 'calc(100vh - 80px)' }}>
                {questionDetails && (
                    <ResizablePanelGroup
                        direction="horizontal"
                        className="w-full h-full"
                    >
                        {/* Left Panel: Problem Description */}
                        <ResizablePanel defaultSize={50} minSize={25} maxSize={75}>
                            <div className="h-full bg-card border-r border-border">
                                <div className="h-full overflow-y-auto scrollbar-hide">
                                    <div className="p-6">
                                        <div className="bg-card border border-border rounded-xl shadow-sm">
                                            <div className="p-6 space-y-8">
                                                {/* Problem Description */}
                                                <div>
                                                    <h2 className="text-lg font-semibold text-foreground mb-4 text-left flex items-center space-x-2">
                                                        <div className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                                                        </div>
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
                                                            <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                                                                <Code className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                                            </div>
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
                                                        <div className="w-5 h-5 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center">
                                                            <Play className="w-3 h-3 text-green-600 dark:text-green-400" />
                                                        </div>
                                                        <span>Examples</span>
                                                    </h2>
                                                    <div className="space-y-6">
                                                        {questionDetails?.testCases?.slice(0, 3).map((testCase: TestCase, index: number) => (
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
                        </ResizablePanel>

                        <ResizableHandle withHandle />

                        {/* Right Panel: Code Editor and Output */}
                        <ResizablePanel defaultSize={50}>
                            <ResizablePanelGroup direction="vertical">
                                {/* Code Editor Panel */}
                                <ResizablePanel defaultSize={65} minSize={30}>
                                    <div className="h-full bg-card">
                                        {/* Editor Header */}
                                        <div className="bg-card-elevated border-b border-border p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <h3 className="font-bold text-foreground">Code Editor</h3>
                                                </div>

                                                {/* Language Selector */}
                                                <Select
                                                    value={language}
                                                    onValueChange={(e: any) => handleLanguageChange(e)}
                                                    disabled={isAlreadySubmitted}
                                                >
                                                    <SelectTrigger className="w-48 border-border bg-muted">
                                                        <SelectValue placeholder="Select Language" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-card border-border">
                                                        {editorLanguages.map((lang) => (
                                                            <SelectItem
                                                                key={lang.id}
                                                                value={lang.lang}
                                                                className={`hover:bg-primary ${language === lang.lang ? 'text-white' : ''} focus:bg-primary cursor-pointer data-[highlighted]:bg-primary data-[state=checked]:bg-primary`}
                                                            >
                                                                {lang.lang}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Monaco Editor */}
                                        <div style={{ height: 'calc(100% - 80px)' }}>
                                            <Editor
                                                height="100%"
                                                language={language}
                                                theme="vs"
                                                value={currentCode}
                                                onChange={handleEditorChange}
                                                defaultValue={language || 'Please Select a language above!'}
                                                options={{
                                                    wordWrap: 'on',
                                                    fontSize: 14,
                                                    lineHeight: 1.6,
                                                    minimap: { enabled: true },
                                                    scrollBeyondLastLine: false,
                                                    automaticLayout: true,
                                                    tabSize: 4,
                                                    insertSpaces: true,
                                                    renderWhitespace: 'selection',
                                                    bracketPairColorization: { enabled: true },
                                                    readOnly: isAlreadySubmitted,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </ResizablePanel>

                                <ResizableHandle withHandle />

                                {/* Output Panel */}
                                <ResizablePanel defaultSize={35} minSize={20}>
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
                                            {!loading && codeError && codeResult?.map((testCase: any, index: any) => (
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
                                            {!loading && !codeError && codeResult?.map((testCase: any, index: any) => (
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
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                )}
            </div>
        </div>
    );
};

export default CodeEditorComponent;
