create table if not exists "stripe".events (
    id text primary key,
    object text,
    data jsonb,
    type text,
    created integer,
    request text,
    updated integer,
    livemode boolean,
    api_version text,
    pending_webhooks bigint,
    updated_at timestamptz default timezone('utc'::text, now()) not null,
    last_synced_at timestamptz
);

create trigger handle_updated_at
    before update
    on stripe.events
    for each row
    execute procedure set_updated_at();
