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
  }

  // 게임 초기설정 함수
  init () {
    // canvas 크기 조절
    // 가로에 여유공간을 추가 (점수가 들어갈 공간) = 300
    this.canvas.width = this.boardWidth * this.tileWidth + 300
    this.canvas.height = this.boardHeight * this.tileHeight

    // board 모양을 배열로 표현
    // board 객체 생성하기
    const boardShape = [...Array(this.boardHeight)].map(x=>Array(this.boardWidth).fill(9))
    this.board = new Blocks(boardShape, this.tileWidth, this.tileHeight)

    // 임시표시 영역 생성하기
    const shadowBoardShape = [...Array(this.boardHeight)].map(x=>Array(this.boardWidth).fill(9))
    this.shadowBoard = new Blocks(shadowBoardShape, this.tileWidth, this.tileHeight)

    // 다음 블록 배경이 그려질 위치를 계산
    this.nextBlockBgX = this.tileWidth * this.boardWidth + 50
    this.nextBlockBgY = 30

    // 배경의 크기를 설정
    this.nextBlockBgWidth = 200
    this.nextBlockBgHeight = 200

    // 게임 점수
    this.scores = 0
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

    // 조건에 부합하는 블록을 제거하고
    // 점수를 가산한다
    const score = this.removeCheckedBlocks()
    this.scores = score

    // 게임 화면 그리기

    // 게임 화면을 전부 지운다. (깨끗하게)
    this.clearScreen()

    // 임시 영역 계산하기
    if (this.isMouse) {
      this.setShadowBoard()
    }

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

  removeCheckedBlocks () {
    // 점수를 저장하는 변수
    let scores = 0

    // 게임보드의 가로, 세로 크기
    const width = this.boardWidth
    const height = this.boardHeight

    // 가로 확인
    for (let y=0; y<height; y++) {
      let sum = 0
      for (let x=0; x<width; x++) {
        if (this.board.shape[y][x] != 9) {
          sum ++;
        }
      }

      // 가로 한 줄에 블록이 맞춰진 경우
      if (sum == width) {
        // 가로 칸의 개수만큼 점수를 가산
        scores += width

        for (let x=0; x<width; x++) {
          // 게임보드에서 블록을 지운다.
          this.board.shape[y][x] = 9
          // 임시영역에서 블록을 초기화 한다.
          this.shadowBoard.shape[y][x] = 9
        }
      }
    }

    // 세로 확인
    for (let x=0; x<width; x++) {
      let sum = 0
      for (let y=0; y<height; y++) {
        if (this.board.shape[y][x] != 9) {
          sum ++
        }
      }

      // 세로 한 줄에 블록이 맞춰진 경우
      if (sum == height) {
        // 세로칸의 개수 만큼 점수를 가산
        scores += height

        for (let y=0; y<height; y++) {
          // 게임보드에서 블록을 지운다.
          this.board.shape[y][x] = 9
          // 임시영역에서 블록을 초기화 한다.
          this.shadowBoard.shape[y][x] = 9
        }
      }
    }

    // 9x9 사각형 확인

    return scores
  }

  setShadowBoard () {
    // 다음 블록이 드래그 중일때 게임보드 위에 배치될 위치를 보여준다.
    // 다음 블록의 현재 위치를 계산
    const blockX = this.nextBlock.mouseX - this.nextBlock.centerX
    const blockY = this.nextBlock.mouseY - this.nextBlock.centerY

    // 다음 블록의 한 칸의 크기를 가져온다
    const tileWidth = this.nextBlock.tileWidth
    const tileHeight = this.nextBlock.tileHeight

    // 첫번째 칸의 위치를 저장한다
    this.shadowBlockX = Math.floor((blockX + (tileWidth/2)) / this.tileWidth)
    this.shadowBlockY = Math.floor((blockY + (tileHeight/2)) / this.tileHeight)

    this.nextBlock.forEach((value, x, y) => {
      // 현재 칸(x, y)이 비워져 있는 경우 무시한다
      if (value == 0) {
        return
      }

      // 현재 칸의 절대위치를 계산
      const tileX = blockX + (x*tileWidth) + (tileWidth/2)
      const tileY = blockY + (y*tileHeight) + (tileHeight/2)

      // 현재 칸이 게임 보드위에 어디있는지 계산
      const boardX = Math.floor(tileX/this.tileWidth)
      const boardY = Math.floor(tileY/this.tileHeight)

      // 보드 영역안에 들어가는지 확인한다
      if (boardX >= 0 && boardX < this.boardWidth &&
          boardY >= 0 && boardY < this.boardHeight) {

        // 임시 영역 위에 다른 블록이 그려져 있는 경우
        // 임시 영역을 그리지 않는다
        if (this.shadowBoard.shape[boardY][boardX] == 0) {
          return
        }

        // 임시 영역을 그린다
        this.shadowBoard.shape[boardY][boardX] = value
      }
    })
  }

  // 게임 보드 그리기
  drawGameBoard () {
    // Blocks.draw 함수를 호출해서 canvas에 게임 보드를 그린다.
    this.board.draw(this.context, 0, 0)

    // 영역을 표시한다.
    this.shadowBoard.draw(this.context, 0, 0, false, 0.5)


    // 임시로 표시해둔 영역을 지운다
    this.shadowBoard.forEach((value, x, y) => {
      this.shadowBoard.shape[y][x] = 9
    }, true)
  }

  drawNextBlock () {
    // Canvas 2D Context 가져오기
    const ctx = this.context
    
    // 배경 그리기
    ctx.globalAlpha = 1
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

    // 랜덤으로 회전 시킨다.
    const count = Math.floor(Math.random() * 4)

    for (let i=0; i<count; i++) {
      this.nextBlock.rotate()
    }
  }


  // 블록이 다른 블록과 겹치지 않는지
  // 혹은 범위를 벗어나지 않는지 여부를 반환
  checkBlock(block, xpos, ypos) {
    let flag = true

    block.forEach((value, x, y) => {
      // 비워있는 칸은 무시한다
      if (value == 0) {
        return
      }

      if (ypos+y < 0 || ypos+y > this.boardHeight-1 ||
          xpos+x < 0 || xpos+x > this.boardWidth-1) {
        
        // 범위를 확인
        flag = false
    
      } else if (this.board.shape[ypos+y][xpos+x] != 9) {
      // 다른 블록과의 충돌을 확인
      flag = false
      }
    })

    return flag
  }

  // 블록을 추가한다.
  addBlock (block, xpos, ypos) {
    // 목표 블록을 순회
    for (let y=0; y<block.shape.length; y++) {
      const columns = block.shape[y]

      for (let x=0; x<columns.length; x++) {
        const value = columns[x]

        // 비워있는 칸은 무시한다
        if (value == 0) {
          continue
        }

        // 블록을 게임보드 위에 추가
        this.board.shape[ypos+y][xpos+x] = value

        // 임시 영역 삭제
        this.shadowBoard.shape[ypos+y][xpos+x] = 0
      }
    }
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
    if (!this.isMouse) {
      // 마우스 이벤트가 비활성화 중인 경우
      return
    }

    // 다음 블록을 마우스 위치로 이동시킨다.
    this.nextBlock.move(event.offsetX, event.offsetY)
  }

  // 마우스이벤트 3: 마우스를 누른상태에서 손가락을 땐 상황
  mouseup(event) {
    if (!this.isMouse) {
      // 마우스 이벤트가 비활성화 중인 경우
      return
    }

    // 마우스 이벤트 비활성화
    this.isMouse = false

    // 블록이 게임보드위에 다른 블록과 겹치는지 확인
    if (!this.checkBlock(this.nextBlock, this.shadowBlockX, this.shadowBlockY)) {
      // 무시
      return

    } else {
      // 블록을 게임보드위에 추가한다.
      this.addBlock(this.nextBlock, this.shadowBlockX, this.shadowBlockY)

      // 다음 블록을 선택한다
      this.selectNextBlock()
    }
  }
}

/**
 * Entry Point
 */
const init = () => {
  // game : 게임 인스턴스
  // canvas ID Game => #game
  const game = new TetrisPuzzleGame('#game', 30, 30)
  game.tileWidth = 15
  game.tileHeight = 15

  game.init()
  game.start()

  return game
}

const game = init()
