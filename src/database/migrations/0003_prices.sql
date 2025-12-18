create table if not exists "stripe"."prices" (
  "id" text primary key,
  "object" text,
  "active" boolean,
  "currency" text,
  "metadata" jsonb,
  "nickname" text,
  "recurring" jsonb,
  "type" stripe.pricing_type,
  "unit_amount" integer,
  "billing_scheme" text,
  "created" integer,
  "livemode" boolean,
  "lookup_key" text,
  "tiers_mode" stripe.pricing_tiers,
  "transform_quantity" jsonb,
  "unit_amount_decimal" text,
  "product" text,
  "updated_at" timestamptz default timezone('utc'::text, now()) not null,
  "last_synced_at" timestamptz
);

create trigger handle_updated_at
    before update
    on stripe.prices
    for each row
    execute procedure set_updated_at();