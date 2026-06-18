const pool = require('../config/database'); //database bağlantısını alır
const kullaniciOlustur = async (ad, soyad, email, telefon, sifreHash) => {
    const result = await pool.query(
        'INSERT INTO kullanicilar (ad, soyad, email, telefon, sifre_hash) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [ad, soyad, email, telefon, sifreHash]
    );
    return result.rows[0];
}//kullanici oluşturur ve oluşturulan kullanıcıyı döndürür


const kullaniciBulMail = async (email) => {
    const result = await pool.query(
        'SELECT * FROM kullanicilar WHERE email = $1',
        [email]
    );
    return result.rows[0];
}; //email ile kullanıcıyı bulur ve bulunan kullanıcıyı döndürür
module.exports = { kullaniciOlustur, kullaniciBulMail }; //kullaniciOlustur ve kullaniciBulMail fonksiyonlarını dışa aktarır