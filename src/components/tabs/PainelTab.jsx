import { useMemo, useRef } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { RadarChart } from "@mui/x-charts/RadarChart";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import { useTheme } from "@mui/material/styles";
import { useAppState } from "../../state/AppStateProvider.jsx";
import {
  CORE_PARAMS, PARAM_LABELS, RANGES,
  computeWaterScore, countOpenFields, evaluateGates, deriveActionPlan,
  paramStatus, sortedReadings, toDayIndex,
} from "../../domain/water.js";

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

function ParamChip({ paramKey, value }) {
  const status = paramStatus(paramKey, value);
  const label = paramKey === "turbidez" ? (value ? "turva" : "clara")
    : fmt(value, paramKey === "no3" ? 0 : paramKey === "nh3" || paramKey === "no2" ? 2 : 1);
  return <Chip size="small" color={STATUS_COLOR[status]} label={label} variant={status === "empty" ? "outlined" : "filled"} />;
}

function GateChip({ label, streak, target, met }) {
  return (
    <Chip
      color={met ? "success" : "default"}
      variant={met ? "filled" : "outlined"}
      label={`${label}: ${streak}/${target}`}
    />
  );
}

const LEVEL_ICON = { good: <CheckCircleIcon color="success" />, warn: <WarningAmberIcon color="warning" />, bad: <ErrorOutlineIcon color="error" /> };

// eixos do radar: mín/máx = limite de alerta de cada parâmetro (RANGES.warnMin/warnMax),
// então o próprio raio do gráfico já mostra o quão perto do limite cada leitura está.
function radarMetrics() {
  return CORE_PARAMS.map((key) => {
    const r = RANGES[key];
    const isPpm = key === "nh3" || key === "no2" || key === "no3";
    return { name: PARAM_LABELS[key], min: isPpm ? 0 : r.warnMin, max: r.warnMax };
  });
}

function idealSeriesValue(key) {
  const r = RANGES[key];
  const isPpm = key === "nh3" || key === "no2" || key === "no3";
  return isPpm ? r.goodMax : (r.goodMin + r.goodMax) / 2;
}

export default function PainelTab() {
  const { state, deleteReading, exportPayload, importData } = useAppState();
  const fileInputRef = useRef(null);
  const theme = useTheme();

  const sorted = useMemo(() => sortedReadings(state.readings), [state.readings]);
  const last = sorted.length ? sorted[sorted.length - 1] : null;
  const score = last ? computeWaterScore(last) : null;
  const openCount = last ? countOpenFields(last) : CORE_PARAMS.length;
  const gates = evaluateGates(state.readings);
  const actionPlan = deriveActionPlan(last, gates);

  const ageLabel = useMemo(() => {
    if (!last) return "Sem registros";
    const age = toDayIndex(todayStr()) - toDayIndex(last.date);
    if (age <= 0) return "medida de hoje";
    if (age === 1) return "medida de ontem";
    return `medida há ${age} dias`;
  }, [last]);

  const radarData = useMemo(() => {
    if (!last) return null;
    return {
      metrics: radarMetrics(),
      series: [
        { label: "Leitura de hoje", data: CORE_PARAMS.map((k) => Number(last[k]) || 0) },
        { label: "Faixa ideal", data: CORE_PARAMS.map((k) => idealSeriesValue(k)) },
      ],
    };
  }, [last]);

  const descending = useMemo(() => sorted.slice().reverse(), [sorted]);

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
  }

  function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.readings)) {
          window.alert('Este arquivo não parece um backup do painel: falta a lista "readings". Use um arquivo gerado pelo próprio botão Exportar JSON.');
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
        window.alert(`Não foi possível ler o arquivo — ele não é um JSON válido. Detalhe: ${err.message}`);
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  }

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4} sx={{ textAlign: "center" }}>
              <Gauge
                width={160}
                height={160}
                value={score}
                valueMin={0}
                valueMax={100}
                text={({ value }) => (value === null ? "—" : `${value}/100`)}
                sx={{
                  [`& .${gaugeClasses.valueArc}`]: {
                    fill: score === null ? undefined : score >= 80 ? theme.palette.success.main : score >= 50 ? theme.palette.warning.main : theme.palette.error.main,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Typography variant="h6">{last ? `Leitura de ${brDate(last.date)}` : "Sem registros"}</Typography>
              <Typography variant="body2" color={openCount ? "warning.main" : "text.secondary"} gutterBottom>
                Score de água · {ageLabel}
                {last && (openCount > 0 ? ` · ${openCount} de ${CORE_PARAMS.length} campos em aberto` : " · todos os parâmetros preenchidos")}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                <GateChip label="Água clara" streak={gates.clearStreak} target={gates.clearTarget} met={gates.clearMet} />
                <GateChip label="Biologia zerada" streak={gates.bioStreak} target={gates.bioTarget} met={gates.bioMet} />
                <Chip
                  color={gates.ready ? "success" : "default"}
                  variant={gates.ready ? "filled" : "outlined"}
                  label={`Pronto p/ Green Terror: ${gates.ready ? "sim" : "não"}`}
                />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Recomendações</Typography>
          <List dense>
            {actionPlan.map((item, i) => (
              <ListItem key={i} disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>{LEVEL_ICON[item.level]}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Leitura de hoje vs. faixa ideal</Typography>
          {radarData ? (
            <RadarChart height={340} series={radarData.series} radar={{ metrics: radarData.metrics }} />
          ) : (
            <Typography color="text.secondary">Registre um parâmetro na aba Parâmetros para ver o radar.</Typography>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
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
                    <TableCell align="right">NH₃</TableCell>
                    <TableCell align="right">NO₂</TableCell>
                    <TableCell align="right">NO₃</TableCell>
                    <TableCell>Turbidez</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {descending.map((r) => {
                    const rowScore = computeWaterScore(r);
                    return (
                      <TableRow key={r.date}>
                        <TableCell>{brDate(r.date)}</TableCell>
                        <TableCell align="right">
                          <Typography
                            component="span"
                            fontWeight={700}
                            color={rowScore === null ? "text.secondary" : rowScore >= 80 ? "success.main" : rowScore >= 50 ? "warning.main" : "error.main"}
                          >
                            {rowScore === null ? "—" : rowScore}
                          </Typography>
                        </TableCell>
                        <TableCell align="right"><ParamChip paramKey="temp" value={r.temp} /></TableCell>
                        <TableCell align="right"><ParamChip paramKey="ph" value={r.ph} /></TableCell>
                        <TableCell align="right"><ParamChip paramKey="kh" value={r.kh} /></TableCell>
                        <TableCell align="right"><ParamChip paramKey="nh3" value={r.nh3} /></TableCell>
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
    </Stack>
  );
}
