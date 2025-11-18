// Creates a shape out of functions
let pane;
const params = {
  smoothness: 200,
  revolutions: 1,
  speed: 0.01,
  radius: 50,
  terms: [],
  dots: true,
  showAnnotations: false,
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

  pane.element.style.transform = "scale(0.8)";

  termsFolder = pane.addFolder({ title: "Terms" });
  let addBtn = pane.addButton({ title: "Add term" }).on("click", () => {
    addTerm();
    handleLatexChange();
  });

  pane.addInput(params, "smoothness", { min: 100, max: 500, step: 1 });
  pane.addInput(params, "revolutions", { min: 1, max: 5, step: 1 });
  pane.addInput(params, "radius", {
    min: 1,
    max: (window.innerWidth - sideSpace) / 2,
  });
  pane.addInput(params, "speed", { min: 0, max: 0.1 });
  pane.addInput(params, "dots");
  pane.addInput(params, "showAnnotations");

  addTerm({ amplitude: 10, freq: 2, fn: "sin" });

  addLatexPreview(10, height - 50, termsFolder);
  handleLatexChange();

  angleMode(RADIANS);
}

function addTerm(vals) {
  let index = params.terms.length;
  let maxAmp = map(index, 1, 10, 80, 1);
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
  if (params.showAnnotations) {
    fill("black");
    ellipse(0, 0, 2, 2);
  }
  if (!params.dots) {
    noFill();
    stroke("black");
    beginShape();
  } else {
    fill("black");
    noStroke();
  }
  let theta;

  for (theta = 0; theta < t; theta += stepSize) {
    let r = params.radius;
    for (let i = 0; i < params.terms.length; i++) {
      r += computeTerm(i, theta);
    }
    if (params.dots) {
      ellipse(r * cos(theta), r * sin(theta), 1, 1);
    } else {
      vertex(r * cos(theta), r * sin(theta));
    }
    if (params.showAnnotations) {
      push();
      if (theta + stepSize >= t) {
        strokeWeight(1);
        stroke("#FF3701");
        push();
        translate((r / 2) * cos(theta), (r / 2) * sin(theta));
        rotate(theta + PI);
        noStroke();
        fill("#FF3701");
        text("r", 0, 0);

        pop();
      } else {
        strokeWeight(0.5);
        stroke("black");
      }

      line(0, 0, r * cos(theta), r * sin(theta));
      pop();
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

  if (term.fn == "sin") {
    return Math.sin((theta / term.freq) * t) * term.amplitude;
  } else {
    return Math.cos((theta / term.freq) * t) * term.amplitude;
  }
}

function getTermsString() {
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
  return equation;
}
function addLatexPreview(x, y, termsFolder) {
  latexPreview = document.createElement("div");
  latexPreview.style.position = "fixed";
  latexPreview.style.top = `${y}px`;
  latexPreview.style.left = `${x}px`;

  //get the latex text:

  termsFolder.on("change", (event) => {
    handleLatexChange();
  });

  document.body.append(latexPreview);
}

function handleLatexChange() {
  latexPreview.innerHTML = `\\(${getTermsString()}\\)`;
  if (window.MathJax) {
    MathJax.typesetPromise([latexPreview]);
  }
  let error = document.querySelector("[data-mjx-error]");
}
