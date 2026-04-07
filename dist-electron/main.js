import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
app.name = "Aces";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1100,
    height: 715,
    title: "Aces",
    icon: path.join(process.env.VITE_PUBLIC, "icon.png"),
    frame: false,
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  ipcMain.on("window-minimize", () => win == null ? void 0 : win.minimize());
  ipcMain.on("window-maximize", () => {
    if (win == null ? void 0 : win.isMaximized()) {
      win.unmaximize();
    } else {
      win == null ? void 0 : win.maximize();
    }
  });
  ipcMain.on("window-close", () => win == null ? void 0 : win.close());
  win.webContents.setBackgroundThrottling(true);
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  win.on("closed", () => {
    win = null;
  });
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
