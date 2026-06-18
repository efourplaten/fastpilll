### server.js = 
uygulama serverini ayağa kaldıran dosya 'helmet, cors,morgan' yüklendiğimiz 
ve rotaların expresse bağlandığı ana giriş noktasıdır
### database.js = 
veritabanı bağlantı durumunu kontrol eden çalışıyor mu hata mı veriyor sonucunu verir
### src/middleware/authMiddleware.js = 
istekteki JWT token'ini doğrulayarak güvenli rotalara erişim izni verir
### googleServices/googlePlacesService.js =
Eczane arama, kaydetme ve PostGIS location tipinde coğrafi koordinat yerleştirme sorguları.
### src/utils/stokOlusturucu.js = 
Sisteme ilk kez eklenen eczanelere sahte stoklar (miktar 1-50, fiyat 10-210 TL arası) tanımlar.

### src/models/userModel.js = 
Kullanıcı kayıt ve e-posta tabanlı arama sorguları.
### src/models/eczanemodel.js = 
Eczane arama, kaydetme ve PostGIS location tipinde coğrafi koordinat yerleştirme sorguları.
### src/models/ilacModel.js = 
İlaç arama ve ilacın bulunduğu eczaneleri PostGIS coğrafi mesafe fonksiyonu ST_Distance kullanarak en yakından en uzağa doğru sıralama sorguları.
### src/models/rezervasyonModel.js = 
Rezervasyon oluşturma, iptal durumuna güncelleme ve kullanıcının geçmiş rezervasyonlarını birleştirme (JOIN) sorguları.

### src/controllers/authController.js = 
Şifrelerin bcrypt ile tuzlanarak hashlenmesi, e-posta kontrolleri ve 24 saat geçerli JWT token üretimi.
### src/controllers/eczaneController.js = 
Haritadan gelen koordinatlarla Google'dan eczaneleri çeker, veritabanına cache'ler 
ve saat 22:00 - 08:00 arası için her gece deterministik olarak değişen nöbetçi eczaneler belirler.
### src/controllers/ilacController.js = 
İlaç arama ve ilaçların yakındaki eczanelerdeki konum bazlı bulunurluklarını yönetir.
### src/controllers/rezervasyonController.js = 
Rezervasyonların eklenmesi, listelenmesi ve iptali gibi süreçlerin kontrolünü sağlar.

### src/routes/authRoutes.js = 
kayıt ve giris endpointlerini oluşturur
### src/routes/eczaneRoutes.js = 
yakineczaneler, eczanedetay ve eczanestok endpointleri oluşturur.
### src/routes/ilacRoutes.js
ilac arama, belirli ilacın bulunduğu eczane endpointi oluşturur.
### src/routes/rezervasyonRoutes.js = 
rezervasyon oluşturma, görüntüleme ve iptal etme endpointlerini oluşturur.

### POST api /api/auth/register
### POST api /api/auth/login
### GET api /api/eczaneler/yakin
### GET api /api/eczaneler/:id/detay
### GET api /api/eczaneler/:id/stok
### GET api /api/ilaclar/ara
### GET api /api/ilaclar/:id/eczaneler
### POST api /api/rezervasyonlar/olustur
### GET api /api/rezervasyonlar/benim
### PATCH api /api/rezervasyonlar/:id/iptal

### constans/colors.js =
renk sabitleri
### constans/api.js =
backend endpoint url sabitleri
### services/api.js = 
DRY (kendini tekrar etme) prensibini uygulayan, kimlik doğrulama işlemini merkezileştiren bir yapıdır.

### src/context/AuthContext.js =
Uygulama genelinde kullanıcı oturum (JWT) durumunu ve rolünü tutan global state dosyası.

### src/navigation/AppNavigator.js =
Kullanıcının rolüne (Hasta veya Eczane) göre doğru navigasyon akışını başlatan ana yönlendirici.

### src/navigation/AuthNavigator.js =
Giriş yapmamış kullanıcılar için Kayıt Ol / Giriş Yap sayfalarının yönlendirmesini sağlar.

### src/navigation/TabNavigator.js =
Hasta rolündeki kullanıcılar için alt menüyü (Harita, Arama, Rezervasyonlar, Profil) oluşturur.

### src/navigation/EczaneTabNavigator.js =
Eczane rolündeki kullanıcılar için alt menüyü (Dashboard, Stok, Rezervasyonlar, Profil) oluşturur.

### src/components/GirisGerekli.js =
Kayıt dışı kullanıcılar özel sayfalara girmek istediğinde onları Login'e yönlendiren uyarı bileşenidir.

### src/screens/LoginScreen.js & RegisterScreen.js =
Kullanıcı ve Eczanelerin sisteme kayıt olup JWT token alarak giriş yaptıkları arayüzler.

### src/screens/MapScreen.js =
Hastanın GPS konumunu alıp, yakındaki nöbetçi ve normal eczaneleri harita üzerinde pinlerle gösteren ekran.

### src/screens/SearchScreen.js =
Hastaların ilaç aratıp, o ilacın stokta olduğu eczanelerden rezervasyon (ayırtma) oluşturduğu ekran.

### src/screens/RezervationsScreen.js =
Hastaların beklemede olan veya geçmiş rezervasyonlarını listelediği ve iptal edebildiği ekran.

### src/screens/ProfileScreen.js =
Hastaların ve Eczanelerin iletişim ve şifre bilgilerini güncellediği hesap yönetimi ekranı.

### src/screens/eczane/EczaneDashboard.js =
Eczaneye bekleyen, onaylanan ve iptal olan rezervasyon istatistiklerini hızlıca sunan özet ana ekranı.

### src/screens/eczane/EczaneStok.js =
Eczanelerin ilaç miktarlarını ve fiyatlarını güncellediği veya yeni ilaç eklediği stok yönetim ekranı.

### src/screens/eczane/EczaneRezervasyonlar.js =
Eczanelerin hastalardan gelen rezervasyon taleplerini görüp "Onayla" veya "Reddet" işlemlerini yaptığı ekran.
