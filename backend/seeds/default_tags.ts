// seeds/default_tags.ts
import type { Knex } from "knex";

const DEFAULT_TAGS = [
  "birthday",
  "dashain",
  "graduation",
  "marriage",
  "gathering",
  "concert",
  "sports",
  "conference",
  "festival",
  "workshop",
];

export async function seed(knex: Knex): Promise<void> {
  await knex("tags").del();
  await knex("tags").insert(DEFAULT_TAGS.map((name) => ({ name })));
}
