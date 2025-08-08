'use client';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import CodingChallenge from "./CodingChallenge";
import MCQQuiz from "./MCQQuiz";
import OpenEndedQuestions from "./OpenEndedQuestions";
import ViolationModal from "./ViolationModal";

import{AssessmentInstructionsProps,ViolationType} from '@/app/student/_components/componentStudentType'

const AssessmentInstructions = ({ assessmentTitle, duration, onClose }: AssessmentInstructionsProps) => {
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours in seconds
  const [currentView, setCurrentView] = useState<'instructions' | 'coding' | 'mcq' | 'openended'>('instructions');
  const [selectedChallengeIndex, setSelectedChallengeIndex] = useState(0);
  const [selectedQuizIndex, setSelectedQuizIndex] = useState(0);
  const [violations, setViolations] = useState<ViolationType[]>([]);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [currentViolation, setCurrentViolation] = useState<ViolationType | null>(null);
  const [completedSections, setCompletedSections] = useState({
    coding: false,
    mcq: false,
    openended: false
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && currentView !== 'instructions') {
        handleViolation('tab-switch');
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && currentView !== 'instructions') {
        handleViolation('fullscreen-exit');
      }
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      if (e.type === 'paste' && currentView !== 'instructions') {
        e.preventDefault();
        handleViolation('copy-paste');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('paste', handleCopyPaste);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('paste', handleCopyPaste);
    };
  }, [currentView]);

  const handleViolation = (type: ViolationType['type']) => {
    const existingViolation = violations.find(v => v.type === type);
    let updatedViolations;
    
    if (existingViolation) {
      updatedViolations = violations.map(v => 
        v.type === type ? { ...v, count: v.count + 1 } : v
      );
    } else {
      updatedViolations = [...violations, { type, count: 1 }];
    }
    
    setViolations(updatedViolations);
    
    const totalViolations = updatedViolations.reduce((sum, v) => sum + v.count, 0);
    const currentTypeViolation = updatedViolations.find(v => v.type === type);
    
    if (totalViolations >= 3) {
      handleAutoSubmit();
    } else {
      setCurrentViolation(currentTypeViolation!);
      setShowViolationModal(true);
    }
  };

  const handleAutoSubmit = () => {
    onClose();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const codingChallenges = [
    { title: "Array Manipulation", difficulty: "Easy", marks: 10 },
    { title: "String Processing", difficulty: "Medium", marks: 15 },
    { title: "Algorithm Optimization", difficulty: "Hard", marks: 20 }
  ];

  const mcqQuizzes = [
    { title: "JavaScript Fundamentals", difficulty: "Easy", marks: 10 },
    { title: "DOM Manipulation", difficulty: "Medium", marks: 15 }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-success-light text-success';
      case 'Medium': return 'bg-warning-light text-black';
      case 'Hard': return 'bg-destructive-light text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const canSubmitAssessment = completedSections.coding && completedSections.mcq && completedSections.openended;

  if (currentView === 'coding') {
    return (
      <CodingChallenge
        challenge={codingChallenges[selectedChallengeIndex]}
        onBack={() => setCurrentView('instructions')}
        onComplete={() => {
          setCompletedSections(prev => ({ ...prev, coding: true }));
          setCurrentView('instructions');
        }}
        timeLeft={formatTime(timeLeft)}
      />
    );
  }

  if (currentView === 'mcq') {
    return (
      <MCQQuiz
        quiz={mcqQuizzes[selectedQuizIndex]}
        onBack={() => setCurrentView('instructions')}
        onComplete={() => {
          setCompletedSections(prev => ({ ...prev, mcq: true }));
          setCurrentView('instructions');
        }}
        timeLeft={formatTime(timeLeft)}
      />
    );
  }

  if (currentView === 'openended') {
    return (
      <OpenEndedQuestions
        onBack={() => setCurrentView('instructions')}
        onComplete={() => {
          setCompletedSections(prev => ({ ...prev, openended: true }));
          setCurrentView('instructions');
        }}
        timeLeft={formatTime(timeLeft)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ViolationModal
        isOpen={showViolationModal}
        onClose={() => setShowViolationModal(false)}
        violation={currentViolation}
      />
      
      <header className="w-full flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
        <div className="font-mono text-lg font-semibold">
          {formatTime(timeLeft)}
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-8">
        <div className="text-left mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">{assessmentTitle}</h1>
          <p className="text-muted-foreground">
            Complete all sections to submit your assessment. Read the instructions carefully before proceeding.
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-heading font-semibold">Proctoring Rules</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• No copy-pasting is allowed during the assessment</li>
              <li>• Tab switching or window switching is not permitted</li>
              <li>• Assessment screen exit will result in violations</li>
              <li>• Maximum 3 violations are allowed before auto-submission</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold">Coding Challenges</h2>
            {codingChallenges.map((challenge, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">{challenge.title}</h3>
                    <div className="flex gap-2">
                      <Badge className={getDifficultyColor(challenge.difficulty)}>
                        {challenge.difficulty}
                      </Badge>
                      <Badge variant="outline">{challenge.marks} marks</Badge>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      variant="link" 
                      className="text-primary  p-0 h-auto"
                      onClick={() => {
                        setSelectedChallengeIndex(index);
                        setCurrentView('coding');
                      }}
                    >
                      {completedSections.coding ? 'View Solution' : 'Solve Challenge'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold">MCQ Quizzes</h2>
            {mcqQuizzes.map((quiz, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">{quiz.title}</h3>
                    <div className="flex gap-2">
                      <Badge className={getDifficultyColor(quiz.difficulty)}>
                        {quiz.difficulty}
                      </Badge>
                      <Badge variant="outline">{quiz.marks} marks</Badge>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      variant="link" 
                      className="text-primary p-0 h-auto"
                      onClick={() => {
                        setSelectedQuizIndex(index);
                        setCurrentView('mcq');
                      }}
                    >
                      {completedSections.mcq ? 'View Answers' : 'Attempt Quiz'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold">Open Ended Questions</h2>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Programming Concepts</h3>
                  <Badge variant="outline">2 questions</Badge>
                </div>
                <div className="flex justify-end">
                  <Button 
                    variant="link" 
                    className="text-primary p-0 h-auto"
                    onClick={() => setCurrentView('openended')}
                  >
                    {completedSections.openended ? 'View Answers' : 'Attempt Questions'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center pt-8">
            <Button 
              size="lg" 
              disabled={!canSubmitAssessment}
              onClick={onClose}
            >
              Submit Assessment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentInstructions;