import { useMemo } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { useAppState } from "../../state/AppStateProvider.jsx";
import { computeSystem } from "../../domain/system.js";
import {
  sortedReadings, deriveEffectiveReading, calculateTPA, generateSpecialistPlan,
} from "../../domain/water.js";
import { formatNumber } from "../../domain/format.js";
import { Panel, SectionLabel, Num, useAq } from "../ui.jsx";
import ChecklistTab from "../tabs/ChecklistTab.jsx";

/** Dose ou prazo: número grande em mono, unidade e nota subordinadas. */
function Dose({ valor, unidade, rotulo, nota, tone }) {
  const aq = useAq();
  return (
    <Box sx={{ minWidth: 84 }}>
      <Stack direction="row" sx={{ alignItems: "baseline", gap: 0.5 }}>
        <Num size={26} tone={tone}>{valor}</Num>
        <Typography variant="caption" sx={{ color: aq.inkDim }}>{unidade}</Typography>
      </Stack>
      <Typography variant="caption" sx={{ color: aq.ink, display: "block", fontWeight: 500, mt: 0.25 }}>
        {rotulo}
      </Typography>
      {nota && (
        <Typography variant="caption" sx={{ color: aq.inkFaint, display: "block", lineHeight: 1.35 }}>
          {nota}
        </Typography>
      )}
    </Box>
  );
}

/**
 * Diagnóstico do especialista: um card por parâmetro fora da faixa, no
 * formato input (o dado) → diagnóstico → ação → resultado esperado. Existia
 * como função pronta em domain/water.js (generateSpecialistPlan) mas nunca
 * era chamada por nenhuma tela — o AcaoCard da aba Hoje cobre só TPA/KH.
 * Aqui cobre todos os parâmetros, inclusive os que a TPA sozinha não resolve
 * (GH, temperatura).
 */
function DiagnosticoEspecialista({ plano }) {
  const aq = useAq();
  const itens = plano.filter((item) => item.key !== null);
  if (itens.length === 0) return null;

  return (
    <Box>
      <SectionLabel>Diagnóstico do especialista</SectionLabel>
      <Stack spacing={1.25}>
        {itens.map((item) => (
          <Panel key={item.key} tone={item.level === "good" ? undefined : item.level}>
            <Typography sx={{ fontWeight: 600, mb: 0.75 }}>{item.label}</Typography>
            <Typography variant="body2" sx={{ color: aq.inkFaint, mb: 1 }} className="aq-num">
              {item.input}
            </Typography>
            <Typography variant="body2" sx={{ color: aq.inkDim, mb: 1 }}>{item.output}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>{item.action}</Typography>
            <Box sx={{ pt: 1, borderTop: `1px dashed ${aq.line}` }}>
              <Typography variant="caption" sx={{ color: aq.inkFaint }}>
                Esperado depois: {item.outcome}
              </Typography>
            </Box>
          </Panel>
        ))}
      </Stack>
    </Box>
  );
}

