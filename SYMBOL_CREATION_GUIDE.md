# 전기 심볼 제작 가이드

## 📋 개요

<<<<<<< HEAD
JointJS+를 사용하여 SVG 기반의 벡터 그래픽 심볼을 제작하는 범용 가이드입니다.
이 가이드는 다양한 도형과 커스텀 심볼 제작에 적용할 수 있습니다.
=======
JointJS+를 사용하여 전기 회로도용 심볼을 SVG 기반으로 제작하는 범용 가이드입니다.
이 가이드는 릴레이, 접촉기, 스위치, 차단기 등 모든 전기 부품 심볼 제작에 적용할 수 있습니다.
>>>>>>> 992f3a7d17a250422ba2acb5235fc8c66fd0d252

---

## 🎯 심볼 제작 프로세스

```
1. 심볼 설계 → 2. SVG 구조 정의 → 3. Shape 클래스 작성 → 4. 포트 설정 → 5. 동작 메서드 구현
```

---

## 🔧 필수 기능 목록

### 1. Shape 기본 구조

#### 1.1 클래스 정의
```typescript
import { dia, shapes } from '@joint/plus'

export class MySymbolShape extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: 'electrical.MySymbol',
      size: { width: 60, height: 60 },
      attrs: { /* SVG 속성 */ },
      ports: { /* 포트 정의 */ }
    }
  }

  markup = [ /* SVG 요소 배열 */ ]
}
```

#### 1.2 네임스페이스 등록
```typescript
Object.assign(shapes, {
  electrical: {
    ...shapes.electrical,
    MySymbol: MySymbolShape
  }
})
```

---

### 2. SVG 요소 사용법

#### 2.1 사각형 (Rect)
**용도:** 코일, 박스, 외곽선 등

```typescript
// attrs 정의
{
  myRect: {
    x: 10,
    y: 10,
    width: 40,
    height: 30,
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 2,
    rx: 2,  // 모서리 둥글기
    ry: 2
  }
}

// markup 정의
{
  tagName: 'rect',
  selector: 'myRect'
}
```

**주요 속성:**
- `x, y`: 좌상단 좌표
- `width, height`: 크기
- `rx, ry`: 모서리 반경
- `fill`: 채우기 색상
- `stroke`: 테두리 색상
- `strokeWidth`: 테두리 두께

#### 2.2 원 (Circle)
**용도:** 단자, 버튼, 표시등 등

```typescript
// attrs 정의
{
  myCircle: {
    cx: 30,  // 중심 x 좌표
    cy: 30,  // 중심 y 좌표
    r: 5,    // 반지름
    fill: '#000000',
    stroke: '#000000',
    strokeWidth: 1
  }
}

// markup 정의
{
  tagName: 'circle',
  selector: 'myCircle'
}
```

**주요 속성:**
- `cx, cy`: 중심 좌표
- `r`: 반지름
- `fill`: 채우기 색상

#### 2.3 선 (Line/Path)
**용도:** 연결선, 접점, 화살표 등

```typescript
// 직선 (Line)
{
  myLine: {
    x1: 0,
    y1: 20,
    x2: 50,
    y2: 20,
    stroke: '#000000',
    strokeWidth: 2
  }
}

// 복잡한 경로 (Path)
{
  myPath: {
    d: 'M 0 20 L 30 20 L 30 40',  // M=이동, L=직선
    stroke: '#000000',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none'
  }
}
```

**Path 명령어:**
- `M x y`: 시작점 이동 (Move)
- `L x y`: 직선 그리기 (Line)
- `H x`: 수평선
- `V y`: 수직선
- `C x1 y1, x2 y2, x y`: 베지어 곡선
- `Z`: 경로 닫기

**주요 속성:**
- `d`: 경로 데이터
- `strokeLinecap`: 선 끝 모양 (`butt`, `round`, `square`)
- `strokeLinejoin`: 선 연결 모양 (`miter`, `round`, `bevel`)
- `fill`: `none`으로 설정하면 선만 그림

#### 2.4 텍스트 (Text)
**용도:** 레이블, 단자 번호, 전압 표시 등

```typescript
{
  myText: {
    x: 30,
    y: 20,
    text: 'K1',
    fontSize: 14,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    textAnchor: 'middle',        // 수평 정렬: start, middle, end
    textVerticalAnchor: 'middle', // 수직 정렬: top, middle, bottom
    fill: '#000000'
  }
}
```

**주요 속성:**
- `text`: 표시할 텍스트
- `fontSize`: 글자 크기
- `textAnchor`: 수평 정렬
- `textVerticalAnchor`: 수직 정렬 (JointJS 확장)
- `fill`: 글자 색상

#### 2.5 다각형 (Polygon)
**용도:** 화살표, 삼각형, 특수 모양 등

```typescript
{
  myPolygon: {
    points: '10,0 20,20 0,20',  // x1,y1 x2,y2 x3,y3
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 2
  }
}
```

#### 2.6 타원 (Ellipse)
**용도:** 램프, 특수 부품 등

```typescript
{
  myEllipse: {
    cx: 30,
    cy: 30,
    rx: 20,  // x축 반지름
    ry: 10,  // y축 반지름
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 2
  }
}
```

---

### 3. 상대 좌표 시스템 (ref 속성)

#### 3.1 상대 위치 지정
```typescript
{
  centerRect: {
    refX: '50%',     // Shape 너비의 50% 위치
    refY: '50%',     // Shape 높이의 50% 위치
    refWidth: '80%', // Shape 너비의 80%
    refHeight: '60%' // Shape 높이의 60%
  }
}
```

**장점:**
- Shape 크기 변경 시 자동으로 비율 유지
- 반응형 디자인 가능

#### 3.2 활용 예시
```typescript
{
  // 투명 배경 (Shape 크기 정의용)
  body: {
    refWidth: '100%',
    refHeight: '100%',
    fill: 'transparent'
  },
  // 중앙 레이블
  label: {
    refX: '50%',
    refY: '50%',
    textAnchor: 'middle',
    textVerticalAnchor: 'middle'
  },
  // 상단 단자
  topTerminal: {
    refX: '50%',
    y: 0
  },
  // 하단 단자
  bottomTerminal: {
    refX: '50%',
    refY: '100%'
  }
}
```

---

### 4. 포트 시스템

#### 4.1 포트 그룹 정의
```typescript
ports: {
  groups: {
    // 입력 포트 그룹
    'in': {
      position: 'absolute',
      attrs: {
        circle: {
          r: 4,
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 2,
          magnet: true  // 연결 가능
        }
      }
    },
    // 출력 포트 그룹
    'out': {
      position: 'absolute',
      attrs: {
        circle: {
          r: 4,
          fill: '#ff0000',
          stroke: '#000000',
          strokeWidth: 2,
          magnet: true
        }
      }
    }
  }
}
```

#### 4.2 포트 아이템 정의
```typescript
ports: {
  groups: { /* ... */ },
  items: [
    {
      id: 'port1',           // 포트 고유 ID
      group: 'in',           // 그룹 이름
      args: { x: 0, y: 30 }, // 절대 좌표
      label: {
        text: 'L1',
        position: {
          name: 'left',      // 위치: left, right, top, bottom
          args: { x: -10 }   // 오프셋
        }
      }
    },
    {
      id: 'port2',
      group: 'out',
      args: { x: 60, y: 30 }
    }
  ]
}
```

