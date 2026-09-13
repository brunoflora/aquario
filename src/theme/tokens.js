// Tokens de design do painel — v2.
//
// A identidade vem do assunto, revisada para maior precisão: água preta
// amazônica de verdade não é esverdeada — é a cor de chá forte, quase café,
// pelo ácido húmico e tanino dissolvidos (rio Negro, rio Urubu). O escuro é
// quente (marrom-avermelhado), não frio. O claro inverte a lógica de
// propósito: em vez de repetir o mesmo bege quente nos dois temas (o "modo
// claro" mais óbvio que existe), vai para um branco-esverdeado frio e clínico
// — a bancada de laboratório sob luz de dia, não a mesma água à meia-luz.
//
// REGRA CENTRAL DA PALETA, preservada: cor saturada significa ESTADO DA ÁGUA,
// e nada mais. Não existe cor de marca competindo com a tríade semântica —
// botões, links e abas usam contraste de tinta, não matiz.

export const PALETTE = {
  dark: {
    ground: "#0C0805",
    surface: "#17100A",
    surfaceRaised: "#211709",
    line: "#2F2415",
    lineStrong: "#493822",
    ink: "#F5E9D8",
    inkDim: "#B39D7C",
    // 4,8:1 sobre surface / 5,1:1 sobre ground — ambos acima do mínimo AA de
    // 4,5:1. Este token carrega texto pequeno: faixas ideais, unidades,
    // deltas de tendência e rótulos da navegação inferior.
    inkFaint: "#957D5F",
    ok: "#4FA66B",
    warn: "#D9922E",
    crit: "#E2554A",
    okWash: "rgba(79,166,107,.14)",
    warnWash: "rgba(217,146,46,.14)",
    critWash: "rgba(226,85,74,.16)",
  },
  light: {
    ground: "#F4F6F5",
    surface: "#FFFFFF",
    surfaceRaised: "#FFFFFF",
    line: "#E1E6E2",
    lineStrong: "#C7D0C9",
    ink: "#14110D",
    inkDim: "#5C5346",
    inkFaint: "#6E6354", // 5,4:1 sobre ground / 5,9:1 sobre branco
    ok: "#1E7A46",
    warn: "#9C6314",
    crit: "#B23A32",
    okWash: "rgba(30,122,70,.10)",
    warnWash: "rgba(156,99,20,.10)",
    critWash: "rgba(178,58,50,.10)",
  },
};

// Instrument Sans para prosa — grotesca humanista com caráter próprio, sem
// cair no Inter/Space Grotesk padrão de qualquer produto gerado por IA.
// JetBrains Mono para MEDIDAS — desenhada para leitura técnica de números,
// algarismos tabulares nativos, o mesmo peso visual que qualquer painel de
// instrumento real usa hoje. A separação é semântica: o que sai de um
// teste de água é lido como leitura de instrumento, não como prosa.
export const FONT_UI = '"Instrument Sans", "Helvetica Neue", Helvetica, Arial, sans-serif';
export const FONT_DATA = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

// WCAG 2.5.5 — o contexto de uso é o pior possível para precisão de toque:
// em pé na frente do aquário, uma mão no celular, a outra no frasco de teste.
export const TOUCH_TARGET = 44;

export const STATUS_TOKEN = { good: "ok", warn: "warn", bad: "crit" };

export function statusColor(palette, status) {
  const key = STATUS_TOKEN[status];
  return key ? palette[key] : palette.inkFaint;
}

export function statusWash(palette, status) {
  const key = STATUS_TOKEN[status];
  return key ? palette[`${key}Wash`] : "transparent";
}
