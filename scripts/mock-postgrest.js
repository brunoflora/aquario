// Mock mínimo e fiel do protocolo PostgREST (Supabase REST), só para validar
// que o app fala HTTP corretamente com um projeto real. Não é o Supabase.
const https = require("https");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const VALID_KEY = process.env.MOCK_KEY || "test-anon-key";
const PK = { readings: "date", phase_data: "id", gate_criteria: "id", tank_config: "id", struct_tasks: "id" };
const store = { readings: [], phase_data: [], gate_criteria: [], tank_config: [], struct_tasks: [] };

function send(res, code, body, extraHeaders) {
  const headers = Object.assign({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "apikey, authorization, content-type, prefer",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Content-Type": "application/json"
  }, extraHeaders || {});
  res.writeHead(code, headers);
  res.end(body === undefined ? "" : JSON.stringify(body));
}

function parseFilters(searchParams) {
  const filters = [];
  for (const [k, v] of searchParams.entries()) {
    if (["select", "on_conflict", "order", "limit"].includes(k)) continue;
    const m = v.match(/^eq\.(.*)$/);
    if (m) filters.push([k, m[1]]);
  }
  return filters;
}

function applyFilters(rows, filters) {
  return rows.filter((r) => filters.every(([k, v]) => String(r[k]) === v));
}

const tlsOpts = {
  key: fs.readFileSync(path.join(__dirname, "mock-key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "mock-cert.pem"))
};

const server = https.createServer(tlsOpts, (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (req.method === "OPTIONS") return send(res, 204);

  // utilitário só de teste (fora do protocolo PostgREST): zera todas as tabelas
  if (url.pathname === "/__reset" && req.method === "POST") {
    Object.keys(store).forEach((k) => { store[k] = []; });
    return send(res, 200, { ok: true });
  }

  const apikey = req.headers["apikey"];
  if (apikey !== VALID_KEY) return send(res, 401, { message: "Invalid API key" });

  const parts = url.pathname.split("/").filter(Boolean); // ["rest","v1","<table>"]
  if (parts[0] !== "rest" || parts[1] !== "v1" || !parts[2]) return send(res, 404, { message: "not found" });
  const table = parts[2];
  if (!(table in store)) return send(res, 404, { message: "unknown table " + table });
  const pk = PK[table];
  const filters = parseFilters(url.searchParams);

  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    if (req.method === "GET") {
      return send(res, 200, applyFilters(store[table], filters));
    }
    if (req.method === "POST") {
      let rows;
      try { rows = JSON.parse(body); } catch (e) { return send(res, 400, { message: "bad json" }); }
      if (!Array.isArray(rows)) rows = [rows];
      const prefer = req.headers["prefer"] || "";
      const isUpsert = prefer.includes("merge-duplicates");
      rows.forEach((row) => {
        const idx = store[table].findIndex((r) => r[pk] === row[pk]);
        if (idx >= 0 && isUpsert) store[table][idx] = Object.assign({}, store[table][idx], row);
        else if (idx >= 0) return; // conflito sem upsert: ignora (não deveria ocorrer nos testes)
        else store[table].push(row);
      });
      return send(res, prefer.includes("return=representation") ? 201 : 201, prefer.includes("return=minimal") ? undefined : rows);
    }
    if (req.method === "DELETE") {
      const before = store[table].length;
      store[table] = store[table].filter((r) => !filters.every(([k, v]) => String(r[k]) === v));
      return send(res, 204);
    }
    return send(res, 405, { message: "method not allowed" });
  });
});

const port = process.env.MOCK_PORT || 8734;
server.listen(port, "127.0.0.1", () => {
  console.log("mock-postgrest listening on https://127.0.0.1:" + port, "key=" + VALID_KEY);
});

// utilitário de teste: reset via GET especial não faz parte do protocolo real,
// então oferecemos reset por variável de ambiente/reinício do processo apenas.
module.exports = { store };
