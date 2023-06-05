const { DataTypes } = require('sequelize');
const sequelize = require('../utils/databaseConnection');
const Process=require('./timeProcess');
const Work = sequelize.define('Work', {
    workId: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    workName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    workStatus: {
        type: DataTypes.INTEGER,
        default: 0
    },
    timeCreated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    timePrioritize: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    userId: {
        type: DataTypes.STRING,
        references: {
            model: 'Users',
            key: 'userId'
        }
    }
});
Work.hasMany(Process, {foreignKey:'workId' ,onDelete: 'cascade'});
module.exports = Work;
// 0 is pendding 
// 1 is Start
// 2 is end