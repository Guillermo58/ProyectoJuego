const sectionSelectAttack = document.getElementById('select-attack')
const sectionRestart = document.getElementById('restart')
const btnSelectPet = document.getElementById('button-select-pet')
const sectionSelectPet = document.getElementById('select-pet')
const btnRestart = document.getElementById('button-restart')
const spanPlayerPet = document.getElementById('player-pet')
const spanEnemyPet = document.getElementById('enemy-pet')
const spanPlayerLives = document.getElementById('player-lives')
const spanEnemyLives = document.getElementById('enemy-lives')
const messagesSection = document.getElementById('result')
const playerAttackLog = document.getElementById('player-attacks-list')
const enemyAttackLog = document.getElementById('enemy-attacks-list')
const cardsContainer = document.getElementById('cards-container')
const attacksContainer = document.getElementById('attacks-container')
const sectionViewMap = document.getElementById('view-map')
const map = document.getElementById('map')

let playerId = null
let enemyId = null
let mokepons = []
let enemyMokepons = []
let enemyAttacks = []
let petOptions
let inputCindrome
let inputIncredible
let inputFrozono
let playerPet
let playerPetObject
let mokeponAttacks
let enemyMokeponAttacks
let btnLightning
let btnSnow
let btnFire
let attackButtons = []
let playerAttacks = []
let indexPlayerAttack
let indexEnemyAttack
let playerWins = 0
let enemyWins = 0
let playerLives = 3
let enemyLives = 3
let canvas = map.getContext("2d")
let interval
let mapBackground = new Image()
mapBackground.src = './imagen/mokemap.png'
let inBattle = false

let mapWidth = Math.min(window.innerWidth - 40, 800)
let desiredHeight = mapWidth * 600 / 800
map.width = mapWidth
map.height = desiredHeight

class Mokepon {
    constructor(name, photo, life, mapPhoto, id = null) {
        this.id = id
        this.name = name
        this.photo = photo
        this.life = life
        this.attacks = []
        this.width = 80
        this.height = 80
        this.x = random(0, map.width - this.width)
        this.y = random(0, map.height - this.height)
        this.mapPhoto = new Image()
        this.mapPhoto.src = mapPhoto || photo
        this.speedX = 0
        this.speedY = 0
    }
    drawMokepon() {
        if (this.mapPhoto && this.mapPhoto.complete && this.mapPhoto.naturalWidth !== 0) {
            canvas.drawImage(this.mapPhoto, this.x, this.y, this.width, this.height)
        }
    }
}

let cindrome = new Mokepon('Cindrome', './imagen/png-clipart-the-incredibles-buddy-pine-illustration-syndrome-comics-and-fantasy-the-incredibles-thumbnail.png', 5, './imagen/png-clipart-the-incredibles-buddy-pine-illustration-syndrome-comics-and-fantasy-the-incredibles-thumbnail.png')
let incredible = new Mokepon('Incredible', './imagen/png-transparent-mr-incredibles-mr-incredible-youtube-elastigirl-frozone-dash-the-incredibles-superhero-fictional-character-pixar.png', 5)
let skull = new Mokepon('Frozono', './imagen/3135414-middle.png', 5)

const cindromeAttacks = [
    { name: '⚡', id: 'btn-lightning' },
    { name: '⚡', id: 'btn-lightning' },
    { name: '⚡', id: 'btn-lightning' },
    { name: '🔥', id: 'btn-fire' },
    { name: '❄️', id: 'btn-snow' },
]
cindrome.attacks.push(...cindromeAttacks)

const incredibleAttacks = [
    { name: '🔥', id: 'btn-fire' },
    { name: '🔥', id: 'btn-fire' },
    { name: '🔥', id: 'btn-fire' },
    { name: '⚡', id: 'btn-lightning' },
    { name: '❄️', id: 'btn-snow' },
]
incredible.attacks.push(...incredibleAttacks)

const skullAttacks = [
    { name: '❄️', id: 'btn-snow' },
    { name: '❄️', id: 'btn-snow' },
    { name: '❄️', id: 'btn-snow' },
    { name: '⚡', id: 'btn-lightning' },
    { name: '🔥', id: 'btn-fire' },
]
skull.attacks.push(...skullAttacks)

