class RandomRoom {
  constructor(width, height, maxRooms) {
    this.rooms = MAPROOMS;
    this.maxRooms = maxRooms;
    this.roomWidth = width;
    this.roomHeight = height;
    this.width = this.roomWidth * RandomRoom.roomSize();
    this.height = this.roomHeight * RandomRoom.roomSize();
    this.startX = Math.floor(this.roomWidth * Math.random());
    this.startY = Math.floor(this.roomHeight * Math.random());
    this.cells = [];
    this.grid = [];
    this.spawnLocationPlayer = [];
    this.spawnLocationMob = [];
    this.createCells();
    this.createGrid();
  };
  static roomSize() {
    return 9;
  };
  createCells() {
    this.cells = [];
    // Initialize empty cells
    for (let x = 0; x < this.roomWidth; x++) {
      let col = [];
      for (let y = 0; y < this.roomHeight; y++) {
        col.push(-1);
      }
      this.cells.push(col);
    }
    let addedCells = [];
    // Set Starting cell
    let currentX = this.startX;
    let currentY = this.startY;
    this.cells[currentX][currentY] = 0;
    addedCells.push([currentX, currentY]);
    // Add rooms until maxRooms
    while (addedCells.length <= this.maxRooms) {
      // Randomly select a cell to anchor off of
      let anchorCell = Math.floor(Math.random() * (addedCells.length - 1));
      currentX = addedCells[anchorCell][0];
      currentY = addedCells[anchorCell][1];
      // Pick random cardinal direction to place new room
      let nextCellDirection = Math.random();
      if (nextCellDirection < 0.25) {// North
        if (currentY - 1 >= 0 && this.cells[currentX][currentY - 1] == -1) {
          this.cells[currentX][currentY - 1] = Math.floor(Math.random() * (this.rooms.length - 1)) + 1;
          addedCells.push([currentX, currentY - 1]);
        }
      } else if (nextCellDirection < 0.5) {// South
        if (currentY + 1 < this.roomHeight && this.cells[currentX][currentY + 1] == -1) {
          this.cells[currentX][currentY + 1] = Math.floor(Math.random() * (this.rooms.length - 1)) + 1;
          addedCells.push([currentX, currentY + 1]);
        }
      } else if (nextCellDirection < 0.75) {// East
        if (currentX + 1 < this.roomWidth && this.cells[currentX + 1][currentY] == -1) {
          this.cells[currentX + 1][currentY] = Math.floor(Math.random() * (this.rooms.length - 1)) + 1;
          addedCells.push([currentX + 1, currentY]);
        }
      } else { // West
        if (currentX - 1 >= 0 && this.cells[currentX - 1][currentY] == -1) {
          this.cells[currentX - 1][currentY] = Math.floor(Math.random() * (this.rooms.length - 1)) + 1;
          addedCells.push([currentX - 1, currentY]);
        }
      }
    }
  };
  createGrid() {
    this.grid = [];
    // Set Walls
    for (let x = 0; x < RandomRoom.roomSize() * this.roomWidth; x++) {
      let col = [];
      for (let y = 0; y < RandomRoom.roomSize() * this.roomHeight; y++) {
        col.push(1);//default to wall
      }
      this.grid.push(col);
    }
    // Fill in rooms
    for (let cx = 0; cx < this.roomWidth; cx++) {
      for (let cy = 0; cy < this.roomHeight; cy++) {
        let roomID = this.cells[cx][cy];
        if (roomID >= 0) {
          for (let rx = 0; rx < RandomRoom.roomSize(); rx++) {
            for (let ry = 0; ry < RandomRoom.roomSize(); ry++) {
              let gx = (cx * RandomRoom.roomSize()) + rx;
              let gy = (cy * RandomRoom.roomSize()) + ry;
              let tileID = this.rooms[roomID][rx][ry];
              if (tileID == 3) {// Mob
                this.spawnLocationMob.push([gx, gy]);
                this.grid[gx][gy] = 0;
              } else if (tileID == 2) {// Player
                this.spawnLocationPlayer.push([gx, gy]);
                this.grid[gx][gy] = 0;
              } else if (tileID == 0) {// Empty
                this.grid[gx][gy] = 0;
              } else if (tileID == 1) {// Wall
                this.grid[gx][gy] = 1;
              }
            }
          }
        }
      }
    }
  };
  buildImage(tileSize) {
    let mapImage = document.createElement("canvas");
    mapImage.width = this.width * tileSize;
    mapImage.height = this.height * tileSize;
    let mapCTX = mapImage.getContext("2d");
    // Draw Map grid to mapImage
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        mapCTX.fillStyle = "black";
        if (this.grid[x][y] == 1) {
          mapCTX.fillStyle = "rgb(77,67,188)";
        }
        mapCTX.fillRect(
          x * tileSize
          ,y * tileSize
          ,tileSize
          ,tileSize
        );
      }
    }
    return mapImage;
  };
};

