import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

// Primitivas compartilhadas. A regra da paleta vale aqui: `tone` é sempre
// estado da água ("good" | "warn" | "bad" | "none"), nunca decoração.

export function useAq() {
  return useTheme().palette.aq;
}

export function toneColor(aq, tone) {
  if (tone === "good") return aq.ok;
  if (tone === "warn") return aq.warn;
  if (tone === "bad") return aq.crit;
  return aq.inkFaint;
}

export function toneWash(aq, tone) {
  if (tone === "good") return aq.okWash;
  if (tone === "warn") return aq.warnWash;
  if (tone === "bad") return aq.critWash;
  return "transparent";
}

/** Rótulo de seção. Estrutura a página sem gastar um H2 em cada bloco. */
export function SectionLabel({ children, action }) {
  const aq = useAq();
  return (
    <Stack
      direction="row"
      sx={{ alignItems: "baseline", justifyContent: "space-between", mb: 1.25, gap: 1 }}
    >
      <Typography variant="overline" sx={{ color: aq.inkDim, fontSize: 11 }}>
        {children}
      </Typography>
      {action}
    </Stack>
  );
}

/** Leitura numérica: sempre em mono, sempre tabular. */
export function Num({ children, size = 28, tone, sx }) {
  const aq = useAq();
  return (
    <Box
      component="span"
      className="aq-num"
      sx={{ fontSize: size, fontWeight: 600, lineHeight: 1.05, color: tone ? toneColor(aq, tone) : "inherit", ...sx }}
    >
      {children}
    </Box>
  );
}

/** Superfície padrão do app. Cartão sem sombra, definido por borda. */
export function Panel({ children, tone, sx, ...rest }) {
  const aq = useAq();
  return (
    <Box
      sx={{
        borderRadius: 3.5,
        border: `1px solid ${tone && tone !== "none" ? toneColor(aq, tone) + "55" : aq.line}`,
        backgroundColor: tone && tone !== "none" ? toneWash(aq, tone) : aq.surface,
        p: 2,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}

/** Ponto de status. Redundante com a cor de propósito: forma + cor. */
export function StatusDot({ tone, size = 8 }) {
  const aq = useAq();
  return (
    <Box
      component="span"
      sx={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        backgroundColor: toneColor(aq, tone),
        outline: tone === "none" ? `1px solid ${aq.line}` : "none",
      }}
    />
  );
}
