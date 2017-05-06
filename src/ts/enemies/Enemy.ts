import { RadialFormation } from '../Formation';

export default abstract class Enemy extends Phaser.Sprite {

  get distance() {
    return this._distance;
  }

  get formation() {
    return this._formation;
  }

  get placement() {
    return this._placement;
  };

  private _distance: number|undefined;

  private _formation: RadialFormation;

  private readonly _placement: Phaser.Point = new Phaser.Point();

  constructor(game: Phaser.Game, key: string) {
    super(game, 0, 0, key);
    this.anchor.setTo(0.5);
  }

  place(formation: RadialFormation, x: number, y: number): this {
    super.reset(x, y);
    this.updateTransform();
    this._formation = formation;
    this._placement.setTo(x, y);
    this._distance = this._placement.getMagnitude();
    this._resetEvents();
    return this;
  }

  private _resetEvents() {
    for (let name in this.events) {
      const member = this.events[name];
      if (member instanceof Phaser.Signal) {
        (member as Phaser.Signal).removeAll();
      }
    }
  }

}
