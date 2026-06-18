const express = require('express'); // Express frameworkü import edilir
const router = express.Router(); // Yeni bir router oluşturulur
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
//

router.post('/register', authController.kayitOl); 
// POST isteği ile /register endpoint'ine gelen istekler authController içindeki 
// register fonksiyonuna yönlendirilir
router.post('/login', authController.girisYap);
// POST isteği ile /login endpoint'ine gelen istekler 
// authController içindeki login fonksiyonuna yönlendirilir

router.put('/profile', authMiddleware, authController.guncelleProfil);
router.put('/password', authMiddleware, authController.guncelleSifre);

module.exports = router;
