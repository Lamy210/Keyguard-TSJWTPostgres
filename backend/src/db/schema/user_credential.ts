import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./user";

export const userCredentials = pgTable("user_credentials", {
  userUuid: uuid("user_uuid")
    .primaryKey()
    .references(() => users.uuid, { onDelete: "cascade" }),
  passwordHash: text("password_hash").notNull(),
  passwordChangedAt: timestamp("password_changed_at", {
    withTimezone: true,
  }).defaultNow(),
});
