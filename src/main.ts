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

const redrawLines = new Event("drawing-changed");
canvas.addEventListener("drawing-changed", () => {
  redrawCanvas();
});

function redrawCanvas() {
  context.clearRect(canvasPosX, canvasPosY, canvas.width, canvas.height);
  context.fillRect(canvasPosX, canvasPosY, canvas.height, canvas.width);
  for (const line of finishedLines) {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    if (line.length > 1) {
      context.beginPath();
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      const { x, y } = line[0];
      context.moveTo(x, y);
      for (const { x, y } of line) {
        context.lineTo(x, y);
      }
      context.stroke();
    }
  }
}

let finishedLines: { x: number; y: number }[][] = [];
let drawingLine: { x: number; y: number }[] | null = [];
let undoneLines: { x: number; y: number }[][] = [];

canvas.addEventListener("mousedown", (mouseData) => {
  // mouse is active and start point of new line
  cursor.active = true;
  cursor.x = mouseData.offsetX;
  cursor.y = mouseData.offsetY;
  drawingLine = [];
  finishedLines.push(drawingLine);
  drawingLine.push({ x: cursor.x, y: cursor.y });
  canvas.dispatchEvent(redrawLines);
  undoneLines = [];
});

canvas.addEventListener("mousemove", (mouseData) => {
  // draw path from start to current
  if (cursor.active) {
    /*
    context.beginPath();
    context.moveTo(cursor.x, cursor.y);
    context.lineTo(mouseData.offsetX, mouseData.offsetY);
    context.stroke();
    // set new start point
    */
    cursor.x = mouseData.offsetX;
    cursor.y = mouseData.offsetY;
    drawingLine!.push({ x: cursor.x, y: cursor.y });
    canvas.dispatchEvent(redrawLines);
  }
});

canvas.addEventListener("mouseup", () => {
  // cursor inactive
  cursor.active = false;
  drawingLine = [];
  canvas.dispatchEvent(redrawLines);
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
  finishedLines = [];
  canvas.dispatchEvent(redrawLines);
  context.fillRect(canvasPosX, canvasPosY, canvas.height, canvas.width);
  undoneLines = [];
});

// undo button
const undoCanvas = document.createElement("button");
undoCanvas.innerHTML = "undo";
app.append(undoCanvas);
undoCanvas.addEventListener("click", () => {
  // clear context and redraw background color
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  if (finishedLines.length > 0) {
    undoneLines.push(finishedLines.pop()!);
    canvas.dispatchEvent(redrawLines);
    //context.fillRect(canvasPosX, canvasPosY, canvas.height, canvas.width);
  }
});

// redo button
const redoCanvas = document.createElement("button");
redoCanvas.innerHTML = "redo";
app.append(redoCanvas);
redoCanvas.addEventListener("click", () => {
  // clear context and redraw background color
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  if (undoneLines.length > 0) {
    finishedLines.push(undoneLines.pop()!);
    canvas.dispatchEvent(redrawLines);
    //context.fillRect(canvasPosX, canvasPosY, canvas.height, canvas.width);
  }
});
