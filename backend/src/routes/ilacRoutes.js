const express = require('express');
const router = express.Router();
const ilacController = require('../controllers/ilacController');

router.get('/ara', ilacController.ilacAra); // İlaç arama endpoint'i
router.get('/:id/bulunurluk', ilacController.ilacBulunurluk); // Belirli bir ilacın bulunduğu eczaneleri getirir

module.exports = router;