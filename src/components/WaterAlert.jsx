import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { PARAM_LABELS } from "../domain/water.js";

const SEVERITY = {
  critical: "error",
  attention: "warning",
  ok: "success",
  incomplete: "info",
  none: "info",
};

function fmtValue(key, value) {
  if (key === "turbidez") return value ? "turva" : "clara";
  const digits = key === "no3" ? 0 : key === "nh3" ? 3 : key === "no2" ? 2 : 1;
  const v = Number(value);
  return key === "nh3" && v < 0.001 ? "<0,001" : v.toFixed(digits);
}

/**
 * Estado da água pelo pior parâmetro. Fica acima do medidor de score de
 * propósito: o score é média e responde "como vai a água no geral"; este
 * cartão responde "preciso agir agora?", que é a pergunta com prazo.
 */
export default function WaterAlert({ assessment, onGoToForm }) {
  if (!assessment) return null;
  const { level, headline, detail, offenders } = assessment;

  return (
    <Alert
      severity={SEVERITY[level]}
      variant={level === "critical" ? "filled" : "standard"}
      action={level === "none" && onGoToForm ? (
        <Button color="inherit" size="small" onClick={onGoToForm} sx={{ minHeight: 44 }}>
          Registrar
        </Button>
      ) : undefined}
    >
      <AlertTitle sx={{ fontWeight: 700 }}>{headline}</AlertTitle>
      <Typography variant="body2">{detail}</Typography>

      {offenders.length > 1 && (
        <Box sx={{ mt: 1.25 }}>
          <Typography variant="caption" sx={{ display: "block", mb: 0.5, opacity: 0.9 }}>
            Fora da faixa hoje
          </Typography>
          <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: "wrap" }}>
            {offenders.map((o) => (
              <Chip
                key={o.key}
                size="small"
                label={`${PARAM_LABELS[o.key]} ${fmtValue(o.key, o.value)}`}
                color={o.critical ? "error" : "warning"}
                variant={level === "critical" ? "filled" : "outlined"}
                sx={level === "critical" ? { bgcolor: "rgba(255,255,255,.18)", color: "inherit" } : undefined}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Alert>
  );
}
