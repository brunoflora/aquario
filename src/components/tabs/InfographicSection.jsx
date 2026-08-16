import { useMemo } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { useAppState } from "../../state/AppStateProvider.jsx";
import { computeSystem, fmtBR, DOWNPIPE_TABLE } from "../../domain/system.js";

const TONE_SEVERITY = { good: "success", warn: "warning", bad: "error", info: "info" };

function ToneAlert({ tone = "info", children }) {
  return <Alert severity={TONE_SEVERITY[tone] || "info"} sx={{ mb: 2 }}>{children}</Alert>;
}

function Stat({ label, value, note, tone }) {
  const color = tone === "good" ? "success.main" : tone === "bad" ? "error.main" : tone === "warn" ? "warning.main" : "text.primary";
  return (
    <Grid item xs={6} sm={4} md={2.4}>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="h6" color={color}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">{note}</Typography>
    </Grid>
  );
}

function Facts({ rows }) {
  return (
    <Table size="small" sx={{ mb: 2 }}>
      <TableBody>
        {rows.map(([label, value], i) => (
          <TableRow key={i}>
            <TableCell sx={{ border: 0, pl: 0 }}>{label}</TableCell>
            <TableCell sx={{ border: 0, pr: 0 }} align="right"><strong>{value}</strong></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function Meter({ label, valueLabel, pct, tone, verdict }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" sx={{ justifyContent: "space-between" }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" fontWeight={700}>{valueLabel}</Typography>
      </Stack>
      <LinearProgress variant="determinate" value={Math.min(100, pct)} color={TONE_SEVERITY[tone]} sx={{ height: 10, borderRadius: 5, my: 0.5 }} />
      <Typography variant="caption" color={tone === "good" ? "success.main" : "error.main"}>{verdict}</Typography>
    </Box>
  );
}

export default function InfographicSection() {
  const { state, updateConfig } = useAppState();
  const s = useMemo(() => computeSystem(state.config, state.readings), [state.config, state.readings]);

  const turnoverOk = s.turnover >= 5 && s.turnover <= 10;
  const khTone = s.lastKh !== null && s.lastKh >= 2 ? "good" : "bad";

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">A ficha do sistema · relatório de 09/08/2026</Typography>
          <Typography variant="h5" gutterBottom>Todo aquário amazônico é um rio encurtado</Typography>
          <Typography paragraph color="text.secondary">
            Lá fora, o Oscar e o Severum vivem num sistema de milhares de quilômetros que se autorregula: a cheia
            dilui, a várzea filtra, a mata tampona. Aqui esse rio tem 2 metros, e cada uma dessas funções virou um
            equipamento que pode falhar numa terça-feira à noite.
          </Typography>
          <Typography paragraph color="text.secondary">
            Esta aba é o mapa desse rio encurtado — oito capítulos, dos litros reais até o peso na laje. Onde o
            relatório usou estimativa, está marcado <strong>[EST]</strong>.
          </Typography>
          <Grid container spacing={2}>
            <Stat label="Volume real" value={`${fmtBR(s.netTank, 0)} L`} note="dose por este número, não por 700" />
            <Stat label="Em circulação" value={`${fmtBR(s.totalSystem, 0)} L`} note="display + sump + tubulação" />
            <Stat label="Turnover" value={`${fmtBR(s.turnover, 1).replace(".", ",")}×/h`} note={turnoverOk ? "alvo 5–10×/h · dentro da faixa" : "alvo 5–10×/h · fora da faixa"} tone={turnoverOk ? "good" : "warn"} />
            <Stat label="Sobre a laje" value="1.069 kg" note="951 kg/m² no footprint" tone="bad" />
            <Stat label="Tampão medido" value={s.lastKh === null ? "—" : `${fmtBR(s.lastKh, 1).replace(".", ",")} dKH`} note={s.lastKh === null ? "sem medição de KH registrada ainda" : s.lastKh >= 2 ? "tampão presente · pH com inércia" : "pH sem nenhuma inércia"} tone={khTone} />
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">O caminho da água</Typography>
          <Typography variant="h6" gutterBottom>Um circuito fechado, com um trecho ainda no escuro</Typography>
          <Typography paragraph color="text.secondary">
            A água faz esta volta cerca de sete vezes por hora. Ela é tão rápida quanto o trecho mais estreito — e
            o trecho mais estreito nunca foi medido.
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            {[
              { vol: "598 L", name: "O rio", note: "display 200×50×70" },
              { arrow: "→ descida Ø?", bad: true },
              { vol: "33 L", name: "C1 · decantação", note: "manta de perlon" },
              { arrow: "→" },
              { vol: "8,5 L", name: "C2 · biológica", note: "gargalo — precisa 12–18 L", bad: true },
              { arrow: "→" },
              { vol: "37 L", name: "C3 · retorno", note: "bomba Oceantech" },
              { arrow: "↺ ~5.000 L/h" },
            ].map((n, i) => n.arrow ? (
              <Typography key={i} color={n.bad ? "error.main" : "text.secondary"} fontWeight={n.bad ? 700 : 400}>{n.arrow}</Typography>
            ) : (
              <Box key={i} sx={{ border: 1, borderColor: n.bad ? "error.main" : "divider", borderRadius: 1, p: 1, minWidth: 120, textAlign: "center" }}>
                <Typography variant="subtitle2" component="div">{n.vol}</Typography>
                <Typography variant="caption" component="div">{n.name}</Typography>
                <Typography variant="caption" component="div" color="text.secondary">{n.note}</Typography>
              </Box>
            ))}
          </Stack>
          <ToneAlert tone="warn">
            Dois pontos frágeis já aparecem no desenho: a <strong>descida sem diâmetro conhecido</strong>
            (capítulo 3) e a <strong>câmara biológica menor que a necessidade futura</strong> (capítulo 2).
          </ToneAlert>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">01 · O rio · display</Typography>
          <Typography variant="h6" gutterBottom>Você vê 700 litros. Existem 598.</Typography>
          <Typography paragraph color="text.secondary">
            200 × 50 × 70 cm dá proporção de corredeira, não de poça: quatro vezes mais comprido que largo,
            exatamente o formato que um ciclídeo territorial usa para dividir espaço. Mas o volume de catálogo é
            uma ficção — substrato, rocha e borda livre comem <strong>102 litros</strong>.
          </Typography>
          <Facts rows={[
            ["Coluna d'água a 65 cm [EST]", "650,0 L"],
            ["− substrato (areia N00)", "−32,5 L"],
            ["− rochas [EST]", "−20,0 L"],
            ["Volume líquido", `${fmtBR(s.netTank, 1).replace(".", ",")} L`],
            ["Área de superfície", "1,00 m²"],
            ["Área total de vidro", "4,50 m²"],
          ]} />
          <ToneAlert tone="bad">
            <strong>Dosar por 700 L gera 17% de sobredose.</strong> Medicamento, declorador, bicarbonato,
            fertilizante: tudo se calcula sobre <strong>{fmtBR(s.netTank, 0)} L</strong>. Num tratamento com
            metronidazol ou sal, essa diferença é a distância entre a dose terapêutica e a dose que danifica
            brânquia.
          </ToneAlert>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">02 · A várzea · sump</Typography>
          <Typography variant="h6" gutterBottom>Quem filtra o rio não é o rio: é a planície que ele alaga</Typography>
          <Typography paragraph color="text.secondary">
            Na Amazônia a água limpa na várzea — o alagado raso onde ela desacelera, larga o sedimento e encontra
            bactéria. O sump é essa várzea, com 94 cm e três câmaras. O problema é que a câmara do meio, a que
            hospeda a bactéria, é <strong>a menor das três</strong>.
          </Typography>
          <Stack direction="row" sx={{ mb: 2, borderRadius: 1, overflow: "hidden" }}>
            {[
              { flex: 39, name: "C1 · decantação", val: "33,2 L", sub: "39 cm · perlon" },
              { flex: 10, name: "C2 · bio", val: "8,5 L", sub: "10 cm", bad: true },
              { flex: 44, name: "C3 · retorno", val: "37,4 L", sub: "44 cm · bomba + aquecedor" },
            ].map((seg) => (
              <Box key={seg.name} sx={{ flex: seg.flex, p: 1, textAlign: "center", bgcolor: seg.bad ? "error.light" : "action.hover", borderRight: 1, borderColor: "background.paper" }}>
                <Typography variant="caption" display="block" noWrap>{seg.name}</Typography>
                <Typography variant="body2" fontWeight={700} noWrap>{seg.val}</Typography>
                <Typography variant="caption" display="block" noWrap>{seg.sub}</Typography>
              </Box>
            ))}
          </Stack>
          <ToneAlert tone="bad">
            <strong>A conta não fecha.</strong> A C2 comporta 8,5 L no nível de trabalho. O projeto declara 10 L
            de quartzito mais cerâmicas — ou a mídia está compactada acima da linha d'água, ou parte dela mora em
            outra câmara.
            <br />Hoje isso não aparece: amônia e nitrito zerados provam que a colônia dá conta da carga atual. A
            conta quebra quando o Oscar dobrar de tamanho. Alvo real: <strong>12–18 L de mídia porosa</strong>.
          </ToneAlert>
          <ToneAlert tone="info">
            <strong>Saída sem obra:</strong> cesto suspenso na C1, logo após o perlon, rende +8 a 12 L. Recolar
            divisória (C1 39→30, C2 10→19 cm) rende +7,7 L, mas exige esvaziar o sump.
          </ToneAlert>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">03 · A correnteza · hidráulica</Typography>
          <Typography variant="h6" gutterBottom>Correnteza não se mede pela bomba. Mede-se pelo gargalo.</Typography>
          <Typography paragraph color="text.secondary">
            A Oceantech promete 9.000 L/h em papel — número medido com a bomba deitada no chão, sem cano. Depois
            de 1,3 m de altura e de uma mangueira flexível azul, entrega perto de <strong>5.000 L/h</strong>. Isso
            está ótimo: dá 7,3 renovações por hora, no terço superior da faixa ideal para ciclídeo grande.
          </Typography>
          <Typography paragraph color="text.secondary">
            Só que a bomba empurra por cima e a gravidade devolve por baixo. <strong>Se a descida não escoar os
            mesmos 5.000 L/h, o display transborda</strong> — e o diâmetro dela nunca foi medido.
          </Typography>
          <Table size="small" sx={{ mb: 2 }}>
            <TableBody>
              {DOWNPIPE_TABLE.map((row) => {
                const ok = row.max >= s.flowReal;
                const isCurrent = s.downpipe.measured && s.downpipe.mm >= row.mm &&
                  (row === DOWNPIPE_TABLE[DOWNPIPE_TABLE.length - 1] || s.downpipe.mm < DOWNPIPE_TABLE[DOWNPIPE_TABLE.indexOf(row) + 1].mm);
                return (
                  <TableRow key={row.mm} selected={isCurrent}>
                    <TableCell sx={{ border: 0, pl: 0 }}>{row.mm} mm</TableCell>
                    <TableCell sx={{ border: 0 }}>até ~{fmtBR(row.max, 0)} L/h</TableCell>
                    <TableCell sx={{ border: 0, pr: 0 }} align="right">
                      <Typography variant="caption" color={ok ? "success.main" : "error.main"}>{ok ? "cabe" : "não cabe"}</Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {!s.downpipe.measured ? (
            <ToneAlert tone="warn">
              <strong>A descida ainda não foi medida.</strong> Preencha o diâmetro interno na ficha técnica abaixo
              e este bloco calcula na hora se a bomba de {fmtBR(s.flowReal, 0)} L/h cabe no dreno.
            </ToneAlert>
          ) : s.downpipe.ok ? (
            <ToneAlert tone="good">
              <strong>Descida de {fmtBR(s.downpipe.mm, 0)} mm escoa até ~{fmtBR(s.downpipe.capacity, 0)} L/h</strong>{" "}
              e a bomba entrega {fmtBR(s.flowReal, 0)} L/h. O dreno dá conta — sem necessidade de registro no
              recalque.
            </ToneAlert>
          ) : (
            <ToneAlert tone="bad">
              <strong>Descida de {fmtBR(s.downpipe.mm, 0)} mm escoa só ~{fmtBR(s.downpipe.capacity, 0)} L/h, e a
              bomba empurra {fmtBR(s.flowReal, 0)} L/h.</strong> Faltam {fmtBR(s.flowReal - s.downpipe.capacity, 0)}{" "}
              L/h de escoamento: instale registro de esfera no recalque e estrangule a vazão até o limite do dreno.
            </ToneAlert>
          )}
          <Typography color="text.secondary">
            Somando o wave maker de fluxo cruzado (~6.000–9.000 L/h [EST]), a movimentação interna chega a
            <strong> 18–23× o volume por hora</strong> — o suficiente para não haver zona morta em 2 metros de
            comprimento. O fluxo cruzado é a escolha certa para esse formato.
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">04 · A cheia · queda de energia</Typography>
          <Typography variant="h6" gutterBottom>Toda várzea tem um limite de cheia</Typography>
          <Typography paragraph color="text.secondary">
            Falta luz. A bomba para e o rio desce para a várzea por dois caminhos: a água que está acima da
            entrada do overflow, e a que o bocal de retorno sifona de volta pelo cano. O sump tem{" "}
            {fmtBR(s.headroom, 1).replace(".", ",")} litros de folga. A pergunta é quanto desce.
          </Typography>
          <Meter
            label="Sem furo anti-sifão" valueLabel="50,0 L descem"
            pct={(50 / 60) * 100} tone={50 <= s.headroom ? "good" : "bad"}
            verdict={50 <= s.headroom ? `✓ Contém, com ${fmtBR(s.headroom - 50, 1).replace(".", ",")} L de margem` : `✕ Transborda ~${fmtBR(50 - s.headroom, 0)} L no chão`}
          />
          <Meter
            label="Com furo anti-sifão de 3 mm" valueLabel="20,0 L descem"
            pct={(20 / 60) * 100} tone={20 <= s.headroom ? "good" : "bad"}
            verdict={20 <= s.headroom ? `✓ Contém, com ${fmtBR(s.headroom - 20, 1).replace(".", ",")} L de margem` : `✕ Transborda ~${fmtBR(20 - s.headroom, 0)} L no chão`}
          />
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
            escala 0–60 L · folga no sump: {fmtBR(s.headroom, 1).replace(".", ",")} L
          </Typography>
          <TextField
            select fullWidth label="Estado do furo anti-sifão" sx={{ mb: 2, maxWidth: 360 }}
            value={state.config["hyd-antisiphon-done"] || "nao"}
            onChange={(e) => updateConfig({ "hyd-antisiphon-done": e.target.value })}
            helperText="Muda o cenário calculado acima e fica salvo na ficha do sistema."
          >
            <MenuItem value="nao">Pendente — ainda não furado</MenuItem>
            <MenuItem value="sim">Instalado — furo feito e testado</MenuItem>
          </TextField>
          {s.antiSiphon ? (
            <ToneAlert tone={s.contem ? "good" : "bad"}>
              <strong>Furo anti-sifão marcado como instalado.</strong> Numa queda de energia descem ~
              {fmtBR(s.descidaTotal, 0)} L, contra {fmtBR(s.headroom, 1).replace(".", ",")} L de folga.{" "}
              {s.contem ? "O sistema se contém." : "Ainda transborda."} Confirme com o teste real de tomada.
            </ToneAlert>
          ) : (
            <ToneAlert tone="bad">
              <strong>Sem o furo, descem ~{fmtBR(s.descidaTotal, 0)} L contra {fmtBR(s.headroom, 1).replace(".", ",")} L
              de folga.</strong> Um furo de 3 mm no recalque, custo zero, corta os 30 L de sifonagem e resolve.
              Marque como instalado ao lado assim que fizer.
            </ToneAlert>
          )}
          <ToneAlert tone="info">
            <strong>Como fazer:</strong> fure o tubo de recalque logo abaixo da linha d'água — assim que o nível
            chega ali, o furo suga ar e quebra o sifão na hora. Complete com bocal de retorno raso (1–2 cm
            submerso), nível do sump em 22–24 cm e uma fita marcando a linha máxima na C3.
            <br />Depois <strong>desligue a bomba na tomada e meça</strong> onde o nível estabiliza. É o único
            jeito de validar estes números.
          </ToneAlert>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">05 · Água preta · química</Typography>
          <Typography variant="h6" gutterBottom>O rio Negro funciona com KH 0. Seu apartamento, não.</Typography>
          <Typography paragraph color="text.secondary">
            Água preta amazônica é exatamente isto: ácida, escura, dureza quase nula. O aquário reproduziu o
            bioma bem demais — <strong>0 dKH</strong>. A diferença é de escala: o rio Negro tem bilhões de litros
            e um estoque contínuo de ácido húmico vindo da mata. Ele oscila devagar porque é grande.
          </Typography>
          <Typography paragraph color="text.secondary">
            598 litros não têm essa inércia. Sem tampão, o pH não tem freio: uma TPA, uma decomposição localizada
            ou o pico de CO₂ de uma madrugada derrubam de 6,6 para abaixo de 5,0 em horas.{" "}
            <strong>Abaixo de pH 6,0 a nitrificação para</strong> — e o filtro biológico que hoje funciona
            simplesmente desliga, com os peixes dentro.
          </Typography>
          <Facts rows={[
            ["KH medido hoje", s.lastKh === null ? "não medido" : `${fmtBR(s.lastKh, 1).replace(".", ",")} dKH`],
            ["Meta", "3,0 dKH"],
            ["Bicarbonato necessário", s.khGap <= 0 ? "0 g" : `${fmtBR(Math.round(s.bicTotal), 0)} g`],
          ]} />
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {["1", "3", "5"].map((day) => (
              <Grid item xs={4} sm={3} key={day}>
                <Typography variant="caption" color="text.secondary" display="block">Dia {day}</Typography>
                <Typography variant="body1" fontWeight={700}>
                  {s.khGap <= 0 ? "—" : `${fmtBR(Math.round(s.bicTotal / 3), 0)} g`}
                </Typography>
              </Grid>
            ))}
            <Grid item xs={4} sm={3}>
              <Typography variant="caption" color="text.secondary" display="block">Dia 7</Typography>
              <Typography variant="body1" fontWeight={700}>medir</Typography>
              <Typography variant="caption" color="text.secondary">confirmar 2–4 dKH · pH 6,4–6,8</Typography>
            </Grid>
          </Grid>
          {s.lastKh === null ? (
            <ToneAlert tone="warn">
              <strong>Registre o KH de hoje na aba Parâmetros</strong> e esta seção calcula a dose exata para o
              volume real de {fmtBR(s.totalSystem, 0)} L.
            </ToneAlert>
          ) : s.khGap <= 0 ? (
            <ToneAlert tone="good">
              <strong>KH em {fmtBR(s.lastKh, 1).replace(".", ",")} dKH — o tampão já está na faixa.</strong> Não
              há dose a fazer; apenas reponha ~{fmtBR(s.bicReposicao, 1).replace(".", ",")} g de bicarbonato a
              cada TPA para não perder o que conquistou.
            </ToneAlert>
          ) : (
            <ToneAlert tone="warn">
              <strong>Faltam {fmtBR(s.khGap, 1).replace(".", ",")} dKH para chegar a 3.</strong> São{" "}
              {fmtBR(Math.round(s.bicTotal), 0)} g de bicarbonato para {fmtBR(s.totalSystem, 0)} L, fracionados
              em três doses de {fmtBR(Math.round(s.bicTotal / 3), 0)} g. Nunca de uma vez — subida brusca desloca
              o pH e causa choque osmótico.
              <br />Depois, reponha ~{fmtBR(s.bicReposicao, 1).replace(".", ",")} g a cada TPA de{" "}
              {fmtBR(s.tpaPct, 0)}%.
            </ToneAlert>
          )}
          <ToneAlert tone="info">
            <strong>E as conchas / coral triturado?</strong> Funcionam e são à prova de esquecimento — dissolvem
            sozinhos conforme o pH cai. Mas estabilizam em pH 7,2–7,6, acima da faixa amazônica que este aquário
            busca. Para a meta de 6,4–6,8, <strong>bicarbonato dosado é a via correta</strong>; deixe a aragonita
            como plano B se a rotina de dosagem não pegar.
          </ToneAlert>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">06 · O leito · carga estrutural</Typography>
          <Typography variant="h6" gutterBottom>Rio nenhum flutua: alguém embaixo segura o peso</Typography>
          <Typography paragraph color="text.secondary">
            Água (597 kg) + areia (75 kg) + rocha (50 kg) + vidro (169 kg) + móvel (60 kg) = <strong>951 kg de
            display</strong>, mais 118 kg de sump. Tudo isso apoiado em <strong>1,00 m²</strong> de laje, num
            edifício de orla onde a maresia já trabalha contra a armadura.
          </Typography>
          <Meter
            label="Carga do display sobre a laje" valueLabel="951 kg/m²"
            pct={95.1} tone="bad"
            verdict="escala 0–1.000 kg/m² · faixa prevista pela NBR 6120 para piso residencial: 150–200 kg/m²"
          />
          <ToneAlert tone="warn">
            <strong>5 a 6 vezes a sobrecarga de projeto — e isso não significa que a laje vai ceder.</strong>{" "}
            Carga concentrada é absorvida sem drama quando está bem posicionada. Significa que a posição deixou
            de ser uma decisão de decoração.
            <br />Encoste em <strong>parede estrutural ou viga</strong>, nunca no meio do vão. Deixe o eixo de 2 m{" "}
            <strong>perpendicular à direção do vão</strong>, para dividir a carga entre mais nervuras. Na dúvida,
            uma visita de engenheiro estrutural custa pouco perto do risco — e vale conferir o regimento do
            condomínio.
          </ToneAlert>
          <ToneAlert tone="info">
            <strong>O vidro também é estrutura.</strong> Para 70 cm de coluna e 200 cm sem travessa, a espessura
            recomendada é 15–19 mm com fator de segurança 3,0. Confirme a real e a existência de contraventamento
            no topo — o sinal de alerta é abaulamento visível no centro do painel frontal.
          </ToneAlert>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">07 · Os habitantes · fauna</Typography>
          <Typography variant="h6" gutterBottom>Todo mundo aqui ainda é filhote</Typography>
          <Typography paragraph color="text.secondary">
            O aquário parece confortável porque nenhum peixe chegou ao tamanho adulto — medida contra os 200 cm
            de comprimento do aquário.
          </Typography>
          <Table size="small" sx={{ mb: 2 }}>
            <TableBody>
              {[
                ["Oscar Bronze", "Astronotus ocellatus", "15 → 38 cm", 38 / 200 * 100],
                ["Jack Dempsey Blue", "Rocio octofasciata", "10 → 25 cm", 25 / 200 * 100],
                ["Severum Gold ♀♂ (2×)", "Heros efasciatus", "10 e 6 → 25 cm cada", 25 / 200 * 100],
                ["Lambaris (6×)", "Astyanax sp.", "5 → 12 cm", 12 / 200 * 100],
                ["Pangasius Albino", "Pangasianodon hypophthalmus", "10 → 130 cm", 130 / 200 * 100],
              ].map(([name, sci, size, pct]) => (
                <TableRow key={name}>
                  <TableCell sx={{ border: 0, pl: 0 }}>
                    <Typography variant="body2">{name}</Typography>
                    <Typography variant="caption" color="text.secondary" fontStyle="italic">{sci}</Typography>
                  </TableCell>
                  <TableCell sx={{ border: 0, width: "40%" }}>
                    <LinearProgress variant="determinate" value={pct} color={pct > 50 ? "error" : "primary"} sx={{ height: 8, borderRadius: 4 }} />
                  </TableCell>
                  <TableCell sx={{ border: 0, pr: 0 }} align="right">{size}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ToneAlert tone="good">
            <strong>Sem o Pangasius, a conta fecha bem.</strong> A biomassa adulta dos ciclídeos fica em ~1,34 kg
            para 598 L = <strong>2,24 g/L</strong>, dentro do limite prático de 3–4 g/L para sistema com sump e
            TPA regular.
          </ToneAlert>
          <ToneAlert tone="bad">
            <strong>O Pangasius não é um problema de biomassa. É de geometria.</strong> Adulto pleno passa de 1
            metro e pede 10.000 L. Mesmo com o crescimento retardado pelo confinamento — que é deformação, não
            adaptação — ele chega a 40–60 cm.
            <br />Nesse tamanho ocupa <strong>um terço do comprimento do aquário</strong>, é funcionalmente cego e
            propenso a pânico. Um peixe de 40 cm em pânico dentro de 2 metros derruba rocha, arranca equipamento e
            pode trincar o vidro frontal. <strong>Realocar em 6–12 meses</strong> — o custo de esperar demais
            inclui o vidro.
          </ToneAlert>
          <ToneAlert tone="warn">
            <strong>Território: 2.500 cm² por ciclídeo adulto</strong> (≈ 50 × 50 cm cada). É suficiente — desde
            que haja quebra de linha de visão. O layout aberto de hoje é belíssimo e funcionalmente hostil: cada
            peixe enxerga todos os outros o tempo inteiro.
            <br />Duas ou três <strong>colunas verticais de rocha</strong> por volta dos 50 cm e 150 cm reforçam a
            linguagem de galeria, criam três territórios distintos e dão ao casal de Severum um sítio de desova
            protegido.
          </ToneAlert>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">08 · O calendário das águas · manutenção</Typography>
          <Typography variant="h6" gutterBottom>O rio tem cheia e vazante. Aqui, quem faz isso é você.</Typography>
          <Typography paragraph color="text.secondary">
            O ciclo que na Amazônia leva um ano — enchente, cheia, vazante, seca — aqui cabe numa semana e depende
            inteiramente de rotina. Estes são os volumes já calculados para <strong>{fmtBR(s.totalSystem, 0)} L</strong>,
            prontos para virar lembrete no celular.
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Stat label="Troca parcial" value={`${fmtBR(s.tpaLitros, 0)} L`} note={`${fmtBR(s.tpaPct, 0)}% de ${fmtBR(s.totalSystem, 0)} L`} />
            <Stat label="Declorador" value={`${fmtBR(s.declorador, 0)} mL`} note="a cada TPA · 1 mL para 10 L" />
            <Stat label="Bicarbonato" value={`${fmtBR(s.bicReposicao, 1).replace(".", ",")} g`} note="repõe os 3 dKH levados na troca" />
            <Stat label="Perlon" value="10–14 d" note="era 20–30 · revisado" tone="warn" />
            <Stat label="Carvão ativado" value="4–6 sem" note="1,5–2 L por ciclo" />
            <Stat label="Purigen" value="4–6 mes" note="regenerar ~700 mL" />
          </Grid>
          <ToneAlert tone="warn">
            <strong>Perlon vencido inverte de função.</strong> Com peixe grande e ração carnívora, passar de 14
            dias transforma a manta de removedor de sólidos em fonte de nitrato — ela continua segurando a sujeira,
            só que agora dissolvida.
          </ToneAlert>
          <ToneAlert tone="warn">
            <strong>Correção sobre o relatório:</strong> ele indica 6,8 g de bicarbonato por TPA, mas essa conta
            usa 1 dKH em vez dos 3 dKH que a troca leva embora. Retirar 33% da água a 3 dKH derruba o tampão em
            ~1 dKH no sistema inteiro — repor exige <strong>3 × 30 mg/L × volume trocado</strong>. Este painel
            calcula o valor correto, cerca de três vezes maior.
          </ToneAlert>
          <ToneAlert tone="info">
            <strong>{fmtBR(s.tpaLitros, 0)} L não saem da torneira direto para o aquário.</strong> Com KH 0 e água
            de rua, prepare em reservatório <strong>24 h antes</strong>: aeração, declorador e bicarbonato. Isso
            evita o choque duplo de temperatura e química — e é o que separa uma TPA de rotina de um susto de pH.
          </ToneAlert>
        </CardContent>
      </Card>
    </Stack>
  );
}
