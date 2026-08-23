// Tokens de design do painel.
//
// A identidade vem do assunto: um trecho de rio amazônico de água preta. O
// preto do fundo não é neutro — puxa verde e quente, como água tingida de
// tanino vista contra o vidro. Os cinzas também são enviesados para verde, de
// propósito: cinza puro (#888) é o cinza de quem não escolheu.
//
// REGRA CENTRAL DA PALETA: cor saturada significa ESTADO DA ÁGUA, e nada mais.
// Não existe cor de marca competindo com a tríade semântica — botões, links e
// abas usam contraste de tinta, não matiz. Num instrumento de monitoramento,
// qualquer cor que não seja status é ruído que disputa atenção com o alarme.

export const PALETTE = {
  dark: {
    ground: "#090C0B",
    surface: "#111917",
    surfaceRaised: "#18211E",
    line: "#24302B",
    lineStrong: "#33423B",
    ink: "#E9F1EC",
    inkDim: "#8DA096",
    // 5,5:1 sobre surface. O valor anterior (#5E6F67) rendia 3,1:1 — abaixo do
    // mínimo de 4,5:1 da WCAG AA para texto pequeno, e este token carrega
    // justamente o texto pequeno: faixas ideais, unidades, deltas de tendência
    // e os rótulos da navegação inferior.
    inkFaint: "#7A8C83",
    ok: "#35B87A",
    warn: "#D99A2B",
    crit: "#E04B4F",
    okWash: "rgba(53,184,122,.13)",
    warnWash: "rgba(217,154,43,.13)",
    critWash: "rgba(224,75,79,.15)",
  },
  light: {
    ground: "#F4F7F5",
    surface: "#FFFFFF",
    surfaceRaised: "#FFFFFF",
    line: "#DDE5E0",
    lineStrong: "#C3D0C8",
    ink: "#0E1613",
    inkDim: "#5A6B63",
    inkFaint: "#667469", // 4,9:1 sobre branco; o anterior (#87978E) dava 3,1:1
    ok: "#17804C",
    warn: "#94640C",
    crit: "#BC2F33",
    okWash: "rgba(23,128,76,.10)",
    warnWash: "rgba(148,100,12,.10)",
    critWash: "rgba(188,47,51,.10)",
  },
};

// Prosa numa grotesca com caráter; MEDIDAS em mono. A separação é semântica,
// não decorativa: o que sai de um instrumento de teste é lido como leitura de
// instrumento, com algarismos tabulares que alinham em coluna.
export const FONT_UI = '"Archivo", "Helvetica Neue", Helvetica, Arial, sans-serif';
export const FONT_DATA = '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

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
