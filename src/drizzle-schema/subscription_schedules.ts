import {
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core"
import { stripeSchema, subscriptionScheduleStatusEnum } from "./enums"

export const subscriptionSchedules = stripeSchema.table(
  "subscription_schedules",
  {
    id: text("id").primaryKey(),
    object: text("object"),
    application: text("application"),
    canceledAt: integer("canceled_at"),
    completedAt: integer("completed_at"),
    created: integer("created").notNull(),
    currentPhase: jsonb("current_phase"),
    customer: text("customer").notNull(),
    defaultSettings: jsonb("default_settings"),
    endBehavior: text("end_behavior"),
    livemode: boolean("livemode").notNull(),
    metadata: jsonb("metadata").notNull(),
    phases: jsonb("phases").notNull(),
    releasedAt: integer("released_at"),
    releasedSubscription: text("released_subscription"),
    status: subscriptionScheduleStatusEnum("status").notNull(),
    subscription: text("subscription"),
    testClock: text("test_clock"),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  }
)

