// Lógica de score/gates da água — porte fiel do index.html vanilla original.

export const CORE_PARAMS = ["temp", "ph", "kh", "nh3", "no2", "no3"];

export const WEIGHTS = { temp: 20, ph: 15, kh: 10, nh3: 20, no2: 20, no3: 10, turbidez: 5 };

export const RANGES = {
  temp: { goodMin: 25, goodMax: 28, warnMin: 23, warnMax: 29.5 },
  ph: { goodMin: 6.5, goodMax: 7.6, warnMin: 6.0, warnMax: 8.0 },
  kh: { goodMin: 4, goodMax: 8, warnMin: 2, warnMax: 10 },
  nh3: { goodMax: 0.02, warnMax: 0.25 },
  no2: { goodMax: 0.02, warnMax: 0.25 },
  no3: { goodMax: 20, warnMax: 40 },
};

export const PARAM_LABELS = {
  temp: "Temperatura",
  ph: "pH",
  kh: "KH",
  nh3: "Amônia (NH₃)",
  no2: "Nitrito (NO₂)",
  no3: "Nitrato (NO₃)",
  turbidez: "Turbidez",
};

export const TREND_ORDER = ["temp", "ph", "kh", "nh3", "no2", "no3"];
export const TREND_UNITS = { temp: "°C", ph: "", kh: "dKH", nh3: "ppm", no2: "ppm", no3: "ppm" };

export function idealBand(key) {
  const r = RANGES[key];
  if (key === "nh3" || key === "no2" || key === "no3") return [0, r.goodMax];
  return [r.goodMin, r.goodMax];
}

export function paramStatus(key, value) {
  if (value === null || value === undefined || value === "") return "empty";
  if (key === "turbidez") return value ? "bad" : "good";
  const r = RANGES[key];
  if (key === "nh3" || key === "no2" || key === "no3") {
    if (value <= r.goodMax) return "good";
    if (value <= r.warnMax) return "warn";
    return "bad";
  }
  if (value >= r.goodMin && value <= r.goodMax) return "good";
  if (value >= r.warnMin && value <= r.warnMax) return "warn";
  return "bad";
}

export function countOpenFields(reading) {
  if (!reading) return CORE_PARAMS.length;
  return CORE_PARAMS.filter((key) => {
    const v = reading[key];
    return v === null || v === undefined || v === "";
  }).length;
}

export function computeWaterScore(reading) {
  if (!reading) return null;
  if (countOpenFields(reading) > 0) return 0;
  let total = 0;
  let totalWeight = 0;
  Object.keys(WEIGHTS).forEach((key) => {
    const value = reading[key];
    if (value === null || value === undefined || value === "") return;
    const status = paramStatus(key, value);
    const factor = status === "good" ? 1 : status === "warn" ? 0.5 : 0;
    total += WEIGHTS[key] * factor;
    totalWeight += WEIGHTS[key];
  });
  if (totalWeight === 0) return null;
  return Math.round((total / totalWeight) * 100);
}

export function scoreLabel(score) {
  if (score === null || score === undefined) return "sem dados";
  if (score >= 80) return "Bom";
  if (score >= 50) return "Alerta";
  return "Ruim";
}

export function offendersOf(reading) {
  if (!reading) return [];
  return Object.keys(WEIGHTS)
    .filter((key) => {
      const status = paramStatus(key, reading[key]);
      return status === "warn" || status === "bad";
    })
    .map((key) => {
      const status = paramStatus(key, reading[key]);
      return PARAM_LABELS[key] + (status === "warn" ? " (alerta)" : " (ruim)");
    });
}

export function toDayIndex(dateStr) {
  const parts = dateStr.split("-").map(Number);
  return Date.UTC(parts[0], parts[1] - 1, parts[2]) / 86400000;
}

export function sortedReadings(readings) {
  return readings.slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

export function computeStreak(sorted, predicate) {
  let streak = 0;
  let prevDay = null;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const r = sorted[i];
    const dayIdx = toDayIndex(r.date);
    if (prevDay !== null && prevDay - dayIdx !== 1) break;
    if (!predicate(r)) break;
    streak++;
    prevDay = dayIdx;
  }
  return streak;
}

