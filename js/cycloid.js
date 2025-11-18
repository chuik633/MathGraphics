// Creates a badge with a shape cycloid
// INPUTS ()
// - a
// - b
// - drawing point (an angle which corresponds to a point on the ellipse)
const drawingBoardSize = 0.5;
const params = {
  a: 10,
  b: 10,
  cornerAmount: 0.3,
  angle: 0,
  speed: 1,
  showLines: true,
  direction: "up",
  color: { r: 255, g: 0, b: 55 },
};
let pane;
const sideSpace = 200;
let segmentLengths = [];
let totalLength = 0;
let track = [
  [sideSpace + 100, 50],
  [sideSpace + 100, window.innerHeight / 2 - 80],
  [window.innerWidth - 100, window.innerHeight / 2 - 80],
  [window.innerWidth - 100, 50],
];
let path = [];
let pathLoops = 0;

let heading = 0;
let userPoints = [];
const numDivisions = 20;

function setup() {
  frameRate(200);
  createCanvas(window.innerWidth, window.innerHeight);
  pane = new Tweakpane.Pane({ title: "Parameters", style: { theme: "light" } });
  pane.element.style.position = "fixed";
  pane.element.style.transformOrigin = "top left";
  pane.element.style.top = `${10}px`;
  pane.element.style.left = "10px";
  pane.element.style.transform = "scale(0.75)";

  pane.addInput(params, "a", { min: 0, max: 20 });
  pane.addInput(params, "b", { min: 0, max: 20 });
  // pane.addInput(params, "cornerAmount", { min: 0, max: 0.4 });
  pane.addInput(params, "angle", { min: 0, max: TWO_PI });
  pane.addInput(params, "speed", { min: 0.5, max: 2 });
  pane.addInput(params, "showLines");
  pane.addInput(params, "color");
  pane.addInput(params, "direction", { options: { up: true, down: false } });
  track = buildRoundedTrack(track, 0.3, numDivisions);
  computeTotalLength(track);
  angleMode(RADIANS);
}

function draw() {
  background("white");
  strokeWeight(0.5);
  makeDrawingBoard();
  drawMouse();
  drawUserPoints();

  // track TO FOLLOW
  if (params.showLines) {
    drawtrack();
  }

  let { a, b, angle, speed, direction } = params;
  let progress = frameCount * speed;
  const { pos, tangent } = progressToPoint(progress);
  const radius = max(a, b);

  push();
  translate(pos[0], pos[1]);

  //rotations
  let rollRot = progress / radius;
  let trackRot = atan2(tangent[1], tangent[0]);
  heading = lerpAngle(heading, trackRot, 0.1);
  let r = rollRot + heading;
  if (direction) {
    r = -r;
  }
  rotate(r);

  // ellipse
  if (params.showLines) {
    noFill();
    stroke("#000000c8");
    strokeWeight(0.5);
    ellipse(0, 0, 2 * a, 2 * b);
  }

  // cycloid point
  const ex = a * cos(angle);
  const ey = b * sin(angle);

  fill(...Object.values(params.color));
  noStroke();
  if (params.showLines) {
    circle(0, 0, 2); //center
    stroke("black");
    line(0, 0, ex, ey);
  }

  circle(ex, ey, 2); //cycloid point

  // if (progress % totalLength < 10) {
  //   path = [];
  // }
  path.push([
    pos[0] + ex * cos(r) - ey * sin(r),
    pos[1] + ex * sin(r) + ey * cos(r),
  ]);

  pop();
  drawPath();

  drawToolTips();
}

function lerpAngle(a, b, t) {
  let diff = ((b - a + PI) % TWO_PI) - PI;
  return a + diff * t;
}

function makeDrawingBoard() {
  fill("black");
  rect(sideSpace, height / 2, width - sideSpace, height / 2);
}
function drawUserPoints() {
  textSize(8);
  textFont("Courier New");
  fill("white");
  stroke("white");

  for (let i = 0; i < userPoints.length - 1; i++) {
    let p0 = userPoints[i];
    let p1 = userPoints[i + 1];
    ellipse(p0[0], p0[1], 2, 2);
    ellipse(p1[0], p1[1], 2, 2);

    text(`(${round(p0[0])},${round(p0[1])})`, p0[0], p0[1]);
    line(p0[0], p0[1], p1[0], p1[1]);
  }
  if (userPoints.length >= 1) {
    let p0 = userPoints[userPoints.length - 1];
    text(`(${round(p0[0])},${round(p0[1])})`, p0[0], p0[1]);
  }
}

function drawToolTips() {
  let { a, b, angle, speed, direction } = params;
  noFill();
  stroke("black");
  line(sideSpace, 0, sideSpace, height);
  const sf = 3;
  a = a * sf;
  b = b * sf;
  const x = sideSpace / 2;
  const y = 250 + b / 2;
  let ex = x + a * cos(angle);
  let ey = y + b * sin(angle);

  ellipse(x, y, a * 2, b * 2);
  ellipse(x, y, 1, 1);
  line(ex, ey, x, y);
  stroke("#CF520D");
  line(x - a, y, x + a, y);

  stroke("#708FA1");
  line(x, y + b, x, y - b);
  noStroke();
  fill("#CF520D");
  text("a", x - a / 2, y - 2);
  fill("#708FA1");
  text("b", x + 1, y - b / 2);

  fill(...Object.values(params.color));
  ellipse(ex, ey, 3, 3);

  textAlign(CENTER);
  textSize(8);

  fill("black");

  text("Cycloid Info", sideSpace / 2, 200);
  text("Press space to clear", (width - sideSpace) / 2 + sideSpace, 20);

  textAlign(LEFT);
  fill("white");
  text("Click here to create a shape ", sideSpace + 10, height / 2 + 20);
  text("Hold - SHIFT - snap to coordinates", sideSpace + 10, height / 2 + 40);

  if (userPoints.length > 1) {
    textAlign(CENTER);
    textSize(sin(frameCount * 0.1) + 9);
    text(
      "Press return to save the shape",
      (width - sideSpace) / 2 + sideSpace,
      height / 2 + 30
    );
  }
}

