export default abstract class Enemy extends Phaser.Sprite {

  constructor(game: Phaser.Game, key: string) {
    super(game, 0, 0, key);
    this.anchor.setTo(0.5);
  }

}
