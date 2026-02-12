import { useState, useCallback, useMemo } from 'react'
import { useAudio } from './hooks/useAudio'
import { useKeyHandler } from './hooks/useKeyHandler'
import { hasCustomSound } from './utils/soundStorage'
import KeyDisplay from './components/KeyDisplay'
import SoundSettings from './components/SoundSettings'
import PerformanceControls from './components/PerformanceControls'
import './App.css'

const SOUND_KEYS = ['type1', 'type2', 'type3', 'bell', 'winding']

function App() {
  const {
    isLoaded,
    volume,
    setVolume,
    playTypeSound,
    playBellSound,
    playWindingSound,
    replaceSound,
    resetSound,
    resetAllSounds,
    previewSound,
    resumeAudioContext,
  } = useAudio()

  // 키 핸들러 - 로드 전에는 사운드 재생 안 함
  const audioActions = useMemo(() => {
    if (!isLoaded) return null
    return {
      playTypeSound,
      playBellSound,
      playWindingSound,
      resumeContext: resumeAudioContext,
    }
  }, [isLoaded, playTypeSound, playBellSound, playWindingSound, resumeAudioContext])

  const { currentKey, keyType, keyHistory, handleKeyDown, handleClick } = useKeyHandler(audioActions)

  // UI 상태
  const [isSoundSettingsOpen, setIsSoundSettingsOpen] = useState(false)
  const [isPerformanceMode, setIsPerformanceMode] = useState(false)
  const [soundVersion, setSoundVersion] = useState(0) // 사운드 변경 시 리렌더 트리거

  // 사운드 교체 콜백
  const handleReplaceSound = useCallback(async (key, file) => {
    await replaceSound(key, file)
    setSoundVersion(v => v + 1)
  }, [replaceSound])

  const handleResetSound = useCallback((key) => {
    resetSound(key)
    setSoundVersion(v => v + 1)
  }, [resetSound])

  const handleResetAll = useCallback(() => {
    resetAllSounds()
    setSoundVersion(v => v + 1)
  }, [resetAllSounds])

  // SoundSettings에 전달할 현재 사운드 상태
  const currentSounds = useMemo(() => {
    const sounds = {}
    for (const key of SOUND_KEYS) {
      if (hasCustomSound(key)) {
        const meta = JSON.parse(localStorage.getItem(`custom_sound_meta_${key}`) || '{}')
        sounds[key] = { isCustom: true, fileName: meta.filename || 'unknown' }
      } else {
        sounds[key] = { isCustom: false }
      }
    }
    return sounds
    // soundVersion 변경 시 재계산
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundVersion])

  return (
    <div className="typewriter-container" onClick={handleClick} tabIndex={0} onKeyDown={handleKeyDown}>
      {!isPerformanceMode && (
        <div className="typewriter-header">
          <h1>Performance Typewriter</h1>
          <div className="status">
            {isLoaded ? 'Ready' : 'Loading...'}
          </div>
        </div>
      )}

      <div className="typewriter-paper">
        <KeyDisplay
          currentKey={currentKey}
          keyHistory={keyHistory}
          keyType={keyType}
        />
      </div>

      {!isPerformanceMode && (
        <div className="instructions">
          <div className="key-mappings">
            <div className="key-mapping">
              <span className="key-label">키 입력</span>
              <span className="key-description">타이프라이터 소리</span>
            </div>
            <div className="key-mapping">
              <span className="key-label">Enter</span>
              <span className="key-description">벨</span>
            </div>
            <div className="key-mapping">
              <span className="key-label">Space</span>
              <span className="key-description">와인딩</span>
            </div>
          </div>
        </div>
      )}

      <PerformanceControls
        volume={volume}
        onVolumeChange={setVolume}
        isPerformanceMode={isPerformanceMode}
        onTogglePerformanceMode={() => setIsPerformanceMode(prev => !prev)}
        onOpenSoundSettings={() => setIsSoundSettingsOpen(true)}
      />

      <SoundSettings
        isOpen={isSoundSettingsOpen}
        onClose={() => setIsSoundSettingsOpen(false)}
        onReplaceSound={handleReplaceSound}
        onResetSound={handleResetSound}
        onResetAll={handleResetAll}
        onPreview={previewSound}
        currentSounds={currentSounds}
      />
    </div>
  )
}

export default App
