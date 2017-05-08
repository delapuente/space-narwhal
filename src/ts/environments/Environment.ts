
export default class Environment {

  protected _game: Phaser.Game;

  protected _layer: Phaser.Group;

  constructor(game: Phaser.Game) {
    this._game = game;
  }

  init(options, layer: Phaser.Group) {
    this._layer = layer;
    this._layer.classType = Phaser.Image;
    this._layer.create(0, 0, 'bg:background');
  }

  update() { }

}
