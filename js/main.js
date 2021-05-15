
/**
 * Blocks 클래스
 * 블럭 모양을 저장하고 그리는 인스턴스
 */
class Blocks {
  // 생성자
  // shape : 이차원 배열로 블럭의 모양을 의미
  constructor (shape, tileWidth, tileHeight) {
    // 블록의 모양
    this.shape = shape

    // 한 칸의 넓이
    this.tileWidth = tileWidth
    // 한 칸의 높이
    this.tileHeight = tileHeight
  }

  forEach(callback) {
    // 블록 형태(this.shape)를 차례대로 가져온다.
    this.shape.forEach((arr, y) => {
      arr.forEach((value, x) => {
        // 콜백 함수 호출
        callback(value, x, y)
      })
    })
  }

  drawBlock (ctx, color, x, y, line=false) {
    // 색상이 없이 비워있는 공간은 그리지 않는다.
    if (color == 0) {
      return
    }

    // 선만 그리는 경우 (line=true)
    // 사각형은 그리지 않는다.
    if (!line) {
      // 배경색을 설정
      ctx.fillStyle = blockRectColors[color]
      // canvas에 그린다.
      ctx.fillRect(x, y, this.tileWidth, this.tileHeight)
    }

    // 바깥선 색을 설정
    ctx.strokeStyle = blockLineColors[color]
    // cavnas에 바깥선을 그린다.
    ctx.strokeRect(x, y, this.tileWidth, this.tileHeight)

  }

  // 블록을 canvas 화면 상대위치에 그려주는 함수
  // ctx : Canvas 2D Context
  // xpos : Block X Position
  // ypos : Block Y Position
  draw (ctx, xpos, ypos, line=false) {
    // 블록 2차원 배열을 차례대로 가져와서
    this.forEach((value, x, y) => {
      // 블록이 그려질 X 위치를 계산
      const X = (xpos+x) * this.tileWidth
      // 블록이 그려질 Y 위치를 계산
      const Y = (ypos+y) * this.tileHeight

      // Canvas에 그린다.
      this.drawBlock(ctx, value, X, Y, line);
    })
  }

  // 블록은 canvas 화면 절대위치에 그려주는 함수
  drawPos (ctx, xpos, ypos, line=false) {
    // 블록 2차원 배열을 차례대로 가져와서
    this.forEach((value, x, y) => {
      // 블록이 그려질 위치를 계산
      const X = xpos + (x*this.tileWidth)
      const Y = ypos + (y*this.tileHeight)

      // Canvas에 그린다.
      this.drawBlock(ctx, value, X, Y, line)
    })
  }

  // 서로 다른 블록들이 충돌하는지 판단해서
  // 충돌한 칸의 위치과 값을 콜백함수 매개변수로 넣어서 호출한다.
  collisionWithBlocks (dragBlock, callback) {
    // 꼭짓점을 저장할 배열
    let edges = []

    // 목표 블록의 각 꼭짓점을 배열로 만든다.
    for (let by=0; by<this.rows; by++) {
      for (let bx=0; bx<this.columns; bx++) {
        // 한 칸의 넓이와 높이를 가져온다.
        const tW = dragBlock.tileWidth
        const tH = dragBlock.tileHeight

        // 좌표를 추가
        edges.push([ x*tW, y*tH ], [ x*tW, y*tH+tH ])

        // 마지막 블록의 꼭짓점을 추가
        if (x == dragBlock.columns) {
          edges.push([ x*tW+tW, y*tH ], [ x*tW+tW, y*tH+tH ])
        }
      }
    }

    // 목표 블록의 기준 좌표를 가져온다.
    const xpos = dragBlock.x
    const ypos = dragBlock.y

    edges.forEach((pos) => {
      if (this.collision(xpos+pos[0], ypos+pos[1])) {
        // TODO: 블록의 위치가 필요함.
        callback()
      }
    })
  }

  // (x, y)좌표가 블록 내부에 있는지 여부를 판단한다.
  collision (x, y) {
    for (let by=0; by<this.rows; by++) {
      for (let bx=0; bx<this.columns; bx++) {
        // 비워있는 공간은 제외
        if (this.shape[by][bx] == 0) {
          continue
        }

        // 좌표를 계산
        const sx = this.x + (bx*this.tileWidth)
        const sy = this.y + (by*this.tileHeight)

        // 좌표를 확인
        if (x >= sx && x <= sx+this.tileWidth && 
            y >= sy && y <= sy+this.tileHeight) {

              return true
            }
      }
    }

    return false;
  }

