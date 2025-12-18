create table if not exists "stripe"."subscription_items" (
  "id" text primary key,
  "object" text,
  "billing_thresholds" jsonb,
  "created" integer,
  "deleted" boolean,
  "metadata" jsonb,
  "quantity" integer,
  "price" text,
  "subscription" text,
  "tax_rates" jsonb,
  "current_period_end" integer,
  "current_period_start" integer,
  "updated_at" timestamptz default timezone('utc'::text, now()) not null,
  "last_synced_at" timestamptz
);

create trigger handle_updated_at
    before update
    on stripe.subscription_items
    for each row
    execute procedure set_updated_at();
