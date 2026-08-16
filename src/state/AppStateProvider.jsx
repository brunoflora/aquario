import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { STORAGE_KEYS, loadJSON, saveJSON, storageAvailable } from "./storage.js";
import { emitPersist } from "./persistBus.js";
import { DEFAULT_PHASES } from "../domain/phases.js";
import { DEFAULT_CONFIG } from "../domain/config.js";
import { migrateStructTasks } from "../domain/tasks.js";
import { sortedReadings } from "../domain/water.js";
import { randomUUID } from "../utils/uuid.js";

const AppStateContext = createContext(null);

function initialState() {
  return {
    readings: loadJSON(STORAGE_KEYS.readings, []),
    phases: loadJSON(STORAGE_KEYS.phases, DEFAULT_PHASES),
    criteria: loadJSON(STORAGE_KEYS.criteria, []),
    config: loadJSON(STORAGE_KEYS.config, DEFAULT_CONFIG),
    structTasks: migrateStructTasks(loadJSON(STORAGE_KEYS.structTasks, null)),
  };
}

// NOTA: os updaters passados a setState() aqui são sempre puros (sem
// setJSON/emitPersist dentro deles) de propósito — o <React.StrictMode> em
// main.jsx invoca updaters em dobro em desenvolvimento pra flagar efeitos
// colaterais impuros, e persistir duas vezes por ação criaria writes e
// pushes pra nuvem duplicados. Os efeitos colaterais (persist) sempre rodam
// no corpo da função externa, usando o valor já calculado em JS puro.

