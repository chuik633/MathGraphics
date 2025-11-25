// Creates a shape out of functions
let pane;
const params = {
  smoothness: 200,
  revolutions: 4,
  speed: 0.02,
  radius: 80,
  color: "#6D92FF",
  bgColor: "#1C1C1D",
  annotationColor: "#FFF5E4",
  terms: [],
  dots: false,
  showAnnotations: true,
  showFill: false,
};
let termsFolder;
const sideSpace = 280;
let t = 0;
let shapes = [];

const colors = {
  brown: "#AF6D51",
  pink: "#FF7EFF",
  yellow: "#FFDD26",
  white: "#FFF5E4",
  blue: "#6D92FF",
  black: "#1C1C1D",
  red: "#FF3701",
  clear: "#000000000",
};

// setup
//https://www.desmos.com/calculator/whmvadu6co
function setup() {
  frameRate(200);
  createCanvas(window.innerWidth, window.innerHeight);

  showPane();

  addLatexPreview(10, height - 50, termsFolder);
  handleLatexChange();

  angleMode(RADIANS);
  document.getElementById("generateBtn").addEventListener("click", () => {
    randomizeSettings((window.innerWidth - sideSpace) / 4);
    randomizeTerms();
    shapes = [];
    let count = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < count; i++) {
      addRandomShape();
    }
    rebuildTermsUI();
    handleLatexChange();
  });
}

function showPane() {
  pane = new Tweakpane.Pane({
    title: "Parameters",
    style: { theme: "light" },
  });

  pane.element.style.position = "fixed";
  pane.element.style.transformOrigin = "top left";
  pane.element.style.top = `${10}px`;
  pane.element.style.left = "10px";
  pane.element.style.transform = "scale(0.8)";

  // PAGES
  const tab = pane.addTab({
    pages: [{ title: "polar function" }, { title: "Animation" }],
  });

  let polarPage = tab.pages[0];
  let animationPage = tab.pages[1];

  // POLAR INPUTS
  termsFolder = polarPage.addFolder({ title: "Terms" });
  let addBtn = polarPage.addButton({ title: "Add term" }).on("click", () => {
    addTerm();
    handleLatexChange();
  });

  polarPage.addInput(params, "smoothness", { min: 100, max: 500, step: 1 });
  animationPage.addInput(params, "revolutions", { min: 1, max: 10, step: 1 });
  animationPage.addInput(params, "radius", {
    min: 1,
    max: (window.innerWidth - sideSpace) / 2,
  });
  animationPage.addInput(params, "speed", { min: 0, max: 0.1 });
  pane.addInput(params, "dots");
  polarPage.addInput(params, "showAnnotations");
  polarPage.addInput(params, "showFill");

  addTerm({ amplitude: 10, freq: 2, fn: "sin" });
}

function addTerm(vals) {
  let index = params.terms.length;
  let maxAmp = 20;
  if (index >= 1) {
    maxAmp = params.terms[index - 1].amplitude;
  }

  let term;
  if (vals) {
    term = vals;
  } else {
    term = {
      amplitude: Math.random() * maxAmp,
      freq: 1,
      fn: ["sin", "cos"][Math.round(Math.random())],
    };
  }

  params.terms.push(term);

  const folder = termsFolder.addFolder({ title: `Term ${index}` });

  folder.addInput(term, "amplitude", {
    min: 0,
    max: maxAmp,
  });
  folder.addInput(term, "freq", { min: 1, max: 20 });
  folder.addInput(term, "fn", { options: { sin: "sin", cos: "cos" } });
}

function randomColor() {
  const keys = Object.keys(colors);
  return colors[keys[Math.floor(Math.random() * keys.length)]];
}

function makeRandomTerms() {
  const arr = [];
  for (let i = 0; i < 3; i++) {
    arr.push({
      amplitude: Math.random() * 20 + 5,
      freq: Math.floor(Math.random() * 10) + 1,
      fn: Math.random() < 0.5 ? "sin" : "cos",
    });
  }
  return arr;
}

function makeRandomParams(maxRadius) {
  return {
    smoothness: Math.floor(Math.random() * 300) + 150,
    revolutions: Math.floor(Math.random() * 4) + 1,
    speed: Math.random() * 0.05,
    radius: Math.floor((Math.random() * maxRadius) / 2) + maxRadius / 2,
    color: randomColor(),
    bgColor: params.bgColor,
    annotationColor: randomColor(),
    dots: false,
    showFill: Math.random() < 0.5,
    showAnnotations: Math.random() < 0.8,
    terms: makeRandomTerms(),
  };
}

function addRandomShape() {
  let maxRadius = 200;
  if (shapes.length > 0) {
    maxRadius = shapes[shapes.length - 1].radius - 10;
    if (maxRadius < 20) maxRadius = 20;
  }
  const newShape = makeRandomParams(maxRadius);
  shapes.push(newShape);
}

function draw() {
  background(colors.black);
  fill(params.bgColor);
  rect(sideSpace, 0, width - sideSpace, height);
  let maxAngle = TWO_PI * params.revolutions;
  let prog = (sin((frameCount * params.speed) / params.revolutions) + 1) / 2;
  t = maxAngle * prog;
  const centerX = (width - sideSpace) / 2 + sideSpace;
  const centerY = height / 2;
  drawTerms(centerX, centerY);
  for (let s of shapes) {
    drawTermsForShape(centerX, centerY, s);
  }
  line(sideSpace, 0, sideSpace, height);
}

