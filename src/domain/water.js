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

// Devolve null quando o dia ainda está incompleto. Antes devolvia 0, o que
// fazia "faltou digitar um campo" e "água catastrófica" exibirem o mesmo
// número — dois estados opostos com a mesma cara (achado F4 da auditoria).
// Quem exibe distingue os casos com countOpenFields().
export function computeWaterScore(reading) {
  if (!reading) return null;
  if (countOpenFields(reading) > 0) return null;
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
  const clearTarget = 5;
  const bioTarget = 3;
  const faltaClear = Math.max(0, clearTarget - clearStreak);
  const faltaBio = Math.max(0, bioTarget - bioStreak);

  // O gargalo é o que ainda segura a liberação. Sem isto o app dizia só
  // "Pronto p/ Green Terror: não" — tinha o dado e não dizia o que faltava,
  // justamente no marco que o aquarista está esperando há semanas.
  let gargalo = null;
  if (faltaBio > 0 && faltaBio >= faltaClear) {
    gargalo = `faltam ${faltaBio} dia(s) com amônia e nitrito zerados`;
  } else if (faltaClear > 0) {
    gargalo = `faltam ${faltaClear} dia(s) de água clara`;
  }

  return {
    clearStreak,
    clearTarget,
    clearMet: clearStreak >= clearTarget,
    bioStreak,
    bioTarget,
    bioMet: bioStreak >= bioTarget,
    ready: clearStreak >= clearTarget && bioStreak >= bioTarget,
    gargalo,
  };
}

/**
 * Distância do valor até a faixa ideal, normalizada: 0 = no alvo, 1 = no limite
 * de alerta, >1 = além do limite.
 *
 * Existe para o radar. Plotando o valor bruto, os eixos carregavam duas
 * semânticas opostas — temperatura e pH têm faixa ideal no MEIO da escala
 * (longe do centro é ruim dos dois lados), enquanto amônia e nitrito são
 * "quanto menor melhor" (perto do centro é ótimo). Dois problemas iguais
 * apontavam para lados contrários do gráfico. Normalizado assim, o centro
 * sempre significa saudável e qualquer ponta estendida significa problema.
 */
export function idealDistance(key, value) {
  if (value === null || value === undefined || value === "") return 0;
  const v = Number(value);
  const r = RANGES[key];
  if (!r) return 0;

  if (key === "nh3" || key === "no2" || key === "no3") {
    if (v <= r.goodMax) return 0;
    return (v - r.goodMax) / (r.warnMax - r.goodMax);
  }
  if (v >= r.goodMin && v <= r.goodMax) return 0;
  if (v < r.goodMin) return (r.goodMin - v) / (r.goodMin - r.warnMin);
  return (v - r.goodMax) / (r.warnMax - r.goodMax);
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
  // Amônia e nitrito não têm faixa "tranquila": o ideal é zero e qualquer valor
  // detectável já agride brânquia. A copy de alerta precisa pedir ação, não
  // apenas atenção — senão o título diz "aja agora" e o texto diz "monitore".
  nh3: {
    bad: "Amônia em nível crítico. Faça troca parcial de água agora e revise o ciclo do filtro.",
    warn: "Amônia detectada. Acima de 0,02 ppm já há agressão a brânquia — faça TPA e verifique a filtragem biológica antes que suba.",
  },
  no2: {
    bad: "Nitrito em nível crítico. TPA imediata e verificação do ciclo do nitrogênio.",
    warn: "Nitrito detectado. O ideal é zero — faça TPA e acompanhe de perto: o ciclo do nitrogênio não está fechando.",
  },
  no3: {
    bad: "Nitrato acima de 40 ppm. Realize TPA para reduzir acúmulo de sólidos.",
    warn: "Nitrato entre 20–40 ppm. Planeje uma TPA nos próximos dias.",
  },
  turbidez: {
    bad: "Água turva registrada. Verifique filtragem mecânica e evite sobrealimentação.",
  },
};

const FIELD_GOOD_MESSAGES = {
  temp: "Na faixa ideal (25–28°C).",
  ph: "Na faixa ideal (6,5–7,6).",
  kh: "Na faixa ideal (4–8 dKH) — bom tampão para o pH.",
  nh3: "Zerada, como deve ser.",
  no2: "Zerado, como deve ser.",
  no3: "Dentro da faixa segura (até 20 ppm).",
  turbidez: "Água clara.",
};

