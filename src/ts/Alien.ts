
export default class Alien extends Phaser.Sprite {

  constructor(game, x, y) {
    super(game, x, y, 'alien');
    this.anchor.setTo(0.5, 0.5);
  }

}