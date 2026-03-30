import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuccessMessageProps {
  action: 'publish' | 'draft' | 'schedule';
  setName: string;
  onReset: () => void;
}

const messages = {
  publish: {
    title: 'Published Successfully',
    description: 'Your assessment is now available to students.',
  },
  draft: {
    title: 'Saved as Draft',
    description: 'You can edit and publish your assessment anytime.',
  },
  schedule: {
    title: 'Scheduled Successfully',
    description: 'Your assessment will be published at the scheduled time.',
  },
};

export function SuccessMessage({ action, setName, onReset }: SuccessMessageProps) {
  const { title, description } = messages[action];

  return (
    <div className="py-12 text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-success" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-text-secondary">{description}</p>
        <p className="text-sm text-text-tertiary">
          Assessment: <span className="font-medium text-foreground">{setName}</span>
        </p>
      </div>

      <Button 
        onClick={onReset} 
        variant="outline"
        className="mx-auto"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Create Another
      </Button>
    </div>
  );
}
