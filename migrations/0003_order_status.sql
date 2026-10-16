alter table orders add column if not exists status text not null default 'new';
