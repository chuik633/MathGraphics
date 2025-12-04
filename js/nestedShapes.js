let _shapeCounter = 0;
function loadShape(path) {
  _shapeCounter++;
  const id = "shape-" + _shapeCounter;
  const el = document.createElement("div");
  el.id = id;
  el.className = "nested-shape";
  document.body.appendChild(el);
  path = path || "assets/nestedshapes.json";
  const anim = lottie.loadAnimation({
    container: el,
    renderer: "svg",
    loop: true,
    autoplay: false,
    path: path,
  });
  let hoverTime = 0;
  let hoverInterval = null;
  let isReversing = false;

  //mouse enters so go forward
  el.addEventListener("mouseenter", () => {
    isReversing = false;
    anim.setDirection(1); // forward
    hoverTime = 0;
    hoverInterval = setInterval(() => {
      hoverTime += 0.1;
      const newSpeed = 1 + hoverTime * 0.5;
      anim.setSpeed(newSpeed);
    }, 100);
    anim.play();
  });

  //mouse leaves so revers
  el.addEventListener("mouseleave", () => {
    clearInterval(hoverInterval);
    hoverInterval = null;
    console.log("leave");
    isReversing = true;

    anim.setSpeed(0.8);
    anim.setDirection(-1); // backward
    anim.play();
  });

  //stop when frame 0
  function onEnterFrame() {
    if (isReversing && anim.currentFrame <= 1) {
      anim.removeEventListener("enterFrame", onEnterFrame);

      anim.goToAndStop(0, true);
      isReversing = false;

      // reattach after we're done
      anim.addEventListener("enterFrame", onEnterFrame);
    }
  }

  anim.addEventListener("enterFrame", onEnterFrame);
  return { id, el, anim };
}
let w = window.innerWidth / 5;

window.addEventListener("DOMContentLoaded", (event) => {
  const HEX_W = w;
  const HEX_H = (w * Math.sqrt(3)) / 2;
  const X_SPACING = HEX_W * 0.73;
  const Y_SPACING = HEX_H * 0.5;
  function drawShape(r, c) {
    const shape = loadShape("assets/nestedshapes.json");

    const x = c * X_SPACING;
    const y = r * Y_SPACING;

    shape.el.style.width = HEX_W + "px";
    shape.el.style.height = HEX_H + "px";
    shape.el.style.left = x + "px";
    shape.el.style.top = y + "px";
  }
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (r % 2 == 0) {
        if (c % 2 === 0) {
          continue;
        } else {
          drawShape(r, c);
        }
      } else {
        if (c % 2 === 1) {
          continue;
        } else {
          drawShape(r, c);
        }
      }
    }
  }
  console.log(w);
});
