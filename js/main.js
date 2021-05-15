
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

  get columns () {
    return this.shape[0].length
  }

  get rows () {
    return this.shape.length
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
  }

  // 게임 시작 함수
  start() {
    // 첫번째 블록 선택하기
    this.selectNextBlock()

    // 게임 애니메이션 관리 변수 만들기
    this.timestamp = -1
    this.animationController = window.requestAnimationFrame((frame) => this.update(frame))
  }

  // 게임 정지 함수
  stop() {
    // 게임 애니메이션 취소 (정지)
    window.cancelAnimationFrame(this.animationController)
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
    // boardShape 를 Blocks 인스턴스에 넣어서
    // Blocks.draw 함수를 호출해서 canvas 에 게임 보드를 그린다.
    this.board.draw(this.context, 0, 0, true)
  }

  drawNextBlock () {
    // Canvas 2D Context 가져오기
    const ctx = this.context

    // 배경이 그려질 위치를 계산
    const X = this.tileWidth * this.boardWidth + 50
    const Y = 30
    // 배경의 크기를 설정
    const width = 200
    const height = 200

    // 배경 그리기
    ctx.fillStyle = '#aaa'
    ctx.fillRect(X, Y, width, height)

    // 블록이 그려질 위치를 계산
    const blockWidth = this.nextBlock.columns * this.nextBlock.tileWidth
    const blockHeight = this.nextBlock.rows * this.nextBlock.tileHeight
    // 배경의 중앙에 배치될수 있도록 계산
    const blockX = X + (width-blockWidth)/2
    const blockY = Y + (height-blockHeight)/2

    // 다음 블록 그리기
    this.nextBlock.drawPos(ctx, blockX, blockY)
  }

  // 다음 블록 선택하기
  selectNextBlock () {
    // 랜덤으로 블록 모양 선택하기
    const blockShape = getRandomShape()
    // 블록 인스턴스 생성
    this.nextBlock = new Blocks(blockShape, this.tileWidth, this.tileHeight)
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
