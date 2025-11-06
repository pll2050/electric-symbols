<template>
  <div class="vector-editor">
    <!-- 툴바 -->
    <div class="toolbar">
      <div class="tool-group">
        <button
          v-for="tool in tools"
          :key="tool.mode"
          @click="setMode(tool.mode)"
          :class="['tool-btn', { active: currentMode === tool.mode }]"
          :title="tool.label"
        >
          {{ tool.icon }}
        </button>
      </div>

      <div class="tool-group">
        <button
          @click="groupSelected"
          class="tool-btn"
          :disabled="selectedCount < 2"
          :class="{ 'opacity-50 cursor-not-allowed': selectedCount < 2 }"
          title="그룹화 (2개 이상 선택)"
        >
          📦
        </button>
        <button
          @click="ungroupSelected"
          class="tool-btn"
          :disabled="!hasGroup"
          :class="{ 'opacity-50 cursor-not-allowed': !hasGroup }"
          title="그룹 해제"
        >
          📤
        </button>
      </div>

      <div class="tool-group">
        <button
          @click="rotateLeft"
          class="tool-btn"
          :disabled="selectedCount === 0"
          :class="{ 'opacity-50 cursor-not-allowed': selectedCount === 0 }"
          title="왼쪽으로 15도 회전"
        >
          ↺
        </button>
        <button
          @click="rotateRight"
          class="tool-btn"
          :disabled="selectedCount === 0"
          :class="{ 'opacity-50 cursor-not-allowed': selectedCount === 0 }"
          title="오른쪽으로 15도 회전"
        >
          ↻
        </button>
      </div>

      <div class="tool-group">
        <button
          @click="scaleUp"
          class="tool-btn"
          :disabled="selectedCount === 0"
          :class="{ 'opacity-50 cursor-not-allowed': selectedCount === 0 }"
          title="크기 확대 (120%)"
        >
          🔍+
        </button>
        <button
          @click="scaleDown"
          class="tool-btn"
          :disabled="selectedCount === 0"
          :class="{ 'opacity-50 cursor-not-allowed': selectedCount === 0 }"
          title="크기 축소 (80%)"
        >
          🔍-
        </button>
      </div>

      <div class="tool-group">
        <button @click="deleteSelected" class="tool-btn" title="삭제 (Delete)">
          🗑️
        </button>
        <button @click="clearCanvas" class="tool-btn" title="전체 삭제">
          🧹
        </button>
      </div>

      <div class="tool-group">
        <button @click="exportToJSON" class="tool-btn" title="JSON 내보내기">
          💾
        </button>
      </div>
    </div>

    <!-- 캔버스 -->
    <div class="canvas-container">
      <div ref="canvasRef" class="canvas"></div>
    </div>

    <!-- 하단 정보 -->
    <div class="footer">
      <span class="text-xs text-gray-600">
        드래그: 영역 선택 | Shift: 수평/수직선 | Ctrl+A: 전체 선택 | Ctrl+C/V: 복사/붙여넣기 | Delete: 삭제 | R: 회전 | [/]: 크기 | Ctrl+클릭: 다중 선택
      </span>
      <span class="text-xs text-gray-600 ml-4" v-if="selectedCount > 0">
        선택됨: {{ selectedCount }}개
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { dia, shapes, ui, mvc } from '@joint/plus'
import '@joint/plus/joint-plus.css'
import { ToolManager, DrawingMode } from '~/composables/tools/ToolManager'

const canvasRef = ref<HTMLElement | null>(null)
const currentMode = ref<DrawingMode>(DrawingMode.SELECT)
const selectedCount = ref(0)
const hasGroup = ref(false)

let graph: dia.Graph | null = null
let paper: dia.Paper | null = null
let scroller: ui.PaperScroller | null = null
let toolManager: ToolManager | null = null
let selection: ui.Selection | null = null
let selectionCollection: mvc.Collection<dia.Cell> | null = null

