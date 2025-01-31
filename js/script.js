window.onload = function () {
  const canvas = document.getElementById("mazeCanvas");
  const maze = new Maze(canvas);
  maze.drawGrid();
  maze.setupEventListeners();
  const menu = new Menu(maze);
};
