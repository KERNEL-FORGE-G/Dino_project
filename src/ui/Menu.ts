export class Menu {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private visible: boolean = true;

  private options = ["Jouer", "Leaderboard"];
  private selected: number = 0;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;

    window.addEventListener("keydown", (e) => this.handleKey(e));
  }

  private handleKey(e: KeyboardEvent): void {
    if (!this.visible) return;

    if (e.key === "ArrowUp") this.selected = (this.selected - 1 + this.options.length) % this.options.length;
    if (e.key === "ArrowDown") this.selected = (this.selected + 1) % this.options.length;
    if (e.key === "Enter") this.confirm();
  }

  private confirm(): void {
    if (this.selected === 0) this.hide();
    if (this.selected === 1) window.dispatchEvent(new CustomEvent("showLeaderboard"));
  }

  show(): void { this.visible = true; }
  hide(): void { this.visible = false; }
  isVisible(): boolean { return this.visible; }

  draw(): void {
    if (!this.visible) return;

    const { width: W, height: H } = this.canvas;

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    this.ctx.fillRect(0, 0, W, H);

    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = `bold 40px monospace`;
    this.ctx.textAlign = "center";
    this.ctx.fillText("DINO", W / 2, H * 0.3);

    this.options.forEach((option, i) => {
      const y = H * 0.5 + i * 50;
      this.ctx.font = `${i === this.selected ? "bold" : ""} 24px monospace`;
      this.ctx.fillStyle = i === this.selected ? "#ffdd57" : "#ffffff";
      this.ctx.fillText(i === this.selected ? `> ${option}` : option, W / 2, y);
    });

    this.ctx.font = "14px monospace";
    this.ctx.fillStyle = "#aaaaaa";
    this.ctx.fillText("↑ ↓ pour naviguer — Entrée pour confirmer", W / 2, H * 0.85);
  }
}