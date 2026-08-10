-- Schema mínimo para migração do "Diário de Água" do localStorage para Supabase (Postgres).
-- Ver README.md para o passo a passo completo da migração.

-- tabela de leituras diárias de parâmetros
create table readings (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  temp numeric,
  ph numeric,
  kh numeric,
  nh3 numeric,
  no2 numeric,
  no3 numeric,
  turbidez boolean,
  notes text,
  created_at timestamptz default now()
);

-- tabela de dados das fases do projeto (campos livres por fase)
create table phase_data (
  id text primary key,
  label text not null,
  status text not null default 'pendente' check (status in ('pendente', 'em andamento', 'concluído')),
  notes text,
  updated_at timestamptz default now()
);

-- tabela de critérios manuais adicionais do gate de liberação de espécies
create table gate_criteria (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  checked boolean default false,
  checked_at timestamptz
);
