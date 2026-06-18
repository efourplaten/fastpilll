const pool = require('../config/database');

const googleidilebul = async (googlePlaceId) => {
    const result = await pool.query(
        'SELECT * FROM pharmacies WHERE google_place_id = $1',[googlePlaceId]
    );
    return result.rows[0]; // Google Place ID'ye sahip eczaneyi döndürür
};
const eczaneolustur = async (googlePlaceId,ad,adres,telefon,lat,lng) => {
    const result = await pool.query(
        `INSERT INTO pharmacies (google_place_id, ad, adres, telefon, latitude, longitude, location)
     VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326))
     RETURNING *`,
     [googlePlaceId, ad, adres, telefon, lat, lng, lng, lat]);
    return result.rows[0];
}
const idilebul = async (id) => {
    const result = await pool.query(
        'SELECT * FROM pharmacies WHERE id = $1',[id]
    );
    return result.rows[0]; // ID'ye sahip eczaneyi döndürür
}
module.exports = { googleidilebul, eczaneolustur, idilebul };