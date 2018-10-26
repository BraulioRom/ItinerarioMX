require('../config/config');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

async function cluster(vector){
    try {
        const { stdout, stderr } = await execFile('python3', [SCRIPTS+'/clasificador.py',vector]);
        return stdout        
    } catch (error) {
        throw 'MLError';
    }
}

module.exports = {cluster};