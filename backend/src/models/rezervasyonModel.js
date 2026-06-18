const pool = require('../config/database');

const rezervasyonOlustur = async(userId,pharmacyId,medicineId) => {
    const result = await pool.query(
        `INSERT INTO reservations (user_id, pharmacy_id, medicine_id, durum, expires_at)
         VALUES ($1, $2, $3, 'beklemede', NOW() + INTERVAL '24 hours')
         RETURNING *`,
        [userId, pharmacyId, medicineId]
    );
    return result.rows[0];
};

const kullaniciRezervasyonlari= async(userId) => {
    const result = await pool.query(
        `SELECT r.id, r.durum, r.created_at, r.expires_at,
                p.ad AS eczane_adi, p.adres AS eczane_adres,
                m.ad AS ilac_adi, m.etken_madde
         FROM reservations r
         JOIN pharmacies p ON r.pharmacy_id = p.id
         JOIN medicines m ON r.medicine_id = m.id
         WHERE r.user_id = $1
         ORDER BY r.created_at DESC`,
        [userId]
    )
    return result.rows;
};

const rezervasyonIptal = async(rezervasyonId, userId) => {
    const result = await pool.query(
        `UPDATE reservations 
         SET durum = 'iptal'
         WHERE id = $1 AND user_id = $2 AND durum = 'beklemede'
         RETURNING *`,
        [rezervasyonId, userId]
    );
    return result.rows[0];
};

module.exports = {rezervasyonOlustur, kullaniciRezervasyonlari, rezervasyonIptal};
