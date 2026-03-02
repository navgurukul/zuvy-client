import { Loader2, Info, Sparkles } from 'lucide-react';

interface LoadingOverlayProps {
  message: string;
  subMessage?: string;
}

export function LoadingOverlay({ message, subMessage }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-50 flex items-center justify-center">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="relative text-center max-w-lg px-8 animate-fade-in">
        {/* Loader ring */}
        <div className="relative mb-10">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 w-28 h-28 mx-auto">
            <div className="w-full h-full rounded-full border-4 border-transparent border-t-primary border-r-accent animate-spin" style={{ animationDuration: '2s' }} />
          </div>
          
          {/* Middle rotating ring (opposite direction) */}
          <div className="absolute inset-0 w-24 h-24 mx-auto mt-2 ml-2">
            <div className="w-full h-full rounded-full border-4 border-transparent border-b-secondary border-l-primary animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
          </div>
          
          {/* Center icon */}
          <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center backdrop-blur-sm border border-primary/20">
            <Sparkles className="h-10 w-10 text-primary animate-pulse" />
          </div>
        </div>
        
        <h3 className="text-2xl font-heading font-bold text-foreground mb-4 leading-relaxed">
          {message}
        </h3>
        
        {subMessage && (
          <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-info/10 to-info/5 rounded-2xl mt-8 border border-info/20 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-info/20 flex items-center justify-center flex-shrink-0">
              <Info className="h-5 w-5 text-info" />
            </div>
            <p className="text-sm text-text-secondary text-left leading-relaxed">{subMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
