import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { AppStateProvider } from "./state/AppStateProvider.jsx";

function Inner() {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4">Aquário — migração em andamento</Typography>
    </Container>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <Inner />
    </AppStateProvider>
  );
}