#### 4.3 포트 위치 옵션
```typescript
// 절대 좌표
position: 'absolute'

// 상대 좌표 (Shape 경계 기준)
position: {
  name: 'left',   // left, right, top, bottom
  args: { y: 10 } // 오프셋
}

// 각도 기준
position: {
  name: 'ellipse',
  args: { angle: 45 }
}
```

---

### 5. 동적 속성 변경

#### 5.1 attr() 메서드
```typescript
// 단일 속성 변경
element.attr('myRect/fill', '#ff0000')
element.attr('myText/text', '새 텍스트')

// 여러 속성 변경
element.attr({
  'myRect/fill': '#ff0000',
  'myRect/stroke': '#000000',
  'myText/text': '변경됨'
})
```

#### 5.2 커스텀 메서드 구현
```typescript
export class MySymbolShape extends dia.Element {
  // ... defaults, markup

  /**
   * 활성화 상태 변경
   */
  setActive(active: boolean) {
    if (active) {
      this.attr('body/fill', '#4ade80')
      this.attr('label/fill', '#ffffff')
    } else {
      this.attr('body/fill', '#ffffff')
      this.attr('label/fill', '#000000')
    }
  }

  /**
   * 전압 설정
   */
  setVoltage(voltage: string) {
    this.attr('voltageLabel/text', voltage)
  }

  /**
   * 상태 색상 변경
   */
  setStatus(status: 'normal' | 'warning' | 'error') {
    const colors = {
      normal: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
    this.attr('statusIndicator/fill', colors[status])
  }
}
```

---

### 6. 애니메이션 및 전환 효과

#### 6.1 transition() 메서드
```typescript
// 부드러운 색상 전환
element.transition('attrs/myRect/fill', '#ff0000', {
  duration: 300,
  timingFunction: (t) => t // linear
})

// Path 애니메이션
element.transition('attrs/myPath/d', 'M 0 20 L 50 20', {
  duration: 200,
  timingFunction: (t) => t * t // ease-in
})
```

#### 6.2 타이밍 함수
```typescript
import { util } from '@joint/plus'

// 이징 함수
util.timing.linear
util.timing.quad
util.timing.cubic
util.timing.inout
util.timing.exponential
util.timing.bounce
```

---

### 7. 이벤트 처리

#### 7.1 요소 이벤트
```typescript
// 클릭 이벤트
element.on('change:position', (element, position) => {
  console.log('위치 변경:', position)
})

element.on('change:attrs', (element, attrs) => {
  console.log('속성 변경:', attrs)
})

// Paper 레벨 이벤트
paper.on('element:pointerclick', (elementView) => {
  console.log('요소 클릭:', elementView.model.id)
})

paper.on('element:pointerdblclick', (elementView) => {
  console.log('더블클릭:', elementView.model.id)
})

paper.on('element:pointerdown', (elementView) => {
  console.log('마우스 다운:', elementView.model.id)
})
```

#### 7.2 포트 이벤트
```typescript
paper.on('element:port:add', (elementView, portId) => {
  console.log('포트 추가:', portId)
})

paper.on('link:connect', (linkView) => {
  console.log('연결 완료:', linkView.model.id)
})
```

---

### 8. 데이터 관리

#### 8.1 커스텀 데이터 저장
```typescript
// 데이터 설정
element.set('customData', {
  manufacturer: 'LS Electric',
  model: 'MC-9b',
  voltage: 'AC220V',
  current: '32A'
})

// 데이터 조회
const data = element.get('customData')
console.log(data.voltage) // 'AC220V'
```

#### 8.2 JSON 직렬화
```typescript
// 그래프를 JSON으로 변환
const json = graph.toJSON()

// JSON에서 그래프 복원
graph.fromJSON(json)

// 로컬 스토리지 저장
localStorage.setItem('circuit', JSON.stringify(json))

// 로컬 스토리지 불러오기
const saved = JSON.parse(localStorage.getItem('circuit'))
graph.fromJSON(saved)
```

---

### 9. 그룹 및 계층 구조

#### 9.1 부모-자식 관계
```typescript
// 자식 요소 추가
parent.embed(child)

// 부모 요소 조회
const parent = child.getParentCell()

// 모든 자식 조회
const children = parent.getEmbeddedCells()

// 그룹 이동 시 자식도 함께 이동
parent.position(100, 100) // 자식도 자동으로 이동
```

#### 9.2 Z-Index (레이어 순서)
```typescript
// 맨 앞으로
element.toFront()

// 맨 뒤로
element.toBack()

// Z-Index 직접 설정
element.set('z', 10)
```

---

### 10. 연결선 (Link)

#### 10.1 기본 Link 생성
```typescript
import { shapes } from '@joint/plus'

const link = new shapes.standard.Link({
  source: { id: element1.id, port: 'out1' },
  target: { id: element2.id, port: 'in1' },
  attrs: {
    line: {
      stroke: '#000000',
      strokeWidth: 2
    }
  }
})

graph.addCell(link)
```

#### 10.2 Link 스타일
```typescript
{
  attrs: {
    line: {
      stroke: '#000000',
      strokeWidth: 2,
      strokeDasharray: '5,5',  // 점선
      targetMarker: {          // 화살표
        type: 'path',
        d: 'M 10 -5 0 0 10 5 Z',
        fill: '#000000'
      }
    }
  },
  router: {
    name: 'orthogonal'  // 직각 라우팅
  },
  connector: {
    name: 'rounded'     // 둥근 모서리
  }
}
```

---

## 📝 심볼 제작 체크리스트

### 설계 단계
<<<<<<< HEAD
- [ ] 심볼 구성 요소 분석
- [ ] 포트 위치 결정
- [ ] 크기 및 비율 설계
=======
- [ ] IEC/KEC 표준 확인
- [ ] 심볼 구성 요소 분석 (코일, 접점, 단자 등)
- [ ] 단자 번호 규칙 정의 (A1/A2, 11/12, 21/22 등)
- [ ] 포트 위치 결정
>>>>>>> 992f3a7d17a250422ba2acb5235fc8c66fd0d252

### 구현 단계
- [ ] Shape 클래스 생성
- [ ] SVG 요소 정의 (rect, circle, path, text)
- [ ] attrs 속성 설정
- [ ] markup 배열 작성
- [ ] 포트 그룹 및 아이템 정의
- [ ] 커스텀 메서드 구현

### 테스트 단계
- [ ] 렌더링 확인
- [ ] 포트 연결 테스트
- [ ] 상태 변경 테스트
- [ ] 드래그/이동 테스트
- [ ] JSON 직렬화/역직렬화 테스트

---

## 🎓 실전 예제 템플릿

### 기본 심볼 템플릿
```typescript
import { dia, shapes } from '@joint/plus'

export class SymbolTemplate extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: 'electrical.SymbolTemplate',
      size: { width: 60, height: 60 },
      attrs: {
        // 투명 배경
        body: {
          refWidth: '100%',
          refHeight: '100%',
          fill: 'transparent',
          stroke: 'none'
        },
        // 메인 Shape
        mainShape: {
          refX: '20%',
          refY: '20%',
          refWidth: '60%',
          refHeight: '60%',
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 2
        },
        // 레이블
        label: {
          refX: '50%',
          refY: '50%',
          text: 'SYMBOL',
          fontSize: 12,
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          fill: '#000000'
        }
      },
      ports: {
        groups: {
          'default': {
            position: 'absolute',
            attrs: {
              circle: {
                r: 4,
                fill: '#ffffff',
                stroke: '#000000',
                strokeWidth: 2,
                magnet: true
              }
            }
          }
        },
        items: [
          { id: 'in', group: 'default', args: { x: 0, y: 30 } },
          { id: 'out', group: 'default', args: { x: 60, y: 30 } }
        ]
      }
    }
  }

  markup = [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'rect', selector: 'mainShape' },
    { tagName: 'text', selector: 'label' }
  ]

  setActive(active: boolean) {
    this.attr('mainShape/fill', active ? '#4ade80' : '#ffffff')
  }
}

Object.assign(shapes, {
  electrical: {
    ...shapes.electrical,
    SymbolTemplate: SymbolTemplate
  }
})
```

