import { useMemo } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useAppState } from "../../state/AppStateProvider.jsx";
import {
  CORE_PARAMS, PARAM_LABELS, TREND_UNITS, sortedReadings,
  deriveEffectiveReading, paramStatus, calculateTPA, idealBand,
} from "../../domain/water.js";
import { buildVerdict, scoreTone } from "../../domain/verdict.js";
import { formatParam, formatNumber, formatBand, todayStr, brDate } from "../../domain/format.js";
import { computeSystem } from "../../domain/system.js";
import { Panel, SectionLabel, Num, StatusDot, useAq, toneColor } from "../ui.jsx";
import Sparkline from "../Sparkline.jsx";

const SHORT_LABEL = { temp: "Temp.", ph: "pH", kh: "KH", gh: "GH", nh3: "NH₃ tóx.", no2: "NO₂", no3: "NO₃" };
const TONE_OF = { good: "good", warn: "warn", bad: "bad", empty: "none" };

/**
 * Herói da tela: o veredicto. Uma palavra de estado, o parâmetro responsável e
 * a leitura dele. Substitui o medidor de 83/100 que ocupava o mesmo espaço
 * dizendo o contrário do alarme logo acima (ver domain/verdict.js).
 */
function VerdictHero({ verdict, onRegistrar }) {
  const aq = useAq();
  const color = toneColor(aq, verdict.tone);
  const semLeitura = verdict.level === "none";
  const temBotao = semLeitura || verdict.level === "incomplete" || verdict.stale;

  return (
    <Panel tone={verdict.tone} sx={{ p: 2.5, position: "relative", overflow: "hidden" }}>
      <Stack direction="row" sx={{ alignItems: "center", gap: 1, mb: 1.5 }}>
        <StatusDot tone={verdict.tone} size={9} />
        <Typography variant="overline" sx={{ color: aq.inkDim, fontSize: 11 }}>
          Estado da água
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Typography variant="caption" sx={{ color: verdict.stale ? aq.warn : aq.inkDim }}>
          {semLeitura ? "—"
            : verdict.ageDays === 0 ? "hoje"
            : verdict.ageDays === 1 ? "ontem"
            : `há ${verdict.ageDays} dias`}
        </Typography>
      </Stack>

      <Typography
        component="h2"
        sx={{ fontSize: 34, fontWeight: 700, letterSpacing: "-.025em", lineHeight: 1.05, color, mb: verdict.driver ? 1.25 : 1 }}
      >
        {verdict.word}
      </Typography>

      {verdict.driver ? (
        <Stack direction="row" sx={{ alignItems: "baseline", gap: 1, mb: 1.25, flexWrap: "wrap" }}>
          <Typography sx={{ color: aq.ink, fontWeight: 600, fontSize: 15 }}>
            {verdict.driver.label}
          </Typography>
          {/* peso 700: aos 22 px isso qualifica como texto grande na WCAG
              (limiar 3:1 em vez de 4,5:1) e, mais ao ponto, deixa o número que
              manda no veredicto de fato mais legível */}
          <Num size={22} sx={{ color, fontWeight: 700 }}>{verdict.driver.value}</Num>
          <Typography variant="caption" sx={{ color: aq.inkDim }}>
            {TREND_UNITS[verdict.driver.key]}
          </Typography>
        </Stack>
      ) : null}

      <Typography variant="body2" sx={{ color: aq.inkDim, mb: temBotao ? 2 : 0 }}>
        {verdict.detail}
      </Typography>

      {semLeitura || verdict.level === "incomplete" ? (
        <Button
          fullWidth variant="contained" onClick={onRegistrar} endIcon={<ArrowForwardIcon />}
          sx={{ bgcolor: aq.ink, color: aq.ground, "&:hover": { bgcolor: aq.ink } }}
        >
          {semLeitura ? "Registrar a primeira leitura" : "Completar a leitura de hoje"}
        </Button>
      ) : verdict.stale ? (
        <Button
          fullWidth variant="outlined" onClick={onRegistrar} endIcon={<ArrowForwardIcon />}
          sx={{ borderColor: aq.lineStrong, color: aq.ink }}
        >
          Medir hoje
        </Button>
      ) : null}
    </Panel>
  );
}

/**
 * Os parâmetros numa grade. Valor em mono, estado na barra sob o número.
 * `auto-fill` em vez de 3 colunas fixas: com 7 parâmetros (desde que GH
 * entrou no modelo), uma grade de 3 colunas deixa a última linha com um
 * item órfão. Auto-fill reflui sozinho para qualquer contagem de parâmetros
 * sem gerar buracos, e continua igual com os 6 de antes.
 */
