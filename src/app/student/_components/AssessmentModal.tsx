
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import AssessmentInstructions from "./AssessmentInstructions";

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentTitle: string;
  duration: string;
}

const AssessmentModal = ({ isOpen, onClose, assessmentTitle, duration }: AssessmentModalProps) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleProceed = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setShowInstructions(true);
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      // Proceed anyway for demo purposes
      setShowInstructions(true);
    }
  };

  const handleExitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
      setShowInstructions(false);
      onClose();
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
      setShowInstructions(false);
      onClose();
    }
  };

  if (showInstructions) {
    return (
      <AssessmentInstructions
        assessmentTitle={assessmentTitle}
        duration={duration}
        onClose={handleExitFullscreen}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <DialogTitle>Start Assessment</DialogTitle>
          </div>
          <div className="mt-4">
            <DialogDescription className="text-left">
              The assessment will happen in full screen mode. No tab switching, window switching, or full screen exit is allowed. Violations can result in auto-submission.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Go Back
          </Button>
          <Button onClick={handleProceed}>
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentModal;