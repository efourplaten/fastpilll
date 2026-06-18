require('dotenv').config({ path: 'src/.env' });
const pool = require('../config/database');

async function fixPrices() {
    console.log('Fiyat düzeltme işlemi başlıyor...');
    try {
        const ilaclar = await pool.query('SELECT id FROM medicines');
        let guncellenenStokSayisi = 0;

        for (const ilac of ilaclar.rows) {
            // İlacın ID'sine göre 150 TL ile 350 TL arasında sabit bir baz fiyat belirle
            const bazFiyat = (ilac.id * 20) % 200 + 150;

            const stoklar = await pool.query('SELECT id FROM pharmacy_stock WHERE medicine_id = $1', [ilac.id]);

            for (const stok of stoklar.rows) {
                // Eczaneler arası fiyat farkı maksimim ±%10 (veya ±5 TL) olsun
                const varyasyon = bazFiyat * (Math.random() * 0.2 - 0.1);
                let yeniFiyat = (bazFiyat + varyasyon).toFixed(2);

                await pool.query(
                    'UPDATE pharmacy_stock SET fiyat = $1 WHERE id = $2',
                    [yeniFiyat, stok.id]
                );
                guncellenenStokSayisi++;
            }
        }
        console.log(`Fiyat düzeltme tamamlandı! Toplam ${guncellenenStokSayisi} stok kaydının fiyatı güncellendi.`);
    } catch (error) {
        console.error('Fiyat güncellenirken hata oluştu:', error);
    } finally {
        pool.end();
    }
}

fixPrices();
