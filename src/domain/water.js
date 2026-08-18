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
  nh3: "Amônia tóxica (NH₃)",
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

// Constantes da equação de Emerson et al. (1975), o padrão de aquicultura
// para converter amônia total (TAN — o que o kit de teste lê pela cor) na
// fração que é NH₃ não-ionizada (a que atravessa a brânquia e mata). É a
// mesma equação por trás da tabela impressa pH×temperatura dos kits de teste
// (LabconTest e equivalentes) — valida contra a tabela do kit com desvio
// menor que 0,003 ppm em toda a faixa de pH 6,6–8,7 / 22–28°C.
const AMMONIA_PKA_A = 0.09018;
const AMMONIA_PKA_B = 2729.92;

function nh3Fraction(pH, tempC) {
  const tempK = tempC + 273.15;
  const pKa = AMMONIA_PKA_A + AMMONIA_PKA_B / tempK;
  return 1 / (1 + Math.pow(10, pKa - pH));
}

/**
 * Converte amônia total (TAN, o valor lido pela cor no teste) na fração
 * tóxica (NH₃) real, dado o pH e a temperatura do dia. Em pH baixo o
 * equilíbrio químico favorece NH4+ (amônio, inofensivo); em pH alto quase
 * todo o total vira NH3. Por isso os mesmos 0,25 ppm de TAN podem ser
 * irrelevantes a pH 6,2 e uma emergência a pH 8,0 — o mesmo número lido no
 * teste não tem o mesmo significado em dois aquários com pH diferente.
 *
 * Sem pH ou temperatura para calcular, assume o pior caso (o total inteiro
 * seria tóxico) em vez de fingir que está seguro.
 */
export function toxicNH3(totalAmmonia, pH, tempC) {
  if (totalAmmonia === null || totalAmmonia === undefined || totalAmmonia === "") return null;
  const total = Number(totalAmmonia);
  if (pH === null || pH === undefined || pH === "" || tempC === null || tempC === undefined || tempC === "") {
    return total;
  }
  return total * nh3Fraction(Number(pH), Number(tempC));
}

export { nh3Fraction };

/**
 * O teste de amônia lê "amônia total" (TAN) pela cor — sozinho, esse número
 * não diz se é perigoso. Esta função devolve uma cópia da leitura com "nh3"
 * já substituído pelo valor tóxico calculado (usando o pH e a temperatura
 * do MESMO dia), para que score, gates, radar, alerta e cálculo de TPA
 * todos julguem o número que realmente importa. O total bruto fica
 * guardado em nh3Total, para exibição e para a explicação do cálculo.
 */
