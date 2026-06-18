const express = require('express');
const router = express.Router();
const eczaneAdminController = require('../controllers/eczaneAdminController');
const authMiddleware = require('../middleware/authMiddleware');

// Eczane admin rotaları - hepsi authMiddleware'den geçer

// Rezervasyonları listele
router.get('/rezervasyonlar', authMiddleware, eczaneAdminController.getRezervasyonlar);

// Rezervasyon onayla
router.patch('/rezervasyonlar/:id/onayla', authMiddleware, eczaneAdminController.onaylaRezervasyon);

// Rezervasyon reddet
router.patch('/rezervasyonlar/:id/reddet', authMiddleware, eczaneAdminController.reddetRezervasyon);

// Stokları listele
router.get('/stok', authMiddleware, eczaneAdminController.getStok);

// Stok güncelle (miktar/fiyat)
router.patch('/stok/:id', authMiddleware, eczaneAdminController.guncelleStok);

// Yeni ilaç ekle
router.post('/stok', authMiddleware, eczaneAdminController.ilacEkle);

module.exports = router;
