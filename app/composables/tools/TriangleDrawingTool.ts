import { dia, shapes } from '@joint/plus'

export class TriangleDrawingTool {
  private paper: dia.Paper
  private graph: dia.Graph
  private startPoint: { x: number; y: number } | null = null
  private currentTriangle: shapes.standard.Polygon | null = null
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
    this.startPoint = null
    this.currentTriangle = null
  }

  private onPointerDown(evt: dia.Event, x: number, y: number) {
    this.startPoint = { x, y }

    // 임시 삼각형 생성
    this.currentTriangle = new shapes.standard.Polygon({
      attrs: {
        body: {
          points: `${x},${y} ${x},${y} ${x},${y}`,
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 2
        }
      }
    })

    this.graph.addCell(this.currentTriangle)
  }

  private onPointerMove(evt: dia.Event, x: number, y: number) {
    if (!this.startPoint || !this.currentTriangle) return

    const width = x - this.startPoint.x
    const height = y - this.startPoint.y

    // 정삼각형 포인트 계산
    const topX = this.startPoint.x + width / 2
    const topY = this.startPoint.y
    const leftX = this.startPoint.x
    const leftY = this.startPoint.y + height
    const rightX = x
    const rightY = this.startPoint.y + height

    this.currentTriangle.attr('body/points',
      `${topX},${topY} ${leftX},${leftY} ${rightX},${rightY}`
    )
  }

  private onPointerUp(evt: dia.Event, x: number, y: number) {
    this.startPoint = null
    this.currentTriangle = null
  }
}
