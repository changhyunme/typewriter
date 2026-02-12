import { useState, useEffect, useRef, useCallback } from 'react'
import './PerformanceControls.css'

/**
 * 퍼포먼스 컨트롤 바 컴포넌트
 * 볼륨, 풀스크린, 퍼포먼스 모드, 사운드 설정 등을 제어한다
 */
export default function PerformanceControls({
  volume,
  onVolumeChange,
  isPerformanceMode,
  onTogglePerformanceMode,
  onOpenSoundSettings,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const hideTimerRef = useRef(null)

  // 마우스 움직임 감지 - 컨트롤 바 표시/숨기기
  const resetHideTimer = useCallback(() => {
    setIsVisible(true)
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
    }
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false)
    }, 3000)
  }, [])

  useEffect(() => {
    const handleMouseMove = () => resetHideTimer()

    window.addEventListener('mousemove', handleMouseMove)

    // 초기 타이머 시작
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false)
    }, 3000)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }
    }
  }, [resetHideTimer])

  // 풀스크린 상태 동기화
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // 풀스크린 토글
  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch (err) {
      console.error('풀스크린 전환 실패:', err)
    }
  }, [])

  // 볼륨 변경 핸들러
  const handleVolumeChange = useCallback((e) => {
    onVolumeChange(Number(e.target.value) / 100)
  }, [onVolumeChange])

  // 퍼포먼스 모드일 때는 작은 플로팅 버튼만 표시
  if (isPerformanceMode) {
    return (
      <button
        className="performance-exit-button"
        onClick={onTogglePerformanceMode}
        title="퍼포먼스 모드 종료"
      >
        🎭
      </button>
    )
  }

  const volumePercent = Math.round(volume * 100)

  return (
    <div
      className={`performance-controls ${isVisible ? 'visible' : 'hidden'}`}
      onMouseEnter={() => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
        setIsVisible(true)
      }}
      onMouseLeave={() => resetHideTimer()}
    >
      {/* 볼륨 컨트롤 */}
      <div className="control-group volume-control">
        <span className="control-icon">{volume > 0 ? '🔊' : '🔇'}</span>
        <input
          type="range"
          className="volume-slider"
          min="0"
          max="100"
          value={volumePercent}
          onChange={handleVolumeChange}
        />
        <span className="volume-label">{volumePercent}%</span>
      </div>

      {/* 풀스크린 토글 */}
      <button className="control-button" onClick={toggleFullscreen} title="풀스크린">
        {isFullscreen ? '⛶' : '⛶'}
      </button>

      {/* 퍼포먼스 모드 토글 */}
      <button
        className="control-button"
        onClick={onTogglePerformanceMode}
        title="퍼포먼스 모드"
      >
        🎭
      </button>

      {/* 사운드 설정 버튼 */}
      <button
        className="control-button"
        onClick={onOpenSoundSettings}
        title="사운드 설정"
      >
        ⚙
      </button>
    </div>
  )
}
