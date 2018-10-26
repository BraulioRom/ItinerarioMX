const mongo = require('../mongoDB/client');

async function prueba (req, res){  
    try {
        let docs = await mongo.search(req.body.correo, req.body.contrasena);    
        res.status(200).json({ok: true , urlfirebase: docs[0].firebase});
    } catch (error) {
        switch (error) {
            case 'UserUnknown':
                res.status(200).json({ok:false , msg: 'UserUnknown'});
                break;
            default:
                res.status(503).json({ok:false , msg: 'Server unavailable'});
                break;
        }
    }
}

module.exports = prueba;