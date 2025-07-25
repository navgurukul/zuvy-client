'use client';

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code2, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {CodingChallengeResultProps,CodingQuestion} from '@/app/student/_components/chapter-content/componentChapterStudentType';

const CodingChallengeResult: React.FC<CodingChallengeResultProps> = ({ chapterDetails, submissionResults }) => {
  const router = useRouter();
  const params = useParams();
  const handleViewSolution = (questionId: number) => {
    router.push(`/student/course/${params.courseId}/codingChallengeResult?questionId=${questionId}`);
  };

  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-background via-card-light to-background py-8 px-2 sm:px-0">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl ml-6 font-bold text-foreground mb-1">{chapterDetails.title}</h1>
            {chapterDetails.description && (
              <p className="text-muted-foreground text-base mb-1">{chapterDetails.description}</p>
            )}
          </div>
          <Badge
            variant="outline"
            className="text-sm px-4 py-2 shadow-2dp bg-success text-success-foreground border-success"
          >
            Completed
          </Badge>
        </div>

        {/* List of completed challenges */}
        <div className="space-y-4">
            {submissionResults && submissionResults.length > 0 ? (
                submissionResults.map(({ questionId, result }) => (
                    <div key={questionId} className="p-6 mb-6">
                        {/* Header Section */}
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 text-left capitalize pr-4 flex-1">
                                {result.questionDetail.title}
                            </h3>
                        </div>

                        {/* Metadata Section */}
                        <div className="flex flex-col gap-4 mb-4">
                            <div className='w-full flex flex-col'>
                                <span className="text-left font-medium text-muted-foreground">Difficulty</span>
                                <p className="text-sm font-semibold text-foreground text-left mt-1">{result.questionDetail.difficulty}</p>
                            </div>
                            <div className='w-full text-left'>
                                <span className="text-sm text-left font-medium text-muted-foreground">Status</span>
                                <div className="mt-1">
                                    <Badge
                                        variant="outline"
                                        className={cn('flex items-center gap-1.5 w-fit', {
                                            'border-success/50 bg-success/10 text-success-dark': result.status === 'Accepted',
                                            'border-destructive/50 bg-destructive/10 text-destructive-dark': result.status === 'Wrong Answer' || result.status !== 'Accepted',
                                        })}
                                    >
                                        {result.status === 'Accepted' ? 
                                            <CheckCircle2 className="w-3.5 h-3.5" /> : 
                                            <AlertCircle className="w-3.5 h-3.5" />
                                        }
                                        <span>{result.status}</span>
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-muted-foreground mb-6 text-left leading-relaxed">
                            {result.questionDetail.description}
                        </p>

                        {/* Action Button */}
                        <div className="flex justify-center">
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-medium text-sm"
                                onClick={() => handleViewSolution(questionId)}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View Solution
                            </Button>
                        </div>
                    </div>
                ))
            ) : (
                 <div className="bg-card-elevated rounded-xl shadow-8dp border border-border p-8 text-center">
                    <Code2 className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
                    <h3 className="text-xl font-semibold">Submissions Processed</h3>
                    <p className="text-muted-foreground">The results for this chapter are ready, but no specific submission details were found.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
export default CodingChallengeResult;