const tools = [
  { mode: DrawingMode.SELECT, icon: '🖱️', label: '선택' },
  { mode: DrawingMode.LINE, icon: '📏', label: '선' },
  { mode: DrawingMode.RECTANGLE, icon: '⬜', label: '사각형' },
  { mode: DrawingMode.CIRCLE, icon: '⭕', label: '원' },
  { mode: DrawingMode.TRIANGLE, icon: '🔺', label: '삼각형' },
  { mode: DrawingMode.PORTED_RECTANGLE, icon: '🔌', label: '포트 사각형' },
  { mode: DrawingMode.PORTED_CIRCLE, icon: '⚡', label: '포트 원형' }
]

const setMode = (mode: DrawingMode) => {
  currentMode.value = mode
  if (toolManager) {
    toolManager.setMode(mode)
  }

  // 선택 모드가 아닐 때는 선택 해제
  if (mode !== DrawingMode.SELECT && selectionCollection) {
    selectionCollection.reset([])
  }
}

const updateSelectionState = () => {
  if (selectionCollection) {
    selectedCount.value = selectionCollection.length
    const cells = selectionCollection.toArray()
    hasGroup.value = cells.some((cell: dia.Cell) =>
      cell.isElement() && (cell as dia.Element).prop('isGroup')
    )
  }
}

const deleteSelected = () => {
  if (selectionCollection) {
    const cells = selectionCollection.toArray()
    cells.forEach(cell => cell.remove())
    selectionCollection.reset([])
    updateSelectionState()
  }
}

const groupSelected = () => {
  if (!selectionCollection || selectionCollection.length < 2) {
    console.log('그룹화하려면 최소 2개 이상의 요소를 선택해야 합니다.')
    return
  }

  const elements = selectionCollection.toArray().filter(cell => cell.isElement()) as dia.Element[]

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

  // 그룹을 나타내는 사각형 생성
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

  // 요소들을 그룹의 자식으로 설정
  elements.forEach(element => {
    groupElement.embed(element)
  })

  graph?.addCell(groupElement)

  // 그룹 요소만 선택
  selectionCollection.reset([groupElement])
  updateSelectionState()

  console.log(`${elements.length}개 요소를 그룹화했습니다.`)
}

