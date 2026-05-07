export class ScoreDisplay {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  draw(score: number, highScore: number): void {
    const { width: W } = this.canvas;

    this.ctx.font = "bold 18px monospace";
    this.ctx.textAlign = "right";

    this.ctx.fillStyle = "#aaaaaa";
    this.ctx.fillText(`HI ${String(highScore).padStart(5, "0")}`, W - 20, 30);

    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillText(String(score).padStart(5, "0"), W - 110, 30);
  }
}