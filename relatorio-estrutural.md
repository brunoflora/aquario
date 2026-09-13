# Relatório Técnico-Estrutural — Aquário Jumbo Ciclídeos Nacionais

**Local:** Balneário Cidade Atlântica, Guarujá/SP
**Sistema:** Display 700 L + sump 108 L
**Início:** Nov/2025 · Ciclagem: Dez/2025
**Data do relatório:** 09/08/2026 · **Atualizado em:** 13/09/2026 (ver seção 13)

> **Base de cálculo:** medidas confirmadas do projeto. Onde faltam dados (nível real de água, espessura de vidro, diâmetro da tubulação, volume real de rocha), foram usadas estimativas explicitamente marcadas como **[EST]**. Substitua-as pelas medidas reais para fechar o relatório.

---

## 1. Dimensional — Display

| Parâmetro | Valor |
|---|---|
| Comprimento (C) | 200 cm |
| Largura / profundidade (L) | 50 cm |
| Altura (A) | 70 cm |
| Volume bruto | 200 × 50 × 70 = **700.000 cm³ = 700 L** |
| Área de fundo (footprint) | 200 × 50 = **10.000 cm² = 1,00 m²** |
| Área de superfície (troca gasosa) | **1,00 m²** |
| Área frontal de vidro | 200 × 70 = 14.000 cm² = 1,40 m² |
| Área lateral (cada) | 50 × 70 = 3.500 cm² = 0,35 m² |
| Área total de vidro (5 painéis) | **45.000 cm² = 4,50 m²** |
| Relação C:L:A | 4 : 1 : 1,4 |
| Lâmina d'água útil **[EST]** | 65 cm (5 cm de borda livre) |

### Volume líquido real (display)

| Componente | Cálculo | Volume |
|---|---|---|
| Coluna d'água a 65 cm | 200 × 50 × 65 | 650,0 L |
| (−) Deslocamento do substrato | camada 5 cm = 50 L bruto × ~65% de sólidos | −32,5 L |
| (−) Deslocamento das rochas **[EST]** | MixRock + Sansibar | −20,0 L |
| **Volume líquido do display** | | **≈ 597,5 L** |

**Perda vs. volume bruto: −14,6%.** Todo cálculo de dosagem, medicação e TPA deve usar **≈ 598 L**, não 700 L. Usar 700 L gera sobredosagem de ~17%.

---

## 2. Dimensional — Sump

| Parâmetro | Valor |
|---|---|
| Comprimento externo | 94 cm |
| Largura | 34 cm |
| Altura | 34 cm |
| Volume bruto | 94 × 34 × 34 = **108.664 cm³ = 108,7 L** |
| Área de fundo | 94 × 34 = 3.196 cm² = 0,32 m² |
| Soma das câmaras | 39 + 10 + 44 = 93 cm |
| Espessura total de divisórias | 94 − 93 = **1 cm** (≈ 2 placas de 5 mm) |

### Volume por câmara

Duas leituras: **operação** (nível de trabalho estimado em 25 cm) e **capacidade máxima** (34 cm, transbordo).

| Câmara | Função | Comp. | Vol. @ 25 cm (operação) | Vol. @ 34 cm (máx.) | Folga (headroom) |
|---|---|---|---|---|---|
| C1 | Decantação | 39 cm | 33,2 L | 45,1 L | 11,9 L |
| C2 | Biológica | 10 cm | 8,5 L | 11,6 L | 3,1 L |
| C3 | Retorno | 44 cm | 37,4 L | 50,9 L | 13,5 L |
| **Total** | | **93 cm** | **79,1 L** | **107,5 L** | **28,4 L** |

### Volume total do sistema

| | Volume |
|---|---|
| Display líquido | 597,5 L |
| Sump em operação | 79,1 L |
| Tubulação (descida + recalque) **[EST]** | ~5 L |
| **Sistema total em circulação** | **≈ 682 L** |

---

## 3. Hidráulica

### Bomba de retorno — Oceantech 9000 L/h

| Parâmetro | Valor |
|---|---|
| Vazão nominal (head zero) | 9.000 L/h |
| Altura manométrica estimada **[EST]** | 1,2–1,4 m (nível do sump → bocal de retorno) |
| Perdas de carga (curvas, mangueira flexível, união) | ~15–20% adicionais |
| **Vazão real estimada** | **≈ 4.500–5.500 L/h** |

> A mangueira azul flexível é o principal ponto de perda de carga. Trocar por PVC rígido com curvas de raio longo recupera facilmente 10–15% da vazão.

### Turnover (renovação horária)

