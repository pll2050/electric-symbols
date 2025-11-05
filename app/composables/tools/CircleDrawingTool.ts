import { dia, shapes } from '@joint/plus'

export class CircleDrawingTool {
  private paper: dia.Paper
  private graph: dia.Graph
  private centerPoint: { x: number; y: number } | null = null
  private currentCircle: shapes.standard.Circle | null = null
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
    this.centerPoint = null
    this.currentCircle = null
  }

  private onPointerDown(evt: dia.Event, x: number, y: number) {
    this.centerPoint = { x, y }

    // 임시 원 생성
    this.currentCircle = new shapes.standard.Circle({
      position: { x: x - 1, y: y - 1 },
      size: { width: 2, height: 2 },
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 2
        }
      }
    })

    this.graph.addCell(this.currentCircle)
  }

  private onPointerMove(evt: dia.Event, x: number, y: number) {
    if (!this.centerPoint || !this.currentCircle) return

    // 중심점에서의 거리로 반지름 계산
    const dx = x - this.centerPoint.x
    const dy = y - this.centerPoint.y
    const radius = Math.sqrt(dx * dx + dy * dy)
    const diameter = radius * 2

    // 원의 위치와 크기 업데이트
    this.currentCircle.position(
      this.centerPoint.x - radius,
      this.centerPoint.y - radius
    )
    this.currentCircle.resize(diameter, diameter)
  }

  private onPointerUp(evt: dia.Event, x: number, y: number) {
    if (!this.centerPoint || !this.currentCircle) return

    // 너무 작으면 삭제
    const size = this.currentCircle.size()
    if (size.width < 5) {
      this.currentCircle.remove()
    }

    this.centerPoint = null
    this.currentCircle = null
  }
}
