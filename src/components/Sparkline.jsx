import Box from "@mui/material/Box";
import { useAq, toneColor } from "./ui.jsx";

/**
 * Sparkline em SVG puro.
 *
 * Existe para não carregar @mui/x-charts só por causa de seis linhas de
 * tendência: a biblioteca inteira custava ~350 kB do bundle (929 kB → 577 kB
 * depois de sair), o que num celular em pé na frente do aquário é meio segundo
 * de tela branca para desenhar um traço de 40 px.
 *
 * Marca o último ponto de propósito: numa série de tendência o valor de hoje é
 * o que decide a ação, e sem ênfase ele se perde no meio da linha.
 */
export default function Sparkline({ data, tone = "none", width = 72, height = 26, band }) {
  const aq = useAq();
  if (!data || data.length === 0) return <Box sx={{ width, height }} />;

  const color = toneColor(aq, tone);
  const pad = 3;
  const w = width - pad * 2;
  const h = height - pad * 2;

  // A escala inclui a faixa ideal quando ela existe: uma série que oscila
  // 0,01 ppm dentro do seguro não deve desenhar picos dramáticos por estar
  // normalizada só pelo próprio mínimo e máximo.
  const values = data.slice();
  const lo = Math.min(...values, band ? band[0] : Infinity);
  const hi = Math.max(...values, band ? band[1] : -Infinity);
  const span = hi - lo || 1;

  const x = (i) => pad + (values.length === 1 ? w / 2 : (i / (values.length - 1)) * w);
  const y = (v) => pad + h - ((v - lo) / span) * h;

  const linha = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${linha} L${x(values.length - 1).toFixed(1)},${(pad + h).toFixed(1)} L${x(0).toFixed(1)},${(pad + h).toFixed(1)} Z`;
  const ultimo = values.length - 1;

  return (
    <Box component="svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" sx={{ display: "block" }}>
      {band && (
        <rect
          x={0} y={y(band[1])} width={width} height={Math.max(1, y(band[0]) - y(band[1]))}
          fill={aq.ok} opacity={0.09}
        />
      )}
      {values.length > 1 && <path d={area} fill={color} opacity={0.13} />}
      <path d={linha} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(ultimo)} cy={y(values[ultimo])} r={2.4} fill={color} />
    </Box>
  );
}
