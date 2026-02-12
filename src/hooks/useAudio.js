import { useState, useEffect, useRef, useCallback } from 'react'
import {
  saveSoundToStorage,
  loadSoundFromStorage,
  removeSoundFromStorage,
  hasCustomSound,
  VALID_KEYS,
} from '../utils/soundStorage'

// 사운드 키 목록
const TYPE_KEYS = ['type1', 'type2', 'type3']

export function useAudio() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [volume, setVolumeState] = useState(1.0)

  const audioContextRef = useRef(null)
  const gainNodeRef = useRef(null)
  const soundBuffersRef = useRef({}) // { type1: AudioBuffer, ... }
  const defaultBuffersRef = useRef({}) // 기본 사운드 백업
  const typeSoundIndexRef = useRef(0)

  // AudioContext 가져오기 (없으면 생성)
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      gainNodeRef.current = audioContextRef.current.createGain()
      gainNodeRef.current.connect(audioContextRef.current.destination)
    }
    return audioContextRef.current
  }, [])

  // ArrayBuffer를 AudioBuffer로 디코딩
  const decodeAudio = useCallback(async (arrayBuffer) => {
    const ctx = getAudioContext()
    return ctx.decodeAudioData(arrayBuffer)
  }, [getAudioContext])

  // 기본 사운드 로드 (fetch)
  const loadDefaultSound = useCallback(async (key, basePath) => {
    const response = await fetch(basePath + key + '.mp3')
    const arrayBuffer = await response.arrayBuffer()
    return decodeAudio(arrayBuffer)
  }, [decodeAudio])

  // localStorage에서 커스텀 사운드 로드
  const loadCustomSound = useCallback(async (key) => {
    const arrayBuffer = loadSoundFromStorage(key)
    if (!arrayBuffer) return null
    return decodeAudio(arrayBuffer)
  }, [decodeAudio])

  // 초기화: 기본 사운드 + 커스텀 사운드 로드
  useEffect(() => {
    const initAudio = async () => {
      try {
        getAudioContext()

        // Electron 환경 감지
        const isElectron = window.navigator.userAgent.includes('Electron')
        const basePath = isElectron ? './sounds/' : '/sounds/'

        console.log('Environment:', isElectron ? 'Electron' : 'Web')
        console.log('Base path:', basePath)

        // 모든 기본 사운드 병렬 로드
        const defaultResults = await Promise.all(
          VALID_KEYS.map(async (key) => {
            const buffer = await loadDefaultSound(key, basePath)
            return { key, buffer }
          })
        )

        // 기본 사운드 저장
        for (const { key, buffer } of defaultResults) {
          defaultBuffersRef.current[key] = buffer
          soundBuffersRef.current[key] = buffer
        }

        // localStorage 커스텀 사운드로 덮어쓰기 (있는 경우)
        await Promise.all(
          VALID_KEYS.map(async (key) => {
            if (hasCustomSound(key)) {
              try {
                const customBuffer = await loadCustomSound(key)
                if (customBuffer) {
                  soundBuffersRef.current[key] = customBuffer
                  console.log(`커스텀 사운드 로드됨: ${key}`)
                }
              } catch (error) {
                console.warn(`커스텀 사운드 로드 실패 (${key}), 기본 사운드 사용:`, error)
              }
            }
          })
        )

        setIsLoaded(true)
        console.log('사운드 파일이 로드되었습니다.')
      } catch (error) {
        console.error('사운드 로드 실패:', error)
        console.error('Error details:', error.message)
        // 사운드 파일이 없어도 프로그램은 동작하도록
        setIsLoaded(true)
      }
    }

    initAudio()
  }, [getAudioContext, loadDefaultSound, loadCustomSound])

  // 사운드 재생 (내부 함수)
  const playBuffer = useCallback((audioBuffer) => {
    const ctx = audioContextRef.current
    if (!ctx || !audioBuffer) {
      console.warn('AudioContext or buffer not available')
      return
    }

    try {
      // AudioContext 상태 확인 및 재개
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const source = ctx.createBufferSource()
      source.buffer = audioBuffer
      source.connect(gainNodeRef.current)
      source.start()
    } catch (error) {
      console.error('사운드 재생 실패:', error)
    }
  }, [])

  // 타자음 재생 (type1 -> type2 -> type3 순회)
  const playTypeSound = useCallback(() => {
    const key = TYPE_KEYS[typeSoundIndexRef.current]
    playBuffer(soundBuffersRef.current[key])
    typeSoundIndexRef.current = (typeSoundIndexRef.current + 1) % 3
  }, [playBuffer])

  // 벨 사운드 재생
  const playBellSound = useCallback(() => {
    playBuffer(soundBuffersRef.current.bell)
  }, [playBuffer])

  // 와인딩 사운드 재생
  const playWindingSound = useCallback(() => {
    playBuffer(soundBuffersRef.current.winding)
  }, [playBuffer])

  // 볼륨 조절 (0.0 ~ 1.0)
  const setVolume = useCallback((value) => {
    const clamped = Math.max(0, Math.min(1, value))
    setVolumeState(clamped)
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = clamped
    }
  }, [])

  // 사운드 교체 (파일 업로드)
  const replaceSound = useCallback(async (key, file) => {
    if (!VALID_KEYS.includes(key)) {
      throw new Error(`Invalid sound key: ${key}`)
    }

    // localStorage에 저장
    await saveSoundToStorage(key, file)

    // AudioBuffer로 디코딩하여 적용
    const arrayBuffer = await file.arrayBuffer()
    const buffer = await decodeAudio(arrayBuffer)
    soundBuffersRef.current[key] = buffer
    console.log(`사운드 교체됨: ${key}`)
  }, [decodeAudio])

  // 기본 사운드로 복원
  const resetSound = useCallback((key) => {
    if (!VALID_KEYS.includes(key)) {
      throw new Error(`Invalid sound key: ${key}`)
    }

    removeSoundFromStorage(key)
    if (defaultBuffersRef.current[key]) {
      soundBuffersRef.current[key] = defaultBuffersRef.current[key]
    }
    console.log(`기본 사운드로 복원: ${key}`)
  }, [])

  // 특정 키의 사운드 미리듣기
  const previewSound = useCallback((key) => {
    playBuffer(soundBuffersRef.current[key])
  }, [playBuffer])

  // 모든 사운드를 기본으로 복원
  const resetAllSounds = useCallback(() => {
    for (const key of VALID_KEYS) {
      removeSoundFromStorage(key)
      if (defaultBuffersRef.current[key]) {
        soundBuffersRef.current[key] = defaultBuffersRef.current[key]
      }
    }
    console.log('모든 사운드 기본으로 복원')
  }, [])

  // AudioContext 활성화 (사용자 제스처 시 호출)
  const resumeAudioContext = useCallback(() => {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
  }, [getAudioContext])

  return {
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
  }
}
