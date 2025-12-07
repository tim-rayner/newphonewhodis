"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/external/trpc/client";
import { startGameSchema, type StartGameInput } from "../types/schema";

export default function StartGame() {
  const createGame = trpc.startGame.create.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StartGameInput>({
    resolver: zodResolver(startGameSchema),
  });

  const onSubmit = (data: StartGameInput) => {
    createGame.mutate(data);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <Input {...register("playerName")} placeholder="Enter your name" />
        {errors.playerName && (
          <p className="text-red-500">{errors.playerName.message}</p>
        )}
        <Button type="submit">Start Game</Button>
      </form>
    </div>
  );
}
