"use client";

import { ReactNode } from "react";
import { DefaultHeader } from "./DefaultHeader";

export function MainPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <DefaultHeader />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

