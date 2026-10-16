create table if not exists orders (
  id text primary key,
  user_id text not null,
  payload text not null,
  total integer not null,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_idx on orders (user_id, created_at desc);
