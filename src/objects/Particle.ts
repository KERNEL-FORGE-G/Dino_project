import type { WeatherType } from "../types";

export class Particle {
  x: number;
  y: number;
  private speed: number;
  private size: number;
  private opacity: number;
  private type: WeatherType;
  private wind: number;

  constructor(canvasWidth: number, canvasHeight: number, type: WeatherType, wind: number) {
    this.type = type;
    this.wind = wind;
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * -canvasHeight;

    if (type === "Snow") {
      this.speed = 1 + Math.random() * 2;
      this.size = 3 + Math.random() * 4;
      this.opacity = 0.6 + Math.random() * 0.4;
    } else {
      this.speed = 8 + Math.random() * 6;
      this.size = 10 + Math.random() * 8;
      this.opacity = 0.3 + Math.random() * 0.4;
    }
  }

  update(canvasWidth: number, canvasHeight: number): void {
    this.y += this.speed;
    this.x += this.wind * 0.05;

    if (this.y > canvasHeight) {
      this.y = -this.size;
      this.x = Math.random() * canvasWidth;
    }
    if (this.x > canvasWidth) this.x = 0;
    if (this.x < 0) this.x = canvasWidth;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = this.opacity;

    if (this.type === "Snow") {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = "#a0c4ff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.wind * 0.1, this.y + this.size);
      ctx.stroke();
    }

    ctx.restore();
  }
}