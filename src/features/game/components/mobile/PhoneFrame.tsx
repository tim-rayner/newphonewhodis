"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronLeft, Video } from "lucide-react";
import { ReactNode } from "react";
import { PhoneStatusBar } from "./PhoneStatusBar";

interface PhoneFrameProps {
  children: ReactNode;
  hostName?: string;
  hostAvatar?: string | null;
  className?: string;
  showHeader?: boolean;
  isUrgent?: boolean; // For timer running out effect
  variant?: "default" | "compact";
}

/**
 * iPhone-style phone frame container
 * Creates authentic iMessage/WhatsApp feel for card displays
 */
export function PhoneFrame({
  children,
  hostName = "Unknown",
  hostAvatar,
  className,
  showHeader = true,
  isUrgent = false,
  variant = "default",
}: PhoneFrameProps) {
  const initials = hostName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      className={cn(
        "relative mx-auto w-full max-w-sm",
        // Phone frame outer shell
        "bg-[#1c1c1e] rounded-[2.5rem] p-2",
        // Shadow for depth
        "shadow-2xl shadow-black/50",
        // Urgent pulsing border when timer is low
        isUrgent && "ring-2 ring-red-500 animate-pulse",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Phone screen */}
      <div
        className={cn(
          "relative bg-black rounded-[2rem] overflow-hidden",
          variant === "compact" ? "min-h-[400px]" : "min-h-[500px]"
        )}
      >
        {/* Status bar */}
        <PhoneStatusBar className="relative z-10" />

        {/* Message app header */}
        {showHeader && (
          <div className="bg-[#1c1c1e]/95 backdrop-blur-xl border-b border-white/10 px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Back button */}
              <button className="flex items-center gap-0.5 text-[#0a84ff] text-sm">
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden xs:inline">Back</span>
              </button>

              {/* Contact info */}
              <div className="flex flex-col items-center">
                <Avatar className="h-8 w-8 mb-1">
                  {hostAvatar && (
                    <AvatarImage
                      src={hostAvatar}
                      alt={`${hostName}'s avatar`}
                    />
                  )}
                  <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white text-sm font-medium">
                  {hostName}
                </span>
                <span className="text-[#8e8e93] text-[10px]">iMessage</span>
              </div>

              {/* Video call button */}
              <button className="text-[#0a84ff]">
                <Video className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Message content area */}
        <div
          className={cn(
            "flex flex-col gap-3 p-4 overflow-y-auto",
            // Gradient background like iMessage
            "bg-gradient-to-b from-black to-[#0a0a0a]",
            variant === "compact" ? "min-h-[280px]" : "min-h-[360px]"
          )}
        >
          {children}
        </div>

        {/* Home indicator bar */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <div className="w-32 h-1 bg-white/30 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}

