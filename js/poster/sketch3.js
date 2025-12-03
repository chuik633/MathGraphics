const sketch3 = (p) => {
  p.setup = function () {
    const canvas = p.createCanvas(400, 400);
    canvas.parent("sketch3");
  };

  p.draw = function () {
    // Your sketch code here
  };
};

new p5(sketch3);
