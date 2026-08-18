import { useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import useMediaQuery from "@mui/material/useMediaQuery";
import { PALETTE, FONT_UI, FONT_DATA, TOUCH_TARGET } from "./tokens.js";

// O tema traduz os tokens (theme/tokens.js) para o MUI. As duas paletas são
// definidas por inteiro — nenhuma cor existe só num dos modos, senão o app
// renderiza texto de um tema sobre o fundo do outro.
export default function AppThemeProvider({ children }) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const mode = prefersDark ? "dark" : "light";

  const theme = useMemo(() => {
    const t = PALETTE[mode];
    return createTheme({
      palette: {
        mode,
        background: { default: t.ground, paper: t.surface },
        text: { primary: t.ink, secondary: t.inkDim, disabled: t.inkFaint },
        divider: t.line,
        primary: { main: t.ink, contrastText: t.ground },
        success: { main: t.ok },
        warning: { main: t.warn },
        error: { main: t.crit },
        info: { main: t.inkDim },
        aq: t,
      },
      shape: { borderRadius: 14 },
      typography: {
        fontFamily: FONT_UI,
        h1: { fontFamily: FONT_UI, fontWeight: 700, letterSpacing: "-.02em" },
        h2: { fontFamily: FONT_UI, fontWeight: 700, letterSpacing: "-.02em" },
        h3: { fontFamily: FONT_UI, fontWeight: 700, letterSpacing: "-.02em" },
        h4: { fontFamily: FONT_UI, fontWeight: 700, letterSpacing: "-.02em" },
        h5: { fontFamily: FONT_UI, fontWeight: 650, letterSpacing: "-.015em" },
        h6: { fontFamily: FONT_UI, fontWeight: 650, letterSpacing: "-.01em" },
        button: { fontFamily: FONT_UI, fontWeight: 600, textTransform: "none", letterSpacing: 0 },
        overline: { fontFamily: FONT_UI, fontWeight: 600, letterSpacing: ".12em", lineHeight: 1.6 },
        caption: { fontFamily: FONT_UI, lineHeight: 1.45 },
        body2: { lineHeight: 1.5 },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: { background: t.ground, color: t.ink, WebkitFontSmoothing: "antialiased" },
            // Algarismos tabulares em toda leitura numérica: colunas de números
            // que não dançam de largura quando o valor muda.
            ".aq-num": { fontFamily: FONT_DATA, fontVariantNumeric: "tabular-nums", letterSpacing: "-.02em" },
          },
        },
        MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
        MuiCard: {
          styleOverrides: {
            root: { backgroundColor: t.surface, border: `1px solid ${t.line}`, backgroundImage: "none" },
          },
        },
        MuiIconButton: { styleOverrides: { root: { minWidth: TOUCH_TARGET, minHeight: TOUCH_TARGET } } },
        MuiButton: {
          defaultProps: { disableElevation: true },
          styleOverrides: { root: { minHeight: TOUCH_TARGET, borderRadius: 12 } },
        },
        MuiToggleButton: { styleOverrides: { root: { minHeight: TOUCH_TARGET, textTransform: "none" } } },
        MuiCheckbox: { styleOverrides: { root: { padding: 11 } } },
        MuiTab: { styleOverrides: { root: { minHeight: TOUCH_TARGET, textTransform: "none" } } },
        MuiAlert: { styleOverrides: { root: { borderRadius: 12 } } },
      },
    });
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
