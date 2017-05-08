import Enemy from './Enemy';
import { genFrames } from '../utils';

export default class Brain extends Enemy {

  readonly onBurst: Phaser.Signal = new Phaser.Signal();

  private _frames;

  constructor(game) {
    super(game, 'brain');
    this._frames = genFrames('', '.png', 4);
    this._setupAnimations();
    this.animations.play('idle');
  }

  burst() {
    this.onBurst.dispatch(this);
  }

  private _onCompleteAnimation() {

  }

  private _setupAnimations() {
    this.animations.add(
      'idle',
      this._frames('idle', [1, 5], [4, 2]), 7,
      true, false
    ).onComplete.add(this._onCompleteAnimation, this);
  }

}
