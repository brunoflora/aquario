import { useMemo, useRef } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { RadarChart } from "@mui/x-charts/RadarChart";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme } from "@mui/material/styles";
import { useAppState } from "../../state/AppStateProvider.jsx";
import {
  CORE_PARAMS, PARAM_LABELS, RANGES, TREND_ORDER, TREND_UNITS,
  computeWaterScore, countOpenFields, evaluateGates, assessWater,
  paramStatus, sortedReadings, toDayIndex, idealBand, idealDistance, calculateTPA,
  deriveEffectiveReading, nh3Fraction,
} from "../../domain/water.js";
import WaterAlert from "../WaterAlert.jsx";
import { cadenceSummary, fromDayIndex, todayDayIndex } from "../../domain/cadence.js";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function brDate(iso) { return iso.split("-").reverse().join("/"); }

function fmt(value, digits = 1) {
  if (value === null || value === undefined || value === "") return "—";
  return Number(value).toFixed(digits);
}

const STATUS_COLOR = { good: "success", warn: "warning", bad: "error", empty: "default" };

function trendDigits(key) {
  if (key === "no3") return 0;
  if (key === "nh3") return 3;
  if (key === "no2") return 2;
  return 1;
}

function ParamChip({ paramKey, value }) {
  const status = paramStatus(paramKey, value);
  const label = paramKey === "turbidez" ? (value ? "turva" : "clara") : fmt(value, trendDigits(paramKey));
  return <Chip size="small" color={STATUS_COLOR[status]} label={label} variant={status === "empty" ? "outlined" : "filled"} />;
}

function GateChip({ label, streak, target, met }) {
  // Um indicador de progresso não deve ultrapassar o próprio máximo: com 12
  // dias de água clara o chip exibia "12/5". Atingido o alvo, ele passa a
  // informar há quanto tempo está mantido, que é o dado útil a partir dali.
  const excedente = streak - target;
  const texto = met
    ? `${label}: ✓ ${target}/${target}${excedente > 0 ? ` · há ${excedente} dia(s)` : ""}`
    : `${label}: ${streak}/${target}`;
  return <Chip color={met ? "success" : "default"} variant={met ? "filled" : "outlined"} label={texto} />;
}

// Eixos em "distância do ideal" (ver idealDistance): 0 no centro = no alvo,
// 1 = no limite de alerta. Assim o gráfico tem UMA semântica só — polígono
// pequeno e regular significa água saudável, qualquer ponta esticada é problema.
function radarMetrics() {
  return CORE_PARAMS.map((key) => ({ name: PARAM_LABELS[key], min: 0, max: 1.5 }));
}

