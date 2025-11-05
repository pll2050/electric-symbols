# Electric Symbols - 벡터 그래픽 에디터

JointJS+를 활용한 전기 회로 심볼 및 벡터 그래픽 제작 도구입니다.

## 🚀 빠른 시작

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

서버가 실행되면 http://localhost:3000 에서 확인할 수 있습니다.

## ✨ 주요 기능

### 1. 기본 그리기 도구
- ✅ **선 도구** - Shift 키로 수평/수직 스냅
- ✅ **사각형 도구** - 드래그하여 사각형 생성
- ✅ **원 도구** - 중심점에서 원 그리기
- ✅ **삼각형 도구** - 삼각형 생성

### 2. 선택 시스템
- ✅ **단일 선택** - 도형 클릭
- ✅ **다중 선택** - Ctrl+클릭으로 추가/제거
- ✅ **영역 선택** - 드래그 박스로 여러 도형 선택
- ✅ **전체 선택** - Ctrl+A

### 3. 편집 기능
- ✅ **이동** - 선택 후 드래그
- ✅ **복사/붙여넣기** - Ctrl+C, Ctrl+V
- ✅ **삭제** - Delete 키
- ✅ **그룹화** - 여러 도형을 하나로 묶기 (📦)
- ✅ **그룹 해제** - 그룹 분리 (📤)

### 4. 캔버스 탐색 (PaperScroller)
- ✅ **패닝** - 마우스 드래그로 캔버스 이동
- ✅ **줌** - 마우스 휠로 확대/축소
- ✅ **그리드** - 10px 메시 그리드

### 5. 내보내기
- ✅ **JSON 내보내기** - 도면을 JSON 형식으로 저장

## 🎮 키보드 단축키

| 단축키 | 기능 |
|--------|------|
| **Shift** | 수평/수직선 그리기 |
| **Ctrl+A** | 전체 선택 |
| **Ctrl+C** | 복사 |
| **Ctrl+V** | 붙여넣기 |
| **Delete** | 선택 삭제 |
| **Escape** | 선택 해제 |
| **Ctrl+클릭** | 다중 선택 토글 |

## 📁 프로젝트 구조

```
electric-symbols/
├── app/
│   ├── components/
│   │   └── VectorEditor.vue          # 메인 에디터 컴포넌트
│   ├── composables/
│   │   └── tools/
│   │       ├── ToolManager.ts         # 도구 관리자
│   │       ├── LineDrawingTool.ts     # 선 그리기 도구
│   │       ├── RectangleDrawingTool.ts # 사각형 도구
│   │       ├── CircleDrawingTool.ts   # 원 도구
│   │       ├── TriangleDrawingTool.ts # 삼각형 도구
│   │       ├── SelectionBoxTool.ts    # 영역 선택 도구
│   │       └── MultiSelectionManager.ts # 다중 선택 및 그룹화
│   └── pages/
│       ├── index.vue                  # 홈페이지
│       └── vector-editor.vue          # 에디터 페이지
├── SYMBOL_CREATION_GUIDE.md          # 상세 가이드
└── README.md
```

## 🛠 기술 스택

- **프레임워크**: Nuxt 4 + Vue 3
- **다이어그램 라이브러리**: JointJS+ (로컬 tarball)
- **스타일링**: Tailwind CSS
- **언어**: TypeScript

## 📖 아키텍처 설명

### 도구 시스템 (Tool System)

각 그리기 도구는 공통 인터페이스를 구현합니다:

```typescript
interface DrawingTool {
  activate(): void    // 도구 활성화
  deactivate(): void  // 도구 비활성화
}
```

**ToolManager**가 도구 전환을 관리하며, 한 번에 하나의 도구만 활성화됩니다.

### 선택 시스템 (Selection System)

**MultiSelectionManager**가 선택 상태를 관리:
- `Set<dia.Element>`로 선택된 요소 추적
- 파란색 Boundary 도구로 선택 시각화
- 키보드 이벤트 처리 (Ctrl+A, Delete, Escape 등)

### 그룹화 시스템 (Grouping System)

JointJS의 **임베딩(Embedding)** 기능 활용:
- 그룹 컨테이너 Element 생성
- `embed()`로 요소들을 그룹에 포함
- `unembed()`로 그룹 해제

### Vue 통합 (Vue Integration)

JointJS 공식 베스트 프랙티스 준수:

1. **Paper 초기화**
   - `frozen: true`, `async: true`로 시작
   - 모든 설정 완료 후 `unfreeze()`

2. **PaperScroller**
   - 캔버스 패닝/줌 기능
   - `autoResizePaper`로 자동 크기 조정

3. **메모리 관리**
   - `onUnmounted`에서 적절한 정리
   - PaperScroller → Paper → Graph 순서

## 🔍 주요 클래스 설명

### SelectionBoxTool
빈 공간 드래그로 영역 선택:
- AABB 충돌 검사로 도형 탐지
- SVG rect로 선택 박스 시각화
- 콜백으로 선택된 요소 전달

### MultiSelectionManager
다중 선택 및 그룹화 관리:
- `selectElement()` - 요소 선택
- `groupSelected()` - 선택된 요소 그룹화
- `ungroupSelected()` - 그룹 해제
- `getSelectedCount()` - 선택 개수 반환

### VectorEditor
메인 에디터 컴포넌트:
- Graph, Paper, PaperScroller 초기화
- 도구 및 선택 관리자 생성
- UI 상태 관리 (selectedCount, hasGroup)
- 키보드 이벤트 처리

## 📚 상세 문서

전체 구현 가이드는 [SYMBOL_CREATION_GUIDE.md](./SYMBOL_CREATION_GUIDE.md)를 참조하세요.

## 🐛 알려진 이슈

### CommonJS 경고
```
Named export 'V' not found. The requested module '@joint/core' is a CommonJS module
```
- JointJS Plus 내부의 CommonJS 호환성 경고
- 애플리케이션 동작에는 영향 없음
- 향후 JointJS Plus 업데이트로 해결 예정

## 🎯 로드맵

- [ ] 실행 취소/다시 실행 (히스토리 스택)
- [ ] 정렬 도구 (좌/우/상/하/중앙)
- [ ] 분산 도구 (수평/수직)
- [ ] 8방향 크기 조절 핸들
- [ ] 회전 도구
- [ ] 속성 패널 (색상, 선 두께, 투명도)
- [ ] 레이어 패널
- [ ] SVG/PNG/PDF 내보내기
- [ ] 심볼 라이브러리 카탈로그
- [ ] 실시간 협업 기능

## 📄 라이선스

이 프로젝트는 전기회로 설계 웹 애플리케이션의 일부입니다.

## 🤝 기여

문제가 발생하거나 개선 사항이 있으면 이슈를 등록해주세요.
