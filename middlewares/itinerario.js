const tiempo = require('../components/tiempo');
const mongo = require('../mongoDB/client')

async function prueba (req, res){  
    //obtengo hora inicio
    let horaInicio=JSON.parse(req.body.horaInicio)
    let horaFin=JSON.parse(req.body.horaFin)
    let salida = req.body.salida
    let dias=['domingo','lunes','martes','miercoles','jueves','viernes','sabado']
    let dia=dias[req.body.dia]

    //reglas
    let breakfast = {
        hora: 7,
        minuto: 40,
        duracion: 80
    }
    let coffee = {
        horam: 9,
        minutom: 20,
        horat: 16,
        minutot: 20,
        duracion: 40
    }
    let lunch = {
        hora: 15,
        minuto: 20,
        duracion: 100
    }
    //estandarizo tiempos
    let algo =horaFin.hora<horaInicio.hora?horaFin.hora+24:horaFin.hora;
    var disp = [await tiempo.getTiempo(horaInicio.hora,horaInicio.minuto),
        await tiempo.getTiempo(algo,horaFin.minuto)];

    let desa= [await tiempo.getTiempo(breakfast.hora),
        await tiempo.getTiempo(breakfast.hora,breakfast.minuto),
        await tiempo.getTiempo(breakfast.hora,0,breakfast.duracion)];
    let cafe= [await tiempo.getTiempo(coffee.horam),
        await tiempo.getTiempo(coffee.horam,coffee.minutom),
        await tiempo.getTiempo(coffee.horam,0,coffee.duracion),
        await tiempo.getTiempo(coffee.horat),
        await tiempo.getTiempo(coffee.horat,coffee.minutot),
        await tiempo.getTiempo(coffee.horat,0,coffee.duracion)];
    let comi= [await tiempo.getTiempo(lunch.hora),
        await tiempo.getTiempo(lunch.hora,lunch.minuto),
        await tiempo.getTiempo(lunch.hora,0,lunch.duracion)];
    //obtenemos primer lugar
    var propuesta=[];
    if (
        (disp[0]<disp[1])&& //tengo tiempo disponible?
        (
            ((disp[0]<=desa[0])&&(desa[0]<=disp[1]))  //primer horario en tiempo disponible
            ||                         // o
            ((disp[0]<=desa[1])&&(desa[1]<=disp[1]))  //segundo horario en tiempo disponible  
        )
        ){
        propuesta.push(await mongo.getPlace('restaurante',disp[0],dia,salida))
        disp[0]+=breakfast.duracion //actualizo tiempo disponible
        }
    if (
        (disp[0]<disp[1])&& //tengo tiempo disponible?
        (
            ((disp[0]<=cafe[0])&&(cafe[0]<=disp[1]))  //primer horario en tiempo disponible
            ||                         // o
            ((disp[0]<=cafe[1])&&(cafe[1]<=disp[1]))  //segundo horario en tiempo disponible  
        )
        ){
        propuesta.push(await mongo.getPlace('cafe',disp[0],dia,salida))
        disp[0]+=coffee.duracion
    }
    if (
        (disp[0]<disp[1])&& //tengo tiempo disponible?
        (
            ((disp[0]<=comi[0])&&(comi[0]<=disp[1]))  //primer horario en tiempo disponible
            ||                         // o
            ((disp[0]<=comi[1])&&(comi[1]<=disp[1]))  //segundo horario en tiempo disponible  
        )
        ){
        propuesta.push(await mongo.getPlace('restaurante',disp[0],dia,salida))
        disp[0]+=lunch.duracion
    }
    if (
        (disp[0]<disp[1])&& //tengo tiempo disponible?
        (
            ((disp[0]<=cafe[3])&&(cafe[3]<=disp[1]))  //primer horario en tiempo disponible
            ||                         // o
            ((disp[0]<=cafe[4])&&(cafe[4]<=disp[1]))  //segundo horario en tiempo disponible  
        )
        ){
        propuesta.push(await mongo.getPlace('cafe',disp[0],dia,salida))
        disp[0]+=coffee.duracion
    }
    
    if (
        (disp[0]<disp[1]) && (disp[1]>1020)
        ) //tengo tiempo disponible?
        {
        propuesta.push(await mongo.getPlace('bar',disp[0],dia,salida))
        disp[0]+=100
        propuesta.push(await mongo.getPlace('bar',disp[0],dia,salida))
    }
    res.status(200).json(propuesta)
}

module.exports = prueba;