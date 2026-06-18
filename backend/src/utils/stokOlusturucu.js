const pool = require('../config/database');

const yeniEczaneyeStokEkle = async (pharmacyId) => {
  const ilaclar = await pool.query('SELECT id FROM medicines');
  for (const ilac of ilaclar.rows) {
    const stokuKontrolEt = Math.random() > 0.3; // %70 ihtimalle stok var, %30 ihtimalle stok yok

    if (stokuKontrolEt) {
      const miktar = Math.floor(Math.random() * 50) + 1;

      // İlacın ID'sine göre 150 TL ile 350 TL arasında sabit bir baz fiyat belirle
      const bazFiyat = (ilac.id * 20) % 200 + 150;
      // Eczaneler arası fiyat farkı maksimim ±%10 olsun
      const varyasyon = bazFiyat * (Math.random() * 0.2 - 0.1);
      const fiyat = (bazFiyat + varyasyon).toFixed(2);

      await pool.query(
        `INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, miktar, fiyat)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (pharmacy_id, medicine_id) DO NOTHING`,
        [pharmacyId, ilac.id, miktar, fiyat]
      );
    }
  }
};
module.exports = { yeniEczaneyeStokEkle };