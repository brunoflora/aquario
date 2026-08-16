import { useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import useMediaQuery from "@mui/material/useMediaQuery";

// Paleta e tipografia seguem 100% o default do MUI — nada de tokens próprios.
// A única decisão de cor é *qual modo* (claro/escuro), acompanhando o SO, como
// a documentação do MUI recomenda (useMediaQuery + palette.mode).
//
// As sobrescritas abaixo são exclusivamente de ACESSIBILIDADE, não de estilo:
// vários defaults do MUI ficam abaixo dos 44×44 px exigidos pelo WCAG 2.5.5
// (IconButton medium = 40, Button medium ≈ 36,5, ToggleButton ≈ 39). O contexto
// de uso deste app é o pior possível para precisão de toque — em pé na frente do
// aquário, uma mão no celular, a outra no frasco de teste, dedos molhados.
// Nenhuma cor, fonte ou espaçamento é alterado aqui.
const TOUCH_TARGET = 44;

export default function AppThemeProvider({ children }) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = useMemo(
    () => createTheme({
      palette: { mode: prefersDark ? "dark" : "light" },
      components: {
        MuiIconButton: { styleOverrides: { root: { minWidth: TOUCH_TARGET, minHeight: TOUCH_TARGET } } },
        MuiButton: { styleOverrides: { root: { minHeight: TOUCH_TARGET } } },
        MuiToggleButton: { styleOverrides: { root: { minHeight: TOUCH_TARGET } } },
        MuiCheckbox: { styleOverrides: { root: { padding: 11 } } },
        MuiTab: { styleOverrides: { root: { minHeight: TOUCH_TARGET } } },
      },
    }),
    [prefersDark]
  );
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
