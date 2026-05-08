import { AudioManager } from '../managers/AudioManager';

export class GameOverScreen {
    private audioManager: AudioManager;

    constructor(audioManager: AudioManager) {
        this.audioManager = audioManager;
    }

    /**
     * Affiche l'écran de Game Over
     */
    public show(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, finalScore: number, highScore: number): void {
        // Jouer le son de défaite [cite: 50]
        this.audioManager.play('die');

        // Fond sombre transparent pour laisser voir le jeu derrière
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)'; // Un léger voile rouge pour le feedback 
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Texte "GAME OVER" 
        ctx.fillStyle = 'white';
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2 - 40);

        // Score final et Meilleur score 
        ctx.font = '25px Arial';
        ctx.fillText(`Score Final: ${finalScore}`, canvasWidth / 2, canvasHeight / 2 + 10);
        ctx.fillText(`Meilleur Score: ${highScore}`, canvasWidth / 2, canvasHeight / 2 + 45);

        // Bouton Rejouer 
        ctx.fillStyle = '#2ed573';
        ctx.fillRect(canvasWidth / 2 - 60, canvasHeight / 2 + 70, 120, 40);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText("REJOUER", canvasWidth / 2, canvasHeight / 2 + 95);
    }

    /**
     * Appelé lors du clic sur "Rejouer" 
     */
    public handleRestartClick(): void {
        this.audioManager.play('select');
        console.log("Redémarrage du jeu...");
    }
}