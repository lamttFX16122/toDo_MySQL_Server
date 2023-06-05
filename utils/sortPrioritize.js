const WorkModel = require('../models/workModel');

const setPrioritize = async (userId, isStart) => {
    try {
        const works = await WorkModel.findAll({
            where: {
                userId: userId,
                workStatus: 1
            }
        });
        if (!isStart) {
            return 0;
        }
        else {
            works.forEach(async (work, index) => {
                await WorkModel.update({ timePrioritize: work.timePrioritize + 1 }, { where: { workId: work.workId } })
            })
            return 1;
        }
    }
    catch (err) {
        console.log(err);
    }
}
const changePrioritize = async (userId, workId, prioritize) => {
    try {
        const works = await WorkModel.findAll({
            where: {
                userId: userId,
                workStatus: 1
            }, order: [
                ['timePrioritize', 'ASC'],
            ]
        });
        const index = works.findIndex(work => workId === work.workId);
        if (prioritize === 'up') {
            await WorkModel.update({ timePrioritize: works[index - 1].timePrioritize }, { where: { workId: works[index].workId } })
            await WorkModel.update({ timePrioritize: works[index].timePrioritize }, { where: { workId: works[index - 1].workId } })
        }
        else {
            await WorkModel.update({ timePrioritize: works[index + 1].timePrioritize }, { where: { workId: works[index].workId } })
            await WorkModel.update({ timePrioritize: works[index].timePrioritize }, { where: { workId: works[index + 1].workId } })
        }
        return true;
    }
    catch (err) {
        console.log(err);
    }
}
module.exports = { setPrioritize, changePrioritize };