mokepons.push(cindrome, incredible, skull)

function startGame() {
    sectionSelectAttack.style.display = 'none'
    sectionViewMap.style.display = 'none'
    mokepons.forEach((mokepon) => {
        petOptions = `
        <input type="radio" name="pet" id="${mokepon.name}"/>
        <label class="mokepon-card" for="${mokepon.name}">
        <p>${mokepon.name}</p>
        <img src="${mokepon.photo}" alt="${mokepon.name}">
        </label>
        `
        cardsContainer.innerHTML += petOptions
    })
    inputCindrome = document.getElementById('Cindrome')
    inputIncredible = document.getElementById('Incredible')
    inputFrozono = document.getElementById('Frozono')

    btnSelectPet.addEventListener('click', selectPet)
    btnRestart.addEventListener('click', restartGame)

    joinGame()
}

function joinGame() {
    fetch("http://localhost:8080/join")
        .then(function (res) {
            if (res.ok) {
                res.text()
                    .then(function (response) {
                        console.log(response)   
                        playerId = response
                    })
            }
        })
}

function selectPet() {
    sectionSelectPet.style.display = 'none'
    let selected = false

    if (inputCindrome.checked) {
        spanPlayerPet.innerHTML = "Cindrome"
        playerPet = "Cindrome"
        selected = true
    } else if (inputIncredible.checked) {
        spanPlayerPet.innerHTML = "Incredible"
        playerPet = "Incredible"
        selected = true
    } else if (inputFrozono.checked) {
        spanPlayerPet.innerHTML = "Frozono"
        playerPet = "Frozono"
        selected = true
    }

    if (!selected) {
        // Mostrar mensaje visual y NO continuar con el juego
        sectionSelectPet.style.display = 'flex'
        messagesSection.innerHTML = "Por favor selecciona una mascota antes de continuar."
        return
    }

    sendPetSelection(playerPet)
    extractAttacks(playerPet)
    sectionViewMap.style.display = 'flex'
    startMap()
    pollBattleStatus()
}

function sendPetSelection(playerPet) {
    fetch(`http://localhost:8080/JavaPlatzis/${playerId}`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mokepon: playerPet })
    })
}

function extractAttacks(pet) {
    let attacks
    for (let i = 0; i < mokepons.length; i++) {
        if (pet === mokepons[i].name) {
            attacks = mokepons[i].attacks
        }
    }
    showAttacks(attacks)
}

function showAttacks(attacks) {
    attacksContainer.innerHTML = ""
    attacks.forEach((attack, idx) => {
        // El valor del ataque se guarda en un atributo data-attack
        const btn = document.createElement('button')
        btn.id = `btn-attack-${idx}`
        btn.className = 'attack-btn'
        btn.textContent = attack.name
        btn.setAttribute('data-attack', attack.id) // id representa el tipo de ataque
        attacksContainer.appendChild(btn)
    })
    attackButtons = document.querySelectorAll('.attack-btn')
    improvedAttackSequence(attacks)
}

function improvedAttackSequence() {
    document.getElementById('attack-counter').textContent = "Ataques seleccionados: 0/5"
    document.getElementById('player-attacks-list').innerHTML = ""
    messagesSection.innerHTML = "Tu turno para elegir ataque"; // Indicador de turno

    attackButtons.forEach((button, idx) => {
        button.addEventListener('click', (e) => {
            if (playerAttacks.length >= 5 || playerWins >= 3 || enemyWins >= 3) return

            let attackType = button.getAttribute('data-attack')
            let emoji = button.textContent
            let attackText = attackType === 'btn-fire' ? 'FIRE' :
                             attackType === 'btn-lightning' ? 'LIGHTNING' :
                             attackType === 'btn-snow' ? 'SNOW' : attackType

            playerAttacks.push(attackText)
            button.style.background = '#112f58'
            button.disabled = true

            fetch(`http://localhost:8080/JavaPlatzis/${playerId}/attack`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ attack: attackText })
            })

            // Mostrar ataque en lista del jugador
            const attackOrder = document.getElementById('player-attacks-list')
            const attackDiv = document.createElement('div')
            attackDiv.style.display = 'flex'
            attackDiv.style.alignItems = 'center'
            attackDiv.style.marginBottom = '4px'
            attackDiv.innerHTML = `<span style="font-size:2rem; margin-right:6px;">${emoji}</span><span>${attackText}</span>`
            attackOrder.appendChild(attackDiv)

            // Actualizar contador
            const attackCounter = document.getElementById('attack-counter')
            attackCounter.textContent = `Ataques seleccionados: ${playerAttacks.length}/5`

            // Bloquear botones si termina la partida
            if (playerAttacks.length >= 5 || playerWins >= 3 || enemyWins >= 3) {
                attackButtons.forEach(btn => btn.disabled = true)
            }

            messagesSection.innerHTML = "Esperando al rival..."; 

            checkRoundResult()
        })
    })
    pollEnemyAttacks()
}

