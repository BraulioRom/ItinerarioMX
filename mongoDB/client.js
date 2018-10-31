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
        await client.connect();
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
        await client.connect();
        const db = client.db(MONGO_DB);
        let r = await db.collection('users').insertOne(obj);
    } catch (error) {
        throw 'MongoCreate';
    }
}

async function search(id, psw) {
    try {
        pssw = typeof psw == 'undefined' ? ':)' : psw;
        await client.connect();
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

        await client.connect();        
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
        await client.connect();
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
        await client.connect();
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
        await client.connect();
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
        await client.connect();
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
        await client.connect();
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
    return salida
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
        await client.connect();        
        const db = client.db(MONGO_DB);
        var cursor = await db.collection('lugares').find(query).project(projection).toArray();         
        return cursor
        
    } catch (error) {
        console.log(error);
        
        if (error == 'MongoLugarError') throw 'MongoLugarError';
        throw 'MongoTopten';
    }
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
    getLugar //para actualizar topten
};