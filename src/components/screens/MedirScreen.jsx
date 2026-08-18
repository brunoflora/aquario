import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import InputBase from "@mui/material/InputBase";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Collapse from "@mui/material/Collapse";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import { useAppState } from "../../state/AppStateProvider.jsx";
import {
  CORE_PARAMS, PARAM_LABELS, TREND_UNITS, sortedReadings, fieldGuidance,
  idealBand, paramStatus, toxicNH3, nh3Fraction,
} from "../../domain/water.js";
import { todayStr, brDate, formatParam, formatBand, parseDecimal } from "../../domain/format.js";
import { Panel, SectionLabel, Num, useAq, toneColor } from "../ui.jsx";
import HistoricoLista from "../HistoricoLista.jsx";

const BLANK = { date: todayStr(), temp: "", ph: "", kh: "", nh3: "", no2: "", no3: "", turbidez: false, notes: "" };
const NUMERIC_FIELDS = ["temp", "ph", "kh", "nh3", "no2", "no3"];
const TONE_OF = { good: "good", warn: "warn", bad: "bad", empty: "none" };

const FIELD_META = {
  temp: { label: "Temperatura", unit: "°C", step: "0.1" },
  ph: { label: "pH", unit: "", step: "0.1" },
  kh: { label: "Dureza de carbonatos", unit: "dKH", step: "0.5" },
  nh3: { label: "Amônia total (TAN)", unit: "ppm", step: "0.01" },
  no2: { label: "Nitrito", unit: "ppm", step: "0.01" },
  no3: { label: "Nitrato", unit: "ppm", step: "5" },
};

function toStoredReading(form) {
  const reading = { ...form };
  NUMERIC_FIELDS.forEach((key) => {
    const n = parseDecimal(reading[key]);
    reading[key] = n === null ? "" : n;
  });
  return reading;
}

/**
 * Orientação do campo a partir do valor que REALMENTE importa.
 *
 * Para amônia o campo recebe o total (TAN) lido no kit, mas o julgamento tem de
 * ser feito sobre a fração tóxica — senão a linha do campo dizia "amônia tóxica
 * detectada, faça TPA" em âmbar enquanto a conversão logo abaixo mostrava
 * <0,001 ppm em verde. Dois veredictos opostos no mesmo bloco, o mesmo defeito
 * que o painel tinha entre alerta e medidor.
 *
 * Sem pH ou temperatura, toxicNH3 devolve o total como pior caso — o campo
 * alerta a mais, nunca a menos.
 */
function guidanceFor(key, form) {
  const n = parseDecimal(form[key]);
  if (n === null) return null;
  if (key === "nh3") {
    return fieldGuidance("nh3", toxicNH3(n, parseDecimal(form.ph), parseDecimal(form.temp)));
  }
  return fieldGuidance(key, n);
}

function readingHasData(reading) {
  if (reading.notes && reading.notes.trim() !== "") return true;
  if (reading.turbidez) return true;
  return NUMERIC_FIELDS.some((k) => parseDecimal(reading[k]) !== null);
}

/**
 * Uma linha de medição. O formulário antigo empilhava seis TextFields com
 * rótulo flutuante e DOIS parágrafos de ajuda permanente cada um — ~1400 px de
 * rolagem para a tarefa que se repete todo santo dia, em pé na frente do
 * aquário. Aqui cada parâmetro é uma linha de ~64 px: rótulo à esquerda, campo
 * numérico grande à direita, faixa ideal como placeholder.
 *
 * A ajuda é progressiva — o texto só aparece quando o valor sai da faixa. Ajuda
 * permanente vira ruído permanente: quem mede todo dia já sabe a faixa, e quem
 * não sabe tem a faixa escrita sob o campo.
 */
