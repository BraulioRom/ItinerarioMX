//modulos
const express = require('express');
const Router = express.Router();

Router.get('/', require('../middlewares/prueba'));
/*
Router.route('/login')
.put(require('../middlewares/signin'))
.post(require('../middlewares/signup'));
*/
Router.post('/signin',require('../middlewares/signin'));
Router.post('/login',require('../middlewares/signup'));
Router.post('/history', require('../middlewares/history'));
Router.post('/settings', require('../middlewares/settings'));
Router.post('/recovery', require('../middlewares/recovery'));

module.exports = Router;