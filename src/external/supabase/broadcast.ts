import type { GameSnapshotSchema } from "@/features/game/types/schema";
import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client for broadcasting
// Uses service role key for server-to-server communication
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Broadcast game state to all players in the game channel
 * Called from server actions after DB updates
 */
export async function broadcastGameState(
  gameId: string,
  state: GameSnapshotSchema
): Promise<void> {
  const channel = supabaseAdmin.channel(`game-${gameId}`);

  await channel.send({
    type: "broadcast",
    event: "game_state",
    payload: { state },
  });

  // Clean up the channel after sending
  await supabaseAdmin.removeChannel(channel);
}
