// Snippmaster - hovedprosess (Electron)
// Gir grensesnittet de samme maskinfunksjonene som Claude-versjonen bruker:
// filer, kommandoer, varsler og åpning i Finder/Utforsker.
const { app, BrowserWindow, ipcMain, shell, Notification, Menu } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs/promises");
const { exec } = require("child_process");

const expand = (p) => {
  const s = String(p || "");
  if (s === "~") return os.homedir();
  if (s.startsWith("~/") || s.startsWith("~\\")) return path.join(os.homedir(), s.slice(2));
  return s;
};

let win = null;

function createWindow() {
  const isMac = process.platform === "darwin";
  win = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 900,
    minHeight: 640,
    title: "Snippmaster",
    backgroundColor: "#141518",
    titleBarStyle: isMac ? "hiddenInset" : "default",
    autoHideMenuBar: !isMac,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });
  win.loadFile(path.join(__dirname, "..", "renderer", "index.html"));

  // Røyktest i CI: SNIPP_SMOKE=/sti/bilde.png tar et skjermbilde etter oppstart og avslutter.
  if (process.env.SNIPP_SMOKE) {
    win.webContents.on("console-message", (e) => console.log("[side]", e.message || ""));
    win.webContents.once("did-finish-load", () => setTimeout(async () => {
      const img = await win.webContents.capturePage();
      await fs.writeFile(process.env.SNIPP_SMOKE, img.toPNG());
      app.quit();
    }, 5000));
  }

  // Lenker åpnes i nettleseren, aldri inne i appen.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith("file://")) {
      e.preventDefault();
      if (/^https:\/\//.test(url)) shell.openExternal(url);
    }
  });
}

/* ---------- filer ---------- */
async function fsOp(op, a = [], opts = {}) {
  const p = expand(a[0]);
  switch (op) {
    case "exists":
      return fs.access(p).then(() => true, () => false);
    case "mkdir":
      await fs.mkdir(p, { recursive: !!opts.recursive });
      return null;
    case "readFile":
      if (opts.encoding) return fs.readFile(p, opts.encoding);
      return new Uint8Array(await fs.readFile(p));
    case "writeFile":
      await fs.writeFile(p, a[1], opts.encoding && typeof a[1] === "string" ? opts.encoding : undefined);
      return null;
    case "appendFile":
      await fs.appendFile(p, a[1]);
      return null;
    case "readdir": {
      const ents = await fs.readdir(p, { withFileTypes: true });
      return ents.map((d) => ({ name: d.name, isFile: d.isFile(), isDirectory: d.isDirectory(), isSymbolicLink: d.isSymbolicLink() }));
    }
    case "stat":
    case "lstat": {
      const s = await (op === "stat" ? fs.stat(p) : fs.lstat(p));
      return { size: s.size, mode: s.mode, mtimeMs: s.mtimeMs, ctimeMs: s.ctimeMs, birthtimeMs: s.birthtimeMs, isFile: s.isFile(), isDirectory: s.isDirectory(), isSymbolicLink: s.isSymbolicLink() };
    }
    case "rm":
      await fs.rm(p, { recursive: !!opts.recursive, force: !!opts.force });
      return null;
    case "rename":
      await fs.rename(p, expand(a[1]));
      return null;
    case "copyFile":
      await fs.copyFile(p, expand(a[1]));
      return null;
    case "realpath":
      return fs.realpath(p);
    default:
      throw new Error("EINVAL: ukjent filoperasjon " + op);
  }
}
// Feil sendes tilbake som verdi, ikke som unntak. Ellers skriver Electron hver manglende
// valgfri fil (ENOENT) til konsollen som «Error occurred in handler», selv om appen håndterer den.
ipcMain.handle("fs", async (_e, op, a = [], opts = {}) => {
  try {
    return { ok: await fsOp(op, a, opts) };
  } catch (e) {
    return { err: `${e.code || ""} ${e.message || e}`.trim() };
  }
});

/* ---------- kommandoer ---------- */
ipcMain.handle("exec", (_e, command, opts = {}) =>
  new Promise((resolve) => {
    exec(
      command,
      {
        timeout: opts.timeout || 0,
        cwd: opts.cwd ? expand(opts.cwd) : undefined,
        env: { ...process.env, ...(opts.env || {}) },
        maxBuffer: 64 * 1024 * 1024,
        windowsHide: true,
      },
      (err, stdout, stderr) => {
        resolve({ stdout: String(stdout || ""), stderr: String(stderr || ""), code: err ? (typeof err.code === "number" ? err.code : 1) : 0, signal: err?.signal || null, truncated: false });
      }
    );
  })
);

/* ---------- system ---------- */
ipcMain.handle("os-info", () => ({
  platform: process.platform,
  arch: process.arch,
  release: os.release(),
  hostname: os.hostname(),
  homedir: os.homedir(),
  tmpdir: os.tmpdir(),
  username: os.userInfo().username,
  cpus: os.cpus().length,
  totalmem: os.totalmem(),
  uptime: os.uptime(),
}));
ipcMain.handle("shell", async (_e, op, p) => {
  const target = expand(p);
  if (op === "openPath") {
    const err = await shell.openPath(target);
    if (err) throw new Error(err);
  } else if (op === "showItemInFolder") shell.showItemInFolder(target);
  else if (op === "trashItem") await shell.trashItem(target);
  return null;
});
ipcMain.handle("notify", (_e, body) => {
  if (Notification.isSupported()) new Notification({ title: "Snippmaster", body: String(body || "").slice(0, 300) }).show();
  return null;
});

app.setName("Snippmaster");
if (!app.requestSingleInstanceLock()) app.quit();
app.on("second-instance", () => {
  if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
});
app.whenReady().then(() => {
  if (process.platform === "darwin") {
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      { role: "appMenu" }, { role: "editMenu" }, { role: "viewMenu" }, { role: "windowMenu" },
    ]));
  }
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
