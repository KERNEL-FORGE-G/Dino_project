# Dino_project
TP  de ict202 ayant pour but de refaire le jeu du dinosaure emblematique de google chrome en y ajoutant une touche personnel
 EN ce qui concerne ce tp ELISEE ET Ange Trecy(moi meme) avons la charge de realiser les taches suivantes:

 Pôle B : L'Environnement Dynamique (APIs & Temps Réel)
      - Mission : Connecter le jeu à une API météo (OpenWeatherMap) pour
        détecter la pluie et utiliser l'horloge système pour le mode Jour/Nuit.
      - Livrable : Une fonction qui renvoie isRaining, isNight et la ville
        actuelle.

        le travail donne a donc effectivement ete termine et pour pousser un peu plus loin et faire des verifiactaion ELISE a implementer ZoneManager.ts, Background.ts, Particle.ts, et je me suis charger d'integrer tout cela dans le code original.

        Pour ce qui est des sources des images elles sont toutes disponible dans le dossier assets/map/zones
        tout ce qui est implemente est dans le code source et les image utilise sont dans le dossier assets/map/zones

Background.ts : rendu head/body/foot animé selon la zone (green/orange/white),
  transition jour/nuit progressive, étoiles, lune, voile pluie/neige

ZoneManager.ts : calcul du facteur de transition (0 = jour, 1 = nuit)
  selon le score (seuil à 500), interpolation douce

WeatherManager.ts : récupération Open-Meteo toutes les 10min,
  expose getWeatherType(), getRainIntensity(), getWindSpeed()

Particle.ts : particules pluie et neige, position/vitesse influencée
  par le vent de WeatherManager

  PARTIE 2

  Je me suis charge des fichiers allant de 1 a 3 puis 8 a 9 comme donne dans le document technique du pole b et elise s'est charge des fichiers 4 a 7