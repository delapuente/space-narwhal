/** Movement speed for the hero narwhal. */
const SPEED = 800;

export default class Narwhal extends Phaser.Sprite {

  constructor(game, x, y) {
    super(game, x, y, 'narwhal');
    this.anchor.setTo(0.5, 0.5);
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
  }

  move(direction) {
    this.body.velocity.x = direction.x * SPEED;
    this.body.velocity.y = direction.y * SPEED;
  }

};