function mousePressed() {
  if (mouseY > height / 2) {
    if (keyIsDown(SHIFT) && userPoints.length > 0) {
      let prevPoint = userPoints[userPoints.length - 1];
      let distx = Math.abs(mouseX - prevPoint[0]);
      let disty = Math.abs(mouseY - prevPoint[1]);
      if (disty > distx) {
        userPoints.push([prevPoint[0], mouseY]);
      } else {
        userPoints.push([mouseX, prevPoint[1]]);
      }
    } else {
      userPoints.push([mouseX, mouseY]);
    }
  }
}

function keyPressed() {
  if (keyCode == ENTER) {
    saveTrack();
  } else if (keyCode == BACKSPACE) {
    console.log("here");
    if (userPoints.length >= 1) {
      userPoints.pop();
    }
  } else if (keyCode == 32) {
    path = [];
  }
}
function saveTrack() {
  track = [];
  path = [];
  for (let p of userPoints) {
    track.push([p[0], p[1] - height / 2]);
  }
  userPoints = [];
  track = buildRoundedTrack(track, 0.3, numDivisions);
  computeTotalLength(track);
}
function drawMouse() {
  if (mouseY > height / 2) {
    fill("white");
    let x = mouseX;
    let y = mouseY;
    if (keyIsDown(SHIFT) && userPoints.length > 0) {
      let prevPoint = userPoints[userPoints.length - 1];
      let distx = Math.abs(mouseX - prevPoint[0]);
      let disty = Math.abs(mouseY - prevPoint[1]);
      if (disty > distx) {
        x = prevPoint[0];
      } else {
        y = prevPoint[1];
      }
    }
    ellipse(x, y, 10, 10);
    if (userPoints.length >= 1) {
      stroke("white");
      let p = userPoints[userPoints.length - 1];
      line(p[0], p[1], x, y);
    }
  }
}
function drawPath() {
  noStroke();
  fill(...Object.values(params.color));
  // beginShape();
  for (const p of path) {
    ellipse(p[0], p[1], 1, 1);
    // vertex(...p);
  }

  // endShape(CLOSE);
}

function drawtrack() {
  stroke("black");
  noFill();
  beginShape(2);
  for (const p of track) {
    vertex(...p);
  }

  endShape(CLOSE);
}

function computeTotalLength(track) {
  totalLength = 0;
  segmentLengths = [];
  for (let i = 0; i < track.length; i++) {
    const p0 = track[i];
    const p1 = track[(i + 1) % track.length];
    let len = dist(...p0, ...p1);
    segmentLengths.push(len);
    totalLength += len;
  }
}

// get based on the progress value
function progressToPoint(progress) {
  // wrap it
  progress = progress % totalLength;

  let curr = 0;
  for (let i = 0; i < segmentLengths.length; i++) {
    //go through each seg
    let segLength = segmentLengths[i];
    if (progress <= curr + segLength) {
      //if its in this segment
      //how far into this segment are we
      let t = (progress - curr) / segLength;

      //points for this track
      let p0 = track[i];
      let p1 = track[(i + 1) % track.length];

      let x = lerp(p0[0], p1[0], t);
      let y = lerp(p0[1], p1[1], t);
      let pos = [x, y];

      let tx = p1[0] - p0[0];
      let ty = p1[1] - p0[1];
      let mag = Math.hypot(tx, ty);
      let tangent = [tx / mag, ty / mag];
      return { pos, tangent };
    }
    curr += segLength; //move along the end point
  }
}

function buildRoundedTrack(points) {
  let steps = numDivisions;
  let cornerFactor = params.cornerAmount;
  // cornerFactor: 0..0.5 roughly, how far into edges you cut
  // steps: how many samples along each curved corner
  let result = [];
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const pPrev = points[(i - 1 + n) % n];
    const pCurr = points[i];
    const pNext = points[(i + 1) % n];

    //vectors into and out of the corner
    const v1x = pCurr[0] - pPrev[0];
    const v1y = pCurr[1] - pPrev[1];
    const v2x = pNext[0] - pCurr[0];
    const v2y = pNext[1] - pCurr[1];

    const len1 = Math.hypot(v1x, v1y);
    const len2 = Math.hypot(v2x, v2y);
    if (len1 === 0 || len2 === 0) continue;

    const u1x = v1x / len1;
    const u1y = v1y / len1;
    const u2x = v2x / len2;
    const u2y = v2y / len2;

    const cut = Math.min(len1, len2) * cornerFactor;

    //start and end of the rounded corner on each edge
    const sx = pCurr[0] - u1x * cut;
    const sy = pCurr[1] - u1y * cut;
    const ex = pCurr[0] + u2x * cut;
    const ey = pCurr[1] + u2y * cut;

    //pushstart
    result.push([sx, sy]);

    // bezier curve quadratic
    for (let j = 1; j < steps; j++) {
      const t = j / steps;
      const omt = 1 - t;
      const bx = omt * omt * sx + 2 * omt * t * pCurr[0] + t * t * ex;
      const by = omt * omt * sy + 2 * omt * t * pCurr[1] + t * t * ey;
      result.push([bx, by]);
    }
  }

  return result;
}
