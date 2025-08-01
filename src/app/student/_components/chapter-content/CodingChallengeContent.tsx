import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from '@/utils/axios.config';
import { toast } from '@/components/ui/use-toast';
import { Play, Code2, Sparkles, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import CodingChallengeResult from './CodingChallengeResult';
import { getDifficultyColor } from '@/lib/utils';

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
    router.push(`/student/course/${params.courseId}/codingChallenge?questionId=${question.id}&chapterId=${chapterDetails.id}&moduleId=${params.moduleId}`);
  };

  const CodingQuestionCard = ({ question }: { question: CodingQuestion }) => (
    <div className=" p-6 mb-6">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 text-left capitalize pr-4 dark:text-white flex-1">
          {question.title}
        </h3>
        {/* <Badge 
          variant="outline" 
          className={`${
            question.status === 'Completed' 
              ? 'bg-green-100 text-green-800 border-green-300' 
              : 'bg-gray-100 text-gray-600 border-gray-300'
          } px-3 py-1 text-sm font-medium`}
        >
          {question.status === 'Completed' ? 'Solved' : 'Not Attempted'}
        </Badge> */}
      </div>

      {/* Metadata Section */}
      <div className="flex flex-col gap-4 mb-4">
        <div className='w-full flex items-center gap-2' >
          <span className="text-left font-medium text-muted-foreground">Difficulty -</span>
          <p className={`text-sm font-semibold rounded-md p-1 text-left mt-1 ${getDifficultyColor(question.difficulty)}`}>{question.difficulty}</p>
        </div>
        {question.tagName && (
          <div>
            <span className="text-sm font-medium text-muted-foreground">Topic</span>
            <p className="text-sm font-semibold text-foreground text-left mt-1">{question.tagName}</p>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-muted-foreground mb-6 text-left leading-relaxed">
        {question.description}
      </p>

      {/* Action Button */}
      <div className="flex justify-center">
        {question.status === 'Completed' ? (
          <Button
            onClick={() => handleSolveChallenge(question)}
            className="bg-blue-600 font-semibold hover:bg-blue-700 text-white px-6 py-2  text-sm"
          >
            View Solution
          </Button>
        ) : (
          <Button
            onClick={() => handleSolveChallenge(question)}
            className="bg-blue-600 font-semibold hover:bg-blue-700 text-white px-6 py-2  text-sm"
          >
            Start Practice
          </Button>
        )}
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 ml-6 text-left">{chapterDetails.title}</h1>
            {chapterDetails.description && (
              <p className="text-muted-foreground text-base mb-1 text-left">{chapterDetails.description}</p>
            )}
          </div>
          <Badge
            variant="outline"
            className={`text-xs font-medium px-3 py-1 ${
              isCompleted ? 'bg-green-100 dark:text-black text-green-600 hover:bg-green-100' :
              'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {isCompleted ? 'Attempted' : 'Not Submitted'}
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
            <p className="text-lg font-semibold text-muted-foreground text-center">No Coding Challenges Added Yet</p>
            <p className="text-sm text-muted-foreground text-center">Check back later for new problems from your instructor.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingChallengeContent; 