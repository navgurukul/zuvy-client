
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import{ViolationModalProps, ViolationType} from '@/app/student/_components/componentStudentType'


const ViolationModal = ({ isOpen, onClose, violation }: ViolationModalProps) => {
  if (!violation) return null;

  const getViolationInfo = (type: string) => {
    switch (type) {
      case 'tab-switch':
        return {
          title: 'Tab Switch Detected',
          description: 'Tab switches are not permitted during an ongoing assessment. Repeated violations will lead to automatic assessment submission at the current progress.'
        };
      case 'fullscreen-exit':
        return {
          title: 'Full Screen Exit Detected',
          description: 'Screen exit is not permitted and would erase your progress. Repeated violations will lead to automatic assessment submission at the current progress.'
        };
      case 'copy-paste':
        return {
          title: 'Copy and Paste Detected',
          description: 'Copying and pasting is not permitted. Repeated violations will lead to automatic assessment submission at the current progress.'
        };
      default:
        return {
          title: 'Violation Detected',
          description: 'A violation has been detected.'
        };
    }
  };

  const violationInfo = getViolationInfo(violation.type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <DialogTitle className="text-lg">{violationInfo.title}</DialogTitle>
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="destructive" className="mb-4">
              Violation {violation.count}/3
            </Badge>
          </div>
          <DialogDescription className="text-left text-base">
            {violationInfo.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose}>
            Return to Assessment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViolationModal;