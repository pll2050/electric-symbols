import { dia } from '@joint/plus'
import { LineDrawingTool } from './LineDrawingTool'
import { RectangleDrawingTool } from './RectangleDrawingTool'
import { CircleDrawingTool } from './CircleDrawingTool'
import { TriangleDrawingTool } from './TriangleDrawingTool'

export enum DrawingMode {
  SELECT = 'select',
  LINE = 'line',
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  TRIANGLE = 'triangle'
}

export class ToolManager {
  private paper: dia.Paper
  private graph: dia.Graph
  private currentMode: DrawingMode = DrawingMode.SELECT
  private tools: Map<DrawingMode, any> = new Map()

  constructor(paper: dia.Paper, graph: dia.Graph) {
    this.paper = paper
    this.graph = graph
    this.initializeTools()
  }

  private initializeTools() {
    this.tools.set(DrawingMode.LINE, new LineDrawingTool(this.paper, this.graph))
    this.tools.set(DrawingMode.RECTANGLE, new RectangleDrawingTool(this.paper, this.graph))
    this.tools.set(DrawingMode.CIRCLE, new CircleDrawingTool(this.paper, this.graph))
    this.tools.set(DrawingMode.TRIANGLE, new TriangleDrawingTool(this.paper, this.graph))
  }

  setMode(mode: DrawingMode) {
    // 현재 도구 비활성화
    const currentTool = this.tools.get(this.currentMode)
    if (currentTool && currentTool.deactivate) {
      currentTool.deactivate()
    }

    // 새 도구 활성화
    this.currentMode = mode
    const newTool = this.tools.get(mode)
    if (newTool && newTool.activate) {
      newTool.activate()
    }

    // 커서 변경
    this.updateCursor(mode)
  }

  private updateCursor(mode: DrawingMode) {
    const cursors: Record<DrawingMode, string> = {
      [DrawingMode.SELECT]: 'default',
      [DrawingMode.LINE]: 'crosshair',
      [DrawingMode.RECTANGLE]: 'crosshair',
      [DrawingMode.CIRCLE]: 'crosshair',
      [DrawingMode.TRIANGLE]: 'crosshair'
    }

    const paperEl = this.paper.el as HTMLElement
    paperEl.style.cursor = cursors[mode] || 'default'
  }

  getCurrentMode(): DrawingMode {
    return this.currentMode
  }
}
