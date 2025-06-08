import {
  bigserial,
  boolean,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { bytea } from "../custom-types";
import { users } from "./user";

export const userMfaFactors = pgTable(
  "user_mfa_factors",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userUuid: uuid("user_uuid")
      .notNull()
      .references(() => users.uuid, { onDelete: "cascade" }),
    factorType: varchar("factor_type", { length: 50 }).notNull(),
    factorData: bytea("factor_data"),
    isEnabled: boolean("is_enabled").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    uniqueMfa: uniqueIndex("user_mfa_factors_uq").on(
      table.userUuid,
      table.factorType,
    ),
  }),
);
