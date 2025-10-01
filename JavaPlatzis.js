

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
let mokepons = []
let enemyMokepons = []
let enemyAttacks = []
let petOptions
let inputCindrome
let inputIncredible
let inputSkull
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
let skull = new Mokepon('Skull', './imagen/3135414-middle.png', 5)

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
    inputSkull = document.getElementById('Skull')

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
    if (inputCindrome.checked) {
        spanPlayerPet.innerHTML = inputCindrome.id
        playerPet = inputCindrome.id
    } else if (inputIncredible.checked) {
        spanPlayerPet.innerHTML = inputIncredible.id
        playerPet = inputIncredible.id
    } else if (inputSkull.checked) {
        spanPlayerPet.innerHTML = inputSkull.id
        playerPet = inputSkull.id
    } else {
        alert("Select a Super Hero")
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
    attacks.forEach((attack) => {
        mokeponAttacks = `<button id=${attack.id} class="attack-btn">${attack.name}</button>`
        attacksContainer.innerHTML += mokeponAttacks
    })
    btnLightning = document.getElementById('btn-lightning')
    btnSnow = document.getElementById('btn-snow')
    btnFire = document.getElementById('btn-fire')
    attackButtons = document.querySelectorAll('.attack-btn')
    attackSequence()
}

function attackSequence() {
    // Limpia el contador y la lista visual al iniciar la batalla
    document.getElementById('attack-counter').textContent = "Ataques seleccionados: 0/5"
    document.getElementById('player-attacks-list').innerHTML = ""

    attackButtons.forEach((button, idx) => {
        button.addEventListener('click', (e) => {
            let attackType
            if (e.target.textContent === '🔥') {
                attackType = 'FIRE'
            } else if (e.target.textContent === '⚡') {
                attackType = 'LIGHTNING'
            } else {
                attackType = 'SNOW'
            }
            playerAttacks.push(attackType)
            button.style.background = '#112f58'
            button.disabled = true

            // Feedback instantáneo: mostrar el ataque en la lista
            const attackOrder = document.getElementById('player-attacks-list')
            const attackSpan = document.createElement('span')
            attackSpan.textContent = e.target.textContent
            attackSpan.style.margin = '0 4px'
            attackSpan.style.fontSize = '2rem'
            attackOrder.appendChild(attackSpan)

            // Actualizar contador
            const attackCounter = document.getElementById('attack-counter')
            attackCounter.textContent = `Ataques seleccionados: ${playerAttacks.length}/5`

            enemyRandomAttack()
        })
    })
}

function selectEnemyPet() {
    let randomPetIndex = random(0, mokepons.length - 1)
    spanEnemyPet.innerHTML = mokepons[randomPetIndex].name
    enemyMokeponAttacks = mokepons[randomPetIndex].attacks
    attackSequence()
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
    }
    checkLives()
}

function checkLives() {
    if (playerWins === enemyWins) {
        finalMessage("It's a DRAW!!")
    } else if (playerWins > enemyLives) {
        finalMessage("CONGRATS, YOU WON!")
    } else {
        finalMessage("Sorry, you lost.")
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

function finalMessage(finalResult) {
    messagesSection.innerHTML = finalResult
    sectionRestart.style.display = 'block'
    clearInterval(interval)
    canvas.clearRect(0, 0, map.width, map.height)
    enemyMokepons = []
    playerPetObject = null
    inBattle = false // Permite nuevas batallas después de reiniciar
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
            } else if (mokeponName === "Skull") {
                enemyMokepon = new Mokepon("Skull", "./imagen/images.jpg", 5, undefined, enemy.id)
            }

            if (enemyMokepon) {
                enemyMokepon.x = enemy.x
                enemyMokepon.y = enemy.y
                enemyMokepon.id = enemy.id 
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
            messagesSection.innerHTML = "¡Este jugador ya está en batalla! Espera a que termine para poder pelear.";
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