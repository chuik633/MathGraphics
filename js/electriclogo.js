// Creates a shape out of functions
let pane;
const params = {
  complexity: 1,
  divisions: 8,
  fontSize: 100,
  weight: 1,
};

let a_angle = (23.5 / 360) * Math.PI * 2;
const sideSpace = 200;
const letterPaths = {
  S: " M155.77 84.1503C152.776 66.8994 137.549 32.3976 100.595 32.3976C80.0652 29.5462 38.2351 34.9639 35.1556 79.4458C34.7279 92.5624 42.1702 119.48 75.3606 122.217C96.7458 122.217 135.797 120.729 147.643 141.036C157.623 158.145 165.351 196.297 116.42 212.036C93.8003 217.882 44.9956 216.912 30.7373 166.271",
  O: "M116.224 0.5C121.347 0.500003 126.392 0.833251 131.339 1.47852L131.402 0.983398C141.652 2.32033 151.482 4.99369 160.712 8.82129L160.521 9.28125C169.928 13.1825 178.711 18.2888 186.674 24.4082L186.978 24.0117C195.029 30.199 202.247 37.4171 208.435 45.4688L208.039 45.7734C214.158 53.7366 219.265 62.5183 223.166 71.9258L223.625 71.7344C227.453 80.9645 230.126 90.794 231.463 101.044L230.969 101.108C231.614 106.055 231.947 111.1 231.947 116.224C231.947 121.347 231.614 126.392 230.969 131.339L231.463 131.402C230.126 141.652 227.453 151.482 223.625 160.712L223.166 160.521C219.265 169.928 214.158 178.711 208.039 186.674L208.435 186.978C202.247 195.029 195.029 202.247 186.978 208.435L186.674 208.039C178.711 214.158 169.928 219.265 160.521 223.166L160.712 223.625C151.482 227.453 141.652 230.126 131.402 231.463L131.339 230.969C126.392 231.614 121.347 231.947 116.224 231.947C111.1 231.947 106.055 231.614 101.108 230.969L101.044 231.463C90.794 230.126 80.9645 227.453 71.7344 223.625L71.9258 223.166C62.5183 219.265 53.7366 214.158 45.7734 208.039L45.4688 208.435C37.4171 202.247 30.199 195.029 24.0117 186.978L24.4082 186.674C18.2888 178.711 13.1825 169.928 9.28125 160.521L8.82129 160.712C4.99369 151.482 2.32033 141.652 0.983398 131.402L1.47852 131.339C0.873592 126.701 0.542855 121.977 0.503906 117.184L0.5 116.224C0.5 111.1 0.833248 106.055 1.47852 101.108L0.983398 101.044C2.3204 90.794 4.99363 80.9645 8.82129 71.7344L9.28125 71.9258C13.1824 62.5182 18.2889 53.7366 24.4082 45.7734L24.0117 45.4688C30.199 37.4172 37.4172 30.199 45.4688 24.0117L45.7734 24.4082C53.7366 18.2889 62.5182 13.1824 71.9258 9.28125L71.7344 8.82129C80.9645 4.99363 90.794 2.3204 101.044 0.983398L101.108 1.47852C106.055 0.833248 111.1 0.5 116.224 0.5Z",
  P: "M0.5 0.5L0.49999 232.947M0.5 0.5L0.50001 130.526H93.2275V130.496C128.242 129.477 156.313 100.774 156.313 65.5127C156.313 30.2518 128.242 1.54872 93.2275 0.529297V0.5H0.5Z",
};

// setup
function setup() {
  frameRate(200);
  createCanvas(window.innerWidth, window.innerHeight);

  pane = new Tweakpane.Pane({ title: "Parameters", style: { theme: "light" } });

  pane.element.style.position = "fixed";
  pane.element.style.transformOrigin = "top left";
  pane.element.style.top = `${10}px`;
  pane.element.style.left = "10px";
  pane.addInput(params, "complexity", { min: 1, max: 3, step: 1 });
  pane.addInput(params, "divisions", { min: 8, max: 10 });
  pane.addInput(params, "fontSize", { min: 50, max: width / 2, step: 1 });
  pane.addInput(params, "weight", { min: 0.1, max: 5 });

  angleMode(RADIANS);
}

function draw() {
  background("black");

  const centerX = width / 2;
  const centerY = height / 2;
  strokeWeight(params.weight);
  strokeCap(SQUARE);
  stroke("white");
  A(centerX - params.fontSize, centerY);

  drawPathSpokesRotated(
    letterPaths["O"],
    centerX + params.fontSize / 2,
    centerY,
    map(params.divisions, 8, 10, 20, 50),
    params.weight * 2,
    params.fontSize * 0.45,
    params.fontSize,
    "outside"
  );
  drawPathSpokesRotated(
    letterPaths["P"],
    centerX + params.fontSize * 2,
    centerY,
    map(params.divisions, 8, 10, 20, 50),
    params.weight * 2,
    params.fontSize * 0.25,
    params.fontSize,
    "middle"
  );
  drawPathSpokesRotated(
    letterPaths["S"],
    centerX + params.fontSize * 3,
    centerY,
    map(params.divisions, 8, 10, 20, 50),
    params.weight * 2,
    params.fontSize * 0.25,
    params.fontSize,
    "middle"
  );
}

