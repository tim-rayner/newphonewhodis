"use client";

import { usePlayerIdentity } from "@/features/player/hooks/usePlayerIdentity";
import { ReactNode } from "react";

export function AppLayout({ children }: { children: ReactNode }) {
  // Initialize player identity on app load
  usePlayerIdentity();

  return <>{children}</>;
}
