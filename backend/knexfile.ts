import dotenv from "dotenv";
import { Knex } from "knex";

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: process.env.DB_CLIENT || "mysql2",
    connection: {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      database: process.env.DB_NAME || "emsdb",
      user: process.env.DB_USER || "emsuser",
      password: process.env.DB_PASSWORD || "emspassword",
    },
    migrations: {
      directory: "./migrations",
      extension: "ts",
    },
  },
};

export default config;
