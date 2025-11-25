// Creates a shape out of functions
let pane;
const params = {
  rows: 5,
  cols: 8,
  diagonals: true,
  hideGraph: false,
  color: { r: 228, g: 183, b: 66 },
  thickness: 1,
  animate: true,
  speed: 0.01,
};

const sideSpace = 250;
const mainWidth = window.innerWidth - sideSpace;
const mainHeight = window.innerHeight;
const centerX = mainWidth / 2;
const gridPadding = 50;
let graph;
let cellSize;
let allWalks = [];
// setup
function setup() {
  frameRate(200);
  createCanvas(window.innerWidth, window.innerHeight);

  pane = new Tweakpane.Pane({ title: "Parameters", style: { theme: "light" } });

  pane.element.style.position = "fixed";
  pane.element.style.transformOrigin = "top left";
  pane.element.style.top = `${10}px`;
  pane.element.style.left = "10px";
  pane.element.style.transform = "scale(90%)";
  pane.addInput(params, "animate");
  pane.addInput(params, "speed", { min: 0.0001, max: 0.1 });
  pane.addInput(params, "hideGraph");
  const graphFolder = pane.addFolder({ title: "grid settings" });
  graphFolder.addInput(params, "rows", { min: 3, max: 50, step: 1 });
  graphFolder.addInput(params, "cols", { min: 3, max: 50, step: 1 });
  graphFolder.addInput(params, "diagonals");

  graphFolder.on("change", () => {
    buildGridGraph();
    allWalks = [];
  });
  angleMode(RADIANS);

  const pathFolder = pane.addFolder({ title: "path settings" });
  pathFolder.addInput(params, "color");
  pathFolder.addInput(params, "thickness", { min: 0.1, max: 4 });

  buildGridGraph();
  textFont("Courier New");
}

function draw() {
  background("white");
  noStroke();
  fill("black");
  textAlign(CENTER);
  text("click a node to create a walk", sideSpace / 2, 300);
  text("SPACEBAR - clears screen", sideSpace / 2, 350);
  stroke("black");
  strokeWeight(1);

  line(sideSpace, 0, sideSpace, height);
  if (!params.hideGraph) {
    graph.drawGraph();
  }
  for (const walk of allWalks) {
    graph.drawWalk(walk);
  }
}

function keyPressed() {
  if (keyCode == 32) {
    allWalks = [];
  }
}

function getId(row, col) {
  return row + "," + col;
}
let nearestNode = false;
function mousePressed() {
  if (
    mouseX < width - gridPadding &&
    mouseX > sideSpace + gridPadding &&
    mouseY < height - gridPadding &&
    mouseY > gridPadding
  ) {
    if (nearestNode) {
      console.log("setting start");
      graph.startNode = nearestNode;
      allWalks.push({
        walk: graph.randomWalk(),
        color: Object.values(params.color),
      });
      console.log(allWalks);
    }
  }
  //change the start node to that node
}

class Node {
  constructor(row, col) {
    this.id = getId(row, col);
    this.row = row;
    this.col = col;
    const availableW = mainWidth - 2 * gridPadding;
    const availableH = mainHeight - 2 * gridPadding;
    cellSize = Math.min(availableW / params.cols, availableH / params.rows);
    //align to center
    const gridH = cellSize * params.rows;
    const gridW = cellSize * params.cols;
    const xOffset = (availableW - gridW) / 2;
    const yOffset = (availableH - gridH) / 2;

    this.x = xOffset + sideSpace + gridPadding + cellSize * col;
    this.y = yOffset + gridPadding + cellSize * row;
    this.nbrs = new Set();
  }
  addNeighbor(row, col) {
    this.nbrs.add(getId(row, col));
    //add it the other direction
  }
  removeNeighbor(row, col) {
    this.nbrs.delete(getId(row, col));
  }
  drawNode() {
    //node
    fill("black");
    if (this == graph.startNode) {
      ellipse(this.x, this.y, 8, 8);
    }
    let r = Math.max(cellSize / 8, 0.1);
    if (dist(mouseX, mouseY, this.x, this.y) < cellSize / 2) {
      ellipse(this.x, this.y, 8, 8);
      nearestNode = this;
      fill("black");
      text("set start", this.x - 10, this.y - 10);
    } else {
      ellipse(this.x, this.y, r, r);
    }
  }
}
class Graph {
  constructor() {
    this.nodes = new Map();
    this.startNode = null;
  }

