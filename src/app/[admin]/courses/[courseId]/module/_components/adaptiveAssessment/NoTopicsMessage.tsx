import { AlertCircle, ExternalLink, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NoTopicsMessageProps {
  domainName: string;
  onNavigateToLibrary: () => void;
}

export function NoTopicsMessage({ domainName, onNavigateToLibrary }: NoTopicsMessageProps) {
  return (
    <div className="flex items-start gap-4 p-5 bg-warning/5 border border-warning/30 rounded-2xl">
      <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
        <AlertCircle className="h-5 w-5 text-warning" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-foreground mb-1">No Topics Available</h4>
        <p className="text-sm text-text-secondary mb-4">
          The domain "{domainName}" doesn't have any topics configured yet. You need to create topics and questions in the Question Library before creating an assessment.
        </p>
        <Button 
          variant="outline"
          onClick={onNavigateToLibrary}
          className="border-warning/50 text-warning hover:bg-warning/10 hover:border-warning rounded-xl transition-all duration-300"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Go to Question Library
          <ExternalLink className="h-3.5 w-3.5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
