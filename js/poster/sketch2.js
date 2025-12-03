const sketch2 = (p) => {
  const width = window.innerWidth;
  const height = (window.innerWidth / 1920) * 1080;
  // Creates a shape out of functions
  let pane;
  const params = {
    function: "x^2",
    count: 6,
    offset: 30,
    animateRotation: 0.005,
    animateScale: 0,
    animateOffset: 0.01,

    up: true,
    smoothness: 100,
    scale: 3.5,
    yMax: 260,
    yMin: -100,
    xScale: 0.5,
  };

  let currentFn = (x) => 0;

  let validTex = true;
  let latexPreview;

  function addLatexPreview(x, y, trigger) {
    latexPreview = document.createElement("div");
    latexPreview.style.position = "fixed";
    latexPreview.style.color = "white";
    latexPreview.style.top = `${height + 200}px`;
    latexPreview.style.right = `${100}px`;

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

  function fullGraph(x, y, min, max) {
    p.push();
    p.translate(x, y);

    p.line(0, -params.yMax, 0, -params.yMin);
    p.line(-50, 0, 50, 0);
    for (let i = -50; i < 50; i += 10) {
      p.line(i, -params.yMax, i, -params.yMin);
    }
    for (let j = -params.yMax; j < -params.yMin; j += 10) {
      p.line(-50, j, 50, j);
    }
    if (params.up) {
      p.rotate(p.PI);
    }

    plotFunction(currentFn, min, max);
    p.stroke("black");
    p.ellipse(0, 0, 2, 2);

    p.pop();
  }

  function plotAllFunctions(centerX, centerY) {
    p.push();
    p.translate(centerX, centerY);
    if (params.animateRotation > 0) {
      p.rotate(p.frameCount * params.animateRotation);
    }
    if (params.animateOffset > 0) {
      params.offset = 50 + 20 * p.sin(p.frameCount * params.animateOffset);
    }
    if (params.animateScale > 0) {
      params.scale = 5 * p.sin(p.frameCount * params.animateScale);
    }

    if (params.up) {
      p.rotate(p.PI);
    }

    const dA = (2 * p.PI) / params.count;

    for (let i = 0; i < params.count; i++) {
      p.push();
      if (!params.up) {
        p.translate(0, -params.yMax);
        p.translate(0, -params.offset);
      } else {
        p.translate(0, params.offset);
      }

      plotFunction(currentFn, -50, 50);
      p.pop();
      p.rotate(dA);
    }
    p.pop();
  }

  function plotFunction(fn, min, max) {
    const sf = params.scale;
    const stepSize = Math.abs(max - min) / params.smoothness;

    // First pass: find valid range and track min/max for dot
    let minY = Infinity;
    let maxY = -Infinity;
    let minX = Infinity;
    let maxX = -Infinity;
    let startX = min;
    let endX = max;
    let hasValidPoints = false;

    for (let x = min; x < max; x += stepSize) {
      let y = fn(x);

      if (y * sf <= params.yMax && y * sf >= params.yMin) {
        hasValidPoints = true;
        if (y < minY) {
          minX = x;
          minY = y;
        }
        if (y > maxY) {
          maxX = x;
          maxY = y;
        }
      }
    }

    if (hasValidPoints && minX !== Infinity && maxX !== -Infinity) {
      let dotx = p.sin(p.frameCount * 0.005) * (maxX - minX) + minX;
      let doty = fn(dotx);

      if (doty * sf <= params.yMax && doty * sf >= params.yMin) {
        p.fill("black");
        p.push();
        p.textSize(8);
        p.textFont("ESKlarheitKurrent-Bk");
        p.translate(sf * dotx, sf * doty);
        p.rotate(p.PI / 8);
        p.text(`(${dotx.toFixed(0)}, ${doty.toFixed(0)})`, 5, 5);
        p.noStroke();
        p.circle(0, 0, 6);
        p.pop();
      }
    }

    p.noFill();
    p.strokeWeight(0.5);
    p.beginShape();

    for (let x = min; x < max; x += stepSize) {
      let y = fn(x);

      if (y * sf > params.yMax) {
        if (fn(x + 0.01) < fn(x)) {
          startX = x + stepSize;
          continue;
        } else {
          endX = x - stepSize;
          p.endShape();
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
          p.endShape();
          arrow(fn, startX, fn(startX), true);
          arrow(fn, endX, fn(endX), false);
          return;
        }
      } else {
        p.vertex(sf * x, sf * y);
      }
    }
    p.endShape();
  }

  function arrow(fn, x, y, flip) {
    p.push();
    let angle = derivativeApprox(fn, x);
    let sf = params.scale;
    x = x * sf;
    y = y * sf;
    p.translate(x, y);
    if (flip) {
      p.rotate(angle + p.PI / 2);
    } else {
      p.rotate(angle - p.PI / 2);
    }

    p.stroke("black");
    const size = Math.min(2 * params.scale, 3);
    p.line(0, 0, size, -size);
    p.line(0, 0, -size, -size);

    p.pop();
  }

  function derivativeApprox(fn, x) {
    let m = (fn(x + 0.1) - fn(x)) / 0.1; // slope
    let angle = p.atan(m);
    return angle;
  }

  // p5 instance setup
  p.setup = function () {
    p.frameRate(200);

    const canvas = p.createCanvas(width, height);
    canvas.parent("sketch2");

    pane = new Tweakpane.Pane({
      title: "Parameters",
      style: { theme: "light" },
    });

    pane.element.style.position = "fixed";
    pane.element.style.transformOrigin = "bottom left";
    pane.element.style.bottom = `${10}px`;
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
    p.angleMode(p.RADIANS);
  };

  // p5 instance draw
  p.draw = function () {
    p.clear();

    const centerX = p.width / 2;
    const centerY = p.height / 2;

    if (validTex) {
      //   fullGraph(100, 400 + params.yMax / 2, -50, 50);
      plotAllFunctions(centerX, centerY);
    } else {
      p.push();
      p.translate(centerX, centerY);
      p.text("invalid latex", 0, 0);
      p.pop();
    }
  };

  function buildFunctionFromTex(texString) {
    // basic normalization
    let expr = texString.trim();

    // strip outer f(x)= if they type it
    expr = expr.replace(/^f\s*\(\s*x\s*\)\s*=/i, "");

    // replace TeX-style things with JS/Math
    expr = expr.replace(/\^/g, "**"); // x^2 -> x**2
    expr = expr.replace(/\\sin/g, "Math.sin");
    expr = expr.replace(/\|([^|]+)\|/g, "Math.abs($1)");

    expr = expr.replace(/\\cos/g, "Math.cos");
    expr = expr.replace(/\\tan/g, "Math.tan");
    expr = expr.replace(/\\sqrt/g, "Math.sqrt");
    expr = expr.replace(/\\pi/g, "Math.PI");
    expr = expr.replace(/\\exp/g, "Math.exp");
    expr = expr.replace(/\\ln/g, "Math.log");

    // very simple \frac{a}{b} -> (a)/(b)
    expr = expr.replace(/\\frac\s*\{([^}]*)\}\s*\{([^}]*)\}/g, "($1)/($2)");

    try {
      const fn = new Function("x", `return ${expr};`);
      // Wrap the function to multiply x by params.xScale
      const scaledFn = (x) => fn(x * params.xScale);
      scaledFn(0); // Test the function to ensure it works
      return { fn: scaledFn, error: null };
    } catch (e) {
      console.error("Bad function:", e);
      return { fn: null, error: e };
    }
  }
};

// once poster.js is loaded load this
document.addEventListener("DOMContentLoaded", () => {
  new p5(sketch2);
});
