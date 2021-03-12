class Menu {
  constructor(pos, size) {
    this.pos = new Vector(pos.x, pos.y);
    this.size = new Vector(size.x, size.y);
    this.display = true;
    this.buttons = [];
    this.lineHeight = 18;
  };
  drawBackground(ctx) {
    ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
  };
  drawLineText(ctx, text, x, line) {
    ctx.fillText(text, this.pos.x + (this.size.x * x), this.pos.y + (this.lineHeight * line));
  };
  hoverCheck(mousePos) {
    for (let i = 0; i < this.buttons.length; i++) {
      if (this.buttons[i].vsVector(mousePos)) {
        this.buttons[i].isHover = true;
      } else {
        this.buttons[i].isHover = false;
      }
    }
  };
  clickCheck(mousePos) {
    let found = false;
    for (let i = 0; i < this.buttons.length; i++) {
      if (this.buttons[i].vsVector(mousePos)) {
        found = true;
        break;
      }
    }
    if (found) {
      for (let i = 0; i < this.buttons.length; i++) {
        this.buttons[i].isSelected = false;
        if (this.buttons[i].vsVector(mousePos)) {
          this.buttons[i].callback(this.buttons[i].value);
          this.buttons[i].isSelected = true;
        }
      }
    }
  };
  addButton(pos, size, text, callback, value) {
    let button = new Box(this.pos.add(pos), size);
    button.text = text;
    button.colorBackground = "#222";
    button.colorText = "white";
    button.colorBackgroundHover = "#666";
    button.colorTextHover = "black";
    button.callback = callback;
    button.isHover = false;
    button.value = value;
    button.isSelected = false;
    this.buttons.push(button);
  };
};
