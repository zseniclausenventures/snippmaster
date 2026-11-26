// Tegner app-ikonet (gammeldags filmkamera) i 1024 px. Krever: npm i -D @napi-rs/canvas
import { createCanvas } from "@napi-rs/canvas";
import { writeFileSync } from "node:fs";
const S = 1024, c = createCanvas(S, S), x = c.getContext("2d");
x.scale(S / 256, S / 256);
const circle = (cx, cy, r) => { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); };
const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, "#2c2d33"); g.addColorStop(1, "#111215");
x.fillStyle = g; x.beginPath(); x.roundRect(0, 0, 256, 256, 56); x.fill();
const reel = (cx, cy, r) => {
  x.fillStyle = "#ecebe6"; circle(cx, cy, r); x.fillStyle = "#18191d";
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * (Math.PI * 2 / 5); circle(cx + Math.cos(a) * r * 0.56, cy + Math.sin(a) * r * 0.56, r * 0.2); }
  circle(cx, cy, r * 0.13);
};
reel(82, 78, 36); reel(152, 70, 44);
x.strokeStyle = "#ecebe6"; x.lineWidth = 5;
x.beginPath(); x.moveTo(82, 114); x.lineTo(96, 126); x.stroke();
x.beginPath(); x.moveTo(152, 114); x.lineTo(140, 126); x.stroke();
const bg = x.createLinearGradient(0, 124, 0, 206); bg.addColorStop(0, "#f4f3ee"); bg.addColorStop(1, "#cfcdc4");
x.fillStyle = bg; x.beginPath(); x.roundRect(44, 124, 138, 82, 14); x.fill();
x.fillStyle = "#ff4d2e"; x.beginPath(); x.moveTo(182, 146); x.lineTo(224, 128); x.lineTo(224, 202); x.lineTo(182, 184); x.closePath(); x.fill();
x.fillStyle = "#c93a20"; x.fillRect(182, 146, 8, 38);
x.fillStyle = "#18191d"; x.beginPath(); x.roundRect(58, 138, 54, 12, 6); x.fill(); x.beginPath(); x.roundRect(58, 160, 32, 32, 8); x.fill();
x.fillStyle = "#ff4d2e"; circle(150, 172, 9); x.fillStyle = "#18191d"; circle(124, 172, 5);
x.fillStyle = "#ecebe6"; x.beginPath(); x.roundRect(100, 206, 26, 18, 4); x.fill();
writeFileSync(new URL("../build/icon.png", import.meta.url), c.toBuffer("image/png"));
console.log("build/icon.png laget");
