'use client';

import { toast } from '@/components/ui/use-toast';
import { cn, difficultyColor } from '@/lib/utils';
import { useLazyLoadedStudentData } from '@/store/store';
import { api } from '@/utils/axios.config';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const ViewAssessmentResults = ({ params }: { params: any }) => {
    // State Variables
    const [viewResultsData, setViewResultsData] = useState<any>();
    const [timeTaken, setTimeTaken] = useState<string | null>(null);
    const [assessmentOutsourseId, setAssessmentOutsourseId] = useState<number | null>(null);
    const [showErrorMessage, setShowErrorMessage] = useState<string | null>(null);
    const { studentData } = useLazyLoadedStudentData();
    const router = useRouter();

    // Fetch Results
    const getResults = async () => {
        try {
            const { data } = await api.get(`tracking/assessment/submissionId=${params.submissionId}`);

            // Calculate Time Taken
            const startedAt = new Date(data.startedAt);
            const submitedAt = new Date(data.submitedAt);
            const timeTakenMs = submitedAt.getTime() - startedAt.getTime();

            const timeTakenFormatted = formatTime(timeTakenMs);
            setTimeTaken(timeTakenFormatted);

            setViewResultsData(data);
            setAssessmentOutsourseId(data.assessmentOutsourseId);
        } catch (error: any) {
            setShowErrorMessage(error?.response?.data?.message || 'An error occurred while fetching results.');
        }
    };

    const formatTime = (milliseconds: number): string => {
        const seconds = Math.floor((milliseconds / 1000) % 60);
        const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
        const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);

        return hours > 0
            ? `Time taken: ${hours} hours, ${minutes} minutes, and ${seconds} seconds.`
            : `Time taken: ${minutes} minutes and ${seconds} seconds.`;
    };

    // Navigation Handlers
    const navigateTo = (path: string) => router.push(path);

    const viewCodingSubmission = (codingOutsourseId: number, questionId: number) => {
        if (codingOutsourseId) {
            navigateTo(
                `/student/courses/${params.viewcourses}/modules/${params.moduleID}/assessment/codingresults/${codingOutsourseId}/show/${params.submissionId}/question/${questionId}`
            );
        } else {
            toast({
                title: 'Error',
                description: 'No Coding Submission Found',
                className: 'text-start capitalize border border-destructive',
            });
        }
    };

    useEffect(() => {
        getResults();
    }, [params.submissionId]);

    if (!viewResultsData) {
        return (
            <div>
                <div onClick={() => router.back()} className="cursor-pointer flex justify-start">
                    <ChevronLeft width={24} /> Back
                </div>
                {showErrorMessage}
            </div>
        );
    }

    // Render Helpers
    const renderCodingChallenges = () => {
        if (
            viewResultsData.submitedOutsourseAssessment.easyCodingQuestions ||
            viewResultsData.submitedOutsourseAssessment.mediumCodingQuestions ||
            viewResultsData.submitedOutsourseAssessment.hardCodingQuestions
        ) {
            return (
                <>
                    <SectionHeading title="Coding Challenges" />
                    {viewResultsData.PracticeCode.map((codingQuestion: any) => (
                        <div key={codingQuestion.id} className="container mx-auto rounded-xl shadow-lg overflow-hidden max-w-2xl min-h-52 mt-4 py-5">
                            <div className="flex justify-between">
                                <div className="font-bold text-xl my-2">{codingQuestion.questionDetail.title}</div>
                                <div
                                    className={cn(
                                        'font-semibold text-secondary my-2',
                                        difficultyColor(codingQuestion.questionDetail.difficulty)
                                    )}
                                >
                                    {codingQuestion.questionDetail.difficulty}
                                </div>
                            </div>
                            <div className="text-xl mt-2 text-start">
                                Description: {codingQuestion.questionDetail.description}
                            </div>
                            <div className="text-xl mt-2 text-start">
                                Status:{' '}
                                <span
                                    className={`ml-2 ${
                                        codingQuestion.status === 'Accepted' ? 'text-green-400' : 'text-destructive'
                                    }`}
                                >
                                    {codingQuestion.status}
                                </span>
                            </div>
                            <div
                                onClick={() =>
                                    viewCodingSubmission(codingQuestion.codingOutsourseId, codingQuestion.questionId)
                                }
                                className="cursor-pointer mt-4 flex justify-end text-secondary font-bold"
                            >
                                View Submission <ChevronRight />
                            </div>
                        </div>
                    ))}
                </>
            );
        }
        return null;
    };

    const renderQuizQuestions = () => {
        const { easyMcqQuestions, mediumMcqQuestions, hardMcqQuestions } =
            viewResultsData.submitedOutsourseAssessment;

        const totalMcqQuestions = easyMcqQuestions + mediumMcqQuestions + hardMcqQuestions;

        if (totalMcqQuestions > 0) {
            return (
                <>
                    <SectionHeading title="MCQs" />
                    <div className="container mx-auto bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl h-36">
                        <div className="flex justify-between">
                            <div className="font-bold text-xl mb-2">Quiz Questions</div>
                            <div className="p-2 text-base rounded-full bg-[#FFC374]">{totalMcqQuestions} questions</div>
                        </div>
                        <div className="text-xl mt-2 text-start">
                            Attempted {viewResultsData.attemptedMCQQuestions}/{totalMcqQuestions}
                        </div>
                        <div
                            onClick={() =>
                                navigateTo(
                                    `/student/courses/${params.viewcourses}/modules/${params.moduleID}/assessment/${assessmentOutsourseId}/quizresults`
                                )
                            }
                            className="cursor-pointer mt-4 flex justify-end text-secondary font-bold"
                        >
                            View Submission <ChevronRight />
                        </div>
                    </div>
                </>
            );
        }
        return null;
    };

    const renderOpenEndedQuestions = () => {
        const openEndedCount = viewResultsData.openEndedQuestionCount;

        if (openEndedCount > 0) {
            return (
                <>
                    <SectionHeading title="Open-Ended Questions" />
                    <div className="container mx-auto bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl h-36">
                        <div className="flex justify-between">
                            <div className="font-bold text-xl mb-2">Open-Ended Questions</div>
                            <div className="p-2 text-base rounded-full bg-[#FFC374]">{openEndedCount} questions</div>
                        </div>
                        <div className="text-xl mt-2 text-start">
                            Attempted {viewResultsData.attemptedOpenEndedQuestions}/{openEndedCount}
                        </div>
                        <div
                            onClick={() =>
                                navigateTo(
                                    `/student/courses/${params.viewcourses}/modules/${params.moduleID}/assessment/${assessmentOutsourseId}/openendedresults`
                                )
                            }
                            className="cursor-pointer mt-4 flex justify-end text-secondary font-bold"
                        >
                            View Submission <ChevronRight />
                        </div>
                    </div>
                </>
            );
        }
        return null;
    };

    return (
        <React.Fragment>
            <div onClick={() => router.back()} className="cursor-pointer flex justify-start">
                <ChevronLeft width={24} />
                Back
            </div>
            <div className="headings mx-auto my-5 max-w-2xl">
                <div>{timeTaken}</div>
            </div>
            {renderCodingChallenges()}
            {renderQuizQuestions()}
            {renderOpenEndedQuestions()}
        </React.Fragment>
    );
};

// Section Heading Component
const SectionHeading = ({ title }: { title: string }) => (
    <div className="headings mx-auto my-10 max-w-2xl">
        <h1 className="text-start text-xl">{title}</h1>
    </div>
);

export default ViewAssessmentResults;
