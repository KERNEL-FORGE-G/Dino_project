export interface ScoreEntry {
  name: string;
  score: number;
}

export class LeaderboardManager {
  private storageKey = "dino_leaderboard";

  // récupérer tous les scores
  getHighScores(): ScoreEntry[] {
    const data = localStorage.getItem(this.storageKey);

    if (!data) {
      return [];
    }

    return JSON.parse(data);
  }

  // sauvegarder un nouveau score
  saveScore(name: string, score: number): void {
    const scores = this.getHighScores();

    scores.push({
      name,
      score,
    });

    // trier du plus grand au plus petit
    scores.sort((a, b) => b.score - a.score);

    // garder seulement top 10
    const topScores = scores.slice(0, 10);

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(topScores)
    );
  }

  // supprimer leaderboard
  clearScores(): void {
    localStorage.removeItem(this.storageKey);
  }
}