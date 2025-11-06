import { dia, shapes } from '@joint/plus'

export class LineDrawingTool {
  private paper: dia.Paper
  private graph: dia.Graph
  private startPoint: { x: number; y: number } | null = null
  private currentLine: shapes.standard.Path | null = null
  private isShiftPressed: boolean = false
  private boundHandlers: {
    onPointerDown: any
    onPointerMove: any
    onPointerUp: any
  }

  constructor(paper: dia.Paper, graph: dia.Graph) {
    this.paper = paper
    this.graph = graph
    this.boundHandlers = {
      onPointerDown: this.onPointerDown.bind(this),
      onPointerMove: this.onPointerMove.bind(this),
      onPointerUp: this.onPointerUp.bind(this)
    }
    this.setupKeyboardEvents()
  }

  private setupKeyboardEvents() {
    document.addEventListener('keydown', (evt) => {
      if (evt.key === 'Shift') {
        this.isShiftPressed = true
      }
    })

    document.addEventListener('keyup', (evt) => {
      if (evt.key === 'Shift') {
        this.isShiftPressed = false
      }
    })
  }

  activate() {
    this.paper.on('blank:pointerdown', this.boundHandlers.onPointerDown)
    this.paper.on('blank:pointermove', this.boundHandlers.onPointerMove)
    this.paper.on('blank:pointerup', this.boundHandlers.onPointerUp)
  }

  deactivate() {
    this.paper.off('blank:pointerdown', this.boundHandlers.onPointerDown)
    this.paper.off('blank:pointermove', this.boundHandlers.onPointerMove)
    this.paper.off('blank:pointerup', this.boundHandlers.onPointerUp)
    this.startPoint = null
    this.currentLine = null
  }

  private onPointerDown(evt: dia.Event, x: number, y: number) {
    this.startPoint = { x, y }

    // 임시 선 생성 (미리보기용)
    this.currentLine = this.createLineElement(x, y, x, y)
    this.graph.addCell(this.currentLine)
  }

  private onPointerMove(evt: dia.Event, x: number, y: number) {
    if (!this.startPoint || !this.currentLine) return

    let endX = x
    let endY = y

    // Shift 키로 수평/수직선 그리기
    if (this.isShiftPressed) {
      const dx = Math.abs(x - this.startPoint.x)
      const dy = Math.abs(y - this.startPoint.y)

      if (dx > dy) {
        endY = this.startPoint.y // 수평선
      } else {
        endX = this.startPoint.x // 수직선
      }
    }

    // 실시간 선 업데이트
    this.updateLineElement(this.currentLine, this.startPoint.x, this.startPoint.y, endX, endY)
  }

  private onPointerUp(evt: dia.Event, x: number, y: number) {
    if (!this.startPoint || !this.currentLine) return

    let endX = x
    let endY = y

    // Shift 키로 수평/수직선 그리기
    if (this.isShiftPressed) {
      const dx = Math.abs(x - this.startPoint.x)
      const dy = Math.abs(y - this.startPoint.y)

      if (dx > dy) {
        endY = this.startPoint.y
      } else {
        endX = this.startPoint.x
      }
    }

    // 최종 선 생성 (연결점 포함)
    const finalLine = this.createLineElement(
      this.startPoint.x,
      this.startPoint.y,
      endX,
      endY
    )

    this.graph.addCell(finalLine)

    // 임시 선 제거
    this.currentLine.remove()

    this.startPoint = null
    this.currentLine = null
  }

  /**
   * JointJS 공식 standard.Path를 사용한 선 요소 생성
   * https://docs.jointjs.com/api/shapes/standard/Path
   */
  private createLineElement(x1: number, y1: number, x2: number, y2: number): shapes.standard.Path {
    const minX = Math.min(x1, x2)
    const minY = Math.min(y1, y2)
    const width = Math.abs(x2 - x1) || 1
    const height = Math.abs(y2 - y1) || 1

    // 로컬 좌표로 변환
    const localX1 = x1 - minX
    const localY1 = y1 - minY
    const localX2 = x2 - minX
    const localY2 = y2 - minY

    // JointJS 공식 Path 도형 사용
    const line = new shapes.standard.Path()
    line.position(minX, minY)
    line.resize(width, height)

    // refD를 사용하여 상대 경로 설정 (요소 크기에 맞춰 자동 스케일)
    line.attr({
      body: {
        refD: `M ${localX1} ${localY1} L ${localX2} ${localY2}`,
        stroke: '#000000',
        strokeWidth: 2,
        fill: 'none'
      },
      label: {
        text: ''  // 레이블 없음
      }
    })

    return line
  }

  /**
   * 선 요소 업데이트
   */
  private updateLineElement(line: shapes.standard.Path, x1: number, y1: number, x2: number, y2: number) {
    const minX = Math.min(x1, x2)
    const minY = Math.min(y1, y2)
    const width = Math.abs(x2 - x1) || 1
    const height = Math.abs(y2 - y1) || 1

    // 로컬 좌표로 변환
    const localX1 = x1 - minX
    const localY1 = y1 - minY
    const localX2 = x2 - minX
    const localY2 = y2 - minY

    line.position(minX, minY)
    line.resize(width, height)

    line.attr({
      'body/refD': `M ${localX1} ${localY1} L ${localX2} ${localY2}`
    })
  }
}
