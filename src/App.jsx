import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [currentKey, setCurrentKey] = useState('') // 현재 입력된 키 표시
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentTypeSound, setCurrentTypeSound] = useState(0) // 0: type1, 1: type2, 2: type3
  const audioContextRef = useRef(null)
  const type1SoundRef = useRef(null)
  const type2SoundRef = useRef(null)
  const type3SoundRef = useRef(null)
  const bellSoundRef = useRef(null)
  const windingSoundRef = useRef(null)
  const keyTimeoutRef = useRef(null)

  // Web Audio API 초기화 및 사운드 로드
  useEffect(() => {
    const initAudio = async () => {
      try {
        // AudioContext 생성
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
        
        // Electron 환경 감지
        const isElectron = window.navigator.userAgent.includes('Electron')
        const basePath = isElectron ? './sounds/' : '/sounds/'
        
        console.log('Environment:', isElectron ? 'Electron' : 'Web')
        console.log('Base path:', basePath)
        
        // type1 사운드 로드
        const type1Response = await fetch(basePath + 'type1.mp3')
        const type1ArrayBuffer = await type1Response.arrayBuffer()
        type1SoundRef.current = await audioContextRef.current.decodeAudioData(type1ArrayBuffer)
        
        // type2 사운드 로드
        const type2Response = await fetch(basePath + 'type2.mp3')
        const type2ArrayBuffer = await type2Response.arrayBuffer()
        type2SoundRef.current = await audioContextRef.current.decodeAudioData(type2ArrayBuffer)
        
        // type3 사운드 로드
        const type3Response = await fetch(basePath + 'type3.mp3')
        const type3ArrayBuffer = await type3Response.arrayBuffer()
        type3SoundRef.current = await audioContextRef.current.decodeAudioData(type3ArrayBuffer)
        
        // 벨음 로드
        const bellResponse = await fetch(basePath + 'bell.mp3')
        const bellArrayBuffer = await bellResponse.arrayBuffer()
        bellSoundRef.current = await audioContextRef.current.decodeAudioData(bellArrayBuffer)
        
        // winding 사운드 로드
        const windingResponse = await fetch(basePath + 'winding.mp3')
        const windingArrayBuffer = await windingResponse.arrayBuffer()
        windingSoundRef.current = await audioContextRef.current.decodeAudioData(windingArrayBuffer)
        
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
  }, [])

  // 사운드 재생 함수
  const playSound = (audioBuffer) => {
    if (!audioContextRef.current || !audioBuffer) {
      console.warn('AudioContext or buffer not available')
      return
    }
    
    try {
      // AudioContext 상태 확인 및 재개
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume()
      }
      
      const source = audioContextRef.current.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContextRef.current.destination)
      source.start()
      console.log('Sound played successfully')
    } catch (error) {
      console.error('사운드 재생 실패:', error)
    }
  }

  // 타자음 재생 함수 (type1, type2, type3 순회)
  const playTypeSound = () => {
    let soundBuffer
    if (currentTypeSound === 0) {
      soundBuffer = type1SoundRef.current
    } else if (currentTypeSound === 1) {
      soundBuffer = type2SoundRef.current
    } else {
      soundBuffer = type3SoundRef.current
    }
    
    playSound(soundBuffer)
    setCurrentTypeSound(prev => (prev + 1) % 3) // 0 -> 1 -> 2 -> 0 순회
  }

  // 키 표시 함수
  const showKey = (key) => {
    // 이전 타이머 클리어
    if (keyTimeoutRef.current) {
      clearTimeout(keyTimeoutRef.current)
    }
    
    // 키 표시
    setCurrentKey(key)
    
    // 1초 후 키 숨기기
    keyTimeoutRef.current = setTimeout(() => {
      setCurrentKey('')
    }, 1000)
  }

  // 키 입력 처리
  const handleKeyPress = (event) => {
    // AudioContext 초기화 및 활성화
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    
    // AudioContext가 suspended 상태면 resume
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume()
    }

    if (!isLoaded) return

    if (event.key === 'Enter') {
      // 엔터키 - 벨음 재생 및 키 표시
      playSound(bellSoundRef.current)
      showKey('⏎')
    } else if (event.key === ' ') {
      // 스페이스바 - winding 사운드 재생 및 키 표시
      playSound(windingSoundRef.current)
      showKey('SPACE')
    } else if (event.key.length === 1) {
      // 일반 문자 - 타자음 재생 및 키 표시
      playTypeSound()
      showKey(event.key.toUpperCase())
    } else if (event.key === 'Backspace') {
      // 백스페이스 - 타자음 재생 및 키 표시
      playTypeSound()
      showKey('⌫')
    }
  }

  // 화면 클릭 시 포커스 및 AudioContext 활성화
  const handleClick = () => {
    // AudioContext 초기화 및 활성화
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume()
    }
  }

  return (
    <div className="typewriter-container" onClick={handleClick} tabIndex={0} onKeyDown={handleKeyPress}>
      <div className="typewriter-header">
        <h1>Performance Typewriter</h1>
        <div className="status">
          {isLoaded ? 'Ready' : 'Loading...'}
        </div>
      </div>
      
      <div className="typewriter-paper">
        <div className="key-indicator">
          {currentKey && <div className="current-key">{currentKey}</div>}
        </div>
      </div>
      
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
    </div>
  )
}

export default App