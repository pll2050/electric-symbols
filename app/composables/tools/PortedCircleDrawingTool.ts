import { dia } from '@joint/plus'
import { PortedCircle } from '../shapes/PortedRectangle'

export class PortedCircleDrawingTool {
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

    // 포트를 가진 원 생성
    const portedCircle = new PortedCircle({
      position: { x: x - 40, y: y - 40 },
      size: { width: 80, height: 80 }
    })

    this.graph.addCell(portedCircle)
    console.log('포트 원형 생성됨')
  }
}
