const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

const players = []

class Player {
    constructor(id) {
        this.id = id
        this.inBattle = false
        this.attacks = [] // nuevo
    }

    assignMokepon(mokepon) {
        this.mokepon = mokepon
    }

    updatePosition(x, y) {
        this.x = x
        this.y = y
    }
}
app.post("/JavaPlatzis/:playerId/attack", (req, res) => {
    const playerId = req.params.playerId
    const attack = req.body.attack
    const player = players.find(p => p.id === playerId)
    if (player && attack) {
        player.attacks.push(attack)
        res.json({ ok: true })
    } else {
        res.json({ ok: false })
    }
})

// Endpoint para consultar ataques del enemigo
app.get("/JavaPlatzis/:enemyId/attacks", (req, res) => {
    const enemyId = req.params.enemyId
    const enemy = players.find(p => p.id === enemyId)
    if (enemy) {
        res.json({ attacks: enemy.attacks })
    } else {
        res.json({ attacks: [] })
    }
})

class Mokepon {
    constructor(name) {
        this.name = name
    }
}
app.get("/join", (req, res) => {
    const id = `${Math.random()}`
    const player = new Player(id)
    players.push(player)
    console.log('join player', player)
    console.log('join players', players)
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.send(id)
})

app.post("/reset", (req, res) => {
    players.length = 0
    res.send("Players reset")
})

app.post("/JavaPlatzis/:playerId", (req, res) => {
    const playerId = req.params.playerId || ""
    const name = req.body.mokepon || ""
    const mokepon = new Mokepon(name)

    const playerIndex = players.findIndex((player) => playerId === player.id)

    if (playerIndex >= 0) {
        players[playerIndex].assignMokepon(mokepon)
    }

    console.log(players)
    console.log(playerId)
    res.end()
})

app.post("/JavaPlatzis/:playerId/position", (req, res) => {
    const playerId = req.params.playerId
    const { x, y } = req.body

    const playerIndex = players.findIndex((p) => p.id === playerId)
    if (playerIndex >= 0) {
        players[playerIndex].x = x
        players[playerIndex].y = y
    }

   
    const enemies = players.filter((p) => p.id !== playerId)

    res.json({ enemies })
})

// Ejemplo de endpoint robusto:
app.post("/JavaPlatzis/:playerId/battle", (req, res) => {
    const playerId = req.params.playerId
    const enemyId = req.body.enemyId

    const player = players.find(p => p.id === playerId)
    const enemy = players.find(p => p.id === enemyId)

    // Si ambos existen
    if (player && enemy) {
        // Si ambos ya están en batalla entre sí, permite la batalla 
        if (
            player.inBattle && enemy.inBattle &&
            player.enemyId === enemy.id && enemy.enemyId === player.id
        ) {
            return res.json({ ok: true })
        }

        // Si alguno ya está en batalla con otro, rechaza (si es un tercer jugador)
        if (player.inBattle || enemy.inBattle) {
            return res.json({ ok: false, message: "One or both players are already in battle" })
        }

        // Marca ambos como en batalla entre sí
        player.inBattle = true
        player.enemyId = enemy.id
        enemy.inBattle = true
        enemy.enemyId = player.id

        return res.json({ ok: true })
    }
    res.json({ ok: false })
})

app.get("/JavaPlatzis/:playerId/battle", (req, res) => {
    const playerId = req.params.playerId
    const player = players.find(p => p.id === playerId)
    res.json({ inBattle: !!(player && player.inBattle) })
})


app.listen(8080, () => {
    console.log("Server Running")
})
