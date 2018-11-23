const mongo = require('../mongoDB/client');

async function prueba (req, res){  
    try {
        await mongo.deleteLugares(req.query.id)
        res.status(200).json({ok:true});
    } catch (error) {
        switch (error) {
            case 'MongoDeleteLugares':
                res.status(200).json({ok:false , msg: 'Service unavailable'});
                break;
            default:
                res.status(200).json({ok:false , msg: 'Internal Server Error'});
                break;
        }
    }
}

module.exports = prueba;