'use client';

import React, { useState, useEffect } from 'react';
import { useTour } from './TourContext';
import { Button } from '@/components/ui/button';
import { X, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const TourTooltip: React.FC = () => {
  const {
    isOpen,
    currentStepIndex,
    steps,
    activeElementRect,
    nextStep,
    prevStep,
    skipTour,
    finishTour,
  } = useTour();

  const pathname = usePathname();

  const [coords, setCoords] = useState<{ top: number; left: number; placement: 'top' | 'bottom' }>({
    top: 0,
    left: 0,
    placement: 'bottom',
  });

  const step = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const [isPositioned, setIsPositioned] = useState(false);
  const [pollingDone, setPollingDone] = useState(false);

  // Reset on step change
  useEffect(() => {
    setIsPositioned(false);
    setPollingDone(false);
    // Wait 3.1s (slightly more than TourContext's 3s polling max) before showing fallback
    const timer = setTimeout(() => {
      setPollingDone(true);
    }, 3100);
    return () => clearTimeout(timer);
  }, [currentStepIndex]);

  // Resolve only static routes (skip DYNAMIC_ tokens — TourContext handles those)
  const resolvedRoute =
    step?.route && !step.route.startsWith('DYNAMIC_') ? step.route : null;

  // Only hide during active route transition (we're on a different page than expected)
  const currentPath = pathname.split('?')[0];
  const expectedPath = resolvedRoute ? resolvedRoute.split('?')[0] : null;
  const isTransitioning = expectedPath !== null && currentPath !== expectedPath;

  useEffect(() => {
    if (!activeElementRect) return;

    const tooltipWidth = 320;
    const tooltipHeight = 190;
    const padding = 16;
    const arrowHeight = 8;

    const target = activeElementRect;

    let top = target.bottom + arrowHeight + 8;
    let left = target.left + (target.width - tooltipWidth) / 2;
    let placement: 'top' | 'bottom' = 'bottom';

    if (left < padding) {
      left = padding;
    } else if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding;
    }

    if (top + tooltipHeight > window.innerHeight - padding) {
      if (target.top - tooltipHeight - arrowHeight - 8 > padding) {
        top = target.top - tooltipHeight - arrowHeight - 8;
        placement = 'top';
      }
    }

    setCoords({ top, left, placement });
    setIsPositioned(true);
  }, [activeElementRect]);

  if (!isOpen || !step) return null;

  // Hide only while navigating to a different page
  if (isTransitioning) return null;

  // While polling for element — don't show anything yet
  if (!activeElementRect && !pollingDone) return null;

  // Fallback: target element not found after polling — render centered modal
  if (!activeElementRect) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[10000] pointer-events-none">
        <div className="w-[340px] p-6 rounded-2xl bg-card border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary px-2.5 py-0.5 rounded-full bg-primary-light/50">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Onboarding Tour: {step.stepNumber}/{step.totalSteps}
            </span>
            <button
              onClick={skipTour}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Skip onboarding tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-lg font-bold text-foreground mb-2 text-left">{step.title}</h3>
          <p className="text-sm text-foreground mb-6 leading-relaxed text-left">{step.content}</p>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <button
              onClick={skipTour}
              className="text-xs text-muted-foreground hover:text-foreground font-semibold"
            >
              Skip Tour
            </button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                className="h-8 text-xs font-medium border-border"
              >
                Back
              </Button>
              {isLastStep ? (
                <Button
                  size="sm"
                  onClick={finishTour}
                  className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary-dark font-semibold px-3"
                >
                  Finish
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={nextStep}
                  className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary-dark font-semibold px-3"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        visibility: isPositioned ? 'visible' : 'hidden',
      }}
      className="w-[320px] p-5 rounded-2xl bg-card border border-border shadow-2xl z-[10000] animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-auto"
    >
      <div
        className={`absolute w-3 h-3 bg-card border-border rotate-45 z-[-1] ${
          coords.placement === 'bottom'
            ? '-top-1.5 left-1/2 -translate-x-1/2 border-l border-t'
            : '-bottom-1.5 left-1/2 -translate-x-1/2 border-r border-b'
        }`}
      />

      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary px-2.5 py-0.5 rounded-full bg-primary-light/50">
          {step.stepNumber}/{step.totalSteps}
        </span>
        <button
          onClick={skipTour}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Skip onboarding tour"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <h3 className="text-base font-bold text-foreground mb-1.5 text-left">{step.title}</h3>
      <p className="text-[13px] text-foreground mb-5 leading-relaxed text-left">{step.content}</p>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <button
          onClick={skipTour}
          className="text-xs text-muted-foreground hover:text-foreground font-semibold"
        >
          Skip Tour
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="h-8 text-xs font-semibold border-border disabled:opacity-50"
          >
            Back
          </Button>
          {isLastStep ? (
            <Button
              size="sm"
              onClick={finishTour}
              className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary-dark font-semibold px-3"
            >
              Finish
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={nextStep}
              className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary-dark font-semibold px-3"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};