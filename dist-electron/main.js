import { app, ipcMain, BrowserWindow, shell } from "electron";
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
ipcMain.on("window-minimize", () => win == null ? void 0 : win.minimize());
ipcMain.on("window-maximize", () => {
  if (win == null ? void 0 : win.isMaximized()) {
    win.unmaximize();
  } else {
    win == null ? void 0 : win.maximize();
  }
});
ipcMain.on("window-close", () => win == null ? void 0 : win.close());
function shouldOpenExternally(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "file:") return false;
    if (VITE_DEV_SERVER_URL) {
      const devOrigin = new URL(VITE_DEV_SERVER_URL).origin;
      if (parsed.origin === devOrigin) return false;
    }
    return ["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}
function createWindow() {
  win = new BrowserWindow({
    width: 1180,
    height: 715,
    title: "Aces",
    icon: path.join(process.env.VITE_PUBLIC, "icon.png"),
    frame: false,
    show: false,
    backgroundColor: "#171717",
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.setBackgroundThrottling(true);
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (shouldOpenExternally(url)) {
      void shell.openExternal(url);
    }
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (event, url) => {
    if (!shouldOpenExternally(url)) return;
    event.preventDefault();
    void shell.openExternal(url);
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  win.once("ready-to-show", () => {
    win == null ? void 0 : win.show();
  });
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