function checkRoundResult() {
    if (!enemyId) return
    const round = playerAttacks.length - 1
    fetch(`http://localhost:8080/JavaPlatzis/${enemyId}/attacks`)
        .then(res => res.json())
        .then(data => {
            const enemyAttacksNow = data.attacks || []
            if (enemyAttacksNow.length > round) {
                const playerAttack = playerAttacks[round]
                const enemyAttack = enemyAttacksNow[round]
                let result = ""
                let winnerName = spanEnemyPet.innerHTML || "Enemigo"
                let emojiPlayer = playerAttack === 'FIRE' ? '🔥' : playerAttack === 'LIGHTNING' ? '⚡' : '❄️'
                let emojiEnemy = enemyAttack === 'FIRE' ? '🔥' : enemyAttack === 'LIGHTNING' ? '⚡' : '❄️'

                // Mostrar ataque enemigo en lista
                const enemyOrder = document.getElementById('enemy-attacks-list')
                const enemyDiv = document.createElement('div')
                enemyDiv.style.display = 'flex'
                enemyDiv.style.alignItems = 'center'
                enemyDiv.style.marginBottom = '4px'
                enemyDiv.innerHTML = `<span style="font-size:2rem; margin-right:6px;">${emojiEnemy}</span><span>${enemyAttack}</span>`
                enemyOrder.appendChild(enemyDiv)

                // Lógica de combate
                if (playerAttack === enemyAttack) {
                    result = `Ronda ${round + 1}: EMPATE<br>Tu ataque: ${emojiPlayer} ${playerAttack} - ${winnerName}: ${emojiEnemy} ${enemyAttack}`
                } else if (
                    (playerAttack == 'FIRE' && enemyAttack == 'SNOW') ||
                    (playerAttack == 'LIGHTNING' && enemyAttack == 'FIRE') ||
                    (playerAttack == 'SNOW' && enemyAttack == 'LIGHTNING')
                ) {
                    result = `Ronda ${round + 1}: GANASTE<br>Tu ataque: ${emojiPlayer} ${playerAttack} - ${winnerName}: ${emojiEnemy} ${enemyAttack}`
                    playerWins++
                    spanPlayerLives.innerHTML = playerWins
                } else {
                    result = `Ronda ${round + 1}: PERDISTE<br>Tu ataque: ${emojiPlayer} ${playerAttack} - ${winnerName}: ${emojiEnemy} ${enemyAttack}<br>
                    ${winnerName} te derrotó usando ${emojiEnemy} ${enemyAttack}`
                    enemyWins++
                    spanEnemyLives.innerHTML = enemyWins
                }
                messagesSection.innerHTML = result // Mensaje de resultado de la ronda

                // Terminar partida si alguien llega a 3 victorias o se completan los 5 ataques
                if (playerWins >= 3 || enemyWins >= 3 || playerAttacks.length >= 5) {
                    setTimeout(() => {
                        checkLives()
                        attackButtons.forEach(btn => btn.disabled = true)
                    }, 1200)
                }
            } else {
                // Si el enemigo aún no ha atacado, vuelve a consultar en 500ms
                setTimeout(checkRoundResult, 500)
            }
        })
}

