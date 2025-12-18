create table if not exists "stripe"."plans" (
    id text primary key,
    object text,
    active boolean,
    amount bigint,
    created integer,
    product text,
    currency text,
    "interval" text,
    livemode boolean,
    metadata jsonb,
    nickname text,
    tiers_mode text,
    usage_type text,
    billing_scheme text,
    interval_count bigint,
    aggregate_usage text,
    transform_usage text,
    trial_period_days bigint,
    "updated_at" timestamptz default timezone('utc'::text, now()) not null,
    "last_synced_at" timestamptz
);

create trigger handle_updated_at
    before update
    on stripe.plans
    for each row
    execute procedure set_updated_at();
