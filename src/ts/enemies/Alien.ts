import Enemy from './Enemy';
import { genFrames } from '../utils';

export default class Alien extends Enemy {

  private _frames;

  constructor(game) {
    super(game, 'alien');
    this._frames = genFrames('', '.png', 4);
    this._setupAnimations();
    this.animations.play('idle');
  }

  private _onCompleteAnimation() {

  }

  private _setupAnimations() {
    this.animations.add(
      'idle',
      this._frames('idle', [1, 5], [4, 2]), 8,
      true, false
    ).onComplete.add(this._onCompleteAnimation, this);
  }

}