  get columns () {
    return this.shape[0].length
  }

  get rows () {
    return this.shape.length
  }
}


/**
 * DrawBlocks 클래스
 * 드래그 가능한 블록을 생성하는 인스턴스
 */
class DragBlocks extends Blocks {
  constructor (xpos, ypos, shape, tileWidth, tileHeight) {
    // Blocks 인스턴스에 기본정보 제공
    super(shape, tileWidth, tileHeight)

    // 블록의 기본위치 설정
    this.x = xpos
    this.y = ypos

    // 마우스 이벤트 활성화 여부를 저장
    this.isMouse = false

    // 초기화
    this.reset()
  }

  // 마우스 변수를 초기화
  reset () {
    // 다음 블록이 드래그 중일때 위치를 저장
    this.mouseX = 0
    this.mosueY = 0

    // 마우스가 블록 내부중 어느좌표를 클릭하고 있는지 저장
    this.centerX = 0
    this.centerY = 0
  }
  
  // 마우스가 클릭된 시점에서 좌표를 저장
  down (x, y, isCollision=false) {
    // 블록 내부를 클릭했는지 판단한다.
    if (isCollision && !this.collision(x, y)) {
      // 마우스 위치가 블록 외부에 위치한다.
      return false
    }

    this.mouseX = x
    this.mouseY = y

    this.centerX = this.mouseX - this.x
    this.centerY = this.mouseY - this.y

    return true
  }

  // 마우스가 이동한 좌표를 저장
  move (x, y) {
    this.mouseX = x
    this.mouseY = y
  }

  // 마우스가 블록 어느 부분을 클릭했는지 계산해서
  // 자연스러운 드래그를 만드는 함수
  drawMousePos (ctx, line=false) {
    // 블록의 위치를 계산
    const X = this.mouseX - this.centerX
    const Y = this.mouseY - this.centerY

    // 블록을 그린다.
    this.drawPos(ctx, X, Y, line)
  }

  // 블록을 기본위치에 그리는 함수
  drawDefaultPos (ctx, line=false) {
    // 변수를 초기화
    this.reset()

    // 블록을 그린다.
    this.drawPos(ctx, this.x, this.y, line)
  }
}

/**
 * TetrisPuzzleGame 클래스
 * 게임이 실제로 시작되는 인스턴스로 게임 화면을 구성하고
 * 키보드와 마우스 이벤트를 처리하는 중심 인스턴스
 */
class TetrisPuzzleGame {
  // 생성자
  // selector : canvas ID를 입력
  constructor (selector, boardWidth, boardHeight) {
    // canvas 요소 가져오기
    // selector 변수에 저장된 선택자를 DOM 요소로 가져오기
    this.canvas = document.querySelector(selector)
    // canvas를 그리는데 사용되는 context 요소 가져오기
    this.context = this.canvas.getContext('2d')

    // 게임 보드 길이(boardWidth)와 높이(boardHeight) 설정하기
    this.boardWidth = boardWidth
    this.boardHeight = boardHeight
    // 한 칸의 크기
    this.tileWidth = 50
    this.tileHeight = 50

    // canvas 크기 조절
    // 가로에 여유공간을 추가 (점수가 들어갈 공간) = 300
    this.canvas.width = this.boardWidth * this.tileWidth + 300
    this.canvas.height = this.boardHeight * this.tileHeight

    // board 모양을 배열로 표현
    // 이중 배열 (height x width)
    const boardShape = [...Array(this.boardHeight)].map(x=>Array(this.boardWidth).fill(9))
    // board 객체 생성하기
    this.board = new Blocks(boardShape, this.tileWidth, this.tileHeight)

    // 다음 블록 배경이 그려질 위치를 계산
    this.nextBlockBgX = this.tileWidth * this.boardWidth + 50
    this.nextBlockBgY = 30
    // 배경의 크기를 설정
    this.nextBlockBgWidth = 200
    this.nextBlockBgHeight = 200
  }

  // 게임 시작 함수
  start() {
    // 첫번째 블록 선택하기
    this.selectNextBlock()

    // 게임 애니메이션 관리 변수 만들기
    this.timestamp = -1
    this.animationController = window.requestAnimationFrame((frame) => this.update(frame))

    // 마우스 이벤트 추가
    this.canvas.addEventListener('mousedown', (event) => this.mousedown(event))
    this.canvas.addEventListener('mousemove', (event) => this.mousemove(event))
    this.canvas.addEventListener('mouseup', (event) => this.mouseup(event))
  }

