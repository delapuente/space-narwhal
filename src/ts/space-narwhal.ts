import Narwhal from './Narwhal';
import Alien from './Alien';
import Brain from './Brain';
import { Diamond, Formation } from './Formation';

class Level extends Phaser.State {

  _narwhal: Narwhal;

  _formations: Array<Formation>;

  _brains: Array<Alien|Brain>;

  keys: { [k: string]: Phaser.Key };

  constructor() {
    super();
    this._formations = [];
    this._brains = [];
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
    this.game.load.image('bg-ocean', 'assets/back-01.png');
    this.game.load.image('narwhal', 'assets/char-01.png');
    this.game.load.image('alien', 'assets/enemy-01.png');
    this.game.load.image('brain', 'assets/brain-01.png');
  }

  create() {
    this.game.add.image(0, 0, 'bg-ocean');
    this._spawnFormations();
    this._spawnNarwhal();
  }

  update() {
    this._handleInput();
    this._handleCollisions();
  }

  _spawnNarwhal() {
    this._narwhal = new Narwhal(
      this.game,
      this.game.world.centerX,
      this.game.world.centerY
    );
    this.game.add.existing(this._narwhal);
  }

  _spawnFormations() {
    var top = this.game.world.centerY - this.game.world.height / 2;
    var bottom = this.game.world.centerY + this.game.world.height / 2;
    var left = this.game.world.centerX - this.game.world.width / 2;
    var right = this.game.world.centerX + this.game.world.width / 2;
    let enemies = this._getAliens(8);
    let formation = new Diamond(this.game, enemies, 1, 200);
    this._brains.push(formation.brain);
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
    this._formations.push(formation);
  }

  _getAliens(count) {
    const aliens = [];
    for (let i = 0; i < count; i++) {
      const alien = new Alien(this.game, 0, 0);
      aliens.push(alien);
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
    this._narwhal.move(direction);
  }

  _handleCollisions() {
    this.game.physics.arcade.overlap(
      this._narwhal, this._brains,
      this._onNarwhalVsAlien,
      isBrain, this
    );

    function isBrain(_, enemy) {
      return enemy instanceof Brain;
    }
  }

  _onNarwhalVsAlien(narwhal, enemy) {
    (<Brain>enemy).formation.destroy();
  }
};

window.onload = () => {
  const level = new Level();
  const game = new Phaser.Game(1000, 1080, Phaser.AUTO, 'content', level);
};
