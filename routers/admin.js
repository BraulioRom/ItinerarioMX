//modulos
const express = require('express');
const Router = express.Router();

Router.route('/lugares')
.get(require('../middlewares/getLugares'))
.delete(require('../middlewares/deleteLugares'));

Router.route('/admins')
.get(require('../middlewares/getAdmins'))
.post(require('../middlewares/crearAdmins'))
.delete(require('../middlewares/deleteAdmins'));

Router.post('/login', require('../middlewares/entra'))

module.exports = Router;