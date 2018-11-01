const statistics = require('../components/statistics');

async function prueba (req, res){  
    statistics.Update();
    res.status(200).json()
}

module.exports = prueba;