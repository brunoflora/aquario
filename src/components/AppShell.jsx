import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import AddchartOutlinedIcon from "@mui/icons-material/AddchartOutlined";
import ChecklistRtlOutlinedIcon from "@mui/icons-material/ChecklistRtlOutlined";
import TuneOutlinedIcon from "@mui/icons-material/Tune";
import { useAppState } from "../state/AppStateProvider.jsx";
import { useCloudSync } from "../cloud/useCloudSync.js";
import CloudStatusChip from "./CloudStatusChip.jsx";
import HojeScreen from "./screens/HojeScreen.jsx";
import MedirScreen from "./screens/MedirScreen.jsx";
import PlanoScreen from "./screens/PlanoScreen.jsx";
import SistemaScreen from "./screens/SistemaScreen.jsx";
import { useAq } from "./ui.jsx";
import { sortedReadings } from "../domain/water.js";
import { todayStr, brDate } from "../domain/format.js";

// Quatro destinos, na ordem em que o aquarista faz as perguntas:
// "como está?" → "registrar" → "o que faço?" → "como está montado?".
//
// A navegação saiu do topo para a base. Tabs horizontais no topo tinham dois
// defeitos num celular de 393 px: a quarta aba ficava cortada ("O SI…") e todas
// ficavam no canto mais distante do polegar. A barra inferior resolve os dois.
const DESTINOS = [
  { key: "hoje", label: "Hoje", icon: <WaterDropOutlinedIcon /> },
  { key: "medir", label: "Medir", icon: <AddchartOutlinedIcon /> },
  { key: "plano", label: "Plano", icon: <ChecklistRtlOutlinedIcon /> },
  { key: "sistema", label: "Sistema", icon: <TuneOutlinedIcon /> },
];

const NAV_HEIGHT = 64;

export default function AppShell() {
  const { state, saveIndicator, snackbar, dismissSnackbar } = useAppState();
  const cloud = useCloudSync();
  const [destino, setDestino] = useState("hoje");
  const aq = useAq();

  const ultimaData = useMemo(() => {
    const sorted = sortedReadings(state.readings);
    return sorted.length ? sorted[sorted.length - 1].date : null;
  }, [state.readings]);

  const subtitulo = !ultimaData
    ? "nenhuma leitura registrada"
    : ultimaData === todayStr()
      ? "medido hoje"
      : `última leitura em ${brDate(ultimaData)}`;

  return (
    <Box sx={{ minHeight: "100dvh", backgroundColor: aq.ground, display: "flex", flexDirection: "column" }}>
      {/* Cabeçalho fixo e enxuto. O anterior gastava ~330 px (39% da primeira
          tela do iPhone) com título, subtítulo e chip — em toda visita, antes de
          qualquer dado. Aqui são 56 px. */}
      <Box
        component="header"
        sx={{
          position: "sticky", top: 0, zIndex: 10,
          backgroundColor: aq.ground, borderBottom: `1px solid ${aq.line}`,
          pt: "env(safe-area-inset-top)",
        }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between", gap: 1, px: 2, height: 56, maxWidth: 560, mx: "auto" }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15, letterSpacing: "-.01em", lineHeight: 1.2 }} noWrap>
              Rio amazônico · 598 L
            </Typography>
            <Typography variant="caption" sx={{ color: aq.inkDim, lineHeight: 1.2 }} noWrap aria-live="polite">
              {subtitulo}
            </Typography>
          </Box>
          <CloudStatusChip
            cloudState={cloud.cloudState}
            detail={cloud.cloudDetail}
            onClick={() => setDestino("sistema")}
          />
        </Stack>
      </Box>

      <Box
        component="main"
        sx={{ flex: 1, px: 2, pt: 2.5, pb: `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom) + 24px)`, maxWidth: 560, width: "100%", mx: "auto" }}
      >
        {destino === "hoje" && (
          <HojeScreen
            onIrParaMedir={() => setDestino("medir")}
            onIrParaPlano={() => setDestino("plano")}
          />
        )}
        {destino === "medir" && <MedirScreen />}
        {destino === "plano" && <PlanoScreen />}
        {destino === "sistema" && <SistemaScreen cloud={cloud} />}

        <Typography
          variant="caption"
          sx={{ display: "block", color: aq.inkFaint, mt: 4, textAlign: "center" }}
        >
          {saveIndicator}
        </Typography>
      </Box>

      <Box
        component="nav"
        sx={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20,
          backgroundColor: aq.surface, borderTop: `1px solid ${aq.line}`,
          pb: "env(safe-area-inset-bottom)",
        }}
      >
        <BottomNavigation
          showLabels
          value={destino}
          onChange={(_, v) => setDestino(v)}
          sx={{ backgroundColor: "transparent", height: NAV_HEIGHT, maxWidth: 560, mx: "auto" }}
        >
          {DESTINOS.map((d) => (
            <BottomNavigationAction
              key={d.key} value={d.key} label={d.label} icon={d.icon}
              sx={{
                color: aq.inkFaint, minWidth: 0,
                "&.Mui-selected": { color: aq.ink },
                "& .MuiBottomNavigationAction-label": { fontSize: 11, "&.Mui-selected": { fontSize: 11 } },
              }}
            />
          ))}
        </BottomNavigation>
      </Box>

      <Snackbar
        open={!!snackbar}
        onClose={dismissSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ bottom: `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom) + 12px) !important` }}
      >
        {snackbar ? (
          <Alert
            onClose={dismissSnackbar}
            severity={snackbar.variant === "default" ? "info" : snackbar.variant}
            variant="filled"
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
