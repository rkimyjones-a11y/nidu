-- Ejecuta este SQL en Supabase: Dashboard → SQL Editor → New query → Run.

-- Familias
create table if not exists familias (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  codigo text unique not null,
  created_at timestamp default now()
);

-- Miembros
create table if not exists miembros (
  id uuid default gen_random_uuid() primary key,
  familia_id uuid references familias(id) on delete cascade,
  nombre text not null,
  tipo text not null, -- 'adulto' | 'nino'
  restricciones text[] default '{}',
  no_le_gusta text default '',
  dias_cocina text[] default '{}',
  created_at timestamp default now()
);

-- Favoritos
create table if not exists favoritos (
  id uuid default gen_random_uuid() primary key,
  familia_id uuid references familias(id) on delete cascade,
  nombre text not null,
  tipo text default 'ia', -- 'ia' | 'manual'
  created_at timestamp default now()
);

-- Menus guardados (un registro por familia y semana)
create table if not exists menus (
  id uuid default gen_random_uuid() primary key,
  familia_id uuid references familias(id) on delete cascade,
  semana_inicio date not null,
  datos jsonb not null,
  created_at timestamp default now(),
  unique (familia_id, semana_inicio)
);

-- Artículos extra de la lista de la compra (sección "Otras cosas")
create table if not exists compra_extra (
  id uuid default gen_random_uuid() primary key,
  familia_id uuid references familias(id) on delete cascade,
  nombre text not null,
  recurrente boolean default false,
  created_at timestamp default now()
);

-- Recetario personal de la familia
create table if not exists recetas (
  id uuid default gen_random_uuid() primary key,
  familia_id uuid references familias(id) on delete cascade,
  nombre text not null,
  tiempo integer,
  categoria text,
  ingredientes jsonb default '[]',
  notas text,
  origen text default 'manual', -- 'manual' | 'escaneada' | 'favorita'
  imagen_url text,
  created_at timestamp default now()
);

-- Las nuevas API keys de Supabase (sb_publishable_...) SIEMPRE aplican RLS,
-- así que en lugar de desactivarlo lo activamos con políticas permisivas.
-- ⚠️ ABIERTO PARA EL MVP: cualquiera con la publishable key puede leer/escribir.
-- Sustituye estas políticas por unas reales antes de producción.
alter table familias enable row level security;
alter table miembros enable row level security;
alter table favoritos enable row level security;
alter table menus enable row level security;
alter table compra_extra enable row level security;
alter table recetas enable row level security;

drop policy if exists "nidu_open" on familias;
drop policy if exists "nidu_open" on miembros;
drop policy if exists "nidu_open" on favoritos;
drop policy if exists "nidu_open" on menus;
drop policy if exists "nidu_open" on compra_extra;
drop policy if exists "nidu_open" on recetas;

create policy "nidu_open" on familias for all using (true) with check (true);
create policy "nidu_open" on miembros for all using (true) with check (true);
create policy "nidu_open" on favoritos for all using (true) with check (true);
create policy "nidu_open" on menus for all using (true) with check (true);
create policy "nidu_open" on compra_extra for all using (true) with check (true);
create policy "nidu_open" on recetas for all using (true) with check (true);
