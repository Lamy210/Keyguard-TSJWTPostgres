import {
  integer,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { roles } from "./role";
import { users } from "./user";

export const userRoles = pgTable(
  "user_roles",
  {
    userUuid: uuid("user_uuid")
      .notNull()
      .references(() => users.uuid, { onDelete: "cascade" }),
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.roleId, { onDelete: "restrict" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    pk: primaryKey(table.userUuid, table.roleId),
  }),
);
