export default abstract class Enemy extends Phaser.Sprite {

  get distance() {
    return this._distance;
  }

  get placement() {
    return this._placement;
  };

  private _distance: number|undefined;

  private readonly _placement: Phaser.Point = new Phaser.Point();

  constructor(game: Phaser.Game, key: string) {
    super(game, 0, 0, key);
    this.anchor.setTo(0.5);
  }

  //TODO: Consider a separated .place() method to highlight the relation
  // between the enemy and the formation.
  reset(x: number, y: number, health?: number | undefined): this {
    super.reset(x, y, health);
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
