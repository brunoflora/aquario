import { loadJSON, saveJSON } from "../state/storage.js";

export const CLOUD_KEYS = { url: "aq_cloud_url_v1", key: "aq_cloud_key_v1" };

export function isArtifactSandbox() {
  try {
    if (window.__FRAME_PREAMBLE) return true;
    return window.top !== window.self;
  } catch (e) {
    return true;
  }
}

export function getCloudConfig() {
  const url = loadJSON(CLOUD_KEYS.url, "");
  const key = loadJSON(CLOUD_KEYS.key, "");
  if (!url || !key) return null;
  return { url: url.replace(/\/+$/, ""), key };
}

export function setCloudConfigValues(url, key) {
  saveJSON(CLOUD_KEYS.url, url.trim());
  saveJSON(CLOUD_KEYS.key, key.trim());
}

export function clearCloudConfigValues() {
  try {
    window.localStorage.removeItem(CLOUD_KEYS.url);
    window.localStorage.removeItem(CLOUD_KEYS.key);
  } catch (e) { /* noop */ }
}

export function describeCloudError(err) {
  if (!err) return "Erro desconhecido.";
  if (typeof err === "string") return err;
  if (err.code === "not_configured") return "Nuvem não configurada.";
  if (err.code === "sandboxed") return "Bloqueado pelo sandbox do artefato — abra o app fora do claude.ai.";
  if (err.code === "timeout") return 'Sem resposta do servidor (tempo esgotado). Verifique a URL do projeto, ou se ele está pausado no painel do Supabase (plano free pausa projetos sem uso — abra o painel e clique em "Restore project").';
  if (err.code === "network") return 'Não foi possível conectar. Verifique a URL do projeto, sua internet, ou se o projeto está pausado no painel do Supabase (plano free pausa projetos sem uso — abra o painel e clique em "Restore project").';
  if (err.code === "http_401" || err.code === "http_403") return 'Chave rejeitada pelo Supabase. Confira se copiou a chave "anon public" correta.';
  if (err.code === "http_404") return "Projeto não encontrado, ou as tabelas ainda não existem (rode o supabase-schema.sql).";
  if (err.code && err.code.indexOf("http_") === 0) return `O Supabase respondeu com erro (${err.code.replace("http_", "")}).`;
  return err.message || "Erro ao sincronizar.";
}

export function cloudErrorDetail(err) {
  const msg = describeCloudError(err);
  const raw = err && (err.message || err.code);
  return raw && raw !== msg ? `${msg} [${raw}]` : msg;
}
