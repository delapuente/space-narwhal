import { genFrames } from './utils';
import { Brain } from './enemies';

/** Movement speed for the hero narwhal. */
const SPEED = 800;

export default class Narwhal extends Phaser.Sprite {

  private _frames;

  private _attacking: boolean = false;

  constructor(game, x, y) {
    super(game, x, y, 'char:1', 'idle/0001.png');
    this._frames = genFrames('', '.png', 4);
    this.anchor.setTo(0.5);
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    this._setupAnimations();
  }

  attack(brain: Brain) {
    brain.burst();
    this._attacking = true;
  }

  move(direction) {
    this.body.velocity.x = direction.x * SPEED;
    this.body.velocity.y = direction.y * SPEED;
  }

  update() {
    this.animations.play(this._getAnimation());
    if (this._attacking) {
      this.animations.currentAnim.onComplete.addOnce(() => {
        this._attacking = false;
      });
    }
  }

  private _getAnimation() {
    let animation = 'idle';
    if (this._attacking) {
      animation = 'attack';
    }
    return animation;
  }

  private _setupAnimations() {
    this.animations.add(
      'idle',
      this._frames('idle', [1, 5], [4, 2]), 10,
      true, false
    );
    this.animations.add(
      'attack',
      this._frames('attack', [1, 6], [6], [6], [6]), 25
    );
  }

};
