import { dia, elementTools } from '@joint/plus'
import { TransformTool } from './TransformTool'

export class MultiSelectionManager {
  private paper: dia.Paper
  private graph: dia.Graph
  private selectedElements: Set<dia.Element> = new Set()
  private isCtrlPressed: boolean = false
  private transformTool: TransformTool
  private showTransformHandles: boolean = true

  constructor(paper: dia.Paper, graph: dia.Graph) {
    this.paper = paper
    this.graph = graph
    this.transformTool = new TransformTool(paper, graph)
    this.setupKeyboardEvents()
    this.setupClickEvents()
    this.setupDragEvents()
  }

  private setupDragEvents() {
    this.paper.on('element:pointerdown', (elementView: dia.ElementView) => {
      const activeElement = elementView.model

      if (this.selectedElements.size <= 1 || !this.selectedElements.has(activeElement)) {
        return
      }

      const restOfSelection = Array.from(this.selectedElements).filter(
        (el) => el.id !== activeElement.id
      )

      const onDrag = (element: dia.Element, newPosition: any, options: any) => {
        // Prevent feedback loops from translations on follower elements.
        if (options['selection-drag']) {
          return
        }

        const tx = options.tx || 0
        const ty = options.ty || 0

        if (tx || ty) {
          restOfSelection.forEach((follower) => {
            follower.translate(tx, ty, { 'selection-drag': true })
          })
        }
      }

      const onDragEnd = () => {
        activeElement.off('change:position', onDrag)
        this.paper.off('element:pointerup', onDragEnd)
        this.paper.off('blank:pointerup', onDragEnd)
      }

      activeElement.on('change:position', onDrag)
      this.paper.once('element:pointerup', onDragEnd)
      this.paper.once('blank:pointerup', onDragEnd)
    })
  }

  private setupKeyboardEvents() {
    document.addEventListener('keydown', (evt) => {
      if (evt.key === 'Control' || evt.key === 'Meta') {
        this.isCtrlPressed = true
      }

      // Ctrl+A: 전체 선택
      if ((evt.ctrlKey || evt.metaKey) && evt.key === 'a') {
        evt.preventDefault()
        this.selectAll()
      }

      // Escape: 선택 해제
      if (evt.key === 'Escape') {
        this.clearSelection()
      }

      // Delete: 선택된 요소 삭제
      if (evt.key === 'Delete') {
        this.deleteSelected()
      }
    })

    document.addEventListener('keyup', (evt) => {
      if (evt.key === 'Control' || evt.key === 'Meta') {
        this.isCtrlPressed = false
      }
    })
  }

  private setupClickEvents() {
    this.paper.on('element:pointerclick', (elementView: dia.ElementView) => {
      const element = elementView.model as dia.Element

      if (this.isCtrlPressed) {
        // Ctrl 클릭: 다중 선택 토글
        if (this.selectedElements.has(element)) {
          this.deselectElement(element)
        } else {
          this.selectElement(element)
        }
      } else {
        // 일반 클릭: 단일 선택
        this.clearSelection()
        this.selectElement(element)
      }
    })

    this.paper.on('blank:pointerclick', () => {
      if (!this.isCtrlPressed) {
        this.clearSelection()
      }
    })
  }

  selectElement(element: dia.Element) {
    this.selectedElements.add(element)
    this.refreshHighlights()
  }

  deselectElement(element: dia.Element) {
    this.selectedElements.delete(element)
    this.transformTool.clear() // FreeTransform 정리
    this.unhighlightElement(element)
    this.refreshHighlights()
  }

  /**
   * 모든 선택된 요소의 하이라이트를 새로고침
   * (단일 선택 시 변환 핸들, 다중 선택 시 경계선만)
   */
  private refreshHighlights() {
    // FreeTransform 먼저 정리
    this.transformTool.clear()

    this.selectedElements.forEach(element => {
      this.unhighlightElement(element)
      this.highlightElement(element)
    })
  }

