import { CONFIG_FIELDS, CONFIG_SPEC } from "../domain/config.js";

function numOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return isFinite(n) ? n : null;
}

const CONFIG_NUMERIC_FIELDS = {};
CONFIG_SPEC.forEach((g) => {
  g.fields.forEach((f) => { if (f.type === "number") CONFIG_NUMERIC_FIELDS[f.id] = true; });
});

export function configToRow(config) {
  const row = { id: true };
  CONFIG_FIELDS.forEach((key) => {
    const col = key.replace(/-/g, "_");
    const v = config[key];
    row[col] = CONFIG_NUMERIC_FIELDS[key] ? numOrNull(v) : (v === "" || v === undefined ? null : v);
  });
  return row;
}

export function configFromRow(row) {
  const config = {};
  CONFIG_FIELDS.forEach((key) => {
    const col = key.replace(/-/g, "_");
    const v = row[col];
    config[key] = v === null || v === undefined ? "" : String(v);
  });
  return config;
}

// Descreve cada tabela local <-> Postgres. Sem getLocal/setLocal fechados
// sobre um `state` global (como no vanilla) — o hook useCloudSync injeta os
// dados locais explicitamente a cada chamada, o que mantém isto testável
// sem precisar de React.
export const CLOUD_TABLES = {
  readings: {
    table: "readings", conflictCol: "date",
    idOf: (row) => row.date,
    toRow: (r) => ({
      date: r.date, temp: numOrNull(r.temp), ph: numOrNull(r.ph), kh: numOrNull(r.kh),
      nh3: numOrNull(r.nh3), no2: numOrNull(r.no2), no3: numOrNull(r.no3),
      turbidez: !!r.turbidez, notes: r.notes || null,
    }),
    fromRow: (row) => ({
      date: row.date, temp: row.temp, ph: row.ph, kh: row.kh, nh3: row.nh3, no2: row.no2, no3: row.no3,
      turbidez: !!row.turbidez, notes: row.notes || "",
    }),
  },
  phases: {
    table: "phase_data", conflictCol: "id", noDelete: true,
    idOf: (row) => row.id,
    toRow: (p) => ({ id: p.id, label: p.label, status: p.status, notes: p.notes || null }),
    fromRow: (row) => row, // tratado via reconcilePhases, não linha a linha
  },
  criteria: {
    table: "gate_criteria", conflictCol: "id",
    idOf: (row) => row.id,
    toRow: (c) => ({ id: c.id, label: c.label, checked: !!c.checked }),
    fromRow: (row) => ({ id: row.id, label: row.label, checked: !!row.checked }),
  },
  structTasks: {
    table: "struct_tasks", conflictCol: "id",
    idOf: (row) => row.id,
    toRow: (t) => ({
      id: t.id, task_group: t.group || "acao", priority: t.priority || "baixa", label: t.label,
      impact: t.impact || null, cost: t.cost || null, cost_value: t.costValue || 0,
      custom: !!t.custom, checked: !!t.checked,
    }),
    fromRow: (row) => ({
      id: row.id, group: row.task_group, priority: row.priority, label: row.label,
      impact: row.impact || "", cost: row.cost || "", costValue: row.cost_value || 0,
      custom: !!row.custom, checked: !!row.checked,
    }),
  },
  config: {
    table: "tank_config", conflictCol: "id", single: true,
    toRow: configToRow,
    fromRow: configFromRow,
  },
};
