const ML = require('../ML/cluster');
const mongo = require('../mongoDB/client');
const fire = require('../firebase/firebase');
const topten = require('../components/toptens');
const statistics = require('../components/statistics');


async function signup (req, res){   
    try {
        //valido que no existe un usuario igual
        await mongo.exist(req.body.correo);
        //obtengo referencia
        let docRef = await fire.getReference('users');
        //clasifico
        let clus = await ML.cluster(req.body.vector);        
        //genero top personal
        await topten.personal(clus.trim(),docRef.path);
        //creo registro
        mongo.create({email: req.body.correo, provider: req.body.proveedor, vector: req.body.vector, psw: req.body.contrasena || ':)', firebase: docRef.path, label: clus.trim()});
        //estadisiticas
        statistics.Update();
        //respuestas
        res.status(200).json({ok:true , urlfirebase:docRef.path});
    } catch (error) {
        switch (error) {
            case 'UserExist':
                res.status(400).json({ok:false , msg: 'Already exist'});
                break;
            default:
                res.status(503).json({ok:false , msg: 'Server unavailable'});
                break;
        }
    }
}

module.exports = signup;