function showAttackSummary(attacks, containerId) {
    const container = document.getElementById(containerId)
    container.innerHTML = "" 
    attacks.slice(0, 5).forEach(attack => {
        let emoji = attack === 'FIRE' ? '🔥' : attack === 'LIGHTNING' ? '⚡' : '❄️'
        const attackDiv = document.createElement('div')
        attackDiv.style.display = 'flex'
        attackDiv.style.alignItems = 'center'
        attackDiv.style.marginBottom = '4px'
        attackDiv.innerHTML = `<span style="font-size:2rem; margin-right:6px;">${emoji}</span><span>${attack}</span>`
        container.appendChild(attackDiv)
    })
}

function pollEnemyAttacks() {
    // teniendo los id enemigos 
    let lastCount = 0
    setInterval(() => {
        if (!enemyId) return
        fetch(`http://localhost:8080/JavaPlatzis/${enemyId}/attacks`)
            .then(res => res.json())
            .then(data => {
                if (data.attacks && data.attacks.length > lastCount) {
                    const newAttacks = data.attacks.slice(lastCount)
                    const enemyAttackOrder = document.getElementById('enemy-attacks-list')
                    newAttacks.forEach(attack => {
                        let emoji = attack === 'FIRE' ? '🔥' : attack === 'LIGHTNING' ? '⚡' : '❄️'
                        const attackDiv = document.createElement('div')
                        attackDiv.style.display = 'flex'
                        attackDiv.style.alignItems = 'center'
                        attackDiv.style.marginBottom = '4px'
                        attackDiv.innerHTML = `<span style="font-size:2rem; margin-right:6px;">${emoji}</span><span>${attack}</span>`
                        enemyAttackOrder.appendChild(attackDiv)
                    })
                    lastCount = data.attacks.length
                }
            })
    }, 700)
}


function selectEnemyPet(enemy) {
    spanEnemyPet.innerHTML = enemy.name
    enemyMokeponAttacks = enemy.attacks
    improvedAttackSequence(enemyMokeponAttacks) 
}

function enemyRandomAttack() {
    let randomAttack = random(0, enemyMokeponAttacks.length - 1)
    if (randomAttack == 0 || randomAttack == 1) {
        enemyAttacks.push('FIRE')
    } else if (randomAttack == 3 || randomAttack == 4) {
        enemyAttacks.push('LIGHTNING')
    } else {
        enemyAttacks.push('SNOW')
    }
    if (playerAttacks.length === 5) {
        startFight()
    }
}

function startFight() {
    if (playerAttacks.length === 5) {
        fight()
    }
}

function indexBothOpponents(player, enemy) {
    indexPlayerAttack = playerAttacks[player]
    indexEnemyAttack = enemyAttacks[enemy]
}

function fight() {
    for (let index = 0; index < playerAttacks.length; index++) {
        indexBothOpponents(index, index)
        if (playerAttacks[index] === enemyAttacks[index]) {
            createMessage("DRAW")
        } else if (
            (playerAttacks[index] == 'FIRE' && enemyAttacks[index] == 'SNOW') ||
            (playerAttacks[index] == 'LIGHTNING' && enemyAttacks[index] == 'FIRE') ||
            (playerAttacks[index] == 'SNOW' && enemyAttacks[index] == 'LIGHTNING')
        ) {
            createMessage("YOU WIN")
            playerWins++
            spanPlayerLives.innerHTML = playerWins
        } else {
            createMessage("YOU LOSE")
            enemyWins++
            spanEnemyLives.innerHTML = enemyWins
        }
        if (playerWins >= 5 || enemyWins >= 5) {
            break
        }
    }
    //checkLives()
}

function checkLives() {
    let winnerName = spanEnemyPet.innerHTML || "Enemigo"
    if (playerWins === enemyWins) {
        finalMessage(`¡Empate! Ambos tienen ${playerWins} victorias.`)
    } else if (playerWins >= 3) {
        finalMessage(`¡Felicidades, ganaste la partida!`)
    } else if (enemyWins >= 3) {
        finalMessage(`Perdiste la partida.<br>${winnerName} te derrotó con ${enemyWins} victorias.`)
    } else if (playerAttacks.length >= 5) {
        if (playerWins > enemyWins) {
            finalMessage(`¡Felicidades, ganaste la partida!`)
        } else if (playerWins < enemyWins) {
            finalMessage(`Perdiste la partida.<br>${winnerName} te derrotó con ${enemyWins} victorias.`)
        } else {
            finalMessage(`¡Empate! Ambos tienen ${playerWins} victorias.`)
        }
    }
}