function A(x, y) {
  //right lights
  //thickness top:
  let topW = params.fontSize / 2;
  let topX = x;
  let topY = y - params.fontSize / 2;
  let endY = y + params.fontSize / 2;
  let divisions = Math.floor(map(params.divisions, 8, 10, 1, 4));
  let r = params.fontSize / cos(a_angle);
  let dx = tan(a_angle) * params.fontSize;
  for (let i = 0; i <= divisions; i++) {
    let x1 = topX + (i * topW) / divisions;
    let x2 = x1 + dx;

    line(x1, topY, x2, endY);
  }
  for (let i = 0; i <= divisions; i++) {
    let x1 = topX + (i * topW) / divisions;
    let x2 = x1 - dx;
    let endP = lineIntersection(
      x1,
      topY,
      x2,
      endY,
      topX,
      topY,
      topX + dx,
      endY
    );
    line(endP.x, endP.y, x2, endY);
  }
}

function O(x, y) {
  let r = params.fontSize / 2;
  let r2 = 10;
  stroke("white");
  noFill();

  if (params.complexity == 1) {
    let divisions = params.divisions;
    for (let i = 0; i < divisions; i++) {
      let theta = (i / divisions) * TWO_PI;
      let x1 = x + r2 * cos(theta);
      let y1 = y + r2 * sin(theta);
      let x2 = x + r * cos(theta);
      let y2 = y + r * sin(theta);
      line(x1, y1, x2, y2);
    }
  } else {
    fill("white");
    circle(x, y, params.fontSize);
    fill("black");
    circle(x, y, r2 * 2);
  }
}

function P(x, y) {}

function S(x, y) {}

function lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (denom === 0) return null; // parallel lines

  const xi =
    ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
  const yi =
    ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

  return createVector(xi, yi);
}

