const mongo = require('../mongoDB/client');

async function prueba (req, res){  
    try {
        await mongo.entra(req.body)
        res.status(200).json({ok:true});
    } catch (error) {
        switch (error) {
            case 'DoesnExist':
                res.status(200).json({ok:false});
                break;
            default:
                res.status(200).json({ok:false , msg: 'Internal Server Error'});
                break;
        }
    }
}

module.exports = prueba;