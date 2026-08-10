# Parâmetros da Água do Aquário — Ciclídeos Nacionais

Painel de acompanhamento do aquário jumbo de ciclídeos nacionais, em duas abas: **Parâmetros** (registro diário, score ponderado da qualidade da água e os *gates* — critérios de liberação — para introdução de novas espécies, hoje especificamente o Green Terror) e **Configurações** (ficha de referência da configuração física do sistema, com os números do relatório técnico-estrutural).

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

Ficha de referência da montagem física, já pré-preenchida com os números do relatório técnico-estrutural (09/08/2026):

- **Aquário principal (display)**: dimensões, volume bruto/líquido, lâmina d'água útil, espessura de vidro, material, datas de montagem/ciclagem.
- **Sump**: dimensões, volume bruto e em operação, detalhe das 3 câmaras (decantação/biológica/retorno), espessura de vidro, bomba de retorno (modelo, vazão nominal e real estimada), mídias mecânica e biológica.
- **Hidráulica & segurança anti-transbordo**: diâmetro da descida (dado crítico ainda pendente de medição), altura manométrica, turnover, wave maker, status do furo anti-sifão e registro do teste de queda de energia.
- **Equipamentos**: aquecedor, iluminação, bombas adicionais, CO₂, controlador.
- **Substrato, decoração e manutenção**: substrato, rochas, plantas, % e frequência de TPA, troca de mídia filtrante.
- **Carga estrutural**: peso total do sistema, carga por m² e notas de posicionamento sobre a laje.
- **Fauna atual**: espécies, quantidade, tamanho atual/adulto e observações de compatibilidade (inclui o alerta de incompatibilidade do Pangasius).
- **Ações prioritárias (relatório estrutural)**: checklist com as 11 recomendações do relatório, por prioridade (🔴 crítica → 🟢 baixa), marcável conforme cada ação é concluída.

Tudo nesta aba também salva automaticamente e entra no export/import JSON.

### Comum às duas abas

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