function ParamGrid({ reading, onEditar }) {
  const aq = useAq();
  return (
    <Box>
      <SectionLabel
        action={
          <Button onClick={onEditar} sx={{ color: aq.inkDim, minHeight: 44, px: 1.25 }}>
            Editar
          </Button>
        }
      >
        Parâmetros
      </SectionLabel>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {CORE_PARAMS.map((key) => {
          const value = reading ? reading[key] : "";
          const status = paramStatus(key, value);
          const tone = TONE_OF[status] || "none";
          const band = idealBand(key);
          return (
            <Box
              key={key}
              sx={{
                borderRadius: 2.5, border: `1px solid ${aq.line}`, backgroundColor: aq.surface,
                p: 1.25, minHeight: 92, display: "flex", flexDirection: "column", justifyContent: "space-between",
                flex: "1 1 108px", minWidth: 108,
              }}
            >
              <Typography variant="caption" sx={{ color: aq.inkDim, fontSize: 11, lineHeight: 1.2 }}>
                {SHORT_LABEL[key]}
              </Typography>
              <Num size={19} tone={tone === "none" ? undefined : tone} sx={{ my: 0.5 }}>
                {formatParam(key, value)}
              </Num>
              <Box>
                <Box sx={{ height: 3, borderRadius: 2, backgroundColor: toneColor(aq, tone), opacity: tone === "none" ? 0.25 : 1, mb: 0.5 }} />
                <Typography sx={{ color: aq.inkFaint, fontSize: 9.5, lineHeight: 1.2 }} className="aq-num">
                  {formatBand(band)}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

/** A ação de hoje, com a dose já calculada para o volume real do sistema. */
function AcaoCard({ tpa, sistema, verdict, onPlano }) {
  const aq = useAq();
  const khBaixo = sistema.khGap > 0;

  if (!tpa && !khBaixo) {
    return (
      <Panel tone="good">
        <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Nenhuma intervenção pendente</Typography>
        <Typography variant="body2" sx={{ color: aq.inkDim }}>
          Manter a rotina: medir amanhã no mesmo horário.
        </Typography>
      </Panel>
    );
  }

  return (
    <Panel>
      {khBaixo && (
        <Box sx={{ mb: tpa ? 2 : 0 }}>
          <Typography sx={{ fontWeight: 600, mb: 0.75 }}>Repor tampão até 3 dKH</Typography>
          <Stack direction="row" sx={{ gap: 2.5, mb: 0.75, flexWrap: "wrap" }}>
            <Box>
              <Num size={24} tone="warn">{formatNumber(Math.round(sistema.bicTotal / 3), 0)}</Num>
              <Typography variant="caption" sx={{ color: aq.inkDim, display: "block" }}>g por dose</Typography>
            </Box>
            <Box>
              <Num size={24}>3</Num>
              <Typography variant="caption" sx={{ color: aq.inkDim, display: "block" }}>doses (d1, d3, d5)</Typography>
            </Box>
          </Stack>
          <Typography variant="body2" sx={{ color: aq.inkDim }}>
            Nunca de uma vez — subida brusca de KH desloca o pH e causa choque osmótico.
          </Typography>
        </Box>
      )}

      {tpa && tpa.limitingFactor && (
        <Box>
          <Typography sx={{ fontWeight: 600, mb: 0.75 }}>Troca parcial de água</Typography>
          <Stack direction="row" sx={{ gap: 2.5, mb: 0.75, flexWrap: "wrap" }}>
            <Box>
              <Num size={24} tone={tpa.urgency === "critical" ? "bad" : "warn"}>{tpa.tpaPercentage}%</Num>
              <Typography variant="caption" sx={{ color: aq.inkDim, display: "block" }}>do sistema</Typography>
            </Box>
            <Box>
              <Num size={24}>{formatNumber((sistema.totalSystem * tpa.tpaPercentage) / 100, 0)}</Num>
              <Typography variant="caption" sx={{ color: aq.inkDim, display: "block" }}>litros</Typography>
            </Box>
          </Stack>
          <Typography variant="body2" sx={{ color: aq.inkDim }}>
            Limitado por {tpa.limitingFactor.label.toLowerCase()}.
          </Typography>
        </Box>
      )}

      <Button
        fullWidth onClick={onPlano} endIcon={<ArrowForwardIcon />}
        sx={{ mt: 1.75, color: aq.ink, border: `1px solid ${aq.lineStrong}` }}
      >
        Abrir o plano completo
      </Button>
    </Panel>
  );
}

/** Média ponderada, subordinada ao veredicto (que já apareceu no herói). */
function ScoreMedioCard({ verdict }) {
  const aq = useAq();
  const tone = scoreTone(verdict.score, verdict.tone);
  if (verdict.score === null) return null;

  return (
    <Panel>
      <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
        <Num size={22} tone={tone}>{verdict.score}</Num>
        <Typography variant="body2" sx={{ color: aq.inkDim }}>
          /100 — média ponderada dos {CORE_PARAMS.length} parâmetros, não o veredicto
        </Typography>
      </Stack>
    </Panel>
  );
}

/** Tendência por parâmetro: para onde cada número está indo, não só onde está. */
function TendenciaParametros({ readings }) {
  const aq = useAq();
  const series = useMemo(() => {
    const janela = readings.slice(-14);
    return CORE_PARAMS.map((key) => {
      const pontos = janela
        .map((r) => r[key])
        .filter((v) => v !== "" && v !== null && v !== undefined)
        .map(Number);
      const ultimo = pontos.length ? pontos[pontos.length - 1] : null;
      const anterior = pontos.length > 1 ? pontos[pontos.length - 2] : null;
      const delta = ultimo !== null && anterior !== null ? ultimo - anterior : null;
      return {
        key, pontos, ultimo, delta,
        tone: TONE_OF[paramStatus(key, ultimo)] || "none",
        band: idealBand(key),
      };
    }).filter((s) => s.pontos.length > 0);
  }, [readings]);

  if (series.length === 0) return null;

  return (
    <Panel sx={{ px: 2, py: 0.5 }}>
      {series.map((s, i) => (
        <Stack
          key={s.key}
          direction="row"
          sx={{
            alignItems: "center", gap: 1.5, py: 1.25, minHeight: 52,
            borderBottom: i === series.length - 1 ? "none" : `1px solid ${aq.line}`,
          }}
        >
          <Typography sx={{ fontSize: 13, color: aq.inkDim, width: 62, flexShrink: 0 }}>
            {SHORT_LABEL[s.key]}
          </Typography>
          <Sparkline data={s.pontos} tone={s.tone} band={s.band} />
          <Box sx={{ flex: 1, textAlign: "right" }}>
            <Num size={15} tone={s.tone === "none" ? undefined : s.tone}>
              {formatParam(s.key, s.ultimo)}
            </Num>
            {s.delta !== null && Math.abs(s.delta) > 1e-9 && (
              <Typography
                variant="caption" className="aq-num"
                sx={{ display: "block", color: aq.inkFaint, fontSize: 10.5, lineHeight: 1.2 }}
              >
                {s.delta > 0 ? "▲" : "▼"} {formatParam(s.key, Math.abs(s.delta))}
              </Typography>
            )}
          </Box>
        </Stack>
      ))}
    </Panel>
  );
}

export default function HojeScreen({ onIrParaMedir, onIrParaPlano }) {
  const { state } = useAppState();

  const sorted = useMemo(() => sortedReadings(state.readings), [state.readings]);
  const effective = useMemo(() => sorted.map(deriveEffectiveReading), [sorted]);
  const last = effective.length ? effective[effective.length - 1] : null;

  const verdict = useMemo(() => buildVerdict(last, todayStr()), [last]);
  const tpa = useMemo(() => (last ? calculateTPA(last) : null), [last]);
  const sistema = useMemo(() => computeSystem(state.config, state.readings), [state.config, state.readings]);

  return (
    <Stack spacing={3}>
      <VerdictHero verdict={verdict} onRegistrar={onIrParaMedir} />

      {last && <ParamGrid reading={last} onEditar={onIrParaMedir} />}

      {last && (
        <Box>
          <SectionLabel>O que fazer</SectionLabel>
          <AcaoCard tpa={tpa} sistema={sistema} verdict={verdict} onPlano={onIrParaPlano} />
        </Box>
      )}

      {effective.length > 1 && (
        <Box>
          <SectionLabel>Tendência · últimas {Math.min(14, effective.length)} leituras</SectionLabel>
          <TendenciaParametros readings={effective} />
        </Box>
      )}

      <ScoreMedioCard verdict={verdict} />
    </Stack>
  );
}
