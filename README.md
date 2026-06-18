# FastPill - Konum Tabanlı Eczane ve İlaç Rezervasyon Sistemi

##  Proje Hakkında
**FastPill**, hastaların konumlarına en yakın eczaneleri bulmasını, aradıkları ilacın hangi eczanede stokta olduğunu harita üzerinden görmesini ve eczaneye gitmeden ilacı ayırtmasını sağlayan akıllı bir platformdur. Aynı zamanda eczanelerin kendi stoklarını yönetebildiği ve gelen rezervasyon taleplerini kolayca cevaplayabildiği gelişmiş bir yönetim sistemidir.

##  Temel Özellikler

###  Hastalar İçin
- **Konum Tabanlı Eczane Arama:** Harita üzerinde (PostGIS destekli) çevrenizdeki açık eczaneleri anında görüntüleme.
- **Akıllı İlaç Sorgulama:** Aradığınız ilacın size en yakın hangi eczanelerde stokta olduğunu bulma.
- **İlaç Rezervasyonu (Ayırtma):** İlacı uygulama üzerinden rezerve ederek eczanede bitme riskini ortadan kaldırma.
- **Nöbetçi Eczaneler:** Saat 22:00 - 08:00 arası dinamik olarak güncellenen nöbetçi eczaneleri haritada filtreleme.

###  Eczaneler İçin
- **Dashboard (Kontrol Paneli):** Bekleyen, onaylanan ve iptal edilen rezervasyon istatistiklerini tek ekrandan görme.
- **Stok Yönetimi:** İlaç fiyatlarını, stok miktarlarını anında güncelleme ve sisteme yeni ilaç ekleme.
- **Rezervasyon Yönetimi:** Hastalardan gelen ayırtma taleplerini anlık olarak onaylama veya reddetme.

##  Kullanılan Teknolojiler
- **Mobil Uygulama (Frontend):** React Native, Expo, React Navigation, React Native Maps
- **Sunucu (Backend):** Node.js, Express.js
- **Veritabanı:** PostgreSQL, **PostGIS** (Mekansal sorgular, ST_Distance ile mesafe hesaplamaları)
- **Kimlik Doğrulama & Güvenlik:** JWT (JSON Web Token), bcrypt
- **Harita & Konum Servisleri:** Google Places API

##  Kurulum Adımları

### Gereksinimler
- Node.js
- PostgreSQL & PostGIS eklentisi
- Expo CLI

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/efourplaten/fastpilll.git
cd fastpilll
```

### 2. Backend Kurulumu
```bash
cd backend
npm install
```
Ana dizinde bir `.env` dosyası oluşturun ve PostgreSQL veritabanı ile Google API key bilgilerinizi girin. Daha sonra sunucuyu başlatın:
```bash
npm start
```

### 3. Mobil Kurulumu
Yeni bir terminal açın ve mobil klasörüne girin:
```bash
cd mobil
npm install
npx expo start
```
Expo Go uygulaması ile QR kodu okutarak uygulamayı telefonunuzda test edebilirsiniz.

##  Güvenlik Notu
Bu projede kullanıcı şifreleri `bcrypt` ile tuzlanarak hashlenir ve güvenli JWT altyapısıyla korunur. Kritik ortam değişkenleri (.env dosyaları) `.gitignore` aracılığıyla korunmuştur ve açık kaynak kodda paylaşılmaz.

---
** Geliştirici:** Efe Yalçın 