export function AppStateProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [saveIndicator, setSaveIndicator] = useState(() => {
    if (!storageAvailable) return "aviso: armazenamento local indisponível — dados só duram esta sessão";
    const sorted = sortedReadings(state.readings);
    if (!sorted.length) return "aguardando primeiro registro";
    const mostRecent = sorted[sorted.length - 1];
    return `carregado — último registro em ${mostRecent.date.split("-").reverse().join("/")}`;
  });
  const [snackbar, setSnackbar] = useState(null); // { message, variant, actionLabel, onAction }
  const snackTimerRef = useRef(null);
  const configSaveTimerRef = useRef(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const persist = useCallback((key, value) => {
    saveJSON(STORAGE_KEYS[key], value);
    emitPersist(key);
  }, []);

  const dismissSnackbar = useCallback(() => {
    clearTimeout(snackTimerRef.current);
    setSnackbar(null);
  }, []);

  const showSnackbar = useCallback((message, options = {}) => {
    clearTimeout(snackTimerRef.current);
    const isError = options.variant === "error";
    setSnackbar({ message, variant: isError ? "error" : "default", actionLabel: options.actionLabel, onAction: options.onAction });
    // undo precisa de tempo de leitura e reação; erro fica até ser lido
    snackTimerRef.current = setTimeout(dismissSnackbar, isError ? 12000 : options.onAction ? 10000 : 5000);
  }, [dismissSnackbar]);

  const snapshot = useCallback(() => JSON.parse(JSON.stringify(stateRef.current)), []);

  const persistAll = useCallback((s) => {
    persist("readings", s.readings);
    persist("phases", s.phases);
    persist("criteria", s.criteria);
    persist("config", s.config);
    persist("structTasks", s.structTasks);
  }, [persist]);

  const restore = useCallback((snap) => {
    setState(snap);
    persistAll(snap);
  }, [persistAll]);

  // Aplica uma mutação de forma reversível: sem diálogo de confirmação,
  // com desfazer disponível via snackbar (mesmo padrão do vanilla original).
  // `mutate` é puro (prev -> next); a persistência roda depois, fora do updater.
  const doUndoable = useCallback((message, mutate) => {
    const prev = stateRef.current;
    const snap = snapshot();
    const next = mutate(prev);
    setState(next);
    Object.keys(next).forEach((key) => {
      if (next[key] !== prev[key]) persist(key, next[key]);
    });
    showSnackbar(message, {
      actionLabel: "Desfazer",
      onAction: () => { restore(snap); showSnackbar("Ação desfeita."); },
    });
  }, [snapshot, persist, showSnackbar, restore]);

  // ---------- readings ----------

  const upsertReading = useCallback((reading) => {
    const prev = stateRef.current;
    const idx = prev.readings.findIndex((r) => r.date === reading.date);
    const readings = idx >= 0
      ? prev.readings.map((r, i) => (i === idx ? reading : r))
      : [...prev.readings, reading];
    setState({ ...prev, readings });
    persist("readings", readings);
    setSaveIndicator(`salvo automaticamente às ${new Date().toLocaleTimeString("pt-BR")}`);
  }, [persist]);

  const deleteReading = useCallback((date) => {
    const label = date.split("-").reverse().join("/");
    doUndoable(`Registro de ${label} excluído.`, (prev) => ({
      ...prev,
      readings: prev.readings.filter((r) => r.date !== date),
    }));
    setSaveIndicator(`registro de ${label} excluído`);
  }, [doUndoable]);

  // ---------- phases ----------

  const updatePhase = useCallback((id, patch) => {
    const prev = stateRef.current;
    const phases = prev.phases.map((p) => (p.id === id ? { ...p, ...patch } : p));
    setState({ ...prev, phases });
    persist("phases", phases);
  }, [persist]);

  // ---------- criteria ----------

  const addCriteria = useCallback((label) => {
    const prev = stateRef.current;
    const criteria = [...prev.criteria, { label, checked: false }];
    setState({ ...prev, criteria });
    persist("criteria", criteria);
  }, [persist]);

  const toggleCriteria = useCallback((idx, checked) => {
    const prev = stateRef.current;
    const criteria = prev.criteria.map((c, i) => (i === idx ? { ...c, checked } : c));
    setState({ ...prev, criteria });
    persist("criteria", criteria);
  }, [persist]);

  const removeCriteria = useCallback((idx) => {
    const removed = stateRef.current.criteria[idx];
    if (!removed) return;
    doUndoable(`Critério "${removed.label}" removido.`, (prev) => ({
      ...prev,
      criteria: prev.criteria.filter((_, i) => i !== idx),
    }));
  }, [doUndoable]);

  // ---------- struct tasks (checklist) ----------

  const addStructTask = useCallback((label) => {
    const prev = stateRef.current;
    const structTasks = [...prev.structTasks, { id: `custom-${label}`, group: "acao", priority: "baixa", label, checked: false, custom: true }];
    setState({ ...prev, structTasks });
    persist("structTasks", structTasks);
  }, [persist]);

  const toggleStructTask = useCallback((idx, checked) => {
    const prev = stateRef.current;
    const structTasks = prev.structTasks.map((t, i) => (i === idx ? { ...t, checked } : t));
    setState({ ...prev, structTasks });
    persist("structTasks", structTasks);
  }, [persist]);

  const removeStructTask = useCallback((idx) => {
    const removed = stateRef.current.structTasks[idx];
    if (!removed) return;
    doUndoable(`Ação "${removed.label}" removida.`, (prev) => ({
      ...prev,
      structTasks: prev.structTasks.filter((_, i) => i !== idx),
    }));
  }, [doUndoable]);

  // usado só pelo módulo de nuvem, antes de empurrar critérios: garante que
  // todo critério tem um id estável (na criação local eles não têm, igual ao
  // vanilla — o id só é preenchido lazy, no momento do push)
  const ensureCriteriaIds = useCallback(() => {
    const prev = stateRef.current;
    let changed = false;
    const criteria = prev.criteria.map((c) => {
      if (c.id) return c;
      changed = true;
      return { ...c, id: randomUUID() };
    });
    if (changed) {
      setState({ ...prev, criteria });
      persist("criteria", criteria);
    }
    return criteria;
  }, [persist]);

  // ---------- config (ficha técnica, autosave debounced 300ms) ----------

  const updateConfig = useCallback((patch) => {
    const prev = stateRef.current;
    const config = { ...prev.config, ...patch };
    setState({ ...prev, config });
    clearTimeout(configSaveTimerRef.current);
    configSaveTimerRef.current = setTimeout(() => {
      persist("config", stateRef.current.config);
      setSaveIndicator(`configuração salva automaticamente às ${new Date().toLocaleTimeString("pt-BR")}`);
    }, 300);
  }, [persist]);

  const flushConfigSave = useCallback(() => {
    clearTimeout(configSaveTimerRef.current);
    persist("config", stateRef.current.config);
  }, [persist]);

  // ---------- export / import ----------

  const exportPayload = useCallback(() => {
    flushConfigSave();
    const s = stateRef.current;
    return { exportedAt: new Date().toISOString(), readings: s.readings, phases: s.phases, criteria: s.criteria, config: s.config, structTasks: s.structTasks };
  }, [flushConfigSave]);

  const importData = useCallback((data, summary) => {
    doUndoable(`Backup importado: ${summary}.`, (prev) => ({
      readings: data.readings,
      phases: Array.isArray(data.phases) ? data.phases : prev.phases,
      criteria: Array.isArray(data.criteria) ? data.criteria : prev.criteria,
      config: data.config && typeof data.config === "object" ? data.config : prev.config,
      structTasks: Array.isArray(data.structTasks) ? migrateStructTasks(data.structTasks) : prev.structTasks,
    }));
    setSaveIndicator("dados importados com sucesso");
  }, [doUndoable]);

  // usado pelo módulo de nuvem para adotar dados remotos (mesma função no
  // vanilla, cloudAdoptRemote, também passava pelo doUndoable)
  const adoptRemote = useCallback((remote, message) => {
    doUndoable(message, (prev) => ({
      readings: remote.readings,
      phases: remote.phases,
      criteria: remote.criteria,
      config: remote.config || prev.config,
      structTasks: remote.structTasks && remote.structTasks.length ? remote.structTasks : prev.structTasks,
    }));
  }, [doUndoable]);

  const value = useMemo(() => ({
    state,
    storageAvailable,
    saveIndicator,
    snackbar,
    showSnackbar,
    dismissSnackbar,
    upsertReading,
    deleteReading,
    updatePhase,
    addCriteria,
    toggleCriteria,
    removeCriteria,
    addStructTask,
    toggleStructTask,
    removeStructTask,
    updateConfig,
    flushConfigSave,
    exportPayload,
    importData,
    adoptRemote,
    ensureCriteriaIds,
  }), [state, saveIndicator, snackbar, showSnackbar, dismissSnackbar, upsertReading, deleteReading, updatePhase,
      addCriteria, toggleCriteria, removeCriteria, addStructTask, toggleStructTask, removeStructTask,
      updateConfig, flushConfigSave, exportPayload, importData, adoptRemote, ensureCriteriaIds]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState precisa estar dentro de <AppStateProvider>");
  return ctx;
}
