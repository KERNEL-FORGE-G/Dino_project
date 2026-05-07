export class GameOverScreen {
  private container: HTMLDivElement;
  private onRestart: () => void;
  private onSaveScore: (name: string) => void;

  constructor(
    onRestart: () => void,
    onSaveScore: (name: string) => void
  ) {
    this.onRestart = onRestart;
    this.onSaveScore = onSaveScore;

    // créer UI
    this.container = document.createElement("div");
    this.container.style.position = "absolute";
    this.container.style.top = "0";
    this.container.style.left = "0";
    this.container.style.width = "100%";
    this.container.style.height = "100%";
    this.container.style.background = "rgba(0,0,0,0.8)";
    this.container.style.color = "white";
    this.container.style.display = "none";
    this.container.style.flexDirection = "column";
    this.container.style.alignItems = "center";
    this.container.style.justifyContent = "center";
    this.container.style.fontFamily = "Arial";

    document.body.appendChild(this.container);
  }

  show(score: number) {
    this.container.innerHTML = "";

    const title = document.createElement("h1");
    title.innerText = "Game Over";

    const scoreText = document.createElement("p");
    scoreText.innerText = `Score: ${score}`;

    const input = document.createElement("input");
    input.placeholder = "Ton pseudo";
    input.style.padding = "10px";
    input.style.margin = "10px";

    const saveBtn = document.createElement("button");
    saveBtn.innerText = "Enregistrer score";
    saveBtn.style.padding = "10px";
    saveBtn.style.margin = "5px";

    const restartBtn = document.createElement("button");
    restartBtn.innerText = "Rejouer";
    restartBtn.style.padding = "10px";

    saveBtn.onclick = () => {
      const name = input.value || "Anonyme";
      this.onSaveScore(name);
    };

    restartBtn.onclick = () => {
      this.hide();
      this.onRestart();
    };

    this.container.appendChild(title);
    this.container.appendChild(scoreText);
    this.container.appendChild(input);
    this.container.appendChild(saveBtn);
    this.container.appendChild(restartBtn);

    this.container.style.display = "flex";
  }

  hide() {
    this.container.style.display = "none";
  }
}