require('../config/config');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

async function recomendador(correo){
    try {
        const { stdout, stderr } = await execFile('python3', [SCRIPTS+'/RecSys.py',correo]);
        return stdout        
    } catch (error) {
        throw 'MLError';
    }
}

module.exports = {recomendador};
