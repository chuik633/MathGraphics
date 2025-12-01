// SVG path "d" string (put your own path here)
const pathData =
  " M155.77 84.1503C152.776 66.8994 137.549 32.3976 100.595 32.3976C80.0652 29.5462 38.2351 34.9639 35.1556 79.4458C34.7279 92.5624 42.1702 119.48 75.3606 122.217C96.7458 122.217 135.797 120.729 147.643 141.036C157.623 158.145 165.351 196.297 116.42 212.036C93.8003 217.882 44.9956 216.912 30.7373 166.271";

let svgPath;
let totalLength;

function setup() {
  createCanvas(400, 400);
  background(0);
  noStroke();
  fill(255);

  // Create an SVGPathElement so we can use getPointAtLength
  const svgNS = "http://www.w3.org/2000/svg";
  svgPath = document.createElementNS(svgNS, "path");
  svgPath.setAttribute("d", pathData);

  totalLength = svgPath.getTotalLength();

  // Optional: move origin to center for convenience
  translate(width / 2 - 200, height / 2 - 200);
  drawPathSpokesTapered(svgPath, 30, 20, 60);
}

function drawPathSpokes(svgPath, count, baseWidth, height) {
  const total = svgPath.getTotalLength();

  for (let i = 0; i < count; i++) {
    const t = i / count;
    const pos = t * total;

    const p = svgPath.getPointAtLength(pos);
    const p2 = svgPath.getPointAtLength(Math.min(total, pos + 0.2));

    const a = Math.atan2(p2.y - p.y, p2.x - p.x) - Math.PI / 2;
    const tx = Math.cos(a);
    const ty = Math.sin(a);
    const nx = Math.cos(a - Math.PI / 2);
    const ny = Math.sin(a - Math.PI / 2);

    const x1 = p.x - (tx * baseWidth) / 2;
    const y1 = p.y - (ty * baseWidth) / 2;
    const x2 = p.x + (tx * baseWidth) / 2;
    const y2 = p.y + (ty * baseWidth) / 2;
    const x3 = p.x + nx * height;
    const y3 = p.y + ny * height;

    beginShape();
    vertex(x1, y1);
    vertex(x2, y2);
    vertex(x3, y3);
    endShape(CLOSE);
  }
}
