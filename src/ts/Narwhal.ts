import { genFrames } from './utils';

/** Movement speed for the hero narwhal. */
const SPEED = 800;

export default class Narwhal extends Phaser.Sprite {

  private _frames;

  constructor(game, x, y) {
    super(game, x, y, 'char:1', 'idle/0001.png');
    this._frames = genFrames('', '.png', 4);
    this.anchor.setTo(0.5);
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    this._setupAnimations();
  }

  move(direction) {
    this.body.velocity.x = direction.x * SPEED;
    this.body.velocity.y = direction.y * SPEED;
  }

  private _setupAnimations() {
    this.animations.add(
      'idle',
      this._frames('idle', [1, 5], [4, 2]), 10,
      true, false
    );
  }

};
