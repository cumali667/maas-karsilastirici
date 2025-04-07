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
- [`endeks.json`](https://github.com/Rhinoffensive/maas-karsilastirici/blob/main/src/data/endeks.json) → 2020–2025 arası aylık USD/TRY ve Gram Altın/TRY döviz kuru verileri.

Veriler gerçek döviz/altın verileriyle hazırlanmıştır.

---

### 🧲 Nasıl Kullanılır?

1. Sayfadan **akademik unvanınızı** seçin.
2. Her ay için **gerçek maaşınızı** girin.
3. TL, USD ve Altın bazında oluşan farkları üst kısımda görebilirsiniz.
4. Hesaplamaları **CSV olarak dışa aktarabilir** ya da sıfırlayabilirsiniz.
5. Maaş hesaplamak için çıplak ücretinizi bilmeniz gerekmektedir. Çıplak ücret ödeneklerin çıkarılması ile belirlenir. Örneğin dil tazminatınız veya makam tazminatınız, ek ders ücretiniz varsa yatan maaşınızdan çıkarılması gerekir.
6. Eğer yatan ücretinizi bilmiyorsanız ya da hatırlamıyorsanız e devlet SGK 4a hizmet dökümünüzdeki ücreti 0,83 ile çarpıp yaklaşık bir sayıya ulaşırsınız. Yine bu ücretten dil tazminatı ek ders ve makam tazminatı çıkarılmalıdır. SGK 4a hizmet dökümünde her ay değişen birden fazla sayı olabilir. Bu durumda şubat temmuz arasında en az olanını ve eylül aralık arasındaki en az olanını seçip 0,83 ile çarpın (Yılda 2 kere zam aldığımız için).
7. Eğer net ücretiniz ile SGK Hizmet Dökümünde yazan ücret arasında yüksek bir fark varsa yani o üniversitede vergi muafiyeti sağlayan akademik bordro yoktur. Bu durumda bizden yardım isteyebilirsiniz.

---

### 🚀 Yayın

Proje GitHub Pages üzerinden canlı olarak yayınlanabilir:\
📈 [https://rhinoffensive.github.io/maas-karsilastirici](https://rhinoffensive.github.io/maas-karsilastirici)



