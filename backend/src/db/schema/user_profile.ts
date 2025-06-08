import { pgTable, uuid, varchar, text } from "drizzle-orm/pg-core";
import { users } from "./user";

export const userProfiles = pgTable("user_profiles", {
  userUuid: uuid("user_uuid")
    .primaryKey()
    .references(() => users.uuid, { onDelete: "cascade" }),
  username: varchar("username", { length: 50 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }),
  avatarObjectKey: text("avatar_object_key"),
  bio: text("bio"),
});
