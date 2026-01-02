const { app, BrowserWindow, Menu, protocol } = require('electron')
const path = require('path')
const fs = require('fs')

// 개발 모드 감지: dist 폴더가 없으면 개발 모드
const isDev = !fs.existsSync(path.join(__dirname, '../dist'))

let mainWindow

function createWindow() {
  // 메인 윈도우 생성
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false, // 로컬 파일 접근을 위해 비활성화
      allowRunningInsecureContent: true
    },
    titleBarStyle: 'hiddenInset', // macOS에서 더 나은 타이틀바
    show: false // 준비될 때까지 숨김
  })

  // 개발 모드에서는 localhost, 프로덕션에서는 빌드된 파일 로드
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`
  
  mainWindow.loadURL(startUrl)

  // 윈도우가 준비되면 표시
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    
    // 개발 모드에서는 DevTools 열기
    if (isDev) {
      mainWindow.webContents.openDevTools()
    }
  })

  // 윈도우가 닫히면 참조 제거
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 메뉴 설정
  createMenu()
}

function createMenu() {
  const template = [
    {
      label: 'Performance Typewriter',
      submenu: [
        {
          label: 'About Performance Typewriter',
          role: 'about'
        },
        { type: 'separator' },
        {
          label: 'Hide Performance Typewriter',
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ]

  // Windows/Linux용 메뉴 조정
  if (process.platform !== 'darwin') {
    template[0].submenu = [
      {
        label: 'About',
        click: () => {
          // About 다이얼로그 표시
        }
      },
      { type: 'separator' },
      {
        label: 'Exit',
        accelerator: 'Ctrl+Q',
        click: () => {
          app.quit()
        }
      }
    ]
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// 앱이 준비되면 윈도우 생성
app.whenReady().then(() => {
  // 프로덕션 모드에서 정적 파일 서빙을 위한 프로토콜 등록
  if (!isDev) {
    protocol.registerFileProtocol('file', (request, callback) => {
      const pathname = decodeURI(request.url.replace('file:///', ''))
      callback(pathname)
    })
  }
  
  createWindow()
})

// 모든 윈도우가 닫히면 앱 종료 (macOS 제외)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// macOS에서 독 아이콘 클릭시 윈도우 재생성
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// 보안: 새 윈도우 생성 방지
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationURL) => {
    event.preventDefault()
  })
})