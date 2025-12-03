const posterSketch = (p) => {
  const width = window.innerWidth;
  const height = (window.innerWidth / 1920) * 1080;
  const padding = width / 30;

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
  const gridSize = padding;

  const colors = {
    grey: "#D9D9D9",
    black: "#212121",
    yellow: "#EEFFC0",
    blue: "#A5E8FE",
    orange: "#FF5202",
  };
  let params = {
    color: colors.black,
    currFont: "",
    text: "Art of Problem Solving",
    fontSize: 100,
    gapDetection: 20,
    animate: false,
  };

  p.preload = function () {
    const fontFamily = "ESKlarheitKurrent";
    for (const type of Object.keys(fonts)) {
      fonts[type] = p.loadFont(
        `./assets/fonts/${fontFamily}/${fontFamily}-${type}-TRIAL.ttf`
      );
    }
    params.currFont = "Bk";
  };

  p.setup = function () {
    const canvas = p.createCanvas(width, height);
    canvas.parent("mouseEffects");
    canvas.style("position", "absolute");
    canvas.style("top", "0");
    canvas.style("left", "0");
  };

  p.draw = function () {
    currFont = fonts[params.currFont];
    if (currFont == undefined) {
      return;
    }
    p.clear();

    grid();

    p.textFont(currFont);
    p.textSize(params.fontSize);
  };

  function grid() {
    p.stroke(params.color + "12");
    p.strokeWeight(0.5);
    p.noFill();

    for (let i = pos.left; i < pos.right; i += gridSize) {
      for (let j = pos.top; j < pos.bottom; j += gridSize) {
        const mDist = p.dist(
          p.mouseX,
          p.mouseY,
          i + gridSize / 2,
          j + gridSize / 2
        );
        if (mDist < gridSize) {
          p.stroke(colors.black);
          p.rect(i, j, gridSize, gridSize);
        } else {
          p.noStroke();
        }
      }
    }
  }
};

new p5(posterSketch);
