const axios = require('axios');
require('dotenv').config();

const yakinEczaneleriBul = async (lat, lng, radius = 3000) => {
    const apikey = process.env.GOOGLE_PLACES_API_KEY;

    // Eski (legacy) Google Places API endpoint'i - daha güvenilir çalışır
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=distance&type=pharmacy&language=tr&key=${apikey}`;

    const response = await axios.get(url);

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        console.log('GOOGLE HATA:', response.data.status, response.data.error_message);
        throw new Error('Google API hatasi: ' + response.data.status);
    }

    // Arapça karakterleri tespit eden regex
    const arabicRegex = /[\u0600-\u06FF]/;

    // Bedava çeviri API'si (Google Translate web endpoint)
    const ceviriYap = async (metin) => {
        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=tr&dt=t&q=${encodeURIComponent(metin)}`;
            const res = await axios.get(url);
            return res.data[0][0][0]; // Çevrilmiş metni döner
        } catch (error) {
            return metin; // Hata olursa orijinal metni döndür
        }
    };

    const places = [];
    const results = response.data.results || [];

    // Eski API'nin formatını yeni formata dönüştür (controller'ın beklediği format)
    for (const place of results) {
        let eczaneAdi = place.name;

        // Eğer isminde Arapça varsa Türkçeye çevir
        if (arabicRegex.test(eczaneAdi)) {
            eczaneAdi = await ceviriYap(eczaneAdi);
        }

        places.push({
            id: place.place_id,
            displayName: { text: eczaneAdi },
            formattedAddress: place.vicinity || place.formatted_address,
            nationalPhoneNumber: '',
            location: {
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng
            }
        });
    }

    return places;
};

module.exports = { yakinEczaneleriBul };