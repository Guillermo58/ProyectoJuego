const express = require("express")

const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

const jugadores = []

class Jugador{
    constructor(id){
        this.id = id
    }

    asignarMokepon(mokepon){
        this.mokepon = mokepon
    }
    actualizarPosicion(x,y){
        this.x = x
        this.y = y
    }
}

class Mokepon{
    constructor(nombre){
        this.nombre = nombre
    }
}

app.get("/unirse", (req, res ) => {
    const id = `${Math.random()}`

    const jugador = new Jugador(id)

    jugadores.push(jugador)

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.send(id)

})

app.post("/JavaPlatzis/:jugadorId", (req, res) => {
    const jugadorId = req.params.jugadorId || ""
    const nombre = req.body.mokepon || ""
    const mokepon = new Mokepon(nombre)

    const jugadorIndex = jugadores.findIndex((jugador) => jugadorId === jugador.id)
    
    if(jugadorIndex >= 0){
        jugadores[jugadorIndex].asignarMokepon(mokepon)
    }
    console.log(jugadores)
    console.log(jugadorId)
    res.end()
})


app.post("/JavaPlatzis/:jugadorId/posicion", (req, res) =>{
    const jugadorId = req.params.jugadorId
    const { x, y } = req.body

    const jugadorIndex = jugadores.findIndex(j => j.id === jugadorId)
    if (jugadorIndex >= 0){
        jugadores[jugadorIndex].x = x
        jugadores[jugadorIndex].y = y
    }

    // asegurarse de enviar siempre un array
    const enemigos = jugadores.filter(j => j.id !== jugadorId)

    res.json({ enemigos })   //  muy importante
})


app.listen(8080, () => {
    console.log("Servidor Funcionando")
})
