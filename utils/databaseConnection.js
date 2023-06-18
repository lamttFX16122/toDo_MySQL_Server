const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE, process.env.USER_NAME, process.env.PASSWORD, {
    host: process.env.HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DIALECT,
    dialectOptions:
        process.env.DB_SSL === 'true' ? {
            ssl: {
                required: true,
                rejectUnauthorized: false
            }
        } : {}
});
module.exports = sequelize;