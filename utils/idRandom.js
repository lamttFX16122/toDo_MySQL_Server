const uuid = require('uuid-with-v6');
const UserModel = require('../models/userModel');
const AuthModel = require('../models/authenticationModel');
const WorkModel = require('../models/workModel');
const Process = require('../models/timeProcess');
const random_id = () => {
    let v6 = uuid.v6setup();
    return v6();
}
exports.randomUserId = async () => {
    let generate_id = random_id();
    // check is userId exist
    const user = await UserModel.findByPk(generate_id);
    if (user) {
        generate_id = random_id();
        while (user.userId === generate_id) {
            generate_id = random_id();
        }
    }
    return generate_id;
}
exports.randomAuthenId = async () => {
    let generate_id = random_id();
    const auth = await AuthModel.findByPk(generate_id);
    if (auth) {
        generate_id = random_id();
        while (auth.authId === generate_id) {
            generate_id = random_id();
        }
    }
    return generate_id;
}
exports.randomWordId = async () => {
    let generate_id = random_id();
    const work = await WorkModel.findByPk(generate_id);
    if (work) {
        generate_id = random_id();
        while (work.workId === generate_id) {
            generate_id = random_id();
        }
    }
    return generate_id;
}
exports.randomProcessId = async () => {
    let generate_id = random_id();
    const process = await Process.findByPk(generate_id);
    if (process) {
        generate_id = random_id();
        while (process.processId === generate_id) {
            generate_id = random_id();
        }
    }
    return generate_id;
}

