const express = require('express');
const router = express.Router();
const rezervasyonController = require('../controllers/rezervasyonController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/olustur', authMiddleware, rezervasyonController.olustur); // Yeni rezervasyon oluştur
router.get('/benim', authMiddleware, rezervasyonController.benimRezervasyonlarim); // Kullanıcının rezervasyonlarını getir
router.patch('/:id/iptal', authMiddleware, rezervasyonController.iptalEt); // Rezervasyonu iptal et

module.exports = router;
