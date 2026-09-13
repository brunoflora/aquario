# Parâmetros da Água do Aquário — Ciclídeos Nacionais

Painel de acompanhamento do aquário jumbo de ciclídeos nacionais, em quatro abas **ordenadas por frequência de uso**: **Hoje** (consulta diária — veredicto do estado da água pelo pior parâmetro, os 7 parâmetros em grade, a ação do dia com dose já calculada, tendência e média ponderada), **Medir** (registro diário de uma mão, com conversão de amônia ao vivo e histórico), **Plano** (operação semanal — TPA, protocolo de bicarbonato, diagnóstico do especialista por parâmetro, trocas de mídia e checklist de ações prioritárias) e **Sistema** (referência — o infográfico de oito capítulos, a ficha técnica editável e a sincronização na nuvem).

A interface usa uma analogia de rio amazônico que não é decorativa — ela mapeia função: o display é *o rio*, o sump é *a várzea* (na Amazônia é a planície alagada que filtra o rio), a hidráulica é *a correnteza*, a queda de energia é *a cheia*, o KH 0 é *água preta*, a carga na laje é *o leito* e a manutenção é *o calendário das águas*.

Este projeto nasceu de um artefato React que rodava dentro de uma conversa do Claude (persistência via `window.storage`), depois virou uma página vanilla (HTML/CSS/JS puro, sem build) e hoje é um app **React + MUI real**, buildado com Vite. Ver `relatorio-estrutural.md` para o relatório técnico-estrutural completo (dimensional, hidráulica, carga estrutural, fauna e prioridades) que embasa os valores padrão da aba Sistema, e `ficha-tecnica-manejo-2026-09-13.md` para o histórico de manejo mais recente.

## Sistema de design

A identidade é autoral, não o default de nenhum framework — construída em cima do MUI (`createTheme()` com tokens próprios), não com ele em estado de fábrica:

- **Paleta própria em `theme/tokens.js`**, com correção conceitual sobre a versão anterior: água preta amazônica de verdade é cor de chá/café forte (tanino e ácido húmico dissolvidos), não esverdeada. O modo escuro é quente (marrom-avermelhado); o modo claro deliberadamente **não** repete o mesmo tom — vai para um branco-esverdeado frio e clínico, como bancada de laboratório sob luz de dia. Todo par texto/fundo foi verificado matematicamente (luminância relativa WCAG) antes de aplicar: ≥4,5:1 para texto pequeno nos dois temas.
- **Tipografia com papel semântico**: **Instrument Sans** para prosa, **JetBrains Mono** para toda leitura numérica (`.aq-num`, algarismos tabulares) — o que sai de um teste de água é lido como leitura de instrumento, não como texto corrido.
- **Regra central da paleta**: cor saturada significa **estado da água**, e nada mais. Não existe cor de marca disputando com a tríade semântica (bom/alerta/crítico) — botões e abas usam contraste de tinta, não matiz.
- **Alvos de toque em 44×44 px** (WCAG 2.5.5), sobrescrevendo os defaults do MUI (`IconButton` 40, `Button` ≈36,5, `ToggleButton` ≈39) — o contexto de uso é o pior possível para precisão: em pé na frente do aquário, uma mão no celular, a outra no frasco de teste, dedos molhados.
- A ficha técnica é gerada de um **spec declarativo** (`CONFIG_SPEC`, em `src/domain/config.js`), o que garante anatomia idêntica em todos os 44 campos.
- Sparklines em **SVG puro** (`components/Sparkline.jsx`), não uma biblioteca de gráficos — ~40 linhas em vez de ~350 kB de bundle para desenhar seis traços de tendência.

## Modelo de dados — 7 parâmetros

`domain/water.js` é o núcleo do app: `CORE_PARAMS = [temp, ph, kh, gh, nh3, no2, no3]`. GH (dureza geral) entrou no modelo depois do KH ter zerado em 2026 — sem ele não dava para saber se o colapso de tampão vinha só do KH ou também da dureza geral. Faixas, pesos de score e mensagens de orientação vivem todos neste arquivo; nenhum componente hardcoda faixa ou contagem de parâmetro (`CORE_PARAMS.length` em vez de `6` fixo).

## Diagnóstico do especialista

Cada parâmetro fora da faixa gera um item estruturado em **input → diagnóstico → ação → resultado esperado** (`generateSpecialistPlan()`), visível na aba Plano. É regra codificada — determinística, auditável, sem chamada de rede —, não um modelo de linguagem, mas segue o mesmo formato que um especialista humano usaria: não só "o que fazer", mas "o que checar depois para saber se funcionou".