function drawTerms(x, y) {
  drawTermsForShape(x, y, params);
}
function drawTermsForShape(x, y, p) {
  push();
  translate(x, y);
  let stepSize = (2 * PI) / p.smoothness;
  if (p.showAnnotations) {
    fill(p.annotationColor);
    ellipse(0, 0, 2, 2);
  }
  if (!p.dots) {
    noFill();
    stroke(p.color);
    beginShape();
  } else {
    fill(p.color);
    noStroke();
  }
  let theta;
  for (theta = 0; theta < t; theta += stepSize) {
    let r = p.radius;
    if (p.speed > 0) {
      r = p.radius + (sin(frameCount * p.speed) * p.radius) / 2;
    }
    for (let i = 0; i < p.terms.length; i++) {
      let term = p.terms[i];
      if (term.fn == "sin") {
        r += Math.sin((theta / term.freq) * t) * term.amplitude;
      } else {
        r += Math.cos((theta / term.freq) * t) * term.amplitude;
      }
    }
    if (p.dots) {
      ellipse(r * cos(theta), r * sin(theta), 1, 1);
    } else {
      vertex(r * cos(theta), r * sin(theta));
    }
  }
  if (!p.dots) {
    if (p.showFill) {
      fill(p.color);
      vertex(0, 0);
      endShape(CLOSE);
    } else {
      endShape();
    }
  }
  pop();
}

function computeTerm(termIndex, theta) {
  if (termIndex >= params.terms.length) {
    return;
  }
  let term = params.terms[termIndex];

  if (term.fn == "sin") {
    return Math.sin((theta / term.freq) * t) * term.amplitude;
  } else {
    return Math.cos((theta / term.freq) * t) * term.amplitude;
  }
}

// lAtex stuff
function getTermsString() {
  console.log(params.terms);
  let equation = `r = `;
  let i = 0;
  for (const term of params.terms) {
    i++;

    if (i <= params.terms.length && i > 1) {
      equation += "+";
    }
    let amp = Math.floor(term.amplitude);

    let freq = Math.floor(term.freq);

    if (term.fn == "sin") {
      if (term.freq != 1) {
        equation += String.raw` ${amp}\sin\left(\frac{\theta}{ ${freq} }\, t\right) `;
      } else {
        equation += String.raw` ${amp}\sin\left(\theta\, t\right) `;
      }
    } else {
      if (term.freq != 1) {
        equation += String.raw` ${amp}\cos\left(\frac{\theta}{ ${freq}}\, t\right) `;
      } else {
        equation += String.raw` ${amp}\cos\left(\theta\, t\right) `;
      }
    }
  }

  console.log("EQUATION", equation);
  return equation;
}
let latexPreview;
function addLatexPreview(x, y, termsFolder) {
  latexPreview = document.createElement("div");
  latexPreview.style.position = "fixed";
  latexPreview.style.top = `${y}px`;
  latexPreview.style.left = `50%`;

  //get the latex text:

  termsFolder.on("change", (event) => {
    handleLatexChange();
  });

  document.body.append(latexPreview);
}

function handleLatexChange() {
  console.log("Handling change");
  latexPreview.innerHTML = `\\(${getTermsString()}\\)`;
  if (window.MathJax) {
    MathJax.typesetPromise([latexPreview]);
  }
  let error = document.querySelector("[data-mjx-error]");
}

function randomizeSettings(maxRadius) {
  const colorKeys = Object.keys(colors);

  let idx1 = Math.floor(Math.random() * colorKeys.length);
  let idx2 = Math.floor(Math.random() * colorKeys.length);
  let tries = 0;
  while (idx2 == idx1 || tries < 10) {
    idx2 = Math.floor(Math.random() * colorKeys.length);
    tries++;
  }
  params.color = colors[colorKeys[idx1]];
  params.annotationColor =
    colors[colorKeys[Math.floor(Math.random() * colorKeys.length)]];
  params.bgColor = colors[colorKeys[idx2]];

  params.radius = Math.floor(Math.random() * maxRadius) + maxRadius / 2;
  params.revolutions = Math.floor(Math.random() * 4) + 4;
  params.speed = Math.random() * 0.05;
  params.smoothness = Math.floor(Math.random() * 300) + 150;

  params.dots = false;
  params.showFill = Math.random() < 0.5;
  params.showAnnotations = Math.random() < 0.8;
}

function randomizeTerms() {
  params.terms = [];
  for (let i = 0; i < 3; i++) {
    params.terms.push({
      amplitude: Math.random() * 20 + 5,
      freq: Math.floor(Math.random() * 10) + 1,
      fn: Math.random() < 0.5 ? "sin" : "cos",
    });
  }
}
function rebuildTermsUI() {
  termsFolder.children.forEach((child) => {
    if (child.dispose) child.dispose();
  });

  params.terms.forEach((term, i) => {
    const folder = termsFolder.addFolder({ title: `Term ${i}` });
    folder.addInput(term, "amplitude", { min: 0, max: 25 });
    folder.addInput(term, "freq", { min: 1, max: 20 });
    folder.addInput(term, "fn", { options: { sin: "sin", cos: "cos" } });
  });
}
