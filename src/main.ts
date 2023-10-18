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
canvas.style.cursor = "none";

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

class CursorCommand {
  currPos: { x: number; y: number };
  constructor(currX: number, currY: number) {
    this.currPos = { x: currX, y: currY };
  }
  draw(context: CanvasRenderingContext2D) {
    if (cursor.pen) {
      context.fillStyle = "#000000";
      let cursorXCorrection = 0;
      let cursorYCorrection = 0;
      if (currentMarkerWidth == thinMarkerWidth) {
        context.font = "16px monospace";
        const cursorXAdjustment = -4;
        const cursorYAdjustment = 8;
        cursorXCorrection = cursorXAdjustment;
        cursorYCorrection = cursorYAdjustment;
      } else {
        context.font = "32px monospace";
        const cursorXAdjustment = -8;
        const cursorYAdjustment = 16;
        cursorXCorrection = cursorXAdjustment;
        cursorYCorrection = cursorYAdjustment;
      }
      context.fillText(
        "*",
        this.currPos.x + cursorXCorrection,
        this.currPos.y + cursorYCorrection,
      );
      context.fillStyle = "#FFE5B4";
    } else {
      context.font = "32px monospace";
      context.fillText(cursor.selectedSticker, this.currPos.x, this.currPos.y);
    }
  }
}

class StickerCommand {
  canvasStickers: { x: number; y: number; sticker: string }[];
  constructor(currX: number, currY: number, currSticker: string) {
    this.canvasStickers = [{ x: currX, y: currY, sticker: currSticker }];
  }
  place(context: CanvasRenderingContext2D) {
    for (const { x, y, sticker } of this.canvasStickers) {
      context.font = "32px monospace";
      context.fillText(sticker, x, y);
      /*
      context.fillText(
        "*",
        x,
        y,
      );*/
    }
  }
}

// drawing
// source: https://glitch.com/edit/#!/shoddy-paint
const cursor = {
  active: false,
  x: 0,
  y: 0,
  pen: true,
  selectedSticker: "🍕",
};

// redrawing lines event
const redrawLines = new Event("drawing-changed");
canvas.addEventListener("drawing-changed", () => {
  redrawCanvas();
});

// cursor event
const mouseChange = new Event("tool-moved");
canvas.addEventListener("tool-moved", () => {
  redrawCanvas();
});

// sticker event
const stickerChange = new Event("tool-changed");
canvas.addEventListener("tool-moved", () => {
  redrawCanvas();
});

function redrawCanvas() {
  context.clearRect(canvasPosX, canvasPosY, canvas.width, canvas.height);
  context.fillRect(canvasPosX, canvasPosY, canvas.height, canvas.width);
  for (const currLine of drawingLine) {
    currLine.display(context);
  }
  if (cursorChange) {
    cursorChange.draw(context);
  }
  for (const currSticker of drawingStickers) {
    currSticker.place(context);
  }
}

let drawingLine: LineCommand[] = [];
let undoneLines: LineCommand[] = [];
let currentMarkerWidth = thinMarkerWidth;
let cursorChange: CursorCommand | null = null;
let drawingStickers: StickerCommand[] = [];
// 1 is line, 2 is sticker
let undoReminder: number[] = [];
let redoReminder: number[] = [];
let undoneStickers: StickerCommand[] = [];

canvas.addEventListener("mousedown", (mouseData) => {
  // mouse is active and start point of new line
  cursor.active = true;
  cursor.x = mouseData.offsetX;
  cursor.y = mouseData.offsetY;
  if (cursor.pen) {
    const newLine = new LineCommand(cursor.x, cursor.y, currentMarkerWidth);
    drawingLine.push(newLine);
    canvas.dispatchEvent(redrawLines);
  }
  undoneLines = [];
  undoneStickers = [];
  redoReminder = [];
});

canvas.addEventListener("mousemove", (mouseData) => {
  cursorChange = new CursorCommand(mouseData.offsetX, mouseData.offsetY);
  canvas.dispatchEvent(mouseChange);
  // draw path from start to current
  if (cursor.active) {
    cursor.x = mouseData.offsetX;
    cursor.y = mouseData.offsetY;
    if (cursor.pen) {
      const lastIndexOfArrayIncrement = -1;
      const newLine =
        drawingLine[drawingLine.length + lastIndexOfArrayIncrement];
      newLine.drag(cursor.x, cursor.y);

      canvas.dispatchEvent(redrawLines);
    }
  }
});

