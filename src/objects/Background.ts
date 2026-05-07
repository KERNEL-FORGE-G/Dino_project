import { WeatherManager } from "../managers/WeatherManager";
import { ZoneManager } from "../managers/ZoneManager";

type ZoneName = "green" | "orange" | "white";

export class Background {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private weather: WeatherManager;
  private zones: ZoneManager;

  private heads: Record<ZoneName, HTMLImageElement>;
  private bodies: Record<ZoneName, HTMLImageElement>;
  private feet: Record<ZoneName, HTMLImageElement[]>;

  private footFrame = 0;
  private footTimer = 0;
  private scrollX = 0;

  private stars: { x: number; y: number; size: number }[] = [];

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    weather: WeatherManager,
    zones: ZoneManager
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.weather = weather;
    this.zones = zones;

    const load = (src: string) => {
      const img = new Image();
      img.src = src;
      return img;
    };

    this.heads = {
      green:  load("assets/map/zones/green_head.png"),
      orange: load("assets/map/zones/orange_head.png"),
      white:  load("assets/map/zones/white_head.png"),
    };

    this.bodies = {
      green:  load("assets/map/zones/green_body.png"),
      orange: load("assets/map/zones/orange_body.png"),
      white:  load("assets/map/zones/white_body.png"),
    };

    this.feet = {
      green:  [load("assets/map/zones/green_foot1.png"), load("assets/map/zones/green_foot2.png")],
      orange: [load("assets/map/zones/orange_foot1.png"), load("assets/map/zones/orange_foot2.png")],
      white:  [
        load("assets/map/zones/white_foot1.png"),
        load("assets/map/zones/white_foot2.png"),
        load("assets/map/zones/white_foot3.png"),
        load("assets/map/zones/white_foot4.png"),
      ],
    };

    for (let i = 0; i < 80; i++) {
      this.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.4,
        size: 0.5 + Math.random() * 1.5,
      });
    }
  }

  private getZone(t: number): ZoneName {
    if (t < 0.4) return "green";
    if (t < 0.7) return "orange";
    return "white";
  }

  update(gameSpeed: number): void {
    this.scrollX -= gameSpeed;
    if (this.scrollX <= -this.canvas.width) this.scrollX = 0;

    this.footTimer++;
    if (this.footTimer >= 15) {
      this.footTimer = 0;
      const zone = this.getZone(this.zones.getTransitionFactor());
      this.footFrame = (this.footFrame + 1) % this.feet[zone].length;
    }
  }

  draw(): void {
    const t = this.zones.getTransitionFactor();
    const zone = this.getZone(t);
    const { width: W, height: H } = this.canvas;

    this.ctx.drawImage(this.heads[zone], 0, 0, W, H * 0.4);
    this.ctx.drawImage(this.bodies[zone], 0, H * 0.4, W, H * 0.35);

    if (t > 0.5) {
      this.ctx.save();
      this.ctx.fillStyle = "#ffffff";
      this.ctx.globalAlpha = (t - 0.5) * 2;
      for (const s of this.stars) {
        this.ctx.beginPath();
        this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }

    if (t > 0.6) {
      this.ctx.save();
      this.ctx.globalAlpha = (t - 0.6) * 2.5;
      this.ctx.fillStyle = "#f5f0d0";
      this.ctx.beginPath();
      this.ctx.arc(W * 0.85, H * 0.15, 20, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    const wt = this.weather.getWeatherType();
    if (wt === "Rain" || wt === "Snow") {
      this.ctx.save();
      this.ctx.globalAlpha = 0.25;
      this.ctx.fillStyle = "#333344";
      this.ctx.fillRect(0, 0, W, H * 0.5);
      this.ctx.restore();
    }

    const frame = this.feet[zone][this.footFrame % this.feet[zone].length];
    this.ctx.drawImage(frame, this.scrollX, H * 0.75, W, H * 0.25);
    this.ctx.drawImage(frame, this.scrollX + W, H * 0.75, W, H * 0.25);
  }
}