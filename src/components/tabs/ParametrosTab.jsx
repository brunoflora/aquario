import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import MenuItem from "@mui/material/MenuItem";
import { useAppState } from "../../state/AppStateProvider.jsx";
import { evaluateGates, deriveActionPlan, sortedReadings, toDayIndex } from "../../domain/water.js";
import { DEFAULT_PHASES, PHASE_STATUSES } from "../../domain/phases.js";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function brDate(iso) { return iso.split("-").reverse().join("/"); }

const BLANK = { date: todayStr(), temp: "", ph: "", kh: "", nh3: "", no2: "", no3: "", turbidez: false, notes: "" };
const NUMERIC_FIELDS = ["temp", "ph", "kh", "nh3", "no2", "no3"];

// o form mantém os campos numéricos como string enquanto o usuário digita
// (pra não brigar com estados intermediários tipo "26,"); só na hora de
// persistir é que viram Number de verdade — igual ao readForm() do vanilla.
function toStoredReading(form) {
  const reading = { ...form };
  NUMERIC_FIELDS.forEach((key) => {
    reading[key] = reading[key] === "" || reading[key] === null || reading[key] === undefined ? "" : Number(reading[key]);
  });
  return reading;
}

function readingHasData(reading) {
  if (reading.notes && reading.notes.trim() !== "") return true;
  if (reading.turbidez) return true;
  return ["temp", "ph", "kh", "nh3", "no2", "no3"].some((k) => reading[k] !== "" && reading[k] !== null && reading[k] !== undefined);
}

const LEVEL_ICON = { good: <CheckCircleIcon color="success" />, warn: <WarningAmberIcon color="warning" />, bad: <ErrorOutlineIcon color="error" /> };

