const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE, process.env.USER_NAME, process.env.PASSWORD, {
    host: process.env.HOST,
    dialect: process.env.DIALECT,
    operatorAlias: false,
    logging: false,
    pool: {
        max: 5,
        idle: 30000,
        acquire: 60000,
    },
});
module.exports = sequelize;