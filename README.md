# fx-SMART Gelişmiş Bilimsel Hesap Makinesi

fx-SMART, klasik bilimsel hesap makinesi (fx-991 tarzı) tuş takımını modern 2D/3D grafik çizim motoru, yerel tarayıcı hafızası ve Google Gemini 2.0 destekli yapay zeka soru çözücü ile birleştiren gelişmiş bir web uygulamasıdır.

## 🚀 Özellikler

1. **COMP (Hesap Makinesi):**
   - Gelişmiş bilimsel fonksiyonlar (sin, cos, tan, log, ln, x!, mod, e, π).
   - Ters trigonometrik fonksiyonlar (sin⁻¹, cos⁻¹, tan⁻¹).
   - DEG (Derece) ve RAD (Radyan) açı modları.
   - STO modu ile A, B, C, M hafıza değişkenlerine değer atama.
   - Canlı işlem önizleme ekranı.

2. **HIST (Geçmiş):**
   - Tarayıcı yerel hafızasında (localStorage) saklanan son 100 işlemin detaylı dökümü.
   - Tekil işlem silme veya tüm geçmişi temizleme seçeneği.

3. **MEM (Hafıza):**
   - A, B, C, M ve Ans (Son Sonuç) değişkenlerinin anlık değerlerini görüntüleme.
   - Değişken değerlerini doğrudan düzenleme veya sıfırlama.

4. **GRAPH (Grafik Çizici):**
   - **2D Grafik:** Aynı anda 6 adede kadar fonksiyonu farklı renklerle çizdirme, görünürlüklerini açıp kapatma.
   - **Türev ve İntegral Katmanları:** Çizilen fonksiyonların türev (f'(x)) ve integral (∫f(x)) eğrilerini anlık olarak grafik üzerinde gösterme.
   - **3D Yüzey:** İki değişkenli z = f(x,y) fonksiyonlarını (örn: `sin(sqrt(x^2 + y^2))`) 3 boyutlu interaktif yüzey olarak çizdirme.

5. **SOLVE (AI Çözücü):**
   - Google Gemini 2.0 (gemini-2.0-flash) destekli yapay zeka çözücü.
   - Yazılı soru sorma, görsel yükleme veya mobil kamera ile soru fotoğrafı çekme.
   - Adım adım, Türkçe açıklamalı detaylı çözüm dökümü.

## 🛠️ Teknoloji Yığını

- **Framework:** Next.js 14 (App Router) + TypeScript
- **CSS:** Tailwind CSS (Koyu tema, turuncu vurgu renkleri)
- **Matematik Motoru:** mathjs (Sembolik türev ve gelişmiş matematiksel ayrıştırma)
- **Grafik Kütüphanesi:** Plotly.js (SSR uyumlu dinamik yükleme ile)
- **Yapay Zeka:** @google/generative-ai SDK (Gemini 2.0 Flash)

## 💻 Kurulum ve Çalıştırma (Termux / Yerel)

1. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

2. **Çevre Değişkenlerini Ayarlayın:**
   `.env.example` dosyasını `.env.local` olarak kopyalayın ve Gemini API anahtarınızı ekleyin:
   ```bash
   cp .env.example .env.local
   ```
   `.env.local` dosyasını düzenleyerek `GEMINI_API_KEY` değerini girin:
   ```env
   GEMINI_API_KEY=AIzaSy... (Kendi anahtarınız)
   ```

3. **Geliştirme Sunucusunu Başlatın:**
   ```bash
   npm run dev
   ```
   Uygulamaya tarayıcınızdan `http://localhost:3000` adresinden erişebilirsiniz.

4. **Üretim Derlemesini Alın:**
   ```bash
   npm run build
   ```

## ☁️ Vercel Dağıtımı

Uygulamayı Vercel'e dağıtırken:
1. GitHub deponuzu Vercel'e bağlayın.
2. Vercel Proje Ayarlarında **Environment Variables** (Çevre Değişkenleri) bölümüne gidin.
3. İsim olarak `GEMINI_API_KEY` girin ve değer olarak Google AI Studio'dan aldığınız API anahtarını yapıştırın.
4. Dağıtımı (Deploy) başlatın. Vercel otomatik olarak derleyip yayına alacaktır.