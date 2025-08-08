'use client'

import React from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import useChapterCompletion from '@/hooks/useChapterCompletion';
import { useCodingChallenge } from '@/hooks/useCodingChallenge';
import {
    QuestionPanel,
    CodeEditorPanel,
    OutputPanel,
    SubmissionModal,
    ConfirmationModal,
    HeaderBar
} from './components';
import{CodeEditorProps} from '@/app/student/course/[courseId]/codingChallenge/courseCodingType'

const CodeEditorComponent = ({ questionId, onChapterComplete }: CodeEditorProps) => {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const chapterId = searchParams.get('chapterId');
    const moduleId = searchParams.get('moduleId');

    // Chapter completion hook
    const { isCompleting, completeChapter } = useChapterCompletion({
        courseId: params.courseId as string,
        moduleId: moduleId as string,
        chapterId: chapterId?.toString() || '',
        onSuccess: () => {
            if (onChapterComplete) {
                onChapterComplete();
            }
        },
    });

    // Main coding challenge hook
    const { state, actions, constants } = useCodingChallenge({
        questionId,
        onChapterComplete: completeChapter,
    });

    const handleBack = () => {
        actions.closeSolutionModal();
        router.back();
    };

    const handleRunCode = () => {
        actions.submitCode('run');
    };

    const handleSubmitConfirm = () => {
        actions.submitCode('submit');
    };

    const onViewSolution = () => {
        actions.closeSolutionModal();
        router.push(`/student/course/${params.courseId}/codingChallengeResult?questionId=${questionId}&moduleId=${moduleId}&chapterId=${chapterId}`);
    };

    const onReturnToCourse = () => {
        actions.closeSolutionModal();
        router.push(`/student/course/${params.courseId}/modules/${moduleId}?chapterId=${chapterId}`);
    };

    if (!state.questionDetails) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-lg text-gray-500">Loading...</span>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/5 to-accent-light/10">
            <HeaderBar
                isAlreadySubmitted={state.isAlreadySubmitted}
                loading={state.loading}
                isSubmitting={state.isSubmitting}
                isCompleting={isCompleting}
                onBack={handleBack}
                onRunCode={handleRunCode}
                onOpenSubmitModal={actions.openConfirmModal}
            />

            <ConfirmationModal
                isOpen={state.showConfirmModal}
                onClose={actions.closeConfirmModal}
                onConfirm={handleSubmitConfirm}
                loading={state.loading}
            />

            <SubmissionModal
                isOpen={state.isSolutionModalOpen}
                onClose={actions.closeSolutionModal}
                modalType={state.modalType}
                questionTitle={state.questionDetails.title}
                codeResult={state.codeResult}
                onViewSolution={onViewSolution}
                onReturnToCourse={onReturnToCourse}
            />

            {/* Main Content Area */}
            <div className="w-full" style={{ height: 'calc(100vh - 80px)' }}>
                    <ResizablePanelGroup
                        direction="horizontal"
                        className="w-full h-full"
                    >
                        {/* Left Panel: Problem Description */}
                        <ResizablePanel defaultSize={50} minSize={25} maxSize={75}>
                        <QuestionPanel questionDetails={state.questionDetails} />
                        </ResizablePanel>

                        <ResizableHandle withHandle />

                        {/* Right Panel: Code Editor and Output */}
                        <ResizablePanel defaultSize={50}>
                            <ResizablePanelGroup direction="vertical">
                                {/* Code Editor Panel */}
                                <ResizablePanel defaultSize={65} minSize={30}>
                                <CodeEditorPanel
                                    currentCode={state.currentCode}
                                    language={state.language}
                                    isAlreadySubmitted={state.isAlreadySubmitted}
                                    editorLanguages={constants.editorLanguages}
                                    onCodeChange={actions.handleCodeChange}
                                    onLanguageChange={actions.handleLanguageChange}
                                />
                                </ResizablePanel>

                                <ResizableHandle withHandle />

                                {/* Output Panel */}
                                <ResizablePanel defaultSize={35} minSize={20}>
                                <OutputPanel
                                    loading={state.loading}
                                    codeError={state.codeError}
                                    codeResult={state.codeResult}
                                />
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ResizablePanel>
                    </ResizablePanelGroup>
            </div>
        </div>
    );
};

export default CodeEditorComponent;
