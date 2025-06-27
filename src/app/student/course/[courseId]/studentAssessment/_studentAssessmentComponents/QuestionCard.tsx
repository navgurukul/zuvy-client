'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Code } from 'lucide-react';
import { api } from '@/utils/axios.config';

interface QuestionCardProps {
  id: number;
  title: string;
  description?: string;
  weightage?: number;
  easyCodingMark?: number;
  mediumCodingMark?: number;
  hardCodingMark?: number;
  assessmentSubmitId?: number;
  codingOutsourseId?: number;
  codingQuestions?: boolean;
  isQuizSubmitted?: boolean;
  onSolveChallenge: (id: number) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  id,
  title,
  description,
  weightage,
  easyCodingMark,
  mediumCodingMark,
  hardCodingMark,
  assessmentSubmitId,
  codingOutsourseId,
  codingQuestions = false,
  isQuizSubmitted = false,
  onSolveChallenge
}) => {
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Get marks based on difficulty
  const getMarks = (difficulty: string): number => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return easyCodingMark || 0;
      case 'medium':
        return mediumCodingMark || 0;
      case 'hard':
        return hardCodingMark || 0;
      default:
        return 0;
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check submission status for coding questions
  useEffect(() => {
    if (codingQuestions && assessmentSubmitId && codingOutsourseId) {
      checkSubmissionStatus();
    }
  }, [codingQuestions, assessmentSubmitId, codingOutsourseId]);

  const checkSubmissionStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `codingPlatform/submissions/questionId=${id}?assessmentSubmissionId=${assessmentSubmitId}&codingOutsourseId=${codingOutsourseId}`
      );
      setSubmissionStatus(response.data?.data?.action || null);
    } catch (error) {
      console.error('Error checking submission status:', error);
    } finally {
      setLoading(false);
    }
  };

  const isSubmitted = submissionStatus === 'submit' || isQuizSubmitted;
  const marks = codingQuestions ? getMarks(description || '') : weightage;

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {codingQuestions ? (
                <Code className="h-5 w-5 text-blue-600" />
              ) : (
                <Clock className="h-5 w-5 text-green-600" />
              )}
              <h3 className="text-lg font-semibold">{title}</h3>
              {isSubmitted && (
                <Badge className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              {description && (
                <Badge 
                  variant="outline" 
                  className={codingQuestions ? getDifficultyColor(description) : ''}
                >
                  {description}
                </Badge>
              )}
              {marks && (
                <span className="font-medium">
                  Marks: {marks}
                </span>
              )}
            </div>
          </div>

          <div className="ml-4">
            <Button
              onClick={() => onSolveChallenge(id)}
              disabled={loading || isSubmitted}
              variant={isSubmitted ? "outline" : "default"}
              size="sm"
            >
              {loading ? (
                'Checking...'
              ) : isSubmitted ? (
                'Completed'
              ) : (
                'Solve'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionCard; 