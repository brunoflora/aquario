import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";

const LABELS = {
  off: "nuvem: não configurada",
  blocked: "nuvem: bloqueada neste sandbox",
  syncing: "nuvem: sincronizando…",
  synced: "nuvem: sincronizado",
  error: "nuvem: erro ao sincronizar",
  diverge: "nuvem: dados diferentes — clique para revisar",
};

// cores semânticas já existentes na paleta default do MUI (success/warning/
// error/info) — nenhuma cor nova é definida aqui.
const COLORS = {
  off: "default",
  blocked: "default",
  syncing: "info",
  synced: "success",
  error: "error",
  diverge: "warning",
};

export default function CloudStatusChip({ cloudState, detail, onClick }) {
  const label = LABELS[cloudState] || "nuvem";
  const chip = (
    <Chip
      size="small"
      color={COLORS[cloudState] || "default"}
      variant={cloudState === "off" || cloudState === "blocked" ? "outlined" : "filled"}
      label={label}
      onClick={onClick}
      data-testid="cloud-status-chip"
      data-state={cloudState}
      // único chip clicável do app; os demais são leitura. Altura elevada ao
      // mínimo de toque sem inflar os chips de dado das tabelas.
      //
      // maxWidth + truncagem do rótulo: com a fonte do sistema ampliada, o
      // rótulo por extenso empurrava o chip por cima do título do cabeçalho.
      // O estado continua legível pela cor e pelo início do texto, e o texto
      // completo segue no tooltip.
      sx={{
        minHeight: 44, borderRadius: 22, maxWidth: "45%", flexShrink: 1,
        "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
      }}
    />
  );
  return detail ? <Tooltip title={detail}>{chip}</Tooltip> : chip;
}
