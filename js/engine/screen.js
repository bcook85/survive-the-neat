class Screen {
  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    // Automatically re-size game canvas
    window.addEventListener(
      "resize", () => { this.autoFullscreen(); }
      ,false
    );
    window.addEventListener(
      "orientationchange", () => { this.autoFullscreen(); }
      ,false
    );
    this.autoFullscreen();
  };
  textStyle(font, alignment, color) {
    this.ctx.font = font;
    this.ctx.textAlign = alignment;
    this.ctx.fillStyle = color;
  };
  drawText(text, x, y, font, alignment, color) {
    this.ctx.font = font;
    this.ctx.textAlign = alignment;
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
  };
  drawBall(x, y, r, c) {
    this.ctx.fillStyle = c;
    this.ctx.beginPath();
    this.ctx.arc(
      Math.floor(x)
      ,Math.floor(y)
      ,r
      ,0
      ,Math.PI * 2
    );
    this.ctx.fill();
  };
  drawLine(x1, y1, x2, y2, c, w=1) {
    this.ctx.strokeStyle = c;
    this.ctx.lineWidth = w;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  };
  clearScreen(color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  };
  autoFullscreen() {
    let newWidth = Math.floor(this.canvas.parentElement.clientWidth);
    let newHeight = Math.floor(window.innerHeight);
    let aspectRatio = this.canvas.width / this.canvas.height;
    if (newWidth / newHeight > aspectRatio) {//wide
      newWidth = Math.floor(newHeight * aspectRatio);
      this.canvas.style.height = newHeight + "px";
      this.canvas.style.width = newWidth + "px";
    }
    else {//tall
      newHeight = Math.floor(newWidth / aspectRatio);
      this.canvas.style.width = newWidth + "px";
      this.canvas.style.height = newHeight + "px";
    }
  };
};
