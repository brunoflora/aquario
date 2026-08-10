# Relatório Técnico-Estrutural — Aquário Jumbo Ciclídeos Nacionais

**Local:** Balneário Cidade Atlântica, Guarujá/SP
**Sistema:** Display 700 L + sump 108 L
**Início:** Nov/2025 · Ciclagem: Dez/2025
**Data do relatório:** 09/08/2026

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
| Lambaris | *Astyanax* sp. | 6 | ~5 cm | 10–12 cm | 2,2× |

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

| # | Prioridade | Ação | Impacto | Custo |
|---|---|---|---|---|
| 1 | 🔴 **Crítica** | Furo anti-sifão no recalque | Evita inundação em queda de energia | ~R$ 0 |
| 2 | 🔴 **Crítica** | Corrigir KH 0 → 3 dKH com bicarbonato | Evita colapso de pH e parada da nitrificação | ~R$ 15 |
| 3 | 🔴 **Crítica** | Medir diâmetro da descida e instalar registro no recalque, se < 50 mm | Evita transbordo por descompasso bomba/dreno | ~R$ 60 |
| 4 | 🟠 Alta | Instalar 2 × 300 W + termostato externo, subindo 0,5 °C/dia | Fecha o déficit de 3 °C; melhora digestão e imunidade | ~R$ 400 |
| 5 | 🟠 Alta | Planejar realocação do Pangasius | Remove risco estrutural e 90% da carga orgânica futura | — |
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

*Relatório gerado a partir da documentação do projeto Ciclídeos Nacionais (última atualização de parâmetros: 26/05/2026). As recomendações de segurança estrutural não substituem avaliação de engenheiro habilitado.*
