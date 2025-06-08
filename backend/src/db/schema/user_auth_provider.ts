import {
  bigserial,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { bytea } from "../custom-types";
import { users } from "./user";

export const userAuthProviders = pgTable(
  "user_auth_providers",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userUuid: uuid("user_uuid")
      .notNull()
      .references(() => users.uuid, { onDelete: "cascade" }),
    providerName: varchar("provider_name", { length: 50 }).notNull(),
    externalUserId: varchar("external_user_id", { length: 255 }).notNull(),
    accessToken: bytea("access_token"),
    refreshToken: bytea("refresh_token"),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    uniqueProvider: uniqueIndex("user_auth_providers_uq").on(
      table.providerName,
      table.externalUserId,
    ),
  }),
);
