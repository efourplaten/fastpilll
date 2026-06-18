const bcrypt = require('bcrypt');//bcrypt kütüphanesini içe aktarır, şifreleri hashlemek için kullanılır
const jwt = require('jsonwebtoken'); //JWT kütüphanesini içe aktarır, JSON Web Token oluşturmak ve doğrulamak için kullanılır
const userModel = require('../models/userModel');
const pool = require('../config/database');

const kayitOl = async (req, res) => {
    try {
        const { ad, soyad, email, telefon, sifre } = req.body;

        const sifreHash = await bcrypt.hash(sifre, 10);

        const user = await userModel.kullaniciOlustur(ad, soyad, email, telefon, sifreHash);

        res.status(201).json({
            mesaj: 'Kayit basarili',
            user: { id: user.id, ad: user.ad, email: user.email }
        });
    } catch (err) {
        res.status(400).json({ hata: 'Kayit hatasi: ' + err.message });
    }
}; //Kayıt işlemi yapar, gelen şifreyi hashler, kullanıcıyı oluşturur ve başarılı mesajı ile birlikte kullanıcı bilgilerini döner

const girisYap = async (req, res) => {
    try {
        const { email, sifre } = req.body;

        const user = await userModel.kullaniciBulMail(email);
        if (!user) {
            return res.status(401).json({ hata: 'Girilen bilgiler yanlış' });
        }

        const sifreDogrumu = await bcrypt.compare(sifre, user.sifre_hash);
        if (!sifreDogrumu) {
            return res.status(401).json({ hata: 'Girilen bilgiler yanlış' });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email,
                rol: user.rol,
                eczane_id: user.eczane_id
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            mesaj: 'Giris basarili',
            token,
            user: { 
                id: user.id, 
                email: user.email, 
                ad: user.ad, 
                soyad: user.soyad,
                rol: user.rol,
                eczane_id: user.eczane_id
            }
        });
    } catch (err) {
        res.status(500).json({ hata: 'Giris hatasi: ' + err.message });
    }
};

const guncelleProfil = async (req, res) => {
    try {
        const { email, telefon } = req.body;
        const userId = req.user.id;

        const result = await pool.query(
            'UPDATE kullanicilar SET email = $1, telefon = $2 WHERE id = $3 RETURNING id, ad, soyad, email, telefon, rol, eczane_id',
            [email, telefon, userId]
        );

        res.json({ mesaj: 'Profil güncellendi', user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ hata: 'Profil güncelleme hatası: ' + err.message });
    }
};

const guncelleSifre = async (req, res) => {
    try {
        const { eskiSifre, yeniSifre } = req.body;
        const userId = req.user.id;

        // Kullanıcıyı bul
        const userRes = await pool.query('SELECT sifre_hash FROM kullanicilar WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) return res.status(404).json({ hata: 'Kullanıcı bulunamadı' });

        const user = userRes.rows[0];

        // Eski şifreyi doğrula
        const sifreDogrumu = await bcrypt.compare(eskiSifre, user.sifre_hash);
        if (!sifreDogrumu) {
            return res.status(400).json({ hata: 'Mevcut şifreniz yanlış' });
        }

        // Yeni şifreyi hash'le ve kaydet
        const yeniSifreHash = await bcrypt.hash(yeniSifre, 10);
        await pool.query('UPDATE kullanicilar SET sifre_hash = $1 WHERE id = $2', [yeniSifreHash, userId]);

        res.json({ mesaj: 'Şifreniz başarıyla değiştirildi.' });
    } catch (err) {
        res.status(500).json({ hata: 'Şifre güncelleme hatası: ' + err.message });
    }
};

module.exports = { kayitOl, girisYap, guncelleProfil, guncelleSifre };