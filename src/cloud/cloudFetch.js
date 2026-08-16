import { getCloudConfig, isArtifactSandbox } from "./cloudConfig.js";
import { CLOUD_TABLES } from "./tables.js";

const CLOUD_TIMEOUT_MS = 12000;

export function cloudFetch(path, opts = {}) {
  const cfg = getCloudConfig();
  if (!cfg) return Promise.reject({ code: "not_configured" });
  if (isArtifactSandbox()) return Promise.reject({ code: "sandboxed" });
  const headers = { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json" };
  Object.keys(opts.headers || {}).forEach((k) => { headers[k] = opts.headers[k]; });
  const hasAbort = typeof AbortController === "function";
  const controller = hasAbort ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), CLOUD_TIMEOUT_MS) : null;
  return fetch(`${cfg.url}/rest/v1/${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: controller ? controller.signal : undefined,
  }).then(
    (res) => {
      if (timeoutId) clearTimeout(timeoutId);
      if (!res.ok) {
        return res.text().then((t) => { throw { code: `http_${res.status}`, status: res.status, message: t }; });
      }
      if (res.status === 204) return null;
      return res.text().then((t) => (t ? JSON.parse(t) : null));
    },
    (err) => {
      if (timeoutId) clearTimeout(timeoutId);
      throw { code: err.name === "AbortError" ? "timeout" : "network", message: err.message };
    }
  );
}

// `getLocal(key)` e `ensureCriteriaIds()` são injetados pelo chamador
// (useCloudSync), que os liga ao AppStateProvider — mantém este módulo sem
// depender de React nem de um `state` global, igual ao objetivo original.

export function cloudPushTable(key, getLocal, ensureCriteriaIds) {
  const a = CLOUD_TABLES[key];
  if (!a) return Promise.resolve();
  if (a.single) {
    const row = a.toRow(getLocal(key));
    return cloudFetch(`${a.table}?on_conflict=${a.conflictCol}`, {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: [row],
    });
  }
  const localRows = key === "criteria" && ensureCriteriaIds ? ensureCriteriaIds() : getLocal(key);
  const rows = localRows.map(a.toRow);
  const localIds = rows.map(a.idOf);
  const push = rows.length
    ? cloudFetch(`${a.table}?on_conflict=${a.conflictCol}`, {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: rows,
      })
    : Promise.resolve();
  if (a.noDelete) return push;
  return push
    .then(() => cloudFetch(`${a.table}?select=${a.conflictCol}`))
    .then((serverRows) => {
      const extra = (serverRows || []).filter((r) => localIds.indexOf(r[a.conflictCol]) === -1);
      if (!extra.length) return null;
      return Promise.all(
        extra.map((r) => cloudFetch(`${a.table}?${a.conflictCol}=eq.${encodeURIComponent(r[a.conflictCol])}`, { method: "DELETE" }))
      );
    });
}

export function cloudPushAll(getLocal, ensureCriteriaIds) {
  return Object.keys(CLOUD_TABLES).reduce(
    (p, key) => p.then(() => cloudPushTable(key, getLocal, ensureCriteriaIds)),
    Promise.resolve()
  );
}

export function cloudPullAll() {
  return Promise.all(
    Object.keys(CLOUD_TABLES).map((key) => {
      const a = CLOUD_TABLES[key];
      return cloudFetch(`${a.table}?select=*`).then((rows) => ({ key, rows: rows || [] }));
    })
  ).then((results) => {
    const out = {};
    results.forEach((r) => {
      const a = CLOUD_TABLES[r.key];
      out[r.key] = a.single ? (r.rows.length ? a.fromRow(r.rows[0]) : null) : r.rows.map(a.fromRow);
    });
    return out;
  });
}
