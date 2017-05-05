export default abstract class Enemy extends Phaser.Sprite {

  constructor(game: Phaser.Game, key: string) {
    super(game, 0, 0, key);
    this.anchor.setTo(0.5);
  }

  reset() {
    super.reset(0, 0);
    for (let name in this.events) {
      const member = this.events[name];
      if (member instanceof Phaser.Signal) {
        (member as Phaser.Signal).removeAll();
      }
    }
    return this;
  }

}
