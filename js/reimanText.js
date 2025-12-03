let pane;
const width = window.innerWidth;
const height = window.innerHeight;
const padding = 20;

let fonts = {
  Bd: "",
  Bk: "",
  Lt: "",
  Rg: "",
};

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
  black: "#212121",
  yellow: "#EEFFC0",
  blue: "#A5E8FE",
  orange: "#FF5202",
};
let params = {
  color: colors.blue,
  currFont: "",
  text: "Art of Problem Solving",
  fontSize: 100,
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
  params.currFont = "Bk";
}
function setup() {
  createCanvas(width, height);
  pane = new Tweakpane.Pane({ title: "Parameters" });

  pane.element.style.position = "fixed";
  pane.element.style.transformOrigin = "top left";
  pane.element.style.top = `${10}px`;
  pane.element.style.left = "10px";

  pane.addInput(params, "text");
  pane.addInput(params, "fontSize", { min: 50, max: 200 });
  pane.addInput(params, "gapDetection", { min: 5, max: params.fontSize });
  pane.addInput(params, "currFont", {
    options: {
      Black: "Bk",
      Bold: "Bd",
      Regular: "Bk",
      Light: "Lt",
    },
  });
  pane.addInput(params, "animate");
}
function draw() {
  currFont = fonts[params.currFont];
  if (currFont == undefined) {
    return;
  }
  background(colors.black);
  grid();

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
      reimannSumType(letter, x, y);
      x += gap;
      x += textWidth(letter);
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
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  return lines;
}

function grid() {
  stroke(params.color + "28");
  noFill();

  // grid
  for (let x = pos.left; x <= pos.right; x += gridSize) {
    line(x, pos.top, x, pos.bottom);
  }

  for (let y = pos.top; y <= pos.bottom; y += gridSize) {
    line(pos.left, y, pos.right, y);
  }

  //   border of grid
  stroke(params.color);
  rect(pos.left, pos.top, innerWidth, innerHeight);
  fill(params.color);
  const r = 8;
  circle(pos.left, pos.top, r);
  circle(pos.left, pos.bottom, r);
  circle(pos.right, pos.top, r);
  circle(pos.right, pos.bottom, r);
}

function reimannSumType(text, x, y) {
  const xShift = (text.length * params.fontSize) / 2;
  const points = currFont.textToPoints(text, x - xShift, y, params.fontSize, {
    sampleFactor: 0.5,
    simplifyThreshold: 0,
  });

  //   let prevX;
  //   let prevY;
  //   //   for (const point of points) {
  //   //     fill(params.color);
  //   //     ellipse(point.x, point.y, 1);
  //   //     if (prevX && prevY) {
  //   //       line(point.x, point.y, prevX, prevY);
  //   //     }
  //   //     prevX = point.x;
  //   //     prevY = point.y;
  //   //   }
  reimannSum(points);
}
function reimannSum(points) {
  let n = 3;
  const maxN = params.fontSize * 0.7;
  const minX = min(points.map((p) => p.x));
  const maxX = max(points.map((p) => p.x));
  const minY = min(points.map((p) => p.y));
  const maxY = max(points.map((p) => p.y));
  const centerY = minY + (maxY - minY) / 2;
  const centerX = minX + (maxX - minX) / 2;

  if (params.animate) {
    n = map(sin(frameCount * 0.01), -1, 1, 40, 3);
  } else {
    let mouseDist = dist(mouseX, mouseY, centerX, centerY);
    n = Math.max(map(mouseDist, 0, params.fontSize, maxN, 3), 3);
  }

  let dx = params.fontSize / n;
  //   push();
  noFill();
  const slices = getSegments(points, minX, maxX, dx, 3);
  for (const slice of slices) {
    for (const [minY, maxY] of slice.segments) {
      rect(slice.x, minY, dx, Math.abs(maxY - minY));
    }
  }
  //   fill("red");
  //   circle(centerX, centerY, 10);
}
function getVerticalExtents(points, minX, maxX, dx, threshold) {
  const results = [];
  const n = Math.ceil((maxX - minX) / dx);

  for (let i = 0; i < n; i++) {
    const sliceX = minX + i * dx;

    const slicePoints = points.filter(
      (p) => Math.abs(p.x - sliceX) <= threshold
    );

    if (slicePoints.length === 0) {
      results.push({
        x: sliceX,
        minY: null,
        maxY: null,
      });
      continue;
    }

    const ys = slicePoints.map((p) => p.y);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    results.push({
      x: sliceX,
      minY,
      maxY,
    });
  }

  return results;
}

function getSegments(points, minX, maxX, dx, threshold) {
  const results = [];
  const n = Math.ceil((maxX - minX) / dx);

  for (let i = 0; i < n; i++) {
    const sliceX = minX + i * dx;

    const slicePoints = points
      .filter((p) => Math.abs(p.x - sliceX) <= threshold)
      .sort((a, b) => a.y - b.y);

    if (slicePoints.length === 0) {
      results.push({ x: sliceX, segments: [] });
      continue;
    }

    const segments = [];
    let currentSeg = [slicePoints[0].y];

    for (let j = 1; j < slicePoints.length; j++) {
      const prev = slicePoints[j - 1].y;
      const curr = slicePoints[j].y;
      //gap
      if (curr - prev > params.gapDetection) {
        currentSeg.push(prev);
        segments.push(currentSeg);
        currentSeg = [curr];
      }
    }

    currentSeg.push(slicePoints[slicePoints.length - 1].y);
    segments.push(currentSeg);

    results.push({ x: sliceX, segments });
  }

  return results;
}
