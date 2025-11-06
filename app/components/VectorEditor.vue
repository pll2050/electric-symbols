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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { dia, shapes, ui } from '@joint/plus'
import '@joint/plus/joint-plus.css'
import { ToolManager, DrawingMode } from '~/composables/tools/ToolManager'
import { MultiSelectionManager } from '~/composables/tools/MultiSelectionManager'
import { SelectionBoxTool } from '~/composables/tools/SelectionBoxTool'

const canvasRef = ref<HTMLElement | null>(null)
const currentMode = ref<DrawingMode>(DrawingMode.SELECT)
const selectedCount = ref(0)
const hasGroup = ref(false)

let graph: dia.Graph | null = null
let paper: dia.Paper | null = null
let scroller: ui.PaperScroller | null = null
let toolManager: ToolManager | null = null
let multiSelect: MultiSelectionManager | null = null
let selectionBoxTool: SelectionBoxTool | null = null

const tools = [
  { mode: DrawingMode.SELECT, icon: '🖱️', label: '선택' },
  { mode: DrawingMode.LINE, icon: '📏', label: '선' },
  { mode: DrawingMode.RECTANGLE, icon: '⬜', label: '사각형' },
  { mode: DrawingMode.CIRCLE, icon: '⭕', label: '원' },
  { mode: DrawingMode.TRIANGLE, icon: '🔺', label: '삼각형' }
]

const setMode = (mode: DrawingMode) => {
  currentMode.value = mode
  if (toolManager) {
    toolManager.setMode(mode)
  }

  // 선택 모드일 때만 SelectionBoxTool 활성화
  if (selectionBoxTool) {
    if (mode === DrawingMode.SELECT) {
      selectionBoxTool.activate()
    } else {
      selectionBoxTool.deactivate()
    }
  }
}

const updateSelectionState = () => {
  if (multiSelect) {
    selectedCount.value = multiSelect.getSelectedCount()
    hasGroup.value = multiSelect.hasGroupSelected()
  }
}

const deleteSelected = () => {
  if (multiSelect) {
    multiSelect.deleteSelected()
    updateSelectionState()
  }
}

const groupSelected = () => {
  if (multiSelect) {
    multiSelect.groupSelected()
    updateSelectionState()
  }
}

const ungroupSelected = () => {
  if (multiSelect) {
    multiSelect.ungroupSelected()
    updateSelectionState()
  }
}

const rotateLeft = () => {
  if (multiSelect) {
    multiSelect.rotateSelected(-15) // 반시계방향 15도
    updateSelectionState()
  }
}

const rotateRight = () => {
  if (multiSelect) {
    multiSelect.rotateSelected(15) // 시계방향 15도
    updateSelectionState()
  }
}

const scaleUp = () => {
  if (multiSelect) {
    multiSelect.scaleSelected(1.2) // 120% 확대
    updateSelectionState()
  }
}

const scaleDown = () => {
  if (multiSelect) {
    multiSelect.scaleSelected(0.8) // 80% 축소
    updateSelectionState()
  }
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

  // 1. 그래프 생성 (cellNamespace를 shapes로 지정)
  graph = new dia.Graph({}, { cellNamespace: shapes })

  // 2. 페이퍼 생성 (frozen: true, async: true로 시작)
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
    async: true
  })

  // 3. PaperScroller 생성 및 렌더링
  scroller = new ui.PaperScroller({
    paper,
    autoResizePaper: false, // 자동 크기 조정 비활성화 (도형 그릴 때 캔버스 축소 방지)
    cursor: 'grab',
    padding: 50
  })

  // 4. DOM에 추가
  canvasRef.value.appendChild(scroller.el)
  scroller.render().center()

  // 5. Paper 활성화
  paper.unfreeze()

  // 도구 초기화
  toolManager = new ToolManager(paper, graph)
  multiSelect = new MultiSelectionManager(paper, graph)

  // 영역 선택 도구 초기화
  selectionBoxTool = new SelectionBoxTool(paper, graph, (selectedElements) => {
    if (multiSelect) {
      multiSelect.selectElementsInArea(selectedElements)
      updateSelectionState()
    }
  })

  // 선택 모드일 때만 영역 선택 도구 활성화 (초기 모드는 SELECT)
  selectionBoxTool.activate()

  // 요소 클릭 시 선택 상태 업데이트
  paper.on('element:pointerclick', () => {
    setTimeout(updateSelectionState, 0)
  })

  paper.on('blank:pointerclick', () => {
    setTimeout(updateSelectionState, 0)
  })

  // 그래프 변경 시 선택 상태 업데이트
  graph.on('add remove', () => {
    setTimeout(updateSelectionState, 0)
  })

  // 복사/붙여넣기 및 회전/크기 조절 이벤트
  document.addEventListener('keydown', (evt) => {
    // 복사 (Ctrl+C)
    if ((evt.ctrlKey || evt.metaKey) && evt.key === 'c') {
      evt.preventDefault()
      const clipboard = multiSelect?.copySelected()
      if (clipboard) {
        sessionStorage.setItem('clipboard', JSON.stringify(
          clipboard.map(el => el.toJSON())
        ))
        console.log('복사됨')
      }
    }

    // 붙여넣기 (Ctrl+V)
    if ((evt.ctrlKey || evt.metaKey) && evt.key === 'v') {
      evt.preventDefault()
      const clipboardData = sessionStorage.getItem('clipboard')
      if (clipboardData && multiSelect) {
        const elementsData = JSON.parse(clipboardData)
        const clonedElements = elementsData.map((data: any) => {
          // 기본 shapes에서 요소 복원
          const ElementClass = (shapes.standard as any)[data.type.split('.')[1]] || shapes.standard.Rectangle
          const element = new ElementClass()
          element.set(data)
          return element
        })
        multiSelect.pasteElements(clonedElements)
        console.log('붙여넣기 완료')
      }
    }

    // 회전 (R키 또는 Shift+R)
    if (evt.key === 'r' || evt.key === 'R') {
      evt.preventDefault()
      if (multiSelect && selectedCount.value > 0) {
        const angle = evt.shiftKey ? -15 : 15 // Shift+R: 반시계, R: 시계
        multiSelect.rotateSelected(angle)
        updateSelectionState()
      }
    }

    // 크기 확대 (] 키)
    if (evt.key === ']') {
      evt.preventDefault()
      if (multiSelect && selectedCount.value > 0) {
        multiSelect.scaleSelected(1.2)
        updateSelectionState()
      }
    }

    // 크기 축소 ([ 키)
    if (evt.key === '[') {
      evt.preventDefault()
      if (multiSelect && selectedCount.value > 0) {
        multiSelect.scaleSelected(0.8)
        updateSelectionState()
      }
    }
  })
})

onUnmounted(() => {
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

  // 도구들 정리
  if (selectionBoxTool) {
    selectionBoxTool.deactivate()
    selectionBoxTool = null
  }

  toolManager = null
  multiSelect = null
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
