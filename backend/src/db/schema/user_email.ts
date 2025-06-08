import {
  pgTable,
  bigserial,
  uuid,
  varchar,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./user";

export const userEmails = pgTable(
  "user_emails",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userUuid: uuid("user_uuid")
      .notNull()
      .references(() => users.uuid, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    isVerified: boolean("is_verified").default(false),
    isPrimary: boolean("is_primary").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    primaryEmailUnique: uniqueIndex("user_emails_primary_unique")
      .on(table.userUuid)
      .where(sql`${table.isPrimary} = true`),
  }),
);
