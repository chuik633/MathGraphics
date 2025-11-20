class Graph {
  constructor(nodes = []) {
    this.graph = nodes;
  }
  addNode(node) {
    node.id = this.graph.length; //id is the index in this graph
    this.graph.push(node);
  }
  addEdge(edge) {
    if (checkValidEdge(edge)) {
      //edge is a list of 2 node ids
      let n1_id = edge[0];
      let n2_id = edge[1];
      this.graph[n1_id].addNeighbor(n2_id);
      this.graph[n2_id].addNeighbor(n1_id); //bidirectional edge
    }
  }
  removeEdge(edge) {
    if (checkValidEdge(edge)) {
      let n1_id = edge[0];
      let n2_id = edge[1];
      let n1 = this.graph[n1_id];
      let n2 = this.graph[n2_id];
      n1.removeNeighbor(n2_id);
      n2.removeNeighbor(n1_id);
    }
  }

  checkValidEdge(edge) {
    if (edge.length != 2) {
      return false;
    }
    let n1_id = edge[0];
    let n2_id = edge[1];
    let n1 = this.graph[n1_id];
    let n2 = this.graph[n2_id];
    if (n1.id != n1_id || n2.id != n2_id) {
      return false;
    }
    return true;
  }
}

class Node {
  constructor(row, col, id, nbrs = []) {
    this.id = id;
    this.row = row;
    this.col = col;

    //pos
    this.x = (mainWidth / params) * col;
    this.y = (mainHeight / params) * row;

    //edges
    this.nbrs = new Set(...nbrs); //list of nodes
  }
  addNeighbor(nbr_id) {
    this.nbrs.add(nbr_id);
  }
  removeNeighbor(nbr_id) {
    this.nbrs.delete(nbr_id);
  }
}
