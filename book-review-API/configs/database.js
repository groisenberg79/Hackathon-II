const { PASSWORD } = require('./configs.js')
const database = require('knex')({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: PASSWORD,
        database: 'Hackathon-II',
        port: 5432
    }
})

module.exports = { database };