  private highlightElement(element: dia.Element) {
    const elementView = element.findView(this.paper)
    if (elementView) {
      if (this.showTransformHandles && this.selectedElements.size === 1) {
        // 단일 선택 시 변환 핸들 표시 (회전 + 크기 조절)
        this.transformTool.addTransformHandles(element)
      } else {
        // 다중 선택 시 간단한 경계선만 표시
        elementView.addTools(
          new dia.ToolsView({
            tools: [
              new elementTools.Boundary({
                padding: 5,
                attrs: {
                  stroke: '#4a90e2',
                  strokeWidth: 2,
                  fill: 'rgba(74, 144, 226, 0.1)'
                }
              })
            ]
          })
        )
      }
    }
  }

  private unhighlightElement(element: dia.Element) {
    const elementView = element.findView(this.paper)
    elementView?.removeTools()
  }

  clearSelection() {
    // FreeTransform 먼저 정리
    this.transformTool.clear()

    this.selectedElements.forEach(element => {
      this.unhighlightElement(element)
    })
    this.selectedElements.clear()
  }

  selectAll() {
    this.clearSelection()
    const elements = this.graph.getElements()
    elements.forEach(element => {
      this.selectElement(element)
    })
    console.log(`전체 선택: ${elements.length}개 요소`)
  }

  getSelectedElements(): dia.Element[] {
    return Array.from(this.selectedElements)
  }

  deleteSelected() {
    if (this.selectedElements.size === 0) return

    const count = this.selectedElements.size
    this.selectedElements.forEach(element => {
      element.remove()
    })
    this.selectedElements.clear()
    console.log(`${count}개 요소 삭제됨`)
  }

  // 선택된 요소들을 복사
  copySelected() {
    const elements = this.getSelectedElements()
    if (elements.length === 0) return null

    return elements.map(element => element.clone())
  }

  // 붙여넣기
  pasteElements(clonedElements: dia.Element[], offset: { x: number; y: number } = { x: 20, y: 20 }) {
    this.clearSelection()

    clonedElements.forEach(element => {
      const pos = element.position()
      element.position(pos.x + offset.x, pos.y + offset.y)
      this.graph.addCell(element)
      this.selectElement(element)
    })

    console.log(`${clonedElements.length}개 요소 붙여넣기 완료`)
  }

  // 영역 내의 요소들을 선택
  selectElementsInArea(elements: dia.Element[]) {
    this.clearSelection()
    elements.forEach(element => {
      this.selectElement(element)
    })
    console.log(`영역 선택: ${elements.length}개 요소`)
  }

  // 선택된 요소들을 그룹화
  groupSelected(): dia.Element | null {
    const elements = this.getSelectedElements()
    if (elements.length < 2) {
      console.log('그룹화하려면 최소 2개 이상의 요소를 선택해야 합니다.')
      return null
    }

    // 모든 요소의 경계를 계산
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    elements.forEach(element => {
      const bbox = element.getBBox()
      minX = Math.min(minX, bbox.x)
      minY = Math.min(minY, bbox.y)
      maxX = Math.max(maxX, bbox.x + bbox.width)
      maxY = Math.max(maxY, bbox.y + bbox.height)
    })

    // 그룹을 나타내는 사각형 생성 (보이지 않는 컨테이너)
    const groupElement = new dia.Element({
      position: { x: minX - 10, y: minY - 10 },
      size: { width: maxX - minX + 20, height: maxY - minY + 20 },
      attrs: {
        body: {
          fill: 'transparent',
          stroke: '#9e9e9e',
          strokeWidth: 1,
          strokeDasharray: '5,5',
          rx: 5,
          ry: 5
        },
        label: {
          text: `그룹 (${elements.length}개)`,
          fill: '#666',
          fontSize: 12,
          refY: -10
        }
      },
      markup: [{
        tagName: 'rect',
        selector: 'body'
      }, {
        tagName: 'text',
        selector: 'label'
      }]
    }) as dia.Element

    // 그룹 메타데이터 저장
    groupElement.prop('isGroup', true)
    groupElement.prop('groupedElements', elements.map(el => el.id))

    // 요소들을 그룹의 자식으로 설정 (임베딩)
    elements.forEach(element => {
      groupElement.embed(element)
    })

    this.graph.addCell(groupElement)

    // 그룹 요소만 선택
    this.clearSelection()
    this.selectElement(groupElement)

    console.log(`${elements.length}개 요소를 그룹화했습니다.`)
    return groupElement
  }

