if (!process.env.PRODUCTION) {
  require('dotenv').config();
}

module.exports = {
    development: {
        client: 'pg',
        connection: 'postgres://localhost/tyro'
    },
    production: {
        client: 'pg',
        connection: process.env.DATABASE_URL + '?ssl=true',
        password: process.env.DB_PASS,
        user: process.env.DB_USER
    }
};
