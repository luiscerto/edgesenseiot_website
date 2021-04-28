export default function sketch (p5) {
  const _aryInitRot = []
  let _myObject

  const numParts = 300
  const slowliness = 8
  const minThicknessWidthRatio = 3// bigger = thinner ; 1 to 10
  const maxThicknessWidthRatio = 1.5// bigger = thinner ; 1 to 10
  const expansionProbability = 0.9// 0.1 to 1

  p5.setup = () => {
    let canvasSize
    if (p5.windowWidth >= p5.windowHeight) {
      canvasSize = p5.windowWidth * 0.975// 2.5% margin because sometimes the value is slghtly bigger than the actual dimension
    } else {
      canvasSize = p5.windowHeight * 0.975
    }
    p5.createCanvas(canvasSize, canvasSize, p5.WEBGL)
    // document.getElementsByTagName('main')[0].style.margin = 0
    p5.setAttributes('premultipliedAlpha', true)
    p5.frameRate(40)
    p5.noStroke()
    for (let i = 0; i < 3; i++) {
      _aryInitRot[i] = [p5.random(2 * p5.PI), p5.random([-1, 1])]
    }

    _myObject = new Parts(numParts)
  }

  p5.draw = () => {
    p5.ortho(-p5.width / 2, p5.width / 2, -p5.width / 2, p5.width / 2, 0, p5.width * 2)
    p5.background(0)
    p5.ambientLight(150)
    const ang = _aryInitRot[1][0] + p5.frameCount / 100
    p5.directionalLight(255, 255, 255, -p5.sin(ang), 1, -p5.cos(ang))
    const c = (p5.height / 2) / p5.tan(p5.PI / 6)
    p5.camera(c * p5.sin(ang), 0, c * p5.cos(ang), 0, 0, 0, 0, 1, 0)
    p5.rotateZ(p5.PI / 4)

    _myObject.update()
  }

  function drawPart (startX, startY, startZ, endX, endY, endZ, w, col) {
    const angAxisZ = p5.atan2(endY - startY, endX - startX)
    const distXY = p5.dist(startX, startY, endX, endY)
    const angAxisY = -p5.atan2(endZ - startZ, distXY)
    const distXYZ = p5.dist(0, startZ, distXY, endZ)
    p5.push()
    p5.translate(startX, startY, startZ)
    p5.rotateZ(angAxisZ)
    p5.rotateY(angAxisY)
    p5.translate(distXYZ / 2, 0, 0)
    p5.ambientMaterial(col)
    p5.box(distXYZ + w, w, w) // length + w
    p5.pop()
  }

  class Part {
    constructor (startX, startY, startZ, endX, endY, endZ, w, totalTime, partCount, maxW) {
      this.startX = startX
      this.startY = startY
      this.startZ = startZ
      this.endX = endX
      this.endY = endY
      this.endZ = endZ
      this.w = w
      this.totalTime = totalTime
      this.currentTime = 0
      this.direction = true // true -> extend, false -> shrink
      this.erase = false
      this.col = p5.color(255)
    }

    update () {
      let currentX
      let currentY
      let currentZ
      if (this.direction) { // extend
        const ratio = (this.currentTime / this.totalTime) ** 0.5
        currentX = this.startX + (this.endX - this.startX) * ratio
        currentY = this.startY + (this.endY - this.startY) * ratio
        currentZ = this.startZ + (this.endZ - this.startZ) * ratio
        if (this.currentTime < this.totalTime) { this.currentTime++ }
        drawPart(this.startX, this.startY, this.startZ, currentX, currentY, currentZ, this.w, this.col)
      } else { // shrink
        const ratio = (1 - (this.currentTime - this.totalTime) / this.totalTime) ** 0.5
        currentX = this.endX + (this.startX - this.endX) * ratio
        currentY = this.endY + (this.startY - this.endY) * ratio
        currentZ = this.endZ + (this.startZ - this.endZ) * ratio
        this.currentTime++
        if (this.currentTime > this.totalTime * 2) { this.erase = true }
        drawPart(this.endX, this.endY, this.endZ, currentX, currentY, currentZ, this.w, this.col)
      }
    }
  }

  class Parts {
    constructor (numPart) {
      this.maxArea = p5.width / 3.4
      this.maxW = p5.width / 10
      this.t = slowliness
      this.maxL = this.maxArea
      this.parts = []
      const w = p5.max(p5.width / (minThicknessWidthRatio * 100), this.maxW / maxThicknessWidthRatio * p5.random() ** (12 / expansionProbability))
      // let w = max(width / 300, this.maxW * p5.random() ** 12)
      const startX = -this.maxArea / 2
      const startY = -this.maxArea / 2
      const startZ = -this.maxArea / 2
      let aryEndXYZ = this.randomDirection(startX, startY, startZ)
      while (p5.abs(aryEndXYZ[0]) > this.maxArea || p5.abs(aryEndXYZ[1]) > this.maxArea || p5.abs(aryEndXYZ[2]) > this.maxArea) {
        aryEndXYZ = this.randomDirection(startX, startY, startZ)
      }
      const endX = aryEndXYZ[0]
      const endY = aryEndXYZ[1]
      const endZ = aryEndXYZ[2]
      this.partCount = p5.int(p5.random(1000))
      this.parts.push(new Part(startX, startY, startZ, endX, endY, endZ, w, this.t, this.partCount, this.maxW))
      this.numPart = numPart
      this.isGenerate = false
    }

    update () {
      for (let i = 0; i < this.parts.length; i++) {
        this.parts[i].update()
      }
      if (this.parts[this.parts.length - 1].currentTime >= this.parts[this.parts.length - 1].totalTime) {
        this.isGenerate = true
      }

      if (this.isGenerate === true && this.parts.length < this.numPart) {
        const w = p5.max(p5.width / (minThicknessWidthRatio * 100), this.maxW / maxThicknessWidthRatio * p5.random() ** (12 / expansionProbability))
        const startX = this.parts[this.parts.length - 1].endX
        const startY = this.parts[this.parts.length - 1].endY
        const startZ = this.parts[this.parts.length - 1].endZ
        let aryEndXYZ = this.randomDirection(startX, startY, startZ)

        while (true) {
          const lastPart = this.parts[this.parts.length - 1]
          const vecLast = p5.createVector(lastPart.endX - lastPart.startX, lastPart.endY - lastPart.startY, lastPart.endZ - lastPart.startZ)
          const vecCurr = p5.createVector(aryEndXYZ[0] - startX, aryEndXYZ[1] - startY, aryEndXYZ[2] - startZ)
          const dotProduct = vecLast.dot(vecCurr)
          // console.log(p5.Vector.normalize(vecCurr))
          // console.log(p5.Vector.normalize(vecLast))
          // console.log("dot" + dotProduct)
          // try to avoid opposite
          if (dotProduct > -1) { break }
          aryEndXYZ = this.randomDirection(startX, startY, startZ)
        }

        while (p5.abs(aryEndXYZ[0]) > this.maxArea || p5.abs(aryEndXYZ[1]) > this.maxArea || p5.abs(aryEndXYZ[2]) > this.maxArea) {
          aryEndXYZ = this.randomDirection(startX, startY, startZ)
        }

        const endX = aryEndXYZ[0]
        const endY = aryEndXYZ[1]
        const endZ = aryEndXYZ[2]
        this.partCount++

        this.parts.push(new Part(startX, startY, startZ, endX, endY, endZ, w, this.t, this.partCount, this.maxW))
        this.isGenerate = false
      }

      if (this.parts.length >= this.numPart) {
        this.parts[0].direction = false
      }

      if (this.parts[0].erase === true) { this.parts.shift() }
    }

    randomDirection (startX, startY, startZ) {
      let endX = startX
      let endY = startY
      let endZ = startZ
      const direction = p5.random(['-x', 'x', '-y', 'y', '-z', 'z'])
      switch (direction) {
        case '-x':
          endX = startX + this.maxL * p5.random(-1, 0)
          break
        case 'x':
          endX = startX + this.maxL * p5.random(0, 1)
          break
        case '-y':
          endY = startY + this.maxL * p5.random(-1, 0)
          break
        case 'y':
          endY = startY + this.maxL * p5.random(0, 1)
          break
        case '-z':
          endZ = startZ + this.maxL * p5.random(-1, 0)
          break
        case 'z':
          endZ = startZ + this.maxL * p5.random(0, 1)
          break
      }
      return [endX, endY, endZ]
    }
  }
}
