import { toDayIndex } from "./water.js";

export function fromDayIndex(idx) {
  const d = new Date(idx * 86400000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function brDate(iso) { return iso.split("-").reverse().join("/"); }

// Porte de cadenceSummary do vanilla — conta a partir da primeira medição,
// não do início da janela (senão os meses anteriores ao início do diário
// viram "dias não medidos" e a taxa de adesão fica artificialmente péssima).
export function cadenceSummary(byDate, startIdx, todayIdx, windowWeeks) {
  let firstMeasured = null;
  for (let f = startIdx; f <= todayIdx; f++) {
    if (byDate[fromDayIndex(f)]) { firstMeasured = f; break; }
  }
  if (firstMeasured === null) {
    return { caption: `Nenhuma medição nas últimas ${windowWeeks} semanas.` };
  }
  startIdx = firstMeasured;
  const total = todayIdx - startIdx + 1;
  let measured = 0, longestGap = 0, gap = 0, longestRun = 0, run = 0;
  for (let i = startIdx; i <= todayIdx; i++) {
    if (byDate[fromDayIndex(i)]) {
      measured++; run++; gap = 0;
      if (run > longestRun) longestRun = run;
    } else {
      gap++; run = 0;
      if (gap > longestGap) longestGap = gap;
    }
  }
  const pct = Math.round((measured / total) * 100);
  return {
    caption: `Desde a primeira medição (${brDate(fromDayIndex(startIdx))}): ${measured} de ${total} dias medidos (${pct}%) · maior sequência sem falhar: ${longestRun} dia(s) · maior intervalo sem medir: ${longestGap} dia(s)`,
  };
}

export function todayDayIndex() {
  const d = new Date();
  return toDayIndex(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
}
