import {
  bigserial,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./user";

export const userDevices = pgTable(
  "user_devices",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userUuid: uuid("user_uuid")
      .notNull()
      .references(() => users.uuid, { onDelete: "cascade" }),
    deviceFingerprint: varchar("device_fingerprint", { length: 255 }).notNull(),
    deviceName: varchar("device_name", { length: 100 }),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    uniqueDevice: uniqueIndex("user_devices_uq").on(
      table.userUuid,
      table.deviceFingerprint,
    ),
  }),
);
