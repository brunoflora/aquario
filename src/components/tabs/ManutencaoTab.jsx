import { useMemo } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import { useAppState } from "../../state/AppStateProvider.jsx";
import { computeSystem, fmtBR } from "../../domain/system.js";
import ChecklistTab from "./ChecklistTab.jsx";

function Numero({ rotulo, valor, nota, destaque }) {
  return (
    <Grid item xs={6} sm={3}>
      <Typography variant="caption" color="text.secondary" display="block">{rotulo}</Typography>
      <Typography variant={destaque ? "h4" : "h6"} component="div" color={destaque ? "primary.main" : "text.primary"}>
        {valor}
      </Typography>
      <Typography variant="caption" color="text.secondary">{nota}</Typography>
    </Grid>
  );
}

/**
 * Aba operacional: o que se faz com balde na mão, toda semana.
 *
 * Estes números existiam, mas dentro do capítulo 8 do infográfico — a 11 telas
 * de rolagem numa aba chamada "Configurações". Tarefa semanal não pode custar
 * isso; aqui eles são a primeira coisa da tela.
 */
export default function ManutencaoTab() {
  const { state } = useAppState();
  const s = useMemo(() => computeSystem(state.config, state.readings), [state.config, state.readings]);

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Troca parcial de água</Typography>
          <Typography variant="h6" gutterBottom>As contas de hoje, já para o seu volume real</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Calculado sobre {fmtBR(s.totalSystem, 0)} L em circulação (display + sump + tubulação),
            não sobre os 700 L de catálogo.
          </Typography>

          <Grid container spacing={2}>
            <Numero destaque rotulo="Água a trocar" valor={`${fmtBR(s.tpaLitros, 0)} L`} nota={`${fmtBR(s.tpaPct, 0)}% do sistema`} />
            <Numero destaque rotulo="Declorador" valor={`${fmtBR(s.declorador, 0)} mL`} nota="1 mL para cada 10 L" />
            <Numero destaque rotulo="Bicarbonato" valor={`${fmtBR(s.bicReposicao, 1).replace(".", ",")} g`} nota="repõe os 3 dKH que a troca leva" />
            <Numero rotulo="Preparar antes" valor="24 h" nota="aeração + declorador + bicarbonato" />
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            Com KH 0 e água de rua, {fmtBR(s.tpaLitros, 0)} L não saem da torneira direto para o aquário.
            Prepare em reservatório <strong>24 h antes</strong> — é o que separa uma TPA de rotina de um susto de pH.
          </Alert>
        </CardContent>
      </Card>

      {s.khGap > 0 && (
        <Card>
          <CardContent>
            <Typography variant="overline" color="text.secondary">Correção de KH em andamento</Typography>
            <Typography variant="h6" gutterBottom>
              Faltam {fmtBR(s.khGap, 1).replace(".", ",")} dKH para chegar a 3
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {fmtBR(Math.round(s.bicTotal), 0)} g de bicarbonato no total, fracionados em três doses.
              Nunca de uma vez — subida brusca desloca o pH e causa choque osmótico.
            </Typography>
            <Grid container spacing={2}>
              {["1", "3", "5"].map((dia) => (
                <Numero key={dia} rotulo={`Dia ${dia}`} valor={`${fmtBR(Math.round(s.bicTotal / 3), 0)} g`} nota="dissolvido na C3" />
              ))}
              <Numero rotulo="Dia 7" valor="medir" nota="confirmar 2–4 dKH · pH 6,4–6,8" />
            </Grid>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Trocas de mídia</Typography>
          <Typography variant="h6" gutterBottom>Prazos que invertem de função quando vencem</Typography>
          <Grid container spacing={2}>
            <Numero rotulo="Perlon" valor="10–14 d" nota="vencido, vira fonte de nitrato" />
            <Numero rotulo="Carvão ativado" valor="4–6 sem" nota="1,5–2 L por ciclo" />
            <Numero rotulo="Purigen" valor="4–6 mes" nota="regenerar ~700 mL" />
          </Grid>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Perlon vencido inverte de função.</strong> Com peixe grande e ração carnívora,
            passar de 14 dias transforma a manta de removedor de sólidos em fonte de nitrato — ela
            continua segurando a sujeira, só que agora dissolvida.
          </Alert>
        </CardContent>
      </Card>

      <Divider textAlign="left">
        <Typography variant="overline" color="text.secondary">Obras e medições pendentes</Typography>
      </Divider>

      <ChecklistTab />
    </Stack>
  );
}
