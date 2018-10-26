const ML = require('../ML/cluster');
const mongo = require('../mongoDB/client');
const fire = require('../firebase/firebase');
const topten = require('../components/toptens');

async function prueba (req, res){  
    try {
        console.log(req.body);
        
        //clasifico
        let clus = await ML.cluster(req.body.vector);  
        //busco registro
        let datos = await mongo.check(req.body.correo);
        //genero objeto a actualizar
        let data = (clus.trim() == datos[0].label)?{'vector':req.body.vector}:{'vector':req.body.vector, 'label':clus.trim()};         
        //espero a registrar actualizacion
        await mongo.update(req.body.correo,data);
        //si el nuevo label es distinto al anterior
        if (clus.trim() != datos[0].label) {
            fire.deleteCollection(datos[0].firebase+'/topten',10).then(()=>{
                //actualizo topten
                topten.personal(clus.trim(),datos[0].firebase);
            });
        }
        res.status(200).json({ok:true , msg:'Updated data'})
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