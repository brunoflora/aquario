# Parâmetros da Água do Aquário — Ciclídeos Nacionais

Painel de acompanhamento do aquário jumbo de ciclídeos nacionais, em quatro abas **ordenadas por frequência de uso**: **Painel** (consulta diária — alarme do estado da água, score, *gates* de liberação de espécies e histórico), **Medir** (registro diário, plano de ação, fases do projeto e critérios manuais do gate), **Manutenção** (operação semanal — as contas da TPA já calculadas, protocolo de bicarbonato, prazos de mídia e o checklist de obras) e **O sistema** (referência — o infográfico de oito capítulos, a ficha técnica editável e a sincronização na nuvem).

A interface usa uma analogia de rio amazônico que não é decorativa — ela mapeia função: o display é *o rio*, o sump é *a várzea* (na Amazônia é a planície alagada que filtra o rio), a hidráulica é *a correnteza*, a queda de energia é *a cheia*, o KH 0 é *água preta*, a carga na laje é *o leito* e a manutenção é *o calendário das águas*.

Este projeto nasceu de um artefato React que rodava dentro de uma conversa do Claude (persistência via `window.storage`), depois virou uma página vanilla (HTML/CSS/JS puro, sem build) e hoje é um app **React + MUI real** (`@mui/material` + `@mui/x-charts`), buildado com Vite. Ver `HANDOFF.md` para o histórico completo, e `relatorio-estrutural.md` para o relatório técnico-estrutural completo (dimensional, hidráulica, carga estrutural, fauna e prioridades) que embasa os valores padrão da aba O sistema.

## Sistema de design

A interface usa o **MUI em estado default** (`createTheme()` sem paleta/tokens customizados — só `palette.mode` acompanhando claro/escuro do sistema operacional):

- **`TextField` do MUI** em todo campo: label, *adornment* de unidade, `helperText` para faixa ideal/`[EST]`/`MEDIR` — sem componente customizado, sem paleta própria.
- **Score/Gauge, Radar e Sparklines vêm do `@mui/x-charts`** (tier gratuito/MIT): o gauge de score na aba Painel, o Radar de distância-do-ideal, os mini-gráficos de tendência por parâmetro e o gráfico de barras de cadência de medição.
- **Cores e tipografia 100% padrão MUI** — nenhum token de cor, espaçamento ou tipografia foi redefinido; o app herda o que o `createTheme()` do MUI entrega de fábrica.
- **Única exceção, e é de acessibilidade:** `theme.components` eleva os alvos de toque para 44×44 px (WCAG 2.5.5). Os defaults do MUI ficam abaixo disso — `IconButton` 40, `Button` ≈36,5, `ToggleButton` ≈39 — e o contexto de uso é o pior possível para precisão: em pé na frente do aquário, uma mão no celular, a outra no frasco de teste, dedos molhados. A sobrescrita é só de `minHeight`/`minWidth`; nenhuma cor ou fonte é tocada.
- A ficha técnica é gerada de um **spec declarativo** (`CONFIG_SPEC`, em `src/domain/config.js`), o que garante anatomia idêntica em todos os 43 campos.

## Sincronização na nuvem — como foi construída

Toda escrita local passa por um único ponto (`persist()` em `AppStateProvider`), que emite um evento num barramento simples (`persistBus`); o módulo de nuvem (`useCloudSync`) assina esse evento, marca a tabela correspondente como "suja" e agenda um envio (debounce de 900 ms) para o Supabase via `fetch` direto — sem SDK do Supabase. Isso significa que desfazer, o fluxo de importar JSON e cada mutação isolada (registrar leitura, marcar checklist, editar a ficha) já propagam para a nuvem automaticamente, sem precisar tocar em cada callback.

- **Upsert + delete real**: cada envio faz upsert (`Prefer: resolution=merge-duplicates`) das linhas atuais e depois busca os ids que existem na nuvem mas não localmente, apagando-os — uma exclusão local vira exclusão na nuvem, não só "esquecer de enviar".
- **Sem servidor, sem conflito de escrita concorrente de verdade**: o app assume um usuário só, em poucos dispositivos, não editando o mesmo dado ao mesmo tempo em dois aparelhos. A reconciliação usa uma assinatura determinística do estado (ids + valores, ordenados) para decidir se local e nuvem já são iguais, sem precisar de coluna de versão.
- **Nunca sobrescreve sozinho quando os dois lados têm dados diferentes** — ver seção de segurança acima.
- Testado com um **mock do protocolo PostgREST** (não é o Supabase real — não tenho como criar um projeto por você): dois "dispositivos" simulados trocando dados por push/pull, delete propagando, chave errada e URL inalcançável mostrando erro compreensível sem quebrar o uso local, e a detecção de sandbox validada dentro de um iframe real.

