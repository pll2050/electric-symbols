import { dia, ui } from '@joint/plus'

/**
 * TransformTool
 * JointJS의 공식 ui.FreeTransform을 사용한 도형 변환 도구
 * 회전 및 크기 조절을 위한 통합 인터페이스 제공
 */
export class TransformTool {
  private paper: dia.Paper
  private graph: dia.Graph
  private currentFreeTransform: ui.FreeTransform | null = null
  private isEnabled: boolean = true

  constructor(paper: dia.Paper, graph: dia.Graph) {
    this.paper = paper
    this.graph = graph
  }

  /**
   * 선택된 요소에 FreeTransform 위젯 추가 (회전 + 크기 조절)
   * 공식 예제 참고: new ui.FreeTransform({ graph, paper, cell })
   * https://docs.jointjs.com/learn/features/resize-and-rotate/
   */
  addTransformHandles(element: dia.Element) {
    // 기존 FreeTransform 제거
    this.clear()

    // JointJS 공식 FreeTransform 사용 (공식 문서 방식)
    this.currentFreeTransform = new ui.FreeTransform({
      graph: this.graph,
      paper: this.paper,
      cell: element
    })

    this.currentFreeTransform.render()
  }

  /**
   * 요소 회전 (상대 각도)
   * JointJS API: element.rotate(deg, absolute, origin, opt)
   * - deg: 회전 각도
   * - absolute: false (상대 각도 추가)
   * - origin: 회전 중심점 (미지정 시 요소 중심)
   */
  rotateElement(element: dia.Element, angleDelta: number) {
    // absolute = false: 현재 각도에 angleDelta를 더함
    element.rotate(angleDelta, false)
  }

  /**
   * 요소를 특정 각도로 회전 (절대 각도)
   * JointJS API: element.rotate(deg, absolute, origin, opt)
   * - deg: 설정할 각도
   * - absolute: true (절대 각도 설정)
   */
  setElementRotation(element: dia.Element, angle: number) {
    // absolute = true: 각도를 절대값으로 설정
    element.rotate(angle, true)
  }

  /**
   * 요소 크기 조절 (배율)
   * JointJS API: element.resize(width, height, opt)
   * - opt.direction: 리사이징 방향 (기본값: 'bottom-right')
   *
   * 중심점을 유지하면서 크기를 조절하기 위해 중심 위치를 계산하여 처리
   */
  resizeElement(element: dia.Element, scale: number) {
    const currentSize = element.size()
    const newWidth = currentSize.width * scale
    const newHeight = currentSize.height * scale

    // 중심점을 유지하기 위해 현재 중심 위치 저장
    const bbox = element.getBBox()
    const centerX = bbox.x + bbox.width / 2
    const centerY = bbox.y + bbox.height / 2

    // 크기 조절 (기본적으로 좌상단 기준으로 확장)
    element.resize(newWidth, newHeight)

    // 중심점이 원래 위치에 오도록 위치 조정
    const newBBox = element.getBBox()
    const newCenterX = newBBox.x + newBBox.width / 2
    const newCenterY = newBBox.y + newBBox.height / 2

    const deltaX = centerX - newCenterX
    const deltaY = centerY - newCenterY

    element.translate(deltaX, deltaY)
  }

  /**
   * 요소의 크기를 특정 크기로 설정
   * 중심점을 유지하면서 크기를 설정
   */
  setElementSize(element: dia.Element, width: number, height: number) {
    // 중심점을 유지하기 위해 현재 중심 위치 저장
    const bbox = element.getBBox()
    const centerX = bbox.x + bbox.width / 2
    const centerY = bbox.y + bbox.height / 2

    element.resize(width, height)

    // 중심점이 원래 위치에 오도록 위치 조정
    const newBBox = element.getBBox()
    const newCenterX = newBBox.x + newBBox.width / 2
    const newCenterY = newBBox.y + newBBox.height / 2

    const deltaX = centerX - newCenterX
    const deltaY = centerY - newCenterY

    element.translate(deltaX, deltaY)
  }

  /**
   * 변환 핸들 제거
   */
  removeTransformHandles(element: dia.Element) {
    if (this.currentFreeTransform) {
      this.currentFreeTransform.remove()
      this.currentFreeTransform = null
    }
  }

  /**
   * 현재 활성화된 FreeTransform 제거
   */
  clear() {
    if (this.currentFreeTransform) {
      this.currentFreeTransform.remove()
      this.currentFreeTransform = null
    }
  }

  /**
   * 도구 활성화
   */
  enable() {
    this.isEnabled = true
  }

  /**
   * 도구 비활성화
   */
  disable() {
    this.isEnabled = false
    this.clear()
  }

  /**
   * 활성화 상태 확인
   */
  getEnabled(): boolean {
    return this.isEnabled
  }

  /**
   * 현재 FreeTransform이 활성화되어 있는지 확인
   */
  isActive(): boolean {
    return this.currentFreeTransform !== null
  }
}
