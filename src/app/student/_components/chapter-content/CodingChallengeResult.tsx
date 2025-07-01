'use client';

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code2, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

// Simplified interfaces for clarity
interface QuestionDetail {
    title: string;
    description: string;
    difficulty: string;
}

interface SubmissionResult {
    questionId: number;
    result: {
        status: string; // The submission status, e.g., "Accepted"
        questionDetail: QuestionDetail;
    };
}

interface CodingChallengeResultProps {
  chapterDetails: {
    id: number;
    title: string;
    description: string | null;
  };
  submissionResults: SubmissionResult[];
}

const CodingChallengeResult: React.FC<CodingChallengeResultProps> = ({ chapterDetails, submissionResults }) => {
  const router = useRouter();
  const params = useParams();
console.log(submissionResults)
  const handleViewSolution = (questionId: number) => {
    router.push(`/student/course/${params.courseId}/codingChallengeResult?questionId=${questionId}`);
  };

  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-background via-card-light to-background py-8 px-2 sm:px-0">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{chapterDetails.title}</h1>
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
                    <div key={questionId} className="bg-card-elevated rounded-xl shadow-8dp border border-border p-6 flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <h3 className="font-bold text-lg sm:text-xl text-foreground">{result.questionDetail.title}</h3>
                            <Badge variant="outline" className="text-xs px-2 py-1 bg-primary-light text-primary border-primary/50 whitespace-nowrap">
                                {result.questionDetail.difficulty}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{result.questionDetail.description}</p>
                        <div className="flex items-center justify-between mt-2">
                            <Badge
                                variant="outline"
                                className={cn('flex items-center gap-1.5', {
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
                            <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
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