const jwt = require('jsonwebtoken'); //JWT kütüphanesini içe aktarır



const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log('AUTH DEBUG - Header:', authHeader ? authHeader.substring(0, 30) + '...' : 'YOK');
    console.log('AUTH DEBUG - JWT_SECRET:', process.env.JWT_SECRET ? 'VAR' : 'YOK!!!');
    if (!authHeader) {
        return res.status(401).json({ hata: 'Token bulunamadı' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('AUTH DEBUG - Decoded user:', decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.log('AUTH DEBUG - HATA:', err.message);
        return res.status(401).json({ hata: 'Token yanlıs' });
    }
}//JWT doğrulama işlemi yapar, token geçerliyse kullanıcı bilgilerini req.user'a ekler ve sonraki middleware'e geçer, geçersizse hata döner

module.exports = authMiddleware;
