import { dia, shapes } from '@joint/plus'

export class RectangleDrawingTool {
  private paper: dia.Paper
  private graph: dia.Graph
  private startPoint: { x: number; y: number } | null = null
  private currentRect: shapes.standard.Rectangle | null = null
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
    this.currentRect = null
  }

  private onPointerDown(evt: dia.Event, x: number, y: number) {
    this.startPoint = { x, y }

    // 임시 사각형 생성
    this.currentRect = new shapes.standard.Rectangle({
      position: { x, y },
      size: { width: 1, height: 1 },
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 2
        }
      }
    })

    this.graph.addCell(this.currentRect)
  }

  private onPointerMove(evt: dia.Event, x: number, y: number) {
    if (!this.startPoint || !this.currentRect) return

    // 드래그 방향에 따라 위치와 크기 계산
    const width = Math.abs(x - this.startPoint.x)
    const height = Math.abs(y - this.startPoint.y)
    const posX = Math.min(x, this.startPoint.x)
    const posY = Math.min(y, this.startPoint.y)

    this.currentRect.position(posX, posY)
    this.currentRect.resize(width, height)
  }

  private onPointerUp(evt: dia.Event, x: number, y: number) {
    if (!this.startPoint || !this.currentRect) return

    // 너무 작으면 삭제
    const size = this.currentRect.size()
    if (size.width < 5 || size.height < 5) {
      this.currentRect.remove()
    }

    this.startPoint = null
    this.currentRect = null
  }
}
