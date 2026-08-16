import { sortedReadings } from "./water.js";

export const DOWNPIPE_TABLE = [
  { mm: 25, max: 1200 }, { mm: 32, max: 2500 }, { mm: 40, max: 3500 },
  { mm: 50, max: 5500 }, { mm: 60, max: 9000 },
];

export function numBR(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;
  let str = String(value).trim();
  if (str.indexOf(",") >= 0) str = str.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(str);
  return isFinite(n) ? n : fallback;
}

export function fmtBR(n, digits = 0) {
  return Number(n).toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

// Porte fiel de computeSystem() do vanilla — todos os números do infográfico
// (capítulos 01–08) vêm daqui.
export function computeSystem(config, readings) {
  const c = config || {};
  const netTank = numBR(c["tank-volume-net"], 597.5);
  const sumpOp = numBR(c["sump-volume-operation"], 79.1);
  const sumpGross = numBR(c["sump-volume"], 108.7);
  const totalSystem = netTank + sumpOp + 5; // +5 L de tubulação
  const flowReal = numBR(c["sump-pump-flow-real"], 5000);
  const turnover = totalSystem > 0 ? flowReal / totalSystem : 0;
  const tpaPct = numBR(c["maint-percent"], 33);
  const tpaLitros = (totalSystem * tpaPct) / 100;
  const headroom = Math.max(0, sumpGross - 1.2 - sumpOp);

  const sorted = sortedReadings(readings || []);
  let lastKh = null;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const v = sorted[i].kh;
    if (v !== null && v !== undefined && v !== "") { lastKh = Number(v); break; }
  }
  const khTarget = 3;
  const khGap = Math.max(0, khTarget - (lastKh === null ? 0 : lastKh));
  const bicTotal = (khGap * 30 * totalSystem) / 1000;
  const bicReposicao = (khTarget * 30 * tpaLitros) / 1000;

  const dMm = numBR(c["hyd-downpipe-diameter"], null);
  const downpipe = { measured: dMm !== null && dMm > 0, mm: dMm, capacity: null, ok: null };
  if (downpipe.measured) {
    let row = null;
    for (let k = 0; k < DOWNPIPE_TABLE.length; k++) {
      if (dMm >= DOWNPIPE_TABLE[k].mm) row = DOWNPIPE_TABLE[k];
    }
    downpipe.capacity = row ? row.max : 600;
    downpipe.ok = downpipe.capacity >= flowReal;
  }

  const antiSiphon = String(c["hyd-antisiphon-done"] || "nao") === "sim";
  const descidaOverflow = 20;
  const descidaSifao = 30;
  const descidaTotal = antiSiphon ? descidaOverflow : descidaOverflow + descidaSifao;
  const contem = descidaTotal <= headroom;

  return {
    netTank, sumpOp, sumpGross, totalSystem, flowReal, turnover, tpaPct, tpaLitros, headroom,
    lastKh, khGap, bicTotal, bicReposicao, downpipe, antiSiphon, descidaTotal, contem,
    declorador: tpaLitros / 10,
  };
}
