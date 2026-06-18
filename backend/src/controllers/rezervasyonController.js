const rezervasyonModel = require('../models/rezervasyonModel');

const olustur = async (req, res) => {
    try {
        const userId = req.user.id;
        const { pharmacyId, medicineId } = req.body;
        if (!pharmacyId || !medicineId) {
            return res.status(400).json({ hata: 'Eczane ve ilaç bilgisi gereklidir.' });
        }
        const rezervasyon = await rezervasyonModel.rezervasyonOlustur(userId, pharmacyId, medicineId);
        res.status(201).json({mesaj : 'Rezervasyon başarıyla oluşturuldu.', rezervasyon});
    } catch (error) {
        res.status(500).json({ hata: 'hata :' + error.message });
    }
}; // Yeni bir rezervasyon oluşturur

const benimRezervasyonlarim = async (req, res) => {
    try {
        const userId = req.user.id;
        const rezervasyonlar = await rezervasyonModel.kullaniciRezervasyonlari(userId);
        res.json({ rezervasyonlar });
    } catch (error) {
        res.status(500).json({ hata: 'hata :' + error.message });
    }
}; // Kullanıcının tüm rezervasyonlarını getirir

const iptalEt = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const sonuc = await rezervasyonModel.rezervasyonIptal(id, userId);
        if (!sonuc) {
            return res.status(404).json({ hata: 'Rezervasyon bulunamadı veya zaten iptal edilmiş.' });
        }
        res.json({ mesaj: 'Rezervasyon başarıyla iptal edildi.', rezervasyon: sonuc });
    } catch (error) {
        res.status(500).json({ hata: 'hata :' + error.message });
    }
}; // Belirli bir rezervasyonu iptal eder

module.exports = {olustur, benimRezervasyonlarim, iptalEt};