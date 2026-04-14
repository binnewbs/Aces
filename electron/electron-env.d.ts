/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

interface DataSyncExportResult {
  success: boolean
  canceled?: boolean
  filePath?: string
  error?: string
}

interface DataSyncImportResult {
  success: boolean
  canceled?: boolean
  data?: Record<string, unknown>
  error?: string
}

type PreloadIpcRenderer = Pick<
  import("electron").IpcRenderer,
  "on" | "off" | "send" | "invoke"
> & {
  windowControls: {
    minimize: () => void
    maximize: () => void
    close: () => void
  }
  dataSync: {
    exportData: (jsonString: string) => Promise<DataSyncExportResult>
    importData: () => Promise<DataSyncImportResult>
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: PreloadIpcRenderer
}

