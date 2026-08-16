export const DEFAULT_PHASES = [
  { id: "ciclagem", label: "Montagem e ciclagem do aquário", status: "pendente", notes: "" },
  { id: "plantio", label: "Plantio e decoração", status: "pendente", notes: "" },
  { id: "quarentena", label: "Quarentena dos ciclídeos nacionais", status: "pendente", notes: "" },
  { id: "estabilizacao", label: "Estabilização biológica (gates de água)", status: "pendente", notes: "" },
  { id: "green_terror", label: "Introdução do Green Terror", status: "pendente", notes: "" },
  { id: "casais", label: "Formação de casais", status: "pendente", notes: "" },
  { id: "venda", label: "Monitoramento e venda de excedentes", status: "pendente", notes: "" },
];

export const PHASE_STATUSES = ["pendente", "em andamento", "concluído"];

export function reconcilePhases(remoteRows) {
  const byId = {};
  (remoteRows || []).forEach((r) => { byId[r.id] = r; });
  return DEFAULT_PHASES.map((def) => {
    const r = byId[def.id];
    return r ? { id: def.id, label: def.label, status: r.status || "pendente", notes: r.notes || "" } : def;
  });
}
