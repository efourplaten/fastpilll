const googlePlaces = require('../googleServices/googlePlacesService');
const eczaneModel = require('../models/eczanemodel');
const stockOlusturucu = require('../utils/stokOlusturucu');
const hesapOlusturucu = require('../utils/hesapOlusturucu');

const yakinEczaneler = async (req, res) => {
    try {
        const { lat, lng, yaricap } = req.query; // İstekten enlem ve boylam bilgilerini alır
        if (!lat || !lng) {
            return res.status(400).json({ hata: 'Enlem ve boylam bilgisi gereklidir.' }); // Enlem veya boylam bilgisi eksikse hata döndürür
        }
        const googleEczaneler = await googlePlaces.yakinEczaneleriBul(
            parseFloat(lat),
            parseFloat(lng),
            parseInt(yaricap) || 3000
        ); // Google Places API'sinden yakın eczaneleri alır
        const sonuclar = [];
        for (const eczane of googleEczaneler) {
            let dbEczane = await eczaneModel.googleidilebul(eczane.id); // Eczaneyi Google Place ID'si ile veritabanında arar
            if (!dbEczane) {
                dbEczane = await eczaneModel.eczaneolustur(
                    eczane.id,
                    eczane.displayName?.text || 'Bilinmeyen Eczane',
                    eczane.formattedAddress || 'Adres bilgisi yok',
                    eczane.nationalPhoneNumber || 'Telefon bilgisi yok',
                    eczane.location.latitude,
                    eczane.location.longitude
                ); // Eczane veritabanında yoksa yeni bir kayıt oluşturur
                await stockOlusturucu.yeniEczaneyeStokEkle(dbEczane.id); // Yeni oluşturulan eczaneye stok ekler
            }

            // Yeni eklenmiş olsun ya da önceden veritabanında bulunsun, hesabı yoksa anında açar
            await hesapOlusturucu.eczaneAdminHesabiOlustur(dbEczane.id, dbEczane.ad);

            // Nöbetçi alanını default false yapalım
            dbEczane.nobetci_mi = false;
            sonuclar.push(dbEczane); // Veritabanındaki eczane bilgilerini sonuç listesine ekler
        }

        // --- NÖBETÇİ SİMÜLASYONU ---
        // Sadece gece (22:00 - 08:00 arası) en yakın 5 eczaneden 1 tane nöbetçi olsun
        const saatSon = new Date().getHours();
        if ((saatSon >= 22 || saatSon < 8) && sonuclar.length > 0) {
            const gun = new Date().getDate(); 
            // Döndürülen eczanelerden ilk 5'i içinden 1 tanesini nöbetçi seçelim ki haritada hep görünsün
            const limit = Math.min(sonuclar.length, 5);
            const nobetciIndex = gun % limit;
            sonuclar[nobetciIndex].nobetci_mi = true;
        }
        res.json({ eczaneler: sonuclar }); // Sonuçları JSON formatında döndürür
    } catch (error) {
        res.status(500).json({ hata: 'hata :' + error.message }); // Hata durumunda 500 hatası döndürür
    }
};

const eczaneDetay = async (req, res) => {
    try {
        const { id } = req.params; // İstekten eczane ID'sini alır
        const eczane = await eczaneModel.idilebul(id); // Eczaneyi ID'si ile veritabanında arar
        if (!eczane) {
            return res.status(404).json({ hata: 'Eczane bulunamadı.' }); // Eczane bulunamazsa 404 hatası döndürür
        }
        res.json({ eczane }); // Eczane bilgilerini JSON formatında döndürür
    } catch (error) {
        res.status(500).json({ hata: 'hata :' + error.message }); // Hata durumunda 500 hatası döndürür
    }
};

module.exports = { yakinEczaneler, eczaneDetay }; // Fonksiyonları dışa aktarır