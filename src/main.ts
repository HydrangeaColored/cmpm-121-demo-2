import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Drawpad";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

// canvas creation
const canvas = document.createElement("canvas");
canvas.id = "canvas";
const ctx = canvas.getContext("2d")!;
ctx.fillStyle = "#FFE5B4";
ctx.fillRect(canvas.height, canvas.width, canvas.height, canvas.width);
app.append(canvas);
