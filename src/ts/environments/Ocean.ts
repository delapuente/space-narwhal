import Environment from './Environment';

export default class Ocean extends Environment {

  private _physicsTimeTotal: number = 0;

  private _fxStates;

  constructor(game: Phaser.Game) {
    super(game);
  }

  init({ fx, speeds }: { fx: number, speeds: Array<number> }, layer: Phaser.Group) {
    super.init({}, layer);
    const bg = this._layer.children[0] as Phaser.Image;
    this._fxStates = [];
    for (let i = 1; i <= fx; i++) {
      const fx = this._layer.create(0, 0, `bg:fx:${i}`) as Phaser.Image;
      const widthDifference = fx.width - bg.width;
      const offsetX = widthDifference / 2;
      fx.position.x = -offsetX;
      const speed = speeds[i - 1];
      const limits = [-widthDifference, 0];
      const direction = -1;
      this._fxStates.push({ layer: fx, speed, limits, direction });
    }
  }

  update() {
    const dt = this._game.time.physicsElapsed;
    this._physicsTimeTotal += dt;
    this._fxStates.forEach(state => {
      const { layer, speed, limits, direction } = state;
      const dv = direction * speed * dt;
      const currentPosition = layer.position.x += dv;
      if (currentPosition <= limits[0] || currentPosition >= limits[1]) {
        state.direction = -state.direction;
      }
    });
  }

}
