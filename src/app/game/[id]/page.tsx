"use client";

import Game from "@/features/game/components/Game";
import { useParams } from "next/navigation";

export default function GamePage() {
  const { id } = useParams<{ id: string }>();

  console.log("🚀 game id: ", id);
  return <Game gameId={id} />;
}
