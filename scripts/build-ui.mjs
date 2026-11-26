// Lager renderer/index.html fra ui/snippmaster.html (samme fil som Claude-versjonen),
// og kobler grensesnittet til Electron-broen i preload.js.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const src = readFileSync(new URL("../ui/snippmaster.html", import.meta.url), "utf8");
const shim = '<script>window.claude={use:async(n)=>n==="desktop"?window.snippDesktop:null};</script>';
if (!src.includes("<head>")) throw new Error("Fant ikke <head> i ui/snippmaster.html");
mkdirSync(new URL("../renderer/", import.meta.url), { recursive: true });
writeFileSync(new URL("../renderer/index.html", import.meta.url), src.replace("<head>", "<head>\n" + shim), "utf8");
console.log("renderer/index.html oppdatert");
