# Parâmetros da Água do Aquário — Ciclídeos Nacionais

Painel de acompanhamento do aquário jumbo de ciclídeos nacionais, em três abas: **Parâmetros** (registro diário, score ponderado da qualidade da água e os *gates* — critérios de liberação — para introdução de novas espécies, hoje especificamente o Green Terror), **Configurações** (o sistema explicado em formato de infográfico narrativo, com a ficha técnica editável ao final) e **Checklist** (as 11 ações prioritárias do relatório estrutural e as 6 medições pendentes, com progresso e custo em aberto).

A interface usa uma analogia de rio amazônico que não é decorativa — ela mapeia função: o display é *o rio*, o sump é *a várzea* (na Amazônia é a planície alagada que filtra o rio), a hidráulica é *a correnteza*, a queda de energia é *a cheia*, o KH 0 é *água preta*, a carga na laje é *o leito* e a manutenção é *o calendário das águas*.

Este projeto nasceu de um artefato React que rodava dentro de uma conversa do Claude (persistência via `window.storage`). Ver `HANDOFF.md` para o histórico completo do porquê da migração, e `relatorio-estrutural.md` para o relatório técnico-estrutural completo (dimensional, hidráulica, carga estrutural, fauna e prioridades) que embasa os valores padrão da aba Configurações.

## Como usar

Abra `index.html` diretamente no navegador — não há build, não há dependências, não há servidor. É uma única página autocontida (HTML + CSS + JavaScript vanilla).

Para publicar como site (ex: GitHub Pages), basta habilitar Pages apontando para a branch/pasta deste `index.html`.

## O que o app faz

### Aba Parâmetros

- **Registro diário**: temperatura, pH, KH, amônia (NH₃), nitrito (NO₂), nitrato (NO₃) e turbidez, com uma nota livre por dia. Salva automaticamente a cada alteração (sem botão "Salvar", sem risco de perder o que foi digitado).
- **Score de água (0–100), zerado até completar o registro do dia**: enquanto qualquer um dos 6 parâmetros numéricos do dia estiver vazio, o score aparece como **0** (não uma média parcial otimista) e o painel mostra quantos campos ainda faltam (ex: "3 de 6 campos em aberto") — tanto no medidor quanto no plano de ação. Assim que os 6 estiverem preenchidos, o score real é calculado como média ponderada do status de cada parâmetro (bom/alerta/ruim). Pesos: temperatura 20, pH 15, KH 10, NH₃ 20, NO₂ 20, NO₃ 10, turbidez 5.
- **Gates de liberação**: contagem de dias consecutivos (por data, não por ordem de digitação) com água clara (5 dias) e biologia zerada — NH₃/NO₂ ≈ 0 (3 dias). Quando os dois critérios são atendidos, o painel indica que o ambiente está pronto para o Green Terror.
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

Ao final, **Ficha técnica editável**: todos os campos do relatório (display, sump, hidráulica, equipamentos, substrato, manutenção, carga estrutural, fauna e notas), pré-preenchidos, com salvamento automático e inclusão no export/import JSON.

### Aba Checklist

- **Ações prioritárias**: as 11 recomendações do relatório agrupadas por prioridade (crítica → baixa), cada uma com o impacto explicado e o custo estimado.
- **Painel de progresso**: concluídas, críticas em aberto, custo ainda em aberto (soma automática dos itens não marcados) e medições pendentes. A barra fica vermelha enquanto houver crítica em aberto.
- **Medições pendentes**: os 6 dados que substituem as estimativas `[EST]` e fecham o relatório.
- **Ações próprias**: itens adicionados manualmente, separados dos do relatório (não entram na contagem de progresso do relatório e podem ser removidos; os do relatório não podem).

### Comum às três abas

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
