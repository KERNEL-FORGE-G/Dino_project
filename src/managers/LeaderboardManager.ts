export interface ScoreEntry {
    name: string;
    score: number;
}

export class LeaderboardManager {
    private STORAGE_KEY = 'dino_scores';

    saveScore(newScore: number, playerName: string = 'Player 1') {
        const scores = this.getScores();
        scores.push({ name: playerName, score: newScore });

    // on fait le tri par ordre decroissant et on garde le meilleur 
    const topScores = scores.sort((a,b)=>b.score -a.score).slice(0,5);

   localStorage.setItem(this.STORAGE_KEY, JSON.stringify(topScores));
}
    getHighScore(): number {
        const scores = this.getScores();
        return scores.length > 0 ? (scores[0]?.score ?? 0) : 0;
    }

    private getScores(): ScoreEntry[] {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    }
} 