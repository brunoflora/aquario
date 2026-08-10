# Handoff técnico — Roadmap Ciclídeos Nacionais

**Contexto:** artefato React rodando dentro do Claude (claude.ai), usando a API `window.storage` para persistência. Este documento existe para que você (ou um desenvolvedor) decida se vale migrar para um ambiente de produção via Claude Code, e documenta exatamente o que precisa ser recriado.

---

## 1. Por que isso aconteceu (o bug de temperatura não salva)

**Causa raiz:** na v4, a função `persist()` só era chamada dentro de `saveReading()`, que só executava ao clicar no botão "Salvar registro". Digitar um valor no campo (`updateDraft`) atualizava apenas o estado React em memória — nunca tocava `window.storage`. Fechar o artefato sem clicar no botão descartava tudo.

**Correção aplicada na v5:** autosave via debounce em dois níveis —
1. O rascunho completo (`draft`) persiste 500ms após qualquer alteração, via `useDebouncedSave`.
2. Um `useEffect` observa mudanças em `draft` e, 700ms depois, "commita" automaticamente no array `readings` se algo mudou — sem precisar de clique.

Isso deve resolver o sintoma. Mas existe uma camada de risco abaixo disso que não é corrigível dentro deste ambiente — é o que a seção 2 explica.

---

## 2. Limitações estruturais do ambiente atual (não são bugs, são a arquitetura)

### 2.1 Escopo do `window.storage`
- Os dados salvos por este artefato **vivem atrelados a esta conversa específica** no Claude. Não é um banco de dados externo com URL própria.
- Se esta conversa for excluída, arquivada além do limite de retenção, ou se você abrir o roadmap em uma **conversa nova**, os dados não acompanham — cada conversa tem seu próprio `window.storage`.
- Não há como gerar um link público (`https://algo.com/roadmap`) a partir daqui. O artefato só é acessível de dentro do Claude.

### 2.2 Sem backend real
- Não há servidor, não há API própria, não há autenticação. Tudo roda client-side no navegador/app do Claude.
- Não há backup automático fora do Claude. Se quiser garantir os dados de um projeto de 6+ meses, a prática seria periodicamente exportar (copiar/colar o JSON do `readings`) para um arquivo local.

### 2.3 Sem acesso multi-dispositivo sincronizado de verdade
- Se você abrir o Claude no celular e no computador **na mesma conversa**, os dados devem sincronizar (mesmo backend de conta), mas isso depende da plataforma manter a mesma sessão de artefato — não testável com certeza a partir daqui.

### 2.4 Implicação prática para o seu caso
Você está planejando um projeto de **6+ meses com lançamento diário de dados**, ligado a decisões comerciais (formação de casais, timing de venda). Isso é exatamente o tipo de caso onde a fragilidade acima é um risco real, não teórico: perder a conversa = perder o histórico que embasa as decisões de Green Terror, timing de venda de excedentes, etc.

**Recomendação honesta:** se este projeto é sério o suficiente para gerar receita, vale migrar para uma versão com banco de dados real. Não é urgente hoje (a v5 corrigida deve funcionar para uso imediato), mas é uma dívida técnica que vale resolver nas próximas semanas, não nos próximos meses.

---

## 3. Especificação para migração via Claude Code

Se decidir migrar, isto é o que precisa ser recriado como projeto real:

### 3.1 Stack recomendada
- **Frontend:** manter o React atual (componente já pronto em `roadmap-app-v5.jsx`), adaptado para rodar fora do ambiente de artefato (remover a API `window.storage`, trocar por chamadas HTTP).
- **Backend + banco:** Supabase (Postgres + API REST/realtime gerada automaticamente, autenticação embutida, tier gratuito generoso) é a opção de menor atrito para um projeto deste porte. Firebase é alternativa equivalente.
- **Hospedagem:** Vercel ou Netlify, tier gratuito, deploy direto de um repositório Git.

### 3.2 Modelo de dados (schema mínimo)

```sql
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
  created_at timestamptz default now()
);

-- tabela de dados das fases (campos livres por fase)
create table phase_data (
  id uuid primary key default gen_random_uuid(),
  field_id text not null unique,
  value text,
  updated_at timestamptz default now()
);

-- tabela de critérios do gate Green Terror
create table gate_criteria (
  id text primary key,
  checked boolean default false,
  checked_at timestamptz
);
```

### 3.3 Lógica de negócio a preservar (já implementada no componente atual)

- **`paramStatus()`** — classifica cada parâmetro em good/warn/bad contra faixas fixas. Migrar como está.
- **`computeWaterScore()`** — score ponderado (pesos: temp 20, pH 15, KH 10, NH₃ 20, NO₂ 20, NO₃ 10, turbidez 5 = 100 total). Migrar como está; considerar mover pesos para uma tabela de configuração se quiser ajustá-los sem redeploy.
- **`evaluateGates()`** — lógica de streak consecutivo (5 dias água clara, 3 dias biologia zerada). Esta é a parte mais sensível: precisa rodar sobre a *série ordenada por data*, não sobre ordem de inserção. Já implementado corretamente na v5, só replicar.
- **`deriveActionPlan()`** — gera recomendações dinâmicas a partir do último registro. Pode evoluir para regras mais sofisticadas (ex: comparar com histórico de 7 dias, não só o último) uma vez com banco real — hoje é limitado a "olhar o último ponto" porque não há uma boa forma de fazer queries agregadas em `window.storage`.

### 3.4 O que ganha ao migrar (e por que vale a pena)
- **Link real compartilhável**, inclusive para acessar de qualquer dispositivo sem depender da conversa do Claude.
- **Queries agregadas de verdade** — médias móveis de 7/30 dias, gráficos de tendência de cada parâmetro, o tipo de dado que efetivamente sustenta uma conversa comercial com um comprador de peixe grande.
- **Backup automático** e histórico permanente, sem risco de perda por limite de retenção de conversa.
- **Multi-usuário**, se no futuro você quiser dar acesso a um sócio, veterinário ou comprador para conferir o histórico de um espécime específico.

### 3.5 Estimativa de esforço
Para alguém com Claude Code e familiaridade básica com Supabase: 1–2 sessões de trabalho focado para ter o CRUD básico (leituras diárias + score + gates) funcionando em produção. O componente visual já está pronto — o trabalho é majoritariamente trocar a camada de persistência e configurar o deploy.

---

## 4. Recomendação de curto prazo

Não pare de usar o artefato agora — a v5 corrigida (autosave) resolve o problema imediato que você reportou. Use-a a partir de amanhã como planejado. Mas trate a migração como algo a fazer **nas próximas 2–4 semanas**, antes que o volume de dados acumulado torne a perda mais custosa.

Se/quando decidir migrar, este documento + o arquivo `roadmap-app-v5.jsx` são os dois artefatos que um desenvolvedor (ou você mesmo, via Claude Code) precisa para começar.
