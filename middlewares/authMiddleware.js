const jwt = require('jsonwebtoken');
const AuthModel = require('../models/authenticationModel');

exports.verifyToken = async (req, res, next) => {
    try {
        const accessToken = req.headers.token;
        if (!accessToken) {
            return res.status(401).json({
                error: 1,
                message: `You're not authenticated`,
                payload: {}
            });
        }
        const auth = await AuthModel.findOne({ where: { accessToken: accessToken, authStatus: true } });
        if (!auth) {
            return res.status(401).json({
                error: 1,
                message: `You're not authenticated`,
                payload: {}
            });
        }
        await jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(401).json({
                    error: 1,
                    message: `Access Token invalid`,
                    payload: {}
                });
            }
            req.user = user;
            return next();
        })
    } catch (error) {
        console.log(error)
    }
}
