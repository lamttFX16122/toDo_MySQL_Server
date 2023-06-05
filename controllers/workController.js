const moment = require('moment');
const WorkModel = require('../models/workModel');
const { randomWordId } = require('../utils/idRandom');
const { setPrioritize, changePrioritize } = require('../utils/sortPrioritize');
const timeProcess = require('./timeProcessController');
const ProcessModel = require('../models/timeProcess');
const sequelize = require('../utils/databaseConnection');
const PDFDocument = require('pdfkit');
const path = require('path');
const { changeMinutesToHours } = require('../share/changeTimeText');
const workController = {
    addWork: async (req, res) => {
        try {
            const workId = await randomWordId();
            const { ...work } = req.body;
            const timeCreated = moment();

            let newWork = {
                workId: workId,
                workName: work.workName,
                workStatus: parseInt(work.workStatus),
                timeCreated: timeCreated,
                userId: work.userId
            };
            if (parseInt(work.workStatus) === 1) {
                newWork.timePrioritize = await setPrioritize(work.userId, true);
                await WorkModel.create(newWork);
                await timeProcess.timeStart(workId);
            }
            else {
                await WorkModel.create(newWork);
            }

            return res.status(200).json({
                error: 0,
                message: 'work added',
                payload: {}
            });
        } catch (error) {
            return res.status(500).json({
                error: 1,
                message: 'Server Error',
                payload: {}
            });
        }
    },
    getWorksProcess: async (userId, page, pageSize) => {
        try {
            const lst_worksProcess = await WorkModel.findAll({
                where: {
                    userId: userId,
                    workStatus: 1
                },
                include: ProcessModel,
                offset: (page - 1) * pageSize,
                limit: pageSize,
                order: [
                    ['timePrioritize', 'ASC']
                ]
            });
            let count_worksProcess = await WorkModel.count({
                where: {
                    userId: userId,
                    workStatus: 1
                }
            })
            return {
                works: lst_worksProcess,
                count_worksProcess,
                last_pageProcess: Math.ceil(count_worksProcess / pageSize)
            }
        } catch (error) {
            console.log(error);
        }
    },
    getWorksPending: async (userId, page, pageSize) => {
        try {
            const lst_worksPending = await WorkModel.findAll({
                where: {
                    userId: userId,
                    workStatus: 0
                },
                include: ProcessModel,
                offset: (page - 1) * pageSize,
                limit: pageSize
            });
            let count_worksPending = await WorkModel.count({
                where: {
                    userId: userId,
                    workStatus: 0
                }
            })
            return {
                works: lst_worksPending,
                count_worksPending,
                last_pagePending: Math.ceil(count_worksPending / pageSize)
            }

        } catch (error) {
            console.log(error);
        }
    },
    getWorksEnd: async (userId, page, pageSize) => {
        try {
            const lst_worksEnd = await WorkModel.findAll({
                where: {
                    userId: userId,
                    workStatus: 2
                },
                include: ProcessModel,
                offset: (page - 1) * pageSize,
                limit: pageSize
            });
            let count_worksEnd = await WorkModel.count({
                where: {
                    userId: userId,
                    workStatus: 2
                }
            })
            return {
                works: lst_worksEnd,
                count_worksEnd,
                last_pageEnd: Math.ceil(count_worksEnd / pageSize)
            }

        } catch (error) {
            console.log(error);
        }
    },
    getWorkDistribution: async (req, res) => {
        try {
            const pageSize = 3;
            const ispage = req.query;
            const userId = req.headers.userid;
            console.log(Object.keys(ispage).length)
            let works = {};
            if (Object.keys(ispage).length > 0) {
                if (ispage.tab === '0') {
                    works.worksPending = await workController.getWorksPending(userId, ispage.page, pageSize);
                }
                if (ispage.tab === '1') {
                    works.worksProcess = await workController.getWorksProcess(userId, ispage.page, pageSize);
                }
                if (ispage.tab === '2') {
                    works.worksEnd = await workController.getWorksEnd(userId, ispage.page, pageSize);
                }
            }
            else {
                const page = 1;
                const pageSize = 3;
                works.worksProcess = await workController.getWorksProcess(userId, page, pageSize);
                works.worksPending = await workController.getWorksPending(userId, page, pageSize);
                works.worksEnd = await workController.getWorksEnd(userId, page, pageSize);
            }
            return res.status(200).json({
                error: 0,
                message: 'get works successfully',
                payload: works
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                error: 1,
                message: 'Server Error',
                payload: {}
            });
        }
    },
    editWork: async (req, res) => {
        try {
            let { workId, workName, workStatus } = req.body;
            const work = await WorkModel.findByPk(workId);
            if (!work) {
                return res.status(401).json({
                    error: 3,
                    message: 'work invalid',
                    payload: {}
                })
            }
            if (work.workStatus === parseInt(workStatus)) {
                // thay doi ten...
                await WorkModel.update({
                    workName: workName
                },
                    {
                        where: {
                            workId: workId
                        }
                    })
            }
            else if ((work.workStatus === 0 && workStatus === '1') || (work.workStatus === 2 && workStatus === '1')) {
                // thay doi trang thai tu cho sang bat dau
                // timeStart =new
                let workUpdate = { workStatus: parseInt(workStatus), timePrioritize: await setPrioritize(work.userId, true) }
                if (workName !== work.workName) {
                    workUpdate.workNam = workName;
                }
                await WorkModel.update(workUpdate,
                    {
                        where: {
                            workId: workId
                        }
                    })
                await timeProcess.timeStart(workId);
            }
            else if (work.workStatus === 1 && workStatus === '2') {
                // Thay doi trang thai tu dang lam sang ket thuc
                // timeend= new 
                // totalTime=timeEnd-timeStart
                let workUpdate = { workStatus: parseInt(workStatus) }
                if (workName !== work.workName) {
                    workUpdate.workNam = workName;
                }
                await WorkModel.update(workUpdate,
                    {
                        where: {
                            workId: workId
                        }
                    })
                await timeProcess.timeEnd(workId);
            }
            return res.status(200).json({
                error: 0,
                message: 'Updated work successfully',
                payload: {}
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: 500,
                message: 'Server Error',
                payload: {}
            })
        }
    },
    changeStatus: async (req, res) => {
        try {
            const { workStatus, workId } = req.body;
            if (workStatus === parseInt(1)) {
                //await setPrioritize(work.userId, true)
                const work = await WorkModel.findByPk(workId);
                await WorkModel.update({ workStatus: workStatus, timePrioritize: await setPrioritize(work.userId, true) }, {
                    where: {
                        workId: workId
                    }
                });
                await timeProcess.timeStart(workId);
            }
            if (workStatus === parseInt(2)) {
                await WorkModel.update({ workStatus: workStatus }, {
                    where: {
                        workId: workId
                    }
                });
                await timeProcess.timeEnd(workId);
            }
            return res.status(200).json({
                error: 0,
                message: 'change status successfully',
                payload: {}
            })
        } catch (error) {
            return res.status(500).json({
                error: 1,
                message: 'Server Error',
                payload: {}
            });
        }

    },
    deleteWork: async (req, res) => {
        try {
            const { workId } = req.body;
            console.log(workId);
            await WorkModel.destroy({
                where: {
                    workId: workId
                }
            });
            return res.status(200).json({
                error: 0,
                message: 'delete work successfuly',
                payload: {}
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                error: 1,
                message: 'Server Error',
                payload: {}
            });
        }
    },
    changePrioritize: async (req, res) => {
        try {
            const { userId, workId, prioritize } = req.body;
            await changePrioritize(userId, workId, prioritize)
            return res.status(200).json({
                error: 0,
                message: 'change prioritize successfully',
                payload: {}
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                error: 1,
                message: 'Server Error',
                payload: {}
            });
        }
    },
    workSearch: async (req, res) => {
        try {
            const key = req.query.key;
            const userId = req.headers.userid;
            const page = req.query.page;
            const pageSize = 3;
            const result = await WorkModel.findAll({
                where: {
                    userId: userId,
                    workName: sequelize.where(sequelize.fn('LOWER', sequelize.col('workName')), "LIKE", "%" + key + "%")
                },
                include: ProcessModel,
                offset: (page - 1) * pageSize,
                limit: pageSize
            });
            let count_worksSearch = await WorkModel.count({
                where: {
                    userId: userId,
                    workName: sequelize.where(sequelize.fn('LOWER', sequelize.col('workName')), "LIKE", "%" + key + "%")
                }
            });
            const worksSearch = {
                works: sortArrSearch(result),
                count_worksSearch,
                last_worksSearch: Math.ceil(count_worksSearch / pageSize)
            };
            return res.status(200).json({
                error: 0,
                message: 'search works successfully',
                payload: worksSearch
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                error: 1,
                message: 'Server Error',
                payload: {}
            });
        }
    },
    statistical: async (req, res) => {
        try {
            const userId = req.headers.userid;
            const workStatus = parseInt(req.query.workStatus);
            const pageSize = 3;
            const page = (parseInt(req.query.page) - 1) * pageSize
            const result = await sequelize.query('call sp_Satiscal_WorkEnd(:userId, :workStatus, :page, :pageSize)',
                {
                    replacements: { userId, workStatus, page, pageSize },
                    type: sequelize.QueryTypes.SELECT
                })
            return res.status(200).json({
                error: 0,
                message: 'statistical work successfully',
                payload: result
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: 1,
                message: 'Server Error',
                payload: {}
            });
        }
    },
    printPDF_Pagination: async (req, res) => {
        try {
            const userId = req.headers.userid;
            const workStatus = parseInt(req.query.workStatus);
            const pageSize = 3;
            const page = (parseInt(req.query.page) - 1) * pageSize
            const result = await sequelize.query('call sp_Satiscal_WorkEnd(:userId, :workStatus, :page, :pageSize)',
                {
                    replacements: { userId, workStatus, page, pageSize },
                    type: sequelize.QueryTypes.SELECT
                })
            // =========================
            let titleHeader = '';
            if (workStatus === 1) {
                titleHeader = 'CÔNG VIỆC ĐANG LÀM';
            }
            else if (workStatus === 0) {
                titleHeader = 'CÔNG VIỆC ĐANG CHỜ';
            }
            else if (workStatus === 2) {
                titleHeader = 'CÔNG VIỆC ĐÃ LÀM';
            }
            else {
                titleHeader = 'DANH SÁCH CÔNG VIỆC';
            }
            // create Doc
            const fileName = `${userId}-${moment().format('YYYYMMDDhhmmss')}.pdf`;
            const filePath = path.join(__dirname + "/../documentPDF", fileName);
            const docPdf = new PDFDocument({ size: "A4", margin: 50 });
            generate_Header(docPdf, titleHeader);
            generate_Work(docPdf, result[0]);
            docPdf.end();
            // docPdf.pipe(fs.createWriteStream(filePath));
            res.type('application/pdf');
            //Dowload pdf
            docPdf.pipe(res);

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: 1,
                message: 'Server Error',
                payload: {}
            });
        }
    },
    printPDF_All: async (req, res) => {
        try {
            const userId = req.headers.userid;
            const workStatus = parseInt(req.query.workStatus);
            const result = await sequelize.query('call sp_PrintAllWork(:userId, :workStatus)',
                {
                    replacements: { userId, workStatus },
                    type: sequelize.QueryTypes.SELECT
                })
            // =========================
            let titleHeader = '';
            if (workStatus === 1) {
                titleHeader = 'CÔNG VIỆC ĐANG LÀM';
            }
            else if (workStatus === 0) {
                titleHeader = 'CÔNG VIỆC ĐANG CHỜ';
            }
            else if (workStatus === 2) {
                titleHeader = 'CÔNG VIỆC ĐÃ LÀM';
            }
            else {
                titleHeader = 'DANH SÁCH CÔNG VIỆC';
            }
            // create Doc
            const fileName = `${userId}-${moment().format('YYYYMMDDhhmmss')}.pdf`;
            const filePath = path.join(__dirname + "/../documentPDF", fileName);
            const docPdf = new PDFDocument({ size: "A4", margin: 50 });
            generate_Header(docPdf, titleHeader);
            generate_Work(docPdf, result[0]);
            docPdf.end();
            // docPdf.pipe(fs.createWriteStream(filePath));
            res.type('application/pdf');
            //Dowload pdf
            docPdf.pipe(res);

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: 1,
                message: 'Server Error',
                payload: {}
            });
        }
    }
}
const sortArrSearch = (arr) => {
    let tempArrFilterStart = arr.filter((work) => work.dataValues.workStatus === 1).sort((a, b) => a.dataValues.timePrioritize - b.dataValues.timePrioritize);
    let tempArrFilterPendding = arr.filter((work) => work.dataValues.workStatus === 0).sort((a, b) => b.dataValues.timeCreated - a.dataValues.timeCreated);
    let tempArrFilterEnd = arr.filter((work) => work.dataValues.workStatus === 2).sort((a, b) => b.dataValues.timeCreated - a.dataValues.timeCreated);
    let result = tempArrFilterStart.concat(tempArrFilterPendding, tempArrFilterEnd);
    result.forEach(element => {
        if (element.dataValues.Processes.length > 0) {
            element.dataValues.Processes.sort((a, b) => b.timeStart - a.timeStart);
        }
    });
    return result;
}
const generate_Header = (doc, textHeader) => {
    let fontDir = path.join(__dirname + '/../public/fonts/timesbd.ttf')
    doc.font(fontDir)
        .fontSize(20)
        .text(textHeader, { align: 'center' }).moveDown();
}
const generate_Work = (doc, work) => {
    const rowHeaders = ['STT', 'Tên công việc', 'Trạng thái', 'Ngày tạo', 'Số lần làm', 'TTG'];
    const positionCol = [50, 80, 240, 320, 400, 480];
    const widthCol = [30, 160, 80, 80, 80, 70];
    generate_Hr(doc, 100, 550);
    const marginTop = 105;
    // Generate table header

    rowHeaders.forEach((header, i) => {
        doc.font(path.join(__dirname + '/../public/fonts/timesbd.ttf'))
            .fontSize(12)
            .text(header, positionCol[i], marginTop, {
                align: i === 1 ? 'left' : 'center',
                width: widthCol[i]
            });
    });
    // Generate Table row data
    let row_Num = 1;
    let totalTimeAll = 0;
    for (const row in work) {
        totalTimeAll += parseInt(work[row].totalTimeProcess);
        doc
            .font(path.join(__dirname + '/../public/fonts/times.ttf'))
            .fontSize(12)
            .text(row_Num, positionCol[0], marginTop + row_Num * 30, { width: widthCol[0], align: 'center' })
            .text(work[row].workName, positionCol[1], marginTop + row_Num * 30, { width: widthCol[1] })
            .text(work[row].workStatus, positionCol[2], marginTop + row_Num * 30, { width: widthCol[2], align: 'center' })
            .text(moment(work[row].timeCreated).format('DD-MM-YYYY'), positionCol[3], marginTop + row_Num * 30, { width: widthCol[3], align: 'center' })
            .text(work[row].countProcess, positionCol[4], marginTop + row_Num * 30, { width: widthCol[4], align: 'center' })
            .text(changeMinutesToHours(work[row].totalTimeProcess), positionCol[5], marginTop + row_Num * 30, { width: widthCol[5], align: 'center' })
        row_Num++;
    }
    generate_Hr(doc, marginTop + row_Num * 30, 550);
    doc.font(path.join(__dirname + '/../public/fonts/times.ttf'))
        .fontSize(12)
        .text('Tổng thời gian: ' + (totalTimeAll > 0 ? changeMinutesToHours(totalTimeAll) : 0), 50, marginTop + 5 + row_Num * 30, {
            width: 500,
            align: 'right'
        })
}
const generate_Hr = (doc, y, sizeHr) => {
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(sizeHr, y).stroke();
}
module.exports = workController;
