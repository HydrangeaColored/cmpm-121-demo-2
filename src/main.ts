import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "🦇Halloween Drawpad🦇";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

document.body.style.backgroundColor = "orange";
// canvas creation
const canvas = document.createElement("canvas");
const canvasSize = 256;
canvas.height = canvasSize;
canvas.width = canvasSize;
canvas.id = "canvas";
const context = canvas.getContext("2d")!;
context.fillStyle = "#FFE5B4";
const canvasPos = 0;
context.fillRect(canvasPos, canvasPos, canvas.height, canvas.width);
app.append(canvas);
const thinMarkerWidth = 1;
const thickMarkerWidth = 5;
canvas.style.cursor = "none";
const colorChoice = ["red", "blue", "yellow", "green", "white", "black"];
const colorSize = 5;

// geo info objs
class LineCommand {
  pointsInLine: { x: number; y: number }[];
  currMarkerWidth: number;
  currColor: number;

  constructor(
    currX: number,
    currY: number,
    currMarkerWidth: number,
    currColor: number,
  ) {
    this.pointsInLine = [{ x: currX, y: currY }];
    this.currMarkerWidth = currMarkerWidth;
    this.currColor = currColor;
  }

  display(context: CanvasRenderingContext2D) {
    context.lineWidth = this.currMarkerWidth;
    const firstIndex = 0;
    const { x, y } = this.pointsInLine[firstIndex];
    context.strokeStyle = colorChoice[this.currColor];
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
    context.fillStyle = colorChoice[cursor.selectedColor];
    let cursorXCorrection = 0;
    let cursorYCorrection = 0;
    if (cursor.pen) {
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
    } else {
      context.font = "24px monospace";
      const cursorXAdjustment = -14;
      const cursorYAdjustment = 10;
      cursorXCorrection = cursorXAdjustment;
      cursorYCorrection = cursorYAdjustment;
      context.fillText(
        cursor.selectedSticker,
        this.currPos.x + cursorXCorrection,
        this.currPos.y + cursorYCorrection,
      );
    }
    context.fillStyle = "#FFE5B4";
  }
}

