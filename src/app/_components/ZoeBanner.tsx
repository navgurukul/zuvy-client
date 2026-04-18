import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ZoeBannerProps {
  isVisible: boolean;
  onDismiss: () => void;
  onGiveFeedback?: () => void;
  onStartInterview?: () => void;
}

const ZoeBanner = ({ isVisible, onDismiss, onGiveFeedback, onStartInterview }: ZoeBannerProps) => {
  const [canClose, setCanClose] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isVisible) return;

    setCanClose(false);
    setCountdown(5);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full"
        >
          <div className="bg-primary text-primary-foreground">
            <div className="container max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                {/* Main content */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Sparkles className="w-5 h-5 text-zuvy-gold shrink-0" />
                  </motion.div>
                  
                  <p className="text-sm md:text-base font-medium truncate">
                    {canClose ? (
                      <>
                        <span className="font-bold">Zoe Beta is live!</span>{" "}
                        <span className="hidden sm:inline">
                          Try an AI-powered 1:1 interview & share your feedback.
                        </span>
                        <span className="sm:hidden">Try AI interviews now!</span>
                      </>
                    ) : (
                      <>
                        <span className="font-bold">Zoe Beta is live!</span>{" "}
                        <span className="hidden sm:inline">
                          Practice 1:1 interviews using AI. Laptop/Desktop recommended.
                        </span>
                        <span className="sm:hidden">Practice AI interviews!</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {canClose && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="hidden sm:flex items-center gap-2"
                    >
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={onGiveFeedback}
                        className="bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground border-0 text-xs font-semibold"
                      >
                        Give Feedback
                      </Button>
                      <Button
                        size="sm"
                        onClick={onStartInterview}
                        className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-xs font-semibold"
                      >
                        Start Interview
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </motion.div>
                  )}

                  {/* Close button with countdown */}
                  <button
                    onClick={canClose ? onDismiss : undefined}
                    disabled={!canClose}
                    className={`relative p-1.5 rounded-full transition-all ${
                      canClose
                        ? "hover:bg-primary-foreground/20 cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    aria-label={canClose ? "Close banner" : `Close available in ${countdown}s`}
                  >
                    {!canClose && countdown > 0 && (
                      <span className="absolute -top-1 -right-2 w-5 h-5 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center z-10 shadow-lg border border-gray-900">
                        {countdown}
                      </span>
                    )}
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ZoeBanner;