## Sincronização na nuvem — como foi construída

Toda escrita local passa por um único ponto (`persist()` em `AppStateProvider`), que emite um evento num barramento simples (`persistBus`); o módulo de nuvem (`useCloudSync`) assina esse evento, marca a tabela correspondente como "suja" e agenda um envio (debounce de 900 ms) para o Supabase via `fetch` direto — sem SDK do Supabase. Isso significa que desfazer, o fluxo de importar JSON e cada mutação isolada (registrar leitura, marcar checklist, editar a ficha) já propagam para a nuvem automaticamente, sem precisar tocar em cada callback.

- **Upsert + delete real**: cada envio faz upsert (`Prefer: resolution=merge-duplicates`) das linhas atuais e depois busca os ids que existem na nuvem mas não localmente, apagando-os — uma exclusão local vira exclusão na nuvem, não só "esquecer de enviar".
- **Sem servidor, sem conflito de escrita concorrente de verdade**: o app assume um usuário só, em poucos dispositivos, não editando o mesmo dado ao mesmo tempo em dois aparelhos. A reconciliação usa uma assinatura determinística do estado (ids + valores, ordenados) para decidir se local e nuvem já são iguais, sem precisar de coluna de versão.
- **Nunca sobrescreve sozinho quando os dois lados têm dados diferentes** — mostra um aviso e espera confirmação.
- Testado com um **mock do protocolo PostgREST** (`scripts/mock-postgrest.js` + `scripts/cloud-sync-test.js`; não é o Supabase real): dois "dispositivos" simulados trocando dados por push/pull, delete propagando, chave errada e URL inalcançável mostrando erro compreensível sem quebrar o uso local, e a detecção de sandbox validada dentro de um iframe real.

## Acessibilidade

- Contraste de cor verificado matematicamente em ambos os temas (ver *Sistema de design*) — não herdado de fábrica de nenhum framework.
- Alvos de toque em 44×44 px em todo controle interativo.
- Foco visível em todos os controles alcançáveis por teclado (MUI Tabs/TextField/Button já tratam isso por padrão).
- Snackbar anuncia por `role="status"`; erros por `severity="error"` no `Alert`.
- Tema escuro/claro acompanha `prefers-color-scheme` do sistema operacional.

## Como usar

Em produção: acesse o site publicado (GitHub Pages via Actions, ver `.github/workflows/pages.yml`, que builda e publica a cada push em `main`).

