create table if not exists "stripe".payouts (
    id text primary key,
    object text,
    date text,
    type text,
    amount bigint,
    method text,
    status text,
    created integer,
    updated integer,
    currency text,
    livemode boolean,
    metadata jsonb,
    automatic boolean,
    recipient text,
    description text,
    destination text,
    source_type text,
    arrival_date text,
    bank_account jsonb,
    failure_code text,
    transfer_group text,
    amount_reversed bigint,
    failure_message text,
    source_transaction text,
    balance_transaction text,
    statement_descriptor text,
    statement_description text,
    failure_balance_transaction text,
    updated_at timestamptz default timezone('utc'::text, now()) not null,
    last_synced_at timestamptz
);

create trigger handle_updated_at
    before update
    on stripe.payouts
    for each row
    execute procedure set_updated_at();
