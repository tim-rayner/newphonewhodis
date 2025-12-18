"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Crown,
  Gavel,
  MessageCircle,
  Shuffle,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { ReactNode } from "react";

// Demo message bubble for visual examples
function DemoBubble({
  text,
  isOutgoing,
  className,
}: {
  text: string;
  isOutgoing: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-3 py-2 rounded-xl text-sm max-w-[180px]",
        isOutgoing
          ? "bg-message-green text-white rounded-br-sm"
          : "bg-secondary text-foreground rounded-bl-sm",
        className
      )}
    >
      {text}
    </div>
  );
}

// Section component for consistent styling
function Section({
  icon,
  title,
  badge,
  children,
  delay = 0,
}: {
  icon: ReactNode;
  title: string;
  badge?: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {badge && (
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        )}
      </div>
      <div className="pl-10 space-y-2 text-muted-foreground">{children}</div>
    </motion.div>
  );
}

// Step indicator
function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">
        {number}
      </div>
      <p className="text-sm leading-relaxed">{text}</p>
    </div>
  );
}

interface InstructionsContentProps {
  variant?: "page" | "modal";
}

export function InstructionsContent({
  variant = "page",
}: InstructionsContentProps) {
  const isModal = variant === "modal";

  return (
    <div
      className={cn(
        "space-y-6",
        isModal ? "px-1" : "px-4 py-6 max-w-lg mx-auto"
      )}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Party Game</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">How to Play</h2>
        <p className="text-sm text-muted-foreground">
          Think Cards Against Humanity meets group chat chaos
        </p>
      </motion.div>

      <Separator className="bg-border" />

      {/* The Vibe */}
      <Section
        icon={<MessageCircle className="w-4 h-4" />}
        title="The Vibe"
        delay={0.1}
      >
        <p className="text-sm leading-relaxed">
          Someone reads an awkward text scenario, and everyone else replies with
          the funniest response from their hand. The judge picks the winner.
          Simple. Chaotic. Hilarious.
        </p>
        <div className="flex flex-col gap-2 mt-3 p-3 bg-card rounded-xl">
          <DemoBubble text="I got you for secret Santa!" isOutgoing={false} />
          <DemoBubble
            text="I hate it when that happens"
            isOutgoing={true}
            className="self-end"
          />
        </div>
      </Section>

      {/* Setup */}
      <Section
        icon={<Users className="w-4 h-4" />}
        title="Setup"
        badge="2 min"
        delay={0.2}
      >
        <div className="space-y-3">
          <Step
            number={1}
            text="One player creates a game and shares the code"
          />
          <Step
            number={2}
            text="Everyone joins using the code (3+ players needed)"
          />
          <Step number={3} text="The host picks a random judge to start" />
        </div>
      </Section>

      {/* Gameplay */}
      <Section
        icon={<Zap className="w-4 h-4" />}
        title="Each Round"
        delay={0.3}
      >
        <div className="space-y-3">
          <Step
            number={1}
            text="The judge reveals a prompt card - some cringy, awkward, or absurd text scenario"
          />
          <Step
            number={2}
            text="Everyone else picks their funniest reply card from their hand"
          />
          <Step
            number={3}
            text="The judge reads all replies and crowns their favorite"
          />
          <Step
            number={4}
            text="Winner gets a point, new judge is picked, repeat!"
          />
        </div>
      </Section>

      {/* The Judge */}
      <Section
        icon={<Crown className="w-4 h-4" />}
        title="Being the Judge"
        delay={0.4}
      >
        <p className="text-sm leading-relaxed">
          When you&apos;re the judge, you don&apos;t play a card. Instead, you:
        </p>
        <ul className="list-disc list-inside text-sm space-y-1 mt-2">
          <li>Deal the cards to start each round</li>
          <li>Reveal the prompt for everyone to see</li>
          <li>Read the anonymous replies out loud (for maximum laughs)</li>
          <li>Pick the winner based purely on vibes</li>
        </ul>
        <div className="flex items-center gap-2 mt-3 p-2 bg-amber-500/10 rounded-lg">
          <Gavel className="w-4 h-4 text-amber-500" />
          <span className="text-xs text-amber-500">
            Pro tip: Reading replies dramatically makes everything 10x funnier
          </span>
        </div>
      </Section>

      {/* Winning */}
      <Section
        icon={<Trophy className="w-4 h-4" />}
        title="Winning"
        delay={0.5}
      >
        <p className="text-sm leading-relaxed">
          Play until someone hits the point goal (usually 5-7 points), or until
          everyone&apos;s sides hurt from laughing. The real winner is whoever
          made the group lose it the hardest.
        </p>
      </Section>

      <Separator className="bg-border" />

      {/* Pro Tips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2">
          <Shuffle className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Pro Tips</h3>
        </div>
        <div className="grid gap-2">
          <div className="flex items-start gap-2 p-2 bg-card rounded-lg">
            <span className="text-base">🎭</span>
            <p className="text-xs text-muted-foreground">
              Play to the judge&apos;s sense of humor - everyone laughs
              differently
            </p>
          </div>
          <div className="flex items-start gap-2 p-2 bg-card rounded-lg">
            <span className="text-base">🤫</span>
            <p className="text-xs text-muted-foreground">
              Keep your poker face - don&apos;t reveal which card is yours
            </p>
          </div>
          <div className="flex items-start gap-2 p-2 bg-card rounded-lg">
            <span className="text-base">😈</span>
            <p className="text-xs text-muted-foreground">
              Sometimes the weirdest answer wins over the obvious one
            </p>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center pt-4"
      >
        <p className="text-xs text-muted-foreground/60">
          Now go make your friends question your sense of humor
        </p>
      </motion.div>
    </div>
  );
}
