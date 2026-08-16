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
import ConfiguracoesTab from "./tabs/ConfiguracoesTab.jsx";
import ChecklistTab from "./tabs/ChecklistTab.jsx";

const TABS = ["Painel", "Parâmetros", "Configurações", "Checklist"];

export default function AppShell() {
  const { saveIndicator, snackbar, dismissSnackbar } = useAppState();
  const cloud = useCloudSync();
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ pt: 4, pb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "flex-start" }} spacing={2}>
          <Box>
            <Typography variant="overline" color="text.secondary">Aquário jumbo — Ciclídeos Nacionais</Typography>
            <Typography variant="h4" component="h1" gutterBottom>Um trecho de rio amazônico, medido todo dia</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
              598 litros de água preta em 2 metros de leito. O painel mostra como a água está hoje; as outras
              abas registram o parâmetro do dia, explicam a ficha do sistema e riscam o que ainda falta consertar.
            </Typography>
          </Box>
          <Stack alignItems={{ xs: "flex-start", sm: "flex-end" }} spacing={1}>
            <Typography variant="caption" color="text.secondary" aria-live="polite" aria-atomic="true">
              {saveIndicator}
            </Typography>
            <CloudStatusChip
              cloudState={cloud.cloudState}
              detail={cloud.cloudDetail}
              onClick={() => setTab(2)}
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
        <Box role="tabpanel" hidden={tab !== 0}>{tab === 0 && <PainelTab onGoToConfig={() => setTab(2)} />}</Box>
        <Box role="tabpanel" hidden={tab !== 1}>{tab === 1 && <ParametrosTab />}</Box>
        <Box role="tabpanel" hidden={tab !== 2}>{tab === 2 && <ConfiguracoesTab cloud={cloud} />}</Box>
        <Box role="tabpanel" hidden={tab !== 3}>{tab === 3 && <ChecklistTab />}</Box>
      </Container>

      <Snackbar
        open={!!snackbar}
        onClose={dismissSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {snackbar ? (
          <Alert
            onClose={dismissSnackbar}
            severity={snackbar.variant === "error" ? "error" : "info"}
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
