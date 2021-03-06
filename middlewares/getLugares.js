const mongo = require('../mongoDB/client');

async function prueba (req, res){  
    try {
        let data = await mongo.getLugares();
        res.status(200).json({ok:true , data});
    } catch (error) {
        switch (error) {
            case 'MongoGetLugares':
                res.status(202).json({ok:false , msg: 'MongoGetLugares'});
                break;
            default:
                res.status(503).json({ok:false , msg: 'Server unavailable'});
                break;
        }
    }
}

module.exports = prueba;