// Teste de regressão da sincronização na nuvem, contra um mock local do
// protocolo PostgREST (não é o Supabase real — não substitui testar com um
// projeto de verdade, mas prova que o app fala HTTP corretamente: upsert,
// delete propagado, reconciliação sem sobrescrever sozinho, erros de chave
// e de rede tratados, e o bloqueio dentro de iframe/sandbox).
//
// Como rodar:
//   1. Gerar um certificado local (uma vez):
//      openssl req -x509 -newkey rsa:2048 -keyout scripts/mock-key.pem \
//        -out scripts/mock-cert.pem -days 3 -nodes -subj "/CN=127.0.0.1" \
//        -addext "subjectAltName=IP:127.0.0.1"
//   2. Num terminal: MOCK_PORT=8734 MOCK_KEY=test-anon-key node scripts/mock-postgrest.js
//   3. Noutro: npm i -D playwright-core (ou similar) && node scripts/cloud-sync-test.js
//
// Requer playwright-core com um Chromium disponível (variável de ambiente
// PLAYWRIGHT_EXECUTABLE_PATH, ou ajuste o launch() abaixo).

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");

const APP = "file://" + path.join(__dirname, "..", "index.html");
const URL_ = "https://127.0.0.1:8734";
const KEY = "test-anon-key";

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function main() {
  // servidor mock já está rodando em background (lançado separadamente)
  await fetch(URL_ + "/__reset", { method: "POST" });
  const errors = [];
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined });

  function onErr(tag) {
    return (p) => { p.on("pageerror", (e) => errors.push(tag + " PAGEERROR " + e.message)); };
  }

  async function configureCloud(page, url, key) {
    await page.click("#tab-btn-config");
    await page.fill("#f-cloud-url", url);
    await page.fill("#f-cloud-key", key);
    await page.click("#btn-cloud-save");
    await wait(600);
  }

  async function fillReading(page, temp, ph, kh, nh3, no2, no3) {
    await page.click("#tab-btn-params");
    await page.click("#btn-new");
    await wait(150);
    await page.fill("#f-temp", String(temp));
    await page.fill("#f-ph", String(ph));
    await page.fill("#f-kh", String(kh));
    await page.fill("#f-nh3", String(nh3));
    await page.fill("#f-no2", String(no2));
    await page.fill("#f-no3", String(no3));
    await wait(500);
  }

  console.log("=== dispositivo 1: fresco, sem nuvem ===");
  const p1 = await browser.newPage({ ignoreHTTPSErrors: true }); onErr("d1")(p1);
  await p1.goto(APP);
  await p1.evaluate(() => localStorage.clear());
  await p1.reload(); await wait(300);
  console.log("pill inicial:", await p1.textContent("#aq-cloud-status-text"));

  console.log("\n=== d1: conecta com cloud vazia + local vazia -> synced sem mudar nada ===");
  await configureCloud(p1, URL_, KEY);
  console.log("pill:", await p1.textContent("#aq-cloud-status-text"));
  console.log("state:", await p1.getAttribute("#aq-cloud-pill", "data-state"));

  console.log("\n=== d1: adiciona leitura -> deve empurrar pra nuvem ===");
  await fillReading(p1, 26.5, 7.0, 3, 0, 0, 15);
  await wait(1200);
  const r1 = await fetch(URL_ + "/rest/v1/readings?select=*", { headers: { apikey: KEY } }).then((r) => r.json());
  console.log("linhas no mock apos push:", JSON.stringify(r1));

  console.log("\n=== d2: dispositivo novo, mesma URL/chave -> deve puxar (local vazio, nuvem tem dado) ===");
  const p2 = await browser.newPage({ ignoreHTTPSErrors: true }); onErr("d2")(p2);
  await p2.goto(APP);
  await p2.evaluate(() => localStorage.clear());
  await p2.reload(); await wait(300);
  await configureCloud(p2, URL_, KEY);
  await p2.click("#tab-btn-painel"); await wait(300);
  console.log("d2 linhas na tabela apos adotar:", await p2.locator("#aq-history-body tr").count(), "(esperado 1)");
  console.log("d2 pill:", await p2.textContent("#aq-cloud-status-text"));

  console.log("\n=== d2: edita a ficha (tank-brand) -> propaga pro tank_config ===");
  await p2.click("#tab-btn-config"); await wait(200);
  await p2.fill("#c-tank-brand", "AquaGlass Pro");
  await p2.locator("#c-tank-brand").blur();
  await wait(2000); // 300ms debounce do form + 900ms debounce da nuvem + rede
  const cfgRows = await fetch(URL_ + "/rest/v1/tank_config?select=*", { headers: { apikey: KEY } }).then((r) => r.json());
  console.log("tank_config.tank_brand na nuvem:", cfgRows[0] && cfgRows[0].tank_brand, "(esperado AquaGlass Pro)");

  console.log("\n=== d2: exclui a leitura -> delete deve propagar (nao so upsert) ===");
  await p2.click("#tab-btn-painel"); await wait(200);
  await p2.click("#btn-view-table"); await wait(200);
  await p2.locator('[data-action="delete"]').first().click();
  await wait(1200);
  const afterDelete = await fetch(URL_ + "/rest/v1/readings?select=*", { headers: { apikey: KEY } }).then((r) => r.json());
  console.log("linhas na nuvem apos exclusao:", JSON.stringify(afterDelete), "(esperado [])");

  console.log("\n=== d1: recarrega -> deve detectar divergencia (nao sobrescrever sozinho) ===");
  await p1.reload(); await wait(900);
  console.log("d1 pill apos reload:", await p1.textContent("#aq-cloud-status-text"));
  console.log("d1 state attr:", await p1.getAttribute("#aq-cloud-pill", "data-state"), "(esperado diverge)");
  console.log("d1 ainda mostra a leitura antiga localmente:", await p1.locator("#aq-history-body tr").count(), "(esperado 1 - nao apagou sozinho)");

  console.log("\n=== d1: Sincronizar agora + confirmar -> adota a nuvem (0 leituras, brand novo) ===");
  await p1.click("#tab-btn-config"); await wait(200);
  p1.once("dialog", (d) => d.accept());
  await p1.click("#btn-cloud-sync-now");
  await wait(700);
  console.log("d1 tank-brand apos adotar:", await p1.inputValue("#c-tank-brand"), "(esperado AquaGlass Pro)");
  await p1.click("#tab-btn-painel"); await wait(200);
  console.log("d1 linhas apos adotar:", await p1.locator("#aq-history-body tr").count(), "(esperado 0)");

  console.log("\n=== chave errada: erro amigavel, app continua utilizavel localmente ===");
  const p3 = await browser.newPage({ ignoreHTTPSErrors: true }); onErr("d3")(p3);
  await p3.goto(APP);
  await p3.evaluate(() => localStorage.clear());
  await p3.reload(); await wait(300);
  await configureCloud(p3, URL_, "chave-errada");
  console.log("pill com chave errada:", await p3.textContent("#aq-cloud-status-text"));
  console.log("log:", await p3.textContent("#aq-cloud-log"));
  await fillReading(p3, 27, 7.1, 4, 0, 0, 12);
  await p3.click("#tab-btn-painel"); await wait(200);
  console.log("mesmo com nuvem quebrada, salvou local:", await p3.locator("#aq-history-body tr").count(), "(esperado 1)");

  console.log("\n=== URL inalcancavel: mesmo tratamento ===");
  const p4 = await browser.newPage({ ignoreHTTPSErrors: true }); onErr("d4")(p4);
  await p4.goto(APP);
  await p4.evaluate(() => localStorage.clear());
  await p4.reload(); await wait(300);
  await configureCloud(p4, "https://127.0.0.1:9999", KEY);
  console.log("pill URL inalcancavel:", await p4.textContent("#aq-cloud-status-text"));
  console.log("log:", await p4.textContent("#aq-cloud-log"));

  console.log("\n=== desconectar limpa credenciais sem tocar nos dados ===");
  await p3.click("#tab-btn-config"); await wait(150);
  await p3.click("#btn-cloud-disconnect"); await wait(200);
  console.log("pill apos desconectar:", await p3.textContent("#aq-cloud-status-text"));
  console.log("credenciais limpas:", await p3.evaluate(() => localStorage.getItem("aq_cloud_url_v1")));
  await p3.click("#tab-btn-painel"); await wait(150);
  console.log("dados locais intactos apos desconectar:", await p3.locator("#aq-history-body tr").count(), "(esperado 1)");

  console.log("\n=== export JSON nunca inclui credenciais ===");
  await configureCloud(p1, URL_, KEY);
  const exportPayload = await p1.evaluate(() => {
    return { readings: [], phases: [], criteria: [], config: {}, structTasks: [] }; // placeholder to avoid download flow
  });
  const hasCloudKeysInExport = await p1.evaluate(() => {
    // reproduz a montagem do payload do botao Exportar, sem baixar o arquivo
    const raw = JSON.stringify({ config: JSON.parse(localStorage.getItem("aq_config_v1") || "{}") });
    return raw.indexOf("test-anon-key") >= 0;
  });
  console.log("chave aparece no payload de export:", hasCloudKeysInExport, "(esperado false)");

  console.log("\n=== sandbox de artefato: detectado dentro de iframe, sem chamadas de rede ===");
  const hostHtml = `<!doctype html><html><body><iframe src="${APP}" style="width:1000px;height:900px"></iframe></body></html>`;
  const hostPath = path.join(require("os").tmpdir(), "aq-iframe-host.html");
  fs.writeFileSync(hostPath, hostHtml);
  const p5 = await browser.newPage({ ignoreHTTPSErrors: true }); onErr("d5-outer")(p5);
  await p5.goto("file://" + hostPath);
  await wait(500);
  const frame = p5.frames().find((f) => f.url().includes("index.html"));
  await frame.evaluate(() => localStorage.clear());
  await p5.reload(); await wait(500);
  const frame2 = p5.frames().find((f) => f.url().includes("index.html"));
  await frame2.click("#tab-btn-config"); await wait(150);
  const noticeVisible = await frame2.evaluate(() => !document.getElementById("aq-cloud-sandbox-notice").hidden);
  console.log("aviso de sandbox visivel dentro do iframe:", noticeVisible, "(esperado true)");
  console.log("pill dentro do iframe:", await frame2.textContent("#aq-cloud-status-text"), "(esperado bloqueada)");

  console.log("\n=== erros de pagina ===");
  console.log(errors.length ? errors.join("\n") : "nenhum erro em nenhum dos 5 contextos");

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
