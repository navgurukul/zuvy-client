'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import useChapterCompletion from '@/app/student/hooks/useChapterCompletion';
import { useCodingChallenge } from '@/app/student/hooks/useCodingChallenge';
import useAllChaptersWithStatus from '@/hooks/useAllChaptersWithStatus';
import ZuvyRewardModal from '@/app/student/_components/reward/ZuvyRewardModal';
import {
    QuestionPanel,
    CodeEditorPanel,
    OutputPanel,
    SubmissionModal,
    ConfirmationModal,
    HeaderBar
} from './components';
import{CodeEditorProps} from '@/app/student/course/[courseId]/org/[orgId]/codingChallenge/courseCodingType'
import  {CodingChallengeSkeleton} from "@/app/student/_components/Skeletons";

const CodeEditorComponent = ({ questionId, onChapterComplete, }: CodeEditorProps) => {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const chapterId = searchParams.get('chapterId');
    const moduleId = searchParams.get('moduleId');
    const orgId = params.orgId;

    const { trackingData, isRefetching, refetch: refetchTrackingData } = useAllChaptersWithStatus(moduleId || '');
    const [isWaitingForReward, setIsWaitingForReward] = useState(false);

    const [rewardModalState, setRewardModalState] = useState<{
        isOpen: boolean;
        sparks: number;
        chapterTitle: string;
    }>({
        isOpen: false,
        sparks: 0,
        chapterTitle: '',
    });

    // Chapter completion hook
    const { isCompleting, completeChapter } = useChapterCompletion({
        courseId: params.courseId as string,
        moduleId: moduleId as string,
        chapterId: chapterId?.toString() || '',
        onSuccess: () => handleChapterCompletionSuccess(),
        // The editor manages its own reward modal via isWaitingForReward state.
        // Skipping chapterRewardManager prevents a duplicate reward on the module page.
        skipRewardManager: true,
    });

    // Main coding challenge hook
    const { state, actions, constants } = useCodingChallenge({
        questionId,
        onChapterComplete: completeChapter,
        orgId: orgId as string,
        chapterId,
    });

    const handleChapterCompletionSuccess = () => {
        setIsWaitingForReward(true);
        refetchTrackingData();
        if (onChapterComplete) {
            onChapterComplete();
        }
    };

    useEffect(() => {
        // Wait until refetch has completed (isRefetching goes false) before reading fresh sparks
        if (isWaitingForReward && !isRefetching && trackingData && trackingData.length > 0) {
            const currentChapter = trackingData.find(
                (c) => String(c.id) === String(chapterId)
            );
            const sparks = currentChapter?.sparks ?? 0;
            const title = currentChapter?.title || state.questionDetails?.title || 'Coding Challenge';

            setRewardModalState({
                isOpen: true,
                sparks,
                chapterTitle: title,
            });
            setIsWaitingForReward(false);
        }
    }, [isWaitingForReward, isRefetching, trackingData, chapterId, state.questionDetails?.title]);

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
        router.push(`/student/course/${params.courseId}/org/${orgId}/codingChallengeResult?questionId=${questionId}&moduleId=${moduleId}&chapterId=${chapterId}`);
    };

    const onReturnToCourse = () => {
        actions.closeSolutionModal();
        router.push(`/student/course/${params.courseId}/org/${orgId}/modules/${moduleId}?chapterId=${chapterId}`);
    };

    if (!state.questionDetails) {
         return <CodingChallengeSkeleton/>;
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

            <ZuvyRewardModal
                isOpen={rewardModalState.isOpen}
                totalSparks={rewardModalState.sparks}
                chapterTitle={rewardModalState.chapterTitle}
                onClose={() => setRewardModalState({ isOpen: false, sparks: 0, chapterTitle: '' })}
                onContinue={() => {
                    actions.openSolutionModal();
                }}
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
