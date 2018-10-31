async function getTiempo(hora, minuto=0,duracion=0){
    return (hora*60)+minuto+duracion
}

module.exports={getTiempo};