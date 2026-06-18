const pool = require('../config/database');

const ilacAra = async(ilacAdi) => {
    const result = await pool.query(`SELECT * FROM medicines 
         WHERE ad ILIKE $1 OR etken_madde ILIKE $1
         ORDER BY ad`,
        [`%${ilacAdi}%`]
    );
    return result.rows;
}; // İlaç adında veya etken maddesinde arama yapar, sonuçları ada göre sıralar

const eczaneStokGetir = async(pharmacyId) => {
    const result = await pool.query(`SELECT ps.id AS stok_id, ps.miktar, ps.fiyat,
                m.id AS ilac_id, m.ad AS ilac_adi, m.etken_madde, m.kategori
         FROM pharmacy_stock ps
         JOIN medicines m ON ps.medicine_id = m.id
         WHERE ps.pharmacy_id = $1
         ORDER BY m.ad`,
        [pharmacyId]
    );
    return result.rows;
}; // Belirli bir eczanenin stok bilgilerini getirir, ilaç adına göre sıralar

const ilacBulunurluk = async(ilacId, lat, lng) => {
    const result = await pool.query(
        `SELECT p.id, p.ad, p.adres, p.telefon, p.latitude, p.longitude,
                ps.miktar, ps.fiyat,
                ST_Distance(
                    p.location,
                    ST_SetSRID(ST_MakePoint($3, $2), 4326)::geography
                ) AS mesafe_metre
         FROM pharmacy_stock ps
         JOIN pharmacies p ON ps.pharmacy_id = p.id
         WHERE ps.medicine_id = $1 AND ps.miktar > 0
         ORDER BY mesafe_metre
         LIMIT 20`,
        [ilacId, lat, lng]
    );
    return result.rows;
}; // Belirli bir ilacın bulunduğu eczaneleri, kullanıcının konumuna göre mesafeye göre sıralar ve ilk 20 sonucu döndürür

module.exports = {
    ilacAra,
    eczaneStokGetir,
    ilacBulunurluk
};