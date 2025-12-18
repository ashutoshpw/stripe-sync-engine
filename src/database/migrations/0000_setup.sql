create schema if not exists "stripe";

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pricing_type') THEN
        create type "stripe"."pricing_type" as enum ('one_time', 'recurring');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pricing_tiers') THEN
        create type "stripe"."pricing_tiers" as enum ('graduated', 'volume');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        create type "stripe"."subscription_status" as enum (
            'trialing',
            'active',
            'canceled',
            'incomplete',
            'incomplete_expired',
            'past_due',
            'unpaid',
            'paused'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
        create type "stripe"."invoice_status" as enum ('draft', 'open', 'paid', 'uncollectible', 'void', 'deleted');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_schedule_status') THEN
        create type "stripe"."subscription_schedule_status" as enum ('not_started', 'active', 'completed', 'released', 'canceled');
    END IF;
END
$$;

create or replace function set_updated_at() returns trigger
    language plpgsql
as
$$
begin
  new.updated_at = now();
  return NEW;
end;
$$;

