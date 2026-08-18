import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloudCard from "../tabs/CloudCard.jsx";
import FichaTecnicaForm from "../tabs/FichaTecnicaForm.jsx";
import InfographicSection from "../tabs/InfographicSection.jsx";
import BackupCard from "../BackupCard.jsx";
import { SectionLabel, useAq } from "../ui.jsx";

const CAPITULOS = [
  "O rio · display",
  "A várzea · sump",
  "A correnteza · hidráulica",
  "A cheia · queda de energia",
  "Água preta · química",
  "O leito · carga estrutural",
  "Os habitantes · fauna",
  "O calendário das águas",
];

/** Seção recolhida: some da rolagem sem sumir do app. */
function Secao({ titulo, nota, children }) {
  const aq = useAq();
  return (
    <Accordion
      disableGutters elevation={0}
      sx={{
        border: `1px solid ${aq.line}`, borderRadius: "14px !important", backgroundColor: aq.surface,
        "&:before": { display: "none" }, "&.Mui-expanded": { margin: 0 },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 64, px: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 600 }}>{titulo}</Typography>
          {nota && <Typography variant="caption" sx={{ color: aq.inkDim }}>{nota}</Typography>}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>{children}</AccordionDetails>
    </Accordion>
  );
}

/**
 * Ordenada por frequência de uso, não por importância do assunto — a mesma
 * regra que rege a navegação inteira.
 *
 * Sincronizar e exportar backup são tarefas de segundos, feitas com alguma
 * frequência. A ficha técnica se preenche uma vez, na montagem, e quase nunca
 * mais. O relatório é leitura. Deixar a ficha aberta no topo (era assim) fazia
 * quem veio sincronizar rolar por dezenas de campos de formulário; somada ao
 * relatório, a aba pedia 19,5 telas de rolagem num iPhone.
 */
export default function SistemaScreen({ cloud }) {
  return (
    <Stack spacing={3}>
      <Box>
        <SectionLabel>Sincronização</SectionLabel>
        <CloudCard cloud={cloud} />
      </Box>

      <Box>
        <SectionLabel>Backup local</SectionLabel>
        <BackupCard />
      </Box>

      <Box>
        <SectionLabel>Configuração e referência</SectionLabel>
        <Stack spacing={1.5}>
          <Secao titulo="Ficha técnica do sistema" nota="dimensões, volumes, bomba — define os cálculos de dose">
            <FichaTecnicaForm />
          </Secao>

          <Secao titulo="Relatório completo do sistema" nota="8 capítulos · leitura longa">
            <Box sx={{ mb: 2.5, pb: 2, borderBottom: 1, borderColor: "divider" }}>
              {CAPITULOS.map((cap, i) => (
                <Stack key={cap} direction="row" sx={{ gap: 1.25, py: 0.35 }}>
                  <Typography variant="caption" className="aq-num" color="text.disabled" sx={{ width: 18 }}>
                    {String(i + 1).padStart(2, "0")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{cap}</Typography>
                </Stack>
              ))}
            </Box>
            <InfographicSection />
          </Secao>
        </Stack>
      </Box>
    </Stack>
  );
}
