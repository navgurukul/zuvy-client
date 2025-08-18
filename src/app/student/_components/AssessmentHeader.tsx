
import { Badge } from "@/components/ui/badge";
import{AssessmentHeaderProps} from '@/app/student/_components/componentStudentType'

const AssessmentHeader = ({ 
  title, 
  attemptStatus, 
  startDate, 
  endDate, 
  duration, 
  totalMarks, 
  description 
}: AssessmentHeaderProps) => {
  const getAttemptStatusBadge = () => {
    switch (attemptStatus) {
      case 'Attempted':
        return <Badge variant="outline" className="text-success border-success">Attempted</Badge>;
      case 'Interrupted':
        return <Badge variant="outline" className="text-warning border-warning">Interrupted</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">Not Attempted</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold">{title}</h1>
        {getAttemptStatusBadge()}
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Start Date</p>
          <p className="font-medium">{startDate.toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">End Date</p>
          <p className="font-medium">{endDate.toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Duration</p>
          <p className="font-medium">{duration}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Marks</p>
          <p className="font-medium">{totalMarks}</p>
        </div>
      </div>
      
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default AssessmentHeader;