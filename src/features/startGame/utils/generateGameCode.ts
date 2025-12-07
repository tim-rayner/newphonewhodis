// utils/generateGameCode.ts
import { db } from "@/db";
import { games } from "@/db/schema";
import { eq } from "drizzle-orm";
import { codeWords } from "../consts/codeWords";

function randomElement<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function generateUniqueGameCode(): Promise<string> {
  let code = randomElement(codeWords);
  let exists = true;

  while (exists) {
    const existing = await db.query.games.findFirst({
      where: eq(games.code, code),
    });

    if (!existing) {
      exists = false;
    } else {
      code = randomElement(codeWords); // try again
    }
  }

  return code;
}
