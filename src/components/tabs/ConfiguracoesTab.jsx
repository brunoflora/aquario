import Stack from "@mui/material/Stack";
import CloudCard from "./CloudCard.jsx";
import InfographicSection from "./InfographicSection.jsx";
import FichaTecnicaForm from "./FichaTecnicaForm.jsx";

export default function ConfiguracoesTab({ cloud }) {
  return (
    <Stack spacing={3}>
      <CloudCard cloud={cloud} />
      <InfographicSection />
      <FichaTecnicaForm />
    </Stack>
  );
}
