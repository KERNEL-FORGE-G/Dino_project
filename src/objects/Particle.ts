export class Particle {
  x: number;
  y: number;

  width: number;
  height: number;

  speedY: number;

  color: string;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    speedY: number,
    color: string
  ) {
    this.x = x;
    this.y = y;

    this.width = width;
    this.height = height;

    this.speedY = speedY;

    this.color = color;
  }

  update(canvasHeight: number) {
    this.y += this.speedY;

    // recommencer en haut
    if (this.y > canvasHeight) {
      this.y = -this.height;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;

    ctx.fillRect(
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}