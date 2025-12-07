"use client";

import { usePlayerIdentity } from "@/features/player/hooks/usePlayerIdentity";
import { ReactNode } from "react";

export function AppLayout({ children }: { children: ReactNode }) {
  const playerId = usePlayerIdentity();

  // useEffect(() => {
  //   if (playerId) {
  //     console.log("Welcome player:", playerId);
  //   }
  // }, [playerId]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 justify-center w-full">
            <h1 className="text-xl font-semibold">New Phone Who Dis?</h1>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
