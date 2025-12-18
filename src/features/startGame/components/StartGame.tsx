"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/external/trpc/client";
import { usePlayerIdentity } from "@/features/player/hooks/usePlayerIdentity";
import { cn } from "@/lib/utils";
import { Loader2, Sparkles, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { startGameFormSchema, type StartGameFormInput } from "../types/schema";

export default function StartGame() {
  const playerId = usePlayerIdentity();
  const router = useRouter();
  const createGameMutation = trpc.startGame.create.useMutation({
    onSuccess: (data) => {
      router.push(`/game/${data?.id}`);
    },
    onError: (error) => {
      console.log("Error creating game: ", error.message);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StartGameFormInput>({
    resolver: zodResolver(startGameFormSchema),
  });

  const onSubmit = (data: StartGameFormInput) => {
    if (!playerId) {
      return;
    }
    createGameMutation.mutate({
      playerName: data.playerName,
      playerId: playerId,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Name input with icon */}
      <div className="relative">
        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          {...register("playerName")}
          placeholder="Enter your name"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="words"
          spellCheck={false}
          className="pl-12"
        />
      </div>

      {/* Error message */}
      {errors.playerName && (
        <p className={cn("text-sm text-destructive px-1", "animate-slide-up")}>
          {errors.playerName.message}
        </p>
      )}

      {/* Submit button */}
      <Button
        type="submit"
        size="lg"
        disabled={createGameMutation.isPending}
        className="w-full gap-2"
      >
        {createGameMutation.isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating game...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Create Game
          </>
        )}
      </Button>
    </form>
  );
}
