// localStorage 기반 커스텀 사운드 저장 관리

const STORAGE_PREFIX = 'custom_sound_'
const METADATA_PREFIX = 'custom_sound_meta_'
const VALID_KEYS = ['type1', 'type2', 'type3', 'bell', 'winding']

function getStorageKey(key) {
  return STORAGE_PREFIX + key
}

function getMetadataKey(key) {
  return METADATA_PREFIX + key
}

// File/Blob를 base64로 변환하여 localStorage에 저장
export async function saveSoundToStorage(key, file) {
  if (!VALID_KEYS.includes(key)) {
    throw new Error(`Invalid sound key: ${key}. Must be one of: ${VALID_KEYS.join(', ')}`)
  }

  const arrayBuffer = await file.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  let binary = ''
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i])
  }
  const base64 = btoa(binary)

  localStorage.setItem(getStorageKey(key), base64)
  localStorage.setItem(getMetadataKey(key), JSON.stringify({
    filename: file.name || 'unknown',
    size: file.size || arrayBuffer.byteLength,
    dateAdded: new Date().toISOString(),
  }))
}

// localStorage에서 base64를 읽어 ArrayBuffer로 변환
export function loadSoundFromStorage(key) {
  const base64 = localStorage.getItem(getStorageKey(key))
  if (!base64) return null

  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

// 커스텀 사운드 삭제
export function removeSoundFromStorage(key) {
  localStorage.removeItem(getStorageKey(key))
  localStorage.removeItem(getMetadataKey(key))
}

// 저장된 커스텀 사운드 목록 반환
export function getSoundList() {
  const sounds = []
  for (const key of VALID_KEYS) {
    if (localStorage.getItem(getStorageKey(key))) {
      const meta = JSON.parse(localStorage.getItem(getMetadataKey(key)) || '{}')
      sounds.push({ key, ...meta })
    }
  }
  return sounds
}

// 특정 키에 커스텀 사운드가 있는지 확인
export function hasCustomSound(key) {
  return localStorage.getItem(getStorageKey(key)) !== null
}

export { VALID_KEYS }
