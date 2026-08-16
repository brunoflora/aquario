import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useAppState } from "../../state/AppStateProvider.jsx";
import { PRIORITY_GROUPS, PRIORITY_META } from "../../domain/tasks.js";

function Stat({ label, value, note, color }) {
  return (
    <Grid item xs={6} sm={3}>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="h5" color={color}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">{note}</Typography>
    </Grid>
  );
}

function TaskRow({ task, idx, onToggle, onRemove }) {
  return (
    <ListItem
      disableGutters
      secondaryAction={task.custom ? (
        <IconButton edge="end" aria-label="Remover" onClick={() => onRemove(idx)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      ) : undefined}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        <Checkbox edge="start" checked={!!task.checked} onChange={(e) => onToggle(idx, e.target.checked)} />
      </ListItemIcon>
      <ListItemText
        primary={task.label}
        secondary={
          <>
            {task.impact}
            {task.cost ? ` · ${task.cost}` : ""}
          </>
        }
      />
    </ListItem>
  );
}

export default function ChecklistTab() {
  const { state, toggleStructTask, removeStructTask, addStructTask, showSnackbar } = useAppState();
  const [hideDone, setHideDone] = useState(false);
  const [newTask, setNewTask] = useState("");

  function submitNewTask() {
    const label = newTask.trim();
    if (!label) { showSnackbar("Digite uma ação antes de adicionar.", { variant: "error" }); return; }
    addStructTask(label);
    setNewTask("");
  }

  const entries = useMemo(() => state.structTasks.map((task, idx) => ({ task, idx })), [state.structTasks]);
  const acoes = entries.filter((e) => e.task.group !== "medicao");
  const medicoes = entries.filter((e) => e.task.group === "medicao");

  const reportAcoes = acoes.filter((e) => !e.task.custom);
  const doneCount = reportAcoes.filter((e) => e.task.checked).length;
  const pct = reportAcoes.length ? Math.round((doneCount / reportAcoes.length) * 100) : 0;
  const criticalOpen = reportAcoes.filter((e) => e.task.priority === "critica" && !e.task.checked).length;
  const costOpen = reportAcoes.reduce((sum, e) => (e.task.checked ? sum : sum + (e.task.costValue || 0)), 0);
  const pendingOpen = medicoes.filter((e) => !e.task.checked).length;

  const customs = acoes.filter((e) => e.task.custom);
  const medShown = hideDone ? medicoes.filter((e) => !e.task.checked) : medicoes;

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Ações prioritárias · relatório estrutural</Typography>
          <Typography variant="h5" gutterBottom>Onze ações. Três não esperam a semana que vem.</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            A lista sai direto da síntese do relatório, na ordem em que o risco cobra. As críticas somam R$ 75 —
            o que separa o sistema de hoje de um sistema seguro custa menos que uma ração boa.
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Stat label="Concluídas" value={`${doneCount} / ${reportAcoes.length}`} note={doneCount === 0 ? "nenhuma ação riscada ainda" : `${pct}% do relatório resolvido`} />
            <Stat label="Críticas em aberto" value={criticalOpen} note="risco de inundação, colapso de pH ou transbordo" color={criticalOpen > 0 ? "error.main" : "success.main"} />
            <Stat label="Custo em aberto" value={`R$ ${costOpen.toLocaleString("pt-BR")}`} note="soma das ações ainda não feitas" />
            <Stat label="Medições pendentes" value={pendingOpen} note="o que falta para o relatório fechar" />
          </Grid>
          <LinearProgress
            variant="determinate"
            value={pct}
            color={criticalOpen > 0 ? "error" : pct === 100 ? "success" : "primary"}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <ToggleButtonGroup
            exclusive size="small" value={hideDone ? "open" : "all"}
            onChange={(_, v) => { if (v) setHideDone(v === "open"); }}
            sx={{ mb: 2 }}
          >
            <ToggleButton value="all">Todas</ToggleButton>
            <ToggleButton value="open">Só as pendentes</ToggleButton>
          </ToggleButtonGroup>

          {PRIORITY_GROUPS.map((g) => {
            const groupEntries = acoes.filter((e) => !e.task.custom && e.task.priority === g.key);
            if (groupEntries.length === 0) return null;
            const shown = hideDone ? groupEntries.filter((e) => !e.task.checked) : groupEntries;
            if (shown.length === 0 && hideDone) return null;
            const done = groupEntries.filter((e) => e.task.checked).length;
            const meta = PRIORITY_META[g.key];
            return (
              <Box key={g.key} sx={{ mb: 3 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Chip size="small" label={meta.label} color={meta.chipColor} />
                  <Typography variant="subtitle1">{g.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{done}/{groupEntries.length}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{g.intro}</Typography>
                <List dense>
                  {shown.map((e) => (
                    <TaskRow key={e.idx} task={e.task} idx={e.idx} onToggle={toggleStructTask} onRemove={removeStructTask} />
                  ))}
                </List>
              </Box>
            );
          })}

          {customs.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography variant="subtitle1">Ações próprias</Typography>
                <Typography variant="caption" color="text.secondary">
                  {customs.filter((e) => e.task.checked).length}/{customs.length}
                </Typography>
              </Stack>
              <List dense>
                {customs.map((e) => (
                  <TaskRow key={e.idx} task={e.task} idx={e.idx} onToggle={toggleStructTask} onRemove={removeStructTask} />
                ))}
              </List>
            </Box>
          )}

          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth size="small" placeholder="Adicionar ação própria..."
              value={newTask} onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submitNewTask(); }}
            />
            <Button variant="outlined" onClick={submitNewTask}>Adicionar</Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Dados pendentes</Typography>
          <Typography variant="h5" gutterBottom>Seis números que transformam estimativa em medida</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Todo valor marcado [EST] na aba Configurações depende de um destes seis. Com eles, as tabelas de
            vazão, folga anti-transbordo e carga estrutural deixam de ser projeção.
          </Typography>
          {medShown.length === 0 ? (
            <Typography color="text.secondary">
              {hideDone ? "Todas as medições foram registradas." : "Nenhuma medição pendente."}
            </Typography>
          ) : (
            <List dense>
              {medShown.map((e) => (
                <TaskRow key={e.idx} task={e.task} idx={e.idx} onToggle={toggleStructTask} onRemove={removeStructTask} />
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
