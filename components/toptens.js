const mongo = require('../mongoDB/client');
const fire = require('../firebase/firebase');

async function personal(label , referencia) {
    try {
        cursor = await mongo.topten(label)      
        await fire.personalTop(referencia , cursor)
    } catch (error) {       
        if (error == 'FirebasePersonal') throw 'ToptenFirebase';
        throw 'TopPersonal';
    }
}
async function global() {
    try {
        cursor = await mongo.topten()      
        await fire.globalTop(cursor)
    } catch (error) {       
        if (error == 'FirebaseGlobal') throw 'FirebaseGlobal';
        throw 'TopPersonal';
    }
}

module.exports = {personal, global};