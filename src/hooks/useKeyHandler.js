import { useState, useRef, useCallback } from 'react'

const MAX_HISTORY = 15

/**
 * 키보드 이벤트 처리 커스텀 훅
 * 키 입력을 감지하고 타입별 사운드 재생을 트리거한다
 */
export function useKeyHandler(audioActions) {
  const [currentKey, setCurrentKey] = useState('')
  const [keyType, setKeyType] = useState(null)
  const [keyHistory, setKeyHistory] = useState([])
  const keyTimeoutRef = useRef(null)

  // 키 표시 및 히스토리 업데이트
  const showKey = useCallback((key, type) => {
    // 이전 타이머 클리어
    if (keyTimeoutRef.current) {
      clearTimeout(keyTimeoutRef.current)
    }

    // 키 표시 및 타입 설정
    setCurrentKey(key)
    setKeyType(type)

    // 히스토리에 추가 (최대 15개, FIFO)
    setKeyHistory(prev => {
      const entry = { key, type, timestamp: Date.now() }
      const next = [...prev, entry]
      if (next.length > MAX_HISTORY) {
        return next.slice(next.length - MAX_HISTORY)
      }
      return next
    })

    // 1초 후 키 숨기기
    keyTimeoutRef.current = setTimeout(() => {
      setCurrentKey('')
      setKeyType(null)
    }, 1000)
  }, [])

  // 키다운 이벤트 핸들러
  const handleKeyDown = useCallback((event) => {
    // AudioContext 활성화
    audioActions?.resumeContext?.()

    if (event.key === 'Enter') {
      // 엔터키 - 벨음 재생
      audioActions?.playBellSound?.()
      showKey('⏎', 'bell')
    } else if (event.key === ' ') {
      // 스페이스바 - 와인딩 사운드 재생
      event.preventDefault()
      audioActions?.playWindingSound?.()
      showKey('SPACE', 'winding')
    } else if (event.key.length === 1) {
      // 일반 문자 - 타자음 재생
      audioActions?.playTypeSound?.()
      showKey(event.key.toUpperCase(), 'type')
    } else if (event.key === 'Backspace') {
      // 백스페이스 - 타자음 재생
      audioActions?.playTypeSound?.()
      showKey('⌫', 'type')
    }
  }, [audioActions, showKey])

  // 클릭 시 AudioContext 활성화
  const handleClick = useCallback(() => {
    audioActions?.resumeContext?.()
  }, [audioActions])

  return {
    currentKey,
    keyType,
    keyHistory,
    handleKeyDown,
    handleClick,
  }
}
