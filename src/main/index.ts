import { app, BrowserWindow, globalShortcut, ipcMain, Menu, shell, Tray } from 'electron'
import { join } from 'path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import path from 'node:path'

const appIcon = path.join(__dirname, '../../resources/icon.icns')
const trayIcon = path.join(__dirname, '../../resources/tray.png')
let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
function createWindow(): void {
  // Create the browser window.

  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    icon: appIcon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  globalShortcut.register('Command+2', () => {
    // 当快捷键被按下时，切换应用窗口的显示状态
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
      }
    }
  })

  mainWindow.on('ready-to-show', () => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    if (mainWindow && !mainWindow.isDestroyed())
      mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    if (mainWindow && !mainWindow.isDestroyed())
      mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  createWindow()

  // 新增：处理获取待办��项的IPC调用
  ipcMain.on('get-todos', () => {
    const fs = require('fs')
    const path = require('path')
    const homeDir = require('os').homedir()
    const filePath = path.join(homeDir, '.todolist')

    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error('读取待办事项失败:', err)
        mainWindow?.webContents.send('send-todos', [])
      } else {
        console.log('@@', JSON.parse(data.toString()))
        mainWindow?.webContents.send('send-todos', JSON.parse(data.toString()))
      }
    })
  })

  // 新增：处理保存待办事项的IPC调用
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ipcMain.on('save-todos', (event, todos) => {
    const fs = require('fs')
    const path = require('path')
    const homeDir = require('os').homedir()
    const filePath = path.join(homeDir, '.todolist')
    fs.writeFileSync(filePath, JSON.stringify(todos))
    console.log('待办事项已保存到', filePath)
  })

  // 创建菜单
  const menu = Menu.buildFromTemplate([
    {
      label: '退出',
      role: 'quit',
      submenu: [
        // {
        //   label: '设置', // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        //   click: () => {
        //     mainWindow?.webContents.send('open-settings')
        //   }
        // },
        {
          role: 'quit',
          label: '退出'
        }
      ]
    }
  ])
  Menu.setApplicationMenu(menu)
  tray = new Tray(trayIcon) //__dirname + '/../../resources/tray.png')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主页', // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      click: function () {
        mainWindow?.show()
      }
    },
    {
      label: '设置', // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      click: () => {
        mainWindow?.webContents.send('open-settings')
      }
    },
    {
      label: '退出', // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      click: function () {
        app.quit()
      }
    }
  ])
  tray.setToolTip('应用标题')
  tray.setContextMenu(contextMenu)

  //不再 mac dock 栏显示
  app.dock.hide()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  app.quit()
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