function drawPathSpokesTapered(
  pathData,
  x,
  y,
  count,
  thickness,
  height,
  fontSize,
  anchor
) {
  // create path element from d string
  const svgNS = "http://www.w3.org/2000/svg";
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", pathData);

  // total arc length of the path
  const total = path.getTotalLength();

  // measure raw bounding box along the path
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  const samples = 400;
  for (let i = 0; i <= samples; i++) {
    const p = path.getPointAtLength((i / samples) * total);
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  // scale so total height of path equals fontSize
  const naturalHeight = maxY - minY || 1;
  const scale = fontSize / naturalHeight;

  // center of scaled bounding box
  const cx0 = ((minX + maxX) / 2) * scale;
  const cy0 = ((minY + maxY) / 2) * scale;

  // choose anchor offset along the normal
  // outside = 0, middle = 0.5, inside = 1
  let anchorFactor = 0;
  if (anchor === "middle") anchorFactor = 0.5;
  else if (anchor === "inside") anchorFactor = 1;

  const EPS = 0.002;

  // helper: wrap length safely for closed paths
  function wrapLen(s) {
    if (s < 0) return s + total;
    if (s > total) return s - total;
    return s;
  }

  let prevNx = null;
  let prevNy = null;

  push();
  translate(x, y);

  for (let i = 1; i < count; i++) {
    // position along path
    const t = i / count;
    const pos = t * total;
    const d = total / (count * 20);

    // three nearby samples: center, before, after
    const p = path.getPointAtLength(pos);
    const pPrev = path.getPointAtLength(wrapLen(pos - d));
    const pNext = path.getPointAtLength(wrapLen(pos + d));

    // scale + center coordinates
    const px = p.x * scale - cx0;
    const py = p.y * scale - cy0;
    const pPrevx = pPrev.x * scale - cx0;
    const pPrevy = pPrev.y * scale - cy0;
    const pNextx = pNext.x * scale - cx0;
    const pNexty = pNext.y * scale - cy0;

    // directional differences
    let tx1 = px - pPrevx;
    let ty1 = py - pPrevy;
    let tx2 = pNextx - px;
    let ty2 = pNexty - py;

    // normalize tangent samples with epsilon
    const len1 = Math.max(Math.hypot(tx1, ty1), EPS);
    const len2 = Math.max(Math.hypot(tx2, ty2), EPS);
    tx1 /= len1;
    ty1 /= len1;
    tx2 /= len2;
    ty2 /= len2;
    const noFlips = true;

    // curvature normal from change in tangent
    let nx = tx2 - tx1;
    let ny = ty2 - ty1;

    const nLen = Math.max(Math.hypot(nx, ny), EPS);

    nx /= nLen;
    ny /= nLen;

    // detect normal flips vs previous sample
    if (prevNx !== null) {
      const dot = nx * prevNx + ny * prevNy;
      if (dot < 0) {
        if (noFlips) {
          nx = -nx;
          ny = -ny;
        }
        push();
        fill(255, 0, 255);
        noStroke();
        ellipse(px, py, 10, 10);
        fill(255, 0, 255);
        textSize(10);
        text("flip", px + 6, py - 6);
        pop();
      }
    }
    prevNx = nx;
    prevNy = ny;

    // unit tangent perpendicular to normal
    const tx = -ny;
    const ty = nx;

    // thick / thin widths
    const thickHalf = thickness;
    const thinHalf = 0.001;

    // base position along normal depending on anchor
    const baseX = px - nx * anchorFactor * height;
    const baseY = py - ny * anchorFactor * height;

    // thick side (on path / outside)
    const cxThick = baseX;
    const cyThick = baseY;

    // thin side (further along the normal)
    const cxThin = baseX + nx * height;
    const cyThin = baseY + ny * height;

    // four vertices of tapered quad
    const xThick1 = cxThick - tx * thickHalf;
    const yThick1 = cyThick - ty * thickHalf;
    const xThick2 = cxThick + tx * thickHalf;
    const yThick2 = cyThick + ty * thickHalf;

    const xThin1 = cxThin - tx * thinHalf;
    const yThin1 = cyThin - ty * thinHalf;
    const xThin2 = cxThin + tx * thinHalf;
    const yThin2 = cyThin + ty * thinHalf;

    // draw tapered spoke
    beginShape();
    vertex(xThick1, yThick1);
    vertex(xThick2, yThick2);
    vertex(xThin2, yThin2);
    vertex(xThin1, yThin1);
    endShape(CLOSE);

    // debug: show tangent components
    const slopeDen = Math.abs(tx) < EPS ? (tx >= 0 ? EPS : -EPS) : tx;
    const slope = ty / slopeDen;

    push();
    stroke(255, 0, 0);
    fill(255, 0, 0);
    strokeWeight(3);
    point(px, py);
    noStroke();
    textSize(10);
    // text(tx.toFixed(2) + ":" + ty.toFixed(2), px + 4, py - 4);
    pop();
  }

  pop();
}
function drawPathSpokesRotated(
  pathData,
  x,
  y,
  count,
  thickness,
  height,
  fontSize,
  anchor // "outside" | "middle" | "inside"
) {
  // create path element from d string
  const svgNS = "http://www.w3.org/2000/svg";
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", pathData);

  // total arc length of the path
  const total = path.getTotalLength();
  // thickness = min(total / (count * thickness * 2), thickness);

  // measure raw bounding box along the path
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;
  const samples = 400;
  for (let i = 0; i <= samples; i++) {
    const p = path.getPointAtLength((i / samples) * total);
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const naturalHeight = maxY - minY || 1;
  const scale = fontSize / naturalHeight;

  // center of scaled bounding box
  const cx0 = ((minX + maxX) / 2) * scale;
  const cy0 = ((minY + maxY) / 2) * scale;

  // anchor along spoke: outside=base, middle=center, inside=tip
  let yOffset = 0;
  if (anchor === "middle") yOffset = -height / 2;
  else if (anchor === "inside") yOffset = -height;

  const thickHalf = thickness;
  const thinHalf = thickness / 5;

  const EPS = 1e-4;

  let prevDx = null;
  let prevDy = null;

  push();
  translate(x, y);

  for (let i = 0; i < count; i++) {
    // position along path
    const t = (i + 0.5) / count;
    const pos = t * total;

    // central step for tangent
    const d = Math.max(total / (count * 4), 0.05);

    const p = path.getPointAtLength(pos);
    const pPrev = path.getPointAtLength(Math.max(0, pos - d));
    const pNext = path.getPointAtLength(Math.min(total, pos + d));

    // position on canvas (scaled + centered)
    const px = p.x * scale - cx0;
    const py = p.y * scale - cy0;

    // tangent from central difference (unscaled)
    let dx = pNext.x - pPrev.x;
    let dy = pNext.y - pPrev.y;
    const len = Math.max(Math.hypot(dx, dy), EPS);
    dx /= len;
    dy /= len;

    // flip based on changing slope
    if (prevDx !== null) {
      const dot = dx * prevDx + dy * prevDy;
      if (dot < 0) {
        dx = -dx;
        dy = -dy;
      }
    }
    prevDx = dx;
    prevDy = dy;

    // normal angle
    let angle = Math.atan2(dy, dx) + Math.PI / 2;

    angle -= Math.PI / 2;
    // local trapezoid vertices
    const yBase = yOffset;
    const yTip = yOffset + height;

    const v0 = [-thickHalf, yBase];
    const v1 = [thickHalf, yBase];
    const v2 = [thinHalf, yTip];
    const v3 = [-thinHalf, yTip];

    // draw rotated trapezoid
    noStroke();
    push();
    translate(px, py);
    rotate(angle);
    beginShape();
    vertex(v0[0], v0[1]);
    vertex(v1[0], v1[1]);
    vertex(v2[0], v2[1]);
    vertex(v3[0], v3[1]);
    endShape(CLOSE);
    pop();
  }

  pop();
}
