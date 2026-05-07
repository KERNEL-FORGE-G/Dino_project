export class GameOverScreen {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private visible: boolean = false;

  private score: number = 0;
  private highScore: number = 0;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;

    window.addEventListener("keydown", (e) => {
      if (!this.visible) return;
      if (e.key === "Enter" || e.key === " ") this.restart();
    });
  }

  private restart(): void {
    this.hide();
    window.dispatchEvent(new CustomEvent("restartGame"));
  }

  show(score: number, highScore: number): void {
    this.score = score;
    this.highScore = highScore;
    this.visible = true;
  }

  hide(): void { this.visible = false; }
  isVisible(): boolean { return this.visible; }

  draw(): void {
    if (!this.visible) return;

    const { width: W, height: H } = this.canvas;

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    this.ctx.fillRect(0, 0, W, H);

    this.ctx.textAlign = "center";

    this.ctx.font = "bold 36px monospace";
    this.ctx.fillStyle = "#ff4444";
    this.ctx.fillText("GAME OVER", W / 2, H * 0.35);

    this.ctx.font = "22px monospace";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillText(`Score : ${this.score}`, W / 2, H * 0.48);
    this.ctx.fillText(`Meilleur : ${this.highScore}`, W / 2, H * 0.56);

    this.ctx.font = "16px monospace";
    this.ctx.fillStyle = "#aaaaaa";
    this.ctx.fillText("Entrée ou Espace pour rejouer", W / 2, H * 0.72);
  }
}