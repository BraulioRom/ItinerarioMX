//modulos 
const tiempo = require('../components/tiempo');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

//configuraciones
require('../config/config');

//cliente
const client = new MongoClient(MONGO_URL, {
    autoReconnect: true,
    reconnectTries: 3,
    useNewUrlParser: true
});

async function exist(id) {
    try {
        if(!client.isConnected()){
            await client.connect();
        }
        const db = client.db(MONGO_DB);
        let flag = await db.collection('users').find({
            'email': id
        }).count();
        if (flag != 0) throw 'UserExist';
    } catch (error) {
        throw error;
    }
}

async function create(obj) {
    try {
        if(!client.isConnected()){
            await client.connect();
        } 
        const db = client.db(MONGO_DB);
        let r = await db.collection('users').insertOne(obj);
    } catch (error) {
        throw 'MongoCreate';
    }
}

async function search(id, psw) {
    try {
        pssw = typeof psw == 'undefined' ? ':)' : psw;
        if(!client.isConnected()){
            await client.connect();
        }
        const db = client.db(MONGO_DB);
        let docs = await db.collection('users').find({
            'email': id,
            'psw': pssw
        }).project({
            '_id': 0,
            'firebase': 1
        }).toArray();
        if (docs.length == 0) throw 'UserUnknown';
        return docs;
    } catch (error) {
        if (error == 'UserUnknown') throw 'UserUnknown';
        throw 'MongoSearch';
    }
}

async function topten(clus=100) {
    try {
        var query = (clus < 10 ) ? {"cluster": clus}:{};
        var projection = {
            "img": 1.0,
            "location": 1.0,
            "name": 1.0,
            "description": 1.0,
            "schedule": 1.0,
            "_id": 0.0
        };
        var sort = [ ["ranking", -1] ];
        var limit = 10;
        if(!client.isConnected()){
            await client.connect(); 
        }       
        const db = client.db(MONGO_DB);
        var cursor = await db.collection('lugares').find(query).project(projection).sort(sort).limit(limit).toArray();    
        if (cursor.length == 0) throw 'MongotopError';
        return cursor
        
    } catch (error) {
        if (error == 'MongotopError') throw 'MongotopError';
        throw 'MongoTopten';
    }
}

async function recovery(email) {
    try {
        if(!client.isConnected()){
            await client.connect();
        }
        const db = client.db(MONGO_DB);
        var query = {"email": email, "provider":"0"};
        var projection = {
            "psw": 1.0,
            "_id": 0.0
        };
        var cursor = await db.collection('users').find(query).project(projection).toArray();    
        if (cursor.length == 0) throw 'NotAuthorized';
        return cursor
        
    } catch (error) {
        if (error == 'NotAuthorized') throw 'NotAuthorized';
        throw 'MongoRecovery';
    }
}

async function check(id) {
    try {
        if(!client.isConnected()){
            await client.connect();
        }
        const db = client.db(MONGO_DB);
        let docs = await db.collection('users').find({
            'email': id
        }).project({
            '_id': 0,
            'label': 1,
            'ref': 1,
            'firebase': 1
        }).toArray();
        if (docs.length == 0) throw 'UserUnknown';
        return docs;
    } catch (error) {
        if (error == 'UserUnknown') throw 'UserUnknown';
        throw 'MongoCheck';
    }
}

async function update(id,data) {
    try {
        if(!client.isConnected()){
            await client.connect();
        }
        const db = client.db(MONGO_DB);
        let r = await db.collection('users').updateOne({email:id},{ $set: data});        
        if (r.matchedCount != 1) throw 'UserUnknown';
    } catch (error) {
        if (error == 'UserUnknown') throw 'UserUnknown';
        else throw 'MongoCheck';
    }
}

async function historial(usuario,lugares) {
    try {
        if(!client.isConnected()){
            await client.connect();
        }
        const db = client.db(MONGO_DB);
        let r = await db.collection('history').updateOne(
            {lugar:lugares},
            {$set:{lugar:lugares},
            $addToSet:{visitantes:{
                $each : [usuario]
            }}},
            {upsert:true});  

        //if (r.ok != 1) throw 'UserUnknown';
    } catch (error) {
        if (error == 'UserUnknown') throw 'UserUnknown';
        throw 'MongoCheck';
    }
}

async function getPlace(categoria,hora,dia,salida) {
    try {
        let query={}
        query['categoria']= categoria
        query['plan']= salida
        if(!client.isConnected()){
            await client.connect();
        }
        const db = client.db(MONGO_DB);
        let docs = await db.collection('lugares').find(query).project({
            '_id': 1,
            'name': 1,
            'img':1,
            'location':1,
            'schedule':1
        }).toArray();
        if (docs.length < 4){
            query={}
            query['categoria']= categoria
            docs = await db.collection('lugares').find(query).project({
                '_id': 1,
                'name': 1,
                'img':1,
                'location':1,
                'schedule':1
            }).toArray();
        }
        let posibles = await checadia(docs,hora,dia);
        let r = Math.floor(Math.random() * Math.floor(posibles.length));
        return posibles[r];
    } catch (error) {
        throw 'MongogetPlace';
    }
}

async function checadia(documents,hora,dia) {
    let salida=[]
    for (var doc of documents) {
        if ('schedule' in doc){
            if (dia in doc.schedule){
                let vector=doc.schedule[dia].split(' ');
                let min = vector[0].split(':')
                let max = vector[2].split(':')
                let tmin = await tiempo.getTiempo(parseInt(min[0]),parseInt(min[1]))
                let tmax = await tiempo.getTiempo(parseInt(max[0]),parseInt(max[1]))
                if((tmin<hora) && (hora<tmax)){
                    salida.push(doc)
                }
            }
        }
    }
    let nsalida=[];
    for (const i of salida) {
        i['id']=i._id
        nsalida.push(i)
    }
    return nsalida
}

