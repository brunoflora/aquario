import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { useAppState } from "../state/AppStateProvider.jsx";
import { useCloudSync } from "../cloud/useCloudSync.js";
import CloudStatusChip from "./CloudStatusChip.jsx";
import PainelTab from "./tabs/PainelTab.jsx";
import ParametrosTab from "./tabs/ParametrosTab.jsx";
import ManutencaoTab from "./tabs/ManutencaoTab.jsx";
import ConfiguracoesTab from "./tabs/ConfiguracoesTab.jsx";

// Ordenadas por frequência de uso, não por assunto: consulta diária, registro
// diário, operação semanal, referência ocasional. Antes, a conta da TPA (semanal)
// morava no capítulo 8 do infográfico dentro de "Configurações".
const TABS = ["Painel", "Medir", "Manutenção", "O sistema"];

export default function AppShell() {
  const { state, saveIndicator, snackbar, dismissSnackbar } = useAppState();
  const cloud = useCloudSync();
  const [tab, setTab] = useState(0);

  // O texto de apresentação ocupava 48% da primeira tela no celular, em toda
  // visita. Faz sentido antes da primeira medição; a partir daí é rolagem
  // obrigatória entre o usuário e o dado que ele veio ver.
  const primeiraVisita = state.readings.length === 0;

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ pt: primeiraVisita ? 4 : 2, pb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={primeiraVisita ? 2 : 1} sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: primeiraVisita ? "flex-start" : "center" } }}>
          <Box>
            <Typography variant="overline" color="text.secondary">Aquário jumbo — Ciclídeos Nacionais</Typography>
            {primeiraVisita ? (
              <>
                <Typography variant="h4" component="h1" gutterBottom>Um trecho de rio amazônico, medido todo dia</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
                  598 litros de água preta em 2 metros de leito. O painel mostra como a água está hoje; as outras
                  abas registram o parâmetro do dia, explicam a ficha do sistema e riscam o que ainda falta consertar.
                </Typography>
              </>
            ) : (
              <Typography variant="h6" component="h1" sx={{ lineHeight: 1.3 }}>
                Um trecho de rio amazônico
              </Typography>
            )}
          </Box>
          <Stack spacing={1} sx={{ alignItems: { xs: "flex-start", sm: "flex-end" } }}>
            <Typography variant="caption" color="text.secondary" aria-live="polite" aria-atomic="true">
              {saveIndicator}
            </Typography>
            <CloudStatusChip
              cloudState={cloud.cloudState}
              detail={cloud.cloudDetail}
              onClick={() => setTab(3)}
            />
          </Stack>
        </Stack>
      </Container>

      <AppBar position="sticky" color="default" elevation={1}>
        <Container maxWidth="md">
          <Toolbar disableGutters variant="dense">
            <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="Seções do painel">
              {TABS.map((label) => <Tab key={label} label={label} />)}
            </Tabs>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Box role="tabpanel" hidden={tab !== 0}>{tab === 0 && <PainelTab onGoToForm={() => setTab(1)} />}</Box>
        <Box role="tabpanel" hidden={tab !== 1}>{tab === 1 && <ParametrosTab />}</Box>
        <Box role="tabpanel" hidden={tab !== 2}>{tab === 2 && <ManutencaoTab />}</Box>
        <Box role="tabpanel" hidden={tab !== 3}>{tab === 3 && <ConfiguracoesTab cloud={cloud} />}</Box>
      </Container>

      <Snackbar
        open={!!snackbar}
        onClose={dismissSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {snackbar ? (
          <Alert
            onClose={dismissSnackbar}
            severity={snackbar.variant === "default" ? "info" : snackbar.variant}
            action={snackbar.actionLabel ? (
              <Button color="inherit" size="small" onClick={() => { dismissSnackbar(); snackbar.onAction?.(); }}>
                {snackbar.actionLabel}
              </Button>
            ) : undefined}
          >
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