---

## 📚 참고 자료

- [JointJS+ API 문서](https://resources.jointjs.com/docs/jointjs)
- [SVG 기본 문법](https://developer.mozilla.org/ko/docs/Web/SVG)
- [IEC 60617 전기 심볼 표준](https://en.wikipedia.org/wiki/IEC_60617)

---

<<<<<<< HEAD
## 🎨 벡터 그래픽 에디터 구현

### 개요
사용자가 직접 심볼을 그리고 편집할 수 있는 벡터 그래픽 에디터 기능입니다.
기본 도형(선, 원, 사각형, 삼각형 등)을 그리고, 크기 조절 및 변형이 가능합니다.

---

### 11. 드로잉 도구 (Drawing Tools)

#### 11.1 선 그리기 도구 (연결점 포함)

**구현 방법:**
```typescript
class LineDrawingTool {
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

// 사용 예시
const lineTool = new LineDrawingTool(paper, graph)
lineTool.activate()  // 도구 활성화
// lineTool.deactivate() // 도구 비활성화
```

**주요 기능:**
- 클릭 앤 드래그로 선 그리기
- 실시간 미리보기
- Shift 키로 수평/수직선 그리기
- **선의 양 끝에 연결점 자동 생성** (초록색 원)
- 연결점을 다른 요소의 포트에 연결 가능
- 선의 시작점과 끝점 정보를 `lineData`에 저장

---

#### 11.2 사각형 그리기 도구

```typescript
class RectangleDrawingTool {
  private paper: dia.Paper
  private graph: dia.Graph
  private startPoint: { x: number; y: number } | null = null
  private currentRect: shapes.standard.Rectangle | null = null

  constructor(paper: dia.Paper, graph: dia.Graph) {
    this.paper = paper
    this.graph = graph
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
```

---

#### 11.3 원 그리기 도구

```typescript
class CircleDrawingTool {
  private paper: dia.Paper
  private graph: dia.Graph
  private centerPoint: { x: number; y: number } | null = null
  private currentCircle: shapes.standard.Circle | null = null

  constructor(paper: dia.Paper, graph: dia.Graph) {
    this.paper = paper
    this.graph = graph
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
    this.centerPoint = null
    this.currentCircle = null
  }

  private onPointerDown(evt: dia.Event, x: number, y: number) {
    this.centerPoint = { x, y }

    // 임시 원 생성
    this.currentCircle = new shapes.standard.Circle({
      position: { x: x - 1, y: y - 1 },
      size: { width: 2, height: 2 },
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 2
        }
      }
    })

    this.graph.addCell(this.currentCircle)
  }

  private onPointerMove(evt: dia.Event, x: number, y: number) {
    if (!this.centerPoint || !this.currentCircle) return

    // 중심점에서의 거리로 반지름 계산
    const dx = x - this.centerPoint.x
    const dy = y - this.centerPoint.y
    const radius = Math.sqrt(dx * dx + dy * dy)
    const diameter = radius * 2

    // 원의 위치와 크기 업데이트
    this.currentCircle.position(
      this.centerPoint.x - radius,
      this.centerPoint.y - radius
    )
    this.currentCircle.resize(diameter, diameter)
  }

  private onPointerUp(evt: dia.Event, x: number, y: number) {
    if (!this.centerPoint || !this.currentCircle) return

    // 너무 작으면 삭제
    const size = this.currentCircle.size()
    if (size.width < 5) {
      this.currentCircle.remove()
    }

    this.centerPoint = null
    this.currentCircle = null
  }
}
```

---

#### 11.4 삼각형 그리기 도구

```typescript
class TriangleDrawingTool {
  private paper: dia.Paper
  private graph: dia.Graph
  private startPoint: { x: number; y: number } | null = null
  private currentTriangle: shapes.standard.Polygon | null = null

  constructor(paper: dia.Paper, graph: dia.Graph) {
    this.paper = paper
    this.graph = graph
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
    this.currentTriangle = null
  }

  private onPointerDown(evt: dia.Event, x: number, y: number) {
    this.startPoint = { x, y }

    // 임시 삼각형 생성
    this.currentTriangle = new shapes.standard.Polygon({
      attrs: {
        body: {
          points: `${x},${y} ${x},${y} ${x},${y}`,
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 2
        }
      }
    })

    this.graph.addCell(this.currentTriangle)
  }

  private onPointerMove(evt: dia.Event, x: number, y: number) {
    if (!this.startPoint || !this.currentTriangle) return

    const width = x - this.startPoint.x
    const height = y - this.startPoint.y

    // 정삼각형 포인트 계산
    const topX = this.startPoint.x + width / 2
    const topY = this.startPoint.y
    const leftX = this.startPoint.x
    const leftY = this.startPoint.y + height
    const rightX = x
    const rightY = this.startPoint.y + height

    this.currentTriangle.attr('body/points',
      `${topX},${topY} ${leftX},${leftY} ${rightX},${rightY}`
    )
  }

  private onPointerUp(evt: dia.Event, x: number, y: number) {
    this.startPoint = null
    this.currentTriangle = null
  }
}
```

---

### 12. 도형 변형 도구 (Transform Tools)

#### 12.1 크기 조절 핸들 (Resize Handles)

```typescript
import { elementTools } from '@joint/plus'

class ResizeTool {
  private paper: dia.Paper
  private selectedElement: dia.Element | null = null
  private toolsView: dia.ToolsView | null = null

  constructor(paper: dia.Paper) {
    this.paper = paper
    this.setupEvents()
  }

  private setupEvents() {
    // 요소 선택 시 크기 조절 핸들 표시
    this.paper.on('element:pointerclick', (elementView: dia.ElementView) => {
      this.selectElement(elementView.model as dia.Element)
    })

    // 빈 공간 클릭 시 선택 해제
    this.paper.on('blank:pointerclick', () => {
      this.deselectElement()
    })
  }

  private selectElement(element: dia.Element) {
    // 기존 선택 해제
    this.deselectElement()

    this.selectedElement = element

    // 크기 조절 핸들 생성
    const toolsView = new dia.ToolsView({
      tools: [
        // 8방향 크기 조절 핸들
        new elementTools.Boundary({
          padding: 10,
          useModelGeometry: true
        }),
        new elementTools.ResizeHandle({
          selector: 'body',
          position: 'top-left'
        }),
        new elementTools.ResizeHandle({
          selector: 'body',
          position: 'top'
        }),
        new elementTools.ResizeHandle({
          selector: 'body',
          position: 'top-right'
        }),
        new elementTools.ResizeHandle({
          selector: 'body',
          position: 'right'
        }),
        new elementTools.ResizeHandle({
          selector: 'body',
          position: 'bottom-right'
        }),
        new elementTools.ResizeHandle({
          selector: 'body',
          position: 'bottom'
        }),
        new elementTools.ResizeHandle({
          selector: 'body',
          position: 'bottom-left'
        }),
        new elementTools.ResizeHandle({
          selector: 'body',
          position: 'left'
        }),
        // 삭제 버튼
        new elementTools.Remove({
          x: '100%',
          y: 0,
          offset: { x: 10, y: -10 }
        })
      ]
    })

    const elementView = element.findView(this.paper)
    elementView.addTools(toolsView)

    this.toolsView = toolsView
  }

  private deselectElement() {
    if (this.selectedElement) {
      const elementView = this.selectedElement.findView(this.paper)
      elementView?.removeTools()
      this.selectedElement = null
      this.toolsView = null
    }
  }
}

// 사용 예시
const resizeTool = new ResizeTool(paper)
```

**주요 기능:**
- 8방향 크기 조절 핸들
- 경계선 표시
- 삭제 버튼
- 비율 고정 옵션 (Shift 키)

---

#### 12.2 회전 도구 (Rotation Tool)

```typescript
class RotationTool {
  private paper: dia.Paper
  private selectedElement: dia.Element | null = null
  private isRotating: boolean = false
  private startAngle: number = 0
  private centerPoint: { x: number; y: number } = { x: 0, y: 0 }

  constructor(paper: dia.Paper) {
    this.paper = paper
    this.setupEvents()
  }

  private setupEvents() {
    this.paper.on('element:pointerclick', (elementView: dia.ElementView) => {
      this.selectElement(elementView.model as dia.Element)
    })
  }

  private selectElement(element: dia.Element) {
    this.selectedElement = element

    // 회전 핸들 추가
    const toolsView = new dia.ToolsView({
      tools: [
        new elementTools.Boundary(),
        // 커스텀 회전 핸들 (추후 구현)
        {
          name: 'rotation-handle',
          attributes: {
            // 회전 핸들 SVG
          }
        }
      ]
    })

    const elementView = element.findView(this.paper)
    elementView.addTools(toolsView)
  }

  rotate(element: dia.Element, angle: number) {
    const bbox = element.getBBox()
    const center = bbox.center()

    // 중심점 기준 회전
    element.rotate(angle, false, center)
  }
}
```

---

#### 12.3 이동 도구 (Move Tool)

```typescript
class MoveTool {
  private paper: dia.Paper
  private gridSize: number = 10
  private snapToGrid: boolean = false

  constructor(paper: dia.Paper, options?: { gridSize?: number; snapToGrid?: boolean }) {
    this.paper = paper
    if (options?.gridSize) this.gridSize = options.gridSize
    if (options?.snapToGrid !== undefined) this.snapToGrid = options.snapToGrid

    this.setupEvents()
  }

  private setupEvents() {
    // 그리드 스냅 기능
    if (this.snapToGrid) {
      this.paper.on('element:pointermove', (elementView: dia.ElementView) => {
        const element = elementView.model
        const position = element.position()

        // 그리드에 맞춰 위치 조정
        const snappedX = Math.round(position.x / this.gridSize) * this.gridSize
        const snappedY = Math.round(position.y / this.gridSize) * this.gridSize

        element.position(snappedX, snappedY)
      })
    }

    // 키보드로 정밀 이동
    document.addEventListener('keydown', (evt) => {
      const selectedElements = this.getSelectedElements()
      if (selectedElements.length === 0) return

      const step = evt.shiftKey ? 10 : 1

      selectedElements.forEach(element => {
        const pos = element.position()

        switch(evt.key) {
          case 'ArrowUp':
            element.position(pos.x, pos.y - step)
            evt.preventDefault()
            break
          case 'ArrowDown':
            element.position(pos.x, pos.y + step)
            evt.preventDefault()
            break
          case 'ArrowLeft':
            element.position(pos.x - step, pos.y)
            evt.preventDefault()
            break
          case 'ArrowRight':
            element.position(pos.x + step, pos.y)
            evt.preventDefault()
            break
        }
      })
    })
  }

  private getSelectedElements(): dia.Element[] {
    // Selection 플러그인과 연동 (추후 구현)
    return []
  }

  setSnapToGrid(enabled: boolean) {
    this.snapToGrid = enabled
  }

  setGridSize(size: number) {
    this.gridSize = size
  }
}
```

---

### 12.4 연결점 관리 도구

#### 12.4.1 연결점 표시/숨김 제어

```typescript
class ConnectionPointManager {
  private paper: dia.Paper
  private graph: dia.Graph
  private showConnectionPoints: boolean = true

  constructor(paper: dia.Paper, graph: dia.Graph) {
    this.paper = paper
    this.graph = graph
  }

  /**
   * 연결점 표시/숨김 토글
   */
  toggleConnectionPoints(visible: boolean) {
    this.showConnectionPoints = visible

    const elements = this.graph.getElements()
    elements.forEach(element => {
      // 선 요소의 연결점 표시/숨김
      if (element.get('type') === 'custom.Line') {
        element.attr({
          'startPort/display': visible ? 'block' : 'none',
          'endPort/display': visible ? 'block' : 'none'
        })
      }
    })
  }

  /**
   * 특정 요소의 연결점만 표시
   */
  showElementConnectionPoints(element: dia.Element) {
    if (element.get('type') === 'custom.Line') {
      element.attr({
        'startPort/display': 'block',
        'endPort/display': 'block',
        'startPort/fill': '#22c55e',
        'endPort/fill': '#22c55e'
      })
    }
  }

  /**
   * 특정 요소의 연결점 숨김
   */
  hideElementConnectionPoints(element: dia.Element) {
    if (element.get('type') === 'custom.Line') {
      element.attr({
        'startPort/display': 'none',
        'endPort/display': 'none'
      })
    }
  }

  /**
   * 마우스 호버 시 연결점 강조
   */
  setupHoverEffects() {
    this.paper.on('element:mouseenter', (elementView: dia.ElementView) => {
      const element = elementView.model as dia.Element
      if (element.get('type') === 'custom.Line') {
        this.highlightConnectionPoints(element)
      }
    })

    this.paper.on('element:mouseleave', (elementView: dia.ElementView) => {
      const element = elementView.model as dia.Element
      if (element.get('type') === 'custom.Line') {
        this.unhighlightConnectionPoints(element)
      }
    })
  }

  private highlightConnectionPoints(element: dia.Element) {
    element.attr({
      'startPort/r': 6,
      'startPort/fill': '#22c55e',
      'endPort/r': 6,
      'endPort/fill': '#22c55e'
    })
  }

  private unhighlightConnectionPoints(element: dia.Element) {
    element.attr({
      'startPort/r': 4,
      'startPort/fill': '#4ade80',
      'endPort/r': 4,
      'endPort/fill': '#4ade80'
    })
  }
}

// 사용 예시
const connectionManager = new ConnectionPointManager(paper, graph)
connectionManager.setupHoverEffects()

// 연결점 표시/숨김
connectionManager.toggleConnectionPoints(false) // 모두 숨김
connectionManager.toggleConnectionPoints(true)  // 모두 표시
```

#### 12.4.2 연결점 편집 도구

```typescript
class ConnectionPointEditor {
  private paper: dia.Paper
  private selectedElement: dia.Element | null = null

  constructor(paper: dia.Paper) {
    this.paper = paper
  }

  /**
   * 선의 연결점 위치 수정
   */
  editConnectionPoints(element: dia.Element) {
    if (element.get('type') !== 'custom.Line') return

    this.selectedElement = element

    // 연결점을 드래그 가능하게 만듦
    const elementView = element.findView(this.paper)
    if (!elementView) return

    // 시작점 드래그 핸들
    this.addDraggableHandle(element, 'startPort', 'start')
    // 끝점 드래그 핸들
    this.addDraggableHandle(element, 'endPort', 'end')
  }

  private addDraggableHandle(element: dia.Element, portSelector: string, portId: string) {
    // 드래그 가능한 핸들 추가
    element.attr(`${portSelector}/cursor`, 'move')
    element.attr(`${portSelector}/r`, 6)
    element.attr(`${portSelector}/fill`, '#3b82f6')

    // 드래그 이벤트 처리는 Paper 이벤트로 구현
    // (실제 구현 시 elementTools.Button 등을 활용)
  }

  /**
   * 중간 연결점 추가
   */
  addMiddleConnectionPoint(element: dia.Element, position: { x: number; y: number }) {
    if (element.get('type') !== 'custom.Line') return

    const ports = element.getPorts()
    const newPortId = `middle-${Date.now()}`

    // 새 포트 추가
    element.addPort({
      id: newPortId,
      group: 'connection',
      args: position
    })

    // SVG에 중간 연결점 추가
    element.attr({
      [`middlePort-${newPortId}/cx`]: position.x,
      [`middlePort-${newPortId}/cy`]: position.y,
      [`middlePort-${newPortId}/r`]: 4,
      [`middlePort-${newPortId}/fill`]: '#f59e0b',
      [`middlePort-${newPortId}/stroke`]: '#000000',
      [`middlePort-${newPortId}/strokeWidth`]: 2
    })
  }

  /**
   * 연결점 삭제
   */
  removeConnectionPoint(element: dia.Element, portId: string) {
    // 시작점과 끝점은 삭제 불가
    if (portId === 'start' || portId === 'end') {
      console.warn('시작점과 끝점은 삭제할 수 없습니다.')
      return
    }

    element.removePort(portId)
  }
}

// 사용 예시
const pointEditor = new ConnectionPointEditor(paper)

// 선 요소 클릭 시 연결점 편집 모드 활성화
paper.on('element:pointerclick', (elementView: dia.ElementView) => {
  const element = elementView.model as dia.Element
  if (element.get('type') === 'custom.Line') {
    pointEditor.editConnectionPoints(element)
  }
})
```

**주요 기능:**

1. **연결점 표시/숨김**
   - 모든 연결점 토글
   - 마우스 호버 시 강조 표시
   - 개별 요소 연결점 제어

2. **연결점 편집**
   - 연결점 위치 수정
   - 중간 연결점 추가
   - 연결점 삭제 (시작/끝점 제외)

**참고:** 연결점 간 연결선 생성은 심볼 제작이 아닌 회로도 작성 기능이므로 별도로 구현됩니다.

---

### 13. 도구 관리자 (Tool Manager)

```typescript
enum DrawingMode {
  SELECT = 'select',
  LINE = 'line',
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  TRIANGLE = 'triangle',
  ELLIPSE = 'ellipse',
  POLYGON = 'polygon'
}

class ToolManager {
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
    // ... 다른 도구들
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
    const cursors = {
      [DrawingMode.SELECT]: 'default',
      [DrawingMode.LINE]: 'crosshair',
      [DrawingMode.RECTANGLE]: 'crosshair',
      [DrawingMode.CIRCLE]: 'crosshair',
      [DrawingMode.TRIANGLE]: 'crosshair'
    }

    this.paper.$el.css('cursor', cursors[mode] || 'default')
  }

  getCurrentMode(): DrawingMode {
    return this.currentMode
  }
}

// 사용 예시
const toolManager = new ToolManager(paper, graph)
toolManager.setMode(DrawingMode.RECTANGLE) // 사각형 그리기 모드
toolManager.setMode(DrawingMode.SELECT)    // 선택 모드
```

---

### 14. 속성 편집 패널 (Property Panel)

```typescript
interface ShapeProperties {
  fill: string
  stroke: string
  strokeWidth: number
  opacity: number
  [key: string]: any
}

class PropertyPanel {
  private selectedElement: dia.Element | null = null

  selectElement(element: dia.Element) {
    this.selectedElement = element
    this.loadProperties()
  }

  private loadProperties(): ShapeProperties | null {
    if (!this.selectedElement) return null

    const attrs = this.selectedElement.attr('body')

    return {
      fill: attrs.fill || '#ffffff',
      stroke: attrs.stroke || '#000000',
      strokeWidth: attrs.strokeWidth || 2,
      opacity: attrs.opacity || 1
    }
  }

  updateProperty(key: string, value: any) {
    if (!this.selectedElement) return

    this.selectedElement.attr(`body/${key}`, value)
  }

  updateFill(color: string) {
    this.updateProperty('fill', color)
  }

  updateStroke(color: string) {
    this.updateProperty('stroke', color)
  }

  updateStrokeWidth(width: number) {
    this.updateProperty('strokeWidth', width)
  }

  updateOpacity(opacity: number) {
    this.updateProperty('opacity', opacity)
  }
}
```

---

### 15. 실전 통합 예제

```typescript
// main.ts
import { dia, shapes } from '@joint/plus'

// Paper 및 Graph 설정
const graph = new dia.Graph({}, { cellNamespace: shapes })

const paper = new dia.Paper({
  el: document.getElementById('canvas'),
  model: graph,
  width: 800,
  height: 600,
  gridSize: 10,
  drawGrid: true,
  background: { color: '#f5f5f5' },
  cellViewNamespace: shapes,
  interactive: true
})

// 도구 초기화
const toolManager = new ToolManager(paper, graph)
const resizeTool = new ResizeTool(paper)
const propertyPanel = new PropertyPanel()

// 툴바 버튼 이벤트
document.getElementById('btn-select')?.addEventListener('click', () => {
  toolManager.setMode(DrawingMode.SELECT)
})

document.getElementById('btn-line')?.addEventListener('click', () => {
  toolManager.setMode(DrawingMode.LINE)
})

document.getElementById('btn-rectangle')?.addEventListener('click', () => {
  toolManager.setMode(DrawingMode.RECTANGLE)
})

document.getElementById('btn-circle')?.addEventListener('click', () => {
  toolManager.setMode(DrawingMode.CIRCLE)
})

document.getElementById('btn-triangle')?.addEventListener('click', () => {
  toolManager.setMode(DrawingMode.TRIANGLE)
})

// 속성 패널 이벤트
paper.on('element:pointerclick', (elementView: dia.ElementView) => {
  propertyPanel.selectElement(elementView.model as dia.Element)
})

// 색상 변경
document.getElementById('input-fill')?.addEventListener('change', (evt) => {
  const color = (evt.target as HTMLInputElement).value
  propertyPanel.updateFill(color)
})

document.getElementById('input-stroke')?.addEventListener('change', (evt) => {
  const color = (evt.target as HTMLInputElement).value
  propertyPanel.updateStroke(color)
})

// 선 두께 변경
document.getElementById('input-stroke-width')?.addEventListener('input', (evt) => {
  const width = parseInt((evt.target as HTMLInputElement).value)
  propertyPanel.updateStrokeWidth(width)
})
```

---

### 16. 영역 선택 및 그룹화 (Selection & Grouping)

#### 16.1 드래그 영역 선택 도구 (Selection Box)

```typescript
class SelectionBoxTool {
  private paper: dia.Paper
  private graph: dia.Graph
  private selectionBox: HTMLElement | null = null
  private startPoint: { x: number; y: number } | null = null
  private selectedElements: dia.Element[] = []
  private isActive: boolean = false

  constructor(paper: dia.Paper, graph: dia.Graph) {
    this.paper = paper
    this.graph = graph
    this.createSelectionBox()
  }

  private createSelectionBox() {
    // 선택 영역 박스 생성
    this.selectionBox = document.createElement('div')
    this.selectionBox.style.position = 'absolute'
    this.selectionBox.style.border = '2px dashed #4a90e2'
    this.selectionBox.style.backgroundColor = 'rgba(74, 144, 226, 0.1)'
    this.selectionBox.style.pointerEvents = 'none'
    this.selectionBox.style.display = 'none'
    this.selectionBox.style.zIndex = '1000'

    this.paper.el.appendChild(this.selectionBox)
  }

  activate() {
    this.isActive = true
    this.paper.on('blank:pointerdown', this.onPointerDown.bind(this))
    this.paper.on('blank:pointermove', this.onPointerMove.bind(this))
    this.paper.on('blank:pointerup', this.onPointerUp.bind(this))
  }

  deactivate() {
    this.isActive = false
    this.paper.off('blank:pointerdown')
    this.paper.off('blank:pointermove')
    this.paper.off('blank:pointerup')
    this.clearSelection()
  }

  private onPointerDown(evt: dia.Event, x: number, y: number) {
    if (!this.isActive) return

    this.startPoint = { x, y }

    if (this.selectionBox) {
      this.selectionBox.style.display = 'block'
      this.selectionBox.style.left = `${x}px`
      this.selectionBox.style.top = `${y}px`
      this.selectionBox.style.width = '0px'
      this.selectionBox.style.height = '0px'
    }
  }

  private onPointerMove(evt: dia.Event, x: number, y: number) {
    if (!this.startPoint || !this.selectionBox) return

    // 드래그 영역 계산
    const width = Math.abs(x - this.startPoint.x)
    const height = Math.abs(y - this.startPoint.y)
    const left = Math.min(x, this.startPoint.x)
    const top = Math.min(y, this.startPoint.y)

    // 선택 박스 업데이트
    this.selectionBox.style.left = `${left}px`
    this.selectionBox.style.top = `${top}px`
    this.selectionBox.style.width = `${width}px`
    this.selectionBox.style.height = `${height}px`
  }

  private onPointerUp(evt: dia.Event, x: number, y: number) {
    if (!this.startPoint || !this.selectionBox) return

    // 선택 영역 내의 요소 찾기
    const rect = {
      x: Math.min(x, this.startPoint.x),
      y: Math.min(y, this.startPoint.y),
      width: Math.abs(x - this.startPoint.x),
      height: Math.abs(y - this.startPoint.y)
    }

    this.selectElementsInRect(rect)

    // 선택 박스 숨기기
    this.selectionBox.style.display = 'none'
    this.startPoint = null
  }

  private selectElementsInRect(rect: { x: number; y: number; width: number; height: number }) {
    // 기존 선택 해제
    this.clearSelection()

    // 영역 내 요소 찾기
    const elements = this.graph.getElements()

    elements.forEach(element => {
      const bbox = element.getBBox()

      // 요소가 선택 영역과 겹치는지 확인
      if (this.isIntersecting(bbox, rect)) {
        this.selectedElements.push(element)
        this.highlightElement(element)
      }
    })

    console.log(`${this.selectedElements.length}개 요소 선택됨`)
  }

  private isIntersecting(
    bbox: { x: number; y: number; width: number; height: number },
    rect: { x: number; y: number; width: number; height: number }
  ): boolean {
    return !(
      bbox.x > rect.x + rect.width ||
      bbox.x + bbox.width < rect.x ||
      bbox.y > rect.y + rect.height ||
      bbox.y + bbox.height < rect.y
    )
  }

  private highlightElement(element: dia.Element) {
    // 선택된 요소 강조 표시
    const elementView = element.findView(this.paper)
    if (elementView) {
      elementView.addTools(
        new dia.ToolsView({
          tools: [
            new elementTools.Boundary({
              padding: 5,
              attrs: {
                stroke: '#4a90e2',
                strokeWidth: 2,
                strokeDasharray: '5,5'
              }
            })
          ]
        })
      )
    }
  }

  private clearSelection() {
    this.selectedElements.forEach(element => {
      const elementView = element.findView(this.paper)
      elementView?.removeTools()
    })
    this.selectedElements = []
  }

  getSelectedElements(): dia.Element[] {
    return this.selectedElements
  }
}

// 사용 예시
const selectionTool = new SelectionBoxTool(paper, graph)
selectionTool.activate()
```

---

#### 16.2 그룹화 기능 (Grouping)

```typescript
class GroupManager {
  private paper: dia.Paper
  private graph: dia.Graph
  private groups: Map<string, dia.Element[]> = new Map()

  constructor(paper: dia.Paper, graph: dia.Graph) {
    this.paper = paper
    this.graph = graph
  }

  /**
   * 선택된 요소들을 그룹으로 묶기
   */
  groupElements(elements: dia.Element[]): string {
    if (elements.length < 2) {
      console.warn('그룹화하려면 최소 2개 이상의 요소가 필요합니다.')
      return ''
    }

    const groupId = `group-${Date.now()}`

    // 그룹 컨테이너 생성
    const groupBounds = this.getElementsBounds(elements)
    const groupContainer = new shapes.standard.Rectangle({
      position: { x: groupBounds.x - 10, y: groupBounds.y - 10 },
      size: {
        width: groupBounds.width + 20,
        height: groupBounds.height + 20
      },
      attrs: {
        body: {
          fill: 'transparent',
          stroke: '#4a90e2',
          strokeWidth: 2,
          strokeDasharray: '5,5',
          rx: 5,
          ry: 5
        },
        label: {
          text: 'Group',
          fontSize: 10,
          fill: '#4a90e2',
          textAnchor: 'start',
          refX: 5,
          refY: -15
        }
      }
    })

    groupContainer.set('groupId', groupId)
    groupContainer.set('isGroup', true)
    this.graph.addCell(groupContainer)

    // 요소들을 그룹 컨테이너에 임베드
    elements.forEach(element => {
      groupContainer.embed(element)
      element.set('groupId', groupId)
    })

    // 그룹을 맨 뒤로 보내기 (요소들이 앞에 보이도록)
    groupContainer.toBack()

    this.groups.set(groupId, elements)

    console.log(`그룹 생성됨: ${groupId} (${elements.length}개 요소)`)
    return groupId
  }

  /**
   * 그룹 해제
   */
  ungroupElements(groupId: string) {
    const elements = this.groups.get(groupId)
    if (!elements) {
      console.warn(`그룹을 찾을 수 없습니다: ${groupId}`)
      return
    }

    // 그룹 컨테이너 찾기 및 제거
    const groupContainer = this.graph.getElements().find(
      el => el.get('groupId') === groupId && el.get('isGroup')
    )

    if (groupContainer) {
      // 임베드 해제
      elements.forEach(element => {
        groupContainer.unembed(element)
        element.unset('groupId')
      })

      groupContainer.remove()
    }

    this.groups.delete(groupId)
    console.log(`그룹 해제됨: ${groupId}`)
  }

  /**
   * 요소들의 경계 영역 계산
   */
  private getElementsBounds(elements: dia.Element[]): {
    x: number
    y: number
    width: number
    height: number
  } {
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

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  /**
   * 그룹 이동
   */
  moveGroup(groupId: string, dx: number, dy: number) {
    const elements = this.groups.get(groupId)
    if (!elements) return

    elements.forEach(element => {
      const pos = element.position()
      element.position(pos.x + dx, pos.y + dy)
    })

    // 그룹 컨테이너도 이동
    const groupContainer = this.graph.getElements().find(
      el => el.get('groupId') === groupId && el.get('isGroup')
    )
    if (groupContainer) {
      const pos = groupContainer.position()
      groupContainer.position(pos.x + dx, pos.y + dy)
    }
  }

  /**
   * 그룹 전체 선택
   */
  selectGroup(groupId: string) {
    const elements = this.groups.get(groupId)
    if (!elements) return

    elements.forEach(element => {
      const elementView = element.findView(this.paper)
      if (elementView) {
        elementView.addTools(
          new dia.ToolsView({
            tools: [
              new elementTools.Boundary({
                padding: 5,
                attrs: {
                  stroke: '#4a90e2',
                  strokeWidth: 2
                }
              })
            ]
          })
        )
      }
    })
  }

  /**
   * 모든 그룹 조회
   */
  getAllGroups(): Map<string, dia.Element[]> {
    return this.groups
  }

  /**
   * 요소가 속한 그룹 ID 조회
   */
  getGroupId(element: dia.Element): string | null {
    return element.get('groupId') || null
  }
}

// 사용 예시
const groupManager = new GroupManager(paper, graph)

// 선택된 요소들 그룹화
const selectedElements = selectionTool.getSelectedElements()
const groupId = groupManager.groupElements(selectedElements)

// 그룹 해제
groupManager.ungroupElements(groupId)
```

---

#### 16.3 다중 선택 기능 (Multi-Selection)

```typescript
class MultiSelectionManager {
  private paper: dia.Paper
  private graph: dia.Graph
  private selectedElements: Set<dia.Element> = new Set()
  private isCtrlPressed: boolean = false

  constructor(paper: dia.Paper, graph: dia.Graph) {
    this.paper = paper
    this.graph = graph
    this.setupKeyboardEvents()
    this.setupClickEvents()
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
    this.highlightElement(element)
  }

  deselectElement(element: dia.Element) {
    this.selectedElements.delete(element)
    this.unhighlightElement(element)
  }

  private highlightElement(element: dia.Element) {
    const elementView = element.findView(this.paper)
    if (elementView) {
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

  private unhighlightElement(element: dia.Element) {
    const elementView = element.findView(this.paper)
    elementView?.removeTools()
  }

  clearSelection() {
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
}

// 사용 예시
const multiSelect = new MultiSelectionManager(paper, graph)

// 복사/붙여넣기
const clipboard = multiSelect.copySelected()
if (clipboard) {
  multiSelect.pasteElements(clipboard)
}
```

---

#### 16.4 통합 예제: 선택 및 그룹화

```typescript
// 전체 시스템 통합
const paper = new dia.Paper({
  el: document.getElementById('canvas'),
  model: graph,
  width: 1000,
  height: 800,
  gridSize: 10,
  drawGrid: true,
  background: { color: '#f8f9fa' }
})

// 도구 초기화
const selectionTool = new SelectionBoxTool(paper, graph)
const groupManager = new GroupManager(paper, graph)
const multiSelect = new MultiSelectionManager(paper, graph)

// 선택 모드 활성화
selectionTool.activate()

// 그룹화 버튼
document.getElementById('btn-group')?.addEventListener('click', () => {
  const selected = multiSelect.getSelectedElements()
  if (selected.length > 1) {
    const groupId = groupManager.groupElements(selected)
    console.log('그룹 생성:', groupId)
  } else {
    alert('그룹화하려면 최소 2개 요소를 선택하세요')
  }
})

// 그룹 해제 버튼
document.getElementById('btn-ungroup')?.addEventListener('click', () => {
  const selected = multiSelect.getSelectedElements()
  selected.forEach(element => {
    const groupId = groupManager.getGroupId(element)
    if (groupId) {
      groupManager.ungroupElements(groupId)
    }
  })
})

// 복사 버튼 (Ctrl+C)
document.addEventListener('keydown', (evt) => {
  if ((evt.ctrlKey || evt.metaKey) && evt.key === 'c') {
    evt.preventDefault()
    const clipboard = multiSelect.copySelected()
    // 클립보드 저장 (sessionStorage 활용)
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
    if (clipboardData) {
      const elementsData = JSON.parse(clipboardData)
      const clonedElements = elementsData.map((data: any) => {
        const element = new shapes.standard[data.type]()
        element.set(data)
        return element
      })
      multiSelect.pasteElements(clonedElements)
      console.log('붙여넣기 완료')
    }
  }
})

// 전체 선택 (Ctrl+A)는 MultiSelectionManager에서 자동 처리됨
```

---

**주요 기능:**

1. **드래그 영역 선택 (Selection Box)**
   - 마우스 드래그로 영역 지정
   - 영역 내 모든 요소 자동 선택
   - 시각적 선택 박스 표시

2. **그룹화 (Grouping)**
   - 선택된 요소들을 하나의 그룹으로 묶기
   - 그룹 컨테이너로 시각적 표현
   - 그룹 단위 이동/변형
   - 그룹 해제 기능

3. **다중 선택 (Multi-Selection)**
   - Ctrl/Cmd 클릭으로 개별 요소 추가 선택
   - Ctrl+A로 전체 선택
   - Delete 키로 선택된 요소 삭제
   - 복사/붙여넣기 (Ctrl+C/V)

4. **키보드 단축키**
   - `Ctrl+A`: 전체 선택
   - `Escape`: 선택 해제
   - `Delete`: 삭제
   - `Ctrl+C`: 복사
   - `Ctrl+V`: 붙여넣기
   - `Ctrl+클릭`: 다중 선택

---

## 🎯 벡터 에디터 체크리스트

### 기본 기능
- [x] **선 그리기 도구** (Shift: 수평/수직 스냅)
- [x] **사각형 그리기 도구**
- [x] **원 그리기 도구**
- [x] **삼각형 그리기 도구**
- [ ] 타원 그리기 도구
- [ ] 다각형 그리기 도구

### 선택 및 변형 기능
- [x] **단일 선택** (클릭)
- [x] **다중 선택** (Ctrl+클릭)
- [x] **영역 선택** (드래그 박스)
- [x] **전체 선택** (Ctrl+A)
- [x] **이동** (드래그 앤 드롭)
- [x] **그리드 표시** (10px 메시)
- [x] **선택 해제** (Escape)
- [ ] 8방향 크기 조절
- [ ] 회전 (중심점 기준)
- [ ] 그리드 스냅
- [ ] 비율 고정 (Shift 키)

### 편집 기능
- [x] **복사/붙여넣기** (Ctrl+C/V)
- [x] **삭제** (Delete)
- [x] **그룹화** (2개 이상 선택 시)
- [x] **그룹 해제**
- [x] **전체 삭제** (확인 후)
- [ ] 실행 취소/다시 실행
- [ ] 정렬 (좌/우/상/하/중앙)
- [ ] 분산 (수평/수직)

### 속성 편집
- [ ] 채우기 색상
- [ ] 테두리 색상
- [ ] 선 두께
- [ ] 투명도
- [ ] 그림자 효과
- [ ] 그라데이션

### 레이어 관리
- [ ] Z-Index 조정
- [ ] 레이어 보이기/숨기기
- [ ] 레이어 잠금

---

## 📦 구현된 고급 기능

### 1. 영역 선택 도구 (SelectionBoxTool)

**파일:** `app/composables/tools/SelectionBoxTool.ts`

**기능:**
- 빈 공간을 드래그하여 파란색 점선 박스로 영역 표시
- 영역 내의 모든 도형 자동 선택 (AABB 충돌 검사 방식)
- 일부라도 겹치면 선택됨

**구현 내용:**
```typescript
// 영역 선택 박스 생성
private createSelectionBox(x: number, y: number) {
  // SVG rect 요소 생성
  // fill: 'rgba(33, 150, 243, 0.1)' - 반투명 파란색
  // stroke: '#2196F3' - 파란색 테두리
  // stroke-dasharray: '5,5' - 점선 스타일
}

// AABB 충돌 검사로 영역 내 도형 찾기
private getElementsInArea(start, end): dia.Element[] {
  // 두 사각형 겹침 검사
  const intersects = !(
    bbox.x + bbox.width < selectionX ||
    bbox.x > selectionX + selectionWidth ||
    bbox.y + bbox.height < selectionY ||
    bbox.y > selectionY + selectionHeight
  )
}
```

### 2. 그룹화 시스템 (MultiSelectionManager)

**파일:** `app/composables/tools/MultiSelectionManager.ts`

**기능:**
- 2개 이상 선택된 도형을 하나의 그룹으로 묶기
- 그룹은 점선 테두리와 라벨로 표시
- 그룹 이동 시 내부 도형도 함께 이동
- 그룹 해제로 다시 개별 도형으로 분리

**구현 내용:**
```typescript
// 그룹 생성
groupSelected(): dia.Element | null {
  // 1. 모든 요소의 경계 계산
  // 2. 그룹 컨테이너 Element 생성
  const groupElement = new dia.Element({
    attrs: {
      body: {
        fill: 'transparent',
        stroke: '#9e9e9e',
        strokeDasharray: '5,5'
      },
      label: {
        text: `그룹 (${elements.length}개)`
      }
    }
  })

  // 3. 요소들을 임베딩
  elements.forEach(element => {
    groupElement.embed(element)
  })
}

// 그룹 해제
ungroupSelected(): boolean {
  // 임베딩된 요소 해제
  element.getEmbeddedCells().forEach(cell => {
    element.unembed(cell)
  })
  element.remove() // 그룹 컨테이너 삭제
}
```

### 3. JointJS Vue 통합 최적화

**파일:** `app/components/VectorEditor.vue`

**JointJS 공식 베스트 프랙티스 적용:**

```typescript
onMounted(() => {
  // 1. Graph 생성 (cellNamespace 지정)
  graph = new dia.Graph({}, { cellNamespace: shapes })

  // 2. Paper 생성 (frozen, async 설정)
  paper = new dia.Paper({
    model: graph,
    frozen: true,   // 초기화 시 렌더링 중지
    async: true     // 비동기 렌더링
  })

  // 3. PaperScroller 생성
  scroller = new ui.PaperScroller({
    paper,
    autoResizePaper: true,  // 자동 크기 조정
    cursor: 'grab',         // UX 개선
    padding: 50
  })

  // 4. DOM에 추가 및 렌더링
  canvasRef.value.appendChild(scroller.el)
  scroller.render().center()

  // 5. Paper 활성화
  paper.unfreeze()
})
```

**개선 효과:**
- ✅ 마우스 드래그로 캔버스 이동 (PaperScroller)
- ✅ 마우스 휠로 줌 인/아웃
- ✅ 초기 렌더링 성능 향상 (frozen/async)
- ✅ 메모리 누수 방지 (적절한 정리)

### 4. 상태 관리 시스템

**실시간 UI 업데이트:**
```typescript
const selectedCount = ref(0)
const hasGroup = ref(false)

const updateSelectionState = () => {
  selectedCount.value = multiSelect.getSelectedCount()
  hasGroup.value = multiSelect.hasGroupSelected()
}

// 선택 변경 시 자동 업데이트
paper.on('element:pointerclick', () => {
  setTimeout(updateSelectionState, 0)
})
```

**UI 반영:**
- 하단에 선택된 도형 개수 표시
- 그룹화 버튼 활성화/비활성화 (2개 이상 선택 시)
- 그룹 해제 버튼 활성화/비활성화 (그룹 선택 시)

---

## 🎨 사용자 가이드

### 기본 사용법

1. **도형 그리기**
   - 툴바에서 도구 선택 (선, 사각형, 원, 삼각형)
   - 캔버스에서 드래그하여 도형 생성
   - Shift 키: 수평/수직선 (선 도구)

2. **도형 선택**
   - **단일 선택**: 도형 클릭
   - **다중 선택**: Ctrl+클릭으로 추가 선택
   - **영역 선택**: 빈 공간 드래그하여 박스 선택
   - **전체 선택**: Ctrl+A

3. **도형 편집**
   - **이동**: 선택 후 드래그
   - **복사**: Ctrl+C → Ctrl+V
   - **삭제**: Delete 키 또는 🗑️ 버튼
   - **그룹화**: 2개 이상 선택 후 📦 버튼
   - **그룹 해제**: 그룹 선택 후 📤 버튼

4. **캔버스 탐색** (PaperScroller)
   - **이동**: 마우스 드래그
   - **줌**: 마우스 휠

5. **내보내기**
   - 💾 버튼으로 JSON 형식 내보내기

### 키보드 단축키

| 단축키 | 기능 |
|--------|------|
| Shift | 수평/수직선 그리기 |
| Ctrl+A | 전체 선택 |
| Ctrl+C | 복사 |
| Ctrl+V | 붙여넣기 |
| Delete | 선택 삭제 |
| Escape | 선택 해제 |
| Ctrl+클릭 | 다중 선택 토글 |

---

## 🚀 다음 단계

1. **벡터 에디터 UI 구현**: 속성 패널, 레이어 패널
2. **고급 편집 기능**:
   - 실행 취소/다시 실행 (히스토리 스택)
   - 정렬 도구 (좌/우/상/하/중앙)
   - 분산 도구 (수평/수직 균등 분산)
   - 8방향 크기 조절 핸들
   - 회전 도구
3. **속성 편집**:
   - 색상 선택기 (채우기/테두리)
   - 선 두께 조절
   - 투명도 슬라이더
4. **심볼 라이브러리 구축**: 카탈로그 시스템
5. **내보내기 기능**: SVG, PNG, PDF 내보내기
6. **협업 기능**: 실시간 공동 편집
7. **플러그인 시스템**: 확장 가능한 아키텍처
=======
## 🚀 다음 단계

1. **릴레이 심볼 구현**: 코일 + a접점 + b접점
2. **접촉기 심볼 구현**: 주접점 + 보조접점
3. **차단기 심볼 구현**: NFB, MCCB, ACB
4. **스위치 심볼 구현**: 푸시버튼, 셀렉터 스위치
5. **심볼 라이브러리 구축**: 카탈로그 시스템
>>>>>>> 992f3a7d17a250422ba2acb5235fc8c66fd0d252