canvas.addEventListener("mouseup", (mouseData) => {
  if (!cursor.pen) {
    const newSticker = new StickerCommand(
      mouseData.offsetX,
      mouseData.offsetY,
      cursor.selectedSticker,
    );
    drawingStickers.push(newSticker);
    const lastStrokeSticker = 2;
    undoReminder.push(lastStrokeSticker);
    canvas.dispatchEvent(stickerChange);
  } else {
    const lastStrokePen = 1;
    undoReminder.push(lastStrokePen);
  }
  // cursor inactive
  cursor.active = false;
  canvas.dispatchEvent(redrawLines);
});

canvas.addEventListener("mouseenter", (mouseData) => {
  cursorChange = new CursorCommand(mouseData.offsetX, mouseData.offsetY);
  canvas.dispatchEvent(mouseChange);
});

// fix for leave canvas while drawing bug
canvas.addEventListener("mouseleave", () => {
  cursorChange = null;
  canvas.dispatchEvent(mouseChange);
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
  drawingStickers = [];
  canvas.dispatchEvent(redrawLines);
  context.fillRect(canvasPosX, canvasPosY, canvas.height, canvas.width);
  undoneLines = [];
  undoneStickers = [];
  undoReminder = [];
  redoReminder = [];
});

// undo button
const undoCanvas = document.createElement("button");
undoCanvas.innerHTML = "undo";
app.append(undoCanvas);
undoCanvas.addEventListener("click", () => {
  // clear context and redraw background color
  if (undoReminder.length) {
    if (undoReminder[undoReminder.length - 1] == 1) {
      if (drawingLine.length) {
        undoneLines.push(drawingLine.pop()!);
      }
    } else if (undoReminder[undoReminder.length - 1] == 2) {
      if (drawingStickers.length) {
        undoneStickers.push(drawingStickers.pop()!);
        canvas.dispatchEvent(stickerChange);
      }
    }
    redoReminder.push(undoReminder.pop()!);
    canvas.dispatchEvent(redrawLines);
  }
});

// redo button
const redoCanvas = document.createElement("button");
redoCanvas.innerHTML = "redo";
app.append(redoCanvas);
redoCanvas.addEventListener("click", () => {
  // clear context and redraw background color
  if (redoReminder.length) {
    if (redoReminder[redoReminder.length - 1] == 1) {
      if (undoneLines.length) {
        drawingLine.push(undoneLines.pop()!);
      }
    } else if (redoReminder[redoReminder.length - 1] == 2) {
      if (undoneStickers.length) {
        drawingStickers.push(undoneStickers.pop()!);
      }
    }
    undoReminder.push(redoReminder.pop()!);
    canvas.dispatchEvent(redrawLines);
  }
});

const markerDiv = document.createElement("div");
app.append(markerDiv);

// thin marker
const thinMarker = document.createElement("button");
thinMarker.innerHTML = "thin";
app.append(thinMarker);
thinMarker.addEventListener("click", () => {
  currentMarkerWidth = thinMarkerWidth;
  cursor.pen = true;
});

// thick marker
const thickMarker = document.createElement("button");
thickMarker.innerHTML = "thick";
app.append(thickMarker);
thickMarker.addEventListener("click", () => {
  currentMarkerWidth = thickMarkerWidth;
  cursor.pen = true;
});

const emojiDiv = document.createElement("div");
app.append(emojiDiv);

// pizza emoji
const pizzaSticker = document.createElement("button");
pizzaSticker.innerHTML = "🍕";
app.append(pizzaSticker);
pizzaSticker.addEventListener("click", () => {
  canvas.dispatchEvent(stickerChange);
  cursor.pen = false;
  cursor.selectedSticker = "🍕";
});

// burger emoji
const burgerSticker = document.createElement("button");
burgerSticker.innerHTML = "🍔";
app.append(burgerSticker);
burgerSticker.addEventListener("click", () => {
  canvas.dispatchEvent(stickerChange);
  cursor.pen = false;
  cursor.selectedSticker = "🍔";
});

// fries emoji
const friesSticker = document.createElement("button");
friesSticker.innerHTML = "🍟";
app.append(friesSticker);
friesSticker.addEventListener("click", () => {
  canvas.dispatchEvent(stickerChange);
  cursor.pen = false;
  cursor.selectedSticker = "🍟";
});
