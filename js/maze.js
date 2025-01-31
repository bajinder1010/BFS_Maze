class Maze {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.cellSize = 0;
    this.cols = 0;
    this.rows = 0;
    this.grid = [];
    this.queue = [];
    this.initial_max_grid_size = 23;
    this.menu_width = 323;
    this.startCell = new Cell(0, 0);
    this.endCell = null; // Will be set in resizeCanvas
    this.dragging = null;
    this.clicking = null; // Track which cell is being dragged
    this.isRunning = false;
  }

  set_cell_size() {
    let ratio = (window.innerWidth - this.menu_width) / window.innerHeight;
    if (ratio > 1) {
      this.cellSize = Math.floor(
        (window.innerWidth - this.menu_width) / this.initial_max_grid_size
      );
    } else {
      this.cellSize = Math.floor(
        window.innerHeight / this.initial_max_grid_size
      );
    }
  }

  drawGrid() {
    this.set_cell_size();
    this.cols = Math.floor(
      (window.innerWidth - this.menu_width) / this.cellSize
    ); // Updated for menu width
    this.rows = Math.floor(window.innerHeight / this.cellSize);
    this.canvas.width = this.cols * this.cellSize;
    this.canvas.height = this.rows * this.cellSize;

    // Set endCell to the last column and middle row
    if (!this.dragging && !this.clicking) {
      this.endCell = new Cell(Math.floor(this.rows / 2), this.cols - 1);
      this.endCell.isEnd = true; // Mark as end cell
    }

    //this.grid = [];
    for (let row = 0; row < this.rows; row++) {
      const rowArray = [];
      for (let col = 0; col < this.cols; col++) {
        rowArray.push(new Cell(row, col));
      }
      this.grid.push(rowArray);
    }
    if (!this.dragging && !this.clicking) {
      this.startCell = new Cell(Math.floor(this.rows / 2), 0);
      this.startCell.isStart = true; // Mark the start cell
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let row of this.grid) {
      for (let cell of row) {
        if (cell.isWall) {
          this.ctx.fillStyle = "black";
          this.ctx.fillRect(
            cell.col * this.cellSize,
            cell.row * this.cellSize,
            this.cellSize,
            this.cellSize
          );
        }
      }

      this.drawStartCell(this.startCell); // Ensure start cell is drawn
      this.drawEndCell(this.endCell);
    }
  }

  drawStartCell(cell) {
    this.ctx.fillStyle = "green";
    this.ctx.fillRect(
      cell.col * this.cellSize,
      cell.row * this.cellSize,
      this.cellSize,
      this.cellSize
    );
  }

  drawEndCell(cell) {
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(
      cell.col * this.cellSize,
      cell.row * this.cellSize,
      this.cellSize,
      this.cellSize
    );
  }

  clear() {
    if (window.innerWidth > this.menu_width + 50) {
      this.drawGrid();
    }
  }

  clear_grid() {
    // Reset the grid to its initial state (no walls)
    this.grid = Array.from({ length: this.rows }, (_, row) =>
      Array.from({ length: this.cols }, (_, col) => new Cell(row, col))
    );

    // Clear the entire canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Redraw the start and end cells
    this.drawStartCell(this.startCell);
    this.drawEndCell(this.endCell);
  }

  async runBFS() {
    if (this.isRunning) return; // Prevent multiple runs
    this.clear();
    this.isRunning = true;
    const directions = [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 },
    ];

    this.queue = [{ cell: this.startCell, path: [] }];
    const visited = Array.from({ length: this.rows }, () =>
      Array(this.cols).fill(false)
    );
    visited[this.startCell.row][this.startCell.col] = true;

    let found = false;
    let path = [];

    while (this.queue.length > 0) {
      const { cell, path: currentPath } = this.queue.shift();
      const newPath = [...currentPath, cell];

      // Highlight the cell being explored
      this.highlightCell(cell, "#F2A71B");

      // Redraw start and end cells after highlighting the current cell
      this.drawStartCell(this.startCell); // Ensure start cell is redrawn
      this.drawEndCell(this.endCell); // Ensure end cell is redrawn

      // Check if we reached the end cell
      if (cell.row === this.endCell.row && cell.col === this.endCell.col) {
        path = newPath;
        found = true;
        break;
      }

      for (const direction of directions) {
        const newRow = cell.row + direction.row;
        const newCol = cell.col + direction.col;

        if (
          newRow >= 0 &&
          newRow < this.rows &&
          newCol >= 0 &&
          newCol < this.cols &&
          !visited[newRow][newCol] &&
          !this.grid[newRow][newCol].isWall
        ) {
          visited[newRow][newCol] = true;
          this.queue.push({ cell: new Cell(newRow, newCol), path: newPath });
        }
      }

      await this.delay(10); // Delay for animation
    }
    if (found) {
      await this.animatePath(path);
      this.isRunning = false;
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async animatePath(path) {
    for (let i = 1; i < path.length - 1; i++) {
      const cell = path[i];
      this.highlightCellPath(cell, "#FFFCD9");
      await this.delay(20); // Delay for each step in the path
    }
  }

  highlightCell(cell, color) {
    this.ctx.fillStyle = color;
    //this.ctx.fillRect(cell.col * this.cellSize, cell.row * this.cellSize, this.cellSize, this.cellSize);
    this.ctx.beginPath();
    this.ctx.arc(
      cell.col * this.cellSize + this.cellSize / 2,
      cell.row * this.cellSize + this.cellSize / 2,
      this.cellSize / 2.8,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }

  highlightCellPath(cell, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      cell.col * this.cellSize,
      cell.row * this.cellSize,
      this.cellSize,
      this.cellSize
    );
    this.ctx.beginPath();
    this.ctx.strokeStyle = "#F2D5BB";
    this.ctx.strokeRect(
      cell.col * this.cellSize,
      cell.row * this.cellSize,
      this.cellSize,
      this.cellSize
    );
  }

  handleCanvasClick(event) {
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    // Toggle wall creation, but don't toggle on start or end cells
    if (
      (row === this.startCell.row && col === this.startCell.col) ||
      (row === this.endCell.row && col === this.endCell.col)
    )
      return;

    this.grid[row][col].isWall = !this.grid[row][col].isWall;
    this.clicking = "clicked";
    this.drawGrid();
  }

  startDrag(event) {
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);

    // Check if the clicked cell is the start or end cell
    if (row === this.startCell.row && col === this.startCell.col) {
      this.dragging = "start";
    } else if (row === this.endCell.row && col === this.endCell.col) {
      this.dragging = "end";
    } else {
      this.dragging = "cell";
    }
  }

  drag(event) {
    event.preventDefault();
    if (this.dragging) {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const col = Math.floor(x / this.cellSize);
      const row = Math.floor(y / this.cellSize);

      // Prevent dragging to wall cells
      if (
        this.grid[row] &&
        this.grid[row][col] &&
        !(row === this.startCell.row && col === this.startCell.col) &&
        !(row === this.endCell.row && col === this.endCell.col)
      ) {
        if (this.dragging === "start") {
          this.startCell = new Cell(row, col);
          this.startCell.isStart = true; // Mark the new start cell
        } else if (this.dragging === "end") {
          this.endCell = new Cell(row, col);
          this.endCell.isEnd = true; // Mark the new end cell
        } else {
          this.grid[row][col].isWall = true;
        }

        this.drawGrid();
        this.drawStartCell(this.startCell); // Draw updated start cell
        this.drawEndCell(this.endCell); // Draw updated end cell
      }
    }
  }

  stopDrag() {
    this.dragging = null;
  }
  setupEventListeners() {
    this.canvas.addEventListener("click", (event) =>
      this.handleCanvasClick(event)
    );
    window.addEventListener("resize", () => {
      this.clear();
    });
    this.canvas.addEventListener("mousedown", (event) => this.startDrag(event));
    this.canvas.addEventListener("mousemove", (event) => this.drag(event));
    this.canvas.addEventListener("mouseup", () => this.stopDrag());
    this.canvas.addEventListener("mouseleave", () => this.stopDrag());
  }
}
