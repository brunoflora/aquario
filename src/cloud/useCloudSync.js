import { useCallback, useEffect, useRef, useState } from "react";
import { useAppState } from "../state/AppStateProvider.jsx";
import { onPersist } from "../state/persistBus.js";
import { STORAGE_KEYS } from "../state/storage.js";
import { DEFAULT_CONFIG } from "../domain/config.js";
import { CLOUD_TABLES } from "./tables.js";
import { cloudPullAll, cloudPushAll, cloudPushTable } from "./cloudFetch.js";
import {
  clearCloudConfigValues,
  cloudErrorDetail,
  describeCloudError,
  getCloudConfig,
  isArtifactSandbox,
  setCloudConfigValues,
} from "./cloudConfig.js";

const CLOUD_DEBOUNCE_MS = 900;
const CLOUD_RETRY_MS = 15000;

// mapeia a chave de storage disparada pelo persistBus (aq_readings_v1 etc.)
// de volta pra chave lógica da tabela de nuvem (readings, criteria, ...)
const STORAGE_KEY_TO_TABLE = {};
Object.keys(STORAGE_KEYS).forEach((k) => { STORAGE_KEY_TO_TABLE[k] = k; });

function stateSignature(readings, criteria, structTasks, config) {
  const r = readings.map((x) => [x.date, x.temp, x.ph, x.kh, x.nh3, x.no2, x.no3, !!x.turbidez, x.notes || ""].join("|")).sort();
  const c = criteria.map((x) => [x.id || x.label, x.label, !!x.checked].join("|")).sort();
  const t = structTasks.map((x) => [x.id, !!x.checked].join("|")).sort();
  return JSON.stringify({ r, c, t, cfg: config });
}

function localIsEmpty(s) {
  const noChecks = !s.structTasks.some((t) => t.checked);
  const configDefault = Object.keys(DEFAULT_CONFIG).every((k) => String(s.config[k] || "") === String(DEFAULT_CONFIG[k] || ""));
  return s.readings.length === 0 && s.criteria.length === 0 && noChecks && configDefault;
}

function remoteIsEmpty(remote) {
  const noChecks = !remote.structTasks.some((t) => t.checked);
  const configDefault = !remote.config || Object.keys(DEFAULT_CONFIG).every((k) => String(remote.config[k] || "") === String(DEFAULT_CONFIG[k] || ""));
  return remote.readings.length === 0 && remote.criteria.length === 0 && noChecks && configDefault;
}

