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
  /** Called after successful reconnection to fetch and sync latest state from DB */
  onSyncState?: () => Promise<void>;
}

interface UseGameChannelReturn {
  connectionStatus: ConnectionStatus;
  reconnect: () => void;
  /** Manually trigger a state sync from the database */
  syncState: () => Promise<void>;
}

/**
 * Hook to manage Supabase Broadcast subscription for game state updates
 * Provides connection status and automatic reconnection with state sync
 */
export function useGameChannel({
  gameId,
  onStateUpdate,
  onGameEnded,
  onSyncState,
}: UseGameChannelOptions): UseGameChannelReturn {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient());
  const onStateUpdateRef = useRef(onStateUpdate);
  const onGameEndedRef = useRef(onGameEnded);
  const onSyncStateRef = useRef(onSyncState);
  // Track if this is a reconnection (not initial connection)
  const hasConnectedOnceRef = useRef(false);
  const isReconnectingRef = useRef(false);

  // Keep the callback refs updated
  useEffect(() => {
    onStateUpdateRef.current = onStateUpdate;
    onGameEndedRef.current = onGameEnded;
    onSyncStateRef.current = onSyncState;
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
      .subscribe(async (status) => {
        switch (status) {
          case "SUBSCRIBED":
            setConnectionStatus("connected");
            // If this is a reconnection, sync state from database
            if (hasConnectedOnceRef.current && isReconnectingRef.current) {
              isReconnectingRef.current = false;
              try {
                await onSyncStateRef.current?.();
              } catch (error) {
                console.error(
                  "Failed to sync state after reconnection:",
                  error
                );
              }
            }
            hasConnectedOnceRef.current = true;
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

  // Manual state sync - can be called independently
  const syncState = useCallback(async () => {
    try {
      await onSyncStateRef.current?.();
    } catch (error) {
      console.error("Failed to sync state:", error);
    }
  }, []);

  // Periodic state sync heartbeat - catches any missed broadcasts
  // Only runs while connected, every 30 seconds
  useEffect(() => {
    if (connectionStatus !== "connected") {
      return;
    }

    const HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds

    const intervalId = setInterval(async () => {
      try {
        await onSyncStateRef.current?.();
      } catch (error) {
        console.error("Heartbeat state sync failed:", error);
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [connectionStatus]);

  const reconnect = useCallback(() => {
    const supabase = supabaseRef.current;

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Mark that we're reconnecting so we sync state after SUBSCRIBED
    isReconnectingRef.current = true;

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
      .subscribe(async (status) => {
        switch (status) {
          case "SUBSCRIBED":
            setConnectionStatus("connected");
            // Sync state from database after reconnection
            if (isReconnectingRef.current) {
              isReconnectingRef.current = false;
              try {
                await onSyncStateRef.current?.();
              } catch (error) {
                console.error(
                  "Failed to sync state after reconnection:",
                  error
                );
              }
            }
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
    syncState,
  };
}
