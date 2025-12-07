import { faker } from "@faker-js/faker";
import { playerIdSchema } from "../schemas/playerIdSchema";

export function generateFunnyPlayerId(): string {
  const adjective = faker.word.adjective({ length: { min: 3, max: 6 } });
  const corporateCringe = faker.company.buzzNoun();
  const num = faker.number.int({ min: 1, max: 99 });

  const id = `${adjective.toLowerCase()}-${corporateCringe.toLowerCase()}-${num}`;

  const parsed = playerIdSchema.safeParse(id);
  if (!parsed.success) {
    return generateFunnyPlayerId();
  }

  return id;
}
