const ilacModel = require('../models/ilacModel');

const ilacAra = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ hata: 'Arama metni gereklidir.' });
        }
        const ilaclar = await ilacModel.ilacAra(q);
        res.json({ ilaclar });
    } catch (error) {
        res.status(500).json({ hata: +'hata :' + error.message });
    }
}; // İlaç arama endpoint'i, ilaç adında veya etken maddesinde arama yapar

const eczaneStok = async (req, res) => {
    try {
        const { id } = req.params;
        const stoklar = await ilacModel.eczaneStokGetir(id);
        res.json({ stoklar });
    } catch (error) {
        res.status(500).json({ hata: 'hata :' + error.message });
    }
}; // Belirli bir eczanenin stok bilgilerini getirir

const ilacBulunurluk = async (req, res) => {
    try {
        const { id } = req.params;
        const { lat, lng } = req.query;
        if(!lat || !lng){
            return res.status(400).json({ hata: 'Enlem ve boylam bilgisi gereklidir.' });
        }
        const eczaneler = await ilacModel.ilacBulunurluk(id, parseFloat(lat), parseFloat(lng));
        res.json({ eczaneler });
    } catch (error) {
        res.status(500).json({ hata: 'hata :' + error.message });
    }
}; // Belirli bir ilacın bulunduğu eczaneleri, kullanıcının konumuna göre mesafeye göre sıralar ve ilk 20 sonucu döndürür

module.exports = {
    ilacAra,
    eczaneStok,
    ilacBulunurluk
};