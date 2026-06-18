const pool = require('../config/database');
const bcrypt = require('bcrypt');

// Bu dosya, veritabanındaki eczaneleri tarar ve her birine otomatik
// bir admin hesabı açar. Eğer isimler çakışırsa sonuna eczane IDsini ekler.
(async () => {
    try {
        const eczaneler = await pool.query('SELECT id, ad FROM pharmacies');
        let hesapSayisi = 0;

        for (const eczane of eczaneler.rows) {
            // Eczane ismini mail formatına uygun hale getir
            const temizAd = eczane.ad.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
            let email = `${temizAd}@fastpill.com`;

            // Eğer bu e-posta daha önce kullanılmışsa sonuna eczane id'sini ekleyerek benzersiz yap
            const emailVarMi = await pool.query('SELECT id FROM kullanicilar WHERE email = $1', [email]);
            if (emailVarMi.rows.length > 0) {
                email = `${temizAd}${eczane.id}@fastpill.com`;
            }

            const sifreHash = await bcrypt.hash('123456', 10);

            // Bu eczane için zaten hesap açılmış mı kontrol et
            const varMi = await pool.query('SELECT id FROM kullanicilar WHERE eczane_id = $1', [eczane.id]);
            if (varMi.rows.length === 0) {
                await pool.query(
                    `INSERT INTO kullanicilar (ad, soyad, email, sifre_hash, rol, eczane_id) 
                     VALUES ($1, $2, $3, $4, 'eczane', $5)`,
                    [eczane.ad, 'Yetkilisi', email, sifreHash, eczane.id]
                );
                console.log(`Eczane Hesabı oluşturuldu: ${eczane.ad} -> ${email} | Şifre: 123456`);
                hesapSayisi++;
            }
        }
        console.log(`Toplam ${hesapSayisi} yeni eczane hesabı oluşturuldu.`);
    } catch (e) {
        console.error('Hata:', e);
    } finally {
        process.exit();
    }
})();
