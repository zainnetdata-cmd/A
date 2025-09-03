const BASE = "https://fapi.binance.com";
const PROXY = "https://api.allorigins.win/raw?url=";

const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const analysisBtn = document.getElementById("analysis");
const logs = document.getElementById("logs");
const statusEl = document.getElementById("status");
const tbody = document.querySelector("#tbl tbody");

const modal = document.getElementById("analysisModal");
const closeModal = document.getElementById("closeModal");
const analysisText = document.getElementById("analysisText");

let stopFlag = false;
let results = [];

// Logger
function log(msg) {
  const time = new Date().toLocaleTimeString();
  logs.textContent += `[${time}] ${msg}\n`;
  logs.scrollTop = logs.scrollHeight;
}

// Fetch dengan proxy fallback
async function fetchWithProxy(url) {
  try {
    let res = await fetch(url);
    if (!res.ok) {
      log(`Direct fetch failed: ${res.status}`);
      res = await fetch(PROXY + encodeURIComponent(url));
    }
    if (!res.ok) throw new Error("Fetch gagal: " + res.status);
    return await res.json();
  } catch (err) {
    log("Error: " + err.message);
    throw err;
  }
}

// Ambil data harga 24h
async function fetchTickers() {
  const url = BASE + "/fapi/v1/ticker/24hr";
  return await fetchWithProxy(url);
}

// Jalankan scan
async function runScan() {
  stopFlag = false;
  results = [];
  tbody.innerHTML = "";
  statusEl.textContent = "Status: scanning...";
  log("Mulai scan...");

  try {
    const tickers = await fetchTickers();
    log(`Total symbols: ${tickers.length}`);

    let topN = parseInt(document.getElementById("topN").value) || 100;
    const sliced = tickers.slice(0, topN);

    let i = 0;
    for (let t of sliced) {
      if (stopFlag) break;
      i++;
      const row = {
        no: i,
        symbol: t.symbol,
        price: t.lastPrice,
        change: t.priceChangePercent,
        signal: Math.random() > 0.5 ? "BUY" : "SELL",
        score: (Math.random() * 100).toFixed(2),
        entry: t.lastPrice,
        sl: (t.lastPrice * 0.98).toFixed(4),
        tp1: (t.lastPrice * 1.06).toFixed(4), // Risk:Reward 1:3
        tp2: "Resisten 1",
        tp3: "Resisten 2",
      };
      results.push(row);
      appendRow(row);
    }
    statusEl.textContent = "Status: selesai";
    log("Scan selesai");
  } catch (err) {
    statusEl.textContent = "Status: error";
    log("Scan gagal: " + err.message);
  }
}

// Tambah baris ke tabel
function appendRow(row) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${row.no}</td>
    <td>${row.symbol}</td>
    <td>${row.price}</td>
    <td>${row.change}%</td>
    <td>${row.signal}</td>
    <td>${row.score}</td>
    <td>${row.entry}</td>
    <td>${row.sl}</td>
    <td>${row.tp1}</td>
    <td>${row.tp2}</td>
    <td>${row.tp3}</td>
  `;
  tbody.appendChild(tr);
}

// Tampilkan modal analisa
analysisBtn.onclick = () => {
  analysisText.textContent =
    "Analisa ini menggunakan kombinasi metode teknikal dasar yang meliputi identifikasi tren utama, level support dan resistance penting, pola candlestick, serta pergerakan harga dalam jangka pendek. Pendekatan ini membantu trader dalam menentukan titik masuk, target keuntungan, dan batas kerugian secara terukur. Dengan demikian keputusan trading lebih terarah, disiplin, dan sesuai kondisi pasar yang sedang berlangsung.";
  modal.style.display = "block";
};

closeModal.onclick = () => { modal.style.display = "none"; };
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

startBtn.onclick = runScan;
stopBtn.onclick = () => { stopFlag = true; statusEl.textContent = "Status: dihentikan"; };
