import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./backend/src/db/schema/*.ts",
  out: "./drizzle",
});
