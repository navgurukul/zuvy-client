import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from '@/utils/axios.config';
import { toast } from '@/components/ui/use-toast';
import { Play, Code2, Sparkles, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import CodingChallengeResult from './CodingChallengeResult';

interface CodingQuestion {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  tagName?: string;
  status: string;
}

interface CodingChallengeContentProps {
  chapterDetails: {
    id: number;
    title: string;
    description: string | null;
    status: string;
  };
  onChapterComplete: () => void;
  fetchChapters?: () => void;
}

const CodingChallengeContent: React.FC<CodingChallengeContentProps> = ({ chapterDetails, onChapterComplete }) => {
  const router = useRouter();
  const params = useParams();
  const [codingQuestions, setCodingQuestions] = useState<CodingQuestion[]>([]);
  const [submissionResults, setSubmissionResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(chapterDetails.status === 'Completed');

  const fetchCodingQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tracking/getQuizAndAssignmentWithStatus?chapterId=${chapterDetails.id}`);
      const questions = res.data.data?.codingProblem || [];
      setCodingQuestions(questions);

      if (chapterDetails.status === 'Completed' && questions.length > 0) {
        // Fetch submission results for each question
        const resultsPromises = questions.map((q: CodingQuestion) =>
          api.get(`/codingPlatform/submissions/questionId=${q.id}`).catch(err => {
            console.error(`Failed to fetch submission for question ${q.id}`, err);
            return null; // Return null on error to not break Promise.all
          })
        );
        const resultsResponses = await Promise.all(resultsPromises);
        const successfulResults = resultsResponses
          .filter(res => res && res.data.isSuccess)
          .map(res => ({
              questionId: res.data.data.questionId,
              result: res.data.data,
          }));
        setSubmissionResults(successfulResults);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch coding questions.',
        variant: 'destructive',
      });
      setCodingQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [chapterDetails.id, chapterDetails.status]);

  useEffect(() => {
    fetchCodingQuestions();
  }, [fetchCodingQuestions]);

  useEffect(() => {
    setIsCompleted(chapterDetails.status === 'Completed');
  }, [chapterDetails.status]);

  const handleSolveChallenge = (question: CodingQuestion) => {
    router.push(`/student/course/${params.courseId}/codingChallenge?questionId=${question.id}`);
  };

  const CodingQuestionCard = ({ question }: { question: CodingQuestion }) => (
      <div className="mb-6 bg-card-elevated rounded-xl shadow-8dp border border-border p-6 flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="font-bold text-lg sm:text-xl text-foreground truncate">{question.title}</div>
              <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-1 rounded bg-primary-light text-primary font-semibold uppercase">{question.difficulty}</span>
                  {question.tagName && (
                      <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">{question.tagName}</span>
                  )}
              </div>
          </div>
          <div className="text-sm text-left text-muted-foreground truncate">{question.description}</div>
          <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={question.status === 'Completed' ? 'text-success border-success' : 'text-warning border-warning'}>
                  {question.status === 'Completed' ? 'Solved' : 'Pending'}
              </Badge>
              <Button
                  size="sm"
                  className="ml-auto bg-primary hover:bg-primary-dark text-primary-foreground shadow-hover"
                  onClick={() => handleSolveChallenge(question)}
              >
                  {question.status === 'Completed' ? 'View Solution' : 'Solve Challenge'}
              </Button>
          </div>
      </div>
  );
  
  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center py-16 h-full">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground text-lg">Loading Challenge...</p>
          </div>
      );
  }

  if (isCompleted) {
      return <CodingChallengeResult chapterDetails={chapterDetails} submissionResults={submissionResults} />;
  }

  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-background via-card-light to-background py-8 px-2 sm:px-0">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{chapterDetails.title}</h1>
            {chapterDetails.description && (
              <p className="text-muted-foreground text-base mb-1">{chapterDetails.description}</p>
            )}
          </div>
          <Badge
            variant="outline"
            className={`text-sm px-4 py-2 shadow-2dp ${
              isCompleted ? 'bg-success text-success-foreground border-success' :
              'bg-warning-light text-warning-foreground border-warning'
            }`}
          >
            {isCompleted ? 'Attempted' : 'Not Attempted'}
          </Badge>
        </div>

        {codingQuestions.length > 0 ? (
          <div>
            {codingQuestions.map((q) => (
              <CodingQuestionCard key={q.id} question={q} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <Code2 className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">No Coding Challenges Added Yet</p>
            <p className="text-sm text-muted-foreground">Check back later for new problems from your instructor.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingChallengeContent; 