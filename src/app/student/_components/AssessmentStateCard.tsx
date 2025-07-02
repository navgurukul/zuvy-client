'use client';
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, AlertCircle, RotateCcw } from "lucide-react";

interface AssessmentStateCardProps {
  state: 'scheduled' | 'open' | 'interrupted' | 'reAttemptRequested' | 'completed' | 'expired';
  countdown?: number;
  endDate: Date;
  score?: number;
  totalMarks: number;
  passScore: number;
  onReAttemptRequest: () => void;
  onBeginAssessment: () => void;
}

const AssessmentStateCard = ({ 
  state, 
  countdown, 
  endDate, 
  score, 
  totalMarks, 
  passScore,
  onReAttemptRequest, 
  onBeginAssessment 
}: AssessmentStateCardProps) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (state === 'open') {
      const updateTimeLeft = () => {
        const now = new Date();
        const timeDiff = endDate.getTime() - now.getTime();
        
        if (timeDiff <= 0) {
          setTimeLeft("Expired");
          return;
        }
        
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
          setTimeLeft(`${days} day${days > 1 ? 's' : ''} left`);
        } else if (hours > 0) {
          setTimeLeft(`${hours} hour${hours > 1 ? 's' : ''} left`);
        } else {
          setTimeLeft(`${minutes} minute${minutes > 1 ? 's' : ''} left`);
        }
      };

      updateTimeLeft();
      const timer = setInterval(updateTimeLeft, 60000);
      return () => clearInterval(timer);
    }
  }, [state, endDate]);

  const renderStateContent = () => {
    switch (state) {
      case 'scheduled':
        return (
          <div className="text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 text-info" />
            <h3 className="text-lg font-semibold mb-2">Assessment Scheduled</h3>
            {countdown !== undefined && (
              <Card className="bg-info-light border-info inline-block mb-4">
                <CardContent className="p-4">
                  <p className="text-info font-semibold">
                    Starting in {countdown} seconds
                  </p>
                </CardContent>
              </Card>
            )}
            <p className="text-muted-foreground mb-4">The assessment will be available shortly</p>
          </div>
        );

      case 'open':
        return (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-success" />
            <h3 className="text-lg font-semibold mb-2">Assessment Open</h3>
            <p className="text-muted-foreground mb-4">{timeLeft}</p>
            <Button onClick={onBeginAssessment} size="lg">
              Begin Assessment
            </Button>
          </div>
        );

      case 'completed':
        if (score !== undefined) {
          const hasPassed = score >= passScore;
          return (
            <div>
              <div className="text-center mb-6">
                {hasPassed ? (
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-success" />
                ) : (
                  <XCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                )}
                <h3 className="text-lg font-semibold mb-2">Assessment Completed</h3>
                <p className="text-muted-foreground">You have completed this assessment</p>
              </div>
              
              <Card className={hasPassed ? "bg-success-light border-success" : "bg-destructive-light border-destructive"}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`text-lg font-semibold ${hasPassed ? 'text-success' : 'text-destructive'}`}>
                        Your Score: {score}/{totalMarks}
                      </p>
                      <p className={hasPassed ? 'text-success' : 'text-destructive'}>
                        {hasPassed ? 'Congratulations, you passed!' : `You need at least ${passScore} marks to pass`}
                      </p>
                    </div>
                    <Button 
                      variant="link" 
                      className={`p-0 h-auto ${hasPassed ? 'text-success hover:text-success' : 'text-destructive hover:text-destructive'}`}
                    >
                      View Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }
        return (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-success" />
            <h3 className="text-lg font-semibold mb-2">Assessment Completed</h3>
            <p className="text-muted-foreground">You have completed this assessment</p>
          </div>
        );

      case 'expired':
        return (
          <div>
            <div className="text-center mb-6">
              <XCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <h3 className="text-lg font-semibold mb-2">Assessment Ended</h3>
              <p className="text-muted-foreground">This assessment has ended</p>
            </div>
            
            <Card className="bg-destructive-light border-destructive">
              <CardContent className="p-6">
                <p className="text-destructive text-center">
                  The assessment has ended and cannot be attempted
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'interrupted':
        return (
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-warning" />
            <h3 className="text-lg font-semibold mb-2">Assessment Interrupted</h3>
            <p className="text-muted-foreground mb-4">Your previous attempt was interrupted</p>
            <div className="space-x-4">
              <Button onClick={onBeginAssessment} size="lg">
                Resume Assessment
              </Button>
              <Button variant="outline" onClick={onReAttemptRequest}>
                Request Re-attempt
              </Button>
            </div>
          </div>
        );

      case 'reAttemptRequested':
        return (
          <div className="text-center">
            <RotateCcw className="w-12 h-12 mx-auto mb-4 text-info" />
            <h3 className="text-lg font-semibold mb-2">Re-attempt Requested</h3>
            <p className="text-muted-foreground mb-4">Your re-attempt request is being processed</p>
            <Badge variant="outline" className="text-info border-info">
              Processing Request
            </Badge>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-8">
        {renderStateContent()}
      </CardContent>
    </Card>
  );
};

export default AssessmentStateCard;