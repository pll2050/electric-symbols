import { dia } from '@joint/plus'

/**
 * SelectionBoxTool - 드래그로 영역을 지정하여 여러 도형을 선택하는 도구
 * SYMBOL_CREATION_GUIDE.md Section 15: Selection Box
 */
export class SelectionBoxTool {
  private paper: dia.Paper
  private graph: dia.Graph
  private isDrawing: boolean = false
  private startPoint: { x: number; y: number } | null = null
  private selectionBox: SVGRectElement | null = null
  private onSelectionComplete?: (selectedElements: dia.Element[]) => void

  constructor(
    paper: dia.Paper,
    graph: dia.Graph,
    onSelectionComplete?: (selectedElements: dia.Element[]) => void
  ) {
    this.paper = paper
    this.graph = graph
    this.onSelectionComplete = onSelectionComplete
  }

  activate() {
    // 선택 박스 그리기 이벤트 등록
    this.paper.on('blank:pointerdown', this.onPointerDown, this)
    this.paper.on('blank:pointermove', this.onPointerMove, this)
    this.paper.on('blank:pointerup', this.onPointerUp, this)

    // 캔버스 이동 시에도 이벤트 처리
    document.addEventListener('mousemove', this.onDocumentMouseMove)
    document.addEventListener('mouseup', this.onDocumentMouseUp)
  }

  deactivate() {
    this.paper.off('blank:pointerdown', this.onPointerDown, this)
    this.paper.off('blank:pointermove', this.onPointerMove, this)
    this.paper.off('blank:pointerup', this.onPointerUp, this)

    document.removeEventListener('mousemove', this.onDocumentMouseMove)
    document.removeEventListener('mouseup', this.onDocumentMouseUp)

    this.clearSelectionBox()
  }

  private onPointerDown = (evt: dia.Event) => {
    this.isDrawing = true
    const localPoint = this.paper.clientToLocalPoint(evt.clientX, evt.clientY)
    this.startPoint = { x: localPoint.x, y: localPoint.y }

    // 선택 박스 SVG 요소 생성
    this.createSelectionBox(localPoint.x, localPoint.y)
  }

  private onPointerMove = (evt: dia.Event) => {
    if (!this.isDrawing || !this.startPoint || !this.selectionBox) return

    const localPoint = this.paper.clientToLocalPoint(evt.clientX, evt.clientY)
    this.updateSelectionBox(this.startPoint, localPoint)
  }

  private onPointerUp = (evt: dia.Event) => {
    if (!this.isDrawing || !this.startPoint) return

    const localPoint = this.paper.clientToLocalPoint(evt.clientX, evt.clientY)

    // 선택 영역 내의 요소들 찾기
    const selectedElements = this.getElementsInArea(this.startPoint, localPoint)

    // 콜백 호출
    if (this.onSelectionComplete) {
      this.onSelectionComplete(selectedElements)
    }

    // 정리
    this.isDrawing = false
    this.startPoint = null
    this.clearSelectionBox()
  }

  private onDocumentMouseMove = (evt: MouseEvent) => {
    if (!this.isDrawing || !this.startPoint || !this.selectionBox) return

    const localPoint = this.paper.clientToLocalPoint(evt.clientX, evt.clientY)
    this.updateSelectionBox(this.startPoint, localPoint)
  }

  private onDocumentMouseUp = (evt: MouseEvent) => {
    if (!this.isDrawing) return
    this.onPointerUp(evt as any)
  }

  private createSelectionBox(x: number, y: number) {
    const svg = this.paper.svg
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')

    rect.setAttribute('x', String(x))
    rect.setAttribute('y', String(y))
    rect.setAttribute('width', '0')
    rect.setAttribute('height', '0')
    rect.setAttribute('fill', 'rgba(33, 150, 243, 0.1)')
    rect.setAttribute('stroke', '#2196F3')
    rect.setAttribute('stroke-width', '1')
    rect.setAttribute('stroke-dasharray', '5,5')
    rect.setAttribute('pointer-events', 'none')

    svg.appendChild(rect)
    this.selectionBox = rect
  }

  private updateSelectionBox(start: { x: number; y: number }, end: { x: number; y: number }) {
    if (!this.selectionBox) return

    const x = Math.min(start.x, end.x)
    const y = Math.min(start.y, end.y)
    const width = Math.abs(end.x - start.x)
    const height = Math.abs(end.y - start.y)

    this.selectionBox.setAttribute('x', String(x))
    this.selectionBox.setAttribute('y', String(y))
    this.selectionBox.setAttribute('width', String(width))
    this.selectionBox.setAttribute('height', String(height))
  }

  private clearSelectionBox() {
    if (this.selectionBox) {
      this.selectionBox.remove()
      this.selectionBox = null
    }
  }

  private getElementsInArea(
    start: { x: number; y: number },
    end: { x: number; y: number }
  ): dia.Element[] {
    // 선택 영역 계산
    const selectionX = Math.min(start.x, end.x)
    const selectionY = Math.min(start.y, end.y)
    const selectionWidth = Math.abs(end.x - start.x)
    const selectionHeight = Math.abs(end.y - start.y)

    // 선택 영역과 교차하는 모든 요소 찾기
    const elements = this.graph.getElements()
    const selectedElements: dia.Element[] = []

    elements.forEach((element) => {
      const bbox = element.getBBox()

      // 두 사각형이 겹치는지 확인 (AABB 충돌 검사)
      const intersects = !(
        bbox.x + bbox.width < selectionX ||
        bbox.x > selectionX + selectionWidth ||
        bbox.y + bbox.height < selectionY ||
        bbox.y > selectionY + selectionHeight
      )

      if (intersects) {
        selectedElements.push(element)
      }
    })

    return selectedElements
  }
}
