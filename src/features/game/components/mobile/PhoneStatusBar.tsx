"use client";

import { cn } from "@/lib/utils";

interface PhoneStatusBarProps {
  className?: string;
  variant?: "light" | "dark";
}

/**
 * iOS-style status bar with time, signal, and battery
 * Used inside PhoneFrame to create authentic mobile feel
 */
export function PhoneStatusBar({
  className,
  variant = "dark",
}: PhoneStatusBarProps) {
  // Get current time formatted like iOS
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const textColor = variant === "dark" ? "text-white" : "text-black";

  return (
    <div
      className={cn(
        "flex items-center justify-between px-6 py-2 text-xs font-medium",
        textColor,
        className
      )}
    >
      {/* Left side - Time */}
      <span className="font-semibold">{time}</span>

      {/* Center - Dynamic Island / Notch placeholder */}
      <div className="absolute left-1/2 -translate-x-1/2 top-2">
        <div className="w-24 h-6 bg-black rounded-full" />
      </div>

      {/* Right side - Signal, WiFi, Battery */}
      <div className="flex items-center gap-1.5">
        {/* Signal bars */}
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <rect x="2" y="16" width="3" height="6" rx="1" />
          <rect x="7" y="12" width="3" height="10" rx="1" />
          <rect x="12" y="8" width="3" height="14" rx="1" />
          <rect x="17" y="4" width="3" height="18" rx="1" />
        </svg>

        {/* WiFi icon */}
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0-4c2.21 0 4 1.79 4 4h-2c0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4zm0-4c3.31 0 6 2.69 6 6h-2c0-2.21-1.79-4-4-4s-4 1.79-4 4H6c0-3.31 2.69-6 6-6zm0-4c4.42 0 8 3.58 8 8h-2c0-3.31-2.69-6-6-6s-6 2.69-6 6H4c0-4.42 3.58-8 8-8z" />
        </svg>

        {/* Battery */}
        <div className="flex items-center">
          <div className="w-6 h-3 border border-current rounded-sm relative">
            <div
              className="absolute inset-0.5 bg-current rounded-[1px]"
              style={{ width: "85%" }}
            />
          </div>
          <div className="w-0.5 h-1.5 bg-current rounded-r-sm ml-px" />
        </div>
      </div>
    </div>
  );
}
