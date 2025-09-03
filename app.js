const BASE = "https://fapi.binance.com";
const PROXY = "https://api.allorigins.win/raw?url=";

const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");

let stopFlag = false;

// Logger sederhana
function log(msg) {
  console.log(msg);
  statusEl.textContent = "Status: " + msg;
}

// Fetch dengan proxy fallback
async function fetchWithProxy(url) {
  try {
    let res = await fetch(url);
    if (!res.ok) {
      res = await fetch(PROXY + encodeURIComponent(url));
    }
    if (!res.ok) throw new Error("Fetch gagal: " + res.status);
    return await res.json();
  } catch (err) {
    log("Error: " + err.message);
    throw err;
  }
}

// Ambil data ticker
async function fetchTickers() {
  return await fetchWithProxy(BASE + "/fapi/v1/ticker/24hr");
}

// Scan
async function runScan() {
  stopFlag = false;
  resultsEl.innerHTML = "";
  log("Scanning...");

  try {
    const tickers = await fetchTickers();
    const topN = parseInt(document.getElementById("topN").value) || 30;
    const modalUSD = parseFloat(document.getElementById("modal").value) || 1000;
    const riskPct = parseFloat(document.getElementById("risk").value) || 1;

    const sliced = tickers.slice(0, topN);
    let i = 0;
    for (let t of sliced) {
      if (stopFlag) break;
      i++;

      const entry = parseFloat(t.lastPrice);
      const sl = (entry * (1 - riskPct / 100)).toFixed(4);
      const tp1 = (entry * (1 + (riskPct / 100) * 3)).toFixed(4); // fixed 1:3
      const tp2 = "Resisten 1";
      const tp3 = "Resisten 2";

      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <h3>${i}. ${t.symbol}</h3>
        <p>Entry: ${entry}</p>
        <p>SL: ${sl}</p>
        <p>TP1 (1:3): ${tp1}</p>
        <p>TP2: ${tp2}</p>
        <p>TP3: ${tp3}</p>
        <p>Perubahan 24h: ${t.priceChangePercent}%</p>
      `;
      resultsEl.appendChild(div);
    }

    log("Selesai");
  } catch (err) {
    log("Error: " + err.message);
  }
}

startBtn.onclick = runScan;
stopBtn.onclick = () => { stopFlag = true; log("Dihentikan"); };
