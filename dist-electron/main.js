import { app as n, ipcMain as s, BrowserWindow as t } from "electron";
import { fileURLToPath as a } from "node:url";
import o from "node:path";
n.name = "Aces";
const r = o.dirname(a(import.meta.url));
process.env.APP_ROOT = o.join(r, "..");
const i = process.env.VITE_DEV_SERVER_URL, R = o.join(process.env.APP_ROOT, "dist-electron"), l = o.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = i ? o.join(process.env.APP_ROOT, "public") : l;
let e;
s.on("window-minimize", () => e == null ? void 0 : e.minimize());
s.on("window-maximize", () => {
  e != null && e.isMaximized() ? e.unmaximize() : e == null || e.maximize();
});
s.on("window-close", () => e == null ? void 0 : e.close());
function c() {
  e = new t({
    width: 1100,
    height: 715,
    title: "Aces",
    icon: o.join(process.env.VITE_PUBLIC, "icon.png"),
    frame: !1,
    show: !1,
    backgroundColor: "#171717",
    webPreferences: {
      preload: o.join(r, "preload.mjs")
    }
  }), e.webContents.setBackgroundThrottling(!0), i ? e.loadURL(i) : e.loadFile(o.join(l, "index.html")), e.once("ready-to-show", () => {
    e == null || e.show();
  }), e.on("closed", () => {
    e = null;
  });
}
n.on("window-all-closed", () => {
  process.platform !== "darwin" && (n.quit(), e = null);
});
n.on("activate", () => {
  t.getAllWindows().length === 0 && c();
});
n.whenReady().then(c);
export {
  R as MAIN_DIST,
  l as RENDERER_DIST,
  i as VITE_DEV_SERVER_URL
};
