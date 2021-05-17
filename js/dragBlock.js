
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