  // 게임 정지 함수
  stop() {
    // 게임 애니메이션 취소 (정지)
    window.cancelAnimationFrame(this.animationController)

    // 마우스 이벤트 제거
    this.canvas.removeEventListener('mousedown', (event) => this.mousedown(event), true)
    this.canvas.removeEventListener('mousemove', (event) => this.mousemove(event), true)
    this.canvas.removeEventListener('mouseup', (event) => this.mouseup(event), true)
  }

  // 게임 업데이트 함수
  update (frame) {
    if (this.timestamp < 0) {
    // 초기 타임스탬프 미설정시 현재 frame 으로 설정
    this.timestamp = frame
    }

    // 게임 화면을 전부 지운다. (깨끗하게)
    this.clearScreen()

    // 게임 화면 그리기
    // 보드 그리기
    this.drawGameBoard()
    // 다음 블록 그리기
    this.drawNextBlock()

    // 다음 프레임으로 넘어가기
    this.animationFrame = window.requestAnimationFrame((frame) => this.update(frame))
  }

  // 게임 화면 깨끗하게 지우기
  clearScreen () {
    // Canvas 2D Context 가져오기
    const ctx = this.context

    // 색상은 하얀색으로 #FFFFFF
    ctx.fillStyle = '#ffffff'
    // (0, 0) 부터 (W, H) 까지 하얀색 직사각형 그리기
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  // 게임 보드 그리기
  drawGameBoard () {
    // Blocks.draw 함수를 호출해서 canvas에 게임 보드를 그린다.
    this.board.draw(this.context, 0, 0, true)

    if (this.isMouse) {
      // 다음 블록이 드래그 중일때 게임보드 위에 배치될 위치를 보여준다.
      const mouseX = this.nextBlock.mouseX
      const mouseY = this.nextBlock.mouseY

      // 
    }
  }

  drawNextBlock () {
    // Canvas 2D Context 가져오기
    const ctx = this.context
    
    // 배경 그리기
    ctx.fillStyle = '#aaa'
    ctx.fillRect(this.nextBlockBgX, this.nextBlockBgY, this.nextBlockBgWidth, this.nextBlockBgHeight)

    if (this.isMouse) {
      // 마우스 이벤트 활성화 중일때
      // 다음 블록 그리기
      this.nextBlock.drawMousePos(ctx)
    } else {
      // 다음 블록 그리기
      this.nextBlock.drawDefaultPos(ctx)
    }
  }

  // 다음 블록 선택하기
  selectNextBlock () {
    // 랜덤으로 블록 모양 선택하기
    const blockShape = getRandomShape()

    // 블록 가로, 세로 길이를 계산
    const columns = blockShape[0].length
    const rows = blockShape.length

    // 블록의 기본 위치를 계산
    const blockWidth = columns * this.tileWidth
    const blockHeight = rows * this.tileHeight

    // 배경의 중앙에 배치될수 있도록 계산
    const blockX = this.nextBlockBgX + (this.nextBlockBgWidth-blockWidth)/2
    const blockY = this.nextBlockBgY + (this.nextBlockBgHeight-blockHeight)/2

    // 블록 인스턴스 생성
    this.nextBlock = new DragBlocks(blockX, blockY, blockShape, this.tileWidth, this.tileHeight)
  }

  // 마우스이벤트 1: 마우스가 canvas에 클릭된 상황
  mousedown(event) {
    // 블록 클릭 최초위치 설정
    const result = this.nextBlock.down(event.offsetX, event.offsetY, true)

    // 마우스 이벤트 활성화
    this.isMouse = result
  }

  // 마우스이벤트 2: 마우스가 canvas위에서 움직이는 상황
  mousemove(event) {
    // 다음 블록을 마우스 위치로 이동시킨다.
    this.nextBlock.move(event.offsetX, event.offsetY)
  }

  // 마우스이벤트 3: 마우스를 누른상태에서 손가락을 땐 상황
  mouseup(event) {
    // 마우스 이벤트 비활성화
    this.isMouse = false
  }
}

/**
 * Entry Point
 */
const init = () => {
  // game : 게임 인스턴스
  // canvas ID Game => #game
  const game = new TetrisPuzzleGame('#game', 9, 9)
  game.start()

  return game
}

const game = init()