  // 그룹 해제
  ungroupSelected(): boolean {
    const elements = this.getSelectedElements()
    let ungrouped = false

    elements.forEach(element => {
      if (element.prop('isGroup')) {
        // 임베딩된 요소들을 해제
        const embeddedCells = element.getEmbeddedCells()
        embeddedCells.forEach((cell: any) => {
          if (cell.isElement()) {
            element.unembed(cell)
          }
        })

        // 그룹 요소 삭제
        element.remove()
        ungrouped = true
        console.log('그룹을 해제했습니다.')
      }
    })

    if (!ungrouped) {
      console.log('선택된 그룹이 없습니다.')
    }

    return ungrouped
  }

  // 선택된 요소 중 그룹이 있는지 확인
  hasGroupSelected(): boolean {
    return this.getSelectedElements().some(el => el.prop('isGroup'))
  }

  // 선택 가능한 요소 개수
  getSelectedCount(): number {
    return this.selectedElements.size
  }

  // ===== 회전 및 크기 조절 기능 =====

  /**
   * 선택된 요소들을 회전 (상대 각도)
   */
  rotateSelected(angleDelta: number) {
    const elements = this.getSelectedElements()
    if (elements.length === 0) {
      console.log('회전할 요소가 선택되지 않았습니다.')
      return
    }

    elements.forEach(element => {
      this.transformTool.rotateElement(element, angleDelta)
    })

    console.log(`${elements.length}개 요소를 ${angleDelta}도 회전했습니다.`)
  }

  /**
   * 선택된 요소들을 특정 각도로 회전 (절대 각도)
   */
  setRotation(angle: number) {
    const elements = this.getSelectedElements()
    if (elements.length === 0) {
      console.log('회전할 요소가 선택되지 않았습니다.')
      return
    }

    elements.forEach(element => {
      this.transformTool.setElementRotation(element, angle)
    })

    console.log(`${elements.length}개 요소를 ${angle}도로 설정했습니다.`)
  }

  /**
   * 선택된 요소들의 크기를 조절 (배율)
   */
  scaleSelected(scale: number) {
    const elements = this.getSelectedElements()
    if (elements.length === 0) {
      console.log('크기를 조절할 요소가 선택되지 않았습니다.')
      return
    }

    elements.forEach(element => {
      this.transformTool.resizeElement(element, scale)
    })

    console.log(`${elements.length}개 요소의 크기를 ${scale}배로 조절했습니다.`)
  }

  /**
   * 선택된 요소의 크기를 특정 크기로 설정 (단일 요소만)
   */
  setSize(width: number, height: number) {
    const elements = this.getSelectedElements()
    if (elements.length !== 1 || !elements[0]) {
      console.log('크기를 설정하려면 정확히 1개의 요소를 선택해야 합니다.')
      return
    }

    this.transformTool.setElementSize(elements[0], width, height)
    console.log(`요소 크기를 ${width}x${height}로 설정했습니다.`)
  }

  /**
   * 변환 핸들 표시 여부 토글
   */
  toggleTransformHandles(show: boolean) {
    this.showTransformHandles = show
    this.refreshHighlights()
  }

  /**
   * 현재 변환 핸들 표시 상태
   */
  isTransformHandlesVisible(): boolean {
    return this.showTransformHandles
  }
}
