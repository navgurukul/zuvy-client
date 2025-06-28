import React, { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useParams } from 'next/navigation';
import useAssignmentDetails from '@/hooks/useAssignmentDetails';
import useChapterCompletion from '@/hooks/useChapterCompletion';
import { api } from '@/utils/axios.config';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import parse from 'html-react-parser';
import { RemirrorForm } from '@/components/remirror-editor/RemirrorForm';

interface QuizContentProps {
  chapterDetails: {
    id: number;
    title: string;
    description: string | null;
    status: string;
  };
  onChapterComplete: () => void;
}

const QuizContent: React.FC<QuizContentProps> = ({ chapterDetails, onChapterComplete }) => {
  const { courseId, moduleId } = useParams();
  const { assignmentData, loading, error, refetch: refetchAssignmentDetails } = useAssignmentDetails(chapterDetails.id.toString());
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localIsCompleted, setLocalIsCompleted] = useState(false);

  const { isCompleting, completeChapter } = useChapterCompletion({
    courseId: courseId as string,
    moduleId: moduleId as string,
    chapterId: chapterDetails.id.toString(),
    onSuccess: () => {
      setLocalIsCompleted(true);
      onChapterComplete();
    },
  });

  // Update local state when assignment data changes
  useEffect(() => {
    if (assignmentData) {
      setLocalIsCompleted(assignmentData.status === 'Completed');
    }
  }, [assignmentData]);

  // Get quiz data from assignmentData
  const quizQuestions = assignmentData?.quizDetails || [];
  const isCompleted = localIsCompleted || assignmentData?.status === 'Completed';

  // Handle answer selection
  const handleSelect = (questionId: number, optionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  // Submit quiz answers
  const handleQuizSubmit = async () => {
    if (!quizQuestions.length) return;
    setIsSubmitting(true);
    const mappedAnswers = Object.entries(selectedAnswers).map(
      ([mcqId, chosenOption]) => ({
        mcqId: Number(mcqId),
        chossenOption: Number(chosenOption),
      })
    );
    if (mappedAnswers.length === 0) {
      toast({
        title: 'Cannot Submit',
        description: 'Select at least one question',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }
    try {
      await api.post(
        `/tracking/updateQuizAndAssignmentStatus/${courseId}/${moduleId}?chapterId=${chapterDetails.id}`,
        { submitQuiz: mappedAnswers }
      );
      await completeChapter();
      refetchAssignmentDetails();
      toast({
        title: 'Success',
        description: 'Submitted Quiz Successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to submit quiz.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to get option styling based on completion status
  const getOptionStyling = (question: any, optionId: string) => {
    if (!isCompleted) {
      // For incomplete quiz, show normal styling
      return {
        textColor: "text-gray-900"
      };
    }
    
    const quizTrack = question.quizTrackingData?.[0];
    const isAttempted = !!quizTrack;
    const isSelected = isAttempted ? quizTrack.chosenOption === parseInt(optionId) : false;
    const isCorrect = question.correctOption === parseInt(optionId);
    
    if (isCorrect && isSelected) {
      // Correct answer that was selected - green
      return {
        textColor: "text-green-700 font-semibold"
      };
    } else if (isCorrect && !isSelected) {
      // Correct answer that wasn't selected - green
      return {
        textColor: "text-green-600 font-medium"
      };
    } else if (!isCorrect && isSelected) {
      // Wrong answer that was selected - red
      return {
        textColor: "text-red-600 font-semibold"
      };
    }
    
    // Other options - default
    return {
      textColor: "text-gray-700"
    };
  };

  // Function to get question status
  const getQuestionStatus = (question: any) => {
    if (!isCompleted) return null;
    
    const quizTrack = question.quizTrackingData?.[0];
    const isAttempted = !!quizTrack;
    
    if (!isAttempted) {
      return {
        text: "Not attempted",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200"
      };
    }
    
    const isCorrect = quizTrack.chosenOption === question.correctOption;
    
    if (isCorrect) {
      return {
        text: "Correct",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      };
    } else {
      return {
        text: "Incorrect",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200"
      };
    }
  };

  if (loading) {
    return (
      <div className="h-full p-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <div className="space-y-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-left">{chapterDetails.title}</h1>
        <Badge 
          variant="outline" 
          className={`px-3 py-1 text-sm font-medium ${
            isCompleted 
              ? "bg-green-50 text-green-700 border-green-200" 
              : "bg-gray-50 text-gray-600 border-gray-200"
          }`}
        >
          {isCompleted ? 'Completed' : 'Not Completed'}
        </Badge>
      </div>
      
      {chapterDetails.description && (
        <p className="text-muted-foreground mb-6 text-left">{chapterDetails.description}</p>
      )}
      
      {quizQuestions.length === 0 ? (
        <div className="text-left text-muted-foreground py-12">
          No quiz questions have been added by the instructor.
        </div>
      ) : (
        <div className="space-y-8">
          {quizQuestions.map((q: any, index: number) => {
            const questionStatus = getQuestionStatus(q);
            const quizTrack = q.quizTrackingData?.[0];
            const isAttempted = !!quizTrack;
            
            return (
              <div key={q.id} className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex text-left space-x-2 items-start flex-1">
                    <h6 className="text-left font-semibold">{`Q${index + 1}.`}</h6>
                    <div className="flex-1 text-left">
                      <RemirrorForm
                        description={q.question}
                        preview={true}
                        bigScreen={true}
                      />
                    </div>
                  </div>
                  {questionStatus && (
                    <Badge 
                      variant="outline" 
                      className={`ml-4 px-2 py-1 text-xs font-medium ${questionStatus.bgColor} ${questionStatus.color} ${questionStatus.borderColor}`}
                    >
                      {questionStatus.text}
                    </Badge>
                  )}
                </div>
                
                <div className="flex text-left space-x-2 items-start">
                  <div className="w-6"></div> {/* Spacer to align with question */}
                  <div className="flex-1">
                    <RadioGroup
                      value={
                        isCompleted && isAttempted 
                          ? quizTrack.chosenOption.toString() 
                          : selectedAnswers[q.id] ?? ''
                      }
                      onValueChange={(value) => handleSelect(q.id, value)}
                      disabled={isCompleted || isSubmitting || isCompleting}
                      className="space-y-2"
                    >
                      {Object.entries(q.options).map(([optionId, optionText]) => {
                        const styling = getOptionStyling(q, optionId);
                        const isSelected = isCompleted && isAttempted 
                          ? quizTrack.chosenOption === parseInt(optionId)
                          : selectedAnswers[q.id] === optionId;
                        const isCorrect = isCompleted && q.correctOption === parseInt(optionId);
                        
                        return (
                          <div 
                            key={optionId} 
                            className={`flex items-start space-x-2 ${
                              isCompleted ? 'cursor-default' : 'cursor-pointer'
                            }`}
                          >
                            <RadioGroupItem 
                              value={optionId} 
                              id={`q${index}_option${optionId}`}
                              className={`mt-0.5 ${
                                isCorrect ? 'border-green-500 text-green-500' : ''
                              } ${
                                !isCorrect && isSelected && isCompleted ? 'border-red-500 text-red-500' : ''
                              }`}
                            />
                            <Label 
                              htmlFor={`q${index}_option${optionId}`} 
                              className={`flex-1 text-left text-sm leading-5 ${
                                isCompleted ? 'cursor-default' : 'cursor-pointer'
                              } ${styling.textColor}`}
                            >
                              {optionText as string}
                              {isCompleted && isCorrect && (
                                <span className="ml-2 text-green-600 font-bold">✓ Correct Answer</span>
                              )}
                              {isCompleted && !isCorrect && isSelected && (
                                <span className="ml-2 text-red-600 font-bold">✗ Your Choice</span>
                              )}
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {!isCompleted && (
        <div className="flex justify-center mt-8">
          <Button 
            onClick={handleQuizSubmit}
            disabled={
              isSubmitting || isCompleting ||
              quizQuestions.length === 0 ||
              Object.keys(selectedAnswers).length === 0
            }
            className="px-8 py-2 text-left"
          >
            {isSubmitting || isCompleting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuizContent; 