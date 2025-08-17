
-- Sherdor Mebel: jadval va RLS siyosatlari

create table if not exists public.tovarlar (
  id bigserial primary key,
  tovar_nomi text not null,
  qancha_oldi numeric default 0 not null,
  qancha_berdi numeric default 0 not null,
  qancha_qoldi numeric generated always as (qancha_oldi - qancha_berdi) stored,
  created_at timestamptz default now()
);

create table if not exists public.zakazlar (
  id bigserial primary key,
  tovar_turi text not null,
  raqami text not null,
  qancha_oldi numeric default 0 not null,
  qancha_berdi numeric default 0 not null,
  qancha_qoldi numeric generated always as (qancha_oldi - qancha_berdi) stored,
  qachon_berish_kerak date,
  created_at timestamptz default now()
);

create table if not exists public.mijozlar (
  id bigserial primary key,
  mijoz_nomi text not null,
  qancha_tovar_keltirdi numeric default 0 not null,
  qancha_lenta_urildi numeric default 0 not null,
  qancha_berdi numeric default 0 not null,
  qancha_qoldi numeric generated always as (qancha_tovar_keltirdi - qancha_berdi) stored,
  created_at timestamptz default now()
);

create table if not exists public.doimiy_mijozlar (
  id bigserial primary key,
  mijoz_nomi text not null,
  qancha_tovar_keltirdi numeric default 0 not null,
  qancha_lenta_urildi numeric default 0 not null,
  qancha_berdi numeric default 0 not null,
  qancha_qoldi numeric generated always as (qancha_tovar_keltirdi - qancha_berdi) stored,
  created_at timestamptz default now()
);

-- RLS: hamma foydalanuvchilar uchun ochiq (anon) — ehtiyotkorlik bilan!
alter table public.tovarlar enable row level security;
alter table public.zakazlar enable row level security;
alter table public.mijozlar enable row level security;
alter table public.doimiy_mijozlar enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='tovarlar' and policyname='open-all') then
    create policy "open-all" on public.tovarlar for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='zakazlar' and policyname='open-all') then
    create policy "open-all" on public.zakazlar for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='mijozlar' and policyname='open-all') then
    create policy "open-all" on public.mijozlar for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='doimiy_mijozlar' and policyname='open-all') then
    create policy "open-all" on public.doimiy_mijozlar for all using (true) with check (true);
  end if;
end $$;
