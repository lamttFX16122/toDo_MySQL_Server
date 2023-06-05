const { DataTypes } = require('sequelize');
const sequelize = require('../utils/databaseConnection');
const Process = sequelize.define('Process', {
    processId: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    timeStart: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    timeEnd: {
        type: DataTypes.DATE,
        allowNull: true
    },
    totalTime: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    workId: {
        type: DataTypes.STRING,
        references: {
            model: 'Works',
            key: 'workId'
        }
    }
});
module.exports = Process;