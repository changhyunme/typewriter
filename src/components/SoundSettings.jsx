import { useRef } from 'react'
import './SoundSettings.css'

// 사운드 슬롯 정의
const SOUND_SLOTS = [
  { key: 'type1', label: '타자음 1', description: 'Type 1' },
  { key: 'type2', label: '타자음 2', description: 'Type 2' },
  { key: 'type3', label: '타자음 3', description: 'Type 3' },
  { key: 'bell', label: '벨', description: 'Enter 키' },
  { key: 'winding', label: '와인딩', description: 'Space 키' },
]

function SoundSettings({ isOpen, onClose, onReplaceSound, onResetSound, onResetAll, onPreview, currentSounds }) {
  const fileInputRefs = useRef({})

  // 파일 선택 다이얼로그 열기
  const handleReplaceClick = (key) => {
    fileInputRefs.current[key]?.click()
  }

  // 파일 선택 완료 처리
  const handleFileChange = (key, event) => {
    const file = event.target.files?.[0]
    if (file) {
      onReplaceSound(key, file)
    }
    // 같은 파일을 다시 선택할 수 있도록 값 초기화
    event.target.value = ''
  }

  // 오버레이 클릭 시 패널 닫기
  const handleOverlayClick = () => {
    onClose()
  }

  // 패널 내부 클릭 시 이벤트 전파 중단
  const handlePanelClick = (e) => {
    e.stopPropagation()
  }

  // 사운드가 커스텀인지 확인
  const isCustom = (key) => {
    return currentSounds?.[key]?.isCustom ?? false
  }

  // 커스텀 파일명 가져오기
  const getFileName = (key) => {
    return currentSounds?.[key]?.fileName ?? null
  }

  return (
    <>
      {/* 오버레이 배경 */}
      <div
        className={`sound-settings-overlay ${isOpen ? 'open' : ''}`}
        onClick={handleOverlayClick}
      />

      {/* 슬라이드 패널 */}
      <div
        className={`sound-settings-panel ${isOpen ? 'open' : ''}`}
        onClick={handlePanelClick}
      >
        {/* 헤더 */}
        <div className="sound-settings-header">
          <h2>사운드 설정</h2>
          <button className="sound-settings-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        {/* 사운드 슬롯 목록 */}
        <div className="sound-settings-list">
          {SOUND_SLOTS.map((slot) => {
            const custom = isCustom(slot.key)
            const fileName = getFileName(slot.key)

            return (
              <div className="sound-card" key={slot.key}>
                <div className="sound-card-header">
                  <div className="sound-card-info">
                    <span className={`sound-card-indicator ${custom ? 'custom' : 'default'}`} />
                    <span className="sound-card-name">{slot.label}</span>
                  </div>
                  <span className={`sound-card-badge ${custom ? 'custom' : 'default'}`}>
                    {custom ? '커스텀' : '기본'}
                  </span>
                </div>

                {/* 커스텀 사운드 파일명 표시 */}
                {custom && fileName && (
                  <div className="sound-card-filename">{fileName}</div>
                )}

                {/* 액션 버튼 */}
                <div className="sound-card-actions">
                  <button
                    className="sound-btn"
                    onClick={() => handleReplaceClick(slot.key)}
                  >
                    교체
                  </button>
                  <button
                    className="sound-btn"
                    onClick={() => onPreview?.(slot.key)}
                  >
                    미리듣기
                  </button>
                  {custom && (
                    <button
                      className="sound-btn reset"
                      onClick={() => onResetSound(slot.key)}
                    >
                      초기화
                    </button>
                  )}
                </div>

                {/* 숨겨진 파일 인풋 */}
                <input
                  ref={(el) => { fileInputRefs.current[slot.key] = el }}
                  className="sound-file-input"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileChange(slot.key, e)}
                />
              </div>
            )
          })}
        </div>

        {/* 하단 전체 초기화 버튼 */}
        <div className="sound-settings-footer">
          <button className="sound-btn-reset-all" onClick={onResetAll}>
            모두 초기화
          </button>
        </div>
      </div>
    </>
  )
}

export default SoundSettings
