"use client";

import { Button } from "@/components/ui/button";
import { trpc } from "@/external/trpc/client";
import { usePlayerIdentity } from "@/features/player/hooks/usePlayerIdentity";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { HelpCircle, MessageCircle, Play, Users } from "lucide-react";
import Link from "next/link";

// Animated message bubble for the illustration
function MessageBubbleDemo({
  text,
  isOutgoing,
  delay = 0,
}: {
  text: string;
  isOutgoing: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: isOutgoing ? 20 : -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className={cn(
        "px-4 py-2.5 rounded-2xl max-w-[200px] text-sm",
        isOutgoing
          ? "bg-message-green text-white self-end rounded-br-md"
          : "bg-secondary text-foreground self-start rounded-bl-md"
      )}
    >
      {text}
    </motion.div>
  );
}

// Phone illustration with animated messages
function PhoneIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-64 h-80 mx-auto"
    >
      {/* Phone frame */}
      <div className="absolute inset-0 bg-card rounded-[2.5rem] border-4 border-secondary shadow-elevated-lg overflow-hidden">
        {/* Status bar */}
        <div className="h-7 bg-background flex items-center justify-center">
          <div className="w-20 h-5 bg-secondary rounded-full" />
        </div>

        {/* Chat header */}
        <div className="h-12 bg-card border-b border-border flex items-center px-4 gap-3">
          <div className="w-8 h-8 rounded-full bg-message-green flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-foreground">Game Chat</span>
        </div>

        {/* Messages area */}
        <div className="flex-1 p-3 flex flex-col gap-2 bg-background">
          <MessageBubbleDemo
            text="I think we're in trouble..."
            isOutgoing={false}
            delay={0.3}
          />
          <MessageBubbleDemo
            text="Sound's like a you problem..."
            isOutgoing={true}
            delay={0.8}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="self-end flex items-center gap-1 mt-1"
          >
            <span className="text-2xs text-chat-timestamp">Winner!</span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.6, type: "spring" }}
              className="text-base"
            >
              🏆
            </motion.span>
          </motion.div>
        </div>
      </div>

      {/* Floating decorative elements */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-4 -right-4 w-12 h-12 bg-message-green/20 rounded-full flex items-center justify-center"
      >
        <span className="text-xl">😂</span>
      </motion.div>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute -bottom-2 -left-4 w-10 h-10 bg-message-blue/20 rounded-full flex items-center justify-center"
      >
        <span className="text-lg">💬</span>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const playerId = usePlayerIdentity();

  const { data: game } = trpc.player.getActiveHostedGames.useQuery({
    playerId: playerId ?? "",
  });

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-md mx-auto w-full">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-6 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-message-green rounded-2xl flex items-center justify-center shadow-elevated">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            New Phone Who Dis?
          </h1>
        </motion.div>

        {/* Phone illustration */}
        <div className="mb-8">
          <PhoneIllustration />
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-muted-foreground mb-8 text-base leading-relaxed"
        >
          The hilarious party game where your texts do the talking.
          <br />
          <span className="text-sm">
            Match prompts with the funniest replies!
          </span>
        </motion.p>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3 w-full"
        >
          <Link
            href={game ? `/game/${game.id}` : "/start-game"}
            className="w-full"
          >
            <Button size="lg" className="w-full gap-2">
              <Play className="w-5 h-5" />
              {game ? "Resume Game" : "Start New Game"}
            </Button>
          </Link>

          <Link href="/join-game" className="w-full">
            <Button variant="outline" size="lg" className="w-full gap-2">
              <Users className="w-5 h-5" />
              Join Game
            </Button>
          </Link>
        </motion.div>

        {/* How to play link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <Link
            href="/instructions"
            className={cn(
              "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground",
              "transition-colors duration-200 text-sm font-medium"
            )}
          >
            <HelpCircle className="w-4 h-4" />
            How to Play
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-2xs text-muted-foreground/60">
          A party game for 3+ players
        </p>
      </footer>
    </div>
  );
}
