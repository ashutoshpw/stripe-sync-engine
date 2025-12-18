create table if not exists "stripe".disputes (
    id text primary key,
    object text,
    amount bigint,
    charge text,
    reason text,
    status text,
    created integer,
    updated integer,
    currency text,
    evidence jsonb,
    livemode boolean,
    metadata jsonb,
    evidence_details jsonb,
    balance_transactions jsonb,
    is_charge_refundable boolean,
    payment_intent text,
    updated_at timestamptz default timezone('utc'::text, now()) not null,
    last_synced_at timestamptz
);

create trigger handle_updated_at
    before update
    on stripe.disputes
    for each row
    execute procedure set_updated_at();

CREATE INDEX IF NOT EXISTS stripe_dispute_created_idx ON "stripe"."disputes" USING btree (created);
