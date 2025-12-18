"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/external/trpc/client";
import { usePlayerIdentity } from "@/features/player/hooks/usePlayerIdentity";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Hash, Loader2, User } from "lucide-react";
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
          // If the current player is the host, skip step 2 and go directly to the game
          if (playerId && data.hostId === playerId) {
            router.push(`/game/${data.gameId}`);
            return;
          }
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
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={gameCodeForm.handleSubmit(onCheckAvailability)}
            className="flex flex-col gap-4"
          >
            {/* Game code input with icon */}
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                {...gameCodeForm.register("gameCode")}
                placeholder="Enter game code"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                className="pl-12 uppercase tracking-wider font-mono"
              />
            </div>

            {/* Error messages */}
            {gameCodeForm.formState.errors.gameCode && (
              <p className="text-sm text-destructive px-1 animate-slide-up">
                {gameCodeForm.formState.errors.gameCode.message}
              </p>
            )}
            {availabilityError && (
              <p className="text-sm text-destructive px-1 animate-slide-up">
                {availabilityError}
              </p>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              size="lg"
              disabled={checkAvailabilityMutation.isPending}
              className="w-full gap-2"
            >
              {checkAvailabilityMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Find Game
                </>
              )}
            </Button>
          </motion.form>
        )}

        {step === 2 && (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={nameForm.handleSubmit(onJoinGame)}
            className="flex flex-col gap-4"
          >
            {/* Game code badge */}
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-xl">
              <Check className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground">
                Game found:{" "}
                <span className="font-mono font-bold uppercase">
                  {validatedGameCode}
                </span>
              </span>
            </div>

            {/* Name input with icon */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                {...nameForm.register("name")}
                placeholder="Enter your name"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="words"
                spellCheck={false}
                className="pl-12"
                autoFocus
              />
            </div>

            {/* Error messages */}
            {nameForm.formState.errors.name && (
              <p className="text-sm text-destructive px-1 animate-slide-up">
                {nameForm.formState.errors.name.message}
              </p>
            )}
            {availabilityError && (
              <p className="text-sm text-destructive px-1 animate-slide-up">
                {availabilityError}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleBack}
                disabled={joinGameMutation.isPending}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={joinGameMutation.isPending}
                className="flex-1 gap-2"
              >
                {joinGameMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Game"
                )}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
