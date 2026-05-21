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

-- Deshabilitar RLS por ahora (ACTIVAR EN PRODUCCIÓN)
alter table familias disable row level security;
alter table miembros disable row level security;
alter table favoritos disable row level security;
alter table menus disable row level security;
