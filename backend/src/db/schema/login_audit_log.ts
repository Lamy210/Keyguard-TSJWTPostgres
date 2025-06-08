import {
  pgTable,
  bigserial,
  uuid,
  varchar,
  inet,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./user";

export const loginAuditLogs = pgTable("login_audit_logs", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userUuid: uuid("user_uuid").references(() => users.uuid, {
    onDelete: "cascade",
  }),
  eventType: varchar("event_type", { length: 50 }),
  ipAddress: inet("ip_address"),
  userAgent: text("user_agent"),
  eventAt: timestamp("event_at", { withTimezone: true }).defaultNow(),
});
