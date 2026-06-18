const pool = require('../config/database');

// 1. Eczaneye ait rezervasyonları getir
const getRezervasyonlar = async (req, res) => {
    try {
        const eczaneId = req.user.eczane_id;
        if (!eczaneId) return res.status(403).json({ hata: 'Eczane yetkiniz yok.' });

        const result = await pool.query(`
            SELECT r.*, u.ad as kullanici_ad, u.soyad as kullanici_soyad, u.telefon as kullanici_telefon, m.ad as ilac_adi
            FROM reservations r
            JOIN kullanicilar u ON r.user_id = u.id
            JOIN medicines m ON r.medicine_id = m.id
            WHERE r.pharmacy_id = $1
            ORDER BY r.created_at DESC
        `, [eczaneId]);

        res.json({ rezervasyonlar: result.rows });
    } catch (error) {
        console.error("ADMIN REZERVASYON HATA:", error);
        res.status(500).json({ hata: error.message });
    }
};

// 2. Rezervasyonu Onayla ve Stoktan Düş
const onaylaRezervasyon = async (req, res) => {
    try {
        const { id } = req.params;
        const eczaneId = req.user.eczane_id;

        // Önce rezervasyonun hangi ilaca ait olduğunu bul
        const rez = await pool.query('SELECT medicine_id FROM reservations WHERE id = $1 AND pharmacy_id = $2', [id, eczaneId]);
        if (rez.rows.length === 0) return res.status(404).json({ hata: 'Rezervasyon bulunamadı.' });

        const medicineId = rez.rows[0].medicine_id;

        // Rezervasyonu onayla
        await pool.query("UPDATE reservations SET durum = 'Onaylandı' WHERE id = $1", [id]);

        // Stok miktarını 1 azalt (Miktar 0'dan büyükse)
        await pool.query(
            "UPDATE pharmacy_stock SET miktar = miktar - 1 WHERE pharmacy_id = $1 AND medicine_id = $2 AND miktar > 0",
            [eczaneId, medicineId]
        );

        res.json({ mesaj: 'Rezervasyon onaylandı ve stok güncellendi.' });
    } catch (error) {
        res.status(500).json({ hata: error.message });
    }
};

// 3. Rezervasyonu Reddet
const reddetRezervasyon = async (req, res) => {
    try {
        const { id } = req.params;
        const eczaneId = req.user.eczane_id;

        await pool.query("UPDATE reservations SET durum = 'İptal' WHERE id = $1 AND pharmacy_id = $2", [id, eczaneId]);
        res.json({ mesaj: 'Rezervasyon reddedildi.' });
    } catch (error) {
        res.status(500).json({ hata: error.message });
    }
};

// 4. Eczane Stoklarını Getir
const getStok = async (req, res) => {
    try {
        const eczaneId = req.user.eczane_id;
        
        const result = await pool.query(`
            SELECT ps.id, ps.miktar, ps.fiyat, m.ad AS ilac_adi, m.etken_madde, ps.medicine_id
            FROM pharmacy_stock ps
            JOIN medicines m ON ps.medicine_id = m.id
            WHERE ps.pharmacy_id = $1
            ORDER BY m.ad ASC
        `, [eczaneId]);

        res.json({ stoklar: result.rows });
    } catch (error) {
        res.status(500).json({ hata: error.message });
    }
};

// 5. Stok veya Fiyat Güncelle
const guncelleStok = async (req, res) => {
    try {
        const { id } = req.params; // pharmacy_stock id
        const { miktar, fiyat } = req.body;
        const eczaneId = req.user.eczane_id;

        await pool.query(
            "UPDATE pharmacy_stock SET miktar = $1, fiyat = $2 WHERE id = $3 AND pharmacy_id = $4",
            [miktar, fiyat, id, eczaneId]
        );

        res.json({ mesaj: 'Stok güncellendi.' });
    } catch (error) {
        res.status(500).json({ hata: error.message });
    }
};

// 6. Sistemdeki Havuzdan Veya Manuel Yeni İlaç Ekle
const ilacEkle = async (req, res) => {
    try {
        const { ad, etken_madde, miktar, fiyat } = req.body;
        const eczaneId = req.user.eczane_id;

        if (!ad || !fiyat || !miktar) {
            return res.status(400).json({ hata: 'İlaç adı, fiyat ve miktar zorunludur.' });
        }

        // Sistemde bu isimde bir ilaç var mı kontrol et
        let medicineId;
        const checkMed = await pool.query('SELECT id FROM medicines WHERE LOWER(ad) = LOWER($1)', [ad.trim()]);
        
        if (checkMed.rows.length > 0) {
            medicineId = checkMed.rows[0].id;
        } else {
            // Yoksa havuza yeni ilaç olarak kaydet
            const insertMed = await pool.query(
                'INSERT INTO medicines (ad, etken_madde, kategori) VALUES ($1, $2, $3) RETURNING id',
                [ad.trim(), etken_madde ? etken_madde.trim() : 'Belirtilmemiş', 'Genel']
            );
            medicineId = insertMed.rows[0].id;
        }

        await pool.query(
            `INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, miktar, fiyat) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (pharmacy_id, medicine_id) 
             DO UPDATE SET miktar = pharmacy_stock.miktar + $3, fiyat = $4`,
            [eczaneId, medicineId, miktar, fiyat]
        );

        res.json({ mesaj: 'İlaç başarıyla eklendi.' });
    } catch (error) {
        res.status(500).json({ hata: error.message });
    }
};

module.exports = { 
    getRezervasyonlar, 
    onaylaRezervasyon, 
    reddetRezervasyon, 
    getStok, 
    guncelleStok,
    ilacEkle
};
