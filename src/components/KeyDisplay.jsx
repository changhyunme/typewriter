import { useEffect, useRef } from 'react'
import './KeyDisplay.css'

// 키 타입별 색상 매핑
const TYPE_COLORS = {
  type: '#ffffff',
  bell: '#f59e0b',
  winding: '#3b82f6',
}

const TYPE_LABELS = {
  type: 'TYPE',
  bell: 'BELL',
  winding: 'WINDING',
}

/**
 * 향상된 키 시각화 컴포넌트
 * 현재 키, 히스토리 트레일, 리플 이펙트를 표시한다
 */
export default function KeyDisplay({ currentKey, keyHistory, keyType }) {
  const rippleContainerRef = useRef(null)

  // 키 입력 시 리플 이펙트 생성
  useEffect(() => {
    if (!currentKey || !rippleContainerRef.current) return

    const container = rippleContainerRef.current
    const ripple = document.createElement('div')
    ripple.className = 'key-ripple'

    // 타입별 색상 적용
    const color = TYPE_COLORS[keyType] || TYPE_COLORS.type
    ripple.style.borderColor = color
    ripple.style.boxShadow = `0 0 20px ${color}40`

    container.appendChild(ripple)

    // 애니메이션 종료 후 제거
    const timer = setTimeout(() => {
      if (container.contains(ripple)) {
        container.removeChild(ripple)
      }
    }, 800)

    return () => {
      clearTimeout(timer)
      if (container.contains(ripple)) {
        container.removeChild(ripple)
      }
    }
  }, [currentKey, keyType, keyHistory.length])

  return (
    <div className="key-display">
      {/* 리플 이펙트 컨테이너 */}
      <div className="key-ripple-container" ref={rippleContainerRef} />

      {/* 메인 키 표시 */}
      <div className="key-indicator">
        {currentKey && (
          <div
            className="current-key"
            style={{
              textShadow: `0 0 40px ${(TYPE_COLORS[keyType] || TYPE_COLORS.type)}4D`,
            }}
          >
            {currentKey}
          </div>
        )}
      </div>

      {/* 키 카테고리 표시 */}
      {keyType && (
        <div
          className="key-category"
          style={{ color: TYPE_COLORS[keyType] || TYPE_COLORS.type }}
        >
          {TYPE_LABELS[keyType]}
        </div>
      )}

      {/* 키 히스토리 트레일 */}
      {keyHistory.length > 0 && (
        <div className="key-history">
          {keyHistory.map((entry, index) => {
            // 최신 키일수록 불투명도가 높음
            const opacity = ((index + 1) / keyHistory.length).toFixed(2)
            const color = TYPE_COLORS[entry.type] || TYPE_COLORS.type
            return (
              <span
                key={entry.timestamp + '-' + index}
                className="key-history-item"
                style={{
                  opacity,
                  color,
                  borderColor: `${color}33`,
                }}
              >
                {entry.key}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
