export class ScoreDisplay {
  private scoreElement: HTMLDivElement;
  private highScoreElement: HTMLDivElement;

  constructor() {
    // score actuel
    this.scoreElement = document.createElement("div");

    this.scoreElement.style.position = "absolute";
    this.scoreElement.style.top = "20px";
    this.scoreElement.style.right = "20px";
    this.scoreElement.style.color = "black";
    this.scoreElement.style.fontSize = "24px";
    this.scoreElement.style.fontFamily = "Arial";

    // high score
    this.highScoreElement = document.createElement("div");

    this.highScoreElement.style.position = "absolute";
    this.highScoreElement.style.top = "50px";
    this.highScoreElement.style.right = "20px";
    this.highScoreElement.style.color = "black";
    this.highScoreElement.style.fontSize = "20px";
    this.highScoreElement.style.fontFamily = "Arial";

    document.body.appendChild(this.scoreElement);
    document.body.appendChild(this.highScoreElement);
  }

  update(score: number, highScore: number) {
    this.scoreElement.innerText = `Score : ${score}`;
    this.highScoreElement.innerText = `High Score : ${highScore}`;
  }

  hide() {
    this.scoreElement.style.display = "none";
    this.highScoreElement.style.display = "none";
  }

  show() {
    this.scoreElement.style.display = "block";
    this.highScoreElement.style.display = "block";
  }
}