function FieldRow({ paramKey, value, onChange, guidance, autoFocus }) {
  const aq = useAq();
  const meta = FIELD_META[paramKey];
  const band = idealBand(paramKey);
  const tone = guidance ? TONE_OF[guidance.status] : "none";
  const preenchido = value !== "";

  return (
    <Box sx={{ borderBottom: `1px solid ${aq.line}`, "&:last-of-type": { borderBottom: "none" } }}>
      <Stack direction="row" sx={{ alignItems: "center", gap: 1.5, py: 1.25, minHeight: 64 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 500, lineHeight: 1.25 }}>{meta.label}</Typography>
          <Typography
            variant="caption" className="aq-num"
            sx={{ color: aq.inkFaint, fontSize: 11, whiteSpace: "nowrap" }}
          >
            ideal {formatBand(band)} {meta.unit}
          </Typography>
        </Box>

        {/* Largura fixa e sem encolher: com o campo em `flex`, o input engolia a
            linha e empurrava "Dureza de carbonatos" para três linhas. */}
        <Stack
          direction="row"
          sx={{
            alignItems: "center", gap: 0.75, px: 1.5, width: 132, flexShrink: 0, minHeight: 48,
            borderRadius: 2.5,
            border: `1.5px solid ${preenchido && tone !== "none" ? toneColor(aq, tone) : aq.line}`,
            backgroundColor: aq.surfaceRaised,
          }}
        >
          <InputBase
            value={value}
            onChange={onChange}
            autoFocus={autoFocus}
            // type="text" + inputMode="decimal": abre o teclado numérico no
            // celular E aceita a vírgula do teclado brasileiro, que num
            // type="number" apagaria o valor silenciosamente.
            inputProps={{
              inputMode: "decimal", "aria-label": meta.label,
              style: { textAlign: "right", padding: 0 },
            }}
            type="text"
            placeholder="—"
            sx={{
              flex: 1, minWidth: 0,
              "& input": {
                fontFamily: '"IBM Plex Mono", monospace', fontVariantNumeric: "tabular-nums",
                fontSize: 20, fontWeight: 600, color: preenchido && tone !== "none" ? toneColor(aq, tone) : aq.ink,
              },
            }}
          />
          {meta.unit && (
            <Typography sx={{ fontSize: 11, color: aq.inkFaint, flexShrink: 0 }}>{meta.unit}</Typography>
          )}
        </Stack>
      </Stack>

      <Collapse in={!!guidance && guidance.status !== "good"}>
        <Typography variant="body2" sx={{ color: toneColor(aq, tone), pb: 1.25, fontSize: 13, lineHeight: 1.4 }}>
          {guidance?.text}
        </Typography>
      </Collapse>
    </Box>
  );
}

/**
 * A amônia precisa de um bloco próprio: o kit lê o TOTAL (TAN) pela cor, mas
 * quem mata peixe é a fração tóxica, que depende do pH e da temperatura do dia.
 * A conversão aparece ao vivo, senão o usuário digita 0,25 e não sabe se isso
 * é uma emergência ou um número inofensivo — e a resposta muda com o pH.
 */
function AmoniaConversao({ tan, ph, temp }) {
  const aq = useAq();
  const nTan = parseDecimal(tan), nPh = parseDecimal(ph), nTemp = parseDecimal(temp);
  if (nTan === null || nPh === null || nTemp === null) return null;
  const toxic = toxicNH3(nTan, nPh, nTemp);
  const pct = nh3Fraction(nPh, nTemp) * 100;
  const tone = TONE_OF[paramStatus("nh3", toxic)] || "none";
  return (
    <Box sx={{ mt: 1, p: 1.5, borderRadius: 2.5, backgroundColor: aq.surfaceRaised, border: `1px solid ${aq.line}` }}>
      <Typography variant="caption" sx={{ color: aq.inkDim, display: "block", mb: 0.5 }}>
        Fração tóxica a pH {nPh.toFixed(1).replace(".", ",")} e {nTemp.toFixed(1).replace(".", ",")} °C
      </Typography>
      <Stack direction="row" sx={{ alignItems: "baseline", gap: 1 }}>
        <Num size={22} tone={tone}>{formatParam("nh3", toxic)}</Num>
        <Typography variant="caption" sx={{ color: aq.inkDim }}>
          ppm NH₃ · {pct < 0.1 ? "<0,1" : pct.toFixed(pct < 1 ? 2 : 1).replace(".", ",")}% do total
        </Typography>
      </Stack>
    </Box>
  );
}

