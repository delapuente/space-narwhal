import { Formation } from './Formation';

export default class Brain extends Phaser.Sprite {

  _formation: Formation;

  constructor(game, formation) {
    super(game, 0, 0, 'brain');
    this._formation = formation;
    this.anchor.setTo(0.5, 0.5);
  }

  get formation() {
    return this._formation;
  }

}