var MAPROOMS = [
  [
    [1,1,1,0,0,0,1,1,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[0,0,0,2,0,2,0,0,0]
    ,[0,0,0,0,0,0,0,0,0]
    ,[0,0,0,2,0,2,0,0,0]
    ,[1,0,0,0,0,0,0,0,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[1,1,1,0,0,0,1,1,1]
  ]
  ,[
    [1,1,1,0,0,0,1,1,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[1,0,3,0,0,0,3,0,1]
    ,[0,0,0,1,1,1,0,0,0]
    ,[0,0,0,1,1,1,0,0,0]
    ,[0,0,0,1,1,1,0,0,0]
    ,[1,0,3,0,0,0,3,0,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[1,1,1,0,0,0,1,1,1]
  ]
  ,[
    [1,1,1,0,0,0,1,1,1]
    ,[1,1,1,0,0,0,1,1,1]
    ,[1,1,1,0,0,0,1,1,1]
    ,[0,0,0,3,0,3,0,0,0]
    ,[0,0,0,0,0,0,0,0,0]
    ,[0,0,0,3,0,3,0,0,0]
    ,[1,1,1,0,0,0,1,1,1]
    ,[1,1,1,0,0,0,1,1,1]
    ,[1,1,1,0,0,0,1,1,1]
  ]
  ,[
    [1,1,1,0,0,0,1,1,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[1,0,0,0,1,0,0,0,1]
    ,[0,0,0,0,3,0,0,0,0]
    ,[0,0,1,3,0,3,1,0,0]
    ,[0,0,0,0,3,0,0,0,0]
    ,[1,0,0,0,1,0,0,0,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[1,1,1,0,0,0,1,1,1]
  ]
  ,[
    [1,1,1,0,0,0,1,1,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[1,0,0,0,3,0,0,0,1]
    ,[0,0,0,0,1,0,0,0,0]
    ,[0,0,3,1,1,1,3,0,0]
    ,[0,0,0,0,1,0,0,0,0]
    ,[1,0,0,0,3,0,0,0,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[1,1,1,0,0,0,1,1,1]
  ]
  ,[
    [1,1,1,0,0,0,1,1,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[1,0,1,0,3,0,1,0,1]
    ,[0,0,0,0,0,0,0,0,0]
    ,[0,0,3,0,1,0,3,0,0]
    ,[0,0,0,0,0,0,0,0,0]
    ,[1,0,1,0,3,0,1,0,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[1,1,1,0,0,0,1,1,1]
  ]
  ,[
    [1,1,1,0,0,0,1,1,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[1,0,0,0,3,0,0,0,1]
    ,[0,0,0,1,0,1,0,0,0]
    ,[0,0,3,0,1,0,3,0,0]
    ,[0,0,0,1,0,1,0,0,0]
    ,[1,0,0,0,3,0,0,0,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[1,1,1,0,0,0,1,1,1]
  ]
  ,[
    [1,1,1,0,0,0,1,1,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[1,0,3,1,0,1,3,0,1]
    ,[0,0,1,1,0,1,1,0,0]
    ,[0,0,0,0,0,0,0,0,0]
    ,[0,0,1,1,0,1,1,0,0]
    ,[1,0,3,1,0,1,3,0,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[1,1,1,0,0,0,1,1,1]
  ]
  ,[
    [1,1,1,0,0,0,1,1,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[1,0,1,1,0,1,1,0,1]
    ,[0,0,1,3,0,3,1,0,0]
    ,[0,0,0,0,0,0,0,0,0]
    ,[0,0,1,3,0,3,1,0,0]
    ,[1,0,1,1,0,1,1,0,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[1,1,1,0,0,0,1,1,1]
  ]
  ,[
    [1,1,1,0,0,0,1,1,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[1,0,1,0,1,0,1,0,1]
    ,[0,0,0,3,0,3,0,0,0]
    ,[0,0,1,0,0,0,1,0,0]
    ,[0,0,0,3,0,3,0,0,0]
    ,[1,0,1,0,1,0,1,0,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[1,1,1,0,0,0,1,1,1]
  ]
];


/*
Defaul/Empty Room
  ,[
    [1,1,1,0,0,0,1,1,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[0,0,0,0,0,0,0,0,0]
    ,[0,0,0,0,0,0,0,0,0]
    ,[0,0,0,0,0,0,0,0,0]
    ,[1,0,0,0,0,0,0,0,1]
    ,[1,0,0,0,0,0,0,0,1]
    ,[1,1,1,0,0,0,1,1,1]
  ]
*/
