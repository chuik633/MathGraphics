// Creates a shape out of functions
let pane;
const params = {
  count: 3,
};

const sideSpace = 200;

// setup
function setup() {
  frameRate(200);
  createCanvas(window.innerWidth, window.innerHeight);

  pane = new Tweakpane.Pane({ title: "Parameters", style: { theme: "light" } });

  pane.element.style.position = "fixed";
  pane.element.style.transformOrigin = "top left";
  pane.element.style.top = `${10}px`;
  pane.element.style.left = "10px";

  pane.addInput(params, "count", { min: 1, max: 10, step: 1 });

  angleMode(RADIANS);
}

function draw() {
  background("white");

  const centerX = width / 2;
  const centerY = height / 2;
}
