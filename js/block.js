
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

  forEach(callback, check=false) {
    const rows = this.shape.length

    // 블록 형태(this.shape)를 차례대로 가져온다.
    for (let y=0; y<rows; y++) {
      const columns = this.shape[y]

      for (let x=0; x<columns.length; x++) {
        // 비워있는 칸은 제외한다
        if (check && columns[x] == 0) {
          continue
        }

        // 콜백 함수 호출
        callback(columns[x], x, y)
      }
    }
  }

  drawBlock (ctx, color, x, y, line=false, opacity=1) {
    // 색상이 없이 비워있는 공간은 그리지 않는다.
    if (color == 0) {
      return
    }

    // 투명도를 설정
    ctx.globalAlpha = opacity

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
  draw (ctx, xpos, ypos, line=false, opacity=1) {
    // 블록 2차원 배열을 차례대로 가져와서
    this.forEach((value, x, y) => {
      // 블록이 그려질 X 위치를 계산
      const X = (xpos+x) * this.tileWidth
      // 블록이 그려질 Y 위치를 계산
      const Y = (ypos+y) * this.tileHeight

      // Canvas에 그린다.
      this.drawBlock(ctx, value, X, Y, line, opacity);
    })
  }

  // 블록은 canvas 화면 절대위치에 그려주는 함수
  drawPos (ctx, xpos, ypos, line=false, opacity=1) {
    // 블록 2차원 배열을 차례대로 가져와서
    this.forEach((value, x, y) => {
      // 블록이 그려질 위치를 계산
      const X = xpos + (x*this.tileWidth)
      const Y = ypos + (y*this.tileHeight)

      // Canvas에 그린다.
      this.drawBlock(ctx, value, X, Y, line, opacity)
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

  // 블록을 우측(right=true) 혹은 좌측(right=false) 으로 회전 시킨다.
  rotate (right=true) {
    // 회전된 블록을 저장할 변수
    const shape = [...Array(this.columns)].map(x=>Array(this.rows).fill(0))

    // 블록을 각 칸을 가져온다.
    for (let y=0; y<this.rows; y++) {
      for (let x=0; x<this.columns; x++) {
        if (right) {
          // 우측으로 회전하는 경우
          shape[x][this.rows-1-y] = this.shape[y][x]
        } else {
          // 좌측으로 회전하는 경우
          shape[this.columns-1-x][y] = this.shape[y][x]
        }
      }
    }

    // 회전된 모양을 반영한다.
    this.shape = shape
  }

  get columns () {
    return this.shape[0].length
  }

  get rows () {
    return this.shape.length
  }
}
