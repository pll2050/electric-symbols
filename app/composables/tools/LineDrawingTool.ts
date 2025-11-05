import { dia } from '@joint/plus'

export class LineDrawingTool {
  private paper: dia.Paper
  private graph: dia.Graph
  private startPoint: { x: number; y: number } | null = null
  private currentLine: dia.Element | null = null
  private isShiftPressed: boolean = false

  constructor(paper: dia.Paper, graph: dia.Graph) {
    this.paper = paper
    this.graph = graph
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
    this.paper.on('blank:pointerdown', this.onPointerDown.bind(this))
    this.paper.on('blank:pointermove', this.onPointerMove.bind(this))
    this.paper.on('blank:pointerup', this.onPointerUp.bind(this))
  }

  deactivate() {
    this.paper.off('blank:pointerdown')
    this.paper.off('blank:pointermove')
    this.paper.off('blank:pointerup')
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
   * 연결점이 있는 선 요소 생성
   */
  private createLineElement(x1: number, y1: number, x2: number, y2: number): dia.Element {
    const line = new dia.Element({
      position: { x: Math.min(x1, x2), y: Math.min(y1, y2) },
      size: {
        width: Math.abs(x2 - x1) || 1,
        height: Math.abs(y2 - y1) || 1
      },
      attrs: {
        body: {
          refWidth: '100%',
          refHeight: '100%',
          fill: 'transparent',
          stroke: 'none'
        },
        line: {
          x1: x1 - Math.min(x1, x2),
          y1: y1 - Math.min(y1, y2),
          x2: x2 - Math.min(x1, x2),
          y2: y2 - Math.min(y1, y2),
          stroke: '#000000',
          strokeWidth: 2
        },
        // 시작점 연결점
        startPort: {
          cx: x1 - Math.min(x1, x2),
          cy: y1 - Math.min(y1, y2),
          r: 4,
          fill: '#4ade80',
          stroke: '#000000',
          strokeWidth: 2,
          cursor: 'pointer'
        },
        // 끝점 연결점
        endPort: {
          cx: x2 - Math.min(x1, x2),
          cy: y2 - Math.min(y1, y2),
          r: 4,
          fill: '#4ade80',
          stroke: '#000000',
          strokeWidth: 2,
          cursor: 'pointer'
        }
      },
      ports: {
        groups: {
          'connection': {
            position: 'absolute',
            attrs: {
              circle: {
                r: 4,
                fill: '#4ade80',
                stroke: '#000000',
                strokeWidth: 2,
                magnet: true
              }
            }
          }
        },
        items: [
          {
            id: 'start',
            group: 'connection',
            args: { x: x1 - Math.min(x1, x2), y: y1 - Math.min(y1, y2) }
          },
          {
            id: 'end',
            group: 'connection',
            args: { x: x2 - Math.min(x1, x2), y: y2 - Math.min(y1, y2) }
          }
        ]
      }
    })

    line.set('type', 'custom.Line')
    line.set('lineData', {
      startPoint: { x: x1, y: y1 },
      endPoint: { x: x2, y: y2 }
    })

    // markup 설정
    line.markup = [
      { tagName: 'rect', selector: 'body' },
      { tagName: 'line', selector: 'line' },
      { tagName: 'circle', selector: 'startPort' },
      { tagName: 'circle', selector: 'endPort' }
    ]

    return line
  }

  /**
   * 선 요소 업데이트
   */
  private updateLineElement(line: dia.Element, x1: number, y1: number, x2: number, y2: number) {
    const minX = Math.min(x1, x2)
    const minY = Math.min(y1, y2)
    const width = Math.abs(x2 - x1) || 1
    const height = Math.abs(y2 - y1) || 1

    line.position(minX, minY)
    line.resize(width, height)

    line.attr({
      'line/x1': x1 - minX,
      'line/y1': y1 - minY,
      'line/x2': x2 - minX,
      'line/y2': y2 - minY,
      'startPort/cx': x1 - minX,
      'startPort/cy': y1 - minY,
      'endPort/cx': x2 - minX,
      'endPort/cy': y2 - minY
    })

    // 포트 위치 업데이트
    line.portProp('start', 'args', { x: x1 - minX, y: y1 - minY })
    line.portProp('end', 'args', { x: x2 - minX, y: y2 - minY })
  }
}
