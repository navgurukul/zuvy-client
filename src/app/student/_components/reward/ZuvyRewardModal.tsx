
'use client';

import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ZuvyRewardAnimation,
} from './ZuvyRewardAnimation';
import { X } from 'lucide-react';

import './reward-animation.css';

import { Button } from '@/components/ui/button';
import { api } from '@/utils/axios.config';

interface QuizResultSummary {
  total: number;
  correct: number;
  incorrect: number;
  unattempted: number;
}

export interface ZuvyRewardModalProps {
  isOpen: boolean;
  totalSparks: number;
  chapterTitle?: string;
  hideSparks?: boolean;
  onClose: () => void;
  onContinue?: () => void;
  onWatchMore?: () => void;
  isVideoCompletion?: boolean;
  hasNextChapter?: boolean;
  /**
   * Set only for quiz completions. The modal fetches this chapter's saved quiz
   * results (same API as QuizContent) and shows how many answers were right/wrong.
   */
  quizChapterId?: string;
}

export const ZuvyRewardModal: React.FC<
  ZuvyRewardModalProps
> = ({
  isOpen,
  totalSparks,
  chapterTitle = 'Chapter',
  hideSparks = false,
  onClose,
  onContinue,
  onWatchMore,
  isVideoCompletion = false,
  hasNextChapter = true,
  quizChapterId,
}) => {
    const popupRef =
      useRef<HTMLDivElement>(null);

    const badgeRef =
      useRef<HTMLDivElement>(null);

    const sparkCountRef =
      useRef<HTMLSpanElement>(null);

    const mascotSlotRef =
      useRef<HTMLDivElement>(null);

    const row1Ref =
      useRef<HTMLDivElement>(null);

    const continueBtnRef =
      useRef<HTMLButtonElement>(null);

    // Prevent duplicate confetti containers
    const confettiRef =
      useRef<HTMLDivElement | null>(null);

    const [canContinue, setCanContinue] =
      useState(false);

    const [isExiting, setIsExiting] =
      useState(false);

    const isZeroSparks = !hideSparks && totalSparks === 0;
    const rewardTitle = hideSparks
      ? 'Form Submitted Successfully'
      : isZeroSparks
        ? 'Keep Trying!'
        : 'Chapter Completed!';

    // On the last chapter there's nowhere to continue to, so hide the
    // Continue button (zero-sparks "Try Again" is still shown).
    const showContinueButton = isZeroSparks || hasNextChapter;

    // =========================================================
    // Quiz results — fetched from the same API QuizContent uses,
    // so the score matches the ✓ / ✗ marks shown on the quiz.
    // =========================================================

    const [quizResult, setQuizResult] =
      useState<QuizResultSummary | null>(null);
    // Chapter whose results have been fetched (success or failure)
    const [quizFetchedFor, setQuizFetchedFor] =
      useState<string | null>(null);

    useEffect(() => {
      if (!isOpen || !quizChapterId) return;
      let cancelled = false;
      setQuizResult(null);

      api
        .get(`/tracking/getQuizAndAssignmentWithStatus?chapterId=${quizChapterId}`)
        .then((res) => {
          if (cancelled) return;
          const questions: any[] = res.data?.data?.quizDetails || [];
          let correct = 0;
          let incorrect = 0;
          let unattempted = 0;
          questions.forEach((q) => {
            const chosen = q.quizTrackingData?.[0]?.chosenOption;
            if (chosen === undefined || chosen === null) {
              unattempted += 1;
            } else if (Number(chosen) === Number(q.correctOption)) {
              correct += 1;
            } else {
              incorrect += 1;
            }
          });
          setQuizResult(
            questions.length
              ? { total: questions.length, correct, incorrect, unattempted }
              : null
          );
        })
        .catch(() => {
          if (!cancelled) setQuizResult(null);
        })
        .finally(() => {
          if (!cancelled) setQuizFetchedFor(quizChapterId);
        });

      return () => {
        cancelled = true;
      };
    }, [isOpen, quizChapterId]);

    // Hold the mascot animation until the quiz score is known so its message
    // matches the result instead of replaying when the data arrives.
    const isQuizResultPending =
      !!quizChapterId && quizFetchedFor !== quizChapterId;

    // Quiz: don't say "Good job" when some answers were wrong
    const quizHasMistakes =
      !!quizResult && quizResult.correct < quizResult.total;

    // =========================================================
    // Confetti
    // =========================================================

    const spawnConfetti = () => {
      // Remove any previous confetti first
      if (confettiRef.current) {
        confettiRef.current.remove();
        confettiRef.current = null;
      }

      const container =
        document.createElement('div');

      container.className =
        'reward-confetti';

      const colors = [
        'hsl(153 91% 49%)',
        'hsl(25 80% 52%)',
        'hsl(38 94% 50%)',
        'hsl(200 85% 55%)',
        'hsl(280 70% 60%)',
      ];

      const count = 60;

      for (let i = 0; i < count; i++) {
        const piece =
          document.createElement('span');

        piece.className =
          'confetti-piece';

        piece.style.left =
          `${Math.random() * 100}%`;

        piece.style.background =
          colors[
          Math.floor(
            Math.random() *
            colors.length
          )
          ];

        piece.style.animationDuration =
          `${2.4 + Math.random() * 1.8}s`;

        piece.style.animationDelay =
          `${Math.random() * 0.7}s`;

        container.appendChild(piece);

        piece.addEventListener(
          'animationend',
          () => {
            piece.remove();
          }
        );
      }

      document.body.appendChild(container);

      confettiRef.current = container;

      // Cleanup after animation finishes
      window.setTimeout(() => {
        if (
          confettiRef.current ===
          container
        ) {
          container.remove();
          confettiRef.current = null;
        }
      }, 5000);
    };

    // =========================================================
    // Cleanup Confetti
    // =========================================================

    const cleanupConfetti = () => {
      if (confettiRef.current) {
        confettiRef.current.remove();
        confettiRef.current = null;
      }
    };

    // =========================================================
    // Animation
    // =========================================================

    useEffect(() => {
      // ---------------------------------------------------------
      // Modal closed
      // ---------------------------------------------------------

      if (!isOpen) {
        setCanContinue(false);
        setIsExiting(false);

        cleanupConfetti();

        ZuvyRewardAnimation
          .mascotInteraction
          .cleanup();

        return;
      }

      if (isQuizResultPending) return;

      let isSubscribed = true;

      // ---------------------------------------------------------
      // Start confetti only for actual positive rewards.
      //
      // Feedback modal & zero spark modal should NOT show confetti.
      // ---------------------------------------------------------

      if (!hideSparks && totalSparks > 0) {
        spawnConfetti();
      }

      // Reveal the action buttons early instead of waiting for the full
      // mascot / spark-throw sequence to finish.
      const buttonsTimer = window.setTimeout(() => {
        if (!isSubscribed) return;
        setCanContinue(true);
      }, 900);

      const timer =
        window.setTimeout(() => {
          if (!isSubscribed) return;

          if (
            !popupRef.current ||
            !badgeRef.current ||
            !mascotSlotRef.current
          ) {
            return;
          }

          // =====================================================
          // Reset animation states
          // =====================================================

          badgeRef.current.classList.remove(
            'animate'
          );

          if (sparkCountRef.current) {
            sparkCountRef.current.textContent =
              '+0';

            sparkCountRef.current.classList.remove(
              'absorb-pulse'
            );
          }

          if (row1Ref.current) {
            row1Ref.current.classList.remove(
              'visible'
            );
          }

          if (continueBtnRef.current) {
            continueBtnRef.current.classList.remove(
              'visible'
            );
          }

          // =====================================================
          // Cleanup previous mascot
          // =====================================================

          ZuvyRewardAnimation
            .mascotInteraction
            .cleanup();

          // =====================================================
          // Rows
          //
          // Normal reward:
          // Chapter Completion row exists.
          //
          // Feedback:
          // No row.
          // =====================================================

          const rows =
            row1Ref.current &&
              !hideSparks
              ? [row1Ref.current]
              : [];

          // =====================================================
          // Start reward animation
          // =====================================================

          ZuvyRewardAnimation.play({
            popupEl:
              popupRef.current,

            badgeEl:
              badgeRef.current,

            // Normal reward -> spark counter
            // Feedback -> undefined
            sparkCountEl:
              hideSparks
                ? undefined
                : sparkCountRef.current ??
                undefined,

            rows,

            mascotSlotEl:
              mascotSlotRef.current,

            totalSparks:
              hideSparks
                ? 0
                : totalSparks,

            message:
              hideSparks
                ? 'Thanks! 🎉'
                : totalSparks > 0
                  ? quizHasMistakes
                    ? 'Nice try! 👀'
                    : 'Good job! 🎉'
                  : 'Try again 💪',

            // ===================================================
            // Animation complete
            // ===================================================

            onComplete: () => {
              if (!isSubscribed) {
                return;
              }

              setCanContinue(true);

              if (
                continueBtnRef.current
              ) {
                continueBtnRef.current.classList.add(
                  'visible'
                );
              }
            },
          });
        }, 150);

      // =========================================================
      // Cleanup
      // =========================================================

      return () => {
        isSubscribed = false;

        window.clearTimeout(timer);
        window.clearTimeout(buttonsTimer);

        cleanupConfetti();

        ZuvyRewardAnimation
          .mascotInteraction
          .cleanup();
      };
    }, [
      isOpen,
      totalSparks,
      hideSparks,
      isQuizResultPending,
      quizHasMistakes,
    ]);

    // =========================================================
    // Close / Continue
    // =========================================================

    const handleClose = (continueToNext = true) => {
      if (isExiting) return;

      setIsExiting(true);

      cleanupConfetti();

      ZuvyRewardAnimation
        .mascotInteraction
        .cleanup();

      window.setTimeout(() => {
        onClose();
        if (continueToNext) {
          onContinue?.();
        }
      }, 250);
    };

    const handleWatchMore = () => {
      window.dispatchEvent(new Event('zuvy:resume-video'));
      handleClose(false);
      onWatchMore?.();
    };

    // =========================================================
    // Modal not open
    // =========================================================

    if (!isOpen) {
      return null;
    }

    // =========================================================
    // UI
    // =========================================================

    return (
      <div
        className={`reward-popup-overlay ${isExiting
            ? 'exiting'
            : ''
          }`}
        onClick={() => handleClose()}
      >
        <div
          className={`reward-popup ${isExiting ? 'exiting' : ''} ${
            isZeroSparks ? 'is-zero-sparks' : ''
          }`}
          ref={popupRef}
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          <button
            type="button"
            aria-label="Close congratulation popup"
            className="absolute right-4 top-4 z-10 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() =>
              // For video completions the player is held paused behind the
              // modal; closing it should resume playback like "Watch more".
              isVideoCompletion ? handleWatchMore() : handleClose(false)
            }
          >
            <X className="h-5 w-5" />
          </button>
          {/* ===================================================
            1. Success / Zero-Sparks Badge
        =================================================== */}

          <div
            className="reward-badge"
            ref={badgeRef}
          >
            {isZeroSparks ? (
              <svg
                viewBox="0 0 24 24"
                width="30"
                height="30"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                width="30"
                height="30"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="4 12 9.5 17.5 20 6" />
              </svg>
            )}
          </div>

          {/* ===================================================
            2. Heading
        =================================================== */}

          <h3 className="reward-title">
            {rewardTitle}
          </h3>

          <p className="reward-subtitle">
            {chapterTitle}
          </p>
          {isVideoCompletion && (
            <p className="mt-2 text-center text-sm font-medium text-primary">
              You have watched 75% of this video.
            </p>
          )}
          {quizResult && quizResult.total > 0 && (
            <div className="mb-2 mt-1 flex flex-col items-center gap-1.5 text-center">
              <p className="text-sm font-medium text-foreground">
                You got {quizResult.correct} of {quizResult.total} correct
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 text-xs font-medium">
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-success">
                  ✓ {quizResult.correct} correct
                </span>
                {quizResult.incorrect > 0 && (
                  <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-destructive">
                    ✗ {quizResult.incorrect} incorrect
                  </span>
                )}
                {quizResult.unattempted > 0 && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                    {quizResult.unattempted} skipped
                  </span>
                )}
              </div>
              {quizHasMistakes && (
                <p className="text-xs text-muted-foreground">
                  Close this to see the correct answers.
                </p>
              )}
            </div>
          )}

          {/* ===================================================
            3. Spark Counter
           
            Hidden completely for feedback.
        =================================================== */}

          {!hideSparks && (
            <div className="reward-spark-total">
              <span
                className="reward-spark-count"
                ref={sparkCountRef}
              >
                +0
              </span>

              <span className="reward-spark-label">
                ZUVY SPARKS
              </span>
            </div>
          )}

          {/* ===================================================
            4. Chapter Completion State
        =================================================== */}

          {!hideSparks && (
            <div className="reward-breakdown">
              <div
                className="reward-row"
                ref={row1Ref}
              >
                {/* Left side */}

                <span className="reward-row-label">
                  Chapter Completion
                </span>

                {/* Mascot */}

                <div
                  className="reward-mascot-slot"
                  ref={mascotSlotRef}
                />

                {/* Right side */}

                <span className="reward-row-value">
                  +{totalSparks}
                </span>
              </div>
            </div>
          )}

          {/* ===================================================
            5. Feedback State

            No +0
            No Spark counter
            No Chapter Completion row

            Only mascot + feedback message.
        =================================================== */}

          {hideSparks && (
            <div className="reward-feedback-content">
              <div
                className="reward-feedback-mascot-slot"
                ref={mascotSlotRef}
              />

              <p className="reward-feedback-message">
                Thank you for sharing
                your feedback! 🎉
              </p>
            </div>
          )}

          {/* ===================================================
            6. Continue Button
        =================================================== */}

          <div className="flex flex-col items-center gap-2">
            {showContinueButton && (
              <Button
                className={`reward-continue-btn ${canContinue
                    ? 'visible'
                    : ''
                  }`}
                ref={continueBtnRef}
                onClick={() => handleClose()}
              >
                {isZeroSparks ? 'Try Again →' : 'Continue to next chapter →'}
              </Button>
            )}
            {isVideoCompletion && (
              <Button
                variant="outline"
                className={`reward-continue-btn ${canContinue
                    ? 'visible'
                    : ''
                  }`}
                onClick={handleWatchMore}
              >
                Complete video to 100%
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

export default ZuvyRewardModal;