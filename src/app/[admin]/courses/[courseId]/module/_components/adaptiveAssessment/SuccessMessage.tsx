import { CheckCircle, ArrowLeft, PartyPopper, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuccessMessageProps {
  action: 'publish' | 'draft' | 'schedule';
  setName: string;
  onReset: () => void;
}

const messages = {
  publish: {
    title: 'Assessment Published!',
    description: 'Your assessment is now live and available to students.',
    icon: PartyPopper,
    gradient: 'from-success to-accent',
  },
  draft: {
    title: 'Draft Saved!',
    description: 'Your assessment has been saved. You can edit and publish it later.',
    icon: CheckCircle,
    gradient: 'from-secondary to-secondary-dark',
  },
  schedule: {
    title: 'Assessment Scheduled!',
    description: 'Your assessment will be published at the scheduled time.',
    icon: Sparkles,
    gradient: 'from-info to-primary',
  },
};

export function SuccessMessage({ action, setName, onReset }: SuccessMessageProps) {
  const { title, description, icon: Icon, gradient } = messages[action];

  return (
    <div className="text-center py-20 animate-fade-in relative">
      {/* Celebration background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-3xl`} />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-accent/40 rounded-full animate-pulse"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + Math.random()}s`,
            }}
          />
        ))}
      </div>
      
      <div className="relative">
        {/* Icon container */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Rotating rings */}
          <div className="absolute inset-0">
            <div className={`w-full h-full rounded-full border-4 border-transparent border-t-success/30 border-r-accent/30 animate-spin`} style={{ animationDuration: '4s' }} />
          </div>
          <div className="absolute inset-2">
            <div className={`w-full h-full rounded-full border-4 border-transparent border-b-primary/30 border-l-secondary/30 animate-spin`} style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
          </div>
          
          {/* Center icon */}
          <div className={`absolute inset-4 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-2xl`}>
            <Icon className="h-12 w-12 text-primary-foreground" />
          </div>
        </div>
        
        <h2 className="text-4xl font-heading font-bold text-foreground mb-4">{title}</h2>
        <p className="text-lg text-text-secondary mb-3 max-w-md mx-auto">{description}</p>
        <p className={`text-xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          "{setName}"
        </p>

        <div className="mt-10">
          <Button 
            onClick={onReset} 
            variant="outline" 
            className="px-8 h-12 rounded-xl border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Create Another Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}
