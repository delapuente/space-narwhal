import Narwhal from './Narwhal';
import Alien from './Alien';
import { Diamond, Formation } from './Formation';

class Level extends Phaser.State {

  narwhal: Narwhal;

  formations: Array<Formation>;

  keys: { [k: string]: Phaser.Key };

  constructor() {
    super();
    this.formations = [];
  }

  init() {
    this.keys = this.game.input.keyboard.addKeys({
      left: Phaser.KeyCode.LEFT,
      right: Phaser.KeyCode.RIGHT,
      up: Phaser.KeyCode.UP,
      down: Phaser.KeyCode.DOWN
    });
  }

  preload() {
    this.game.load.image('narwhal', 'placeholders/char-placeholder.png');
    this.game.load.image('alien', 'placeholders/enemy-placeholder.png');
    this.game.load.image('brain', 'placeholders/brain-placeholder.png');
  }

  create() {
    this._spawnNarwhal();
    this._spawnFormations();
  }

  update() {
    this._handleInput();
  }

  _spawnNarwhal() {
    this.narwhal = new Narwhal(
      this.game,
      this.game.world.centerX,
      this.game.world.centerY
    );
    this.game.add.existing(this.narwhal);
  }

  _spawnFormations() {
    var top = this.game.world.centerY - this.game.world.height / 2;
    var bottom = this.game.world.centerY + this.game.world.height / 2;
    var left = this.game.world.centerX - this.game.world.width / 2;
    var right = this.game.world.centerX + this.game.world.width / 2;
    let enemies = this._getAliens(8);
    let formation = new Diamond(this.game, enemies, 200);
    formation.enableRotation(0.01);
    formation.enablePulse(50, 0.2);
    formation.enableMovement(
      [
        new PIXI.Point(this.game.world.centerX, top),
        new PIXI.Point(left, this.game.world.centerY),
        new PIXI.Point(right, this.game.world.centerY),
        new PIXI.Point(this.game.world.centerX, bottom)
      ],
      30
    );
    formation.position.x = this.game.world.centerX;
    formation.position.y = this.game.world.centerY;
    this.game.add.existing(formation);
    this.formations.push(formation);
  }

  _getAliens(count) {
    const aliens = [];
    for (let i = 0; i < count; i++) {
      aliens.push(new Alien(this.game, 0, 0));
    }
    return aliens;
  }

  _handleInput() {
    const direction = { x: 0, y: 0 };
    if (this.keys.left.isDown) {
      direction.x = -1;
    }
    if (this.keys.right.isDown) {
      direction.x = 1;
    }
    if (this.keys.up.isDown) {
      direction.y = -1;
    }
    if (this.keys.down.isDown) {
      direction.y = 1;
    }
    this.narwhal.move(direction);
  }
};

window.onload = () => {
  const level = new Level();
  const game = new Phaser.Game(1000, 1080, Phaser.AUTO, 'content', level);
};
