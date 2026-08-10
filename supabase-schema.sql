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

-- ficha de configuração física do aquário e sump (linha única, aba "Configurações")
-- campos alinhados ao relatório técnico-estrutural (09/08/2026); ver relatorio-estrutural.md
create table tank_config (
  id boolean primary key default true check (id), -- garante uma única linha
  tank_dims text,
  tank_volume_gross numeric,
  tank_volume_net numeric,
  tank_water_level numeric,
  tank_material text,
  tank_glass_thickness numeric,
  tank_brand text,
  tank_setup_date text,
  tank_cycling_date text,
  sump_dims text,
  sump_volume numeric,
  sump_volume_operation numeric,
  sump_chambers integer,
  sump_chamber_detail text,
  sump_glass_thickness numeric,
  sump_pump_model text,
  sump_pump_flow numeric,
  sump_pump_flow_real numeric,
  sump_mech_media text,
  sump_bio_media text,
  hyd_downpipe_diameter text,
  hyd_return_head text,
  hyd_turnover text,
  hyd_wavemaker text,
  hyd_antisiphon text,
  hyd_notes text,
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
  struct_weight text,
  struct_load text,
  struct_notes text,
  fauna_notes text,
  notes text,
  updated_at timestamptz default now()
);

-- checklist de ações prioritárias vindas do relatório técnico-estrutural
create table struct_tasks (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  checked boolean default false,
  checked_at timestamptz
);
