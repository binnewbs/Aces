// All localStorage keys used by the app
const DATA_KEYS = [
  "aces-profile",
  "aces-assignments",
  "aces-cashflow-transactions",
  "aces-cashflow-currency",
  "aces-schedule",
  "aces-notes",
] as const

const SETTINGS_KEYS = [
  "aces-weather-city",
  "aces-ui-theme",
] as const

const SYNC_META_KEY = "aces-last-sync"
const EXPORT_VERSION = 1

export interface AcesExportData {
  version: number
  exportedAt: string
  data: Record<string, string | null>
  settings: Record<string, string | null>
}

export interface ImportSummary {
  assignments: number
  notes: number
  transactions: number
  scheduleClasses: number
  hasProfile: boolean
  hasSettings: boolean
}

function collectAllData(): AcesExportData {
  const data: Record<string, string | null> = {}
  for (const key of DATA_KEYS) {
    data[key] = localStorage.getItem(key)
  }

  const settings: Record<string, string | null> = {}
  for (const key of SETTINGS_KEYS) {
    settings[key] = localStorage.getItem(key)
  }

  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    data,
    settings,
  }
}

function validateExportData(obj: unknown): obj is AcesExportData {
  if (typeof obj !== "object" || obj === null) return false
  const candidate = obj as Record<string, unknown>
  return (
    typeof candidate.version === "number" &&
    typeof candidate.exportedAt === "string" &&
    typeof candidate.data === "object" &&
    candidate.data !== null
  )
}

function countItems(jsonString: string | null | undefined): number {
  if (!jsonString) return 0
  try {
    const parsed = JSON.parse(jsonString)
    return Array.isArray(parsed) ? parsed.length : 0
  } catch {
    return 0
  }
}

function buildImportSummary(exportData: AcesExportData): ImportSummary {
  const d = exportData.data
  return {
    assignments: countItems(d["aces-assignments"]),
    notes: countItems(d["aces-notes"]),
    transactions: countItems(d["aces-cashflow-transactions"]),
    scheduleClasses: countItems(d["aces-schedule"]),
    hasProfile: d["aces-profile"] != null,
    hasSettings: Object.values(exportData.settings ?? {}).some((v) => v != null),
  }
}

function applyImportedData(exportData: AcesExportData): ImportSummary {
  // Write data keys
  for (const [key, value] of Object.entries(exportData.data)) {
    if (value != null) {
      localStorage.setItem(key, value)
    } else {
      localStorage.removeItem(key)
    }
  }

  // Write settings keys
  if (exportData.settings) {
    for (const [key, value] of Object.entries(exportData.settings)) {
      if (value != null) {
        localStorage.setItem(key, value)
      }
    }
  }

  // Record sync timestamp
  localStorage.setItem(
    SYNC_META_KEY,
    JSON.stringify({ type: "import", at: new Date().toISOString() })
  )

  return buildImportSummary(exportData)
}

export async function exportToFile(): Promise<{
  success: boolean
  canceled?: boolean
  filePath?: string
  error?: string
}> {
  const snapshot = collectAllData()
  const jsonString = JSON.stringify(snapshot, null, 2)

  const result = await window.ipcRenderer.dataSync.exportData(jsonString)

  if (result.success) {
    localStorage.setItem(
      SYNC_META_KEY,
      JSON.stringify({ type: "export", at: new Date().toISOString() })
    )
  }

  return result
}

export async function importFromFile(): Promise<{
  success: boolean
  canceled?: boolean
  summary?: ImportSummary
  error?: string
}> {
  const result = await window.ipcRenderer.dataSync.importData()

  if (!result.success) {
    return { success: false, canceled: result.canceled, error: result.error }
  }

  if (!validateExportData(result.data)) {
    return { success: false, error: "Invalid backup file format." }
  }

  const summary = applyImportedData(result.data)
  return { success: true, summary }
}

export function getLastSyncInfo(): { type: string; at: string } | null {
  try {
    const raw = localStorage.getItem(SYNC_META_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}
