import type { ZoneType } from "../types";

export class ZoneManager {
  private zone: ZoneType = "Day";
  private factor: number = 0;

  update(score: number): void {
    this.zone = score >= 500 ? "Night" : "Day";
    const target = this.zone === "Night" ? 1 : 0;
    this.factor += (target - this.factor) * 0.005;
  }

  getZone(): ZoneType { return this.zone; }
  getTransitionFactor(): number { return this.factor; }
}