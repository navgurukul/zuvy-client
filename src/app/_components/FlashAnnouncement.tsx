'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progressBanner";
import { 
  AlertDialog, 
  AlertDialogContent, 
} from "@/components/ui/alert-dialog";
import { CheckCircle2, Moon, Rocket, Sparkles, Sun, X } from "lucide-react";
import { useState, useEffect } from "react";
import { type FC } from "react";
import { useThemeStore } from "@/store/store";

interface Feature {
  id: string;
  description: string;
}

interface JsonLdData {
  "@context": string;
  "@type": string;
  headline: string;
  description: string;
  author: {
    "@type": string;
    name: string;
  };
}

interface FlashAnnouncementDialogProps {
  autoCloseDelay?: number;
  features?: Feature[];
}

const defaultFeatures: Feature[] = [
  {
    id: "dashboard",
    description: "A clean, distraction-free dashboard so everything feels lighter and easier"
  },
  {
    id: "tracking",
    description: "Instant access to your courses and daily tasks no more waiting"
  },
  {
    id: "access",
    description: "Clear, visual progress tracking to keep you motivated every step of the way"
  }
];

const FlashAnnouncementDialog: FC<FlashAnnouncementDialogProps> = ({
  autoCloseDelay = 5000,
  features = defaultFeatures
}) => {
  const [timer, setTimer] = useState<number>(0); // Start with 0 to avoid SSR mismatch
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const { isDark, toggleTheme } = useThemeStore();
  

  // Handle mounting to avoid SSR hydration issues
  useEffect(() => {
    setIsMounted(true);
    setTimer(Math.ceil(autoCloseDelay / 1000));
    
    // Set initial mobile state
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    
    // Add resize listener
    const handleResize = () => {
      checkMobile();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [autoCloseDelay]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isMounted && isOpen && timer > 0) {
      intervalId = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer <= 1) {
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isMounted, isOpen, timer]);

  const handleOpenChange = (open: boolean): void => {
    setIsOpen(open);
    if (!open) {
      setTimer(Math.ceil(autoCloseDelay / 1000));
    }
  };

  const handleClose = (): void => {
    setIsOpen(false);
    // Only access localStorage after component has mounted
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('isLoginFirst', '');
    }
  };

  const jsonLd: JsonLdData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "A better Zuvy is on its way!",
    description:
      "We've been quietly working on a new and improved Zuvy platform designed to make learning smoother and more enjoyable.",
    author: { 
      "@type": "Organization", 
      name: "Zuvy" 
    },
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <div className="">
      <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
        <AlertDialogContent
          className={
           `text-left 
            max-h-[80vh] overflow-x-hidden
            sm:rounded-lg
            ${isMobile ? "overflow-y-scroll max-w-max" : "overflow-y-hidden max-w-[calc(100%-100px)]"}
          `}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={timer > 0}
            className="absolute right-4 top-4 z-10 rounded-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close announcement"
          >
            <div className="flex dark:text-white text-black font-semibold items-center gap-1">
              <span>Close</span>
              {timer > 0 && <span className="text-xs">({timer})</span>}
            </div>
          </button>
               <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-8 h-8 sm:w-9 sm:h-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {isDark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

          <section aria-labelledby="flash-title">
            <Card className="relative border-0 shadow-none">
              {/* Ambient gradient */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-60 blur-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
              />

              <CardContent
                className={`flex gap-6 py-4 ${isMobile && 'flex-col'}`}
              >
                {/* Left Section */}
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full  px-3 py-1 text-xs font-medium ">
                    <Rocket className="h-4 w-4" aria-hidden="true" />
                    Now Live
                  </div>

                  <h1
                    id="flash-title"
                    className="font-bold text-2xl"
                  >
                    Your New Zuvy is Here!

                  </h1>

                  <p className="text-base sm:text-lg text-muted-foreground">
                   Welcome to the upgraded Zuvy built to make your learning journey simpler, faster, and more rewarding.


                  </p>

                  <ul className="space-y-3" role="list">
                    <p className="text-sm font-medium text-foreground">
                <span className="hidden md:inline">Here&apos;s what&apos;s new for you:</span>
                <span className="md:hidden">What&apos;s new:</span>
              </p>
                    {features.map((feature) => (
                      <li
                        key={feature.id}
                        className="flex gap-3 text-foreground text-sm sm:text-base"
                      >
                        <span className="mt-1 rounded-full" aria-hidden="true">
                          <CheckCircle2 className="h-5 w-5" />
                        </span>
                        <span className="text-foreground/90">
                          {feature.description}
                        </span>
                      </li>
                    ))}
                  </ul>

                   <p className="text-sm text-muted-foreground">
              <strong className="font-semibold text-foreground">
                <span className="hidden md:inline">Dive in and explore</span>
                <span className="md:hidden">Explore now</span>
              </strong> — your learning just got an upgrade!
            </p>

                  <div className="pt-2">
                    <Button onClick={handleClose}  className="px-6  cursor-pointer">
                      Explore
                    </Button>
                  </div>
                </div>

                {/* Right Section */}
                <aside className="flex items-center">
                  <div className="w-full rounded-xl border bg-background p-4 sm:p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Launch status
                      </span>
                      <span className="rounded-full dark:text-black bg-primary px-2 py-1 text-xs text-white">
                        Live Now
                      </span>
                    </div>

                    <div className="mb-3 text-xl sm:text-2xl font-semibold">
                      New Zuvy Dashboard
                    </div>

                    <p className="mb-6 text-sm sm:text-base text-muted-foreground">
                     Your upgraded learning experience is ready to explore.
                    </p>

                    <Progress
                      value={100}
                      className="mb-2 bg-primary"
                      aria-label="Release progress"
                    />
                    <div className="text-sm text-muted-foreground">
                      Launch Complete – 100%
                    </div>
                  </div>
                </aside>
              </CardContent>
            </Card>
          </section>

          {/* JSON-LD */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLd),
            }}
          />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FlashAnnouncementDialog;