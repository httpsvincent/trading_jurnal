"use strict";

const $ = (id) => document.getElementById(id);
const rowsEl = $("rows");
const canvas = $("chart");
let trades = [];

/* ---------- tema ---------- */
function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  try { localStorage.setItem("tj-theme", t); } catch (e) {}
  drawChart();
}
(function initTheme() {
  let t = null;
  try { t = localStorage.getItem("tj-theme"); } catch (e) {}
  if (!t) t = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", t);
})();
$("theme").addEventListener("click", () => {
  const cur = document.documentElement.getAttribute("data-theme");
  applyTheme(cur === "dark" ? "light" : "dark");
});

/* ---------- util ---------- */
function points(t) {
  const diff = Number(t.exit) - Number(t.entry);
  return t.side === "buy" ? diff : -diff;
}
function fmt(n) { return (n > 0 ? "+" : "") + n.toFixed(2); }
function toast(text, bad) {
  const el = $("toast");
  el.textContent = text;
  el.style.background = bad ? "var(--red)" : "";
  el.style.color = bad ? "#fff" : "";
  el.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove("show"), 2400);
}
function cell(tr, text, cls) {
  const td = document.createElement("td");
  if (cls) td.className = cls;
  td.textContent = text;
  tr.appendChild(td);
  return td;
}

/* ---------- render ---------- */
function renderStats() {
  const pts = trades.map(points);
  const total = pts.reduce((a, b) => a + b, 0);
  const wins = pts.filter((p) => p > 0).length;
  $("s-total").textContent = trades.length;
  $("s-win").textContent = trades.length ? Math.round((wins / trades.length) * 100) + "%" : "0%";
  const sp = $("s-pts");
  sp.textContent = fmt(total);
  sp.className = total >= 0 ? "win" : "loss";
  $("s-best").textContent = pts.length ? fmt(Math.max(...pts)) : "-";
}

function renderTable() {
  const q = $("q").value.trim().toLowerCase();
  const f = $("flt").value;
  const list = trades.filter((t) => {
    if (q && !t.pair.toLowerCase().includes(q)) return false;
    if (f === "buy" || f === "sell") return t.side === f;
    if (f === "win") return points(t) > 0;
    if (f === "loss") return points(t) <= 0;
    return true;
  });
  rowsEl.replaceChildren();
  [...list].reverse().forEach((t, i) => {
    const p = points(t);
    const tr = document.createElement("tr");
    tr.style.animationDelay = Math.min(i * 25, 250) + "ms";
    cell(tr, t.id);
    cell(tr, t.pair);
    const side = cell(tr, "");
    const b = document.createElement("span");
    b.className = "badge " + t.side;
    b.textContent = t.side.toUpperCase();
    side.appendChild(b);
    cell(tr, t.lot);
    cell(tr, t.entry);
    cell(tr, t.exit);
    cell(tr, fmt(p), p > 0 ? "win" : "loss");
    rowsEl.appendChild(tr);
  });
  $("empty").classList.toggle("hidden", list.length > 0);
}

function drawChart() {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = 220;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  const empty = trades.length === 0;
  $("chart-empty").classList.toggle("hidden", !empty);
  if (empty) return;

  const css = getComputedStyle(document.documentElement);
  const accent = css.getPropertyValue("--accent").trim();
  const grid = css.getPropertyValue("--border").trim();
  const muted = css.getPropertyValue("--muted").trim();

  let acc = 0;
  const series = [0, ...trades.map((t) => (acc += points(t)))];
  const min = Math.min(...series), max = Math.max(...series);
  const span = max - min || 1;
  const pad = { l: 44, r: 12, t: 14, b: 22 };
  const x = (i) => pad.l + (i / Math.max(series.length - 1, 1)) * (w - pad.l - pad.r);
  const y = (v) => pad.t + (1 - (v - min) / span) * (h - pad.t - pad.b);

  ctx.font = "11px system-ui, sans-serif";
  ctx.fillStyle = muted; ctx.strokeStyle = grid; ctx.lineWidth = 1;
  for (let k = 0; k <= 3; k++) {
    const v = min + (span * k) / 3, yy = y(v);
    ctx.beginPath(); ctx.moveTo(pad.l, yy); ctx.lineTo(w - pad.r, yy); ctx.stroke();
    ctx.textAlign = "right"; ctx.fillText(v.toFixed(1), pad.l - 6, yy + 4);
  }
  if (min < 0 && max > 0) {
    ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(pad.l, y(0)); ctx.lineTo(w - pad.r, y(0)); ctx.stroke(); ctx.setLineDash([]);
  }

  const grad = ctx.createLinearGradient(0, pad.t, 0, h - pad.b);
  grad.addColorStop(0, accent + "55"); grad.addColorStop(1, accent + "00");
  ctx.beginPath();
  series.forEach((v, i) => (i ? ctx.lineTo(x(i), y(v)) : ctx.moveTo(x(i), y(v))));
  ctx.lineTo(x(series.length - 1), h - pad.b); ctx.lineTo(x(0), h - pad.b); ctx.closePath();
  ctx.fillStyle = grad; ctx.fill();

  ctx.beginPath();
  series.forEach((v, i) => (i ? ctx.lineTo(x(i), y(v)) : ctx.moveTo(x(i), y(v))));
  ctx.strokeStyle = accent; ctx.lineWidth = 2.5; ctx.lineJoin = "round"; ctx.stroke();
  ctx.fillStyle = accent;
  series.forEach((v, i) => { ctx.beginPath(); ctx.arc(x(i), y(v), 3, 0, Math.PI * 2); ctx.fill(); });
}

/* ---------- data ---------- */
async function load() {
  try {
    const res = await fetch("/trades");
    if (!res.ok) throw new Error("status " + res.status);
    trades = await res.json();
  } catch (e) {
    toast("Gagal memuat data dari server", true);
    trades = [];
  }
  renderStats(); renderTable(); drawChart();
}

$("f").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const pair = form.pair.value.trim().toUpperCase();
  const lot = parseFloat(form.lot.value);
  const entry = parseFloat(form.entry.value);
  const exit = parseFloat(form.exit.value);

  [...form.querySelectorAll("input")].forEach((i) => i.classList.remove("bad"));
  const invalid = [];
  if (!pair) invalid.push(form.pair);
  if (!(lot > 0)) invalid.push(form.lot);
  if (Number.isNaN(entry)) invalid.push(form.entry);
  if (Number.isNaN(exit)) invalid.push(form.exit);
  if (invalid.length) {
    invalid.forEach((i) => i.classList.add("bad"));
    toast("Lengkapi data dengan benar", true);
    return;
  }

  try {
    const res = await fetch("/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pair, side: form.side.value, lot, entry, exit }),
    });
    if (res.status === 201) {
      toast("Trade tersimpan (201 Created)");
      form.entry.value = ""; form.exit.value = "";
      await load();
    } else {
      toast("Gagal menyimpan, status " + res.status, true);
    }
  } catch (err) {
    toast("Server tidak bisa dihubungi", true);
  }
});

$("q").addEventListener("input", renderTable);
$("flt").addEventListener("change", renderTable);
window.addEventListener("resize", drawChart);

load();
