const mongo = require('../mongoDB/client');

async function prueba (req, res){  
    try {
        let data = await mongo.getAdmins();
        res.status(200).json({ok:true , data});
    } catch (error) {
        switch (error) {
            case 'MongoGetAdmins':
                res.status(200).json({ok:false , msg: 'MongoGetAdmins'});
                break;
            default:
                res.status(200).json({ok:false , msg: 'Server unavailable'});
                break;
        }
    }
}

module.exports = prueba;