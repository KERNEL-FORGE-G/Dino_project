import { Menu } from "./ui/Menu.js";
import { GameOverScreen } from "./ui/GameOverScreen.js";
import { LeaderboardManager } from "./managers/LeaderboardManager.js";
import { ScoreDisplay } from "./ui/ScoreDisplay.js";
import { Particle } from "./objects/Particle.js";

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private menu: Menu;
  private gameOverScreen: GameOverScreen;
  private leaderboard: LeaderboardManager;
  private score: number = 0;
  private scoreDisplay: ScoreDisplay;
  private isRunning: boolean = false;
  private particles: Particle[] = [];

  constructor() {
    // Canvas
    const canvas = document.getElementById("gameCanvas");

    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error("Canvas introuvable");
    }

    this.canvas = canvas;

    this.canvas.width = 1000;
    this.canvas.height = 500;
    this.scoreDisplay = new ScoreDisplay();

    const context = this.canvas.getContext("2d");

    if (!context) {
      throw new Error("Contexte canvas introuvable");
    }

    this.ctx = context;

    // Menu connecté au jeu
    this.menu = new Menu(() => this.startGame());

    this.leaderboard = new LeaderboardManager();

    this.gameOverScreen = new GameOverScreen(
    () => this.startGame(), // restart
    (name: string) => this.leaderboard.saveScore(name, this.score)
    );

   for (let i = 0; i < 100; i++) {
  this.particles.push(
    new Particle(
      Math.random() * this.canvas.width,
      Math.random() * this.canvas.height,
      2,
      15,
      4,
      "blue"
    )
  );
}
  }

  start() {
    this.menu.show();
  }

  startGame() {
    console.log("Le jeu commence !");
    this.isRunning = true;
    this.loop();
    this.score = 0;
    this.scoreDisplay.show();
  }

  loop() {
    if (!this.isRunning) return;

    this.update();
    this.render();

    requestAnimationFrame(() => this.loop());
  }

  update() {
  if (!this.isRunning) return;

  // augmenter le score
  this.score++;

  // récupérer highscore
  const highScores = this.leaderboard.getHighScores();

  const highScore = highScores.length > 0? highScores[0]!.score: 0;

  // mettre à jour affichage score
  this.scoreDisplay.update(
    this.score,
    highScore
  );

  // TEST TEMPORAIRE GAME OVER
  // enlever plus tard
  if (this.score >= 500) {
    this.gameOver();
  }

  for (const particle of this.particles) {
  particle.update(this.canvas.height);
  }
}

 render() {
  // nettoyer canvas
  this.ctx.clearRect(
    0,
    0,
    this.canvas.width,
    this.canvas.height
  );

  // dessiner particules
  for (const particle of this.particles) {
    particle.draw(this.ctx);
  }

  // texte jeu
  this.ctx.fillStyle = "black";
  this.ctx.font = "40px Arial";

  this.ctx.fillText(
    "Dino Project Running...",
    300,
    250
  );
}
gameOver() {
  this.isRunning = false;

  this.scoreDisplay.hide();

  this.gameOverScreen.show(this.score);
}
}
