import { AudioManager } from '../managers/AudioManager';

export class Menu {
    private audioManager: AudioManager;

    constructor(audioManager: AudioManager) {
        this.audioManager = audioManager;
    }

    /**
     * Dessine le menu sur le canvas
     */
    public draw(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, highScore: number): void {
        // Style suggéré : fond sombre 
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Texte blanc pour le titre 
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("DINE PROJECT", canvasWidth / 2, canvasHeight / 2 - 50);

        // Afficher le meilleur score [cite: 42]
        ctx.font = '20px Arial';
        ctx.fillText(`Meilleur Score: ${highScore}`, canvasWidth / 2, canvasHeight / 2);

        // Dessiner un bouton "Jouer" coloré [cite: 42, 45]
        ctx.fillStyle = '#ff4757';
        ctx.fillRect(canvasWidth / 2 - 50, canvasHeight / 2 + 30, 100, 40);
        ctx.fillStyle = 'white';
        ctx.fillText("JOUER", canvasWidth / 2, canvasHeight / 2 + 55);
    }

    /**
     * Cette méthode doit être appelée quand l'utilisateur clique sur le bouton Jouer
     */
    public handlePlayClick(): void {
        // RÈGLE D'OR : On débloque le son au moment du clic [cite: 43, 71]
        this.audioManager.unlock();
        this.audioManager.play('select'); // Joue le son de sélection [cite: 27, 28]
        
        console.log("Le jeu commence et l'audio est activé !");
        // Ici, on émettra plus tard un signal pour dire au Pôle A de lancer le jeu [cite: 44]
    }
}