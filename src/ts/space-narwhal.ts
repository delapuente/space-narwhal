import Narwhal from './Narwhal';
import Alien from './Alien';
import Brain from './Brain';
import FormationManager from './FormationManager';
import { Diamond, Formation } from './Formation';

class Level extends Phaser.State {

  _narwhal: Narwhal;

  _formationManager: FormationManager;

  _formations: Array<Formation>;

  _brains: Array<Alien|Brain>;

  _keys: { [k: string]: Phaser.Key };

  init() {
    this._keys = this.game.input.keyboard.addKeys({
      left: Phaser.KeyCode.LEFT,
      right: Phaser.KeyCode.RIGHT,
      up: Phaser.KeyCode.UP,
      down: Phaser.KeyCode.DOWN
    });
    this._formations = [];
    this._brains = [];
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
    this._spawnFormations();
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

  _initFormations() {
    var levelData = this.game.cache.getJSON('level');
    this._formationManager.setup(levelData.formations);
  }

  _spawnFormations() {
    this._formationManager.spawnFormations();
  }

  _handleInput() {
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

  _handleCollisions() {
    this.game.physics.arcade.overlap(
      this._narwhal, this._formationManager.brains,
      this._onNarwhalVsBrain,
      null, this
    );
  }

  _onNarwhalVsBrain(narwhal, brain) {
    brain.kill();
  }
};

window.onload = () => {
  const level = new Level();
  const game = new Phaser.Game(1000, 1080, Phaser.AUTO, 'content', level);
};
