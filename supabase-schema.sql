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
  hyd_antisiphon_done text default 'nao', -- 'sim'/'nao' — alimenta o cenário calculado do capítulo 4
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

-- checklist da aba "Checklist": ações prioritárias e medições pendentes do relatório
create table struct_tasks (
  id text primary key,                    -- slug estável ('anti-sifao', 'med-descida', 'custom-...')
  task_group text not null default 'acao' check (task_group in ('acao', 'medicao')),
  priority text not null default 'baixa'
    check (priority in ('critica', 'alta', 'media', 'baixa', 'medicao')),
  label text not null,
  impact text,                            -- por que importa, exibido abaixo do título
  cost text,                              -- rótulo exibido ('R$ 60', '—')
  cost_value numeric default 0,           -- valor somado em "custo em aberto"
  custom boolean default false,           -- true = criada pelo usuário, não vem do relatório
  checked boolean default false,
  checked_at timestamptz
);

-- ============================================================================
-- Segurança (RLS) — leia antes de usar em produção
-- ============================================================================
-- Este app não tem login: ele usa a chave "anon public" do projeto direto no
-- navegador (ver README.md § Sincronização na nuvem). Isso significa que
-- QUALQUER PESSOA COM A URL DO PROJETO + A CHAVE ANON consegue ler e escrever
-- nestas tabelas — não há usuário autenticado para uma política restringir.
--
-- O Supabase já nega tudo por padrão quando RLS está ligado e não há política
-- (é o comportamento seguro). As políticas abaixo abrem, de propósito, acesso
-- total ao papel "anon" — exatamente o modelo de um link do Google Sheets
-- "qualquer pessoa com o link pode editar". Isso é apropriado para um painel
-- pessoal de um aquário com poucos dispositivos de confiança; NÃO é apropriado
-- se este projeto Supabase for reaproveitado para dados sensíveis ou multiuso.
--
-- Se um dia isto precisar de usuários de verdade (ex: sócio, comprador, com
-- permissões diferentes), o caminho é: Supabase Auth + políticas com
-- `auth.uid()` no lugar de `true` abaixo, e trocar a chave anon por sessão
-- autenticada no index.html.

alter table readings enable row level security;
alter table phase_data enable row level security;
alter table gate_criteria enable row level security;
alter table tank_config enable row level security;
alter table struct_tasks enable row level security;

create policy "anon full access" on readings for all to anon using (true) with check (true);
create policy "anon full access" on phase_data for all to anon using (true) with check (true);
create policy "anon full access" on gate_criteria for all to anon using (true) with check (true);
create policy "anon full access" on tank_config for all to anon using (true) with check (true);
create policy "anon full access" on struct_tasks for all to anon using (true) with check (true);
