create table if not exists "stripe".coupons (
    id text primary key,
    object text,
    name text,
    valid boolean,
    created integer,
    updated integer,
    currency text,
    duration text,
    livemode boolean,
    metadata jsonb,
    redeem_by integer,
    amount_off bigint,
    percent_off double precision,
    times_redeemed bigint,
    max_redemptions bigint,
    duration_in_months bigint,
    percent_off_precise double precision,
    updated_at timestamptz default timezone('utc'::text, now()) not null,
    last_synced_at timestamptz
);

create trigger handle_updated_at
    before update
    on stripe.coupons
    for each row
    execute procedure set_updated_at();
