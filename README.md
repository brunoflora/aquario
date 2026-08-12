# Parâmetros da Água do Aquário — Ciclídeos Nacionais

Painel de acompanhamento do aquário jumbo de ciclídeos nacionais, em quatro abas: **Painel** (visão do estado atual — score da água, *gates* de liberação de espécies e histórico), **Parâmetros** (registro diário, plano de ação, fases do projeto e critérios manuais do gate), **Configurações** (o sistema explicado em formato de infográfico narrativo, com a ficha técnica editável ao final) e **Checklist** (as 11 ações prioritárias do relatório estrutural e as 6 medições pendentes, com progresso e custo em aberto).

A interface usa uma analogia de rio amazônico que não é decorativa — ela mapeia função: o display é *o rio*, o sump é *a várzea* (na Amazônia é a planície alagada que filtra o rio), a hidráulica é *a correnteza*, a queda de energia é *a cheia*, o KH 0 é *água preta*, a carga na laje é *o leito* e a manutenção é *o calendário das águas*.

Este projeto nasceu de um artefato React que rodava dentro de uma conversa do Claude (persistência via `window.storage`). Ver `HANDOFF.md` para o histórico completo do porquê da migração, e `relatorio-estrutural.md` para o relatório técnico-estrutural completo (dimensional, hidráulica, carga estrutural, fauna e prioridades) que embasa os valores padrão da aba Configurações.

## Sistema de design

A interface segue o **sistema do MUI** implementado nativamente em CSS — sem React e sem build, para o arquivo continuar autocontido:

- **Campos no padrão MUI TextField**: o label acima traz só o título; a unidade vira *adornment* de sufixo dentro do campo; toda informação de apoio (faixa ideal, `[EST]`, `MEDIR`) desce para o *helper text* abaixo. Nos parâmetros de água o helper é reativo — digite 31 °C e ele fica vermelho explicando o que fazer, usando a mesma função `paramStatus` do score.
- **Steppers numéricos** nos 6 parâmetros de água, com passo por grandeza (0,1 °C · 0,1 pH · 0,5 dKH · 0,01 ppm de NH₃/NO₂ · 5 ppm de NO₃), limites por grandeza e botão desabilitado ao atingi-los. Campo vazio parte da **última medição daquele parâmetro**, não de zero — é de onde o aquarista realmente parte. Pressionar e segurar acelera. Os incrementos são arredondados à casa do passo, então não aparece `0.30000000000000004`. `inputmode="decimal"` abre o teclado numérico no celular.
  > Aqui as duas referências conflitam: o Carbon empilha chevrons de ~20px à direita do campo, e a NN/g pede alvo de ~44px no toque. Adotei a **anatomia e os estados do Carbon** (label, helper, inválido, min/max/step) com o **dimensionamento da NN/g** — botões lado a lado de 48×44px no ponteiro grosso.
- **Escala de espaçamento de 8px**, breakpoints do MUI (600 / 900 / 1200 px), curvas de transição `cubic-bezier(0.4, 0, 0.2, 1)` e escala tipográfica caption/body2/body1/h6/h5.
- **Padrões do MUI Dashboard**: cards `outlined` (borda de 1px, sem sombra), faixas de estatística, app bar fixa que ganha elevação ao descolar do topo, abas roláveis no mobile.
- A ficha técnica é gerada de um **spec declarativo** (`CONFIG_SPEC`), o que garante anatomia idêntica em todos os 43 campos.

## Acessibilidade e contraste

Todos os pares de cor que a interface realmente usa foram medidos (script em `scripts/contrast.js`), nos dois temas:

- **0 reprovações** no WCAG 2.1 AA. Texto de corpo vai de 5,1:1 a 16,6:1 — a maioria dos pares passa também no AAA (7:1).
- **Limite de campo de formulário** ganhou token próprio (`--field-border`, 3,4:1 claro / 3,7:1 escuro). Antes usava a mesma cor das divisórias decorativas, a 1,3:1 — falha real do critério 1.4.11, já que a borda é o que identifica o controle. O padrão do próprio MUI (`rgba(0,0,0,0.23)`, ~2,6:1) também não passa; aqui foi deliberadamente elevado.
- **Divisórias decorativas** (`--outline-variant`) seguem suaves de propósito: não carregam informação e são isentas do 1.4.11. Os dois tokens são separados justamente para que um não puxe o outro.
- Foco visível em todos os 44 controles alcançáveis por teclado, verificado navegando por Tab.
- Snackbar anuncia por `role="status"`; erros por `role="alert"`.