export function evaluateGates(readings) {
  const sorted = sortedReadings(readings);
  const clearStreak = computeStreak(sorted, (r) => r.turbidez === false || r.turbidez === undefined);
  const bioStreak = computeStreak(sorted, (r) => {
    const nh3 = r.nh3 === null || r.nh3 === undefined || r.nh3 === "" ? null : Number(r.nh3);
    const no2 = r.no2 === null || r.no2 === undefined || r.no2 === "" ? null : Number(r.no2);
    return nh3 !== null && no2 !== null && nh3 <= 0.01 && no2 <= 0.01;
  });
  return {
    clearStreak,
    clearTarget: 5,
    clearMet: clearStreak >= 5,
    bioStreak,
    bioTarget: 3,
    bioMet: bioStreak >= 3,
    ready: clearStreak >= 5 && bioStreak >= 3,
  };
}

const ACTION_MESSAGES = {
  temp: {
    bad: "Temperatura fora da faixa seguro (25–28°C). Ajuste aquecedor/resfriamento imediatamente.",
    warn: "Temperatura no limite da faixa ideal. Monitore de perto nas próximas horas.",
  },
  ph: {
    bad: "pH fora da faixa ideal (6,5–7,6). Verifique substrato/décor e considere TPA.",
    warn: "pH próximo do limite. Acompanhe a tendência nos próximos dias.",
  },
  kh: {
    bad: "KH fora da faixa recomendada (4–8 dKH), o que reduz a estabilidade do pH.",
    warn: "KH no limite. Considere reforçar a capacidade de tamponamento.",
  },
  nh3: {
    bad: "Amônia em nível crítico. Faça troca parcial de água agora e revise o ciclo do filtro.",
    warn: "Amônia detectada em nível baixo. Redobre atenção à filtragem biológica.",
  },
  no2: {
    bad: "Nitrito em nível crítico. TPA imediata e verificação do ciclo do nitrogênio.",
    warn: "Nitrito presente em nível baixo. Continue monitorando diariamente.",
  },
  no3: {
    bad: "Nitrato acima de 40 ppm. Realize TPA para reduzir acúmulo de sólidos.",
    warn: "Nitrato entre 20–40 ppm. Planeje uma TPA nos próximos dias.",
  },
  turbidez: {
    bad: "Água turva registrada. Verifique filtragem mecânica e evite sobrealimentação.",
  },
};

export function deriveActionPlan(lastReading, gates) {
  const items = [];
  if (!lastReading) {
    items.push({ level: "warn", text: "Registre o parâmetro de hoje para começar a receber recomendações." });
    return items;
  }
  const openKeys = CORE_PARAMS.filter((key) => {
    const v = lastReading[key];
    return v === null || v === undefined || v === "";
  });
  if (openKeys.length > 0) {
    const openLabels = openKeys.map((key) => PARAM_LABELS[key]).join(", ");
    items.push({ level: "warn", text: `Score zerado até completar todos os parâmetros de hoje. Faltam: ${openLabels}.` });
  }
  Object.keys(WEIGHTS).forEach((key) => {
    const value = lastReading[key];
    const status = paramStatus(key, value);
    if ((status === "bad" || status === "warn") && ACTION_MESSAGES[key] && ACTION_MESSAGES[key][status]) {
      items.push({ level: status, text: ACTION_MESSAGES[key][status] });
    }
  });
  if (gates.ready) {
    items.push({
      level: "good",
      text: `Critérios atendidos: ${gates.clearTarget} dias de água clara e ${gates.bioTarget} dias com amônia/nitrito zerados. Ambiente pronto para introduzir o Green Terror.`,
    });
  } else {
    items.push({
      level: "warn",
      text: `Progresso do gate — água clara: ${gates.clearStreak}/${gates.clearTarget} dias · biologia zerada: ${gates.bioStreak}/${gates.bioTarget} dias.`,
    });
  }
  if (items.length === 0) {
    items.push({ level: "good", text: "Todos os parâmetros dentro da faixa ideal hoje." });
  }
  return items;
}