export default function MedirScreen() {
  const { state, upsertReading, deleteReading, showSnackbar } = useAppState();

  const sorted = useMemo(() => sortedReadings(state.readings), [state.readings]);
  const mostRecent = sorted.length ? sorted[sorted.length - 1] : null;

  const [form, setForm] = useState(() => {
    const hoje = todayStr();
    const deHoje = sorted.find((r) => r.date === hoje);
    return deHoje || { ...BLANK, date: hoje };
  });
  const [notasAbertas, setNotasAbertas] = useState(false);

  const saveTimerRef = useRef(null);
  const confirmTimerRef = useRef(null);
  useEffect(() => () => { clearTimeout(saveTimerRef.current); clearTimeout(confirmTimerRef.current); }, []);

  function scheduleAutosave(next) {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (!next.date) return;
      const exists = state.readings.some((r) => r.date === next.date);
      if (!readingHasData(next) && !exists) return;
      upsertReading(toStoredReading(next));
    }, 300);

    clearTimeout(confirmTimerRef.current);
    confirmTimerRef.current = setTimeout(() => {
      if (!next.date || !readingHasData(next)) return;
      const filled = NUMERIC_FIELDS.filter((k) => parseDecimal(next[k]) !== null).length;
      const label = next.date === todayStr() ? "hoje" : brDate(next.date);
      showSnackbar(
        filled >= NUMERIC_FIELDS.length
          ? `Leitura de ${label} completa e salva.`
          : `Leitura de ${label} salva — ${filled} de ${NUMERIC_FIELDS.length} parâmetros.`,
        { variant: "success" }
      );
    }, 1300);
  }

  function handleField(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      scheduleAutosave(next);
      return next;
    });
  }

  /** Atalho real de campo: em sistema estável, 4 dos 6 valores repetem. */
  function copiarDeOntem() {
    const anterior = sorted.filter((r) => r.date < form.date).pop();
    if (!anterior) { showSnackbar("Não há leitura anterior para copiar.", { variant: "warning" }); return; }
    setForm((prev) => {
      const next = { ...prev };
      NUMERIC_FIELDS.forEach((k) => {
        if (anterior[k] !== "" && anterior[k] !== null && anterior[k] !== undefined) next[k] = String(anterior[k]);
      });
      next.turbidez = !!anterior.turbidez;
      scheduleAutosave(next);
      return next;
    });
    showSnackbar(`Valores de ${brDate(anterior.date)} copiados. Ajuste o que mudou.`, { variant: "success" });
  }

  function excluir() {
    if (!state.readings.some((r) => r.date === form.date)) {
      showSnackbar("Não há registro salvo nesta data para excluir.", { variant: "warning" });
      return;
    }
    deleteReading(form.date);
    setForm({ ...BLANK, date: form.date });
  }

  const preenchidos = NUMERIC_FIELDS.filter((k) => parseDecimal(form[k]) !== null).length;
  const ehHoje = form.date === todayStr();

  return (
    <Stack spacing={2.5}>
      <Panel sx={{ p: 1.75 }}>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          {/* O <input type="date"> nativo desenha a data no formato da INTERFACE
              do navegador, não no do documento — num aparelho configurado em
              inglês, "18/08" aparecia como "08/18/2026" dentro de um app em
              português. Num registro diário, ler o dia errado é o pior erro
              possível. Aqui o rótulo é nosso e sempre dd/mm/aaaa; o input
              nativo fica por cima, invisível, só para abrir o seletor. */}
          <Box sx={{ position: "relative" }}>
            <Typography variant="overline" sx={{ fontSize: 10.5, display: "block", lineHeight: 1.4 }} color="text.secondary">
              Data da leitura
            </Typography>
            <Stack direction="row" sx={{ alignItems: "baseline", gap: 1 }}>
              <Typography className="aq-num" sx={{ fontSize: 17, fontWeight: 600 }}>
                {brDate(form.date)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {ehHoje ? "hoje" : "toque para mudar"}
              </Typography>
            </Stack>
            <Box
              component="input" type="date" value={form.date} max={todayStr()}
              aria-label="Data da leitura"
              onChange={(e) => { if (e.target.value) handleField("date", e.target.value); }}
              sx={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                opacity: 0, border: 0, padding: 0, cursor: "pointer",
                fontSize: 16, // < 16px faz o iOS dar zoom ao focar
              }}
            />
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Num size={20} tone={preenchidos === 6 ? "good" : preenchidos > 0 ? "warn" : undefined}>
              {preenchidos}/6
            </Num>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              preenchidos
            </Typography>
          </Box>
        </Stack>
        {!ehHoje && (
          <Typography variant="caption" color="warning.main" sx={{ display: "block", mt: 1 }}>
            Você está editando o registro de {brDate(form.date)}, não o de hoje.
          </Typography>
        )}
      </Panel>

      <Box>
        <SectionLabel
          action={
            <Button
              size="small" startIcon={<ContentCopyIcon sx={{ fontSize: 15 }} />} onClick={copiarDeOntem}
              sx={{ minHeight: 32, px: 1 }} color="inherit"
            >
              Copiar anterior
            </Button>
          }
        >
          Medições
        </SectionLabel>

        <Panel sx={{ py: 0.5, px: 2 }}>
          {CORE_PARAMS.map((key, i) => (
            <Box key={key}>
              <FieldRow
                paramKey={key}
                value={form[key] === null || form[key] === undefined ? "" : String(form[key])}
                onChange={(e) => handleField(key, e.target.value)}
                guidance={guidanceFor(key, form)}
                autoFocus={false}
              />
              {key === "nh3" && (
                <Box sx={{ pb: 1.5 }}>
                  <AmoniaConversao tan={form.nh3} ph={form.ph} temp={form.temp} />
                </Box>
              )}
            </Box>
          ))}
        </Panel>
      </Box>

      <Panel sx={{ py: 1, px: 2 }}>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", minHeight: 48 }}>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>Água turva hoje</Typography>
            <Typography variant="caption" color="text.secondary">
              zera a contagem do gate de água clara
            </Typography>
          </Box>
          <Switch
            checked={!!form.turbidez}
            onChange={(e) => handleField("turbidez", e.target.checked)}
            inputProps={{ "aria-label": "Água turva hoje" }}
          />
        </Stack>
      </Panel>

      <Box>
        <Button
          fullWidth color="inherit" onClick={() => setNotasAbertas((v) => !v)}
          sx={{ justifyContent: "space-between", px: 2 }}
        >
          Notas do dia
          <Typography variant="caption" color="text.secondary">
            {form.notes ? "preenchida" : notasAbertas ? "recolher" : "opcional"}
          </Typography>
        </Button>
        <Collapse in={notasAbertas || !!form.notes}>
          <TextField
            fullWidth multiline minRows={2} placeholder="Comportamento, alimentação, obras…"
            value={form.notes} onChange={(e) => handleField("notes", e.target.value)}
            sx={{ mt: 1 }}
          />
        </Collapse>
      </Box>

      <Button
        startIcon={<DeleteOutlineIcon />} color="error" onClick={excluir}
        sx={{ alignSelf: "flex-start" }}
      >
        Excluir este registro
      </Button>

      <Box>
        <SectionLabel>Histórico</SectionLabel>
        <HistoricoLista />
      </Box>
    </Stack>
  );
}
