const mongo = require('../mongoDB/client');

async function prueba (req, res){  
    try {
        await mongo.crearAdmin(req.body)
        res.status(200).json({ok:true});
    } catch (error) {
        switch (error) {
            case 'UserExist':
                res.status(200).json({ok:false , msg: 'Already exist'});
                break;
            default:
                res.status(200).json({ok:false , msg: 'Internal Server Error'});
                break;
        }
    }
}

module.exports = prueba;