class StickerCommand {
  canvasStickers: { x: number; y: number; sticker: string }[];
  currColor: number;
  constructor(
    currX: number,
    currY: number,
    currSticker: string,
    currColor: number,
  ) {
    this.canvasStickers = [{ x: currX, y: currY, sticker: currSticker }];
    this.currColor = currColor;
  }
  place(context: CanvasRenderingContext2D) {
    for (const { x, y, sticker } of this.canvasStickers) {
      context.font = "24px monospace";
      context.fillStyle = colorChoice[this.currColor];
      context.fillText(sticker, x, y);
      context.fillStyle = "#FFE5B4";
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
  selectedColor: 0,
};

// redrawing lines event
const redrawLines = new Event("drawing-changed");
canvas.addEventListener("drawing-changed", () => {
  redrawCanvas(context);
});

// cursor event
const mouseChange = new Event("tool-moved");
canvas.addEventListener("tool-moved", () => {
  redrawCanvas(context);
});

// sticker event
const stickerChange = new Event("tool-changed");
canvas.addEventListener("tool-moved", () => {
  redrawCanvas(context);
});

function redrawCanvas(context: CanvasRenderingContext2D) {
  context.clearRect(canvasPos, canvasPos, canvas.width, canvas.height);
  context.fillRect(canvasPos, canvasPos, canvas.height, canvas.width);
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
    const newLine = new LineCommand(
      cursor.x,
      cursor.y,
      currentMarkerWidth,
      cursor.selectedColor,
    );
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
    const cursorXAdjustment = -14;
    const cursorYAdjustment = 10;
    const newSticker = new StickerCommand(
      mouseData.offsetX + cursorXAdjustment,
      mouseData.offsetY + cursorYAdjustment,
      cursor.selectedSticker,
      cursor.selectedColor,
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
clearCanvas.style.backgroundColor = "purple";
app.append(clearCanvas);
clearCanvas.addEventListener("click", () => {
  // clear context and redraw background color
  drawingLine = [];
  drawingStickers = [];
  canvas.dispatchEvent(redrawLines);
  context.fillRect(canvasPos, canvasPos, canvas.height, canvas.width);
  undoneLines = [];
  undoneStickers = [];
  undoReminder = [];
  redoReminder = [];
});

// undo button
const undoCanvas = document.createElement("button");
undoCanvas.innerHTML = "undo";
undoCanvas.style.backgroundColor = "purple";
app.append(undoCanvas);
undoCanvas.addEventListener("click", () => {
  // clear context and redraw background color
  if (undoReminder.length) {
    const finalElementArrayIncrement = 1;
    const isLine = 1;
    const isSticker = 2;
    if (
      undoReminder[undoReminder.length - finalElementArrayIncrement] == isLine
    ) {
      if (drawingLine.length) {
        undoneLines.push(drawingLine.pop()!);
      }
    } else if (
      undoReminder[undoReminder.length - finalElementArrayIncrement] ==
      isSticker
    ) {
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
redoCanvas.style.backgroundColor = "purple";
app.append(redoCanvas);
redoCanvas.addEventListener("click", () => {
  // clear context and redraw background color
  if (redoReminder.length) {
    const finalElementArrayIncrement = 1;
    const isLine = 1;
    const isSticker = 2;
    if (
      redoReminder[redoReminder.length - finalElementArrayIncrement] == isLine
    ) {
      if (undoneLines.length) {
        drawingLine.push(undoneLines.pop()!);
      }
    } else if (
      redoReminder[redoReminder.length - finalElementArrayIncrement] ==
      isSticker
    ) {
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
thinMarker.style.backgroundColor = "red";
app.append(thinMarker);
thinMarker.addEventListener("click", () => {
  cursor.selectedColor = Math.floor(colorSize * Math.random());
  currentMarkerWidth = thinMarkerWidth;
  cursor.pen = true;
});

// thick marker
const thickMarker = document.createElement("button");
thickMarker.innerHTML = "thick";
thickMarker.style.backgroundColor = "red";
app.append(thickMarker);
thickMarker.addEventListener("click", () => {
  cursor.selectedColor = Math.floor(colorSize * Math.random());
  currentMarkerWidth = thickMarkerWidth;
  cursor.pen = true;
});

const emojiDiv = document.createElement("div");
app.append(emojiDiv);

// pizza emoji
const lanternSticker = document.createElement("button");
lanternSticker.innerHTML = "🎃";
lanternSticker.style.backgroundColor = "black";
app.append(lanternSticker);
lanternSticker.addEventListener("click", () => {
  cursor.selectedColor = Math.floor(colorSize * Math.random());
  canvas.dispatchEvent(stickerChange);
  cursor.pen = false;
  cursor.selectedSticker = "🎃";
});

// burger emoji
const ghostSticker = document.createElement("button");
ghostSticker.innerHTML = "👻";
ghostSticker.style.backgroundColor = "black";
app.append(ghostSticker);
ghostSticker.addEventListener("click", () => {
  cursor.selectedColor = Math.floor(colorSize * Math.random());
  canvas.dispatchEvent(stickerChange);
  cursor.pen = false;
  cursor.selectedSticker = "👻";
});

// fries emoji
const webSticker = document.createElement("button");
webSticker.innerHTML = "🕸️";
webSticker.style.backgroundColor = "black";
app.append(webSticker);
webSticker.addEventListener("click", () => {
  cursor.selectedColor = Math.floor(colorSize * Math.random());
  canvas.dispatchEvent(stickerChange);
  cursor.pen = false;
  cursor.selectedSticker = "🕸️";
});

// custom emoji
let customStickerText: string | null = "";
const customSticker = document.createElement("button");
customSticker.innerHTML = "Custom";
customSticker.style.color = "white";
customSticker.style.backgroundColor = "black";
app.append(customSticker);
customSticker.addEventListener("click", () => {
  cursor.selectedColor = Math.floor(colorSize * Math.random());
  customStickerText = prompt("Custom Sticker text", "💀");
  customSticker.innerHTML = customStickerText!;
  canvas.dispatchEvent(stickerChange);
  cursor.pen = false;
  cursor.selectedSticker = customStickerText!;
});

const exportDiv = document.createElement("div");
app.append(exportDiv);

// export button
const exportButton = document.createElement("button");
exportButton.innerHTML = "Export";
app.append(exportButton);
exportButton.addEventListener("click", () => {
  const tempCanvas = document.createElement("canvas");
  const tempCanvasSize = 1024;
  tempCanvas.height = tempCanvasSize;
  tempCanvas.width = tempCanvasSize;
  const tempContext = tempCanvas.getContext("2d")!;
  const scaleSize = 4;
  tempContext.scale(scaleSize, scaleSize);
  tempContext.fillStyle = "#FFE5B4";
  context.fillRect(canvasPos, canvasPos, tempCanvas.height, tempCanvas.width);
  redrawCanvas(tempContext);
  const anchor = document.createElement("a");
  anchor.href = tempCanvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
  canvas.dispatchEvent(redrawLines);
});
