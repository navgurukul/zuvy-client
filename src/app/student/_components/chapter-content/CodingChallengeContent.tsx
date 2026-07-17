import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import CodingChallengeResult from './CodingChallengeResult';
import { getDifficultyColor } from '@/lib/utils';
import { CodingChallengeContentProps, CodingQuestions } from "@/app/student/_components/chapter-content/componentChapterType";
import { CodingContentChapterSkeleton } from "@/app/student/_components/Skeletons";
import { useQuizAndAssignmentWithStatus } from '@/hooks/useQuizAndAssignmentWithStatus';
import { useCodingSubmissionsByQuestion } from '@/hooks/useCodingSubmissionsByQuestion';


const CodingChallengeContent: React.FC<CodingChallengeContentProps> = ({ chapterDetails, onChapterComplete }) => {
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId;
  const [isCompleted, setIsCompleted] = useState(chapterDetails.status === 'Completed');

  const {
    codingProblems: codingQuestions,
    loading,
  } = useQuizAndAssignmentWithStatus({ chapterId: chapterDetails.id });

  // Fetch submission for each question only when chapter is completed
  // We use the first question's id as a representative fetch; for multi-question
  // chapters the component maps over codingQuestions and passes results down.
  const firstQuestionId = isCompleted && codingQuestions.length > 0
    ? codingQuestions[0].id
    : null;

  const { submissionData: firstSubmission } = useCodingSubmissionsByQuestion({
    questionId: firstQuestionId,
  });

  // Build submissionResults in the same shape CodingChallengeResult expects
  const submissionResults = firstSubmission
    ? [{ questionId: firstSubmission.questionId, result: firstSubmission }]
    : [];

  useEffect(() => {
    setIsCompleted(chapterDetails.status === 'Completed');
  }, [chapterDetails.status]);

  const handleSolveChallenge = (question: CodingQuestions) => {
    router.push(`/student/course/${params.courseId}/org/${orgId}/codingChallenge?questionId=${question.id}&chapterId=${chapterDetails.id}&moduleId=${params.moduleId}`);
  };

  const CodingQuestionCard = ({ question }: { question: CodingQuestions }) => (
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
   <ScrollArea 
  className="mb-6 max-h-[180px] md:max-h-[260px] rounded-md pr-2"
>
  <p className="text-muted-foreground max-h-[180px] md:max-h-[260px] text-left leading-relaxed">
    {question.description}
  </p>

  {/* ScrollBar for vertical scroll */}
  <ScrollBar orientation="vertical" />
</ScrollArea>


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
            Start Challenge
          </Button>
        )}
      </div>
    </div>
  );

  
  if (loading) {
    return <CodingContentChapterSkeleton/>;
  }


  if (isCompleted) {
      return <CodingChallengeResult chapterDetails={chapterDetails} submissionResults={submissionResults} />;
  }

  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-background via-card-light to-background py-8 px-2 sm:px-0">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className='flex justify-between items-center w-full' >
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 ml-6 text-left">{chapterDetails.title}</h1>
            {chapterDetails.description && (
              <p className="text-muted-foreground text-base mb-1 text-left">{chapterDetails.description}</p>
            )}
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