export default function PlanoScreen() {
  const { state } = useAppState();
  const s = useMemo(() => computeSystem(state.config, state.readings), [state.config, state.readings]);

  const last = useMemo(() => {
    const sorted = sortedReadings(state.readings).map(deriveEffectiveReading);
    return sorted.length ? sorted[sorted.length - 1] : null;
  }, [state.readings]);
  const tpa = useMemo(() => (last ? calculateTPA(last) : null), [last]);
  const planoEspecialista = useMemo(() => generateSpecialistPlan(last), [last]);

  // A TPA corretiva (puxada pelo pior parâmetro) manda sobre a de rotina: se a
  // água pede 70%, trocar os 33% do calendário não resolve o problema de hoje.
  const pctCorretiva = tpa && tpa.limitingFactor ? tpa.tpaPercentage : null;
  const pctAplicado = pctCorretiva !== null ? Math.max(pctCorretiva, s.tpaPct) : s.tpaPct;
  const litros = (s.totalSystem * pctAplicado) / 100;
  const corretiva = pctCorretiva !== null && pctCorretiva > s.tpaPct;

  return (
    <Stack spacing={3}>
      <Box>
        <SectionLabel>Troca parcial de água</SectionLabel>
        <Panel tone={corretiva ? (tpa.urgency === "critical" ? "bad" : "warn") : undefined}>
          <Typography variant="body2" sx={{ mb: 2 }} color="text.secondary">
            {corretiva
              ? `Corretiva: ${tpa.limitingFactor.label.toLowerCase()} exige mais que os ${formatNumber(s.tpaPct, 0)}% de rotina.`
              : `Rotina do calendário, sobre ${formatNumber(s.totalSystem, 0)} L em circulação — não sobre os 700 L de catálogo.`}
          </Typography>

          <Stack direction="row" sx={{ gap: 3, flexWrap: "wrap", rowGap: 2.5 }}>
            <Dose
              valor={formatNumber(litros, 0)} unidade="L" rotulo="Água a trocar"
              nota={`${formatNumber(pctAplicado, 0)}% do sistema`}
              tone={corretiva ? (tpa.urgency === "critical" ? "bad" : "warn") : undefined}
            />
            <Dose
              valor={formatNumber(litros / 10, 0)} unidade="mL" rotulo="Declorador"
              nota="1 mL para cada 10 L"
            />
            <Dose
              valor={formatNumber((3 * 30 * litros) / 1000, 1)} unidade="g" rotulo="Bicarbonato"
              nota="repõe o KH que a troca leva"
            />
            <Dose valor="24" unidade="h" rotulo="Preparar antes" nota="aeração + declorador" />
          </Stack>

          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <Typography variant="body2" color="text.secondary">
              Com KH {formatNumber(s.lastKh === null ? 0 : s.lastKh, 1)} e água de rua,{" "}
              {formatNumber(litros, 0)} L não saem da torneira direto para o aquário. Prepare em
              reservatório <strong>24 h antes</strong> — é o que separa uma TPA de rotina de um susto de pH.
            </Typography>
          </Box>
        </Panel>
      </Box>

      {s.khGap > 0 && (
        <Box>
          <SectionLabel>Correção de KH em andamento</SectionLabel>
          <Panel tone="warn">
            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
              Faltam {formatNumber(s.khGap, 1)} dKH para chegar a 3
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {formatNumber(Math.round(s.bicTotal), 0)} g de bicarbonato no total, fracionados em três
              doses. Nunca de uma vez — subida brusca desloca o pH e causa choque osmótico.
            </Typography>
            <Stack direction="row" sx={{ gap: 3, flexWrap: "wrap", rowGap: 2 }}>
              {["1", "3", "5"].map((dia) => (
                <Dose
                  key={dia} valor={formatNumber(Math.round(s.bicTotal / 3), 0)} unidade="g"
                  rotulo={`Dia ${dia}`} nota="dissolvido na C3"
                />
              ))}
              <Dose valor="7" unidade="d" rotulo="Medir" nota="confirmar 2–4 dKH · pH 6,4–6,8" />
            </Stack>
          </Panel>
        </Box>
      )}

      <Box>
        <SectionLabel>Trocas de mídia</SectionLabel>
        <Panel>
          <Stack direction="row" sx={{ gap: 3, flexWrap: "wrap", rowGap: 2 }}>
            <Dose valor="7" unidade="d" rotulo="Perlon" nota="revisado 13/09/2026, era 10–14" tone="warn" />
            <Dose valor="4–6" unidade="sem" rotulo="Carvão ativado" nota="1,5–2 L por ciclo" />
            <Dose valor="4–6" unidade="mes" rotulo="Purigen" nota="regenerar ~700 mL" />
          </Stack>
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Perlon vencido inverte de função.</strong> Com peixe grande e ração carnívora,
              passar de 7 dias transforma a manta de removedor de sólidos em fonte de nitrato — ela
              continua segurando a sujeira, só que agora dissolvida. A troca ficou mais frequente porque
              a manta hoje divide a Câmara 2 com a mídia K1 fluidizada.
            </Typography>
          </Box>
        </Panel>
      </Box>

      <DiagnosticoEspecialista plano={planoEspecialista} />

      <Divider />
      <ChecklistTab />
    </Stack>
  );
}
