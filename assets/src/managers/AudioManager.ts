// Définition des types d'événements que le jeu peut envoyer
export type AudioEvent = 'jump' | 'die' | 'score' | 'bump' | 'select';

export class AudioManager {
    // 1. Le flag d'interaction (bloque le son tant que l'utilisateur n'a pas cliqué)
    private unlocked: boolean = false; [cite: 30]
    
    // Conteneur pour stocker tes sons préchargés
    private sounds: Map<string, HTMLAudioElement> = new Map();

    constructor() {
        // 2. Charger les sons au démarrage (préchargement)
        this.preload(); [cite: 17]
    }

    private preload(): void {
        // Liste des fichiers présents dans assets/Sounds/
        const files = [
            'sfx_jump.ogg', 'sfx_hurt.ogg', 'sfx_coin.ogg', 
            'sfx_bump.ogg', 'sfx_select.ogg'
        ];

        files.forEach(file => {
            const audio = new Audio(`assets/Sounds/${file}`); [cite: 17]
            this.sounds.set(file, audio);
        });
    }

    // 3. Méthode pour débloquer l'audio (sera appelée sur le bouton Start)
    public unlock(): void { 
        this.unlocked = true; [cite: 31]
    }

    // 4. Implémentation du mapping play(event)
    public play(event: AudioEvent): void {
        // Si l'utilisateur n'a pas cliqué sur Start, on ne joue rien
        if (!this.unlocked) return; [cite: 32]

        let fileName = '';

        // Mapping selon tes instructions 
        switch (event) {
            case 'jump': fileName = 'sfx_jump.ogg'; break;   [cite: 19, 20]
            case 'die': fileName = 'sfx_hurt.ogg'; break;    [cite: 21, 22]
            case 'score': fileName = 'sfx_coin.ogg'; break;  [cite: 23, 24]
            case 'bump': fileName = 'sfx_bump.ogg'; break;   [cite: 25, 26]
            case 'select': fileName = 'sfx_select.ogg'; break; [cite: 27, 28]
        }

        const sound = this.sounds.get(fileName);
        if (sound) {
            sound.currentTime = 0; // Rejoue le son du début
            sound.play();
        }
    }

    // 5. Contrôle de volume global
    public setVolume(v: number): void {
        this.sounds.forEach(audio => {
            audio.volume = v; [cite: 35]
        });
    }
}