function createMessage(result) {
    let newPlayerAttack = document.createElement('p')
    let newEnemyAttack = document.createElement('p')

    messagesSection.innerHTML = result
    newPlayerAttack.innerHTML = indexPlayerAttack
    newEnemyAttack.innerHTML = indexEnemyAttack

    playerAttackLog.appendChild(newPlayerAttack)
    enemyAttackLog.appendChild(newEnemyAttack)
}

function finalMessage() {
    let winnerName = spanEnemyPet.innerHTML || "Enemigo"
    let playerName = spanPlayerPet.innerHTML || "Jugador"
    let message = ""

    if (playerWins > enemyWins) {
        message = `¡${playerName} ganó la partida con ${playerWins} victorias!<br>${winnerName} perdió con ${enemyWins} victorias.`
    } else if (playerWins < enemyWins) {
        message = `Perdiste la partida.<br>${winnerName} te derrotó con ${enemyWins} victorias.`
    } else {
        message = `¡Empate! Ambos tienen ${playerWins} victorias.`
    }

    messagesSection.innerHTML = `
        <div style="text-align:center;">
            <strong>${message}</strong>
            <br>
            <span>Ataques seleccionados: ${playerAttacks.length}/5</span>
        </div>
    `
    sectionRestart.style.display = 'block'
    clearInterval(interval)
    canvas.clearRect(0, 0, map.width, map.height)
    enemyMokepons = []
    playerPetObject = null
    inBattle = false

    showAttackSummary(playerAttacks, 'player-attacks-list')
    showAttackSummary(enemyAttacks, 'enemy-attacks-list')

    //Actualiza las vidas a 0 para evitar confusión
    spanPlayerLives.innerHTML = "0"
    spanEnemyLives.innerHTML = "0"
}


function restartGame() {
    fetch("http://localhost:8080/reset", { method: "POST" })
        .then(() => {
            // Muestra el mensaje visual
            document.getElementById('reset-message').style.display = 'block'
            setTimeout(() => {
                location.reload()
            }, 2500)
        })
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function drawCanvas() {
    if (!playerPetObject || !playerPetObject.mapPhoto) return;

    // Limitar movimiento dentro del mapa
    playerPetObject.x += playerPetObject.speedX
    playerPetObject.y += playerPetObject.speedY

    // Limites horizontales
    if (playerPetObject.x < 0) playerPetObject.x = 0
    if (playerPetObject.x > map.width - playerPetObject.width) playerPetObject.x = map.width - playerPetObject.width
    // Limites verticales
    if (playerPetObject.y < 0) playerPetObject.y = 0
    if (playerPetObject.y > map.height - playerPetObject.height) playerPetObject.y = map.height - playerPetObject.height

    canvas.clearRect(0, 0, map.width, map.height)
    canvas.drawImage(mapBackground, 0, 0, map.width, map.height)
    playerPetObject.drawMokepon()
    canvas.save()   //Dibuja un rectángulo amarillo alrededor del mokepon del jugador
    canvas.strokeStyle = 'yellow'
    canvas.lineWidth = 4
    canvas.strokeRect(
        playerPetObject.x,
        playerPetObject.y,
        playerPetObject.width,
        playerPetObject.height
    )
    canvas.restore()

    enemyMokepons.forEach(enemy => {
        enemy.drawMokepon()
        checkCollision(enemy)
    })

    sendPosition(playerPetObject.x, playerPetObject.y)
}

function sendPosition(x, y) {
    fetch(`http://localhost:8080/JavaPlatzis/${playerId}/position`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x, y })
    })
    .then(res => res.json())
    .then(({ enemies }) => {
        if (!enemies || !Array.isArray(enemies)) {
            enemyMokepons = []
            return
        }
        enemyMokepons = enemies.map(enemy => {
            let enemyMokepon = null
            const mokeponName = enemy.mokepon?.name || ""

            if (mokeponName === "Cindrome") {
                enemyMokepon = new Mokepon("Cindrome","./imagen/png-clipart-jack-jack-parr-edna-marie-e-mode-violet-parr-villain-edna-y-jack-jack-superhero-villain-thumbnail.png",5, undefined, enemy.id)
            } else if (mokeponName === "Incredible") {
                enemyMokepon = new Mokepon("Incredible", "./imagen/5d77bacee82a23495a218c565bbf873c.jpg", 5, undefined, enemy.id)
            } else if (mokeponName === "Frozono") {
                enemyMokepon = new Mokepon("Frozono", "./imagen/images.jpg", 5, undefined, enemy.id)
            }

            if (enemyMokepon) {
                enemyMokepon.x = enemy.x
                enemyMokepon.y = enemy.y
                enemyMokepon.id = enemy.id
                enemyMokepon.name = enemy.mokepon?.name || "" 
            }
            return enemyMokepon
        }).filter(Boolean)
    })
    .catch(err => {
        console.error("Error processing enemies:", err)
    })
}

