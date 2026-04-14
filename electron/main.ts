import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
app.name = 'Aces'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { writeFile, readFile } from 'node:fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

ipcMain.on('window-minimize', () => win?.minimize())
ipcMain.on('window-maximize', () => {
  if (win?.isMaximized()) {
    win.unmaximize()
  } else {
    win?.maximize()
  }
})
ipcMain.on('window-close', () => win?.close())

ipcMain.handle('export-data', async (_event, jsonString: string) => {
  try {
    const result = await dialog.showSaveDialog({
      title: 'Export Aces Data',
      defaultPath: `aces-backup-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    })

    if (result.canceled || !result.filePath) {
      return { success: false, canceled: true }
    }

    await writeFile(result.filePath, jsonString, 'utf-8')
    return { success: true, filePath: result.filePath }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('import-data', async () => {
  try {
    const result = await dialog.showOpenDialog({
      title: 'Import Aces Data',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
      properties: ['openFile'],
    })

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, canceled: true }
    }

    const content = await readFile(result.filePaths[0], 'utf-8')
    const data = JSON.parse(content)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

function shouldOpenExternally(url: string) {
  try {
    const parsed = new URL(url)

    if (parsed.protocol === 'file:') return false
    if (VITE_DEV_SERVER_URL) {
      const devOrigin = new URL(VITE_DEV_SERVER_URL).origin
      if (parsed.origin === devOrigin) return false
    }

    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

function createWindow() {
  win = new BrowserWindow({
    width: 1180,
    height: 715,
    title: 'Aces',
    icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
    frame: false,
    show: false,
    backgroundColor: '#171717',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Background throttling helps reduce CPU when the app is minified
  win.webContents.setBackgroundThrottling(true)

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (shouldOpenExternally(url)) {
      void shell.openExternal(url)
    }

    return { action: 'deny' }
  })

  win.webContents.on('will-navigate', (event, url) => {
    if (!shouldOpenExternally(url)) return

    event.preventDefault()
    void shell.openExternal(url)
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  win.once('ready-to-show', () => {
    win?.show()
  })

  win.on('closed', () => {
    win = null
  })
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
