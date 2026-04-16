import { Loader2, Info, Sparkles } from 'lucide-react';

interface LoadingOverlayProps {
  message: string;
  subMessage?: string;
  slides?: string[];
  activeSlideIndex?: number;
  variant?: 'overlay' | 'subtle';
}

export function LoadingOverlay({
  message,
  subMessage,
  slides = [],
  activeSlideIndex = 0,
  variant = 'overlay',
}: LoadingOverlayProps) {
  if (variant === 'subtle') {
    const hasSlides = slides.length > 0;
    const safeIndex = Math.min(Math.max(activeSlideIndex, 0), Math.max(slides.length - 1, 0));
    const currentSlide = hasSlides ? slides[safeIndex] : message;
    const progress = hasSlides && slides.length > 1
      ? Math.round(((safeIndex + 1) / slides.length) * 100)
      : 70;

    return (
      <div
        className="fixed bottom-4 right-4 z-50 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="min-w-[220px] max-w-[280px] rounded-lg border border-border bg-background/90 shadow-lg backdrop-blur px-3 py-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-xs flex font-medium text-foreground">
              AI generation in progress
            </p>
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="ml-auto text-xs tabular-nums text-muted-foreground">
              {progress}%
            </span>
          </div>
          <p
            key={safeIndex}
            className="mt-1 text-[11px] flex leading-4 text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
          >
            {currentSlide}
          </p>
          {subMessage && (
            <p className="mt-1 text-[10px] flex leading-4 text-left text-muted-foreground/90">
              {subMessage}
            </p>
          )}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

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
        
        <h3 className="text-2xl flex font-heading font-bold text-foreground mb-4 leading-relaxed">
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

        {slides.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {slides.map((slide, index) => {
              const isActive = index === activeSlideIndex;

              return (
                <div
                  key={slide}
                  className={`rounded-xl border p-3 transition-all duration-300 ${
                    isActive
                      ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                      : 'border-border/60 bg-card/40'
                  }`}
                >
                  <p className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-text-secondary'}`}>
                    {slide}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
