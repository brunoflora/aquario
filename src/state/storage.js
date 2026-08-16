// localStorage com fallback em memória — porte fiel do vanilla original,
// incluindo as MESMAS chaves (usuários que já tinham dados salvos no
// navegador continuam funcionando depois da migração).

export const STORAGE_KEYS = {
  readings: "aq_readings_v1",
  phases: "aq_phases_v1",
  criteria: "aq_criteria_v1",
  config: "aq_config_v1",
  structTasks: "aq_struct_tasks_v1",
};

const memoryFallback = {};

export let storageAvailable = true;
try {
  const t = "__aq_test__";
  window.localStorage.setItem(t, "1");
  window.localStorage.removeItem(t);
} catch (e) {
  storageAvailable = false;
}

export function loadJSON(key, fallback) {
  try {
    if (!storageAvailable) return memoryFallback[key] !== undefined ? memoryFallback[key] : fallback;
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function saveJSON(key, value) {
  try {
    if (!storageAvailable) { memoryFallback[key] = value; return; }
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    memoryFallback[key] = value;
  }
}
