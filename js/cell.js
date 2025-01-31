class Cell {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.isWall = false;
    this.isStart = false; // Track if this cell is the start
    this.isEnd = false; // Track if this cell is the end
  }
}
