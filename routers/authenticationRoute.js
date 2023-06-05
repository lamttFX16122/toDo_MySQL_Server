const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const route = express.Router();
route.post('/login', authController.login);
route.post('/logout', verifyToken, authController.logout);
route.post('/refreshToken', authController.reqRefreshToken);
module.exports = route;