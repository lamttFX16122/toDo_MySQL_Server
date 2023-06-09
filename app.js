require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const sequelize = require('./utils/databaseConnection');
const userRoute = require('./routers/userRoute');
const authRoute = require('./routers/authenticationRoute');
const workRoute = require('./routers/workRoute');
const app = express();

// use cors
app.use(cors({ credentials: true, origin: process.env.CLIENT_APP }));
// use body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// use cookie-parser
app.use(cookieParser());
// use Route
app.use(userRoute);
app.use(authRoute);
app.use(workRoute);
const port = process.env.APP_PORT || 9191;
// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running port ${port}`);
    sequelize.sync().then(result => {
        console.log(`database Connected`);
    })
        .catch(err => console.log(err));
})



