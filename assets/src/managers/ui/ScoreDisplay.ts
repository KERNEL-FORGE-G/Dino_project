export class ScoreDisplay {
    // On définit où on veut afficher le score (en haut à droite) 
    private x: number = 0;
    private y: number = 30;

    /**
     * Cette méthode dessine les infos sur le canvas à chaque image du jeu
     */
    public draw(ctx: CanvasRenderingContext2D, canvasWidth: number, score: number, highScore: number, lives: number): void {
        this.x = canvasWidth - 150; // Positionnement à droite

        // 1. Affichage du score actuel
        ctx.fillStyle = 'white';
        ctx.font = '20px "Courier New"'; // Utilisation d'une belle police
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${score.toString().padStart(5, '0')}`, this.x, this.y);

        // 2. Affichage du meilleur score (HI: XXXXX) 
        ctx.font = '16px "Courier New"';
        ctx.fillText(`HI: ${highScore.toString().padStart(5, '0')}`, this.x, this.y + 25);

        // 3. Affichage des vies restantes
        // On dessine un petit texte ou on prépare l'emplacement pour les icônes life1.png
        ctx.fillText(`Vies: ${'❤️'.repeat(lives)}`, this.x, this.y + 50);
    }
}