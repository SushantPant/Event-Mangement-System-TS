import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("event_tags_mapping", (table) => {
    table.increments("id").primary();
    table.integer("event_id").unsigned().notNullable();
    table.integer("tag_id").unsigned().notNullable();
    table.foreign("event_id").references("events.id").onDelete("CASCADE");
    table.foreign("tag_id").references("tags.id").onDelete("CASCADE");
    table.unique(["event_id", "tag_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("event_tags_mapping");
}
