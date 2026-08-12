## 🎓 Devlet ve Vakıf Üniversitesi Maaş Karşılaştırıcı

Bu proje, **2020 Mayıs** ayından itibaren Türkiye’deki **vakıf üniversitelerinde** çalışan akademisyenlerin maaşlarını, **devlet üniversiteleriyle** karşılaştırmak amacıyla geliştirilmiştir.

---

### 🔍 Amaç

2020 Nisan ayında devlet tarafından vakıf ve devlet üniversitelerinde çalışan öğretim görevlileri için **maaş eşitlemesi** yapılması planlanmıştı. Ancak vakıf üniversitelerinde bu uygulama **gecikmeli** olarak hayata geçti. Bu durum, vakıf üniversitelerinde çalışan akademisyenler için **hak kayıplarına** neden oldu.

Bu araç, kullanıcıların kendi maaş verilerini girerek oluşan farkı:

- **Türk Lirası (TL)**
- **Amerikan Doları (USD)**
- **Gram Altın (XAU)**

cinsinden görmelerini sağlar.

---

### 📁 Veriler

Kullanılan maaş ve piyasa verileri `src/data/` klasöründe yer almaktadır:

- [`maaslar.json`](https://github.com/Rhinoffensive/maas-karsilastirici/blob/main/src/data/maaslar.json) → Devlet üniversitelerindeki akademik pozisyonlara göre aylık maaşlar.
- [`endeks.json`](https://github.com/Rhinoffensive/maas-karsilastirici/blob/main/src/data/endeks.json) → 2020–2026 arası aylık USD/TRY ve Gram Altın/TRY döviz kuru verileri.

Veriler gerçek döviz/altın verileriyle hazırlanmıştır. `endeks.json` elle düzenlenmez;
`node scripts/build-endeks.mjs` ile ham CSV'lerden üretilir. 2020-02 – 2025-03 aralığı
investing.com aylık dışa aktarımlarından, 2025-04 – 2026-07 aralığı ise
`market-rates-2025-04_2026-07.csv` dosyasından gelir (kaynak ve yöntem scriptin
başındaki açıklamada belirtilmiştir).

Tüm aylar ay sonu kapanışıdır. 2025 Nisan bir istisnaydı: investing.com dosyası
04.04.2025'te indirildiği için o ay yalnızca ilk 4 günü yansıtıyordu; ay sonu
kapanışıyla düzeltildi.

---

### 🧲 Nasıl Kullanılır?

1. Sayfadan **akademik unvanınızı** seçin.
2. Her ay için **gerçek maaşınızı** girin.
3. TL, USD ve Altın bazında oluşan farkları üst kısımda görebilirsiniz.
4. Hesaplamaları **CSV olarak dışa aktarabilir** ya da sıfırlayabilirsiniz.

---

### 🚀 Yayın

Proje GitHub Pages üzerinden canlı olarak yayınlanabilir:\
📈 [https://rhinoffensive.github.io/maas-karsilastirici](https://rhinoffensive.github.io/maas-karsilastirici)



