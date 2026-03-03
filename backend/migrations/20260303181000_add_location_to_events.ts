import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable("events", (table) => {
        table.string("location", 255).nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable("events", (table) => {
        table.dropColumn("location");
    });
}
