const imgLink = "./assets/testimage.png";
let img;
let mX, mY;
let pane;
const REVEAL_TIME = 500;
const MAX_LEVEL = 4;
const params = {
  gridSize: 10,
};

function preload() {
  img = loadImage(imgLink);
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  pane = new Tweakpane.Pane({
    title: "Parameters",
    style: { theme: "light" },
  });

  pane.element.style.position = "fixed";
  pane.element.style.transformOrigin = "top left";
  pane.element.style.top = `${10}px`;
  pane.element.style.right = "10px";

  pane
    .addInput(params, "gridSize", { min: 5, max: 80, step: 1 })
    .on("change", () => {
      makeGrid(params.gridSize, params.gridSize);
    });
  //place the image
  let aspect = img.width / img.height;

  img.loadPixels();

  makeGrid(30, 30);
}
function draw() {
  let aspect = img.width / img.height;
  image(img, 0, 0, height * aspect, height);
  updateShapeAnimations();
  drawGrid();
  // drawShapes();
  drawMouse();
}

let grid = [];
let w, h;
function updateShapeAnimations() {
  const now = millis();
  for (const s of shapes) {
    if (s.animStart < 0) continue;
    const t = (now - s.animStart) / REVEAL_TIME;
    if (t >= 1) {
      s.level = s.levelTo;
      s.animStart = -1;
    } else {
      s.level = s.levelFrom + (s.levelTo - s.levelFrom) * t;
    }
  }
}

function makeGrid(rows, cols) {
  grid = [];

  w = max(width / cols, height / rows);
  h = w;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      grid.push({
        x: w * j,
        y: h * i,
        w: w,
        h: h,
        visible: true,
        level: 0,
      });
    }
  }
}

function drawGrid() {
  const aspect = img.width / img.height;
  const imgW = height * aspect;
  const imgH = height;

  stroke("#C4C4C4");
  strokeWeight(0.5);

  for (const s of grid) {
    const cx = s.x + s.w / 2;
    const cy = s.y + s.h / 2;

    let shape = null;
    for (const sh of shapes) {
      if (pointInPoly({ x: cx, y: cy }, sh.points)) {
        shape = sh;
        break;
      }
    }

    if (!shape) {
      fill("#D9D9D9");
      rect(s.x, s.y, s.w, s.h);
      continue;
    }

    const level = constrain(shape.level, 0, MAX_LEVEL);
    const sub = max(1, floor(pow(2, level)));
    const subW = s.w / sub;
    const subH = s.h / sub;

    noStroke();
    for (let iy = 0; iy < sub; iy++) {
      for (let ix = 0; ix < sub; ix++) {
        const px = s.x + (ix + 0.5) * subW;
        const py = s.y + (iy + 0.5) * subH;

        if (px < 0 || px > imgW || py < 0 || py > imgH) {
          fill("#D9D9D9");
        } else {
          const u = (px / imgW) * img.width;
          const v = (py / imgH) * img.height;
          const c = getQuick(img, floor(u), floor(v));
          fill(c[0], c[1], c[2]);
        }

        rect(s.x + ix * subW, s.y + iy * subH, subW, subH);
      }
    }

    stroke("#C4C4C4");
    noFill();
    rect(s.x, s.y, s.w, s.h);
  }
}

// function mousePressed() {
//   const click = { x: mouseX, y: mouseY };
//   for (const s of shapes) {
//     if (pointInPoly(click, s.points)) {
//       const current = s.animStart < 0 ? s.levelTo || s.level : s.levelTo;
//       const next = min(current + 1, MAX_LEVEL);
//       s.levelFrom = current;
//       s.levelTo = next;
//       s.animStart = millis();
//     }
//   }
// }

let points = [];
let pointsStrings = [];
let shapes = [];
function keyPressed() {
  if (key == ENTER) {
    closeShape();
  }
}
function closeShape() {
  if (points.length < 3) return;
  shapes.push({
    points: points.slice(),
    level: 0,
    animStart: -1,
    levelFrom: 0,
    levelTo: 0,
  });
  let s = shapes[shapes.length - 1];
  const current = s.animStart < 0 ? s.levelTo || s.level : s.levelTo;
  const next = min(current + 1, MAX_LEVEL);
  s.levelFrom = current;
  s.levelTo = MAX_LEVEL;
  s.animStart = millis();
  points = [];
  pointsStrings = [];
}

function drawShapes() {
  if (shapes.length == 0) {
    return;
  }
  push();
  //   background("black");
  stroke("black");
  for (const points of shapes) {
    beginShape();
    for (let i = 0; i < points.length - 1; i++) {
      vertex(points[i].x, points[i].y);
      //    line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    }
    endShape(CLOSE);
  }
  pop();
}
//drawCharacter
function drawMouse() {
  mX = Math.round(mouseX / w) * w;
  mY = Math.round(mouseY / h) * h;
  fill("black");
  if (mX - mouseX > mY - mouseY) {
    //closer to the x side so draw it snapping to that
    ellipse(mX, mouseY, 10, 10);
  } else {
    ellipse(mouseX, mY, 10, 10);
  }

  let p = { x: mX, y: mY };
  let pString = `${p.x},${p.y}`;
  if (pointsStrings[points.length - 1] != pString) {
    if (pointsStrings.includes(pString)) {
      closeShape();
    }
    points.push(p);
    pointsStrings.push(pString);
  }

  stroke("black");

  if (points.length > 0) {
    for (let i = 0; i < points.length - 1; i++) {
      ellipse(points[i].x, points[i].y, 2, 2);
      line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    }
    line(
      points[points.length - 1].x,
      points[points.length - 1].y,
      mouseX,
      mouseY
    );
  }
}

function imageProcess() {
  const stepSize = 3;
  for (let y = 0; y < img.height; y += stepSize) {
    for (let x = 0; x < img.width; x += stepSize) {
      const inputColor = getQuick(img, x, y);
      fill(inputColor[0], inputColor[1], inputColor[2], inputColor[3]);
      noStroke();
      const radius = 100;
      ellipse(x, y, radius, radius);
    }
  }
}

//now read the pixel information
function getQuick(img, x, y) {
  const i = (y * img.width + x) * 4;
  return [
    img.pixels[i],
    img.pixels[i + 1],
    img.pixels[i + 2],
    img.pixels[i + 3],
  ];
}
function pointInPoly(pt, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x,
      yi = poly[i].y;
    const xj = poly[j].x,
      yj = poly[j].y;
    const intersect =
      yi > pt.y !== yj > pt.y &&
      pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi + 0.00001) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
