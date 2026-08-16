export const DEFAULT_STRUCT_TASKS = [
  { id: "anti-sifao", group: "acao", priority: "critica", cost: "R$ 0", costValue: 0,
    label: "Furar o tubo de recalque — anti-sifão de 3–4 mm",
    impact: "Sem ele, uma queda de energia põe ~22 L no chão. Custo zero, cinco minutos, maior impacto da lista." },
  { id: "kh-bicarbonato", group: "acao", priority: "critica", cost: "R$ 15", costValue: 15,
    label: "Subir o KH de 0 para 3 dKH com bicarbonato",
    impact: "61 g em três doses (dias 1, 3 e 5). Sem tampão o pH despenca e a nitrificação para com os peixes dentro." },
  { id: "descida-registro", group: "acao", priority: "critica", cost: "R$ 60", costValue: 60,
    label: "Medir a descida e pôr registro no recalque se Ø < 50 mm",
    impact: "A bomba não pode empurrar mais do que o dreno escoa. Hoje só não transborda por folga acidental." },
  { id: "aquecimento", group: "acao", priority: "alta", cost: "R$ 400", costValue: 400,
    label: "Instalar 2 × 300 W + termostato externo, subindo 0,5 °C/dia",
    impact: "Fecha o déficit de 3 °C com redundância. Um único 1.000 W travado ligado cozinha 682 L." },
  { id: "pangasius", group: "acao", priority: "alta", cost: "—", costValue: 0,
    label: "Planejar a realocação do Pangasius (6–12 meses)",
    impact: "Remove 90% da carga orgânica futura e o risco de vidro trincado por peixe em pânico." },
  { id: "midia-bio", group: "acao", priority: "media", cost: "R$ 250", costValue: 250,
    label: "Expandir a mídia biológica para 12–18 L",
    impact: "A C2 comporta 8,5 L. Cesto suspenso na C1 resolve sem obra, antes de o Oscar dobrar de tamanho." },
  { id: "vidro", group: "acao", priority: "media", cost: "—", costValue: 0,
    label: "Confirmar espessura do vidro e existência de travessas",
    impact: "200 × 70 cm em 15 mm sem contraventamento trabalha no limite. Observe abaulamento central." },
  { id: "laje", group: "acao", priority: "media", cost: "—", costValue: 0,
    label: "Avaliar o posicionamento sobre a laje",
    impact: "951 kg/m² em prédio de orla pede parede estrutural e eixo perpendicular ao vão." },
  { id: "rochas", group: "acao", priority: "baixa", cost: "R$ 150", costValue: 150,
    label: "Erguer 2–3 colunas de rocha para quebrar a linha de visão",
    impact: "Cria três territórios e um sítio de desova sem abrir mão da estética de galeria." },
  { id: "fotoperiodo", group: "acao", priority: "baixa", cost: "R$ 50", costValue: 50,
    label: "Fotoperíodo fixo de 8 h no timer",
    impact: "Estabiliza o ritmo circadiano dos ciclídeos e tira das algas a luz extra." },
  { id: "perlon", group: "acao", priority: "baixa", cost: "—", costValue: 0,
    label: "Reduzir a troca de perlon para 10–14 dias",
    impact: "Passou disso, a manta deixa de remover sólidos e vira fonte de nitrato." },

  { id: "med-descida", group: "medicao", priority: "medicao",
    label: "Diâmetro interno da descida (mm)",
    impact: "Define o teto real de vazão de todo o sistema." },
  { id: "med-vidro", group: "medicao", priority: "medicao",
    label: "Espessura do vidro do display (mm) e travessas",
    impact: "Fecha a verificação estrutural do painel frontal." },
  { id: "med-lamina", group: "medicao", priority: "medicao",
    label: "Altura real da lâmina d'água no display (cm)",
    impact: "Corrige o volume líquido — e com ele toda dosagem." },
  { id: "med-sump", group: "medicao", priority: "medicao",
    label: "Nível real de operação no sump (cm)",
    impact: "Define a folga anti-transbordo verdadeira." },
  { id: "med-desnivel", group: "medicao", priority: "medicao",
    label: "Desnível entre o sump e o bocal de retorno (m)",
    impact: "Corrige a altura manométrica e a vazão real da bomba." },
  { id: "med-blackout", group: "medicao", priority: "medicao",
    label: "Teste de queda de energia — onde o nível estabiliza",
    impact: "Único jeito de validar os cálculos de cheia do capítulo 4." },
];

// rótulos da versão anterior, para não perder o que já foi marcado
export const LEGACY_TASK_IDS = {
  "Furar tubo de recalque (furo anti-sifão 3–4mm abaixo da linha d'água)": "anti-sifao",
  "Corrigir KH de 0 para 3 dKH com bicarbonato (protocolo de 7 dias)": "kh-bicarbonato",
  "Medir diâmetro da descida e instalar registro de esfera no recalque se < 50mm": "descida-registro",
  "Instalar 2× 300W + termostato externo, subindo 0,5°C/dia": "aquecimento",
  "Planejar realocação do Pangasius (6–12 meses)": "pangasius",
  "Expandir mídia biológica da C2 para 12–18L": "midia-bio",
  "Confirmar espessura de vidro e existência de travessas": "vidro",
  "Avaliar posicionamento sobre a laje (parede estrutural)": "laje",
  "Adicionar 2–3 colunas de rocha para quebra de linha de visão": "rochas",
  "Fotoperíodo fixo de 8h com timer": "fotoperiodo",
  "Reduzir troca de perlon para 10–14 dias": "perlon",
};

export const PRIORITY_GROUPS = [
  { key: "critica", label: "Críticas", intro: "Risco de inundação, colapso de pH ou transbordo. Nenhuma delas depende de orçamento." },
  { key: "alta", label: "Altas", intro: "Não são emergência hoje, mas definem se o sistema aguenta os peixes adultos." },
  { key: "media", label: "Médias", intro: "Preparo e verificação — o que evita ter de desmontar depois." },
  { key: "baixa", label: "Baixas", intro: "Refino de bem-estar e rotina. Baratas, e o peixe percebe." },
];

// cores por prioridade usando as cores do tema MUI (error/warning/info/default)
// em vez de tokens customizados — mapeadas na UI, não aqui.
export const PRIORITY_META = {
  critica: { label: "Crítica", chipColor: "error" },
  alta: { label: "Alta", chipColor: "warning" },
  media: { label: "Média", chipColor: "info" },
  baixa: { label: "Baixa", chipColor: "default" },
  medicao: { label: "Medição", chipColor: "default" },
};

export function migrateStructTasks(stored) {
  const checkedById = {};
  const customs = [];
  if (Array.isArray(stored)) {
    stored.forEach((t) => {
      if (!t || typeof t !== "object" || !t.label) return;
      const id = t.id || LEGACY_TASK_IDS[t.label];
      if (id) { checkedById[id] = !!t.checked; return; }
      customs.push({
        id: t.id || `custom-${t.label}`,
        group: "acao",
        priority: PRIORITY_META[t.priority] ? t.priority : "baixa",
        label: t.label,
        checked: !!t.checked,
        custom: true,
      });
    });
  }
  const merged = DEFAULT_STRUCT_TASKS.map((def) => ({ ...def, checked: checkedById[def.id] === true }));
  return merged.concat(customs);
}
