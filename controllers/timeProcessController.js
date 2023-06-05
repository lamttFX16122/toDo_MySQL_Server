const ProcessModel = require('../models/timeProcess');
const moment = require('moment');
const { randomProcessId } = require('../utils/idRandom');
const timeProcess = {
    timeStart: async (workId) => {
        try {
            const generate_id = await randomProcessId();
            const newProcess = {
                processId: generate_id,
                workId: workId
            }
            const process = await ProcessModel.create(newProcess);
            return process;

        } catch (error) {
            console.log(error);
        }
    },
    timeEnd: async (workId) => {
        try {
            const process = await ProcessModel.findOne({ where: { workId: workId, timeEnd: null } });
            if (!process) {
                // err
                throw new Error('process invalid');
            }
            const timeNow = moment();
            const total = timeNow.diff(moment(process.timeStart), 'm');
            await ProcessModel.update({
                timeEnd: timeNow,
                totalTime: total
            }, {
                where: {
                    processId: process.processId
                }
            })
        } catch (error) {
            console.log(error);
        }
    }
}
module.exports = timeProcess;