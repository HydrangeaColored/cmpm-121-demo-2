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

// geo info objs
class LineCommand {
  pointsInLine: { x: number; y: number }[];

  constructor(currX: number, currY: number) {
    this.pointsInLine = [{ x: currX, y: currY }];
  }

  display(ctx: CanvasRenderingContext2D) {
    const firstIndex = 0;
    const { x, y } = this.pointsInLine[firstIndex];
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (const { x, y } of this.pointsInLine) {
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  drag(x: number, y: number) {
    this.pointsInLine.push({ x, y });
  }
}
// drawing
// source: https://glitch.com/edit/#!/shoddy-paint
const cursor = {
  active: false,
  x: 0,
  y: 0,
};

// redrawing lines event
const redrawLines = new Event("drawing-changed");
canvas.addEventListener("drawing-changed", () => {
  redrawCanvas();
});

function redrawCanvas() {
  context.clearRect(canvasPosX, canvasPosY, canvas.width, canvas.height);
  context.fillRect(canvasPosX, canvasPosY, canvas.height, canvas.width);
  for (const currLine of drawingLine) {
    currLine.display(context);
  }
}

let drawingLine: LineCommand[] = [];
let undoneLines: LineCommand[] = [];

canvas.addEventListener("mousedown", (mouseData) => {
  // mouse is active and start point of new line
  cursor.active = true;
  cursor.x = mouseData.offsetX;
  cursor.y = mouseData.offsetY;
  const newLine = new LineCommand(cursor.x, cursor.y);
  drawingLine.push(newLine);
  undoneLines = [];
  canvas.dispatchEvent(redrawLines);
});

canvas.addEventListener("mousemove", (mouseData) => {
  // draw path from start to current
  if (cursor.active) {
    cursor.x = mouseData.offsetX;
    cursor.y = mouseData.offsetY;
    const lastIndexOfArrayIncrement = -1;
    const newLine = drawingLine[drawingLine.length + lastIndexOfArrayIncrement];
    newLine.drag(cursor.x, cursor.y);
    canvas.dispatchEvent(redrawLines);
  }
});

canvas.addEventListener("mouseup", () => {
  // cursor inactive
  cursor.active = false;
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
  drawingLine = [];
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
  if (drawingLine.length) {
    undoneLines.push(drawingLine.pop()!);
    canvas.dispatchEvent(redrawLines);
  }
});

// redo button
const redoCanvas = document.createElement("button");
redoCanvas.innerHTML = "redo";
app.append(redoCanvas);
redoCanvas.addEventListener("click", () => {
  // clear context and redraw background color
  if (undoneLines.length) {
    drawingLine.push(undoneLines.pop()!);
    canvas.dispatchEvent(redrawLines);
  }
});