## Acessibilidade e contraste

Como o tema é o `createTheme()` default do MUI (sem paleta customizada), a acessibilidade de cor vem de fábrica do próprio MUI — não há tokens próprios para auditar. `scripts/contrast.js` media os tokens CSS da versão vanilla anterior e não se aplica a este app; ficou no repositório como referência histórica.

- Foco visível em todos os controles alcançáveis por teclado (MUI Tabs/TextField/Button já tratam isso por padrão).
- Snackbar anuncia por `role="status"`; erros por `severity="error"` no `Alert`.
- Tema escuro segue o `palette.mode` do MUI, acompanhando `prefers-color-scheme` do sistema operacional.

## Heurísticas de usabilidade (Nielsen / NN/g)

Auditoria por teste baseado em tarefas, conduzida sobre o build de produção em
viewport de celular (393×852 com toque) — o contexto real de uso é em pé na
frente do aquário. Onze achados; os três primeiros tinham consequência
biológica. Todos corrigidos.

| # | Heurística | Estado | O que mudou |
|---|---|---|---|
| 1 | Visibilidade do status | **Corrigido** | O score é média ponderada e a amônia pesa 20 de 100 — com o verde começando em 80, um parâmetro letal sozinho nunca tirava o painel do verde: NH₃ a 0,30 ppm (emergência declarada pelo próprio texto do campo) exibia 80/100 verde. Alarme agora avalia pelo **pior** parâmetro. E com score 0 o arco do medidor tinha área zero, deixando o pior estado idêntico a "sem dados" |
| 2 | Correspondência com o mundo real | **Corrigido** | Vocabulário de aquarista sempre foi exemplar, mas "Configurações" abrigava quatro frequências de uso distintas. Abas passam a nomear o que contêm |
| 3 | Controle e liberdade | Bom | Toda exclusão é reversível com *Desfazer* |
| 4 | Consistência e padrões | Bom | MUI aplicado uniformemente |
| 5 | Prevenção de erro | **Corrigido** | O erro que importava aqui não era o do usuário digitando — era o app validando água perigosa como boa |
| 6 | Reconhecer em vez de lembrar | **Corrigido** | O radar misturava duas semânticas opostas (faixa ideal no meio × quanto-menor-melhor); normalizado para distância-do-ideal |
| 7 | Flexibilidade e eficiência | **Corrigido** | A conta da TPA, tarefa semanal, estava a 11 telas de rolagem; agora abre a aba Manutenção |
| 8 | Estética e minimalismo | **Corrigido** | O texto de apresentação consumia 48% da primeira tela em toda visita; agora só antes da primeira medição |
| 9 | Recuperação de erros | **Corrigido** | A instrução de emergência existia, mas na aba que o usuário não tinha aberto |
| 10 | Ajuda e documentação | **Corrigido** | Os oito capítulos seguem sendo a documentação no ponto de uso; faltava o convite inicial, agora presente no estado vazio |

Acessibilidade de toque: alvos elevados a 44×44 px (WCAG 2.5.5) — ver *Sistema
de design*.

## Como usar

Em produção: acesse o site publicado (GitHub Pages via Actions, ver `.github/workflows/pages.yml`).

