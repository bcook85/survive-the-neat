function Astar(sx, sy, ex, ey, grid) {
  let open = [{"x": sx,"y": sy,"f": 0,"g": 0,"h": 0, "p": undefined}];
  let closed = [];
  let lowest = 0;
  let current = undefined;

  while(open.length > 0) {
    lowest = 0;
    current = open[lowest];
    if ((current.x == ex && current.y == ey)) {
      let node = current;
      let path = [];
      while (node !== undefined) {
        path.unshift([node.x, node.y]);
        node = node.p;
      }
      return path;
    }

    open.splice(lowest, 1);
    closed[current.y * grid.length + current.x] = 0;

    let neighbors = [];
    current.x = Math.max(0, Math.min(grid.length - 1, current.x));
    current.y = Math.max(0, Math.min(grid[0].length - 1, current.y));
    if (current.x > 0 && grid[current.x - 1][current.y] == 0 && closed[(current.y * grid.length) + current.x - 1] === undefined) {
      neighbors.push([current.x - 1, current.y]);
    }
    if (current.x < grid.length - 1 && grid[current.x + 1][current.y] == 0 && closed[(current.y * grid.length) + current.x + 1] === undefined) {
      neighbors.push([current.x + 1, current.y]);
    }
    if (current.y > 0 && grid[current.x][current.y - 1] == 0 && closed[((current.y - 1) * grid.length) + current.x] === undefined) {
      neighbors.push([current.x, current.y - 1]);
    }
    if (current.y < grid[current.x].length - 1 && grid[current.x][current.y + 1] == 0 && closed[((current.y + 1) * grid.length) + current.x] === undefined) {
      neighbors.push([current.x, current.y + 1]);
    }
    for (let n = 0; n < neighbors.length; n++) {
      let g = current.g + 1;
      let newNode = true;
      for (let o = 0; o < open.length; o++) {
        if (open[o].x == neighbors[n][0] && open[o].y == neighbors[n][1]) {
          newNode = false;
          if (g < open[o].g) {
            open[o].g = g;
            open[o].f = g + open[o].h;
            open[o].p = current;
          }
          break;
        }
      }
      if (newNode) {
        // Manhattan
        // let h = (Math.abs(ex - neighbors[n][0]) + Math.abs(ey - neighbors[n][1]));
        // Euclidean
        let dx = ex - neighbors[n][0];
        let dy = ey - neighbors[n][1];
        let h = Math.sqrt((dx * dx) + (dy * dy));
        let f = g + h;
        let foundPlace = false;
        for (let o = open.length - 1; o >= 0; o--) {
          if (open[o].f < f) {
            open.splice(o + 1, 0, {"x": neighbors[n][0],"y": neighbors[n][1],"f": f,"g": g,"h": h, "p": current});
            foundPlace = true;
            break;
          }
        }
        if (!foundPlace) {
          open.unshift({"x": neighbors[n][0],"y": neighbors[n][1],"f": f,"g": g,"h": h, "p": current});
        }
      }
    }
  }
  return [];
}