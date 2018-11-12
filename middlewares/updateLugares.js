async function prueba (req, res){  
    try {        
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

module.exports = prueba;