export default function ParametrosTab() {
  const { state, upsertReading, deleteReading, showSnackbar, addCriteria, toggleCriteria, removeCriteria, updatePhase } = useAppState();

  const sorted = useMemo(() => sortedReadings(state.readings), [state.readings]);
  const mostRecent = sorted.length ? sorted[sorted.length - 1] : null;

  const [form, setForm] = useState(() => mostRecent || BLANK);
  const saveTimerRef = useRef(null);
  const initedRef = useRef(false);

  // preenche com o registro mais recente na primeira carga (mesmo comportamento do init() vanilla)
  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;
    if (mostRecent) setForm(mostRecent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function scheduleAutosave(next) {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (!next.date) return;
      const exists = state.readings.some((r) => r.date === next.date);
      if (!readingHasData(next) && !exists) return;
      upsertReading(toStoredReading(next));
    }, 300);
  }

  function handleField(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      scheduleAutosave(next);
      return next;
    });
  }

  function handleNewToday() {
    clearTimeout(saveTimerRef.current);
    const today = todayStr();
    const existing = state.readings.find((r) => r.date === today);
    setForm(existing || { ...BLANK, date: today });
    if (!existing) showSnackbar("Novo registro iniciado para hoje. Ele só é gravado quando você digitar algo.");
  }

  function handleDeleteCurrent() {
    if (!form.date) return;
    if (!state.readings.some((r) => r.date === form.date)) {
      showSnackbar("Não há registro salvo nesta data para excluir.");
      return;
    }
    deleteReading(form.date);
  }

  const activeBanner = useMemo(() => {
    const today = todayStr();
    if (!form.date || form.date === today) return null;
    const diff = toDayIndex(today) - toDayIndex(form.date);
    const quando = diff === 1 ? "ontem" : diff > 1 ? `há ${diff} dias` : "em data futura";
    return { label: brDate(form.date), quando };
  }, [form.date]);

  const gates = evaluateGates(state.readings);
  const actionPlan = deriveActionPlan(mostRecent, gates);

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {activeBanner ? `Registro de ${activeBanner.label}` : "Registro do dia"}
              </Typography>
              {activeBanner && (
                <Alert severity="warning" sx={{ mb: 2 }} action={
                  <Button color="inherit" size="small" onClick={handleNewToday}>Registrar hoje</Button>
                }>
                  Você está vendo a última leitura preenchida, de {activeBanner.label} ({activeBanner.quando}).
                  Ela segue ativa até você gravar a próxima — o que for alterado aqui edita esse registro.
                </Alert>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Data" type="date" InputLabelProps={{ shrink: true }}
                    value={form.date} onChange={(e) => handleField("date", e.target.value)}
                    helperText="Um registro por dia. Reabrir a mesma data edita o registro."
                  />
                </Grid>
                <Grid item xs={12} sm={6} />
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Temperatura" type="number" inputProps={{ step: 0.1 }}
                    value={form.temp} onChange={(e) => handleField("temp", e.target.value)}
                    InputProps={{ endAdornment: <InputAdornment position="end">°C</InputAdornment> }}
                    helperText="Faixa ideal 25–28."
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="pH" type="number" inputProps={{ step: 0.1 }}
                    value={form.ph} onChange={(e) => handleField("ph", e.target.value)}
                    helperText="Faixa ideal 6,5–7,6."
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Dureza de carbonatos" type="number" inputProps={{ step: 0.5 }}
                    value={form.kh} onChange={(e) => handleField("kh", e.target.value)}
                    InputProps={{ endAdornment: <InputAdornment position="end">dKH</InputAdornment> }}
                    helperText="Faixa ideal 4–8. É o tampão que segura o pH."
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Amônia" type="number" inputProps={{ step: 0.01 }}
                    value={form.nh3} onChange={(e) => handleField("nh3", e.target.value)}
                    InputProps={{ endAdornment: <InputAdornment position="end">ppm</InputAdornment> }}
                    helperText="Ideal zero. Acima de 0,25 é emergência."
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Nitrito" type="number" inputProps={{ step: 0.01 }}
                    value={form.no2} onChange={(e) => handleField("no2", e.target.value)}
                    InputProps={{ endAdornment: <InputAdornment position="end">ppm</InputAdornment> }}
                    helperText="Ideal zero. Acima de 0,25 é emergência."
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Nitrato" type="number" inputProps={{ step: 5 }}
                    value={form.no3} onChange={(e) => handleField("no3", e.target.value)}
                    InputProps={{ endAdornment: <InputAdornment position="end">ppm</InputAdornment> }}
                    helperText="Ideal abaixo de 20. Acima de 40, faça TPA."
                  />
                </Grid>
                <Grid item xs={12} sm={6} sx={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    control={<Checkbox checked={!!form.turbidez} onChange={(e) => handleField("turbidez", e.target.checked)} />}
                    label="Água turva hoje"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth multiline minRows={2} label="Notas do dia"
                    value={form.notes} onChange={(e) => handleField("notes", e.target.value)}
                    helperText="Campo livre. Some ao histórico e ao export JSON."
                  />
                </Grid>
              </Grid>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button variant="contained" onClick={handleNewToday}>Novo registro (hoje)</Button>
                <Button variant="outlined" color="error" onClick={handleDeleteCurrent}>Excluir este registro</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Plano de ação</Typography>
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
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Fases do projeto</Typography>
              <Stack spacing={2}>
                {(state.phases.length ? state.phases : DEFAULT_PHASES).map((phase) => (
                  <Box key={phase.id}>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" sx={{ flex: 1 }}>{phase.label}</Typography>
                      <TextField
                        select size="small" value={phase.status}
                        onChange={(e) => updatePhase(phase.id, { status: e.target.value })}
                        sx={{ minWidth: 160 }}
                      >
                        {PHASE_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                      </TextField>
                    </Stack>
                    <TextField
                      fullWidth size="small" placeholder="Notas desta fase..." multiline minRows={1}
                      value={phase.notes || ""} onChange={(e) => updatePhase(phase.id, { notes: e.target.value })}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Critérios adicionais do gate</Typography>
              {state.criteria.length === 0 ? (
                <Typography color="text.secondary" sx={{ mb: 1 }}>Nenhum critério manual adicionado.</Typography>
              ) : (
                <List dense>
                  {state.criteria.map((c, i) => (
                    <ListItem
                      key={i} disableGutters
                      secondaryAction={
                        <IconButton edge="end" aria-label="Remover" onClick={() => removeCriteria(i)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <Checkbox checked={!!c.checked} onChange={(e) => toggleCriteria(i, e.target.checked)} />
                      <ListItemText primary={c.label} />
                    </ListItem>
                  ))}
                </List>
              )}
              <NewCriteriaForm onAdd={addCriteria} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}

function NewCriteriaForm({ onAdd }) {
  const [value, setValue] = useState("");
  function submit() {
    const label = value.trim();
    if (!label) return;
    onAdd(label);
    setValue("");
  }
  return (
    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
      <TextField
        fullWidth size="small" placeholder="Ex: veterinário aprovou introdução"
        value={value} onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
      />
      <Button variant="outlined" onClick={submit}>Adicionar</Button>
    </Stack>
  );
}
