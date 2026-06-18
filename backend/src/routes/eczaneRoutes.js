const express = require('express');
const router = express.Router();
const eczaneController = require('../controllers/eczaneController');
const ilacController = require('../controllers/ilacController');


router.get('/yakin', eczaneController.yakinEczaneler);
router.get('/:id', eczaneController.eczaneDetay);
router.get('/:id/stok', ilacController.eczaneStok); 

module.exports = router;
