const pool = require('../config/database');
const bcrypt = require('bcrypt');

const eczaneAdminHesabiOlustur = async (eczaneId, eczaneAd) => {
    try {
        // Zaten hesabı var mı kontrol et
        const varMi = await pool.query('SELECT id FROM kullanicilar WHERE eczane_id = $1', [eczaneId]);
        if (varMi.rows.length > 0) return; // Zaten hesabı var

        // Eczane ismini mail formatına uygun hale getir
        const temizAd = eczaneAd.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
        let email = `${temizAd}@fastpill.com`;

        // Eğer bu e-posta daha önce kullanılmışsa sonuna eczane id'sini ekleyerek benzersiz yap
        const emailVarMi = await pool.query('SELECT id FROM kullanicilar WHERE email = $1', [email]);
        if (emailVarMi.rows.length > 0) {
            email = `${temizAd}${eczaneId}@fastpill.com`;
        }

        const sifreHash = await bcrypt.hash('123456', 10);

        // Hesabı oluştur
        await pool.query(
            `INSERT INTO kullanicilar (ad, soyad, email, sifre_hash, rol, eczane_id) 
             VALUES ($1, $2, $3, $4, 'eczane', $5)`,
            [eczaneAd, 'Yetkilisi', email, sifreHash, eczaneId]
        );
        console.log(`📍 Yeni Eczane Bulundu! Otomatik Hesap Açıldı: ${eczaneAd} -> ${email} | Şifre: 123456`);
    } catch (error) {
        console.error('Otomatik eczane hesabı açılırken hata oluştu:', error);
    }
};

module.exports = { eczaneAdminHesabiOlustur };