export function useCloudSync() {
  const { state, adoptRemote, showSnackbar, ensureCriteriaIds } = useAppState();
  const stateRef = useRef(state);
  stateRef.current = state;

  const sandboxed = isArtifactSandbox();
  const [cfg, setCfg] = useState(() => getCloudConfig());
  const [cloudState, setCloudStateValue] = useState(() => (sandboxed ? "blocked" : cfg ? "syncing" : "off"));
  const [cloudDetail, setCloudDetail] = useState("");

  const dirtyRef = useRef({});
  const pushTimerRef = useRef(null);
  const retryTimerRef = useRef(null);

  const setCloudState = useCallback((kind, detail) => {
    setCloudStateValue(kind);
    setCloudDetail(detail || "");
  }, []);

  const getLocal = useCallback((key) => {
    const s = stateRef.current;
    if (key === "config") return s.config;
    return s[key];
  }, []);

  const runPush = useCallback(() => {
    const keys = Object.keys(dirtyRef.current).filter((k) => dirtyRef.current[k]);
    if (!keys.length) return;
    keys.forEach((k) => { dirtyRef.current[k] = false; });
    setCloudState("syncing");
    keys
      .reduce((p, k) => p.then(() => cloudPushTable(k, getLocal, ensureCriteriaIds)), Promise.resolve())
      .then(() => setCloudState("synced"))
      .catch((err) => {
        console.error("[aquario] falha ao enviar dados para a nuvem:", err);
        keys.forEach((k) => { dirtyRef.current[k] = true; });
        setCloudState("error", cloudErrorDetail(err));
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = setTimeout(runPush, CLOUD_RETRY_MS);
      });
  }, [getLocal, ensureCriteriaIds, setCloudState]);

  const markDirty = useCallback((tableKey) => {
    if (!CLOUD_TABLES[tableKey]) return;
    if (isArtifactSandbox()) { setCloudState("blocked"); return; }
    if (!getCloudConfig()) return;
    dirtyRef.current[tableKey] = true;
    clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(runPush, CLOUD_DEBOUNCE_MS);
  }, [runPush, setCloudState]);

  // assina o barramento de persistência local (aq_readings_v1 -> "readings", etc.)
  useEffect(() => onPersist((tableKey) => markDirty(STORAGE_KEY_TO_TABLE[tableKey] || tableKey)), [markDirty]);

  const autoReconcile = useCallback(() => {
    if (isArtifactSandbox()) { setCloudState("blocked"); return Promise.resolve(); }
    if (!getCloudConfig()) { setCloudState("off"); return Promise.resolve(); }
    setCloudState("syncing");
    return cloudPullAll()
      .then((remote) => {
        const s = stateRef.current;
        const lEmpty = localIsEmpty(s), rEmpty = remoteIsEmpty(remote);
        if (lEmpty && rEmpty) { setCloudState("synced"); return; }
        if (lEmpty && !rEmpty) {
          adoptRemote(remote, `Dados da nuvem aplicados: ${remote.readings.length} leitura(s), ${remote.criteria.length} critério(s).`);
          setCloudState("synced");
          return;
        }
        if (!lEmpty && rEmpty) return cloudPushAll(getLocal, ensureCriteriaIds).then(() => setCloudState("synced"));
        const sig = stateSignature(s.readings, s.criteria, s.structTasks, s.config);
        const rSig = stateSignature(remote.readings, remote.criteria, remote.structTasks, remote.config);
        if (sig === rSig) { setCloudState("synced"); return; }
        setCloudState("diverge", 'toque em "Sincronizar agora" na aba Configurações para revisar');
      })
      .catch((err) => {
        console.error("[aquario] falha ao reconciliar com a nuvem:", err);
        setCloudState("error", cloudErrorDetail(err));
      });
  }, [adoptRemote, getLocal, ensureCriteriaIds, setCloudState]);

  // roda uma vez ao montar (e de novo sempre que as credenciais mudarem)
  useEffect(() => {
    if (sandboxed) { setCloudState("blocked"); return; }
    if (!cfg) { setCloudState("off"); return; }
    autoReconcile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg, sandboxed]);

  const manualSync = useCallback(() => {
    if (sandboxed) { showSnackbar("Sincronização bloqueada dentro do artefato do claude.ai — abra o app fora daqui.", { variant: "error" }); return; }
    if (!getCloudConfig()) { showSnackbar("Configure a URL e a chave do projeto antes de sincronizar.", { variant: "error" }); return; }
    setCloudState("syncing");
    cloudPullAll()
      .then((remote) => {
        const s = stateRef.current;
        const lEmpty = localIsEmpty(s), rEmpty = remoteIsEmpty(remote);
        if (lEmpty && rEmpty) { setCloudState("synced"); showSnackbar("Nada para sincronizar ainda — nem aqui, nem na nuvem."); return; }
        if (rEmpty) {
          return cloudPushAll(getLocal, ensureCriteriaIds).then(() => {
            setCloudState("synced");
            showSnackbar("Dados deste aparelho enviados para a nuvem.");
          });
        }
        const sig = stateSignature(s.readings, s.criteria, s.structTasks, s.config);
        const rSig = stateSignature(remote.readings, remote.criteria, remote.structTasks, remote.config);
        if (sig === rSig) { setCloudState("synced"); showSnackbar("Já está tudo sincronizado."); return; }
        const ok = window.confirm(
          `A nuvem tem ${remote.readings.length} leitura(s) e este aparelho tem ${s.readings.length}.\n\n` +
          "Adotar os dados da nuvem aqui? Isso substitui o que está neste navegador — dá para desfazer em seguida.\n" +
          "Se preferir manter o que está aqui e sobrescrever a nuvem, cancele e edite qualquer campo para forçar o envio."
        );
        if (ok) {
          adoptRemote(remote, `Dados da nuvem aplicados: ${remote.readings.length} leitura(s), ${remote.criteria.length} critério(s).`);
          setCloudState("synced");
        } else {
          setCloudState("diverge");
        }
      })
      .catch((err) => {
        console.error("[aquario] falha ao sincronizar com a nuvem:", err);
        setCloudState("error", cloudErrorDetail(err));
        showSnackbar(`Não foi possível sincronizar: ${describeCloudError(err)}`, { variant: "error" });
      });
  }, [sandboxed, showSnackbar, getLocal, ensureCriteriaIds, adoptRemote, setCloudState]);

  const saveCloudConfig = useCallback((url, key) => {
    if (!url || !key) { showSnackbar("Preencha a URL e a chave antes de conectar.", { variant: "error" }); return; }
    if (!/^https:\/\//.test(url)) { showSnackbar("A URL do projeto deve começar com https://", { variant: "error" }); return; }
    setCloudConfigValues(url, key);
    showSnackbar("Credenciais salvas. Conectando…");
    setCfg(getCloudConfig());
  }, [showSnackbar]);

  const disconnectCloud = useCallback(() => {
    clearCloudConfigValues();
    setCfg(null);
    setCloudState("off");
    showSnackbar("Desconectado. Os dados continuam salvos neste navegador.");
  }, [showSnackbar, setCloudState]);

  return {
    sandboxed,
    cfg,
    cloudState,
    cloudDetail,
    manualSync,
    saveCloudConfig,
    disconnectCloud,
  };
}
