const sketch1 = (p) => {
  const width = window.innerWidth;
  const height = (window.innerWidth / 1920) * 1080;
  // Creates a shape out of functions
  let pane;
  const params = {
    smoothness: 200,
    minRevolutions: 1,
    revolutions: 6,
    speed: 0.02,
    radius: height / 2 - 50,
    terms: [],
    dots: false,
    showAnnotations: false,
    showFill: true,
    color: "#000000",
    fillColor: "#EEFFC0",
  };
  let termsFolder;
  const sideSpace = 0;
  let t = 0;

  p.setup = function () {
    p.frameRate(200);

    const canvas = p.createCanvas(width, height);
    canvas.parent("sketch1");

    pane = new Tweakpane.Pane({
      title: "Parameters",
      style: { theme: "light" },
    });

    pane.element.style.position = "fixed";
    pane.element.style.transformOrigin = "bottom left";
    pane.element.style.bottom = `${10}px`;
    pane.element.style.left = "300px";
    pane.element.style.zIndex = "10";

    pane.element.style.transform = "scale(0.8)";

    termsFolder = pane.addFolder({ title: "Terms" });
    let addBtn = pane.addButton({ title: "Add term" }).on("click", () => {
      addTerm();
      handleLatexChange();
    });

    pane.addInput(params, "smoothness", { min: 100, max: 500, step: 1 });
    pane.addInput(params, "minRevolutions", { min: 0, max: 5, step: 0.1 });
    pane.addInput(params, "revolutions", { min: 0, max: 5, step: 0.1 });
    pane.addInput(params, "radius", {
      min: 1,
      max: (window.innerWidth - sideSpace) / 2,
    });
    pane.addInput(params, "speed", { min: 0, max: 0.1 });
    // pane.addInput(params, "dots");
    pane.addInput(params, "showAnnotations");
    pane.addInput(params, "showFill");
    pane.addInput(params, "color");
    pane.addInput(params, "fillColor");

    addTerm({ amplitude: 50, freq: 6, fn: "sin" });

    addLatexPreview(10, p.height - 50, termsFolder);
    handleLatexChange();
    p.textFont("Courier New");

    p.angleMode(p.RADIANS);
  };

  function addTerm(vals) {
    let index = params.terms.length;
    let maxAmp = height / 3;
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

  p.draw = function () {
    p.background("white");
    p.clear();

    //update theta and t
    let prog =
      (p.sin((p.frameCount * params.speed) / params.revolutions) + 1) / 2;
    let currentRevolutions =
      params.minRevolutions +
      prog * (params.revolutions - params.minRevolutions);
    t = p.TWO_PI * currentRevolutions;

    const centerX = (p.width - sideSpace) / 2 + sideSpace;
    const centerY = p.height / 2;
    drawTerms(centerX, centerY);
    // p.line(sideSpace, 0, sideSpace, p.height);
  };

  function drawTerms(x, y) {
    p.push();
    p.translate(x, y);

    let stepSize = (2 * p.PI) / params.smoothness;

    if (params.showAnnotations) {
      p.fill("black");

      p.circle(0, 0, 10, 10);
    }
    if (!params.dots) {
      p.noFill();
      p.strokeWeight(0.5);
      p.stroke(...Object.values(params.color));
      p.beginShape();
    } else {
      p.fill(...Object.values(params.color));
      p.noStroke();
    }
    let theta;
    let lastr = 0;
    let lastDotX, lastDotY;

    for (theta = 0; theta < t; theta += stepSize) {
      let r = params.radius;
      for (let i = 0; i < params.terms.length; i++) {
        r += computeTerm(i, theta);
      }
      if (params.dots) {
        p.ellipse(r * p.cos(theta), r * p.sin(theta), 1, 1);
      } else {
        p.vertex(r * p.cos(theta), r * p.sin(theta));
      }
      if (params.showAnnotations) {
        p.push();
        if (theta + stepSize >= t) {
          p.strokeWeight(0.01);
          p.stroke(...Object.values(params.color));
          p.push();
          p.translate((r / 2) * p.cos(theta), (r / 2) * p.sin(theta));
          p.rotate(theta + p.PI);
          p.noStroke();
          // p.fill("black");
          // p.text("r", 0, 0);

          p.pop();
        } else {
          p.strokeWeight(0.01);
          p.stroke(...Object.values(params.color));
        }

        lastr = r;
        p.line(0, 0, r * p.cos(theta), r * p.sin(theta));
        if (theta + stepSize * 2 >= t) {
          lastDotX = r * p.cos(theta);
          lastDotY = r * p.sin(theta);
        }

        p.pop();
      }
    }

    if (!params.dots) {
      if (params.showFill) {
        p.fill(params.fillColor);
        p.vertex(0, 0);
        p.endShape(p.CLOSE);
      } else {
        p.endShape();
      }
    }

    if (params.showAnnotations && lastDotX !== undefined) {
      p.fill("black");
      p.noStroke();
      p.circle(lastDotX, lastDotY, 5);
    }
    p.fill("black");
    p.circle(0, 0, 5);

    p.pop();
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
    latexPreview.style.color = "white";
    latexPreview.style.top = `${height + 100}px`;
    latexPreview.style.right = `${100}px`;

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
};

new p5(sketch1);
