class Menu {
  constructor(maze) {
    this.maze = maze;
    this.menuElement = document.getElementById("menu");
    this.createMenu();
  }

  createMenu() {
    const playButton = document.createElement("button");
    playButton.textContent = "Play";
    playButton.onclick = () => this.maze.runBFS();

    const resetButton = document.createElement("button");
    resetButton.textContent = "Clear";
    resetButton.onclick = () => this.maze.clear_grid();

    const dropdown = document.createElement("select");
    const bfsOption = document.createElement("option");
    bfsOption.textContent = "Breath First";
    dropdown.appendChild(bfsOption);

    const label = document.createElement("label");

    // Append dropdown to label
    label.appendChild(dropdown);

    const arrow = document.createElement("svg");
    arrow.innerHTML = `<use xlink:href="#select-arrow-down"></use>`; // Replace `#sprite-arrow-down` with the actual ID
    label.appendChild(arrow);

    // Add the down arrow SVG (referencing the sprite)

    // You can add more algorithms here in the future

    //this.menuElement.appendChild(label);
    this.menuElement.appendChild(playButton);
    this.menuElement.appendChild(resetButton);
  }
}
