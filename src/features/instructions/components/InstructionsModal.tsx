"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle } from "lucide-react";
import { InstructionsContent } from "./InstructionsContent";

interface InstructionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstructionsModal({
  open,
  onOpenChange,
}: InstructionsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] p-0 gap-0 bg-background border-border rounded-2xl overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-message-green rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-left">How to Play</DialogTitle>
              <DialogDescription className="text-left text-xs">
                Quick guide to get you started
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(85vh-80px)]">
          <div className="p-4">
            <InstructionsContent variant="modal" />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