async function getLugar(id) {
    try {        
        let ids = new ObjectID()
        var query = {"_id": new ObjectID(id)}
        console.log(query);
        
        var projection = {
            "img": 1.0,
            "location": 1.0,
            "name": 1.0,
            "description": 1.0,
            "schedule": 1.0,
            "_id": 0.0
        };
        if(!client.isConnected()){
            await client.connect(); 
        }       
        const db = client.db(MONGO_DB);
        var cursor = await db.collection('lugares').find(query).project(projection).toArray();         
        return cursor
        
    } catch (error) {
        console.log(error);
        
        if (error == 'MongoLugarError') throw 'MongoLugarError';
        throw 'MongoTopten';
    }
}
async function stats() {
    try {
        if(!client.isConnected()){
            await client.connect();
        }
        const db = client.db(MONGO_DB);
        let nlugares = await db.collection('lugares').find().count();
        let c1 = await db.collection('lugares').find({cluster:'0'}).count();
        let c2 = await db.collection('lugares').find({cluster:'1'}).count();
        let c3 = await db.collection('lugares').find({cluster:'2'}).count();
        let c4 = await db.collection('lugares').find({cluster:'3'}).count();
        let c5 = await db.collection('lugares').find({cluster:'4'}).count();
        let c6 = await db.collection('lugares').find({cluster:'5'}).count();
        let r = await db.collection('lugares').find().project({'_id':0.0,'ranking':1.0}).toArray();
        let rc1 = await db.collection('lugares').find({cluster:'0'}).project({'_id':0.0,'ranking':1.0}).toArray();
        let rc2 = await db.collection('lugares').find({cluster:'1'}).project({'_id':0.0,'ranking':1.0}).toArray();
        let rc3 = await db.collection('lugares').find({cluster:'2'}).project({'_id':0.0,'ranking':1.0}).toArray();
        let rc4 = await db.collection('lugares').find({cluster:'3'}).project({'_id':0.0,'ranking':1.0}).toArray();
        let rc5 = await db.collection('lugares').find({cluster:'4'}).project({'_id':0.0,'ranking':1.0}).toArray();
        let rc6 = await db.collection('lugares').find({cluster:'5'}).project({'_id':0.0,'ranking':1.0}).toArray();
        let rcaf = await db.collection('lugares').find({categoria:'cafe'}).project({'_id':0.0,'ranking':1.0}).toArray();
        let rres = await db.collection('lugares').find({categoria:'restaurante'}).project({'_id':0.0,'ranking':1.0}).toArray();
        let rbar = await db.collection('lugares').find({categoria:'bar'}).project({'_id':0.0,'ranking':1.0}).toArray();
        let caf = await db.collection('lugares').find({categoria:'cafe'}).count();
        let res = await db.collection('lugares').find({categoria:'restaurante'}).count();
        let bar = await db.collection('lugares').find({categoria:'bar'}).count();
        let usc1 = await db.collection('users').find({label:'0'}).count();
        let usc2 = await db.collection('users').find({label:'1'}).count();
        let usc3 = await db.collection('users').find({label:'2'}).count();
        let usc4 = await db.collection('users').find({label:'3'}).count();
        let usc5 = await db.collection('users').find({label:'4'}).count();
        let usc6 = await db.collection('users').find({label:'5'}).count();
        let usco = await db.collection('users').find({provider:'Correo'}).count();
        let usfb = await db.collection('users').find({provider:'Facebook'}).count();
        let usgo = await db.collection('users').find({provider:'Google'}).count();

        let nusuarios = await db.collection('users').find().count();
        let nvisitas = await db.collection('history').find().count();
        return {
                "lugares":{
                "lugares":nlugares,
                "c1":c1,
                "c2":c2,
                "c3":c3,
                "c4":c4,
                "c5":c5,
                "c6":c6,
                "caf":caf,
                "res":res,
                "bar":bar,
                "ra": await suma(r,1),
                "rac1": await suma(rc1,1),
                "rac2": await suma(rc2,1),
                "rac3": await suma(rc3,1),
                "rac4": await suma(rc4,1),
                "rac5": await suma(rc5,1),
                "rac6": await suma(rc6,1),
                "rcaf": await suma(rcaf,1),
                "rres": await suma(rres,1),
                "rbar": await suma(rbar,1)
            },
            "usuarios":{
                "usuarios":nusuarios,
                "usc1": usc1,
                "usc2": usc2,
                "usc3": usc3,
                "usc4": usc4,
                "usc5": usc5,
                "usc6": usc6,
                "usco": usco,
                "usfb": usfb,
                "usgo": usgo
            },
            "visitas":{
                "visitas":[nvisitas, nlugares]
            }
        }
    } catch (error) {
        throw 'MongoStats';
    }
}
async function suma(cursor,flag){
    let suma=0;
    let max=0;
    let min=1;
    if (cursor.length > 0){
        for (const i of cursor) {
            suma += i.ranking
            if (flag == 1){
                if (i.ranking > max) max=i.ranking
                if (i.ranking < min) min=i.ranking
            }
        }
        suma = suma/cursor.length
    }
    let salida = flag == 1 ? [suma, max, min] : suma;
    return salida;
}

module.exports = {
    exist,  //hay registro de un usuario
    create, //crea registro de un usuario
    search, //Busca el usuario y devuelve firebase
    topten, //genera el topten
    recovery, //busca el usuario y recupera contraseña
    check,  //checa si existe el usaior y devuelve label y vector
    update, //actualiza un usuario
    historial, //hace el registro de lugares para un usuario
    getPlace, //para el itineraroi
    getLugar, //para actualizar topten
    stats
};