const ungroupSelected = () => {
  if (!selectionCollection) return

  const elements = selectionCollection.toArray().filter(cell => cell.isElement()) as dia.Element[]
  let ungrouped = false

  elements.forEach(element => {
    if (element.prop('isGroup')) {
      // 임베딩된 요소들을 해제
      const embeddedCells = element.getEmbeddedCells()
      embeddedCells.forEach((cell: dia.Cell) => {
        if (cell.isElement()) {
          element.unembed(cell as dia.Element)
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

  updateSelectionState()
}

const rotateElement = (element: dia.Element, angleDelta: number) => {
  element.rotate(angleDelta, false)
}

const resizeElement = (element: dia.Element, scale: number) => {
  const currentSize = element.size()
  const newWidth = currentSize.width * scale
  const newHeight = currentSize.height * scale

  // 중심점을 유지하기 위해 현재 중심 위치 저장
  const bbox = element.getBBox()
  const centerX = bbox.x + bbox.width / 2
  const centerY = bbox.y + bbox.height / 2

  element.resize(newWidth, newHeight)

  // 중심점이 원래 위치에 오도록 위치 조정
  const newBBox = element.getBBox()
  const newCenterX = newBBox.x + newBBox.width / 2
  const newCenterY = newBBox.y + newBBox.height / 2

  const deltaX = centerX - newCenterX
  const deltaY = centerY - newCenterY

  element.translate(deltaX, deltaY)
}

const rotateLeft = () => {
  if (!selectionCollection) return

  const elements = selectionCollection.toArray().filter(cell => cell.isElement()) as dia.Element[]
  elements.forEach(element => rotateElement(element, -15))

  console.log(`${elements.length}개 요소를 -15도 회전했습니다.`)
}

const rotateRight = () => {
  if (!selectionCollection) return

  const elements = selectionCollection.toArray().filter(cell => cell.isElement()) as dia.Element[]
  elements.forEach(element => rotateElement(element, 15))

  console.log(`${elements.length}개 요소를 15도 회전했습니다.`)
}

const scaleUp = () => {
  if (!selectionCollection) return

  const elements = selectionCollection.toArray().filter(cell => cell.isElement()) as dia.Element[]
  elements.forEach(element => resizeElement(element, 1.2))

  console.log(`${elements.length}개 요소를 1.2배 확대했습니다.`)
}

const scaleDown = () => {
  if (!selectionCollection) return

  const elements = selectionCollection.toArray().filter(cell => cell.isElement()) as dia.Element[]
  elements.forEach(element => resizeElement(element, 0.8))

  console.log(`${elements.length}개 요소를 0.8배 축소했습니다.`)
}

const clearCanvas = () => {
  if (graph && confirm('모든 요소를 삭제하시겠습니까?')) {
    graph.clear()
    updateSelectionState()
  }
}

const exportToJSON = () => {
  if (graph) {
    const json = graph.toJSON()
    const dataStr = JSON.stringify(json, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const exportFileDefaultName = 'vector-drawing.json'

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }
}

onMounted(() => {
  if (!canvasRef.value) return

  // 1. 그래프 생성
  graph = new dia.Graph({}, { cellNamespace: shapes })

  // 2. 페이퍼 생성
  paper = new dia.Paper({
    model: graph,
    width: 1200,
    height: 800,
    gridSize: 10,
    drawGrid: {
      name: 'mesh',
      args: { color: '#e5e7eb' }
    },
    background: { color: '#ffffff' },
    cellViewNamespace: shapes,
    interactive: { elementMove: true },
    frozen: true,
    async: true,

    // 포트 연결 검증
    validateConnection: function(cellViewS, magnetS, cellViewT, magnetT) {
      // 자기 자신에게 연결 불가
      if (cellViewS === cellViewT) return false

      // 양쪽 모두 포트가 있어야 연결 가능
      return !!(magnetS && magnetT)
    },

    // 포트 근처로 링크 자동 스냅
    snapLinks: { radius: 30 },

    // 연결 가능한 포트 강조 표시
    markAvailable: true,

    // 링크 기본 스타일
    defaultLink: new dia.Link({
      attrs: {
        line: {
          stroke: '#4A90E2',
          strokeWidth: 2,
          targetMarker: {
            type: 'path',
            d: 'M 10 -5 0 0 10 5 z',
            fill: '#4A90E2'
          }
        }
      }
    })
  })

  // 3. PaperScroller 생성
  scroller = new ui.PaperScroller({
    paper,
    autoResizePaper: false,
    cursor: 'grab',
    padding: 50
  })

  // 4. DOM에 추가
  canvasRef.value.appendChild(scroller.el)
  scroller.render().center()

  // 5. Paper 활성화
  paper.unfreeze()

  // 6. 도구 초기화
  toolManager = new ToolManager(paper, graph)

  // 7. JointJS+ Selection 초기화 (공식 방식)
  selectionCollection = new mvc.Collection<dia.Cell>()

  selection = new ui.Selection({
    paper: paper,
    collection: selectionCollection,
    useModelGeometry: true
  })

  // 8. Selection 이벤트 설정 (공식 예제 방식)
  // 빈 영역 드래그로 영역 선택 시작
  paper.on('blank:pointerdown', (evt: dia.Event) => {
    if (currentMode.value === DrawingMode.SELECT) {
      selection?.startSelecting(evt)
    }
  })

  // Ctrl/Meta 키로 요소 추가 선택
  paper.on('element:pointerup', (cellView: dia.CellView, evt: dia.Event) => {
    if (currentMode.value === DrawingMode.SELECT) {
      if (evt.ctrlKey || evt.metaKey) {
        selectionCollection?.add(cellView.model)
      } else {
        selectionCollection?.reset([cellView.model])
      }
      updateSelectionState()
    }
  })

  // Selection box 클릭 시 Ctrl로 선택 해제
  selection.on('selection-box:pointerdown', (elementView: dia.ElementView, evt: dia.Event) => {
    if (evt.ctrlKey || evt.metaKey) {
      selectionCollection?.remove(elementView.model)
      updateSelectionState()
    }
  })

  // 빈 영역 클릭 시 선택 해제
  paper.on('blank:pointerclick', () => {
    if (currentMode.value === DrawingMode.SELECT) {
      selectionCollection?.reset([])
      updateSelectionState()
    }
  })

  // Selection collection 변경 시 상태 업데이트
  selectionCollection.on('add remove reset', () => {
    updateSelectionState()
  })

  // 그래프 변경 시 선택 상태 업데이트
  graph.on('add remove', () => {
    setTimeout(updateSelectionState, 0)
  })

  // 키보드 이벤트
  document.addEventListener('keydown', (evt) => {
    // Ctrl+A: 전체 선택
    if ((evt.ctrlKey || evt.metaKey) && evt.key === 'a') {
      evt.preventDefault()
      if (currentMode.value === DrawingMode.SELECT) {
        const allElements = graph?.getElements() || []
        selectionCollection?.reset(allElements)
        console.log(`전체 선택: ${allElements.length}개 요소`)
      }
    }

    // 복사 (Ctrl+C)
    if ((evt.ctrlKey || evt.metaKey) && evt.key === 'c') {
      evt.preventDefault()
      if (selectionCollection && selectionCollection.length > 0) {
        const elements = selectionCollection.toArray().filter(cell => cell.isElement()) as dia.Element[]
        sessionStorage.setItem('clipboard', JSON.stringify(
          elements.map(el => el.toJSON())
        ))
        console.log('복사됨')
      }
    }

    // 붙여넣기 (Ctrl+V)
    if ((evt.ctrlKey || evt.metaKey) && evt.key === 'v') {
      evt.preventDefault()
      const clipboardData = sessionStorage.getItem('clipboard')
      if (clipboardData && graph) {
        const elementsData = JSON.parse(clipboardData)
        const clonedElements = elementsData.map((data: any) => {
          const ElementClass = (shapes.standard as any)[data.type.split('.')[1]] || shapes.standard.Rectangle
          const element = new ElementClass()
          element.set(data)
          const pos = element.position()
          element.position(pos.x + 20, pos.y + 20)
          return element
        })
        graph.addCells(clonedElements)
        selectionCollection?.reset(clonedElements)
        console.log('붙여넣기 완료')
      }
    }

    // Delete: 선택된 요소 삭제
    if (evt.key === 'Delete') {
      deleteSelected()
    }

    // Escape: 선택 해제
    if (evt.key === 'Escape') {
      selectionCollection?.reset([])
    }

    // 회전 (R키 또는 Shift+R)
    if (evt.key === 'r' || evt.key === 'R') {
      evt.preventDefault()
      if (selectedCount.value > 0) {
        if (evt.shiftKey) {
          rotateLeft()
        } else {
          rotateRight()
        }
      }
    }

    // 크기 확대 (] 키)
    if (evt.key === ']') {
      evt.preventDefault()
      if (selectedCount.value > 0) {
        scaleUp()
      }
    }

    // 크기 축소 ([ 키)
    if (evt.key === '[') {
      evt.preventDefault()
      if (selectedCount.value > 0) {
        scaleDown()
      }
    }
  })
})

onUnmounted(() => {
  // Selection 정리
  if (selection) {
    selection.remove()
    selection = null
  }

  if (selectionCollection) {
    selectionCollection.reset([])
    selectionCollection = null
  }

  // PaperScroller 정리
  if (scroller) {
    scroller.remove()
    scroller = null
  }

  // Paper 정리
  if (paper) {
    paper.remove()
    paper = null
  }

  // Graph 정리
  if (graph) {
    graph.clear()
    graph = null
  }

  toolManager = null
})
</script>

<style scoped>
.vector-editor {
  @apply flex flex-col h-full bg-gray-50;
}

.toolbar {
  @apply flex items-center gap-2 p-3 bg-white border-b border-gray-200 shadow-sm;
}

.tool-group {
  @apply flex gap-1 px-2 border-r border-gray-300;
}

.tool-group:last-child {
  @apply border-r-0;
}

.tool-btn {
  @apply px-3 py-2 text-lg bg-gray-100 hover:bg-gray-200 rounded transition-colors;
}

.tool-btn.active {
  @apply bg-blue-500 text-white hover:bg-blue-600;
}

.canvas-container {
  @apply flex-1 overflow-hidden p-4;
}

.canvas {
  @apply w-full h-full border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden;
  position: relative;
}

/* PaperScroller 스타일 */
.canvas :deep(.joint-paper-scroller) {
  width: 100%;
  height: 100%;
}

.canvas :deep(.joint-paper) {
  border: 1px solid #e5e7eb;
}

.footer {
  @apply bg-white border-t border-gray-200 px-4 py-2 text-center;
}
</style>
