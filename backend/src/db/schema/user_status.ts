import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./user";

export const userStatusEnum = pgEnum("user_status_enum", [
  "active",
  "inactive",
  "banned",
  "pending",
  "deleted",
]);

export const userStatus = pgTable("user_status", {
  userUuid: uuid("user_uuid")
    .primaryKey()
    .references(() => users.uuid, { onDelete: "cascade" }),
  status: userStatusEnum("status").default("active"),
  deactivatedAt: timestamp("deactivated_at", { withTimezone: true }),
  reason: text("reason"),
});