/**
 * Feedback do que esse valor significa e o que fazer, pra aparecer no
 * helperText do campo enquanto o usuário digita — não só depois, resumido
 * no plano de ação. Null enquanto o campo está vazio (helperText volta ao
 * texto estático de faixa ideal).
 */
export function fieldGuidance(key, value) {
  const status = paramStatus(key, value);
  if (status === "empty") return null;
  if (status === "good") return { status, text: FIELD_GOOD_MESSAGES[key] || "Na faixa ideal." };
  const text = (ACTION_MESSAGES[key] || {})[status];
  return text ? { status, text } : null;
}

// Amônia e nitrito são tóxicos em qualquer nível detectável: a faixa "alerta"
// (0,02–0,25 ppm) já causa dano de brânquia. Para estes dois, alerta escala
// para crítico — os demais parâmetros toleram ficar no limite por um dia.
const TOXIC_PARAMS = ["nh3", "no2"];

const SEVERITY_RANK = { bad: 3, warn: 2, good: 1, empty: 0 };

/**
 * Avalia a água pelo PIOR parâmetro, não pela média.
 *
 * O score ponderado (computeWaterScore) responde "como está a água no geral" —
 * é uma boa medida de tendência, e uma péssima medida de alarme: com peso 20 de
 * 100, a amônia sozinha nunca derruba o índice abaixo do limiar de "bom", então
 * 0,30 ppm de NH₃ (emergência declarada pelo próprio app) exibia 80/100 em verde.
 * Esta função existe para responder a outra pergunta: "preciso agir agora?".
 */
export function assessWater(reading) {
  if (!reading) {
    return { level: "none", headline: "Nenhuma medição registrada", detail: "Registre a primeira leitura para acompanhar o estado da água.", offenders: [] };
  }

  const open = countOpenFields(reading);
  if (open > 0) {
    const faltando = CORE_PARAMS.filter((k) => {
      const v = reading[k];
      return v === null || v === undefined || v === "";
    }).map((k) => PARAM_LABELS[k]);
    return {
      level: "incomplete",
      headline: `Leitura incompleta — ${open} de ${CORE_PARAMS.length} campos em aberto`,
      detail: `Faltam: ${faltando.join(", ")}.`,
      offenders: [],
    };
  }

  const offenders = Object.keys(WEIGHTS)
    .map((key) => {
      const status = paramStatus(key, reading[key]);
      if (status === "good" || status === "empty") return null;
      const critical = status === "bad" || TOXIC_PARAMS.indexOf(key) >= 0;
      return {
        key,
        status,
        critical,
        label: PARAM_LABELS[key],
        value: reading[key],
        message: (ACTION_MESSAGES[key] || {})[status] || "",
      };
    })
    .filter(Boolean)
    // Ordem de urgência, não de peso no score: entre dois parâmetros igualmente
    // ruins, amônia e nitrito vêm primeiro porque matam em horas e pedem uma
    // ação diferente (TPA imediata) da de temperatura ou pH.
    .sort((a, b) =>
      (b.critical - a.critical) ||
      ((TOXIC_PARAMS.indexOf(b.key) >= 0) - (TOXIC_PARAMS.indexOf(a.key) >= 0)) ||
      (SEVERITY_RANK[b.status] - SEVERITY_RANK[a.status]) ||
      (WEIGHTS[b.key] - WEIGHTS[a.key])
    );

  if (offenders.length === 0) {
    return { level: "ok", headline: "Todos os parâmetros na faixa ideal", detail: "Nada a fazer hoje além de manter a rotina.", offenders: [] };
  }

  const worst = offenders[0];
  const criticos = offenders.filter((o) => o.critical);

  if (worst.critical) {
    const extra = criticos.length > 1 ? ` (e mais ${criticos.length - 1} em nível crítico)` : "";
    return {
      level: "critical",
      headline: `${worst.label} exige ação agora${extra}`,
      detail: worst.message,
      offenders,
    };
  }

  return {
    level: "attention",
    headline: `${worst.label} fora da faixa ideal`,
    detail: worst.message,
    offenders,
  };
}

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
    items.push({ level: "warn", text: `O score só é calculado com o dia completo. Faltam: ${openLabels}.` });
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
