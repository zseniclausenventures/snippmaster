// Snippmaster - bro mellom grensesnittet og hovedprosessen.
// Etterligner Claude-appens "desktop"-grensesnitt, slik at samme side virker begge steder.
const { contextBridge, ipcRenderer, webUtils } = require("electron");

const f = (op) => (...a) => {
  const last = a[a.length - 1];
  let opts = {};
  if (op === "readFile" && typeof a[1] === "string") opts = { encoding: a[1] };
  else if (op === "writeFile" && typeof a[2] === "string") opts = { encoding: a[2] };
  else if ((op === "mkdir" || op === "rm") && last && typeof last === "object") opts = last;
  return ipcRenderer.invoke("fs", op, a, opts).then((r) => {
    if (r && "err" in r) {
      // Gi samme feilkoder som Node (ENOENT, EPERM ...) i meldingen.
      const m = String(r.err).match(/\b(E[A-Z]+)\b.*$/);
      throw new Error(m ? m[0] : String(r.err));
    }
    return r ? r.ok : r;
  });
};

const granted = { "full-access": "granted", notifications: "granted", "menu-bar": "unavailable", shortcuts: "unavailable", overlay: "unavailable" };

contextBridge.exposeInMainWorld("snippDesktop", {
  standalone: true,
  pathForFile: (file) => { try { return webUtils.getPathForFile(file); } catch { return ""; } },
  install: { state: async () => "installed", request: async () => "installed" },
  permissions: {
    state: async (name) => (name ? granted[name] : { ...granted }),
    request: async () => ({ ...granted }),
    manage: async () => {},
  },
  window: {
    setOptions: async (options) => ({ applied: "now", reloading: false, options }),
    getOptions: async () => ({ options: {}, applied: {} }),
  },
  app: { dock: { setIcon: async () => ({ written: false }), setBadge: async () => false } },
  os: {
    platform: async () => process.platform,
    arch: async () => process.arch,
    info: () => ipcRenderer.invoke("os-info"),
    homedir: async () => (await ipcRenderer.invoke("os-info")).homedir,
  },
  fs: {
    exists: f("exists"), mkdir: f("mkdir"), readFile: f("readFile"), writeFile: f("writeFile"), appendFile: f("appendFile"),
    readdir: f("readdir"), stat: f("stat"), lstat: f("lstat"), rm: f("rm"), rename: f("rename"), copyFile: f("copyFile"), realpath: f("realpath"),
  },
  childProcess: { exec: (command, opts) => ipcRenderer.invoke("exec", command, opts || {}) },
  shell: {
    openPath: (p) => ipcRenderer.invoke("shell", "openPath", p),
    showItemInFolder: (p) => ipcRenderer.invoke("shell", "showItemInFolder", p),
    trashItem: (p) => ipcRenderer.invoke("shell", "trashItem", p),
  },
  notification: { show: ({ body }) => ipcRenderer.invoke("notify", body) },
});
