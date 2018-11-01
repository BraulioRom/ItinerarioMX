const mongo = require('../mongoDB/client');
const fire = require('../firebase/firebase');

async function Update(){
    let datos = await mongo.stats();    
    fire.updateStats(datos)
}

module.exports={Update};