-- Schema mínimo para migração do "Parâmetros da Água do Aquário" do localStorage para Supabase (Postgres).
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

-- ficha de configuração física do aquário e sump (linha única, aba "Aquário & sump")
create table tank_config (
  id boolean primary key default true check (id), -- garante uma única linha
  tank_dims text,
  tank_volume_gross numeric,
  tank_volume_net numeric,
  tank_material text,
  tank_brand text,
  tank_setup_date date,
  sump_dims text,
  sump_volume numeric,
  sump_chambers integer,
  sump_pump_model text,
  sump_pump_flow numeric,
  sump_mech_media text,
  sump_bio_media text,
  eq_heater text,
  eq_lighting text,
  eq_extra_pumps text,
  eq_co2 text,
  eq_controller text,
  eq_other text,
  sub_substrate text,
  sub_hardscape text,
  sub_plants text,
  maint_percent numeric,
  maint_frequency text,
  maint_media_frequency text,
  notes text,
  updated_at timestamptz default now()
);
