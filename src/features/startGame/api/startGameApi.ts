type Logger = { log: (error: string) => void };
const logger: Logger = { log: (error: string) => console.log(error) }; // TODO - replace with whatever logger we go for

// import supabase client (server side)
import { createClient } from "@/external/supabase/server";

export async function startGame(playerName: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("games").insert({ playerName });
  if (error) {
    logger.log(error.message);
    return { success: false, error: error.message };
  }
  return { success: true, data: data ?? null };
}
