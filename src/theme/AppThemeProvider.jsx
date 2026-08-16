import { useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import useMediaQuery from "@mui/material/useMediaQuery";

// Tema 100% default do MUI — nenhuma paleta, token ou componente customizado.
// A única decisão é *qual modo* (claro/escuro) usar, seguindo o SO, exatamente
// como a própria documentação do MUI recomenda fazer (useMediaQuery + palette.mode).
export default function AppThemeProvider({ children }) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = useMemo(
    () => createTheme({ palette: { mode: prefersDark ? "dark" : "light" } }),
    [prefersDark]
  );
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
