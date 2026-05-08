export class Menu {
  private container: HTMLDivElement;
  private onStartCallback: () => void;
  private onToggleTheme!: () => void;  

  constructor(onStart: () => void,onToggleTheme: () => void) {
    this.onStartCallback = onStart;
    
    // Création du menu UI
    this.container = document.createElement("div");
    this.container.style.position = "absolute";
    this.container.style.top = "0";
    this.container.style.left = "0";
    this.container.style.width = "100%";
    this.container.style.height = "100%";
    this.container.style.display = "flex";
    this.container.style.flexDirection = "column";
    this.container.style.justifyContent = "center";
    this.container.style.alignItems = "center";
    this.container.style.background = "rgba(0,0,0,0.8)";
    this.container.style.color = "white";
    this.container.style.fontSize = "30px";
    this.container.style.zIndex = "1000";

    // Titre
    const title = document.createElement("h1");
    title.innerText = "DINO PROJECT";
    this.container.appendChild(title);
    

    // Bouton jouer
    const button = document.createElement("button");
    button.innerText = "Jouer";
    button.style.padding = "10px 20px";
    button.style.fontSize = "20px";
    button.style.cursor = "pointer";

    button.onclick = () => {
      this.hide();
      this.onStartCallback();
    };

    this.container.appendChild(button);

    const themeButton = document.createElement("button");

  themeButton.innerText = "🌙 Mode Nuit";

  themeButton.style.padding = "10px";
  themeButton.style.fontSize = "20px";
  themeButton.style.cursor = "pointer";

  themeButton.onclick = () => {
    this.onToggleTheme();
  };

this.container.appendChild(themeButton);

    document.body.appendChild(this.container);

  }

    show() {
  this.container.style.display = "flex";
}
  hide() {
    this.container.style.display = "none";
  }

}