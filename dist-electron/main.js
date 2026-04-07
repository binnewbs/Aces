import { app as i, BrowserWindow as t, ipcMain as n } from "electron";
import { fileURLToPath as a } from "node:url";
import o from "node:path";
i.name = "Aces";
const r = o.dirname(a(import.meta.url));
process.env.APP_ROOT = o.join(r, "..");
const s = process.env.VITE_DEV_SERVER_URL, R = o.join(process.env.APP_ROOT, "dist-electron"), l = o.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = s ? o.join(process.env.APP_ROOT, "public") : l;
let e;
function c() {
  e = new t({
    width: 1100,
    height: 715,
    title: "Aces",
    icon: o.join(process.env.VITE_PUBLIC, "icon.png"),
    frame: !1,
    webPreferences: {
      preload: o.join(r, "preload.mjs")
    }
  }), n.on("window-minimize", () => e == null ? void 0 : e.minimize()), n.on("window-maximize", () => {
    e != null && e.isMaximized() ? e.unmaximize() : e == null || e.maximize();
  }), n.on("window-close", () => e == null ? void 0 : e.close()), e.webContents.setBackgroundThrottling(!0), s ? e.loadURL(s) : e.loadFile(o.join(l, "index.html")), e.on("closed", () => {
    e = null;
  });
}
i.on("window-all-closed", () => {
  process.platform !== "darwin" && (i.quit(), e = null);
});
i.on("activate", () => {
  t.getAllWindows().length === 0 && c();
});
i.whenReady().then(c);
export {
  R as MAIN_DIST,
  l as RENDERER_DIST,
  s as VITE_DEV_SERVER_URL
};
