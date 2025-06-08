import { bigserial, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  uuid: uuid("uuid").primaryKey().defaultRandom(),
  id: bigserial("id", { mode: "number" }).unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});