Para rodar localmente:

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção em dist/
npm run preview  # serve o build de produção localmente
```

## O que o app faz

### Aba Hoje

Visão de estado, sem formulário. Abre por padrão.

- **Veredicto do estado da água**: avalia pelo **pior** parâmetro, não pela média — amônia e nitrito são tóxicos em qualquer nível detectável, então uma emergência generalizada é liderada por eles, não pela temperatura.
- **Grade dos 7 parâmetros**, valor em mono, faixa ideal como legenda. Reflui sozinha (flexbox) para qualquer contagem de parâmetros, sem linha órfã.
- **Ação de hoje**: TPA e/ou reposição de KH, já calculadas para o volume real em circulação.
- **Tendência das últimas 14 leituras**, por parâmetro, com sparkline SVG.
- **Média ponderada** dos 7 parâmetros, sempre subordinada e rotulada como média — nunca aparece como veredicto.

### Aba Medir

- **Registro diário**: temperatura, pH, KH, GH, amônia (NH₃ total/TAN), nitrito (NO₂), nitrato (NO₃) e turbidez, com nota livre. Salva automaticamente a cada alteração.
- **Conversão de amônia ao vivo**: o kit lê o total (TAN), mas quem mata peixe é a fração tóxica (NH₃), que depende do pH e da temperatura do dia — a conversão aparece assim que os três valores estão preenchidos.
- **A última leitura preenchida continua ativa**: ao abrir, carrega o registro mais recente, não um formulário em branco.
- **Copiar anterior**: em sistema estável, a maioria dos valores repete de um dia para o outro.
- **Histórico** com Exportar/Importar JSON.

### Aba Plano

O que se faz com balde na mão, toda semana.

- **Troca parcial de água**, já calculada para o volume real (não para os 700 L de catálogo): litros, declorador e bicarbonato de reposição. A TPA corretiva (puxada pelo pior parâmetro) manda sobre a de rotina.
- **Correção de KH em andamento**, quando há déficit: total fracionado em três doses, com o dia de medir.
- **Diagnóstico do especialista**: um card por parâmetro fora da faixa (ver seção acima) — cobre inclusive o que a TPA sozinha não resolve, como GH e temperatura.
- **Trocas de mídia**: prazos de perlon, carvão e Purigen.
- **Checklist de ações prioritárias**: as ações do relatório estrutural, agrupadas por prioridade, com progresso e custo em aberto.

### Aba Sistema

O sistema contado como infográfico escaneável, em oito capítulos, cada um com o número que importa em destaque:

| # | Capítulo | O que mostra |
|---|---|---|
| ◇ | **O caminho da água** | Diagrama do circuito display → descida → C1 → C2 → C3 → bomba |
| 01 | **O rio** (display) | Por que o volume real é 598 L e não 700 |
| 02 | **A várzea** (sump) | As 3 câmaras, mídia biológica e as pendências de dimensionamento em aberto |
| 03 | **A correnteza** (hidráulica) | Vazão real vs. a tabela de capacidade da descida por diâmetro |
| 04 | **A cheia** (queda de energia) | Cenários com/sem furo anti-sifão contra a folga do sump |
| 05 | **Água preta** (química) | Protocolo de correção de KH, com o ponto de dosagem confirmado |
| 06 | **O leito** (carga estrutural) | Carga sobre a laje contra a faixa da NBR 6120 |
| 07 | **Os habitantes** (fauna) | Tamanho atual vs. adulto de cada espécie, plantel atualizado |
| 08 | **O calendário das águas** | Volumes e frequências de manutenção, já calculados |

**Os capítulos são calculados, não escritos.** A ficha técnica alimenta o infográfico: mude o volume líquido e o turnover, a TPA e a dose de bicarbonato se recalculam.

Ao final, **Ficha técnica editável**: 44 campos (display, sump, hidráulica, equipamentos, substrato, manutenção, carga estrutural, fauna e notas), com salvamento automático e inclusão no export/import JSON.

Nesta aba também fica a **Sincronização na nuvem** (ver seção acima).

## Onde os dados ficam guardados

Por padrão, tudo é salvo em `localStorage` do navegador. **A partir da aba Sistema → Sincronização na nuvem, dá para ligar sincronização real com Supabase** — os mesmos dados passam a aparecer em qualquer aparelho que abrir esta página com as mesmas credenciais.

### Configurar a sincronização

1. Criar um projeto gratuito no [Supabase](https://supabase.com).
2. Abrir o **SQL Editor** do projeto e rodar o conteúdo de `supabase-schema.sql` deste repositório.
3. Em **Project Settings → API**, copiar o **Project URL** e a chave **anon public** (não a `service_role`).
4. Na aba **Sistema → Sincronização na nuvem** do app, colar os dois valores e clicar em **Salvar e conectar**.
5. Repetir o passo 4 em cada dispositivo, com as mesmas credenciais.

**Modelo de confiança:** não há login. Qualquer pessoa com a URL do projeto e a chave anon lê e escreve nesses dados — mesmo modelo de um link do Google Sheets "qualquer pessoa com o link pode editar". A chave fica só no `localStorage` do navegador e nunca entra no "Exportar JSON".

**Use "Exportar JSON" de qualquer forma.** Sincronização não é backup.

## Lógica de negócio (referência rápida)

| Parâmetro | Faixa boa | Faixa de alerta | Peso no score |
|---|---|---|---|
| Temperatura (°C) | 25–28 | 23–25 ou 28–29,5 | 20 |
| pH | 6,5–7,6 | 6,0–6,5 ou 7,6–8,0 | 15 |
| KH (dKH) | 4–8 | 2–4 ou 8–10 | 10 |
| GH (dGH) | 6–12 | 4–6 ou 12–20 | 10 |
| NH₃ (ppm) | ≤ 0,02 | ≤ 0,25 | 20 |
| NO₂ (ppm) | ≤ 0,02 | ≤ 0,25 | 20 |
| NO₃ (ppm) | ≤ 20 | ≤ 40 | 10 |
| Turbidez | água clara | — (turva = ruim) | 5 |

Score é média ponderada, calculada só com leitura completa (todos os 7 parâmetros preenchidos). Veredicto do dia (aba Hoje) é decidido pelo **pior** parâmetro, não pela média — os dois são propositalmente números diferentes, para nunca repetir a contradição que motivou a primeira auditoria deste projeto (score verde sobre um alarme crítico).
