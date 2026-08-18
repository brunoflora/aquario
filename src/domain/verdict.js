import { assessWater, computeWaterScore, countOpenFields, CORE_PARAMS } from "./water.js";
import { formatParam } from "./format.js";

// O VEREDICTO: uma frase, um estado, um responsável.
//
// Por que isto existe. O painel antigo mostrava, na mesma tela, um alerta
// vermelho "KH exige ação agora" e um medidor VERDE de 83/100. Os dois estavam
// certos dentro da própria lógica — o score é média ponderada (KH pesa 10 de
// 100, então um colapso de tampão quase não mexe no índice) e o alerta olha o
// pior parâmetro. Mas o usuário não lê duas lógicas: lê a tela, vê verde grande
// e vermelho pequeno, e conclui que está tudo bem.
//
// A correção não é pintar o medidor de outra cor — é hierárquica. O veredicto
// (pior parâmetro) passa a ser o herói da tela; a média vira métrica de
// tendência, explicitamente rotulada como média, e nunca aparece em verde
// enquanto existir parâmetro crítico. Um instrumento não pode dar dois
// diagnósticos ao mesmo tempo.

const LEVEL_VIEW = {
  critical: { word: "Ação agora", tone: "bad", rank: 3 },
  attention: { word: "Atenção", tone: "warn", rank: 2 },
  ok: { word: "Estável", tone: "good", rank: 1 },
  incomplete: { word: "Leitura incompleta", tone: "warn", rank: 0 },
  none: { word: "Sem medição", tone: "none", rank: 0 },
};

/**
 * Devolve o veredicto pronto para a tela: palavra de estado, o parâmetro que
 * está mandando nesse estado (com valor já formatado), o que fazer, e a idade
 * da leitura — porque um veredicto de três dias atrás não é o estado de hoje.
 */
export function buildVerdict(reading, todayIso) {
  const assessment = assessWater(reading);
  const view = LEVEL_VIEW[assessment.level] || LEVEL_VIEW.none;
  const driver = assessment.offenders && assessment.offenders.length ? assessment.offenders[0] : null;

  const score = reading ? computeWaterScore(reading) : null;
  const open = reading ? countOpenFields(reading) : CORE_PARAMS.length;

  let ageDays = null;
  if (reading && reading.date && todayIso) {
    const toIdx = (s) => { const p = s.split("-").map(Number); return Date.UTC(p[0], p[1] - 1, p[2]) / 86400000; };
    ageDays = toIdx(todayIso) - toIdx(reading.date);
  }

  return {
    level: assessment.level,
    word: view.word,
    tone: view.tone,
    headline: assessment.headline,
    detail: assessment.detail,
    offenders: assessment.offenders || [],
    driver: driver
      ? { key: driver.key, label: driver.label, value: formatParam(driver.key, driver.value), status: driver.status }
      : null,
    score,
    openCount: open,
    ageDays,
    stale: ageDays !== null && ageDays >= 1,
  };
}

/**
 * Cor com que a MÉDIA pode ser exibida. Trava deliberada: enquanto houver
 * parâmetro crítico, a média não pode aparecer em verde por mais alta que
 * esteja — era exatamente esse verde que contradizia o alarme vermelho.
 */
export function scoreTone(score, verdictTone) {
  if (score === null || score === undefined) return "none";
  if (verdictTone === "bad") return "bad";
  if (verdictTone === "warn") return score >= 50 ? "warn" : "bad";
  if (score >= 80) return "good";
  if (score >= 50) return "warn";
  return "bad";
}
