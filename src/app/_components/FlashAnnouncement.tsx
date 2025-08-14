'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progressBanner";
import { 
  AlertDialog, 
  AlertDialogContent, 
} from "@/components/ui/alert-dialog";
import { CheckCircle2, Sparkles, X } from "lucide-react";
import { useState, useEffect } from "react";
import { type FC } from "react";

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
    description: "A clean, easy-to-use dashboard so you can find what you need in seconds"
  },
  {
    id: "tracking",
    description: "Smarter progress tracking to help you stay on top of your goals"
  },
  {
    id: "access",
    description: "Faster course access so you spend more time learning, less time loading"
  }
];

const FlashAnnouncementDialog: FC<FlashAnnouncementDialogProps> = ({
  autoCloseDelay = 5000,
  features = defaultFeatures
}) => {
  const [timer, setTimer] = useState<number>(Math.ceil(autoCloseDelay / 1000));
  const [isOpen, setIsOpen] = useState<boolean>(true); // Open by default

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isOpen && timer > 0) {
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
  }, [isOpen, timer]);

  const handleOpenChange = (open: boolean): void => {
    setIsOpen(open);
    if (!open) {
      setTimer(Math.ceil(autoCloseDelay / 1000));
    }
  };

  const handleClose = (): void => {
    setIsOpen(false);
    localStorage.setItem('isLoginFirst' , '')
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

  return (
  <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
  <AlertDialogContent
    className="
      max-w-7xl w-full 
      pb-5 text-left 
      max-h-[85vh] overflow-y-auto overflow-x-hidden
      sm:rounded-lg
    "
  >
    {/* Close button */}
    <button
      onClick={handleClose}
      disabled={timer > 0}
      className="absolute right-4 top-4 z-10 rounded-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="Close announcement"
    >
      <div className="flex text-black font-semibold items-center gap-1">
        <span>Close</span>
        {timer > 0 && <span className="text-xs">({timer})</span>}
      </div>
    </button>

    <section aria-labelledby="flash-title">
      <Card className="relative border-0 shadow-none">
        {/* Ambient gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-60 blur-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
        />

        <CardContent
          className="
            relative grid gap-8 p-6 
            md:gap-10 md:p-12 
            md:grid-cols-2
          "
        >
          {/* Left Section */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#3e69de] px-3 py-1 text-xs font-medium text-white">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              New dashboard announcement
            </div>

            <h1
              id="flash-title"
              className="font-bold tracking-tight text-3xl sm:text-4xl md:text-5xl"
            >
              A better Zuvy is on its way!
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground">
              We&apos;ve been quietly working behind the scenes to bring you a
              new and improved Zuvy platform designed to make learning not just
              smoother, but more enjoyable.
            </p>

            <ul className="space-y-3" role="list">
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

            <p className="text-sm sm:text-base text-muted-foreground">
              We can&apos;t wait for you to try it out.{" "}
              <strong className="font-semibold text-foreground">
                Coming very soon
              </strong>{" "}
              — get ready!
            </p>

            <div className="pt-2">
              <Button className="px-6 bg-[#3e69de] cursor-default">
                Stay tuned
              </Button>
            </div>
          </div>

          {/* Right Section */}
          <aside className="flex items-center">
            <div className="w-full rounded-xl border bg-background p-4 sm:p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Release status
                </span>
                <span className="rounded-full bg-[#3e69de] px-2 py-1 text-xs text-white">
                  Coming soon
                </span>
              </div>

              <div className="mb-3 text-xl sm:text-2xl font-semibold">
                New Zuvy Dashboard
              </div>

              <p className="mb-6 text-sm sm:text-base text-muted-foreground">
                Polished design, faster access, and smarter progress tracking.
              </p>

              <Progress
                value={90}
                className="mb-2 bg-[#3e69de]/50 border border-[#3e69de]"
                aria-label="Release progress"
              />
              <div className="text-sm text-muted-foreground">
                Almost there – 90%
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

    );
};

export default FlashAnnouncementDialog;