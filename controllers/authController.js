const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const AuthModel = require('../models/authenticationModel');
const { randomAuthenId } = require('../utils/idRandom');
const authController = {
    genarateAccessToken: (user) => {
        const { ...info } = user;
        const key = process.env.JWT_SECRET;
        return jwt.sign(info, key, { expiresIn: '10s' });
    },
    genarateRefreshToken: (user) => {
        const { ...info } = user;
        const key = process.env.JWT_REFRESH;
        return jwt.sign(info, key, { expiresIn: '20d' });
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await UserModel.findOne({ where: { email: email } });
            if (!user) {
                return res.status(401).json({
                    error: 1,
                    message: `User does not exist`,
                    payload: {}
                })
            }
            const comparePassword = await bcrypt.compare(password, user.password);
            if (!comparePassword) {
                return res.status(401).json({
                    error: 1,
                    message: `Password is invalid`,
                    payload: {}
                })
            }
            if (user && comparePassword) {
                const { password, ...info } = user.dataValues;

                const accessToken = authController.genarateAccessToken({ email: info.email, userId: info.userId });
                const refreshToken = authController.genarateRefreshToken({ email: info.email, userId: info.userId });
                let genarateId = await randomAuthenId();
                await AuthModel.create({
                    authId: genarateId,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    userId: user.userId
                });
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: false,
                    secure: false,
                    path: '/'
                });
                return res.status(200).json({
                    error: 0,
                    message: 'logged in successfully',
                    payload: {
                        user: info,
                        sessionId: genarateId,
                        accessToken: accessToken
                    }
                })
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                error: 1,
                message: 'Server Error',
                payload: {}
            })
        }
    },
    logout: async (req, res) => {
        try {
            const { sessionId } = req.body;
            await AuthModel.update({ authStatus: false }, {
                where: {
                    authId: sessionId
                }
            });
            res.clearCookie('refreshToken');
            return res.status(200).json({
                error: 0,
                message: 'logged out seccessfully',
                payload: {}
            });
        } catch (error) {
            return res.status(500).json({
                error: 1,
                message: 'Server Error',
                payload: {}
            })
        }
    },
    reqRefreshToken: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            const { sessionId } = req.body;
            if (!refreshToken) {
                return res.status(401).json({
                    error: 1,
                    message: `You're not authenticated`,
                    payload: {}
                });
            }
            const auth = await AuthModel.findByPk(sessionId);
            if (auth.refreshToken !== refreshToken) {
                return res.status(401).json({
                    error: 1,
                    message: `Refresh Token invalid`,
                    payload: {}
                });
            }
            await jwt.verify(refreshToken, process.env.JWT_REFRESH, async (err, decoded) => {
                if (err) {
                    return res.status(401).json({
                        error: 1,
                        message: `Refresh Token invalid`,
                        payload: {}
                    });
                }

                const newAccessToken = authController.genarateAccessToken({ email: decoded.email, userId: decoded.userId });
                await AuthModel.update({ accessToken: newAccessToken }, { where: { authId: sessionId } });
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: false,
                    secure: false,
                    path: '/'
                });
                return res.status(200).json({
                    error: 0,
                    message: 'refresh token successfully',
                    payload: {
                        accessToken: newAccessToken
                    }
                })
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                error: 1,
                message: 'Server Error',
                payload: {}
            })
        }
    },
    runServer: (req, res) => {
        return res.send('Server is running...');
    }
}
module.exports = authController;

