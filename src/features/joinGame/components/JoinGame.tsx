"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/external/trpc/client";
import { usePlayerIdentity } from "@/features/player/hooks/usePlayerIdentity";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  checkAvailabilitySchema,
  CheckAvailabilitySchema,
  playerNameSchema,
  PlayerNameSchema,
} from "../types/schema";

type FormStep = 1 | 2;

export default function JoinGame() {
  const router = useRouter();
  const playerId = usePlayerIdentity();
  const [step, setStep] = useState<FormStep>(1);
  const [validatedGameCode, setValidatedGameCode] = useState<string>("");
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null
  );

  // Step 1: Game code form
  const gameCodeForm = useForm<CheckAvailabilitySchema>({
    resolver: zodResolver(checkAvailabilitySchema),
  });

  // Step 2: Player name form
  const nameForm = useForm<PlayerNameSchema>({
    resolver: zodResolver(playerNameSchema),
  });

  // Check availability mutation
  const checkAvailabilityMutation = trpc.joinGame.checkAvailability.useMutation(
    {
      onSuccess: (data) => {
        if (data.available) {
          setAvailabilityError(null);
          setValidatedGameCode(gameCodeForm.getValues("gameCode"));
          setStep(2);
        } else {
          setAvailabilityError(data.message);
        }
      },
      onError: (error) => {
        setAvailabilityError(error.message);
      },
    }
  );

  // Join game mutation
  const joinGameMutation = trpc.joinGame.join.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        router.push(`/game/${data.data.id}`);
      } else {
        setAvailabilityError(data.message);
      }
    },
    onError: (error) => {
      setAvailabilityError(error.message);
    },
  });

  // Step 1: Check game availability
  const onCheckAvailability = (data: CheckAvailabilitySchema) => {
    setAvailabilityError(null);
    checkAvailabilityMutation.mutate({ gameCode: data.gameCode });
  };

  // Step 2: Join the game
  const onJoinGame = (data: PlayerNameSchema) => {
    if (!playerId) {
      setAvailabilityError("Player ID not available. Please refresh the page.");
      return;
    }

    joinGameMutation.mutate({
      gameCode: validatedGameCode,
      player: {
        id: playerId,
        name: data.name,
      },
    });
  };

  // Go back to step 1
  const handleBack = () => {
    setStep(1);
    setAvailabilityError(null);
    nameForm.reset();
  };

  return (
    <div className="flex flex-col gap-4">
      {step === 1 && (
        <form
          onSubmit={gameCodeForm.handleSubmit(onCheckAvailability)}
          className="flex flex-col gap-3"
        >
          <Input
            {...gameCodeForm.register("gameCode")}
            placeholder="Enter game code"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          {gameCodeForm.formState.errors.gameCode && (
            <p className="text-red-500 text-sm">
              {gameCodeForm.formState.errors.gameCode.message}
            </p>
          )}
          {availabilityError && (
            <p className="text-red-500 text-sm">{availabilityError}</p>
          )}
          <Button type="submit" disabled={checkAvailabilityMutation.isPending}>
            {checkAvailabilityMutation.isPending
              ? "Checking..."
              : "Check Availability"}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form
          onSubmit={nameForm.handleSubmit(onJoinGame)}
          className="flex flex-col gap-3"
        >
          <p className="text-sm text-muted-foreground">
            Game code: <span className="font-mono">{validatedGameCode}</span>
          </p>
          <Input
            {...nameForm.register("name")}
            placeholder="Enter your name"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          {nameForm.formState.errors.name && (
            <p className="text-red-500 text-sm">
              {nameForm.formState.errors.name.message}
            </p>
          )}
          {availabilityError && (
            <p className="text-red-500 text-sm">{availabilityError}</p>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={joinGameMutation.isPending}
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={joinGameMutation.isPending}
              className="flex-1"
            >
              {joinGameMutation.isPending ? "Joining..." : "Join Game"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