  addNode(row, col) {
    const id = getId(row, col);
    if (!this.nodes.has(id)) {
      const node = new Node(row, col);
      this.nodes.set(id, node);
      if (!this.startNode) {
        this.startNode = node;
      }
    }
    return this.nodes.get(id);
  }

  getNodeById(id) {
    return this.nodes.get(id) || false;
  }

  addEdge(row1, col1, row2, col2) {
    const n1 = this.addNode(row1, col1);
    const n2 = this.addNode(row2, col2);

    n1.addNeighbor(row2, col2);
    n2.addNeighbor(row1, col1);
  }

  drawGraph() {
    for (const node of this.nodes.values()) {
      node.drawNode();

      for (const nbr_id of node.nbrs) {
        const nbr = this.getNodeById(nbr_id);
        if (!nbr) continue;

        stroke("black");
        strokeWeight(0.2);
        line(node.x, node.y, nbr.x, nbr.y);
      }
    }
  }

  randomWalk() {
    if (!this.startNode) return [];

    let walk = [this.startNode];
    let walkIds = [this.startNode.id];

    let currNode = this.startNode;

    console.log(currNode.nbrs);

    while (currNode.nbrs.size > 0 && currNode.col < params.cols) {
      let availableNbrs = [];
      for (const nbr_id of currNode.nbrs) {
        if (!walkIds.includes(nbr_id)) {
          availableNbrs.push(nbr_id);
        }
      }

      if (availableNbrs.length === 0) {
        break;
      }

      // random neighbor
      const nextNode_id =
        availableNbrs[Math.floor(Math.random() * availableNbrs.length)];
      const nextNode = this.getNodeById(nextNode_id);

      if (!nextNode) {
        break;
      }

      walkIds.push(nextNode_id);
      walk.push(nextNode);
      currNode = nextNode;
    }

    return walk;
  }

  drawWalk(walkInfo) {
    const walk = walkInfo.walk;
    const color = walkInfo.color;

    if (!walk || walk.length < 2) return;

    let endNode = walk.length;
    if (params.animate) {
      endNode = Math.ceil(sin(params.speed * frameCount) * walk.length);
    }

    for (let i = 0; i < endNode - 1; i++) {
      const node = walk[i];
      const nextNode = walk[i + 1];

      stroke(...color);
      strokeWeight(params.thickness);
      line(node.x, node.y, nextNode.x, nextNode.y);

      noStroke();
      fill(...color);
      ellipse(node.x, node.y, 5);
      ellipse(nextNode.x, nextNode.y, 5);
    }
  }
}

function buildGridGraph() {
  graph = new Graph([]);
  for (let i = 0; i < params.rows; i++) {
    for (let j = 0; j < params.cols; j++) {
      let node = graph.addNode(i, j);
      if (j > 0) {
        graph.addEdge(i, j, i, j - 1);
        if (i > 0) {
          if (params.diagonals) {
            graph.addEdge(i, j, i - 1, j - 1);
          }
          graph.addEdge(i, j, i - 1, j);
        } else if (i < params.rows - 1) {
          if (params.diagonals) {
            graph.addEdge(i, j, i + 1, j - 1);
          }
          graph.addEdge(i, j, i + 1, j);
        }
      }
      if (j < params.cols - 1) {
        graph.addEdge(i, j, i, j + 1);
        if (i > 0) {
          if (params.diagonals) {
            graph.addEdge(i, j, i - 1, j + 1);
          }
          graph.addEdge(i, j, i - 1, j);
        } else if (i < params.rows - 1) {
          if (params.diagonals) {
            graph.addEdge(i, j, i + 1, j + 1);
          }
          graph.addEdge(i, j, i + 1, j);
        }
      }
    }
  }
}
