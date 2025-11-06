import { dia } from '@joint/plus'
import { PortedRectangle } from '../shapes/PortedRectangle'

export class PortedRectangleDrawingTool {
  private paper: dia.Paper
  private graph: dia.Graph
  private isActive: boolean = false

  constructor(paper: dia.Paper, graph: dia.Graph) {
    this.paper = paper
    this.graph = graph
  }

  activate() {
    this.isActive = true
    this.paper.on('blank:pointerdown', this.onPointerDown, this)
  }

  deactivate() {
    this.isActive = false
    this.paper.off('blank:pointerdown', this.onPointerDown, this)
  }

  private onPointerDown(evt: dia.Event, x: number, y: number) {
    if (!this.isActive) return

    // 포트를 가진 사각형 생성
    const portedRect = new PortedRectangle({
      position: { x: x - 50, y: y - 30 },
      size: { width: 100, height: 60 }
    })

    this.graph.addCell(portedRect)
    console.log('포트 사각형 생성됨')
  }
}
