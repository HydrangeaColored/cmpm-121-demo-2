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
const context = canvas.getContext("2d")!;
context.fillStyle = "#FFE5B4";
const canvasPosX = 0;
const canvasPosY = 0;
context.fillRect(canvasPosX, canvasPosY, canvas.height, canvas.width);
app.append(canvas);

// drawing
// source: https://glitch.com/edit/#!/shoddy-paint
const cursor = {
  active: false,
  x: 0,
  y: 0,
};

canvas.addEventListener("mousedown", (mouseData) => {
  // mouse is active and start point of new line
  cursor.active = true;
  cursor.x = mouseData.offsetX;
  cursor.y = mouseData.offsetY;
});

canvas.addEventListener("mousemove", (mouseData) => {
  // draw path from start to current
  if (cursor.active) {
    context.beginPath();
    context.moveTo(cursor.x, cursor.y);
    context.lineTo(mouseData.offsetX, mouseData.offsetY);
    context.stroke();
    // set new start point
    cursor.x = mouseData.offsetX;
    cursor.y = mouseData.offsetY;
  }
});

canvas.addEventListener("mouseup", () => {
  // cursor inactive
  cursor.active = false;
});

// fix for leave canvas while drawing bug
canvas.addEventListener("mouseleave", () => {
  cursor.active = false;
});

// div for better button placement
const div = document.createElement("div");
app.append(div);

// clear button
const clearCanvas = document.createElement("button");
clearCanvas.innerHTML = "clear";
app.append(clearCanvas);
clearCanvas.addEventListener("click", () => {
  // clear context and redraw background color
  context.clearRect(canvasPosX, canvasPosY, canvas.width, canvas.height);
  context.fillStyle = "#FFE5B4";
  context.fillRect(canvasPosX, canvasPosY, canvas.height, canvas.width);
});
