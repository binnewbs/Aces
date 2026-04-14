import { app as s, ipcMain as a, dialog as d, BrowserWindow as f, shell as l } from "electron";
import { fileURLToPath as h } from "node:url";
import r from "node:path";
import { writeFile as w, readFile as P } from "node:fs/promises";
s.name = "Aces";
const p = r.dirname(h(import.meta.url));
process.env.APP_ROOT = r.join(p, "..");
const i = process.env.VITE_DEV_SERVER_URL, O = r.join(process.env.APP_ROOT, "dist-electron"), u = r.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = i ? r.join(process.env.APP_ROOT, "public") : u;
let e;
a.on("window-minimize", () => e == null ? void 0 : e.minimize());
a.on("window-maximize", () => {
  e != null && e.isMaximized() ? e.unmaximize() : e == null || e.maximize();
});
a.on("window-close", () => e == null ? void 0 : e.close());
a.handle("export-data", async (t, n) => {
  try {
    const o = await d.showSaveDialog({
      title: "Export Aces Data",
      defaultPath: `aces-backup-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`,
      filters: [{ name: "JSON Files", extensions: ["json"] }]
    });
    return o.canceled || !o.filePath ? { success: !1, canceled: !0 } : (await w(o.filePath, n, "utf-8"), { success: !0, filePath: o.filePath });
  } catch (o) {
    return { success: !1, error: String(o) };
  }
});
a.handle("import-data", async () => {
  try {
    const t = await d.showOpenDialog({
      title: "Import Aces Data",
      filters: [{ name: "JSON Files", extensions: ["json"] }],
      properties: ["openFile"]
    });
    if (t.canceled || t.filePaths.length === 0)
      return { success: !1, canceled: !0 };
    const n = await P(t.filePaths[0], "utf-8");
    return { success: !0, data: JSON.parse(n) };
  } catch (t) {
    return { success: !1, error: String(t) };
  }
});
function c(t) {
  try {
    const n = new URL(t);
    if (n.protocol === "file:") return !1;
    if (i) {
      const o = new URL(i).origin;
      if (n.origin === o) return !1;
    }
    return ["http:", "https:", "mailto:", "tel:"].includes(n.protocol);
  } catch {
    return !1;
  }
}
function m() {
  e = new f({
    width: 1180,
    height: 715,
    title: "Aces",
    icon: r.join(process.env.VITE_PUBLIC, "icon.png"),
    frame: !1,
    show: !1,
    backgroundColor: "#171717",
    webPreferences: {
      preload: r.join(p, "preload.mjs")
    }
  }), e.webContents.setBackgroundThrottling(!0), e.webContents.setWindowOpenHandler(({ url: t }) => (c(t) && l.openExternal(t), { action: "deny" })), e.webContents.on("will-navigate", (t, n) => {
    c(n) && (t.preventDefault(), l.openExternal(n));
  }), i ? e.loadURL(i) : e.loadFile(r.join(u, "index.html")), e.once("ready-to-show", () => {
    e == null || e.show();
  }), e.on("closed", () => {
    e = null;
  });
}
s.on("window-all-closed", () => {
  process.platform !== "darwin" && (s.quit(), e = null);
});
s.on("activate", () => {
  f.getAllWindows().length === 0 && m();
});
s.whenReady().then(m);
export {
  O as MAIN_DIST,
  u as RENDERER_DIST,
  i as VITE_DEV_SERVER_URL
};
