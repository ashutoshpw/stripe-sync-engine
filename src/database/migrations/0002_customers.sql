create table if not exists "stripe"."customers" (
  "id" text primary key,
  "object" text,
  "address" jsonb,
  "description" text,
  "email" text,
  "metadata" jsonb,
  "name" text,
  "phone" text,
  "shipping" jsonb,
  "balance" integer,
  "created" integer,
  "currency" text,
  "default_source" text,
  "delinquent" boolean,
  "discount" jsonb,
  "invoice_prefix" text,
  "invoice_settings" jsonb,
  "livemode" boolean,
  "next_invoice_sequence" integer,
  "preferred_locales" jsonb,
  "tax_exempt" text,
  "deleted" boolean default false not null,
  "updated_at" timestamptz default timezone('utc'::text, now()) not null,
  "last_synced_at" timestamptz
);

create trigger handle_updated_at
    before update
    on stripe.customers
    for each row
    execute procedure set_updated_at();