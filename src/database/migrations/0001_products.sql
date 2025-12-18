create table if not exists "stripe"."products" (
  "id" text primary key,
  "object" text,
  "active" boolean,
  "description" text,
  "metadata" jsonb,
  "name" text,
  "created" integer,
  "images" jsonb,
  "livemode" boolean,
  "package_dimensions" jsonb,
  "shippable" boolean,
  "statement_descriptor" text,
  "unit_label" text,
  "updated" integer,
  "url" text,
  "marketing_features" jsonb,
  "default_price" text,
  "updated_at" timestamptz default timezone('utc'::text, now()) not null,
  "last_synced_at" timestamptz
);

create trigger handle_updated_at
    before update
    on stripe.products
    for each row
    execute procedure set_updated_at();