O tema escuro segue a lógica de *elevation overlay* do Material: quanto mais alta a superfície, mais clara (`--bg` #070d0b → `--surface` #0e1613 → `--surface-2` #18221e → `--surface-3` #212d28), com viés de matiz esverdeado coerente com o assunto — água preta amazônica.

## Heurísticas de usabilidade (Nielsen / NN/g)

Auditoria das 10 heurísticas e o que mudou:

| # | Heurística | Estado |
|---|---|---|
| 1 | Visibilidade do status | Indicador de salvamento, medidor de score, contadores do checklist e **snackbar** de confirmação |
| 2 | Correspondência com o mundo real | Vocabulário de aquarista e a analogia do rio; nada de jargão de sistema |
| 3 | Controle e liberdade | **Corrigido** — toda exclusão agora é reversível com *Desfazer*, em vez de um diálogo nativo irreversível |
| 4 | Consistência e padrões | Sistema MUI aplicado a todos os campos, botões e superfícies |
| 5 | Prevenção de erro | Helper text reativo antecipa o erro; o import diz **o que** vai entrar e **o que** será substituído antes de confirmar |
| 6 | Reconhecer em vez de lembrar | Faixas ideais visíveis sob cada campo; o infográfico explica o número no lugar onde ele aparece |
| 7 | Flexibilidade e eficiência | **Adicionado** — índice de capítulos para pular direto; navegação por setas nas abas |
| 8 | Estética e design minimalista | Superfícies planas, cor reservada ao dado |
| 9 | Recuperação de erros | **Corrigido** — `alert()` substituído por snackbar que diz o que houve e como resolver |
| 10 | Ajuda e documentação | Os oito capítulos são a documentação, embutida no ponto de uso |

## Como usar

Abra `index.html` diretamente no navegador — não há build, não há dependências, não há servidor. É uma única página autocontida (HTML + CSS + JavaScript vanilla).

Para publicar como site (ex: GitHub Pages), basta habilitar Pages apontando para a branch/pasta deste `index.html`.

## O que o app faz

### Aba Painel

Visão de estado, sem formulário. É a aba que abre por padrão.

- **Score de água (0–100)**, zerado até o dia estar completo: enquanto qualquer um dos 6 parâmetros numéricos estiver vazio, o score aparece como **0** (não uma média parcial otimista) e o medidor mostra quantos campos faltam. O medidor também informa a **idade da leitura** e fica âmbar a partir de 3 dias — um score de cinco dias atrás não descreve a água de hoje.
- **Gates de liberação**: dias consecutivos com água clara (5) e biologia zerada (3).
- **Por parâmetro** (*small multiples*): seis mini-gráficos, um por parâmetro, cada um com a própria faixa ideal sombreada. O score é uma média ponderada — estes mostram qual série o está puxando, que era exatamente o que faltava responder.
- **Histórico**, em duas visões: **Gráfico do score** (linha de série única, faixas de 7/30 dias ou tudo, limiares nomeados em 80 e 50, tooltip com crosshair listando **quais parâmetros saíram da faixa naquele dia**, e navegação por teclado) e **Tabela completa**. Dias incompletos não viram ponto zero na linha — aparecem como marca vazada na base.
- **Exportar / Importar JSON**.

### Aba Parâmetros

- **Registro diário**: temperatura, pH, KH, amônia (NH₃), nitrito (NO₂), nitrato (NO₃) e turbidez, com uma nota livre por dia. Salva automaticamente a cada alteração (sem botão "Salvar", sem risco de perder o que foi digitado).
- **A última leitura preenchida continua ativa**: ao abrir, o formulário carrega o registro mais recente, não um formulário em branco. Ele segue ativo até você iniciar e gravar o próximo. Como editar ali altera aquele dia, um aviso no topo do card diz de que data é a leitura, há quantos dias, e oferece o botão **Registrar hoje**.
- **Plano de ação**: recomendações geradas a partir do último registro e do progresso dos gates.
- **Fases do projeto**: checklist livre (ciclagem, plantio/decoração, quarentena, estabilização, introdução, formação de casais, venda de excedentes) com status e notas por fase.
- **Critérios adicionais do gate**: checklist manual para condições que não vêm de um parâmetro de água (ex: aprovação de um veterinário).

### Aba Configurações

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

**Os capítulos são calculados, não escritos.** A ficha técnica alimenta o infográfico: mude o volume líquido e o turnover, a TPA e a dose de bicarbonato se recalculam; informe o diâmetro da descida e o capítulo 3 emite o veredito na hora (com quantos L/h faltam de escoamento); marque o furo anti-sifão como instalado e as barras do capítulo 4 mudam de cenário. O KH registrado na aba Parâmetros atravessa para o capítulo 5 e define a dose exata de bicarbonato para o volume real do sistema.

Ao final, **Ficha técnica editável**: 43 campos (display, sump, hidráulica, equipamentos, substrato, manutenção, carga estrutural, fauna e notas), pré-preenchidos, com salvamento automático e inclusão no export/import JSON.

> **Divergência conhecida com o relatório:** a seção 10 indica repor 6,8 g de bicarbonato por TPA. Essa conta usa 1 dKH, mas uma troca de 33% a 3 dKH derruba o tampão em ~1 dKH *no sistema inteiro* — a reposição correta é `3 × 30 mg/L × volume trocado`, cerca de 20 g. O painel calcula o valor correto e sinaliza a divergência no capítulo 8.

### Aba Checklist

- **Ações prioritárias**: as 11 recomendações do relatório agrupadas por prioridade (crítica → baixa), cada uma com o impacto explicado e o custo estimado.
- **Painel de progresso**: concluídas, críticas em aberto, custo ainda em aberto (soma automática dos itens não marcados) e medições pendentes. A barra fica vermelha enquanto houver crítica em aberto.
- **Medições pendentes**: os 6 dados que substituem as estimativas `[EST]` e fecham o relatório.
- **Ações próprias**: itens adicionados manualmente, separados dos do relatório (não entram na contagem de progresso do relatório e podem ser removidos; os do relatório não podem).

### Comum a todas as abas

- **Exportar/Importar JSON**: backup manual de tudo (leituras, fases, critérios, configuração do sistema e ações prioritárias) em um arquivo `.json`.

## Onde os dados ficam guardados (limitação atual, honesta)

Tudo é salvo em `localStorage` do navegador — client-side, sem backend. Isso já resolve o problema do artefato original (dados presos a uma conversa específica do Claude, perdidos se a conversa fosse arquivada), mas ainda tem limitações reais:

- Os dados ficam **atrelados a este navegador/dispositivo específico**. Abrir em outro computador ou celular não traz o histórico junto.
- Não há backup automático fora do navegador. **Use "Exportar JSON" periodicamente** e guarde o arquivo em algum lugar seguro (Drive, e-mail para si mesmo, etc.).
- Limpar os dados do navegador (ou trocar de navegador/perfil) apaga o histórico local.

Para um projeto de 6+ meses ligado a decisões comerciais (timing de venda, formação de casais), a recomendação é migrar para um banco de dados real nas próximas semanas — ver seção abaixo.

## Caminho de migração para produção (Supabase)

O arquivo `supabase-schema.sql` já traz o schema mínimo (tabelas `readings`, `phase_data`, `gate_criteria`, `tank_config` e `struct_tasks`). Para migrar:

1. Criar um projeto no [Supabase](https://supabase.com) (tier gratuito é suficiente para este volume de dados).
2. Rodar `supabase-schema.sql` no SQL editor do projeto.
3. Trocar as funções `loadJSON`/`saveJSON` em `index.html` por chamadas à API REST do Supabase (`@supabase/supabase-js` ou `fetch` direto), mantendo intactas as funções puras `paramStatus`, `computeWaterScore`, `evaluateGates` e `deriveActionPlan` — elas não têm nenhuma dependência de armazenamento e podem ser reaproveitadas como estão.
4. Hospedar em Vercel ou Netlify (deploy direto deste repositório), com as chaves do Supabase como variáveis de ambiente.

Isso destrava: link compartilhável de qualquer dispositivo, queries agregadas (médias móveis de 7/30 dias, gráficos de tendência), backup automático e, se um dia fizer sentido, acesso multiusuário (sócio, veterinário, comprador).

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
