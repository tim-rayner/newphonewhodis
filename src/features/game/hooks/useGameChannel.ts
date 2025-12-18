"use client";

import { createClient } from "@/external/supabase/client";
import type { GameSnapshotSchema } from "@/features/game/types/schema";
import { gameSnapshotSchema } from "@/features/game/types/schema";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

interface UseGameChannelOptions {
  gameId: string;
  onStateUpdate: (state: GameSnapshotSchema) => void;
  onGameEnded?: () => void;
}

interface UseGameChannelReturn {
  connectionStatus: ConnectionStatus;
  reconnect: () => void;
}

/**
 * Hook to manage Supabase Broadcast subscription for game state updates
 * Provides connection status and automatic reconnection
 */
export function useGameChannel({
  gameId,
  onStateUpdate,
  onGameEnded,
}: UseGameChannelOptions): UseGameChannelReturn {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient());
  const onStateUpdateRef = useRef(onStateUpdate);
  const onGameEndedRef = useRef(onGameEnded);

  // Keep the callback refs updated
  useEffect(() => {
    onStateUpdateRef.current = onStateUpdate;
    onGameEndedRef.current = onGameEnded;
  });

  useEffect(() => {
    const supabase = supabaseRef.current;

    // Clean up existing channel if any
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`game-${gameId}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on("broadcast", { event: "game_state" }, ({ payload }) => {
        // Validate the incoming state
        const parsed = gameSnapshotSchema.safeParse(payload.state);
        if (parsed.success) {
          onStateUpdateRef.current(parsed.data);
        } else {
          console.error("Invalid game state received:", parsed.error);
        }
      })
      .on("broadcast", { event: "game_ended" }, () => {
        // Game has been ended by host - trigger redirect
        onGameEndedRef.current?.();
      })
      .subscribe((status) => {
        switch (status) {
          case "SUBSCRIBED":
            setConnectionStatus("connected");
            break;
          case "CLOSED":
            setConnectionStatus("disconnected");
            break;
          case "CHANNEL_ERROR":
            setConnectionStatus("error");
            break;
          case "TIMED_OUT":
            setConnectionStatus("error");
            break;
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const reconnect = useCallback(() => {
    const supabase = supabaseRef.current;

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Reset status and resubscribe
    setConnectionStatus("connecting");

    const channel = supabase
      .channel(`game-${gameId}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on("broadcast", { event: "game_state" }, ({ payload }) => {
        const parsed = gameSnapshotSchema.safeParse(payload.state);
        if (parsed.success) {
          onStateUpdateRef.current(parsed.data);
        } else {
          console.error("Invalid game state received:", parsed.error);
        }
      })
      .on("broadcast", { event: "game_ended" }, () => {
        // Game has been ended by host - trigger redirect
        onGameEndedRef.current?.();
      })
      .subscribe((status) => {
        switch (status) {
          case "SUBSCRIBED":
            setConnectionStatus("connected");
            break;
          case "CLOSED":
            setConnectionStatus("disconnected");
            break;
          case "CHANNEL_ERROR":
            setConnectionStatus("error");
            break;
          case "TIMED_OUT":
            setConnectionStatus("error");
            break;
        }
      });

    channelRef.current = channel;
  }, [gameId]);

  return {
    connectionStatus,
    reconnect,
  };
}

