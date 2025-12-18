"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";

export function DefaultHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md safe-area-top">
      <div className="container mx-auto px-4 h-14 flex items-center justify-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <div className="w-8 h-8 bg-message-green rounded-lg flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold">New Phone Who Dis?</h1>
        </Link>
      </div>
    </header>
  );
}
