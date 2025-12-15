"use client";

import { Button } from "@/components/ui/button";
import type { ConnectionStatus as ConnectionStatusType } from "@/features/game/hooks";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";

interface ConnectionStatusProps {
  status: ConnectionStatusType;
  onReconnect?: () => void;
}

const statusConfig: Record<
  ConnectionStatusType,
  { color: string; bgColor: string; label: string; icon: typeof Wifi }
> = {
  connecting: {
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    label: "Connecting...",
    icon: Wifi,
  },
  connected: {
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    label: "Connected",
    icon: Wifi,
  },
  disconnected: {
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    label: "Disconnected",
    icon: WifiOff,
  },
  error: {
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    label: "Connection Error",
    icon: WifiOff,
  },
};

/**
 * Visual indicator for realtime connection status
 */
export function ConnectionStatus({
  status,
  onReconnect,
}: ConnectionStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const showReconnect = status === "disconnected" || status === "error";

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
        config.bgColor,
        config.color
      )}
    >
      {status === "connecting" ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </motion.div>
      ) : (
        <Icon className="w-3.5 h-3.5" />
      )}

      <span className="font-medium">{config.label}</span>

      {showReconnect && onReconnect && (
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-2 text-xs"
          onClick={onReconnect}
        >
          Retry
        </Button>
      )}

      {status === "connected" && (
        <motion.div
          className="w-2 h-2 rounded-full bg-green-500"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}
    </div>
  );
}
