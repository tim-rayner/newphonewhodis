"use client";

import { useParams } from "next/navigation";

export default function GamePage() {
  const { id } = useParams();

  console.log("🚀 game id: ", id);
  return <div>GamePage for game id: {id}</div>;
}
