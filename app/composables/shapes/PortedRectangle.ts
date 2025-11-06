import { shapes } from '@joint/plus'

/**
 * PortedRectangle
 * 포트(연결 지점)를 가진 사각형 요소
 * 입력 포트(왼쪽)와 출력 포트(오른쪽)를 지원
 */
export class PortedRectangle extends shapes.standard.Rectangle {
  defaults() {
    return {
      ...super.defaults,
      type: 'PortedRectangle',
      size: { width: 100, height: 60 },
      attrs: {
        body: {
          fill: '#4A90E2',
          stroke: '#2E5C8A',
          strokeWidth: 2,
          rx: 5,
          ry: 5
        },
        label: {
          text: 'Component',
          fill: 'white',
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      ports: {
        groups: {
          'default': {
            position: 'right',
            attrs: {
              portBody: {
                magnet: true, // 양방향 연결 가능
                r: 6,
                fill: '#4A90E2',
                stroke: '#2E5C8A',
                strokeWidth: 2
              }
            },
            markup: [{
              tagName: 'circle',
              selector: 'portBody'
            }]
          }
        },
        items: [
          // 포트 1개
          { group: 'default', id: 'port1' }
        ]
      }
    }
  }
}

/**
 * PortedCircle
 * 포트를 가진 원형 요소
 */
export class PortedCircle extends shapes.standard.Ellipse {
  defaults() {
    return {
      ...super.defaults,
      type: 'PortedCircle',
      size: { width: 80, height: 80 },
      attrs: {
        body: {
          fill: '#10B981',
          stroke: '#059669',
          strokeWidth: 2
        },
        label: {
          text: 'Node',
          fill: 'white',
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      ports: {
        groups: {
          'default': {
            position: 'right',
            attrs: {
              portBody: {
                magnet: true, // 양방향 연결 가능
                r: 6,
                fill: '#10B981',
                stroke: '#059669',
                strokeWidth: 2
              }
            },
            markup: [{
              tagName: 'circle',
              selector: 'portBody'
            }]
          }
        },
        items: [
          // 포트 1개
          { group: 'default', id: 'port1' }
        ]
      }
    }
  }
}
