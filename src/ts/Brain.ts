import { Formation } from './Formation';

export default class Brain extends Phaser.Sprite {

  _formationIndex: number;

  get index() {
    return this._formationIndex;
  }

  set index(v) {
    this._formationIndex = v;
  }

  constructor(game, x = 0, y = 0) {
    super(game, x, y, 'brain');
    this.anchor.setTo(0.5, 0.5);
  }

}
