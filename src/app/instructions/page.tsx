"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InstructionsContent } from "@/features/instructions";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function InstructionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-message-green rounded-lg flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold">How to Play</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="pb-safe"
          >
            <InstructionsContent variant="page" />
          </motion.div>
        </ScrollArea>
      </main>

      {/* Bottom CTA */}
      <div
        className={cn(
          "sticky bottom-0 p-4 bg-gradient-to-t from-background via-background to-transparent",
          "border-t border-border/50 pb-safe"
        )}
      >
        <div className="max-w-lg mx-auto flex gap-3">
          <Link href="/start-game" className="flex-1">
            <Button size="lg" className="w-full">
              Start Game
            </Button>
          </Link>
          <Link href="/join-game" className="flex-1">
            <Button variant="outline" size="lg" className="w-full">
              Join Game
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
