"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/external/trpc/client";
import { usePlayerIdentity } from "@/features/player/hooks/usePlayerIdentity";
import { useRouter } from "next/navigation";
import { startGameFormSchema, type StartGameFormInput } from "../types/schema";

export default function StartGame() {
  const playerId = usePlayerIdentity();
  const router = useRouter();
  const createGameMutation = trpc.startGame.create.useMutation({
    onSuccess: (data) => {
      console.log(
        "🥳 game created successfully: ",
        JSON.stringify(data, null, 2)
      );
      router.push(`/game/${data.id}`);
    },
    onError: (error) => {
      console.log("❌ error creating game: ", error.message);
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
      console.log("❌ player id is required");
      return;
    }
    createGameMutation.mutate({
      playerName: data.playerName,
      playerId: playerId,
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <Input
          {...register("playerName")}
          placeholder="Enter your name"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        {errors.playerName && (
          <p className="text-red-500">{errors.playerName.message}</p>
        )}
        <Button type="submit" disabled={createGameMutation.isPending}>
          {createGameMutation.isPending ? "Starting game..." : "Start Game"}
        </Button>
      </form>
    </div>
  );
}
