//modulos
const express = require('express');
const morgan = require('morgan');
const topten = require('./components/toptens');
const fire = require('./firebase/firebase')
const statistics = require('./components/statistics');


//configuraciones
require('./config/config');

//servidor
const server = express();

//routers
const movilRouter = require('./routers/movil');

//global middlewares
server.use(morgan('common'));

server.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

server.use(express.urlencoded({ extended: false }));
server.use(express.json());

server.use('/movil',movilRouter);

//Initialize 
server.listen(NODE_PORT, (suc,err) =>{
    if (err) process.exit();
    console.log('Initializing server on: '+ NODE_PORT); 
});

//topten global descomentar cuando ya este todo listo evitar peticiones a firebase
/*
try {
    fire.deleteCollection('topten',10).then(()=>topten.global());
    statistics.Update();
} catch (error) {
    console.log(error);       
} */