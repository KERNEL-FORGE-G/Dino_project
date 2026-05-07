export type AvatarType = 'dino' | 'robot' | 'ninja';

export class AvatarManager {
    private currentAvatar: AvatarType = 'dino';

    private avatarSprites: Record<AvatarType, { run: string, jump: string }> = {
        dino: { run: 'assets/dino/run.png', jump: 'assets/dino/jump.png' },
        robot: { run: 'assets/robot/run.png', jump: 'assets/robot/jump.png' },
        ninja: { run: 'assets/ninja/run.png', jump: 'assets/ninja/jump.png' }
    };

    setAvatar(type: AvatarType) {
        this.currentAvatar = type;
    }

    getSprites() {
        return this.avatarSprites[this.currentAvatar];
    }
}