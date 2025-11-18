// Creates a shape out of functions
let pane;
const params = {
  smoothness: 500,
  revolutions: 1,
  speed: 0.01,
  terms: [],
  dots: false,
};
let termsFolder;
const sideSpace = 280;
let t = 0;

// setup
//https://www.desmos.com/calculator/whmvadu6co
function setup() {
  frameRate(200);
  createCanvas(window.innerWidth, window.innerHeight);

  pane = new Tweakpane.Pane({ title: "Parameters", style: { theme: "light" } });

  pane.element.style.position = "fixed";
  pane.element.style.transformOrigin = "top left";
  pane.element.style.top = `${10}px`;
  pane.element.style.left = "10px";

  termsFolder = pane.addFolder({ title: "Terms" });
  pane.addButton({ title: "Add term" }).on("click", () => {
    addTerm();
  });

  pane.addInput(params, "smoothness", { min: 100, max: 500, step: 1 });
  pane.addInput(params, "revolutions", { min: 1, max: 5, step: 1 });
  pane.addInput(params, "speed", { min: 0, max: 0.1 });
  pane.addInput(params, "dots", { min: 0.001, max: 0.01 });

  addTerm({ radius: 80, amplitude: 10, freq: 1, fn: "sine" });
  angleMode(RADIANS);
}

function addTerm(vals) {
  const index = params.terms.length;
  let maxR = map(index, 1, 10, 200, 10);
  let maxAmp = map(index, 1, 10, 80, 1);
  if (index >= 1) {
    maxR = params.terms[index - 1].radius;
    maxAmp = params.terms[index - 1].amplitude;
  }

  let term;
  if (vals) {
    term = vals;
  } else {
    term = {
      radius: Math.random() * maxR,
      amplitude: Math.random() * maxAmp,
      freq: 1,
      fn: "sine",
    };
  }

  params.terms.push(term);

  const folder = termsFolder.addFolder({ title: `Term ${index}` });
  folder.addInput(term, "radius", { min: 0, max: maxR });
  folder.addInput(term, "amplitude", {
    min: 0,
    max: maxAmp,
  });
  folder.addInput(term, "freq", { min: 1, max: 20 });
  folder.addInput(term, "fn", { options: { sine: sin, cosine: cos } });
}

function draw() {
  background("white");

  //update theta and t
  let maxAngle = TWO_PI * params.revolutions;
  let prog = (sin((frameCount * params.speed) / params.revolutions) + 1) / 2;
  t = maxAngle * prog;

  const centerX = (width - sideSpace) / 2 + sideSpace;
  const centerY = height / 2;
  drawTerms(centerX, centerY);
  line(sideSpace, 0, sideSpace, height);
}

function drawTerms(x, y) {
  push();
  translate(x, y);

  let stepSize = (2 * PI) / params.smoothness;

  if (!params.dots) {
    noFill();
    stroke("black");
    beginShape();
  } else {
    fill("black");
    noStroke();
  }
  for (let theta = 0; theta < t; theta += stepSize) {
    let r = 0;

    for (let i = 0; i < params.terms.length; i++) {
      r += computeTerm(i, theta);
    }
    if (params.dots) {
      ellipse(r * cos(theta), r * sin(theta), 1, 1);
    } else {
      vertex(r * cos(theta), r * sin(theta));
    }
  }
  if (!params.dots) {
    endShape();
  }

  pop();
}

function computeTerm(termIndex, theta) {
  if (termIndex >= params.terms.length) {
    return;
  }
  let term = params.terms[termIndex];

  let r = term.radius + term.fn((theta / term.freq) * t) * term.amplitude;

  return r;
}
