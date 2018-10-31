const mongo = require('../mongoDB/client')
const fire = require('../firebase/firebase')
const RecSys = require('../ML/recomendador')

async function prueba (req, res){  
    try {
        //hago el registro 
        let places= JSON.parse(req.body.lugares);               
        places.forEach(lugar => {
            if (lugar.registro) mongo.historial(req.body.usuario, lugar.id);
        });
        //checo si hay recomendaciones
        let recs = await RecSys.recomendador(req.body.usuario)
        let jsn =JSON.parse(recs.replace(/'/g, '"'));
        let lugares=[];
        if(jsn.length > 4){
            //obtengo aleatorio 4
            let i=0;
            do {
                i++;
                let r = Math.floor(Math.random() * Math.floor(jsn.length));
                lugares.push(jsn[r])
            } while (i<4);
            //obtengo referencia del usuario
            let ref = await mongo.check(req.body.usuario)
            let docs = await fire.getDocuments(ref[0].firebase+'/topten')            
            //lleno con las recomendaciones
            let contador = 0
            for (const l of lugares) {
                let data = await mongo.getLugar(l)
                if(data.length != 0){
                    await fire.personalTop(ref[0].firebase,data)
                    contador++;
                } 
            }
            //elimino exedente
            for (let index = 0; index < contador; index++) {
                let r = Math.floor(Math.random() * Math.floor(docs.docs.length));
                let algo= await fire.deleteDocument(docs.docs[r].ref.path)
            }
        }else{
            //occupo los que hay 
            lugares=jsn
            //referencia
            let ref = await mongo.check(req.body.usuario)
            //obtengo los documentos y elimino el exedente
            let docs = await fire.getDocuments(ref[0].firebase+'/topten')            
            //lleno con las recomendaciones
            let contador = 0
            for (const l of lugares) {
                let data = await mongo.getLugar(l)
                if(data.length != 0){
                    await fire.personalTop(ref[0].firebase,data)
                    contador++;
                } 
            }
            //elimino exedente
            for (let index = 0; index < contador; index++) {
                let r = Math.floor(Math.random() * Math.floor(docs.docs.length));
                let algo= await fire.deleteDocument(docs.docs[r].ref.path)
            } 
        }
        res.status(200).json({ok:true , msg:'History ok'})
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