Para rodar localmente:

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção em dist/
npm run preview  # serve o build de produção localmente
```

O deploy é automático a cada push em `main`: o workflow instala as dependências, builda com Vite e publica `dist/` no GitHub Pages.

## O que o app faz

### Aba Painel

Visão de estado, sem formulário. É a aba que abre por padrão.

- **Alarme do estado da água**, no topo: avalia pelo **pior** parâmetro, não pela média. Amônia e nitrito são tóxicos em qualquer nível detectável, então neles a faixa de alerta já dispara alarme crítico — com a ação a tomar e todos os parâmetros fora da faixa listados. Numa emergência generalizada, quem lidera é a amônia, não a temperatura: a ação é diferente e o prazo é menor.
- **Score de água (0–100)** logo abaixo, como medida de qualidade geral. Enquanto o dia estiver incompleto ele mostra **—** com um chip *parcial · faltam N*, nunca 0 — o zero fica reservado para água realmente ruim. O medidor informa a **idade da leitura** e fica âmbar a partir de 3 dias.
- **Gates de liberação**: dias consecutivos com água clara (5) e biologia zerada (3). Atingido o alvo, o chip passa a mostrar há quanto tempo está mantido; enquanto não, o chip do Green Terror informa **o gargalo** — quantos dias faltam e de quê.
- **Radar de distância do ideal**: cada eixo normalizado para 0 = na faixa ideal, 1 = no limite de alerta. Centro significa saudável em todos os eixos, então polígono pequeno e regular = água boa, e qualquer ponta esticada é problema — por excesso ou por falta.
- **Cadência de medição** e **tendências por parâmetro**.
- **Histórico** em tabela, com **Exportar / Importar JSON**.

### Aba Medir

- **Registro diário**: temperatura, pH, KH, amônia (NH₃), nitrito (NO₂), nitrato (NO₃) e turbidez, com uma nota livre por dia. Salva automaticamente a cada alteração (sem botão "Salvar", sem risco de perder o que foi digitado).
- **A última leitura preenchida continua ativa**: ao abrir, o formulário carrega o registro mais recente, não um formulário em branco. Ele segue ativo até você iniciar e gravar o próximo. Como editar ali altera aquele dia, um aviso no topo do card diz de que data é a leitura, há quantos dias, e oferece o botão **Registrar hoje**.
- **Plano de ação**: recomendações geradas a partir do último registro e do progresso dos gates.
- **Fases do projeto**: checklist livre (ciclagem, plantio/decoração, quarentena, estabilização, introdução, formação de casais, venda de excedentes) com status e notas por fase.
- **Critérios adicionais do gate**: checklist manual para condições que não vêm de um parâmetro de água (ex: aprovação de um veterinário).

### Aba Manutenção

O que se faz com balde na mão, toda semana. Estes números existiam antes, mas dentro do capítulo 8 do infográfico — a onze telas de rolagem numa aba chamada "Configurações". Agora são a primeira coisa da tela.

- **As contas da TPA**, já calculadas para o volume real em circulação (não para os 700 L de catálogo): litros a trocar, declorador e bicarbonato de reposição.
- **Protocolo de bicarbonato**, exibido só quando há déficit de KH: o total, fracionado em três doses, com o dia de medir.
- **Trocas de mídia**: os prazos de perlon, carvão e Purigen, com o alerta de que perlon vencido inverte de função e vira fonte de nitrato.
- **Checklist de obras e medições**: as 11 ações prioritárias do relatório agrupadas por prioridade, com progresso, custo em aberto e as 6 medições que substituem as estimativas `[EST]`.

### Aba O sistema

O sistema contado como infográfico escaneável, em oito capítulos, cada um com o número que importa em destaque e o risco explicitado logo abaixo:

| # | Capítulo | O que mostra |
|---|---|---|
| ◇ | **O caminho da água** | Diagrama do circuito display → descida → C1 → C2 → C3 → bomba, com os dois pontos frágeis marcados |
| 01 | **O rio** (display) | Por que o volume real é 598 L e não 700 — e por que dosar por 700 gera 17% de sobredose |
| 02 | **A várzea** (sump) | As 3 câmaras em barra proporcional, com a C2 (8,5 L) marcada como gargalo diante do alvo de 12–18 L |
| 03 | **A correnteza** (hidráulica) | Vazão real ~5.000 L/h vs. a tabela de capacidade da descida por diâmetro — o dado que falta medir |
| 04 | **A cheia** (queda de energia) | Barras comparando 50 L (sem anti-sifão, ✕ transborda 22 L) e 20 L (com anti-sifão, ✓) contra os 28,4 L de folga do sump |
| 05 | **Água preta** (química) | Por que KH 0 funciona no rio Negro e não em 598 L, com o protocolo de bicarbonato de 7 dias em linha do tempo |
| 06 | **O leito** (carga estrutural) | 951 kg/m² contra a faixa de 150–200 kg/m² da NBR 6120, em barra |
| 07 | **Os habitantes** (fauna) | Tamanho atual vs. adulto de cada espécie, medido contra os 200 cm do aquário — o Pangasius ocupa 65% da barra |
| 08 | **O calendário das águas** | Volumes e frequências de manutenção já calculados para 682 L |

**Os capítulos são calculados, não escritos.** A ficha técnica alimenta o infográfico: mude o volume líquido e o turnover, a TPA e a dose de bicarbonato se recalculam; informe o diâmetro da descida e o capítulo 3 emite o veredito na hora (com quantos L/h faltam de escoamento); marque o furo anti-sifão como instalado e as barras do capítulo 4 mudam de cenário. O KH registrado na aba Medir atravessa para o capítulo 5 e define a dose exata de bicarbonato para o volume real do sistema.

Ao final, **Ficha técnica editável**: 43 campos (display, sump, hidráulica, equipamentos, substrato, manutenção, carga estrutural, fauna e notas), pré-preenchidos, com salvamento automático e inclusão no export/import JSON.

> **Divergência conhecida com o relatório:** a seção 10 indica repor 6,8 g de bicarbonato por TPA. Essa conta usa 1 dKH, mas uma troca de 33% a 3 dKH derruba o tampão em ~1 dKH *no sistema inteiro* — a reposição correta é `3 × 30 mg/L × volume trocado`, cerca de 20 g. O painel calcula o valor correto e sinaliza a divergência no capítulo 8.

Nesta aba também fica a **Sincronização na nuvem** (ver seção abaixo).

### Comum a todas as abas

- **Exportar/Importar JSON**: backup manual de tudo (leituras, fases, critérios, configuração do sistema e ações prioritárias) em um arquivo `.json`.

## Onde os dados ficam guardados

Por padrão, tudo é salvo em `localStorage` do navegador — client-side, sem backend, atrelado a este dispositivo específico. **A partir da aba O sistema → Sincronização na nuvem, dá para ligar sincronização real com Supabase** — os mesmos dados passam a aparecer em qualquer aparelho que abrir esta página com as mesmas credenciais, sem precisar editar código.

### ⚠ Isto não funciona dentro do artefato publicado no claude.ai

O link `claude.ai/code/artifact/...` roda a página dentro de um **sandbox com CSP que bloqueia qualquer conexão de rede** que não seja uma capability explicitamente concedida pela plataforma (hoje: downloads e MCP — nenhuma delas serve para falar com um banco de dados externo). Isso significa que:

- **A sincronização com Supabase nunca vai funcionar no link do artefato**, com ou sem projeto configurado. A própria página detecta esse contexto (`window.top !== window.self`) e mostra um aviso em vez de falhar em silêncio.
- Para sincronização de verdade entre dispositivos, abra `index.html` **fora do claude.ai**: localmente (baixe o arquivo e abra no navegador) ou publicado em GitHub Pages / Vercel / Netlify. Fora do sandbox, a conexão com o Supabase funciona normalmente em qualquer navegador moderno.
- O link do artefato continua útil pra visualizar e compartilhar o painel — só não grava nem lê da nuvem a partir dali.

### Configurar a sincronização (fora do claude.ai)

1. Criar um projeto gratuito no [Supabase](https://supabase.com).
2. Abrir o **SQL Editor** do projeto e rodar o conteúdo de `supabase-schema.sql` deste repositório — cria as 5 tabelas (`readings`, `phase_data`, `gate_criteria`, `tank_config`, `struct_tasks`) já com RLS habilitado e políticas de acesso para o papel `anon`.
3. Em **Project Settings → API**, copiar o **Project URL** e a chave **anon public** (não a `service_role` — essa nunca deve rodar no navegador).
4. Na aba **O sistema → Sincronização na nuvem** do app, colar os dois valores e clicar em **Salvar e conectar**.
5. Repetir o passo 4 em cada dispositivo, com as mesmas credenciais.

O app decide sozinho a direção da primeira sincronização: se um lado está vazio e o outro tem dados, adota automaticamente o lado com dados; se os dois têm dados e são diferentes, **não sobrescreve nada sozinho** — mostra um aviso ("dados diferentes — clique para revisar") e só troca quando você confirma pelo botão **Sincronizar agora**. Dali em diante, toda alteração local é enviada para a nuvem alguns segundos depois, incluindo exclusões (não é só "enviar o que existe": o que foi apagado localmente é apagado na nuvem também).

**Modelo de confiança:** não há login. Qualquer pessoa com a URL do projeto e a chave anon lê e escreve nesses dados — o mesmo modelo de um link do Google Sheets "qualquer pessoa com o link pode editar". Apropriado para um painel pessoal com poucos dispositivos de confiança; não reaproveite esse projeto Supabase para dados sensíveis. A chave fica só no `localStorage` do navegador e nunca entra no "Exportar JSON".

**Use "Exportar JSON" de qualquer forma.** Sincronização não é backup: se você apagar o projeto Supabase, ou dois dispositivos brigarem por uma divergência mal resolvida, o `.json` exportado é a rede de segurança que não depende de nenhum serviço externo.

## Lógica de negócio (referência rápida)

| Parâmetro | Faixa boa | Faixa de alerta | Peso no score |
|---|---|---|---|
| Temperatura (°C) | 25–28 | 23–25 ou 28–29,5 | 20 |
| pH | 6,5–7,6 | 6,0–6,5 ou 7,6–8,0 | 15 |
| KH (dKH) | 4–8 | 2–4 ou 8–10 | 10 |
| NH₃ (ppm) | ≤ 0,02 | ≤ 0,25 | 20 |
| NO₂ (ppm) | ≤ 0,02 | ≤ 0,25 | 20 |
| NO₃ (ppm) | ≤ 20 | ≤ 40 | 10 |
| Turbidez | água clara | — (turva = ruim) | 5 |

Gates: 5 dias consecutivos de água clara + 3 dias consecutivos com NH₃ e NO₂ próximos de zero → ambiente liberado para introdução do Green Terror. A contagem é sempre sobre a série ordenada por data (não pela ordem em que os registros foram digitados) e quebra se houver um dia sem registro.
