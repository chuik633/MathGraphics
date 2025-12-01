let pane;
const width = window.innerWidth;
const height = window.innerHeight;
const padding = 20;

let fonts = { Bd: "", Bk: "", Lt: "", Rg: "" };
let gapInput;
const pos = {
  top: padding,
  bottom: height - padding,
  left: padding,
  right: width - padding,
};
const innerWidth = width - padding * 2;
const innerHeight = height - padding * 2;
const gridSize = 40;

const colors = {
  grey: "#D9D9D9",
  black: "#000000",
  yellow: "#EEFFC0",
  blue: "#A5E8FE",
};
let params = {
  color: colors.yellow,
  currFont: "",
  text: "Art of Problem Solving",
  fontSize: 150,
  gapDetection: 20,
  animate: false,
};
let currFont;

function preload() {
  const fontFamily = "ESKlarheitKurrent";
  for (const type of Object.keys(fonts)) {
    fonts[type] = loadFont(
      `./assets/fonts/${fontFamily}/${fontFamily}-${type}-TRIAL.ttf`
    );
  }
  params.currFont = "Bd";
}

function setup() {
  createCanvas(width, height);
  pane = new Tweakpane.Pane({ title: "Parameters" });
  pane.element.style.position = "fixed";
  pane.element.style.transformOrigin = "top left";
  pane.element.style.top = `${10}px`;
  pane.element.style.left = "10px";
  pane.addInput(params, "text").on("change", () => {});
  pane
    .addInput(params, "fontSize", { min: 50, max: 200 })
    .on("change", () => {});
  gapInput = pane.addInput(params, "gapDetection", {
    min: 0.1,
    max: params.fontSize / 3,
  });
  pane.addInput(params, "currFont", {
    options: { Black: "Bk", Bold: "Bd", Regular: "Bk", Light: "Lt" },
  });
  pane.addInput(params, "animate");
}

function draw() {
  if (params.animate) {
    params.gapDetection = map(
      sin(frameCount * 0.05) * 2,
      -2,
      2,
      1,
      params.fontSize / 5
    );
    gapInput.refresh();
  }
  currFont = fonts[params.currFont];
  if (!currFont) return;
  background(colors.black);
  textFont(currFont);
  textSize(params.fontSize);
  const maxWidth = innerWidth - 40;
  const lines = wrapTextToWidth(params.text, maxWidth);
  const lineHeight = params.fontSize;
  let y = height / 2 - ((lines.length - 1) * lineHeight) / 2;
  for (const line of lines) {
    const letters = line.split("");
    let lineWidth = 0;
    const gap = 10;
    for (const letter of letters) lineWidth += textWidth(letter) + gap;
    let x = width / 2 - lineWidth / 2 + params.fontSize / 2;
    for (const letter of letters) {
      letterTriangles(letter, x, y);
      x += gap + textWidth(letter);
    }
    y += lineHeight;
  }
}

function wrapTextToWidth(text, maxWidth) {
  textSize(params.fontSize);
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const testLine = line === "" ? w : line + " " + w;
    if (textWidth(testLine) > maxWidth) {
      lines.push(line);
      line = w;
    } else line = testLine;
  }
  lines.push(line);
  return lines;
}

function letterTriangles(letter, x, y) {
  const pts = currFont.textToPoints(
    letter,
    x - params.fontSize / 2,
    y,
    params.fontSize,
    { sampleFactor: 0.3 }
  );
  const coords = pts.flatMap((p) => [p.x, p.y]);
  const delaunay = new Delaunator(coords);
  const tris = delaunay.triangles;
  stroke(params.color);
  noFill();
  for (let i = 0; i < tris.length; i += 3) {
    let c = Object.values(colors)[i % 4];
    stroke(params.color);
    fill(c);
    let p1 = pts[tris[i]];
    let p2 = pts[tris[i + 1]];
    let p3 = pts[tris[i + 2]];
    let mouseDist = dist(p1.x, p2.y, mouseX, mouseY);
    if (!params.animate) {
      params.gapDetection = map(
        max(min(mouseDist, params.fontSize * 2), 0),
        0,
        params.fontSize * 2,
        params.fontSize / 3,
        2
      );
    }
    let maxDist = max(
      dist(p1.x, p1.y, p2.x, p2.y),
      dist(p3.x, p3.y, p2.x, p2.y),
      dist(p3.x, p3.y, p1.x, p1.y)
    );
    if (maxDist > params.gapDetection) continue;
    if (mouseDist < 20) {
      fill(params.color);
      strokeWeight(0.5);
    } else {
      strokeWeight(0.1);
      noFill();
    }
    beginShape();
    vertex(p1.x, p1.y);
    vertex(p2.x, p2.y);
    vertex(p3.x, p3.y);
    endShape(CLOSE);
  }
}
