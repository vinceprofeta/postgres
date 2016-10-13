require('dotenv').config();

module.exports = {
    development: {
        client: 'pg',
        connection: 'postgres://localhost/postgres_test'
    },
    production: {
        client: 'pg',
        connection: process.env.DATABASE_URL + '?ssl=true',
        password: process.env.DB_PASS,
        user: process.env.DB_USER
    }
};
