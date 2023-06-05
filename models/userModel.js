const { DataTypes } = require('sequelize');
const sequelize = require('../utils/databaseConnection');
const Work = require('./workModel')
const Authentication = require('./authenticationModel');
const User = sequelize.define('User', {
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dayOfBirth: {
        type: DataTypes.DATEONLY,
        defaultValue: '2000-01-01'
    },
    sex: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    phone: {
        type: DataTypes.STRING,

    }
});
User.hasMany(Work, { foreignKey: 'userId', onDelete: 'cascade' });
User.hasMany(Authentication, { foreignKey: 'userId', onDelete: 'cascade' });
module.exports = User;