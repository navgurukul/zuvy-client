
'use client';

import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ZuvyRewardAnimation,
} from './ZuvyRewardAnimation';

import './reward-animation.css';

import { Button } from '@/components/ui/button';

export interface ZuvyRewardModalProps {
  isOpen: boolean;
  totalSparks: number;
  chapterTitle?: string;
  hideSparks?: boolean;
  onClose: () => void;
  onContinue?: () => void;
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

      let isSubscribed = true;

      // ---------------------------------------------------------
      // Start confetti only for actual reward
      //
      // Feedback modal should NOT show confetti.
      // ---------------------------------------------------------

      if (!hideSparks) {
        spawnConfetti();
      }

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
                ? 'Thank you! 🎉'
                : totalSparks > 0
                  ? 'Good job! 🎉'
                  : 'Great work! 🎉',

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

        cleanupConfetti();

        ZuvyRewardAnimation
          .mascotInteraction
          .cleanup();
      };
    }, [
      isOpen,
      totalSparks,
      hideSparks,
    ]);

    // =========================================================
    // Close / Continue
    // =========================================================

    const handleClose = () => {
      if (isExiting) return;

      setIsExiting(true);

      cleanupConfetti();

      ZuvyRewardAnimation
        .mascotInteraction
        .cleanup();

      window.setTimeout(() => {
        onClose();
        onContinue?.();
      }, 250);
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
        onClick={handleClose}
      >
        <div
          className={`reward-popup ${isExiting
              ? 'exiting'
              : ''
            }`}
          ref={popupRef}
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          {/* ===================================================
            1. Success Badge
        =================================================== */}

          <div
            className="reward-badge"
            ref={badgeRef}
          >
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
          </div>

          {/* ===================================================
            2. Heading
        =================================================== */}

          <h3 className="reward-title">
            Chapter Completed!
          </h3>

          <p className="reward-subtitle">
            {chapterTitle}
          </p>

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

          <Button
            className={`reward-continue-btn ${canContinue
                ? 'visible'
                : ''
              }`}
            ref={continueBtnRef}
            onClick={handleClose}
          >
            Continue →
          </Button>
        </div>
      </div>
    );
  };

export default ZuvyRewardModal;