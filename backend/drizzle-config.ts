import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/*.ts",
  out: "./drizzle",
  dbCredentials: {
    host: process.env.PGHOST || "postgres",
    port: Number(process.env.PGPORT) || 5432,
    user: process.env.PGUSER || "devuser",
    password: process.env.PGPASSWORD || "devpass",
    database: process.env.PGDATABASE || "devdb",
    ssl: false,
  },
});
