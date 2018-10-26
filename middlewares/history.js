const mongo = require('../mongoDB/client')

async function prueba (req, res){  
    try {
        //hago el registro 
        //cosulto simsmatrix
        //borro n y actualizo firebase
        let places= JSON.parse(req.body.lugares);               
        places.forEach(lugar => {
            if (lugar.registro) mongo.historial(req.body.usuario, lugar.id);//console.log(lugar);
        });
        res.status(200).json({ok:true , msg:'History ok'})
    } catch (error) {
        switch (error) {
            case 'UserUnknown':
                res.status(400).json({ok:false , msg: 'UserUnknown'});
                break;
            default:
                res.status(503).json({ok:false , msg: 'Server unavailable'});
                break;
        }
    }
}

module.exports = prueba;