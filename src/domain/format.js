// Formatação de leituras para exibição.
//
// Casas decimais por parâmetro não são estética: amônia tóxica vive na terceira
// casa (0,015 ppm é emergência, 0,001 não é), enquanto nitrato em ppm inteiro
// já basta. Exibir os dois com a mesma precisão esconde a diferença que importa.
//
// Vírgula decimal, não ponto: o app é pt-BR e o aquarista lê "26,5 °C".

export function paramDigits(key) {
  if (key === "no3") return 0;
  if (key === "nh3") return 3;
  if (key === "no2") return 2;
  return 1;
}

export function formatParam(key, value) {
  if (key === "turbidez") return value ? "turva" : "clara";
  if (value === "" || value === null || value === undefined) return "—";
  const v = Number(value);
  if (!isFinite(v)) return "—";
  // Amônia tóxica abaixo do limite de resolução: "0,000" leria como zero exato,
  // que é uma afirmação mais forte do que o cálculo sustenta.
  if (key === "nh3" && v > 0 && v < 0.001) return "<0,001";
  return v.toFixed(paramDigits(key)).replace(".", ",");
}

/**
 * Aceita o que o teclado brasileiro produz. Num <input type="number">, digitar
 * "26,5" faz o navegador devolver string vazia — o valor some sem aviso e o
 * usuário não entende por quê. Os campos usam type="text" + inputMode="decimal"
 * e normalizam aqui, então vírgula e ponto valem igual.
 */
export function parseDecimal(str) {
  if (str === "" || str === null || str === undefined) return null;
  const n = Number(String(str).replace(",", "."));
  return isFinite(n) ? n : null;
}

/** Faixa ideal para exibição: "6,5–7,6". Vírgula decimal, como o resto do app. */
export function formatBand(band) {
  const n = (v) => String(v).replace(".", ",");
  return `${n(band[0])}–${n(band[1])}`;
}

export function formatNumber(value, digits = 0) {
  if (value === "" || value === null || value === undefined) return "—";
  const v = Number(value);
  if (!isFinite(v)) return "—";
  return v.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function brDate(iso) {
  if (!iso) return "—";
  return iso.split("-").reverse().join("/");
}

export function brDateShort(iso) {
  if (!iso) return "—";
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}
