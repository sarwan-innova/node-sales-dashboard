// node-sales-dashboard — a small sales dashboard.
// Deliberately pins OLD dependencies (see package.json) so the remediation
// platform has real vulnerabilities to find and fix. Do not deploy publicly.
const express = require("express");
const _ = require("lodash");
const moment = require("moment");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Demo data: 30 days of orders across 4 regions.
const REGIONS = ["North", "South", "East", "West"];
const orders = _.flatMap(_.range(30), (day) =>
  REGIONS.map((region, i) => ({
    date: moment().subtract(29 - day, "days").format("YYYY-MM-DD"),
    region,
    amount: 800 + ((day * 37 + i * 211) % 900),
  }))
);

function summary() {
  const byRegion = _.mapValues(_.groupBy(orders, "region"), (rows) => _.sumBy(rows, "amount"));
  const byDay = _.map(_.groupBy(orders, "date"), (rows, date) => ({ date, total: _.sumBy(rows, "amount") }));
  return { total: _.sumBy(orders, "amount"), byRegion, byDay, updated: moment().format("LLL") };
}

// Optional upstream (e.g. a CRM); only called when SALES_API_URL is set.
async function upstreamStatus() {
  if (!process.env.SALES_API_URL) return "not configured";
  try {
    const r = await axios.get(process.env.SALES_API_URL, { timeout: 2000 });
    return `ok (${r.status})`;
  } catch (e) {
    return "unreachable";
  }
}

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/api/summary", (req, res) => res.json(summary()));

app.get("/", async (req, res) => {
  const s = summary();
  const max = _.max(_.values(s.byRegion));
  const bars = _.map(s.byRegion, (v, region) =>
    `<div class="bar"><span>${region}</span><div style="width:${Math.round((v / max) * 100)}%"></div><b>$${v.toLocaleString()}</b></div>`
  ).join("");
  const spark = s.byDay.map((d) => d.total);
  const sMax = _.max(spark), sMin = _.min(spark);
  const points = spark.map((v, i) => `${i * 10},${60 - ((v - sMin) / (sMax - sMin || 1)) * 55}`).join(" ");
  res.send(`<!doctype html><html><head><meta charset="utf-8"><title>Sales Dashboard</title>
<style>body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:32px}
.card{background:#1e293b;border-radius:12px;padding:20px;margin-bottom:16px;max-width:720px}
h1{margin:0 0 4px}.muted{color:#94a3b8}.kpi{font-size:36px;font-weight:700}
.bar{display:grid;grid-template-columns:70px 1fr 110px;align-items:center;gap:10px;margin:8px 0}
.bar div{height:14px;background:#38bdf8;border-radius:7px}</style></head><body>
<h1>Sales Dashboard</h1><p class="muted">Last 30 days · updated ${s.updated} · upstream: ${await upstreamStatus()}</p>
<div class="card"><div class="muted">Total revenue</div><div class="kpi">$${s.total.toLocaleString()}</div>
<svg width="300" height="60"><polyline fill="none" stroke="#34d399" stroke-width="2" points="${points}"/></svg></div>
<div class="card"><div class="muted">Revenue by region</div>${bars}</div></body></html>`);
});

app.listen(PORT, () => console.log(`sales dashboard on :${PORT}`));
