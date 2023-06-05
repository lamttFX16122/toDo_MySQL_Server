const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const { randomUserId } = require('../utils/idRandom');

const userController = {
    userRegister: async (req, res) => {
        try {
            let generate_id = await randomUserId();
            const salt = process.env.SALT_PASSWORD;
            const hashSalt = await bcrypt.genSalt(parseInt(salt));
            const hashPassword = await bcrypt.hash(req.body.password, hashSalt);
            const result = await UserModel.create({
                userId: generate_id,
                email: req.body.email,
                password: hashPassword,
                userName: req.body.userName,
                dayOfBirth: req.body.dayOfBirth,
                role: req.body.role || false,
                sex: parseInt(req.body.sex),
                phone: req.body.phone
            })
            return res.status(200).json({
                error: 0,
                message: 'User registed successfully',
                payload: result
            });
        }
        catch (error) {
            console.log(error)
            return res.status(500).json({
                error: 1,
                message: 'Server error',
                payload: {}
            });
        }
    },
    userUpdateInfo: async (req, res) => {
        try {
            const user = req.body;
            const result = await UserModel.update({
                userName: user.userName,
                dayOfBirth: user.dayOfBirth,
                role: user.role || false,
                sex: parseInt(user.sex),
                phone: user.phone
            }, {
                where: {
                    userId: user.userId
                }
            })
            return res.status(200).json({
                error: 0,
                message: 'updated user infomation',
                payload: user
            })
        } catch (error) {
            return res.status(500).json({
                error: 1,
                message: 'Server error',
                payload: {}
            });
        }
    },
    userUpdatePassword: async (req, res) => {
        try {
            const userId = req.body.userId;
            const oldPassword = req.body.oldPassword;
            const newPassword = req.body.newPassword;
            const user = await UserModel.findByPk(userId)
            const comparePassword = await bcrypt.compare(oldPassword, user.password);
            if (!comparePassword) {
                return res.status(401).json({
                    error: 1,
                    message: `Password is invalid`,
                    payload: {}
                })
            }
            const salt = process.env.SALT_PASSWORD;
            const hashSalt = await bcrypt.genSalt(parseInt(salt));
            const newPass = await bcrypt.hash(newPassword, hashSalt);
            await UserModel.update({
                password: newPass
            }, {
                where: {
                    userId: userId
                }
            })
            return res.status(200).json({
                error: 0,
                message: 'change password successfully',
                payload: {}
            })
        } catch (error) {
            return res.status(500).json({
                error: 1,
                message: 'Server error',
                payload: {}
            });
        }
    },
    checkEmailExist: async (req, res) => {
        try {
            const user = await UserModel.findOne({ where: { email: req.body.email } });
            let isValid = false;
            if (!user) {
                isValid = true;
            }
            return res.status(200).json({
                error: 0,
                message: 'Check is email',
                payload: { isValid }
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                error: 1,
                message: 'Server error',
                payload: {}
            });
        }
    }
}
module.exports = userController;