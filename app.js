const canvas = document.createElement("canvas")
const ctx = canvas.getContext("2d")
document.body.appendChild(canvas)
const inp = document.getElementById("inp")

canvas.width = window.innerWidth - 20
canvas.height = window.innerHeight - 20
canvas.style.backgroundColor = "black"

const planets = []

let planetPred = {
  x: 0,
  y: 0,
  mass: 0,
  velocityX: 0,
  velocityY: 0,
}

let preds = []

let startX = 0
let startY = 0

canvas.addEventListener("mousedown", (e) => {
  startX = e.clientX
  startY = e.clientY
})

canvas.addEventListener("mouseup", (e) => {
  const endX = e.clientX
  const endY = e.clientY

  const deltaX = endX - startX
  const deltaY = endY - startY
  const velocityX = -deltaX / 50
  const velocityY = -deltaY / 50

  const planet = new Planet(
    startX,
    startY,
    Number(inp.value),
    velocityX,
    velocityY
  )
  planets.push(planet)
  startY = 0
  startX = 0
  preds = []
})

canvas.addEventListener("mousemove", (e) => {
  preds = []
  const endX = e.clientX
  const endY = e.clientY

  const deltaX = endX - startX
  const deltaY = endY - startY
  const velocityX = -deltaX / 50
  const velocityY = -deltaY / 50

  planetPred.x = startX
  planetPred.y = startY
  planetPred.mass = inp.value
  planetPred.velocityX = velocityX
  planetPred.velocityY = velocityY

  if (startX !== 0 && startY !== 0) {
    for (let i = 0; i < 50; i++) {
      for (const planet of planets) {
        // Расчитываем расстояние и разницу скорости по X и по Y между планетами
        const distX = planet.x - planetPred.x
        const distY = planet.y - planetPred.y
        const distance = Math.sqrt(distX * distX + distY * distY) / 2

        // Расчитываем силу гравитации между планетами
        const force = planet.mass / (distance * distance)

        // Расчитываем ускорение планеты
        const accelerationX = (force * distX) / (distance * planetPred.mass)
        const accelerationY = (force * distY) / (distance * planetPred.mass)

        // Обновляем скорость планеты
        planetPred.velocityX += accelerationX
        planetPred.velocityY += accelerationY
      }

      // Обновляем позицию планеты
      planetPred.x += planetPred.velocityX
      planetPred.y += planetPred.velocityY

      preds.push({ x: planetPred.x, y: planetPred.y })
    }
    // console.log(preds)
  }
})

class Planet {
  constructor(x, y, mass, velocityX = 0, velocityY = 0) {
    this.x = x
    this.y = y
    this.mass = mass
    this.velocityX = velocityX
    this.velocityY = velocityY
    this.history = []
  }

  updatePosition() {
    for (const planet of planets) {
      if (planet !== this) {
        // Расчитываем расстояние и разницу скорости по X и по Y между данными планетами
        const distX = planet.x - this.x
        const distY = planet.y - this.y
        const distance = Math.sqrt(distX * distX + distY * distY) / 2

        // Расчитываем силу гравитации между планетами
        const force = planet.mass / (distance * distance)

        // Расчитываем ускорение планеты
        const accelerationX = (force * distX) / (distance * this.mass)
        const accelerationY = (force * distY) / (distance * this.mass)

        // Обновляем скорость планеты
        this.velocityX += accelerationX
        this.velocityY += accelerationY
      }
    }

    // Обновляем позицию планеты
    this.x += this.velocityX
    this.y += this.velocityY

    this.history.push({ x: this.x, y: this.y })
    if (this.history.length > 500) {
      this.history.shift()
    }

    if (this.x < 0) {
      this.destroy()
      // this.x = canvas.width
      // this.history = []
    }
    if (this.x > canvas.width) {
      this.destroy()
      // this.x = 0
      // this.history = []
    }
    if (this.y < 0) {
      this.destroy()
      // this.y = canvas.height
      // this.history = []
    }
    if (this.y > canvas.height) {
      this.destroy()
      // this.y = 0
      // this.history = []
    }
  }

  destroy() {
    let i = 0
    for (const planet of planets) {
      if (planet == this) {
        planets.splice(i, 1)
        break
      }
      i++
    }
  }

  draw() {
    ctx.beginPath()
    ctx.arc(this.x, this.y, 5 + this.mass / 1000000, 0, 2 * Math.PI)
    ctx.fillStyle = "white"
    ctx.fill()
    ctx.closePath()

    // Отрисовка массы планеты
    ctx.font = "14px Arial"
    ctx.fillStyle = "white"
    ctx.fillText(this.mass.toFixed(0), this.x - 20, this.y - 15)

    // Отрисовка следа за планетой
    ctx.beginPath()
    for (const point of this.history) {
      ctx.lineTo(point.x, point.y)
    }
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.closePath()
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const planet of planets) {
    planet.updatePosition()
    planet.draw()
  }

  ctx.beginPath()
  for (let i = 0; i < preds.length; i++) {
    const pred = preds[i]

    const alpha = 1 - i / preds.length
    ctx.lineTo(pred.x, pred.y)
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha / 2})`
    ctx.lineWidth = 0.1
    ctx.stroke()
  }
  ctx.closePath()

  requestAnimationFrame(animate)
}

planets.push(new Planet(canvas.width / 2, canvas.height / 2, 10000000, 0, 0))

animate()
