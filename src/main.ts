import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Drawpad";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

// canvas creation
const canvas = document.createElement("canvas");
const canvasHeight = 256;
const canvasWidth = 256;
canvas.height = canvasHeight;
canvas.width = canvasWidth;
canvas.id = "canvas";
const ctx = canvas.getContext("2d")!;
ctx.fillStyle = "#FFE5B4";
const canvasPosX = 0;
const canvasPosY = 0;
ctx.fillRect(canvasPosX, canvasPosY, canvas.height, canvas.width);
app.append(canvas);
