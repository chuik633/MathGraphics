document.addEventListener("DOMContentLoaded", () => {
  makeGrid();
});

function makeGrid() {
  const width = window.innerWidth;
  const height = (window.innerWidth / 1920) * 1080;
  const padding = width / 30;

  const pos = {
    top: padding,
    bottom: height - padding,
    left: padding,
    right: width - padding,
  };

  const gridSize = padding;
  const numCols = Math.floor((width - 2 * padding) / gridSize);
  const numRows = Math.floor((height - 2 * padding) / gridSize);
  const colors = {
    grey: "#D9D9D9",
    black: "#212121",
    yellow: "#EEFFC0",
    blue: "#A5E8FE",
    orange: "#FF5202",
  };

  function generateGridData() {
    const cells = [];

    let row = 0;
    for (let y = 0; y < height; y += gridSize) {
      let col = 0;
      for (let x = 0; x < width; x += gridSize) {
        cells.push({
          row: row,
          column: col,
          x: x,
          y: y,
          width: gridSize,
          height: gridSize,
          contentIds: [],
        });
        col++;
      }
      row++;
    }

    return cells;
  }

  const gridContentsData = [
    {
      id: 0,
      r1: Math.floor(numRows / 2),
      c1: -1,
      r2: numRows + 2,
      c2: 8,
      color: colors.yellow,
      textAlign: "top right",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum lorem ipsum.gna aliqua.",
    },
    {
      id: 1,
      r1: -1,
      c1: numCols - 5,
      r2: Math.floor(numRows / 2),
      c2: numCols + 2,
      color: colors.grey,
      textAlign: "bottom left",
      text: "Lorem ipsum dolod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit essecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum lorem ipsum.gna aliqua.",
    },
  ];

  const gridData = generateGridData();

  gridContentsData.forEach((content) => {
    gridData.forEach((cell) => {
      if (
        cell.row >= content.r1 &&
        cell.row <= content.r2 &&
        cell.column >= content.c1 &&
        cell.column <= content.c2
      ) {
        cell.contentIds.push(content.id);
      }
    });
  });

  const contentLayer = d3
    .select("#poster")
    .append("div")
    .attr("id", "content-layer")
    .style("position", "fixed")
    .style("top", "0")
    .style("left", "0")
    .style("width", `${width}px`)
    .style("height", `${height}px`)
    .style("z-index", "-2");

  //all content boxes
  gridContentsData.forEach((content) => {
    const x1 = content.c1 * gridSize;
    const y1 = content.r1 * gridSize;
    const x2 = (content.c2 + 1) * gridSize;
    const y2 = (content.r2 + 1) * gridSize;
    const aligns = content.textAlign.split(" ");

    const contentBox = contentLayer
      .append("div")
      .attr("id", `content-${content.id}`)
      .style("position", "absolute")
      .style("left", `${x1}px`)
      .style("top", `${y1}px`)
      .style("width", `${x2 - x1}px`)
      .style("height", `${y2 - y1}px`)
      .style("background-color", content.color)
      .style("padding", `${gridSize / 2}px`)
      .style("box-sizing", "border-box")
      .style("border", ".5px solid " + colors.black)
      .style("font-family", "ESKlarheitKurrent-Bk")
      .style("font-size", "14px")
      .style("color", colors.black)
      .style("display", "flex")
      .style(
        "align-items",
        aligns[0] == "top"
          ? "flex-start"
          : aligns[0] == "bottom"
          ? "flex-end"
          : "center"
      )
      .style(
        "justify-content",
        aligns[1] == "left"
          ? "flex-start"
          : aligns[1] == "right"
          ? "flex-end"
          : "center"
      )
      .style("overflow", "auto")
      .style("cursor", "pointer")
      .on("click", function () {
        console.log("clicking, ", content.id);
        hideContent(content.id);
      });

    contentBox
      .append("p")
      .html(content.text)
      .style("margin", "0")
      .style("max-width", `${6 * gridSize}px`)
      .style("width", `${x2 - x1 - gridSize * 2.5}px`);
  });

  function revealContent(contentId) {
    const content = gridContentsData.find((c) => c.id === contentId);
    if (!content) return;

    d3.select(`#content-${contentId}`).style("pointer-events", "auto");

    svg
      .selectAll(`.content-${contentId}`)
      .each(function (d) {
        if (d.originalY === undefined) {
          d.originalY = d.y;
        }
        if (d.originalX === undefined) {
          d.originalX = d.x;
        }
      })
      .transition()
      .delay(() => Math.random() * 300)
      .duration(400)
      .ease(d3.easeCubicOut)
      .attr("y", (d) => d.originalY + gridSize)
      .attr("height", 0);

    // Draw content border outline
    drawContentBorder(contentId);
  }

  function hideContent(contentId) {
    d3.select(`#content-${contentId}`).style("pointer-events", "none");

    svg
      .selectAll(`.content-${contentId}`)
      .transition()
      .delay(() => Math.random() * 300)
      .duration(400)
      .ease(d3.easeCubicOut)
      .attr("y", (d) => d.originalY)
      .attr("height", gridSize);

    // Remove content border outline
    borderSvg.select(`#border-${contentId}`).remove();
  }

  function drawContentBorder(contentId) {
    const content = gridContentsData.find((c) => c.id === contentId);
    if (!content) return;

    const x1 = content.c1 * gridSize;
    const y1 = content.r1 * gridSize;
    const x2 = (content.c2 + 1) * gridSize;
    const y2 = (content.r2 + 1) * gridSize;

    const contentBorderGroup = borderSvg
      .append("g")
      .attr("id", `border-${contentId}`);

    const corners = [
      [x1, y1],
      [x2, y1],
      [x2, y2],
      [x1, y2],
    ];

    for (let i = 0; i < corners.length; i++) {
      let corner = corners[i];
      let nextCorner = corners[(i + 1) % corners.length];

      contentBorderGroup
        .append("line")
        .attr("x1", corner[0])
        .attr("y1", corner[1])
        .attr("x2", nextCorner[0])
        .attr("y2", nextCorner[1])
        .attr("stroke", colors.black)
        .attr("stroke-width", 1);

      contentBorderGroup
        .append("circle")
        .attr("cx", corner[0])
        .attr("cy", corner[1])
        .attr("r", 4)
        .attr("fill", colors.black);
    }

    const intersections = [];

    for (let x = x1; x <= x2 + gridSize; x += gridSize) {
      if (x === pos.left && x > x1 && x < x2) {
        intersections.push([x, y1]);
        intersections.push([x, y2]);
      }
      if (x === pos.right && x > x1 && x < x2) {
        intersections.push([x, y1]);
        intersections.push([x, y2]);
      }
    }

    for (let y = y1; y <= y2 + gridSize; y += gridSize) {
      if (y === pos.top && y > y1 && y < y2) {
        intersections.push([x1, y]);
        intersections.push([x2, y]);
      }
      if (y === pos.bottom && y > y1 && y < y2) {
        intersections.push([x1, y]);
        intersections.push([x2, y]);
      }
    }

    console.log("intersections", intersections);
    const uniqueIntersections = Array.from(
      new Set(intersections.map(JSON.stringify))
    ).map(JSON.parse);

    uniqueIntersections.forEach(([x, y]) => {
      contentBorderGroup
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 4)
        .attr("fill", colors.black);
    });
  }

  const svg = d3
    .select("#poster")
    .append("svg")
    .attr("id", "grid-svg")
    .attr("width", width)
    .attr("height", height)
    .style("position", "fixed")
    .style("top", "0")
    .style("left", "0")
    .style("z-index", "-1");

  svg
    .selectAll(".grid-cell")
    .data(gridData)
    .enter()
    .append("rect")
    .attr("class", (d) => {
      let classes = "grid-cell";
      d.contentIds.forEach((id) => {
        classes += ` content-${id}`;
      });
      return classes;
    })
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y)
    .attr("width", (d) => d.width)
    .attr("height", (d) => d.height)
    .attr("fill", (d) => (d.x >= width / 2 ? colors.yellow : colors.grey))
    .attr("stroke", colors.black + "12")
    .attr("stroke-width", 0.8)
    .style("cursor", (d) => (d.contentIds.length > 0 ? "pointer" : "default"))
    .on("mouseover", function (event, d) {
      d3.select(this).attr("stroke", colors.black);
    })
    .on("mouseout", function (event, d) {
      d3.select(this).attr("stroke", colors.black + "12");
    })

    .on("click", function (event, d) {
      if (d.contentIds.length === 0) return;
      const contentId = d.contentIds[0];

      // Check if content is currently revealed by checking height
      const firstCell = svg.select(`.content-${contentId}`);
      const isRevealed = firstCell.attr("height") == "0";

      if (isRevealed) {
        hideContent(contentId);
      } else {
        revealContent(contentId);
      }
    });

  window.gridData = gridData;

  const borderSvg = d3
    .select("#poster")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("position", "absolute")
    .style("top", "0")
    .style("left", "0")
    .style("z-index", "1")
    .style("pointer-events", "none");

  const borderGroup = borderSvg.append("g").attr("class", "grid-lines");
  let cornerPoints = [
    [pos.top, pos.left],
    [pos.top, pos.right],
    [pos.bottom, pos.right],
    [pos.bottom, pos.left],
  ];
  for (let i = 0; i < cornerPoints.length; i++) {
    let point = cornerPoints[i];
    let nextPoint = cornerPoints[(i + 1) % cornerPoints.length];
    borderGroup
      .append("line")
      .attr("x1", point[1])
      .attr("y1", point[0])
      .attr("x2", nextPoint[1])
      .attr("y2", nextPoint[0])
      .attr("stroke", colors.black)
      .attr("stroke-width", 0.5);
    borderGroup
      .append("circle")
      .attr("cx", point[1])
      .attr("cy", point[0])
      .attr("r", 4)
      .attr("fill", colors.black);
  }
}