export default function PainelTab({ onGoToForm }) {
  const { state, deleteReading, exportPayload, importData, showSnackbar } = useAppState();
  const fileInputRef = useRef(null);
  const theme = useTheme();

  const sorted = useMemo(() => sortedReadings(state.readings), [state.readings]);
  // A amônia lida no teste é o TOTAL (TAN) — quem decide se é perigoso é a
  // fração tóxica (NH₃), que depende do pH e da temperatura do mesmo dia.
  // effectiveSorted troca "nh3" pelo valor já convertido em cada leitura, e
  // é isso que score, gates, radar e tendências devem julgar.
  const effectiveSorted = useMemo(() => sorted.map(deriveEffectiveReading), [sorted]);
  const last = sorted.length ? sorted[sorted.length - 1] : null;
  const effectiveLast = effectiveSorted.length ? effectiveSorted[effectiveSorted.length - 1] : null;
  const score = effectiveLast ? computeWaterScore(effectiveLast) : null;
  const openCount = effectiveLast ? countOpenFields(effectiveLast) : CORE_PARAMS.length;
  const assessment = useMemo(() => assessWater(effectiveLast), [effectiveLast]);
  const gates = useMemo(() => evaluateGates(effectiveSorted), [effectiveSorted]);

  const ageLabel = useMemo(() => {
    if (!last) return "Sem registros";
    const age = toDayIndex(todayStr()) - toDayIndex(last.date);
    if (age <= 0) return "medida de hoje";
    if (age === 1) return "medida de ontem";
    return `medida há ${age} dias`;
  }, [last]);

  const radarData = useMemo(() => {
    if (!effectiveLast) return null;
    return {
      metrics: radarMetrics(),
      series: [
        {
          label: "Distância do ideal",
          data: CORE_PARAMS.map((k) => Math.min(1.5, idealDistance(k, effectiveLast[k]))),
          fillArea: true,
          valueFormatter: (v) => (v === 0 ? "na faixa ideal" : v >= 1 ? "além do limite de alerta" : `${Math.round(v * 100)}% do caminho até o limite`),
        },
        { label: "Limite de alerta", data: CORE_PARAMS.map(() => 1), hideMark: true },
      ],
    };
  }, [effectiveLast]);

  const descending = useMemo(() => sorted.slice().reverse(), [sorted]);

  const CADENCE_WINDOW_DAYS = 30;
  const cadence = useMemo(() => {
    const byDate = {};
    sorted.forEach((r) => { byDate[r.date] = r; });
    const todayIdx = todayDayIndex();
    const startIdx = todayIdx - CADENCE_WINDOW_DAYS + 1;
    const days = [];
    for (let i = startIdx; i <= todayIdx; i++) {
      const date = fromDayIndex(i);
      const reading = byDate[date];
      days.push({ date, score: reading ? computeWaterScore(reading) : null });
    }
    const summary = cadenceSummary(byDate, startIdx, todayIdx, Math.ceil(CADENCE_WINDOW_DAYS / 7));
    return { days, summary };
  }, [sorted]);

  const trends = useMemo(() => TREND_ORDER.map((key) => {
    const series = effectiveSorted
      .filter((r) => r[key] !== null && r[key] !== undefined && r[key] !== "")
      .map((r) => Number(r[key]));
    const lastVal = series.length ? Math.round(series[series.length - 1] * 1000) / 1000 : null;
    const status = lastVal === null ? "empty" : paramStatus(key, lastVal);
    const band = idealBand(key);
    return { key, series, last: lastVal, status, band, unit: TREND_UNITS[key] };
  }), [effectiveSorted]);

  function handleExport() {
    const payload = exportPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aquario-ciclideos-${todayStr()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSnackbar("Backup exportado.", { variant: "success" });
  }

  function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.readings)) {
          showSnackbar('Este arquivo não parece um backup do painel: falta a lista "readings". Use um arquivo gerado pelo próprio botão Exportar JSON.', { variant: "error" });
        } else {
          const summary = `${data.readings.length} leitura(s)` +
            (Array.isArray(data.structTasks) ? `, ${data.structTasks.length} ação(ões)` : "") +
            (data.config ? ", ficha do sistema" : "");
          const ok = window.confirm(
            `Importar ${summary}.\n\nIsto substitui os ${state.readings.length} registro(s) atuais deste navegador.\nVocê poderá desfazer logo em seguida.`
          );
          if (ok) importData(data, summary);
        }
      } catch (err) {
        showSnackbar(`Não foi possível ler o arquivo — ele não é um JSON válido. Detalhe: ${err.message}`, { variant: "error" });
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  }

  const scoreColor = score === null ? theme.palette.text.disabled
    : score >= 80 ? theme.palette.success.main
    : score >= 50 ? theme.palette.warning.main
    : theme.palette.error.main;

  return (
    <Stack spacing={3}>
      <WaterAlert assessment={assessment} onGoToForm={onGoToForm} />

      <Card>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4} sx={{ textAlign: "center" }}>
              <Gauge
                width={160}
                height={160}
                // Com score 0 o arco tem área zero e o vermelho não desenha —
                // o pior estado possível ficava idêntico a "sem dados". Um piso
                // de 2% garante que exista sempre traço visível; o texto segue
                // mostrando o valor real.
                value={score === null ? null : Math.max(score, 2)}
                valueMin={0}
                valueMax={100}
                text={() => (score === null ? "—" : `${score}/100`)}
                sx={{
                  [`& .${gaugeClasses.valueArc}`]: { fill: scoreColor },
                  // abaixo de 50 o anel de fundo também tinge: o cartão inteiro
                  // muda de estado, não só um arco fino
                  [`& .${gaugeClasses.referenceArc}`]: {
                    fill: score !== null && score < 50 ? theme.palette.error.light : undefined,
                    opacity: score !== null && score < 50 ? 0.35 : undefined,
                  },
                }}
              />
              {last && openCount > 0 && (
                <Chip size="small" color="info" variant="outlined" sx={{ mt: 1 }}
                  label={`parcial · faltam ${openCount}`} />
              )}
            </Grid>
            <Grid item xs={12} sm={8}>
              <Typography variant="h6">{last ? `Leitura de ${brDate(last.date)}` : "Sem registros"}</Typography>
              <Typography variant="body2" color={openCount ? "warning.main" : "text.secondary"} gutterBottom>
                Score de água · {ageLabel}
                {last && (openCount > 0 ? ` · ${openCount} de ${CORE_PARAMS.length} campos em aberto` : " · todos os parâmetros preenchidos")}
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1, flexWrap: "wrap" }}>
                <GateChip label="Água clara" streak={gates.clearStreak} target={gates.clearTarget} met={gates.clearMet} />
                <GateChip label="Biologia zerada" streak={gates.bioStreak} target={gates.bioTarget} met={gates.bioMet} />
                <Chip
                  color={gates.ready ? "success" : "default"}
                  variant={gates.ready ? "filled" : "outlined"}
                  label={gates.ready ? "Pronto p/ Green Terror: sim" : `Green Terror — ${gates.gargalo || "registre as leituras"}`}
                />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {effectiveLast && (() => {
        const tpa = calculateTPA(effectiveLast);
        if (!tpa) return null;
        const severity = tpa.urgency === "critical" ? "error" : tpa.urgency === "warning" ? "warning" : "info";
        const hasTAN = effectiveLast.nh3Total !== undefined
          && effectiveLast.ph !== "" && effectiveLast.ph !== null && effectiveLast.ph !== undefined
          && effectiveLast.temp !== "" && effectiveLast.temp !== null && effectiveLast.temp !== undefined;
        const pctToxic = hasTAN ? nh3Fraction(Number(effectiveLast.ph), Number(effectiveLast.temp)) * 100 : null;
        return (
          <Alert severity={severity} sx={{ p: 2 }}>
            <AlertTitle sx={{ fontWeight: 700, mb: 1 }}>Cálculo de TPA</AlertTitle>
            {hasTAN && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                Amônia total (TAN) lida no teste: {fmt(effectiveLast.nh3Total, 2)} ppm → tóxica (NH₃) a pH {fmt(effectiveLast.ph, 1)}/{fmt(effectiveLast.temp, 1)}°C:{" "}
                {effectiveLast.nh3 < 0.001 ? "<0,001" : fmt(effectiveLast.nh3, 3)} ppm ({pctToxic < 0.1 ? "<0,1" : fmt(pctToxic, pctToxic < 1 ? 2 : 1)}% do total).
              </Typography>
            )}
            {tpa.limitingFactor ? (
              <>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>{tpa.limitingFactor.label}</strong> limitando: {fmt(tpa.limitingFactor.current, trendDigits(tpa.limitingFactor.key))} ppm (alvo: {fmt(tpa.limitingFactor.target, trendDigits(tpa.limitingFactor.key))} ppm)
                </Typography>
                <Typography variant="h6" sx={{ mb: 1, color: `${severity}.main` }}>
                  Troque {tpa.tpaPercentage}% da água
                </Typography>
              </>
            ) : (
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>Nenhuma TPA de emergência necessária agora</Typography>
            )}
            <Typography variant="body2">{tpa.recommendation}</Typography>
            {tpa.allFactors.length > 1 && (
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>Outros fatores:</Typography>
                {tpa.allFactors.slice(1).map((factor) => (
                  <Typography key={factor.label} variant="body2" color="text.secondary">
                    • {factor.label}: {fmt(factor.current, trendDigits(factor.key))} ppm (precisaria {Math.ceil(factor.percentage)}% de TPA)
                  </Typography>
                ))}
              </Box>
            )}
          </Alert>
        );
      })()}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Quanto cada parâmetro está longe do ideal</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Centro é a faixa ideal. O anel externo é o limite de alerta — qualquer ponta que o
            alcance está fora da faixa, seja por excesso ou por falta.
          </Typography>
          {radarData ? (
            <RadarChart height={340} series={radarData.series} radar={{ metrics: radarData.metrics }} />
          ) : (
            <Typography color="text.secondary">Registre um parâmetro na aba Medir para ver o radar.</Typography>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">Histórico de leituras</Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" startIcon={<FileDownloadIcon />} onClick={handleExport}>Exportar JSON</Button>
              <Button size="small" startIcon={<FileUploadIcon />} onClick={() => fileInputRef.current?.click()}>Importar JSON</Button>
              <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleImportFile} />
            </Stack>
          </Stack>
          {descending.length === 0 ? (
            <Typography color="text.secondary">Nenhum registro ainda.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell align="right">Score</TableCell>
                    <TableCell align="right">Temp</TableCell>
                    <TableCell align="right">pH</TableCell>
                    <TableCell align="right">KH</TableCell>
                    <TableCell align="right">NH₃ tóxica</TableCell>
                    <TableCell align="right">NO₂</TableCell>
                    <TableCell align="right">NO₃</TableCell>
                    <TableCell>Turbidez</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {descending.map((r) => {
                    const rowScore = computeWaterScore(r);
                    const rowOpen = countOpenFields(r);
                    return (
                      <TableRow key={r.date}>
                        <TableCell>{brDate(r.date)}</TableCell>
                        <TableCell align="right">
                          <Typography
                            component="span"
                            fontWeight={700}
                            color={rowScore === null ? "text.secondary" : rowScore >= 80 ? "success.main" : rowScore >= 50 ? "warning.main" : "error.main"}
                            title={rowOpen > 0 ? `${rowOpen} campo(s) em aberto` : undefined}
                          >
                            {rowScore === null ? (rowOpen > 0 ? "parcial" : "—") : rowScore}
                          </Typography>
                        </TableCell>
                        <TableCell align="right"><ParamChip paramKey="temp" value={r.temp} /></TableCell>
                        <TableCell align="right"><ParamChip paramKey="ph" value={r.ph} /></TableCell>
                        <TableCell align="right"><ParamChip paramKey="kh" value={r.kh} /></TableCell>
                        <TableCell align="right">
                          <Stack alignItems="flex-end" spacing={0.25}>
                            <ParamChip paramKey="nh3" value={deriveEffectiveReading(r).nh3} />
                            {r.nh3 !== "" && r.nh3 !== null && r.nh3 !== undefined && (
                              <Typography variant="caption" color="text.secondary">TAN {fmt(r.nh3, 2)}</Typography>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell align="right"><ParamChip paramKey="no2" value={r.no2} /></TableCell>
                        <TableCell align="right"><ParamChip paramKey="no3" value={r.no3} /></TableCell>
                        <TableCell><ParamChip paramKey="turbidez" value={r.turbidez} /></TableCell>
                        <TableCell>
                          <IconButton size="small" aria-label={`Excluir registro de ${brDate(r.date)}`} onClick={() => deleteReading(r.date)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Cadência de medição</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Os gates contam dias consecutivos — um dia sem medir zera a contagem. As barras mostram o score
            dos últimos {CADENCE_WINDOW_DAYS} dias; um vão vazio é um dia sem registro.
          </Typography>
          <BarChart
            height={200}
            series={[{
              data: cadence.days.map((d) => d.score),
              valueFormatter: (v) => (v === null ? "sem medição" : `score ${v}`),
            }]}
            xAxis={[{ data: cadence.days.map((d) => d.date.slice(5).split("-").reverse().join("/")), scaleType: "band" }]}
            yAxis={[{ min: 0, max: 100 }]}
          />
          <Typography variant="caption" color="text.secondary">{cadence.summary.caption}</Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Por parâmetro</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            O score é uma média ponderada — aqui dá para ver qual parâmetro está puxando o resultado.
          </Typography>
          <Grid container spacing={2}>
            {trends.map((t) => (
              <Grid item xs={12} sm={6} md={4} key={t.key}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline" }}>
                  <Typography variant="body2">{PARAM_LABELS[t.key]}</Typography>
                  {t.last !== null && (
                    <Chip
                      size="small"
                      label={`${fmt(t.last, trendDigits(t.key))} ${t.unit}`}
                      color={STATUS_COLOR[t.status]}
                    />
                  )}
                </Stack>
                {t.series.length ? (
                  <SparkLineChart
                    height={60}
                    data={t.series}
                    showHighlight
                    area
                    color={t.status === "bad" ? theme.palette.error.main : t.status === "warn" ? theme.palette.warning.main : theme.palette.success.main}
                  />
                ) : (
                  <Typography variant="caption" color="text.secondary">sem medição no período</Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  faixa ideal {t.band[0]}–{t.band[1]} {t.unit}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
}
