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
const thinMarkerWidth = 1;
const thickMarkerWidth = 5;

// geo info objs
class LineCommand {
  pointsInLine: { x: number; y: number }[];
  currMarkerWidth: number;

  constructor(currX: number, currY: number, currMarkerWidth: number) {
    this.pointsInLine = [{ x: currX, y: currY }];
    this.currMarkerWidth = currMarkerWidth;
  }

  display(context: CanvasRenderingContext2D) {
    context.lineWidth = this.currMarkerWidth;
    const firstIndex = 0;
    const { x, y } = this.pointsInLine[firstIndex];
    context.beginPath();
    context.moveTo(x, y);
    for (const { x, y } of this.pointsInLine) {
      context.lineTo(x, y);
    }
    context.stroke();
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
let currentMarkerWidth = thinMarkerWidth;

canvas.addEventListener("mousedown", (mouseData) => {
  // mouse is active and start point of new line
  cursor.active = true;
  cursor.x = mouseData.offsetX;
  cursor.y = mouseData.offsetY;
  const newLine = new LineCommand(cursor.x, cursor.y, currentMarkerWidth);
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

const newDiv = document.createElement("div");
app.append(newDiv);

// thin marker
const thinMarker = document.createElement("button");
thinMarker.innerHTML = "thin";
app.append(thinMarker);
thinMarker.addEventListener("click", () => {
  currentMarkerWidth = thinMarkerWidth;
});

// thin marker
const thickMarker = document.createElement("button");
thickMarker.innerHTML = "thick";
app.append(thickMarker);
thickMarker.addEventListener("click", () => {
  currentMarkerWidth = thickMarkerWidth;
});
