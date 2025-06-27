import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CodingProblemPage from "../CodingProblemPage";

interface CodingChallengeContentProps {
  chapterDetails: {
    id: number;
    title: string;
    description: string | null;
    status: string;
    codingQuestions: any | null;
  };
}

const CodingChallengeContent: React.FC<CodingChallengeContentProps> = ({ chapterDetails }) => {
  const [showCodingProblem, setShowCodingProblem] = useState(false);
  const isCompleted = chapterDetails.status === 'Completed';

  if (showCodingProblem) {
    return (
      <CodingProblemPage
        problem={{
          title: chapterDetails.title,
          difficulty: 'Medium',
          topic: 'Arrays',
          status: chapterDetails.status
        }}
        onClose={() => setShowCodingProblem(false)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-heading font-bold">{chapterDetails.title}</h1>
        <Badge variant="outline" className={isCompleted ? "text-success border-success" : "text-muted-foreground"}>
          {isCompleted ? 'Attempted' : 'Not Attempted'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Difficulty</p>
          <p className="font-medium">Medium</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Topic</p>
          <p className="font-medium">Arrays</p>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-8">
        {chapterDetails.description || 'Practice your coding skills with this interactive programming challenge.'}
      </p>
      
      <div className="text-center">
        <Button onClick={() => setShowCodingProblem(true)}>
          {isCompleted ? 'View Submission' : 'Start Practice'}
        </Button>
      </div>
    </div>
  );
};

export default CodingChallengeContent; 