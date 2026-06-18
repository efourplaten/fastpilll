const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');

const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const pool = require('./src/config/database');
const app = express();
const PORT = process.env.PORT;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.get('/', (req, res) => {
    res.json('Calısıyor amınakee');
});



const eczaneRoutes = require('./src/routes/eczaneRoutes');
app.use('/api/eczaneler', eczaneRoutes);

const eczaneAdminRoutes = require('./src/routes/eczaneAdminRoutes');
app.use('/api/admin', eczaneAdminRoutes);


const ilacRoutes = require('./src/routes/ilacRoutes');
app.use('/api/ilaclar', ilacRoutes);

const rezervasyonRoutes = require('./src/routes/rezervasyonRoutes');
app.use('/api/rezervasyonlar', rezervasyonRoutes);

app.listen(PORT, () => {
  console.log('Aktifiz babaaaa: http://localhost:' + PORT);
});
