import { useState } from "react";
import salaryData from "./data/maaslar.json";
import endeksData from "./data/endeks.json";

const months = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

// Bir ay yalnızca hem devlet maaşı hem de o aya ait kur verisi varsa kullanılabilir.
// Kur yoksa recalculateTotals o ayı toplamlara hiç katmaz; ayı açık bırakmak
// kullanıcıya sessizce yanlış bir sonuç gösterirdi. Aralık sınırları veriden
// türetilir, elle tarih yazılmaz — yeni ay eklendiğinde burası değişmez.
const isMonthActive = (year, month, monthsObj) =>
  Boolean(monthsObj?.[month]) && Boolean(endeksData.exchange_rates?.[year]?.[month]);

// Bir unvanın tüm aylarını devlet maaşlarıyla doldurur.
const seedSalaries = (role) => {
  const seeded = {};
  Object.entries(salaryData.roles[role]).forEach(([year, monthsObj]) => {
    seeded[year] = {};
    months.forEach((month) => {
      if (monthsObj[month]) {
        seeded[year][month] = monthsObj[month];
      }
    });
  });
  return seeded;
};

import { useEffect } from "react";

export default function MaasHesaplayici() {
  const [showInfo, setShowInfo] = useState(false);
  const localStorageKey = "userSalariesData";

  const [totalTL, setTotalTL] = useState(0);
  const [totalUSD, setTotalUSD] = useState(0);
  const [totalGold, setTotalGold] = useState(0);
  const roleStorageKey = "selectedRole";
  const [selectedRole, setSelectedRole] = useState(() => {
    return localStorage.getItem(roleStorageKey) || "Araştırma Görevlisi";
  });
  const [userSalaries, setUserSalaries] = useState(() => {
    const seeded = seedSalaries(selectedRole);
    const saved = localStorage.getItem(localStorageKey);
    if (!saved) return seeded;

    // Eski kullanıcıların kayıtlı verisinde sonradan eklenen yıllar/aylar yoktur.
    // Eksik anahtarlar devlet maaşıyla tamamlanır, kullanıcının girdiği değerlere
    // dokunulmaz.
    const parsed = JSON.parse(saved);
    const merged = {};
    Object.entries(seeded).forEach(([year, monthsObj]) => {
      merged[year] = { ...monthsObj, ...parsed[year] };
    });
    return merged;
  });

  useEffect(() => {
    recalculateTotals(userSalaries);
  }, []);

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    localStorage.setItem(roleStorageKey, role);

    const initial = seedSalaries(role);
    setUserSalaries(initial);
    localStorage.setItem(localStorageKey, JSON.stringify(initial));
    // Yeni unvan bu render'da henüz state'e yazılmadığı için açıkça geçilir.
    recalculateTotals(initial, role);
  };

  const handleSalaryChange = (year, month, value) => {
    const updatedSalaries = {
      ...userSalaries,
      [year]: {
        ...userSalaries[year],
        [month]: value
      }
    };
    setUserSalaries(updatedSalaries);
    localStorage.setItem(localStorageKey, JSON.stringify(updatedSalaries));
    recalculateTotals(updatedSalaries);
  };

  const recalculateTotals = (salaries, role = selectedRole) => {
    const roleSalaries = salaryData.roles[role];
    let tl = 0;
    let usd = 0;
    let gold = 0;

    Object.entries(roleSalaries).forEach(([year, monthsObj]) => {
      months.forEach((month) => {
        if (!isMonthActive(year, month, monthsObj)) return;
        const devletMaas = monthsObj[month];
        const kullaniciMaas = salaries?.[year]?.[month];
        if (devletMaas && kullaniciMaas) {
          const fark = devletMaas - Number(kullaniciMaas);
          const kur = endeksData.exchange_rates[year][month];
          if (fark) {
            tl += fark;
            usd += fark / kur.usd_try;
            gold += fark / kur.gold_try;
          }
        }
      });
    });

    setTotalTL(tl);
    setTotalUSD(usd);
    setTotalGold(gold);
  };

  const renderSalaryTable = () => {
    const roleSalaries = salaryData.roles[selectedRole];

    return Object.entries(roleSalaries).map(([year, salaries]) => (
      <div key={year} className="mb-6">
        <h3 className="font-semibold text-lg mb-2">{year}</h3>
        <div className="flex flex-wrap gap-4">
          {months.map((month) => {
            const isDisabled = !isMonthActive(year, month, salaries);

            const devletMaas = salaries[month] || null;
            const kullaniciMaas = userSalaries?.[year]?.[month] || null;
            const fark = devletMaas && kullaniciMaas ? devletMaas - Number(kullaniciMaas) : null;
            const yuzde = fark !== null && kullaniciMaas ? ((fark / devletMaas) * 100).toFixed(1) : null;

            return isDisabled ? (
              <div key={month} className="w-[140px] border p-3 rounded-lg shadow-sm text-sm opacity-40 pointer-events-none">
                <div className="font-medium mb-1">{month}</div>
                <div className="mb-1">Devlet: -</div>
                <input
                  type="number"
                  disabled
                  className="w-full border rounded px-2 py-1 text-sm mb-1 bg-gray-100"
                />
              </div>
            ) : (
              <div key={month} className="w-[140px] border p-3 rounded-lg shadow-sm text-sm">
                <div className="font-medium mb-1">{month}</div>
                <div className="mb-1">Devlet: {devletMaas ? devletMaas.toLocaleString("tr-TR") + " TL" : "-"}</div>
                <input
                  type="number"
                  step={devletMaas ? Math.round(devletMaas / 30) : 100}
                  value={userSalaries?.[year]?.hasOwnProperty(month) ? kullaniciMaas : devletMaas}
                  onFocus={(e) => {
                    if (e.target === document.activeElement) {
                      e.target.select();
                    }
                  }}
                  onChange={(e) => handleSalaryChange(year, month, e.target.value === "" ? 0 : e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm mb-1"
                />
                {fark !== null && (
                  <div className="text-xs">
                    Fark: {fark.toLocaleString("tr-TR")} TL ({yuzde}% daha az)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    ));
  };

  const handleExportCSV = () => {
    const roleSalaries = salaryData.roles[selectedRole];
    const rows = [[
      "Yıl", "Ay", "Devlet Maaşı", "Kullanıcı Maaşı", "Fark (TL)", "Fark (USD)", "Fark (Altın gr)", "USD Kuru", "Altın Kuru", "Kümülatif Fark (TL)", "Kümülatif Fark (USD)", "Kümülatif Fark (Altın gr)"
    ]];

    let cumulative = 0;
    let cumulativeUSD = 0;
    let cumulativeGold = 0;

    Object.entries(roleSalaries).forEach(([year, monthsObj]) => {
      months.forEach((month) => {
        if (!isMonthActive(year, month, monthsObj)) return;

        const devletMaas = monthsObj[month];
        const kullaniciMaas = Number(userSalaries?.[year]?.[month] ?? devletMaas);
        const fark = devletMaas - kullaniciMaas;
        const kur = endeksData.exchange_rates[year][month];
        const usd = kur.usd_try ? (fark / kur.usd_try) : "";
        const gold = kur.gold_try ? (fark / kur.gold_try) : "";

        cumulative += fark;
        cumulativeUSD += usd || 0;
        cumulativeGold += gold || 0;

        rows.push([
          year,
          month,
          devletMaas,
          kullaniciMaas,
          fark,
          usd ? usd.toFixed(2) : "",
          gold ? gold.toFixed(2) : "",
          kur.usd_try || "",
          kur.gold_try || "",
          cumulative,
          cumulativeUSD ? cumulativeUSD.toFixed(2) : "",
          cumulativeGold ? cumulativeGold.toFixed(2) : ""
        ]);
      });
    });

    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${selectedRole.replace(/ /g, "_")}_maas_karsilastirma.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
<div className="p-4 max-w-7xl mx-auto min-h-screen">
            
            <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Öğretmen Sendikası Vakıf Üniversiteleri Birimi</h1>
          <h4 className="text-3xl  mt-2">2020-2026 Vakıf Üniversiteleri Eksik Ödenen Maaşları Hesaplama Robotu</h4>
        </div>
        <div>
          <button
            onClick={() => setShowInfo((prev) => !prev)}
            className="text-xl border border-gray-300 px-2 py-1 rounded hover:bg-gray-100"
          >
            ❓
          </button>
        </div>
      </div>
{showInfo && (
  <div className="mb-6 border border-gray-300 bg-white p-4 rounded shadow max-w-[90vw] w-full sm:w-[600px]">
    <p className="mb-2 font-medium">Nasıl Hesaplanır?</p>
    <ol className="list-decimal pl-4 space-y-2 text-sm">
      <li>Çıplak maaşınızı bilmeniz gerekir. Çıplak maaş, dil tazminatı, makam tazminatı ve ek ders gibi ödenekler çıkarılarak hesaplanır.</li>
      <li>Eğer net maaşınızı bilmiyorsanız, e-Devlet üzerinden SGK 4A hizmet dökümünüzdeki maaşı 0,83 ile çarparak yaklaşık bir değere ulaşabilirsiniz. Bu değerden de yine varsa ek ödenekleri çıkarmanız gerekir.</li>
      <li>SGK 4A hizmet dökümünde her ay farklı ücretler olabilir. Şubat–Temmuz ve Eylül–Aralık arasında en düşük olanları seçip 0,83 ile çarpabilirsiniz.</li>
      <li>SGK dökümündeki maaş ile net maaş arasında büyük fark varsa, çalıştığınız üniversite vergi muafiyeti sağlayan akademik bordro kullanmıyor olabilir. Bu durumda bizimle iletişime geçebilirsiniz.</li>
    </ol>
  </div>
)}



      <div className="flex flex-wrap gap-4 mb-8">
        <div className="w-[140px] border p-3 rounded-lg shadow-sm text-sm flex flex-col items-center">
          <div className="text-2xl">💰</div>
          <div className="font-semibold">TL</div>
          <div className="text-sm">Toplam Fark</div>
          <div className="font-bold">{totalTL.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} TL</div>
        </div>
        <div className="w-[140px] border p-3 rounded-lg shadow-sm text-sm flex flex-col items-center">
          <div className="text-2xl">💵</div>
          <div className="font-semibold">USD</div>
          <div className="text-sm">Toplam Fark</div>
          <div className="font-bold">{totalUSD.toFixed(2)} $</div>
        </div>
        <div className="w-[140px] border p-3 rounded-lg shadow-sm text-sm flex flex-col items-center">
          <div className="text-2xl">🥇</div>
          <div className="font-semibold">Altın</div>
          <div className="text-sm">Toplam Fark</div>
          <div className="font-bold">{totalGold.toFixed(2)} gr</div>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-4 mb-6">
  <div>
    <label className="block mb-2">Akademik Unvan Seçin:</label>
    <select value={selectedRole} onChange={handleRoleChange} className="p-2 border border-gray-300 bg-white text-gray-800 rounded">
      {Object.keys(salaryData.roles).map((role) => (
        <option key={role} value={role}>{role}</option>
      ))}
    </select>
  </div>
  <div className="flex gap-4">
    <button
      onClick={handleExportCSV}
      className="px-4 py-2 bg-blue-100 text-blue-800 border border-blue-300 rounded hover:bg-blue-200"
    >
      CSV Dışa Aktar
    </button>
    <button
      onClick={() => {
        localStorage.removeItem(localStorageKey);
        localStorage.removeItem(roleStorageKey);
        setUserSalaries({});
        recalculateTotals({});
      }}
      className="px-4 py-2 bg-red-100 text-red-800 border border-red-300 rounded hover:bg-red-200"
    >
      Verileri Sıfırla
    </button>
  </div>
</div>

      {renderSalaryTable()}
    </div>
  );
}
