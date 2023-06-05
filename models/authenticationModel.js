const { DataTypes } = require('sequelize');
const sequelize = require('../utils/databaseConnection');
const Authentication = sequelize.define('Authentication', {
    authId: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    accessToken: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    refreshToken: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    authStatus: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    userId: {
        type: DataTypes.STRING,
        references: {
            model: 'Users',
            key: 'userId'
        }
    }
})
module.exports = Authentication;