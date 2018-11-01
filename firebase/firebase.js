const admin = require('firebase-admin');

var serviceAccount = require('../config/itinerariomx-cee20-1dbc473b8a97.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var db = admin.firestore();
db.settings({timestampsInSnapshots: true});

async function getReference(coll) {
    return db.collection(coll).doc();
}

async function personalTop(reference,data){
  try {
    data.forEach(element => {
      db.collection(reference+'/topten').add(JSON.parse(JSON.stringify(element)))
    });
  } catch (error) {
    throw 'FirebasePersonal'
  }
}

async function globalTop(data){
  try {
    data.forEach(element => {
      db.collection('topten').add(JSON.parse(JSON.stringify(element)))
    });
  } catch (error) {
    throw 'FirebaseGlobal'
  }
}

function deleteCollection(collectionPath, batchSize) {
  var collectionRef = db.collection(collectionPath);
  var query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, batchSize, resolve, reject);
  });
}

function deleteQueryBatch(db, query, batchSize, resolve, reject) {
  query.get()
      .then((snapshot) => {
        // When there are no documents left, we are done
        if (snapshot.size == 0) {
          return 0;
        }

        // Delete documents in a batch
        var batch = db.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        return batch.commit().then(() => {
          return snapshot.size;
        });
      }).then((numDeleted) => {
        if (numDeleted === 0) {
          resolve();
          return;
        }

        // Recurse on the next process tick, to avoid
        // exploding the stack.
        process.nextTick(() => {
          deleteQueryBatch(db, query, batchSize, resolve, reject);
        });
      })
      .catch(reject);
}

async function getDocuments(coll) {
  return db.collection(coll).get();
}
async function deleteDocument(ref) {
  return db.doc(ref).delete();
}

async function updateStats(data) {
  db.collection('stats').doc('lugares').update(data.lugares)
  db.collection('stats').doc('usuarios').update(data.usuarios)
  db.collection('stats').doc('historial').update(data.visitas)
}
module.exports={getReference , personalTop, globalTop, deleteCollection,getDocuments,deleteDocument,updateStats};