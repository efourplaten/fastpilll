const { Pool } = require('pg'); 
//pg postgreSQL veritabanı bağlantısı için kullanılan bir kütüphanedir.
//Sürekli yeni bağlantı açmak yerine bir bağlantı havuzu kullanır
require('dotenv').config();
//.env dosyasından değişkenleri okur ve process.env nesnesine yükler

const databaseConnection = {
  host : process.env.DB_HOST,
  port : process.env.DB_PORT,
  user : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_NAME,
};
//.env dosyasından alınan bağlantı bilgilerini içeren bir nesne oluşturur

const pool = new Pool(databaseConnection);
//Bağlantı havuzu oluşturur 

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('db yarra yedi:', err.stack);
    } else {
        console.log('db bağlandık :', res.rows[0].now);
    }

});
//Veritabanı bağlantısını test eder ve başarılı olup olmadığını konsola yazdırır

module.exports = pool;
//Bağlantı havuzunu diğer dosyalarda kullanmak üzere dışa aktarır

