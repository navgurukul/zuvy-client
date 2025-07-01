'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/utils/axios.config';
import { b64EncodeUnicode, b64DecodeUnicode } from '@/utils/base64';
import { Button } from '@/components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/ui/spinner';
import { ChevronLeft, Code, Play, Upload } from 'lucide-react';

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

const editorLanguages = [
    { lang: 'java', id: 96 },
    { lang: 'python', id: 100 },
    { lang: 'javascript', id: 102 },
];

const CodeEditorComponent = ({ questionId }: { questionId: string }) => {
    const router = useRouter();
    const { toast } = useToast();

    const [questionDetails, setQuestionDetails] = useState<QuestionDetails | null>(null);
    const [currentCode, setCurrentCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [languageId, setLanguageId] = useState(100);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [codeResult, setCodeResult] = useState<any[]>([]);
    const [codeError, setCodeError] = useState('');

    const fetchQuestionDetails = useCallback(async () => {
        if (!questionId) return;
        try {
            const response = await api.get(`/codingPlatform/get-coding-question/${questionId}`);
            setQuestionDetails(response.data.data);
            const initialTemplate = response.data.data?.templates?.[language]?.template;
            if (initialTemplate) {
                setCurrentCode(b64DecodeUnicode(initialTemplate));
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch question details.',
                variant: 'destructive',
            });
        }
    }, [questionId, language, toast]);

    useEffect(() => {
        fetchQuestionDetails();
    }, [fetchQuestionDetails]);

    useEffect(() => {
        if (questionDetails?.templates?.[language]?.template) {
            setCurrentCode(b64DecodeUnicode(questionDetails.templates[language].template));
        }
    }, [language, questionDetails]);

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
                if (allTestCasesPassed) {
                    toast({
                        title: 'Success!',
                        description: 'Test Cases Passed, Solution submitted',
                    })
                } else {
                    toast({
                        title: 'Submitted',
                        description: 'Solution submitted but some test cases failed',
                        variant: 'destructive',
                    })
                }
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
        } catch (error: any) {
            setLoading(false)
            setCodeResult(error.response?.data?.data || [])
            toast({
                title: 'Failed',
                description: error.response?.data?.message || 'Network connection lost.',
                variant: 'destructive',
            })
            setCodeError(
                error.response?.data?.data?.[0]?.stderr ||
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
        <div>
            <div className="flex justify-between mb-2">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <ChevronLeft fontSize={24} />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. If you have not
                                submitted your solution, it will be lost.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-red-500"
                                onClick={handleBack}
                            >
                                Go Back
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <div>
                    <Button
                        onClick={(e) => handleSubmit(e, 'run')}
                        size="sm"
                        className="mr-2"
                        disabled={loading || isSubmitting}
                    >
                        {loading ? <Spinner /> : <Play size={20} />}
                        <span className="ml-2 text-lg font-bold">Run</span>
                    </Button>
                    <Button
                        onClick={(e) => handleSubmit(e, 'submit')}
                        size="sm"
                        disabled={loading || isSubmitting}
                    >
                        {loading ? <Spinner /> : <Upload size={20} />}
                        <span className="ml-2 text-lg font-bold">Submit</span>
                    </Button>
                </div>
            </div>

            {questionDetails && (
                <ResizablePanelGroup
                    direction="horizontal"
                    className="w-full max-w-12xl rounded-lg "
                >
                    <ResizablePanel defaultSize={50}>
                        <div className="flex h-[90vh]">
                            <div className="w-full max-w-12xl p-2 bg-muted text-left">
                                <div className="p-2">
                                    <h1 className="text-xl font-bold">
                                        {questionDetails?.title}
                                    </h1>
                                    <p>{questionDetails?.description}</p>
                                    <p className="mt-3">
                                        <span className="font-bold">
                                            Constraints:
                                        </span>{' '}
                                        {questionDetails?.constraints}
                                    </p>

                                    {questionDetails?.testCases
                                        ?.slice(0, 2)
                                        .map(
                                            (
                                                testCase: TestCase,
                                                index: number
                                            ) => (
                                                <div
                                                    key={index}
                                                    className="bg-gray-200 shadow-sm rounded-lg p-4 my-4"
                                                >
                                                    <h2 className="text-xl font-semibold mb-2">
                                                        Test Case {index + 1}
                                                    </h2>

                                                    {/* Handle both array and object inputs */}
                                                    {Array.isArray(
                                                        testCase.inputs
                                                    )
                                                        ? testCase.inputs.map(
                                                              (
                                                                  input: Input,
                                                                  idx: number
                                                              ) => (
                                                                  <p
                                                                      key={idx}
                                                                      className="text-gray-700"
                                                                  >
                                                                      <span className="font-medium">
                                                                          Input{' '}
                                                                          {idx +
                                                                              1}
                                                                          :
                                                                      </span>{' '}
                                                                      {formatValue(
                                                                          input.parameterValue,
                                                                          input.parameterType
                                                                      )}
                                                                  </p>
                                                              )
                                                          )
                                                        : Object.entries(
                                                              testCase.inputs
                                                          ).map(
                                                              (
                                                                  [key, value],
                                                                  idx: number
                                                              ) => (
                                                                  <p
                                                                      key={key}
                                                                      className="text-gray-700"
                                                                  >
                                                                      <span className="font-medium">
                                                                          Input{' '}
                                                                          {idx +
                                                                              1}
                                                                          :
                                                                      </span>{' '}
                                                                      {key} ={' '}
                                                                      {formatValue(
                                                                          value,
                                                                          typeof value ===
                                                                              'number'
                                                                              ? 'int'
                                                                              : 'str'
                                                                      )}
                                                                  </p>
                                                              )
                                                          )}

                                                    <p className="text-gray-700 mt-2">
                                                        <span className="font-medium">
                                                            Expected Output:
                                                        </span>{' '}
                                                        {formatValue(
                                                            testCase
                                                                .expectedOutput
                                                                .parameterValue,
                                                            testCase
                                                                .expectedOutput
                                                                .parameterType
                                                        )}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={50}>
                        <ResizablePanelGroup direction="vertical">
                            <ResizablePanel defaultSize={70}>
                                <div className="flex h-full">
                                    <div className="w-full max-w-9xl bg-muted p-2">
                                        <form>
                                            <div>
                                                <div className="flex justify-between p-2">
                                                    <div className="flex gap-2 items-center">
                                                        <Code size={20} />
                                                        <p className="text-lg">
                                                            Code
                                                        </p>
                                                    </div>

                                                    <Select
                                                        value={language}
                                                        onValueChange={(
                                                            e: any
                                                        ) =>
                                                            handleLanguageChange(
                                                                e
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="border border-secondary w-[180px]">
                                                            <SelectValue placeholder="Select Language" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {editorLanguages.map(
                                                                (lang) => (
                                                                    <SelectItem
                                                                        key={
                                                                            lang.id
                                                                        }
                                                                        value={
                                                                            lang.lang
                                                                        }
                                                                    >
                                                                        {
                                                                            lang.lang
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Editor
                                                    height="90vh"
                                                    language={language}
                                                    theme="vs-dark"
                                                    value={currentCode}
                                                    onChange={
                                                        handleEditorChange
                                                    }
                                                    className="p-2"
                                                    defaultValue={
                                                        language ||
                                                        'Please Select a language above!'
                                                    }
                                                    options={{
                                                        wordWrap: 'on',
                                                    }}
                                                />
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel className="" defaultSize={40}>
                                <div className="flex h-full">
                                    <div className="w-full max-w-9xl bg-muted px-2 pt-2 pb-10 mx-2">
                                        <div className="flex justify-between p-2 bg-gray-800 border-b border-gray-700">
                                            <p className="text-lg text-gray-300">
                                                Output Window
                                            </p>
                                        </div>

                                        <div className="h-full p-4 text-start text-gray-100 overflow-y-auto font-mono bg-gray-900 border border-gray-700 rounded-b-lg">
                                            {/* Loader */}
                                            {loading && (
                                                <div className="flex justify-center items-center my-4">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                                    <span className="ml-2 text-lg text-gray-500">
                                                        Processing...
                                                    </span>
                                                </div>
                                            )}
                                            <p>
                                                {!loading &&
                                                    codeError &&
                                                    codeResult?.map(
                                                        (
                                                            testCase: any,
                                                            index: any
                                                        ) => (
                                                            <div
                                                                key={index}
                                                                className="shadow-sm rounded-lg p-4 my-4 bg-gray-800 border border-gray-700"
                                                            >
                                                                {testCase.status !==
                                                                    'Accepted' && (
                                                                    <>
                                                                        <p>
                                                                            <span className="text-yellow-200">
                                                                                Your
                                                                                Output:{' '}
                                                                            </span>
                                                                            {`${testCase?.stdOut || 'No output'}`}
                                                                        </p>

                                                                        <p>
                                                                            <span className="text-yellow-200">
                                                                                compileOutput:{' '}
                                                                            </span>
                                                                            {`${testCase?.compileOutput || 'No compile output'}`}
                                                                        </p>

                                                                        <p>
                                                                            <span className="text-yellow-200">
                                                                                Error:{' '}
                                                                            </span>
                                                                            <span className="font-mono text-destructive">{`${
                                                                                testCase?.stdErr ||
                                                                                'No error'
                                                                            }`}</span>
                                                                        </p>

                                                                        <p>
                                                                            <span className="text-yellow-200">
                                                                                Status:{' '}
                                                                            </span>
                                                                            <span className="font-mono text-destructive">
                                                                                {' '}
                                                                                {
                                                                                    testCase.status
                                                                                }
                                                                            </span>
                                                                        </p>

                                                                        <p>
                                                                            <span className="text-yellow-200">
                                                                                Input:{' '}
                                                                            </span>
                                                                            <br />
                                                                            {`${
                                                                                testCase?.stdIn ||
                                                                                'No input'
                                                                            }`}
                                                                        </p>

                                                                        <p>
                                                                            <span className="text-yellow-200">
                                                                                Expected
                                                                                Output:{' '}
                                                                            </span>
                                                                            <br />
                                                                            {`${
                                                                                testCase?.expectedOutput ||
                                                                                'No expected output'
                                                                            }`}
                                                                        </p>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                            </p>
                                            {!loading &&
                                                !codeError &&
                                                codeResult?.map(
                                                    (
                                                        testCase: any,
                                                        index: any
                                                    ) => (
                                                        <div
                                                            key={index}
                                                            className="shadow-sm rounded-lg p-4 my-4 bg-gray-800 border border-gray-700"
                                                        >
                                                            {testCase.status !==
                                                            'Accepted' ? (
                                                                <>
                                                                    <h2 className="text-xl font-semibold mb-2 text-gray-300">
                                                                        Test
                                                                        Case{' '}
                                                                        {index +
                                                                            1}
                                                                    </h2>

                                                                    <p className="text-gray-300 whitespace-normal break-words">
                                                                        <span className="text-yellow-200">
                                                                            Your
                                                                            Output:
                                                                        </span>
                                                                        {`${testCase?.stdOut || 'No output'}`}
                                                                    </p>

                                                                    <p>
                                                                        <span className="text-yellow-200">
                                                                            compileOutput:{' '}
                                                                        </span>
                                                                        {`${testCase?.compileOutput || 'No compile output'}`}
                                                                    </p>

                                                                    <p>
                                                                        <span className="text-yellow-200">
                                                                            Error:{' '}
                                                                        </span>
                                                                        {`${
                                                                            testCase?.stdErr ||
                                                                            'No error'
                                                                        }`}
                                                                    </p>

                                                                    <p>
                                                                        <span className="text-yellow-200">
                                                                            Input:{' '}
                                                                        </span>
                                                                        <br />
                                                                        {`${
                                                                            testCase?.stdIn ||
                                                                            'No input'
                                                                        }`}
                                                                    </p>

                                                                    <p>
                                                                        <span className="text-yellow-200">
                                                                            Expected
                                                                            Output:{' '}
                                                                        </span>
                                                                        <br />
                                                                        {`${
                                                                            testCase?.expectedOutput ||
                                                                            'No expected output'
                                                                        }`}
                                                                    </p>

                                                                    <p>
                                                                        {' '}
                                                                        <span className="text-yellow-200">
                                                                            {' '}
                                                                            Status:{' '}
                                                                        </span>
                                                                        <span
                                                                            className={`text-gray-300 ${
                                                                                testCase.status ===
                                                                                'Accepted'
                                                                                    ? 'text-green-500'
                                                                                    : 'text-red-500'
                                                                            }`}
                                                                        >
                                                                            {
                                                                                testCase.status
                                                                            }
                                                                        </span>
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                <p
                                                                    className={`text-gray-300 ${
                                                                        testCase.status ===
                                                                        'Accepted'
                                                                            ? 'text-green-500'
                                                                            : 'text-red-500'
                                                                    }`}
                                                                >
                                                                    Test Case{' '}
                                                                    {index + 1}{' '}
                                                                    status:{' '}
                                                                    {
                                                                        testCase.status
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                </ResizablePanelGroup>
            )}
        </div>
    );
};

export default CodeEditorComponent;
