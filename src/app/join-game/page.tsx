"use client";

import { Button } from "@/components/ui/button";
import JoinGame from "@/features/joinGame/components/JoinGame";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Users } from "lucide-react";
import Link from "next/link";

export default function JoinGamePage() {
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
            <h1 className="text-lg font-semibold">Join Game</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-6"
        >
          {/* Icon */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4"
            >
              <Users className="w-8 h-8 text-primary" />
            </motion.div>
            <h2 className="text-xl font-bold text-foreground">Join a Game</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the game code shared by the host
            </p>
          </div>

          {/* Form */}
          <JoinGame />
        </motion.div>
      </main>
    </div>
  );
}