| Base | Cálculo | Turnover |
|---|---|---|
| Sobre volume do sistema (682 L) | 5.000 ÷ 682 | **7,3× / h** |
| Sobre display líquido (598 L) | 5.000 ÷ 598 | **8,4× / h** |

**Avaliação:** faixa ideal para ciclídeos jumbo com alta carga orgânica é **5–10×/h** pelo sump. O sistema está **dentro do alvo, na metade superior** — adequado.

### Circulação total (retorno + wave maker)

| Fonte | Vazão estimada |
|---|---|
| Retorno | ~5.000 L/h |
| Wave maker 15 W, fluxo cruzado **[EST]** | ~6.000–9.000 L/h |
| **Circulação total** | **≈ 11.000–14.000 L/h** |
| **Movimentação interna** | **≈ 18–23× o volume/h** |

Adequado para evitar zonas mortas em um aquário de 2 m. O fluxo cruzado é a escolha correta para esse comprimento.

### ⚠ Gargalo crítico: capacidade da descida (overflow)

**Este é o dado mais importante que falta no projeto.** A vazão real do sistema é limitada pelo *menor* dos dois: bomba ou descida. Se a descida não escoar 5.000 L/h, o display transborda.

| Diâmetro do tubo de descida | Vazão segura por gravidade (aprox.) |
|---|---|
| 25 mm (¾") | ~800–1.200 L/h |
| 32 mm (1") | ~1.500–2.500 L/h |
| 40 mm (1¼") | ~2.500–3.500 L/h |
| 50 mm (1½") | ~4.000–5.500 L/h |
| 60 mm (2") | ~7.000–9.000 L/h |

**Ação:** medir o diâmetro interno da descida. Se for **inferior a 50 mm**, a bomba de 9.000 L/h está superdimensionada e precisa de **registro de esfera no recalque** para estrangular a vazão até o limite da descida. Sem isso, o sistema opera na iminência de transbordo permanente — só não transbordou ainda porque a bomba já perde vazão na altura manométrica.

---

## 4. ⚠ Segurança anti-transbordamento — análise de queda de energia

Cenário: falta de luz. A bomba para. Água desce do display para o sump por dois caminhos.

### Volume que retorna ao sump

| Fonte | Cálculo | Volume |
|---|---|---|
| **A.** Água acima da entrada do overflow **[EST]** 2 cm | 200 × 50 × 2 cm | **20,0 L** |
| **B.** Sifonagem pelo bocal de retorno, se submerso 3 cm | 200 × 50 × 3 cm | **30,0 L** |
| **Pior caso (A + B)** | | **50,0 L** |
| **Melhor caso (só A, com furo anti-sifão)** | | **20,0 L** |

### Capacidade de absorção do sump

| Cenário | Folga disponível |
|---|---|
| Só na câmara de retorno (C3, +9 cm) | 13,5 L |
| Distribuído por todas as câmaras (+9 cm) | 28,4 L |

### Veredito

| Cenário | Retorno | Absorção | Resultado |
|---|---|---|---|
| Sem furo anti-sifão | 50 L | 28,4 L | ❌ **Transborda ~22 L no chão** |
| Com furo anti-sifão | 20 L | 28,4 L | ✅ Contém, com 8,4 L de margem |
| Com furo + nível de operação 22 cm | 20 L | 38,0 L | ✅ Margem confortável |

### Ações obrigatórias

1. **Furar o tubo de recalque** com um orifício de 3–4 mm logo abaixo da linha d'água do display. É o item de maior impacto e custo zero — quebra o sifão instantaneamente.
2. **Posicionar o bocal de retorno o mais raso possível** (1–2 cm submerso), reduzindo o volume sifonável.
3. **Baixar o nível de operação do sump para 22–24 cm**, criando 10–12 cm de folga.
4. **Marcar a linha de nível máximo** na câmara de retorno com fita, para conferência visual em cada manutenção.
5. **Teste real:** desligar a bomba na tomada com o sistema cheio e cronometrar/medir onde o nível estabiliza no sump. É o único jeito de validar os números acima.

---

## 5. Análise estrutural — carga sobre a laje

### Peso do display cheio

| Componente | Cálculo | Peso |
|---|---|---|
| Água | 597,5 L × 1,0 kg/L | 597,5 kg |
| Areia N00 | 50 L × ~1,5 kg/L | 75,0 kg |
| Rochas (MixRock + Sansibar) | 20 L × ~2,5 kg/L | 50,0 kg |
| Vidro **[EST 15 mm]** | 4,5 m² × 0,015 m × 2.500 kg/m³ | 168,8 kg |
| Móvel / suporte **[EST]** | — | ~60,0 kg |
| **Total display** | | **≈ 951 kg** |

### Peso do sump cheio

| Componente | Peso |
|---|---|
| Água (79 L) | 79,0 kg |
| Mídias (quartzito + cerâmicas + carvão + Purigen) | ~15,0 kg |
| Vidro **[EST 8 mm]** | ~23,8 kg |
| **Total sump** | **≈ 118 kg** |

### Carga distribuída

| Item | Valor |
|---|---|
| **Peso total do sistema** | **≈ 1.069 kg** |
| Footprint do display | 1,00 m² |
| **Carga do display** | **≈ 951 kg/m²** |
| Carga linear na parede (200 cm de frente) | ≈ 475 kg por metro linear |

### ⚠ Alerta estrutural

A NBR 6120 prevê sobrecarga acidental de **150–200 kg/m²** para piso residencial. O display impõe **≈ 951 kg/m² — cerca de 5 a 6 vezes o valor de projeto.**

Isso **não significa** que a laje vai ceder — cargas concentradas são absorvidas se bem posicionadas —, mas exige cuidado real, ainda mais em **edifício de orla, onde a armadura sofre com maresia**:

- O aquário deve estar **encostado em parede estrutural / viga**, nunca no meio do vão da laje.
- O eixo de 2 m deve ficar, de preferência, **perpendicular à direção do vão** da laje, distribuindo a carga entre mais nervuras.
- Se houver qualquer dúvida sobre o posicionamento, **vale uma avaliação de engenheiro estrutural.** É um custo baixo diante do risco.
- Verificar o **regimento do condomínio** — muitos limitam carga em apartamentos.

### Espessura de vidro — verificação

Para 70 cm de altura de coluna e 200 cm de comprimento sem travessa, a espessura recomendada é **15–19 mm** com fator de segurança 3,0.

**Ação:** confirmar a espessura real e a existência de **travessas (contraventamento)** superiores. Sem travessa central ou perimetral, um vidro de 200 cm × 70 cm em 15 mm trabalha no limite — o abaulamento (deflexão) no centro do painel frontal é o sinal a observar.

---

## 6. Filtragem — dimensionamento

### Câmara biológica: gargalo identificado

| | Valor |
|---|---|
| Volume útil da C2 @ 25 cm | **8,5 L** |
| Volume máximo da C2 @ 34 cm | **11,6 L** |
| Mídia declarada no projeto | Quartzite Glass **10 L** + cerâmicas adicionais |

**Conflito:** a câmara de 10 cm não comporta 10 L de quartzito **mais** as cerâmicas. Ou a mídia está compactada acima do nível de trabalho, ou parte dela está alojada em outra câmara.

**Necessidade real:** para a carga projetada (ver seção 7), o alvo é **12–18 L de mídia biológica de alta porosidade** — o dobro da capacidade atual da C2.

**Opções:**

| Solução | Ganho | Observação |
|---|---|---|
| Cesto suspenso na C1 (após o perlon) | +8–12 L | Mais simples, sem obra |
| Reposicionar divisória: C1 39→30 cm, C2 10→19 cm | +7,7 L úteis | Exige recolar vidro |
| Leito fluidizado externo | +alta superfície | Melhor custo-benefício por litro |
| Elevar nível de operação para 30 cm | +2,0 L na C2 | Reduz a folga anti-transbordo — **não recomendado** |

> O quartzito e as cerâmicas já sustentam a carga **atual** (amônia e nitrito zerados confirmam isso). O problema é a carga **futura**, quando o Oscar dobrar de tamanho.

### Filtragem mecânica

| | Valor |
|---|---|
| Área da manta de perlon | 34 × 39 cm ≈ 1.326 cm² (se cobrir a C1 inteira) |
| Carga hidráulica sobre a manta | 5.000 L/h ÷ 0,13 m² ≈ **37.700 L/m²/h** |
| Troca atual | a cada 20–30 dias |

Carga alta, típica de sump compacto. Com peixes de grande porte e alimentação carnívora, **20 dias é o teto** — passar disso transforma a manta em fonte de nitrato em vez de removedor de sólidos. **Sugestão: lavar/trocar a cada 10–14 dias.**

### Filtragem química

| Mídia | Situação | Ação |
|---|---|---|
| Purigen (~1 kg) | Uso prolongado, sem registro de recarga | **Saturado com alta probabilidade.** Regenerar em água sanitária + declorador, ou substituir |
| Carvão ativado (casca de coco) | Sem cronograma | Vida útil real: **4–6 semanas**. Depois disso é apenas mídia biológica passiva. Retirar ou trocar |

**Dose de referência para 682 L:** Purigen ~700 mL a 1 L (ok) · Carvão ativado ~1,5–2 L por ciclo mensal.

---

## 7. Fauna — biometria e projeção de crescimento

### Situação atual

| Espécie | Nome científico | Qtd. | Tam. atual | Tam. adulto | Fator de crescimento |
|---|---|---|---|---|---|
| Oscar Bronze | *Astronotus ocellatus* | 1 | 15 cm | **30–38 cm** | 2,2× |
| Jack Dempsey Blue | *Rocio octofasciata* | 1 | 10 cm | **20–25 cm** | 2,2× |
| Pangasius Albino | *Pangasianodon hypophthalmus* | 1 | 10 cm | **100–130 cm** | ⚠ **11×** |
| Severum Gold ♀/♂ | *Heros efasciatus* | 2 | 10 e 6 cm | **20–25 cm** cada | 2,5× |
| **Green Terror** *(novo, 06/09/2026)* | *Andinoacara rivulatus* | 1 | — | — | — |
| **Cascudo** *(novo, 06/09/2026)* | Loricariidae | 2 | — | — | — |
| Lambaris (alimento vivo, não residente) | *Astyanax* sp. | lote de 20 em 06/09, 13 restantes no mesmo dia | ~5 cm | — | consumidos pelo Oscar |

### Massa e carga orgânica projetadas

| Espécie | Massa atual **[EST]** | Massa adulta **[EST]** |
|---|---|---|
| Oscar | ~90 g | ~600 g |
| Jack Dempsey | ~30 g | ~250 g |
| Pangasius | ~15 g | **~15.000 g** (adulto pleno) |
| Severuns (2) | ~60 g | ~400 g |
| Lambaris (6) | ~15 g | ~90 g |
| **Total sem Pangasius** | **~195 g** | **≈ 1.340 g** |
| **Total com Pangasius** | ~210 g | **≈ 16.340 g** |

**Sem o Pangasius, a biomassa adulta é ~1,34 kg em 598 L = 2,24 g/L.** Isso está confortavelmente dentro do limite para um sistema com sump bem dimensionado (referência prática: até 3–4 g/L com filtragem forte e TPAs regulares).

### ⚠ Pangasius — incompatibilidade estrutural

Este é o **maior problema do sistema**, e é geométrico, não comportamental.

| Critério | Aquário | Pangasius adulto |
|---|---|---|
| Comprimento disponível | 200 cm | 100–130 cm (peixe) |
| Largura para manobra | 50 cm | precisa de ~2× o próprio corpo |
| Volume mínimo da espécie | 598 L | **10.000+ L** |

Mesmo com o crescimento retardado (o que é uma forma de deformação, não de adaptação), atinge 40–60 cm. Nesse tamanho:

- ocupa **um terço do comprimento** do aquário;
- é **cego funcional e propenso a pânico** — no projeto já está registrado que ele é "sensível a sustos". Um Pangasius de 40 cm em pânico dentro de um aquário de 2 m **quebra rochas, arranca equipamento e pode trincar o vidro frontal**;
- sua carga orgânica sozinha excede toda a capacidade biológica atual da C2.

**Recomendação: realocar em até 6–12 meses**, para lago ou aquário público. Não é uma questão de "se", é de quando. E o custo de esperar demais inclui o vidro.

### Territorialidade — área por indivíduo

| | Valor |
|---|---|
| Área de fundo total | 10.000 cm² |
| Ciclídeos territoriais adultos | 4 (Oscar, JD, 2 Severuns) |
| Área média por indivíduo | **2.500 cm² ≈ 50 × 50 cm** |

Suficiente **desde que haja quebra de linha de visão**. Hoje o layout é aberto e minimalista, com forte espaço negativo — belíssimo, mas **funcionalmente hostil** para 4 ciclídeos adultos, porque cada peixe vê todos os outros o tempo todo.

**Sugestão que preserva a estética:** duas ou três colunas verticais de rocha (não pilhas), posicionadas em ~50 cm e ~150 cm do eixo. Elas mantêm a linguagem *gallery aquarium* — na verdade reforçam —, criam três territórios visuais distintos e dão ao casal de Severum um sítio de desova protegido.

---

## 8. Termodinâmica — dimensionamento de aquecimento

**Situação atual: 23 °C. Meta: 25–26 °C. Déficit: 2–3 °C — sem nenhum aquecedor no sistema.**

| Parâmetro | Valor |
|---|---|
| Volume a aquecer | 682 L |
| Área de superfície (perda evaporativa) | 1,00 m² |
| Delta térmico de projeto (inverno em Guarujá, ambiente 18–20 °C) | 6–8 °C |
| Regra prática | 1,0–1,5 W/L para delta de 6–8 °C |
| **Potência necessária** | **≈ 680–1.000 W** |

### Configuração recomendada

| Item | Especificação | Justificativa |
|---|---|---|
| Aquecedores | **2 × 300 W** (ou 2 × 400 W) | Redundância: se um falha desligado, o outro segura; se um falha ligado, sozinho não cozinha 682 L |
| Posição | Câmara 3 do sump (retorno) | Fora do display — invisível, protegido do Oscar, e a água aquecida já sai circulando |
| Controlador | **Termostato externo independente** com sensor no display | O termostato interno de aquecedor é o componente que mais falha em aquário grande |
| Tampa / redução de evaporação | Cobertura parcial | 1 m² de superfície aberta é muita perda evaporativa — a tampa reduz o consumo em 20–30% |

**Nunca use um único aquecedor de 1.000 W.** Numa falha "travado ligado", ele leva 682 L a temperatura letal antes de qualquer intervenção.

**Subir a temperatura devagar: no máximo 0,5 °C por dia.** De 23 para 26 °C leva 6 dias. Subida rápida com KH zero é o caminho mais curto para um colapso de pH.

---

## 9. Química — capacidade tampão (KH 0)

**KH = 0 dKH é a vulnerabilidade mais aguda do sistema.** Sem tampão, o pH não tem inércia: uma TPA, uma decomposição localizada ou um pico de CO₂ noturno pode derrubá-lo de 6,6 para abaixo de 5,0 em horas. Abaixo de pH 6,0 a nitrificação para — e o filtro biológico, hoje funcional, deixa de processar amônia.

### Dosagem para atingir KH 3 dKH

Bicarbonato de sódio (NaHCO₃), grau alimentício:

| Cálculo | Valor |
|---|---|
| 1 dKH = 17,86 mg/L de CaCO₃ equivalente | — |
| NaHCO₃ necessário por dKH | 17,86 × (84 ÷ 50) ≈ **30 mg/L** |
| Para 682 L, por dKH | 30 × 682 ÷ 1.000 ≈ **20,5 g** |
| **De 0 → 3 dKH** | **≈ 61 g de bicarbonato** |

### Protocolo de aplicação

**Não dose de uma vez.** Subida brusca de KH desloca o pH e causa choque osmótico.

| Dia | Dose | KH esperado |
|---|---|---|
| 1 | 20 g dissolvidos em água do aquário, na câmara 3 | ~1 dKH |
| 3 | 20 g | ~2 dKH |
| 5 | 20 g | ~3 dKH |
| 7 | Medir KH e pH | Confirmar 2–4 dKH / pH 6,4–6,8 |

Depois, **repor a cada TPA**: 33% de 682 L = 225 L trocados → repor ~6,8 g de bicarbonato por TPA para manter o KH.

**Alternativa passiva:** coral triturado ou aragonita em meia na câmara 2. Dissolve sozinho conforme o pH cai — autorregulável e à prova de esquecimento. Porém tende a estabilizar o pH em 7,2–7,6, acima da faixa amazônica desejada. **Para a meta de pH 6,4–6,8, o bicarbonato dosado é a via correta.**

---

## 10. Manutenção — volumes calculados

| Operação | Base | Volume / quantidade | Frequência sugerida |
|---|---|---|---|
| TPA de 33% | 682 L | **225 L** | Semanal ou quinzenal |
| TPA de 25% | 682 L | 171 L | Alternativa mais suave |
| TPA de 20% | 682 L | 136 L | Manutenção de rotina |
| Declorador (dose padrão 1 mL/10 L) | 225 L | ~23 mL por TPA | A cada TPA |
| Bicarbonato de reposição | 225 L | ~6,8 g | A cada TPA |
| Sifonagem da C1 | Fundo do sump | — | A cada TPA |
| Troca de perlon | — | — | **10–14 dias** (revisado, era 20–30) |
| Carvão ativado | 682 L | 1,5–2 L | 4–6 semanas |
| Purigen | 682 L | ~700 mL | Regenerar a cada 4–6 meses |

**Nota sobre a TPA:** repor 225 L exige reservatório. Com KH 0 e água de rua tratada, **preparar a água com antecedência** (aeração + declorador + bicarbonato, 24 h antes) evita o choque duplo de temperatura e química.

---

## 11. Síntese — prioridades

| # | Prioridade | Ação | Impacto | Custo | Status em 13/09/2026 |
|---|---|---|---|---|---|
| 1 | 🔴 **Crítica** | Furo anti-sifão no recalque | Evita inundação em queda de energia | ~R$ 0 | Não confirmado — pendente |
| 2 | 🔴 **Crítica** | Corrigir KH 0 → 3 dKH com bicarbonato | Evita colapso de pH e parada da nitrificação | ~R$ 15 | **Ainda não resolvido — KH segue em 0°dKH mais de um mês depois.** Protocolo de dosagem reiniciado em 13/09 (ver seção 13) |
| 3 | 🔴 **Crítica** | Medir diâmetro da descida e instalar registro no recalque, se < 50 mm | Evita transbordo por descompasso bomba/dreno | ~R$ 60 | Não medido — pendente |
| 4 | 🟠 Alta | Instalar 2 × 300 W + termostato externo, subindo 0,5 °C/dia | Fecha o déficit de 3 °C; melhora digestão e imunidade | ~R$ 400 | ✅ Concluído — termostato ativo, 26–28°C confirmado. Modelo/potência exatos ainda não registrados |
| 5 | 🟠 Alta | Planejar realocação do Pangasius | Remove risco estrutural e 90% da carga orgânica futura | — | Ainda no sistema em 13/09/2026 — 9-10 meses após o prazo original de 6-12 meses ter começado a contar; status do plano não confirmado |
| 6 | 🟡 Média | Expandir mídia biológica para 12–18 L | Prepara o sistema para a biomassa adulta | ~R$ 250 |
| 7 | 🟡 Média | Confirmar espessura de vidro e travessas | Segurança estrutural do painel de 200 × 70 cm | — |
| 8 | 🟡 Média | Avaliar posicionamento sobre a laje (parede estrutural) | ~951 kg/m² em edifício de orla | — |
| 9 | 🟢 Baixa | 2–3 colunas verticais de rocha para quebra de visão | Reduz agressividade futura, mantém a estética | ~R$ 150 |
| 10 | 🟢 Baixa | Fotoperíodo fixo de 8 h com timer | Estabiliza ritmo circadiano e reduz algas | ~R$ 50 |
| 11 | 🟢 Baixa | Reduzir troca de perlon para 10–14 dias | Menos nitrato acumulado | — |

---

## 12. Dados pendentes para fechar o relatório

Estes seis itens substituem as estimativas **[EST]** e são o que falta para o dimensionamento ficar exato:

1. **Diâmetro interno da tubulação de descida (mm)** — define o teto real de vazão do sistema
2. **Espessura do vidro do display (mm)** e existência de travessas
3. **Altura real da lâmina d'água** no display (borda superior → superfície)
4. **Altura real do nível de operação no sump** (fundo → superfície na C3)
5. **Desnível vertical** entre a superfície do sump e o bocal de retorno (m)
6. **Resultado do teste de queda de energia** — desligar a bomba e medir onde o nível estabiliza

Com esses seis números, todas as tabelas de vazão, turnover, folga anti-transbordo e carga estrutural passam de estimadas a medidas.

---

---

## 13. Atualização — 13/09/2026

Com base em relatório de manejo enviado pelo usuário nesta data. Convenção: `[relatório]` = dado novo desta atualização; `[ficha]` = valor da ficha técnica/relatório original (08/2025–08/2026), mantido como está.

### 13.1 Fauna — duas entradas novas

**Green Terror** (*Andinoacara rivulatus*) e **2 Cascudos** (Loricariidae) foram adicionados no sistema no **domingo, 06/09/2026**. Ver tabela atualizada na seção 7.

O mesmo dia, um lote de **20 lambaris** foi introduzido — não como plantel residente, mas como **alimento vivo para o Oscar**. Das 20 unidades, 13 restavam ainda em 06/09 (7 já consumidas). Isso não altera a biomassa residente calculada na seção 7.

O Green Terror é mais um ciclídeo territorial de porte médio-grande somando-se aos 4 já existentes (Oscar, Jack Dempsey, 2 Severuns) — a análise de territorialidade da seção 7 (área média de 2.500 cm²/indivíduo) deve ser revisada para 5 indivíduos territoriais, reduzindo a área média disponível. Não recalculado aqui por falta de biometria atual do Green Terror.

### 13.2 Aquecimento — item 4 da síntese, concluído

O relatório de 13/09 confirma: **"Temperatura: 26°C a 28°C (Controlada estritamente via termostato)."** Isso resolve o déficit de 2–3°C identificado na seção 8 deste relatório (situação de agosto: 23°C, sem nenhum aquecedor). Modelo e potência exatos do equipamento instalado **não foram informados** — recomenda-se confirmar que segue a lógica de redundância (2 unidades) descrita na seção 8, e não um único aquecedor de alta potência.

### 13.3 KH/pH — item 2 da síntese, ainda crítico

O relatório de 13/09 mede **KH = 0°dKH** e **pH = 6,4–6,6**. Esse é exatamente o mesmo problema identificado na seção 9 deste relatório (data original: agosto/2026) — ou seja, **passou-se mais de um mês sem que a correção fosse concluída ou sem que ela se sustentasse**. Não há como saber, a partir dos dados disponíveis, se o KH nunca chegou a subir ou se subiu e caiu de novo — isso não foi inferido.

**Novo protocolo de correção, conforme relatório do usuário (mais detalhado que a seção 9 quanto ao ponto de dosagem):**

1. **Curto prazo:** bicarbonato de sódio, 1–2 colheres de sopa diluídas em água do aquário, dosadas na **Câmara 3 (recalque)** — não na Câmara 2, como uma das alternativas passivas da seção 9 sugeria. Dosagem diária, testando KH/pH a cada 12h, até o teste de KH virar de cor na 3ª–4ª gota (~3–4°dKH).
2. **Longo prazo (tamponamento passivo):** aragonita grossa, conchas moídas ou dolomita, em bags microperfurados, na **base da Câmara 1** (abaixo do perlon) ou **fundo da Câmara 3**. Restrição explícita do relatório: **a Câmara 2 deve ficar 100% livre** — a fresta de passagem de 1 cm entre C2 e C3 não pode ser obstruída por mídia, sob risco de travar o fluxo e transbordar o sump.
3. **Manutenção de rotina:** perlon lavado/trocado semanalmente (mais frequente que os 10–14 dias já revisados na seção 10), sifonagem focada a cada TPA, e TPA agressiva de **30–50% semanal** (a seção 10 previa 33% semanal ou quinzenal).

### 13.4 Discrepância nas dimensões do sump — NÃO resolvida

O relatório de 13/09 traz uma remedição do sump com números diferentes dos usados neste relatório desde agosto:

| Item | Este relatório (seção 2, agosto/2026) | Relatório de 13/09/2026 |
|---|---|---|
| Dimensões externas | 94 × 34 × 34 cm | 90 × 30 × 41 cm |
| Volume bruto | 108,7 L | ~110 L |
| Câmaras (comprimento) | C1 39cm · C2 10cm · C3 44cm | C1 40cm · C2 10cm · C3 40cm |

A altura mudou de 34cm para 41cm — uma diferença grande o suficiente para alterar significativamente os cálculos de folga anti-transbordo (seção 4) e capacidade de mídia biológica (seção 6), que foram feitos sobre a base de 34cm.

**Decisão tomada aqui: não recalcular as seções 2, 4 e 6 a partir dos novos números.** Fazer isso exigiria decidir qual medição está correta sem uma fonte capaz de arbitrar isso — e as tabelas de segurança (folga de transbordo, headroom por câmara) são sensíveis demais a esse número para migrar sem confirmação física. **Ação recomendada: remedir o sump com trena, das duas formas (externa e por câmara), e atualizar este relatório numa próxima revisão.**

### 13.5 Pangasius — prazo de realocação vencendo

A seção 7 já registrava, desde a origem, que o Pangasius era estruturalmente incompatível com o sistema e recomendava realocação em 6–12 meses. Contando a partir do início do projeto (Nov/2025), esse prazo está entre o meio e o fim da janela em 13/09/2026. O relatório de manejo mais recente lista o Pangasius como parte do plantel atual, sem mencionar se a realocação foi planejada, iniciada ou adiada. Este ponto segue como pendência aberta.

### 13.6 Pendências que seguem sem resposta

- Diâmetro da descida (item 3 da síntese) — ainda não medido
- Furo anti-sifão (item 1 da síntese) — status não confirmado
- Modelo/potência exata do aquecedor instalado
- Iluminação — modelo e fotoperíodo
- Confirmação física das dimensões do sump (seção 13.4)
- Status real do plano de realocação do Pangasius
- GH e Nitrato atuais (o relatório de 13/09 só trouxe temperatura, NH₃, NO₂, pH e KH)
- Volume em litros do Nano Rings (1kg) e do Nano Block (4un) — vendidos por peso/unidade, não por litro; sem isso não dá para fechar a soma de mídia biológica contra a meta de 12–18L da seção 6
- 🔴 **Nova, crítica:** o perlon + K1 fluidizado estão dentro da Câmara 2 — mesma câmara que o passo 2 do protocolo de KH (seção 13.3) exige manter 100% livre para não obstruir a fresta de 1cm. Confirmar se essa instalação é anterior ao protocolo ou se é uma tensão real a corrigir (ver seção 13.7.1)

### 13.7 Expansão de mídia biológica (mesmo dia, addendum)

O usuário comprou mídia adicional para a Câmara 2 (o gargalo identificado na seção 6):

| Produto | Marca | Tipo | Quantidade | Volume/peso declarado |
|---|---|---|---|---|
| Miracle Baby Quartzite Glass | AquaTank | Cerâmica estática, porosa | 01× — **confirmado: é o mesmo saco já contado como "Quartzite Glass 10L" na ficha técnica, não é adicional** | 10L (já somado desde antes) |
| Nano Rings High Energy | Ocean Tech | Cerâmica estática, em anéis | 01× | 1kg (peso — fabricante não declara litros) |
| Nano Block | Ocean Tech | Cerâmica estática, em blocos | **04 unidades totais — confirmado pelo usuário** | não declarado em litros (vendido por unidade) |
| Ocean K (K1) "Reator de Biofilme" | Ocean Tech | **Leito móvel/fluidizado** — mídia solta que precisa de fluxo de água/ar para tumbling, não se comporta como as demais | 01× | 1,5L |

**Balanço de volume, com o que dá para calcular sem inferir:**
- Volume já contado antes desta expansão: 10L (Quartzite Glass/Miracle Baby) + cerâmicas adicionais não quantificadas
- Volume **novo** confirmado em litros: apenas **+1,5L** (Ocean K/K1)
- Nano Rings (1kg) e Nano Block (4un) **não têm conversão para litros** sem saber a densidade/dimensão de cada peça — não vou estimar isso sem dado real, então eles somam ao sistema mas ficam fora da conta de litros contra a meta de 12–18L da seção 6

**Conclusão honesta:** não é possível confirmar se a meta de 12–18L da Câmara 2 foi atingida. O que dá para afirmar com os números disponíveis é que o volume conhecido subiu de 10L (+ cerâmicas não quantificadas) para pelo menos **11,5L** (+ mesmas cerâmicas não quantificadas + Nano Rings + Nano Block, ainda sem conversão) — ou seja, a expansão ajuda, mas sem os volumes reais de Nano Rings e Nano Block não dá para saber se fechou o gargalo.

**Ocean K (K1) — confirmado pelo usuário em 13/09/2026:** está instalado **dentro da Câmara 2**, abaixo da manta de perlon, com fluxo de água e movimento constante — funcionando como leito fluidizado ativo, não solto e parado. Isso resolve a dúvida sobre se a mídia cumpre sua função (cumpre).

#### 13.7.1 🔴 Tensão identificada: perlon + K1 na própria Câmara 2

Essa mesma confirmação expõe um conflito com o **passo 2 do protocolo de correção de KH** (seção 13.3), que diz textualmente: *"a Câmara 2 deve ser mantida 100% livre. A fresta inferior de passagem de 1 cm não pode sofrer obstrução mecânica por mídias, evitando o travamento do fluxo hidráulico e riscos de transbordamento do Sump."*

Hoje a Câmara 2 — que tem apenas 10 cm de comprimento na arquitetura do relatório de 13/09 (seção 13.4) — abriga **ao mesmo tempo**: a manta de perlon (retém sólidos, acumula gradualmente) e a mídia K1 em movimento constante. Dois pontos não resolvidos aqui:

1. **Não sei se essa instalação é anterior ao protocolo de KH** (e a instrução de "manter livre" se referia só à mídia alcalinizante nova do passo 2, não ao que já estava montado) — ou se é uma **inconsistência real** entre a prática atual e a própria recomendação de segurança do usuário.
2. Perlon suja progressivamente ao longo dos dias entre trocas (a própria seção 10 já recomenda trocar semanalmente por esse motivo). Numa câmara de só 10 cm, com a fresta de passagem de apenas 1 cm no fundo, o acúmulo de sólidos no perlon **antes da próxima troca semanal** pode ser justamente o tipo de obstrução gradual que o protocolo de KH tentava evitar — isso não foi testado nem medido, é um risco a monitorar, não um fato constatado.

**Não decidido aqui se a instalação precisa mudar** — fica como pergunta para o usuário confirmar intenção e, se for o caso, decidir se reposiciona o perlon/K1 para C1 ou C3, ou se mantém como está por já funcionar assim há mais tempo.

---

*Relatório gerado a partir da documentação do projeto Ciclídeos Nacionais (última atualização de parâmetros: 26/05/2026; atualização de manejo incorporada em 13/09/2026 — seção 13). As recomendações de segurança estrutural não substituem avaliação de engenheiro habilitado.*
