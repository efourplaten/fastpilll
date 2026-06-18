const pool = require('../config/database');

const clearEczaneler = async () => {
    try {
        await pool.query('TRUNCATE pharmacies CASCADE;');
        console.log('✅ Eczaneler tablosu başarıyla temizlendi!');
    } catch (error) {
        console.error('Hata:', error.message);
    } finally {
        process.exit();
    }
};

clearEczaneler();
