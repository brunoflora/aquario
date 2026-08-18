import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { useAppState } from "../state/AppStateProvider.jsx";
import {
  CORE_PARAMS, sortedReadings, deriveEffectiveReading, paramStatus, countOpenFields,
} from "../domain/water.js";
import { formatParam, brDate, todayStr } from "../domain/format.js";
import { Panel, useAq, toneColor } from "./ui.jsx";

const TONE_OF = { good: "good", warn: "warn", bad: "bad", empty: "none" };
const PAGINA = 7;

/**
 * Histórico como lista, não como tabela.
 *
 * A tabela anterior tinha 10 colunas em 393 px de tela: ou rolava na
 * horizontal, ou espremia cada célula a ponto de o valor não caber. Numa lista,
 * cada dia é uma linha com a data e seis pontos de estado — a leitura que
 * importa no histórico é "que dias estavam ruins", não o valor exato de cada
 * parâmetro de cada dia. O valor exato está a um toque, na aba Medir.
 */
export default function HistoricoLista() {
  const { state, deleteReading } = useAppState();
  const aq = useAq();
  const [expandido, setExpandido] = useState(false);

  const linhas = useMemo(() => {
    const sorted = sortedReadings(state.readings).map(deriveEffectiveReading);
    return sorted.slice().reverse();
  }, [state.readings]);

  if (linhas.length === 0) {
    return (
      <Panel>
        <Typography variant="body2" color="text.secondary">
          Nenhum registro ainda. A primeira leitura aparece aqui.
        </Typography>
      </Panel>
    );
  }

  const visiveis = expandido ? linhas : linhas.slice(0, PAGINA);

  return (
    <Panel sx={{ px: 2, py: 0.5 }}>
      {visiveis.map((r, i) => {
        const aberto = countOpenFields(r);
        return (
          <Stack
            key={r.date}
            direction="row"
            sx={{
              alignItems: "center", gap: 1, py: 1.25, minHeight: 52,
              borderBottom: i === visiveis.length - 1 ? "none" : `1px solid ${aq.line}`,
            }}
          >
            <Box sx={{ width: 62, flexShrink: 0 }}>
              <Typography className="aq-num" sx={{ fontSize: 13, fontWeight: 500 }}>
                {brDate(r.date).slice(0, 5)}
              </Typography>
              {r.date === todayStr() && (
                <Typography variant="caption" sx={{ color: aq.inkDim, fontSize: 10 }}>hoje</Typography>
              )}
            </Box>

            <Stack direction="row" sx={{ gap: 0.5, flex: 1 }}>
              {CORE_PARAMS.map((key) => {
                const tone = TONE_OF[paramStatus(key, r[key])] || "none";
                return (
                  <Box
                    key={key}
                    title={`${key}: ${formatParam(key, r[key])}`}
                    sx={{
                      flex: 1, height: 22, borderRadius: 0.75, minWidth: 0,
                      backgroundColor: toneColor(aq, tone),
                      opacity: tone === "none" ? 0.18 : 0.85,
                    }}
                  />
                );
              })}
            </Stack>

            <Typography variant="caption" sx={{ color: aq.inkFaint, width: 34, textAlign: "right", fontSize: 10.5 }}>
              {aberto > 0 ? `−${aberto}` : "✓"}
            </Typography>

            <IconButton
              size="small" aria-label={`Excluir registro de ${brDate(r.date)}`}
              onClick={() => deleteReading(r.date)}
              sx={{ color: aq.inkFaint, minWidth: 36, minHeight: 36 }}
            >
              <DeleteIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Stack>
        );
      })}

      {linhas.length > PAGINA && (
        <Button
          fullWidth color="inherit" onClick={() => setExpandido((v) => !v)}
          sx={{ color: aq.inkDim, my: 0.5 }}
        >
          {expandido ? "Mostrar menos" : `Ver todas as ${linhas.length} leituras`}
        </Button>
      )}
    </Panel>
  );
}
