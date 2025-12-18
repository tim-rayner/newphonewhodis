"use client";

import { ReactNode } from "react";
import { DefaultHeader } from "./DefaultHeader";

interface MainPageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function MainPageLayout({
  children,
  showHeader = true,
}: MainPageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {showHeader && <DefaultHeader />}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
