# Dino_project
TP  de ict202 ayant pour but de refaire le jeu du dinosaure emblematique de google chrome en y ajoutant une touche personnel
#   HASSANE YOUSSOUF OUMARE 
Leaderboard System (Tableau des scores)

Description
Le système de leaderboard permet de sauvegarder, trier et afficher les meilleurs scores des joueurs dans le jeu Dino. Les données sont stockées localement dans le navigateur grâce à localStorage.

Fonctionnalités
  Ajouter un nouveau score
  Récupérer les meilleurs scores
  Trier automatiquement les scores (du plus élevé au plus faible)
  Garder uniquement le Top 10
  Supprimer le leaderboard

LeaderboardManager
│
├── getHighScores()   → récupérer les scores
├── saveScore()       → ajouter + trier + sauvegarder
└── clearScores()     → supprimer les données


Particle System (Système de particules)

Description
Le système de particules permet d’ajouter des effets visuels dynamiques au jeu (ex : pluie, poussière, neige, ambiance de fond). Chaque particule est un petit élément graphique animé sur le canvas.

Fonctionnalités
  Création de particules dynamiques
  Mouvement vertical automatique
  Réinitialisation lorsqu’une particule sort de l’écran
  Rendu graphique sur canvas HTML5
  Personnalisation (couleur, vitesse, taille)

  Structure de la classe
Particle
│
├── x, y         → position de la particule
├── width, height→ taille
├── speedY       → vitesse verticale
├── color        → couleur
├── update()     → met à jour la position
└── draw()       → affiche la particule

Game Over Screen

Description
L’écran Game Over s’affiche lorsque le joueur perd. Il permet de voir le score, entrer un pseudo, sauvegarder le score et relancer le jeu.

Fonctionnalités
  Affichage du score final
  Input pour pseudo joueur
  Sauvegarde du score
  Bouton restart (rejouer)
  Interface HTML dynamique

Architecture

GameOverScreen
│
├── show(score)     → affiche écran
├── hide()          → cache écran
├── onSaveScore()   → sauvegarde score
└── onRestart()     → relance jeu

Main Menu (Écran d’accueil)

Description
Le menu principal est la première interface du jeu. Il permet au joueur de démarrer une nouvelle partie via un bouton "Jouer".

Fonctionnalités
  Affichage du menu principal
  Titre du jeu
  Bouton "Jouer"
  Lancement du jeu via callback
  Interface HTML dynamique

Structure
Menu
│
├── show()        → afficher menu
├── hide()        → cacher menu
└── onStart()     → démarrer le jeu

Score Display (HUD du jeu)

Description
Le système ScoreDisplay permet d’afficher en temps réel le score du joueur ainsi que le meilleur score atteint.

Fonctionnalités
  Affichage du score en temps réel
  Affichage du High Score
  Mise à jour dynamique 
  Interface HTML overlay
  Gestion show/hide

Structure

ScoreDisplay
│
├── update(score, highScore)
├── show()
└── hide()

Dino Game (TypeScript Canvas)

Description
Ce projet est une réplique du jeu Dino de Google Chrome, développé en TypeScript avec Canvas API. Il inclut un système de score, particules animées, menu interactif et leaderboard.

Gameplay
    Le jeu démarre depuis un menu principal
    Le score augmente automatiquement
    Le joueur perd à une condition définie (prototype)
    Un écran Game Over permet de sauvegarder le score
    Le meilleur score est conservé

Architecture du projet

Game (Engine principal)
│
├── Menu
├── GameOverScreen
├── ScoreDisplay (HUD)
├── LeaderboardManager
├── Particle System
└── Canvas Renderer

Fonctionnalités
    🎮 Gameplay
    Boucle de jeu 60 FPS
    Système de score dynamique
    Game Over screen
    Restart automatique
    📊 UI
    Menu principal
    HUD score + high score
    Écran Game Over interactif
    🌧️ Effets visuels
    Système de particules
    Animation fluide canvas
    🏆 Système de score
    Sauvegarde locale (localStorage)
    Top 10 scores
    Tri automatique

Entry Point (Démarrage du jeu)

Description
Le fichier principal initialise et démarre le jeu en créant une instance de la classe Game.

Rôle
    Initialisation du moteur de jeu
    Lancement du menu principal
    Point d’entrée de l’application

Architecture
main.ts
│
└── Game (engine principal)
    ├── Menu
    ├── Gameplay
    ├── Score
    └── Game Over