function moveRight() { playerPetObject.speedX = 5 }
function moveLeft() { playerPetObject.speedX = -5 }
function moveDown() { playerPetObject.speedY = 5 }
function moveUp() { playerPetObject.speedY = -5 }
function stopMovement() { playerPetObject.speedX = 0; playerPetObject.speedY = 0 }

function keyPressed(event) {
    switch (event.key) {
        case 'ArrowUp': moveUp(); break
        case 'ArrowDown': moveDown(); break
        case 'ArrowLeft': moveLeft(); break
        case 'ArrowRight': moveRight(); break
    }
}

function startMap() {
    playerPetObject = getPetObject(playerPet)
    if (!playerPetObject) return
    interval = setInterval(drawCanvas, 50)
    window.addEventListener('keydown', keyPressed)
    window.addEventListener('keyup', stopMovement)
}

function getPetObject(petName) {
    for (let i = 0; i < mokepons.length; i++) {
        if (petName === mokepons[i].name) {
            return mokepons[i]
        }
    }
}

function checkCollision(enemy) {
    if (inBattle) return // No hacer nada si ya estás en batalla

    const enemyTop = enemy.y
    const enemyBottom = enemy.y + enemy.height
    const enemyRight = enemy.x + enemy.width
    const enemyLeft = enemy.x

    const playerTop = playerPetObject.y
    const playerBottom = playerPetObject.y + playerPetObject.height
    const playerRight = playerPetObject.x + playerPetObject.width
    const playerLeft = playerPetObject.x

    if (
        playerBottom < enemyTop ||
        playerTop > enemyBottom ||
        playerRight < enemyLeft ||
        playerLeft > enemyRight
    ) {
        return
    }

    inBattle = true // Marca que ya estoy en batalla
    stopMovement()
    clearInterval(interval)
    enemyId = enemy.id
    fetch(`http://localhost:8080/JavaPlatzis/${playerId}/battle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enemyId: enemy.id })
    })
    .then(res => res.json())
    .then(data => {
        if (data.ok) {
            sectionSelectAttack.style.display = 'flex'
            sectionViewMap.style.display = 'none'
            selectEnemyPet(enemy)
        } else {
            messagesSection.innerHTML = "¡This player is battle! Wait the player finish the battle.";
            setTimeout(() => {
                messagesSection.innerHTML = ""
                inBattle = false // Permite volver a intentar después del mensaje
            }, 2500)
            interval = setInterval(drawCanvas, 50)
        }
    })
}

function pollBattleStatus() {
    setInterval(() => {
        fetch(`http://localhost:8080/JavaPlatzis/${playerId}/battle`)
            .then(res => res.json())
            .then(data => {
                if (data.inBattle) {
                    sectionSelectAttack.style.display = 'flex'
                    sectionViewMap.style.display = 'none'
                }
            })
    }, 1000)
}


window.addEventListener('load', startGame)