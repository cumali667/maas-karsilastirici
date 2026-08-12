// src/data/endeks.json üreticisi.
//
// endeks.json, uygulamanın TL farkını USD ve gram altına çevirmek için kullandığı
// tek kaynaktır (bkz. src/App.jsx -> recalculateTotals). Elle bakımı hataya açık
// olduğu için bu script onu ham CSV'lerden yeniden üretir.
//
// Kaynaklar (src/data/):
//   1. "USD_TRY Historical Data.csv" / "GAU_TRY Historical Data.csv"
//      investing.com aylık dışa aktarımı, 2020-02 .. 2025-04 arasını kapsar.
//      Bu iki dosya olduğu gibi korunur — indirildikleri haliyle arşivdir.
//   2. "market-rates-2025-04_2026-07.csv"
//      2025-04 .. 2026-07 arası. investing.com dışa aktarımı bu aralık için
//      elde edilemediğinden, ay sonu kapanışları Yahoo Finance günlük
//      serilerinden türetilmiştir (USDTRY=X ve GC=F):
//          gram_altin_TRY = XAU_USD_ons * USDTRY / 31.1034768
//      Yöntem, mevcut investing.com verisinin 64 ayına karşı doğrulandı:
//      USD medyan sapma +0.02%, gram altın medyan sapma -0.02%.
//
//      2025-04 bu dosyada bilerek yer alıyor: investing.com dışa aktarımı
//      04.04.2025'te alındığı için o satır ayın tamamını değil ilk 4 gününü
//      yansıtıyordu (gram altın 3758.39, gerçek ay sonu kapanışı 4091.12 —
//      %8.85 sapma). Diğer tüm aylar ay sonu kapanışı olduğundan düzeltildi.
//
// Öncelik sırası: investing.com arşivi -> mevcut endeks.json -> market-rates.
// Mevcut endeks.json değerleri korunur ki geçmiş veride istenmeyen oynama
// olmasın; market-rates dosyası ise açık bir düzeltme/genişletme kaynağı
// olduğu için en son uygulanır ve kapsadığı ayları ezer.
//
// Kullanım:  node scripts/build-endeks.mjs [--overwrite]

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dataDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data");
const overwrite = process.argv.includes("--overwrite");

const months = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

// investing.com dışa aktarımlarında satırlar ayın 1'i ile etiketlenir ama
// "Price" sütunu o ayın KAPANIŞIDIR. Binlik ayıracı virgüldür ("3,812.333").
const readCsv = (file) => {
  const text = readFileSync(join(dataDir, file), "utf8").replace(/^﻿/, "");
  const [header, ...rows] = text.trim().split(/\r?\n/);
  const cols = header.split(",").map((c) => c.replace(/"/g, "").trim());
  return rows.map((row) => {
    const cells = row.match(/("([^"]*)"|[^,]*)/g).filter((_, i) => i % 2 === 0);
    return Object.fromEntries(
      cols.map((c, i) => [c, (cells[i] ?? "").replace(/"/g, "").trim()])
    );
  });
};

const toNumber = (v) => Number(String(v).replace(/,/g, ""));
const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

// "MM/DD/YYYY" -> { year, month }
const parseDate = (d) => {
  const [mm, , yyyy] = d.split("/");
  return { year: yyyy, month: months[Number(mm) - 1] };
};

const rates = {};
const put = (year, month, key, value) => {
  rates[year] ??= {};
  rates[year][month] ??= {};
  rates[year][month][key] = round2(value);
};

// 1. investing.com arşivi
for (const [file, key] of [
  ["USD_TRY Historical Data.csv", "usd_try"],
  ["GAU_TRY Historical Data.csv", "gold_try"]
]) {
  for (const row of readCsv(file)) {
    const { year, month } = parseDate(row.Date);
    put(year, month, key, toNumber(row.Price));
  }
}

// 2. Mevcut endeks.json değerlerini koru (--overwrite verilmedikçe)
const outPath = join(dataDir, "endeks.json");
if (!overwrite && existsSync(outPath)) {
  const existing = JSON.parse(readFileSync(outPath, "utf8")).exchange_rates ?? {};
  for (const [year, monthsObj] of Object.entries(existing)) {
    for (const [month, value] of Object.entries(monthsObj)) {
      rates[year] ??= {};
      rates[year][month] = { ...rates[year][month], ...value };
    }
  }
}

// 3. Yahoo'dan türetilen aralık — açık düzeltme kaynağı, en son uygulanır.
for (const row of readCsv("market-rates-2025-04_2026-07.csv")) {
  const { year, month } = parseDate(row.Date);
  put(year, month, "usd_try", toNumber(row.usd_try));
  put(year, month, "gold_try", toNumber(row.gold_try));
}

// Yıl ve ayları kronolojik sırada yaz
const ordered = {};
for (const year of Object.keys(rates).sort()) {
  ordered[year] = {};
  for (const month of months) {
    const value = rates[year][month];
    // usd_try veya gold_try eksikse ay atlanır: App.jsx eksik kurda o ayı
    // toplamlara hiç katmaz, yarım veri sessizce yanlış sonuç üretir.
    if (value?.usd_try != null && value?.gold_try != null) ordered[year][month] = value;
  }
}

writeFileSync(outPath, JSON.stringify({ exchange_rates: ordered }, null, 2) + "\n");

const total = Object.values(ordered).reduce((n, m) => n + Object.keys(m).length, 0);
console.log(`endeks.json yazıldı: ${Object.keys(ordered).length} yıl, ${total} ay`);