export function deriveEffectiveReading(reading) {
  if (!reading) return reading;
  const hasTotal = reading.nh3 !== null && reading.nh3 !== undefined && reading.nh3 !== "";
  if (!hasTotal) return reading;
  const toxic = toxicNH3(reading.nh3, reading.ph, reading.temp);
  return { ...reading, nh3: toxic, nh3Total: Number(reading.nh3) };
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
    bad: "Amônia tóxica (NH₃) em nível crítico — já calculada pelo pH e temperatura de hoje. Faça troca parcial de água agora e revise o ciclo do filtro.",
    warn: "Amônia tóxica (NH₃) detectada. Acima de 0,02 ppm já há agressão a brânquia — faça TPA e verifique a filtragem biológica antes que suba.",
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
  nh3: "Tóxica (NH₃) sob controle para o pH e a temperatura de hoje.",
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

// Cada entrada tem três papéis fixos, o "especialista em aquário jumbo" pedido:
// input = o dado bruto que chegou; output = o diagnóstico daquele dado;
// outcome = o que esperar DEPOIS de seguir a ação, com prazo. Sem isso, um
// plano de ação normal só diz "o que fazer" — este diz também "o que checar
// depois pra saber se funcionou", que é a diferença entre uma lista de
// tarefas e uma recomendação de especialista.
const SPECIALIST_PLAN = {
  temp: {
    bad: {
      diagnostico: "Fora da faixa segura para ciclídeos amazônicos (25–28°C).",
      acao: "Ajuste o aquecedor/resfriador agora.",
      resultado: "Confira de novo em 30 min: deve estar voltando para 25–28°C. Se não se mover, o equipamento pode estar com defeito.",
    },
    warn: {
      diagnostico: "No limite da faixa ideal.",
      acao: "Nenhuma ação ainda — só acompanhe de perto nas próximas horas.",
      resultado: "Se estabilizar sozinha dentro da faixa, não precisa de mais nada. Se continuar subindo/descendo, vira caso de ajuste.",
    },
  },
  ph: {
    bad: {
      diagnostico: "Fora da faixa ideal (6,5–7,6).",
      acao: "Verifique substrato/décor por materiais calcários e considere uma TPA.",
      resultado: "Depois da TPA, meça de novo em algumas horas. Se o pH voltar a fugir rápido, o KH provavelmente está baixo demais para segurar.",
    },
    warn: {
      diagnostico: "Próximo do limite da faixa ideal.",
      acao: "Acompanhe a tendência nos próximos dias, sem intervenção imediata.",
      resultado: "Se o pH oscilar pouco entre medições, é ruído normal. Se a tendência for de piora dia após dia, use uma TPA pequena.",
    },
  },
  kh: {
    bad: {
      diagnostico: "Fora da faixa recomendada (4–8 dKH) — reduz a capacidade de tamponar o pH.",
      acao: "Reforce a dureza de carbonatos (ex.: bicarbonato de sódio em dose controlada) ou faça TPA com água de dureza adequada.",
      resultado: "KH deve subir gradualmente nas próximas medições; o pH tende a ficar mais estável junto.",
    },
    warn: {
      diagnostico: "No limite da faixa — o tampão do pH está ficando fraco.",
      acao: "Considere reforçar a capacidade de tamponamento antes que o pH comece a variar.",
      resultado: "Se o KH se mantiver estável a partir daqui, não é preciso agir mais. Se continuar caindo, reforce.",
    },
  },
  // Amônia e nitrito não têm faixa "tranquila": o ideal é zero e qualquer valor
  // detectável já agride brânquia — por isso a ação aqui é sempre TPA, não
  // "monitorar", mesmo no nível de alerta.
  nh3: {
    bad: {
      diagnostico: "Nível crítico de amônia tóxica (NH₃) — já compromete a brânquia dos peixes. Este valor já converte o total lido no teste pelo pH e temperatura de hoje, não é o número puro da cor do kit.",
      acao: "Faça troca parcial de água agora e revise se o filtro biológico está ciclado.",
      resultado: "Amônia tóxica deve cair perceptivelmente em 24h após a TPA. Se persistir alta, o ciclo do nitrogênio ainda não está fechado — reduza a alimentação e repita a TPA. Se o pH subir nesse meio-tempo, remeça: a fração tóxica cresce junto.",
    },
    warn: {
      diagnostico: "Amônia tóxica (NH₃) detectada — acima de 0,02 ppm já há agressão a brânquia, mesmo sem ser nível crítico.",
      acao: "Faça TPA e verifique a filtragem biológica antes que suba mais.",
      resultado: "Na próxima medição, a amônia tóxica deve estar zerada ou caindo. Se subir, trate como emergência.",
    },
  },
  no2: {
    bad: {
      diagnostico: "Nível crítico do ciclo do nitrogênio.",
      acao: "TPA imediata e verificação completa do ciclo (a colônia bacteriana que converte nitrito não está dando conta).",
      resultado: "Nitrito deve cair nas próximas 24–48h com TPAs repetidas. Se ficar estagnado, o filtro precisa de mais tempo/mídia biológica.",
    },
    warn: {
      diagnostico: "Detectado — o ideal é zero; o ciclo do nitrogênio ainda não fechou de vez.",
      acao: "Faça TPA e acompanhe de perto nos próximos dias.",
      resultado: "Deve zerar em poucos dias conforme a colônia bacteriana amadurece. Se subir em vez de cair, é sinal de sobrecarga (alimentação/lotação).",
    },
  },
  no3: {
    bad: {
      diagnostico: "Acima de 40 ppm — acúmulo de sólidos dissolvidos.",
      acao: "Realize uma TPA para reduzir o acúmulo.",
      resultado: "Nitrato deve cair proporcionalmente ao volume trocado. Se voltar a subir rápido, a cadência de TPA semanal pode precisar aumentar.",
    },
    warn: {
      diagnostico: "Entre 20–40 ppm — ainda seguro, mas subindo em direção ao limite.",
      acao: "Planeje uma TPA nos próximos dias, sem urgência.",
      resultado: "Uma TPA de rotina deve trazer de volta para abaixo de 20 ppm.",
    },
  },
  turbidez: {
    bad: {
      diagnostico: "Água turva registrada.",
      acao: "Verifique a filtragem mecânica (mídia suja/entupida) e evite sobrealimentação.",
      resultado: "Água deve clarear em 1–2 dias após limpar/trocar a mídia mecânica. Se persistir, pode ser bloom bacteriano — revise a manutenção do filtro.",
    },
  },
};

/**
 * O "especialista em aquário jumbo": lê a leitura mais recente e os gates, e
 * devolve um plano de ação estruturado em input (o dado) → output (o
 * diagnóstico) → outcome (o que esperar depois de agir), um item por
 * parâmetro fora da faixa, mais um item sobre o gate de introdução do Green
 * Terror. Continua sendo regra codificada (determinístico, auditável, sem
 * chamada de rede) — não um modelo de linguagem.
 */
export function generateSpecialistPlan(lastReading, gates) {
  if (!lastReading) {
    return [{
      key: null, level: "warn", label: null,
      input: "nenhuma leitura registrada",
      output: "Ainda não há dado para diagnosticar.",
      action: "Registre o parâmetro de hoje na aba Medir.",
      outcome: "A partir da primeira leitura completa, este plano passa a ser gerado automaticamente.",
    }];
  }

  const openKeys = CORE_PARAMS.filter((key) => {
    const v = lastReading[key];
    return v === null || v === undefined || v === "";
  });

  const items = [];

  if (openKeys.length > 0) {
    const openLabels = openKeys.map((key) => PARAM_LABELS[key]).join(", ");
    items.push({
      key: "incomplete", level: "warn", label: "Leitura incompleta",
      input: `${CORE_PARAMS.length - openKeys.length} de ${CORE_PARAMS.length} campos preenchidos`,
      output: `O score do dia só é calculado com a leitura completa. Faltam: ${openLabels}.`,
      action: "Complete os campos que faltam na aba Medir.",
      outcome: "Assim que o dia estiver completo, o score e o plano passam a refletir o estado real da água.",
    });
  }

  CORE_PARAMS.forEach((key) => {
    const value = lastReading[key];
    const status = paramStatus(key, value);
    if (status !== "bad" && status !== "warn") return;
    const spec = (SPECIALIST_PLAN[key] || {})[status];
    if (!spec) return;
    // Para amônia, "input" mostra os dois números — o que o kit leu pela cor
    // (TAN) e o que isso significa de fato (tóxico), com o pH/temperatura
    // que geraram a conversão — sem isso o item parece falar de outro
    // parâmetro (o valor tóxico costuma ser bem menor que o total do kit).
    const input = (key === "nh3" && lastReading.nh3Total !== undefined)
      ? `TAN ${lastReading.nh3Total} ppm no teste → tóxico ${Number(value).toFixed(3)} ppm (pH ${lastReading.ph}, ${lastReading.temp}°C)`
      : `${value} ${TREND_UNITS[key] || ""}`.trim();
    items.push({
      key, level: status, label: PARAM_LABELS[key],
      input,
      output: spec.diagnostico,
      action: spec.acao,
      outcome: spec.resultado,
    });
  });

  const turbStatus = paramStatus("turbidez", lastReading.turbidez);
  if (turbStatus === "bad") {
    const spec = SPECIALIST_PLAN.turbidez.bad;
    items.push({
      key: "turbidez", level: "bad", label: "Turbidez",
      input: "água turva", output: spec.diagnostico, action: spec.acao, outcome: spec.resultado,
    });
  }

  // Ordem de urgência: mesma regra do assessWater — amônia/nitrito primeiro
  // entre os igualmente ruins, porque a ação deles (TPA) é mais urgente.
  items.sort((a, b) =>
    (SEVERITY_RANK[b.level] - SEVERITY_RANK[a.level]) ||
    ((TOXIC_PARAMS.indexOf(b.key) >= 0) - (TOXIC_PARAMS.indexOf(a.key) >= 0))
  );

  items.push(gates.ready ? {
    key: "gate", level: "good", label: "Introdução do Green Terror",
    input: `água clara ${gates.clearStreak}/${gates.clearTarget} dias · biologia zerada ${gates.bioStreak}/${gates.bioTarget} dias`,
    output: "Critérios de estabilidade atendidos.",
    action: "Pode introduzir o Green Terror.",
    outcome: "Ambiente pronto — mantenha a rotina de medição também depois da introdução.",
  } : {
    key: "gate", level: "warn", label: "Introdução do Green Terror",
    input: `água clara ${gates.clearStreak}/${gates.clearTarget} dias · biologia zerada ${gates.bioStreak}/${gates.bioTarget} dias`,
    output: `Ainda ${gates.gargalo || "sem leituras suficientes para calcular o progresso"}.`,
    action: "Continue a rotina diária de medição sem interrupção — um dia sem medir zera a contagem dos dois gates.",
    outcome: "Ao completar os dias que faltam, o ambiente libera a introdução.",
  });

  if (items.length === 1 && openKeys.length === 0) {
    items.unshift({
      key: null, level: "good", label: "Todos os parâmetros",
      input: "6 de 6 parâmetros na faixa ideal",
      output: "Nenhum parâmetro fora da faixa hoje.",
      action: "Manter a rotina atual de medição e manutenção.",
      outcome: "Sem mudanças esperadas; continue monitorando diariamente.",
    });
  }

  return items;
}

/**
 * Calcula a TPA pelo fator mais restritivo entre os três parâmetros que se
 * resolvem por diluição (amônia tóxica, nitrito, nitrato). Espera receber
 * uma leitura já processada por deriveEffectiveReading — "nh3" aqui precisa
 * ser a fração TÓXICA (NH₃), não o total lido no teste (TAN), porque é o
 * número que decide se o peixe sobrevive.
 *
 * Diluir a água reduz o TOTAL de amônia proporcionalmente; como a fração
 * tóxica é uma % fixa do total para um dado pH/temperatura, o percentual de
 * TPA calculado sobre o valor tóxico vale igualmente para o total — a conta
 * não muda dependendo de qual dos dois números você usa como base.
 */
export function calculateTPA(reading) {
  if (!reading) return null;

  const factors = {};

  if (reading.nh3 !== null && reading.nh3 !== undefined && reading.nh3 !== "") {
    const current = Number(reading.nh3);
    const target = RANGES.nh3.goodMax; // 0.02 ppm tóxico
    if (current > target) {
      factors.nh3 = {
        key: "nh3", current, target,
        percentage: ((current - target) / current) * 100,
        priority: "critical",
        label: PARAM_LABELS.nh3,
      };
    }
  }

  if (reading.no2 !== null && reading.no2 !== undefined && reading.no2 !== "") {
    const current = Number(reading.no2);
    const target = RANGES.no2.goodMax; // 0.02
    if (current > target) {
      factors.no2 = {
        key: "no2", current, target,
        percentage: ((current - target) / current) * 100,
        priority: "critical",
        label: PARAM_LABELS.no2,
      };
    }
  }

  if (reading.no3 !== null && reading.no3 !== undefined && reading.no3 !== "") {
    const current = Number(reading.no3);
    const target = RANGES.no3.goodMax; // 20
    if (current > target) {
      factors.no3 = {
        key: "no3", current, target,
        percentage: ((current - target) / current) * 100,
        priority: "normal",
        label: PARAM_LABELS.no3,
      };
    }
  }

  const needed = Object.values(factors);

  // TAN alto mas hoje inofensivo (pH baixo segura a toxicidade): não é uma
  // TPA de emergência, mas é o tipo de coisa que um TPA "não precisa fazer
  // nada" esconderia — o risco não sumiu, só está represado pelo pH atual.
  const hasAmmoniaWatch = reading.nh3Total !== undefined && reading.nh3Total !== null
    && Number(reading.nh3Total) >= 0.25 && !factors.nh3;
  const ammoniaWatchNote = hasAmmoniaWatch
    ? ` Amônia total (TAN) em ${Number(reading.nh3Total).toFixed(2)} ppm — hoje inofensiva a este pH, mas a fração tóxica cresce rápido se o pH subir. Sem TPA por causa disso agora; remeça se o pH mudar.`
    : "";

  if (needed.length === 0) {
    if (hasAmmoniaWatch) {
      return {
        tpaPercentage: 0,
        urgency: "info",
        recommendation: `Nenhuma TPA de emergência necessária.${ammoniaWatchNote}`,
        limitingFactor: null,
        allFactors: [],
        ammoniaWatch: true,
      };
    }
    return null;
  }

  needed.sort((a, b) => {
    if (a.priority === "critical" && b.priority !== "critical") return -1;
    if (b.priority === "critical" && a.priority !== "critical") return 1;
    return b.percentage - a.percentage;
  });

  const limiting = needed[0];
  const tpaPercentage = Math.ceil(limiting.percentage);

  let urgency = "normal";
  let recommendation = "";
  if (limiting.priority === "critical") {
    if (tpaPercentage >= 90) {
      urgency = "critical";
      recommendation = `TPA urgente: troque 90%+ da água AGORA. Reteste em 12–24h — se ainda estiver acima de ${limiting.target} ppm, repita a TPA. Verifique a filtragem biológica antes de recolocar o peixe.`;
    } else if (tpaPercentage >= 75) {
      urgency = "critical";
      recommendation = `TPA grande: troque 75%+ da água hoje. Reteste amanhã e repita se ainda estiver acima do alvo.`;
    } else {
      urgency = "warning";
      recommendation = `TPA: troque ${tpaPercentage}%+ da água hoje.`;
    }
  } else {
    if (tpaPercentage >= 50) {
      urgency = "warning";
      recommendation = `TPA planejada: troque ${tpaPercentage}% da água nos próximos dias.`;
    } else {
      urgency = "info";
      recommendation = `TPA de manutenção: ${tpaPercentage}% nos próximos 7 dias.`;
    }
  }

  return {
    tpaPercentage,
    urgency,
    recommendation: recommendation + (limiting.key !== "nh3" ? ammoniaWatchNote : ""),
    limitingFactor: limiting,
    allFactors: needed,
    ammoniaWatch: hasAmmoniaWatch,
  };
}
