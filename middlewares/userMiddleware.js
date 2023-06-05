const UserModel = require('../models/userModel');
const checkEmailExist = async (req, res, next) => {
    const user = await UserModel.findOne({ where: { email: req.body.email } });
    if (user) {
        return res.status(401).json({
            error: 1,
            message: 'Email is exist',
            payload: {}
        });
    }
    return next();
}

module.exports = {
    checkEmailExist
}
