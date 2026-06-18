const pool = require('../config/database');

// Bu dosya veritabanındaki `kullanicilar` tablosuna eczaneleri ve yetkileri 
// ayırabilmek için gerekli olan kolonları ekler.
(async () => {
    try {
        await pool.query(`
            ALTER TABLE kullanicilar 
            ADD COLUMN IF NOT EXISTS rol VARCHAR(50) DEFAULT 'hasta',
            ADD COLUMN IF NOT EXISTS eczane_id INTEGER REFERENCES pharmacies(id) ON DELETE SET NULL;
        `);
        console.log('Veritabanı güncellendi: rol ve eczane_id kolonları eklendi.');
    } catch (e) {
        console.error('Veritabanı güncellenirken hata:', e);
    } finally {
        process.exit();
    }
})();
