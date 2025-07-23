
import { useState, useEffect } from "react";
import AssessmentHeader from "./AssessmentHeader";
import AssessmentStateCard from "./AssessmentStateCard";
import AssessmentModal from "./AssessmentModal";
import { AssessmentViewProps } from '@/app/student/_components/componentStudentTypes';


const AssessmentView = ({ assessment }: AssessmentViewProps) => {
  const [currentState, setCurrentState] = useState(assessment.state);
  const [countdown, setCountdown] = useState(3);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (currentState === 'scheduled') {
      setIsCountdownActive(true);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCurrentState('open');
            setIsCountdownActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentState]);

  const handleReAttemptRequest = () => {
    setCurrentState('reAttemptRequested');
    setTimeout(() => {
      setCurrentState('scheduled');
    }, 3000);
  };

  const handleBeginAssessment = () => {
    setShowModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="space-y-6">
        <AssessmentHeader
          title={assessment.title}
          attemptStatus={assessment.attemptStatus}
          startDate={assessment.startDate}
          endDate={assessment.endDate}
          duration={assessment.duration}
          totalMarks={assessment.totalMarks}
          description={assessment.description}
        />
        
        <AssessmentStateCard
          state={currentState}
          countdown={isCountdownActive ? countdown : undefined}
          endDate={assessment.endDate}
          score={assessment.score}
          totalMarks={assessment.totalMarks}
          passScore={assessment.passScore}
          onReAttemptRequest={handleReAttemptRequest}
          onBeginAssessment={handleBeginAssessment}
        />
      </div>

      <AssessmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        assessmentTitle={assessment.title}
        duration={assessment.duration}
      />
    </div>
  );
};

export default AssessmentView;