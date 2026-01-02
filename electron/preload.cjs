// Preload script for security
// 현재는 필요하지 않지만 향후 확장을 위해 준비

const { contextBridge, ipcRenderer } = require('electron')

// 필요시 안전한 API를 여기에 노출
// contextBridge.exposeInMainWorld('electronAPI', {
//   // 예: 파일 시스템 접근, 시스템 정보 등
// })