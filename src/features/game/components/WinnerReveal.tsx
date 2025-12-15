"use client";

import {
  cardHasImage,
  getPromptCard,
  getReplyCard,
  getReplyDisplayText,
} from "@/features/game/assets/cards";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { ImageMessage } from "./mobile/ImageMessage";
import { TypingIndicator } from "./mobile/MessageBubble";
import { PhoneFrame } from "./mobile/PhoneFrame";

interface WinnerRevealProps {
  winnerName: string;
  winningCardId: string;
  promptCardId?: string;
  promptText?: string;
  onComplete?: () => void;
  autoHideAfter?: number; // milliseconds
}

interface ConfettiParticle {
  id: number;
  colorClass: string;
  initialX: string;
  initialScale: number;
  animateX: string;
  rotateDirection: number;
  duration: number;
  delay: number;
}

const CONFETTI_COLORS = [
  "bg-yellow-400",
  "bg-pink-400",
  "bg-blue-400",
  "bg-green-400",
  "bg-purple-400",
  "bg-orange-400",
  "bg-red-400",
  "bg-cyan-400",
];

// Pre-generated deterministic confetti particles based on index
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const CONFETTI_PARTICLES: ConfettiParticle[] = Array.from({ length: 60 }).map(
  (_, i) => ({
    id: i,
    colorClass: CONFETTI_COLORS[i % 8],
    initialX: `${seededRandom(i) * 100}%`,
    initialScale: 0.5 + seededRandom(i + 100) * 0.5,
    animateX: `${seededRandom(i + 200) * 100}%`,
    rotateDirection: seededRandom(i + 300) > 0.5 ? 1 : -1,
    duration: 2 + seededRandom(i + 400) * 2,
    delay: seededRandom(i + 500) * 0.5,
  })
);

type RevealStage = "entering" | "prompt" | "typing" | "reply" | "celebration";

/**
 * Grand reveal celebration when a round winner is announced
 * Uses PhoneFrame with iMessage-style reveal sequence
 */
export function WinnerReveal({
  winnerName,
  winningCardId,
  promptCardId,
  promptText = "...",
  onComplete,
  autoHideAfter = 6000,
}: WinnerRevealProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [stage, setStage] = useState<RevealStage>("entering");

  // Orchestrate the reveal sequence
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Stage 1: Phone enters (0ms)
    timers.push(setTimeout(() => setStage("prompt"), 500));

    // Stage 2: Show prompt (500ms)
    timers.push(setTimeout(() => setStage("typing"), 1200));

    // Stage 3: Show typing indicator (1200ms)
    timers.push(setTimeout(() => setStage("reply"), 2500));

    // Stage 4: Show reply (2500ms)
    timers.push(setTimeout(() => setStage("celebration"), 3000));

    // Auto-hide
    timers.push(
      setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, autoHideAfter)
    );

    return () => timers.forEach(clearTimeout);
  }, [autoHideAfter, onComplete]);

  const handleDismiss = () => {
    setIsVisible(false);
    onComplete?.();
  };

  const replyText = getReplyDisplayText(winningCardId);
  const replyCard = getReplyCard(winningCardId);
  const promptCard = promptCardId ? getPromptCard(promptCardId) : null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={handleDismiss}
        >
          {/* Confetti particles - appear during celebration */}
          <AnimatePresence>
            {stage === "celebration" && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {CONFETTI_PARTICLES.map((particle) => (
                  <motion.div
                    key={particle.id}
                    className={cn(
                      "absolute w-3 h-3 rounded-sm",
                      particle.colorClass
                    )}
                    initial={{
                      x: particle.initialX,
                      y: "-10%",
                      rotate: 0,
                      scale: particle.initialScale,
                      opacity: 1,
                    }}
                    animate={{
                      y: "120%",
                      rotate: 720 * particle.rotateDirection,
                      x: particle.animateX,
                      opacity: [1, 1, 0],
                    }}
                    transition={{
                      duration: particle.duration,
                      delay: particle.delay,
                      ease: "easeIn",
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Main content */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
            }}
            className="relative flex flex-col items-center gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Phone Frame with message reveal */}
            <PhoneFrame
              hostName={winnerName}
              variant="compact"
              showHeader={true}
            >
              {/* Prompt message */}
              <AnimatePresence>
                {(stage === "prompt" ||
                  stage === "typing" ||
                  stage === "reply" ||
                  stage === "celebration") && (
                  <ImageMessage
                    type="prompt"
                    text={promptText}
                    cardId={promptCardId || "unknown"}
                    hasImage={cardHasImage(promptCard)}
                    isRead
                    delay={0}
                  />
                )}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {stage === "typing" && <TypingIndicator />}
              </AnimatePresence>

              {/* Reply message */}
              <AnimatePresence>
                {(stage === "reply" || stage === "celebration") && (
                  <ImageMessage
                    type="reply"
                    text={replyText}
                    cardId={winningCardId}
                    hasImage={cardHasImage(replyCard)}
                    isDelivered
                    isRead
                    isWinner={stage === "celebration"}
                    delay={0}
                  />
                )}
              </AnimatePresence>
            </PhoneFrame>

            {/* Winner announcement */}
            <AnimatePresence>
              {stage === "celebration" && (
                <motion.div
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center gap-3"
                >
                  {/* Trophy icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/50"
                  >
                    <Trophy className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Winner text */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                  >
                    <p className="text-white/70 text-sm mb-1">Round Winner</p>
                    <h2 className="text-3xl font-bold text-white">
                      {winnerName}
                    </h2>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tap to dismiss hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: stage === "celebration" ? 0.6 : 0 }}
              transition={{ delay: 1 }}
              className="text-white/50 text-xs"
            >
              Tap anywhere to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
