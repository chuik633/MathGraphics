// Creates a shape out of functions
let pane;
const params = {
  // function: "quadratic",
  function: "|x|",
  count: 6,
  offset: 0,
  animateRotation: 0.005,
  animateScale: 0,
  animateOffset: 0.01,

  up: true,
  smoothness: 200,
  scale: 1.5,
  yMax: 100,
  yMin: -100,
  xScale: 1,
};
let currentFn = (x) => 0;
const drawingBoardSize = 0.5;
let latexPreview;
const sideSpace = 200;
let segmentLengths = [];
let totalLength = 0;
let validTex = true;
// supported funtions
function absolute_val(x) {
  return Math.abs(x * params.xScale);
}
function quadratic(x) {
  return (x * params.xScale) ** 2;
}

// setup
function setup() {
  frameRate(200);
  createCanvas(window.innerWidth, window.innerHeight);

  pane = new Tweakpane.Pane({ title: "Parameters", style: { theme: "light" } });

  pane.element.style.position = "fixed";
  pane.element.style.transformOrigin = "top left";
  pane.element.style.top = `${10}px`;
  pane.element.style.left = "10px";

  const tab = pane.addTab({
    pages: [{ title: "Function" }, { title: "Formatting" }],
  });

  tab.pages[1].addInput(params, "count", { min: 1, max: 10, step: 1 });
  tab.pages[1].addInput(params, "offset", { min: 0, max: 50 });
  tab.pages[1].addInput(params, "animateRotation", { min: 0, max: 0.01 });
  tab.pages[1].addInput(params, "animateScale", { min: 0, max: 0.01 });
  tab.pages[1].addInput(params, "animateOffset", { min: 0, max: 0.01 });

  const fn = tab.pages[0].addInput(params, "function");
  const presets = tab.pages[0].addFolder({ title: "Presets" });
  presets.addButton({ title: "quadratic" }).on("click", () => {
    params.function = "x^2";
    fn.refresh();
  });
  presets.addButton({ title: "absolute value" }).on("click", () => {
    params.function = "|x|";
    fn.refresh();
  });
  presets.addButton({ title: "sin" }).on("click", () => {
    params.function = "\\sin(x)";
    fn.refresh();
  });

  tab.pages[0].addInput(params, "up");
  tab.pages[0].addInput(params, "smoothness", { min: 10, max: 600, step: 1 });
  tab.pages[0].addInput(params, "scale", { min: 0.1, max: 5 });
  tab.pages[0].addInput(params, "yMax", { min: 50, max: 300 });
  tab.pages[0].addInput(params, "yMin", { min: -200, max: 0 });
  addLatexPreview(60, 300, fn);
  angleMode(RADIANS);
}

function addLatexPreview(x, y, trigger) {
  latexPreview = document.createElement("div");
  latexPreview.style.position = "fixed";
  latexPreview.style.top = `${y}px`;
  latexPreview.style.left = `${x}px`;

  trigger.on("change", (event) => {
    latexPreview.innerHTML = `\\(${event.value}\\)`;
    if (window.MathJax) {
      MathJax.typesetPromise([latexPreview]);
    }
    let error = document.querySelector("[data-mjx-error]");
    const result = buildFunctionFromTex(params.function);
    validTex = !error && !result.error;
    if (validTex) {
      currentFn = result.fn;
    }
  });

  latexPreview.innerHTML = `\\( f(x) = ${params.function} \\)`;
  if (window.MathJax) {
    MathJax.typesetPromise([latexPreview]);
    const result = buildFunctionFromTex(params.function);
    console.log(result);
    currentFn = result.fn;
  }
  document.body.append(latexPreview);
}

function draw() {
  background("white");

  const centerX = width / 2;
  const centerY = height / 2;

  if (validTex) {
    fullGraph(100, 400 + params.yMax / 2, -50, 50);

    plotAllFunctions(centerX, centerY);
  } else {
    translate(centerX, centerY);
    text("invalid latex", 0, 0);
  }
}

function fullGraph(x, y, min, max) {
  push();
  translate(x, y);

  line(0, -params.yMax, 0, -params.yMin);
  line(-50, 0, 50, 0);
  strokeWeight(0.1);
  for (let i = -50; i < 50; i += 10) {
    line(i, -params.yMax, i, -params.yMin);
  }
  for (let j = -params.yMax; j < -params.yMin; j += 10) {
    line(-50, j, 50, j);
  }
  if (params.up) {
    rotate(PI);
  }
  strokeWeight(1);
  plotFunction(currentFn, min, max);
  stroke("black");
  ellipse(0, 0, 2, 2);

  pop();
}

function plotAllFunctions(centerX, centerY) {
  push();
  translate(centerX, centerY);
  if (params.animateRotation > 0) {
    rotate(frameCount * params.animateRotation);
  }
  if (params.animateOffset > 0) {
    params.offset = 50 * sin(frameCount * params.animateOffset);
  }
  if (params.animateScale > 0) {
    params.scale = 5 * sin(frameCount * params.animateScale);
  }

  if (params.up) {
    rotate(PI);
  } else {
  }

  const dA = (2 * PI) / params.count;

  for (let i = 0; i < params.count; i++) {
    push();
    if (!params.up) {
      translate(0, -params.yMax);
      translate(0, -params.offset);
    } else {
      translate(0, params.offset);
    }

    plotFunction(currentFn, -50, 50);
    pop();
    rotate(dA);
  }
  pop();
}

function plotFunction(fn, min, max) {
  const sf = params.scale;
  const stepSize = Math.abs(max - min) / params.smoothness;
  noFill();
  beginShape();
  let startX = min;
  let endX = max;
  for (let x = min; x < max; x += stepSize) {
    let y = fn(x);

    if (y * sf > params.yMax) {
      if (fn(x + 0.01) < fn(x)) {
        startX = x + stepSize;
        continue;
      } else {
        endX = x - stepSize;
        endShape();
        arrow(fn, startX, fn(startX), true);
        arrow(fn, endX, fn(endX), false);
        return;
      }
    } else if (y * sf < params.yMin) {
      if (fn(x + 0.01) > fn(x)) {
        startX = x + stepSize;
        continue;
      } else {
        endX = x - stepSize;
        endShape();
        arrow(fn, startX, fn(startX), true);
        arrow(fn, endX, fn(endX), false);
        return;
      }
    } else {
      vertex(sf * x, sf * y);
    }
  }
  endShape();
}

function arrow(fn, x, y, flip) {
  //then perpindicular angle to rotate the arrow
  push();
  let angle = derivativeApprox(fn, x);
  let sf = params.scale;
  x = x * sf;
  y = y * sf;
  translate(x, y);
  if (flip) {
    rotate(angle + PI / 2);
  } else {
    rotate(angle - PI / 2);
  }

  stroke("black");
  const size = Math.min(2 * params.scale, 3);
  line(0, 0, size, -size);
  line(0, 0, -size, -size);

  pop();
}

function derivativeApprox(fn, x) {
  let m = (fn(x + 0.1) - fn(x)) / 0.1; //slope
  //now want the angle
  //m = y/x
  let angle = atan(m);
  return angle;
}
