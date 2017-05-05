import Narwhal from './Narwhal';
import { Brain } from './enemies';
import FormationManager from './FormationManager';

class Level extends Phaser.State {

  private _narwhal: Narwhal;

  private _formationManager: FormationManager;

  private _keys: { [k: string]: Phaser.Key };

  init() {
    this._keys = this.game.input.keyboard.addKeys({
      left: Phaser.KeyCode.LEFT,
      right: Phaser.KeyCode.RIGHT,
      up: Phaser.KeyCode.UP,
      down: Phaser.KeyCode.DOWN
    });
    this._formationManager = new FormationManager(this.game);
  }

  preload() {
    this.game.load.json('level', 'levels/L0101.json');
    this.game.load.image('bg-ocean', 'assets/back-01.png');
    this.game.load.image('narwhal', 'assets/char-01.png');
    this.game.load.image('alien', 'assets/enemy-01.png');
    this.game.load.image('brain', 'assets/brain-01.png');
  }

  create() {
    this.game.add.image(0, 0, 'bg-ocean');
    this._spawnNarwhal();
    this._initFormations();
  }

  update() {
    this._formationManager.update();
    this._handleInput();
    this._handleCollisions();
  }

  private _spawnNarwhal() {
    this._narwhal = new Narwhal(
      this.game,
      this.game.world.centerX,
      this.game.world.centerY
    );
    this.game.add.existing(this._narwhal);
  }

  private _initFormations() {
    var levelData = this.game.cache.getJSON('level');
    this._formationManager.init(levelData.formations);
  }

  private _handleInput() {
    const direction = { x: 0, y: 0 };
    if (this._keys.left.isDown) {
      direction.x = -1;
    }
    if (this._keys.right.isDown) {
      direction.x = 1;
    }
    if (this._keys.up.isDown) {
      direction.y = -1;
    }
    if (this._keys.down.isDown) {
      direction.y = 1;
    }
    this._narwhal.move(direction);
  }

  private _handleCollisions() {
    this.game.physics.arcade.overlap(
      this._narwhal, this._formationManager.brains,
      this._onNarwhalVsBrain,
      undefined, this
    );
  }

  _onNarwhalVsBrain(narwhal, brain: Brain) {
    brain.burst();
  }
};

window.onload = () => {
  const level = new Level();
  const game = new Phaser.Game(1000, 1080, Phaser.AUTO, 'content', level);
};
