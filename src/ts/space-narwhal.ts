import Narwhal from './Narwhal';
import { Alien, Brain } from './enemies';
import FormationManager from './FormationManager';
import { SpaceNarwhalLoader } from './utils';
import { Ocean } from './environments';
import { White } from './shaders';

class Level extends Phaser.State {

  private _environment: Ocean;

  private _narwhal: Narwhal;

  private _formationManager: FormationManager;

  private _keys: { [k: string]: Phaser.Key };

  private _score: Phaser.Text;

  init() {
    Phaser.Filter.White = White;
    this.game.load = new SpaceNarwhalLoader(this.game);
    this._keys = this.game.input.keyboard.addKeys({
      left: Phaser.KeyCode.LEFT,
      right: Phaser.KeyCode.RIGHT,
      up: Phaser.KeyCode.UP,
      down: Phaser.KeyCode.DOWN
    });
    this._formationManager = new FormationManager(this.game);
    this._environment = new Ocean(this.game);
  }

  preload() {
    this.game.load.atlasJSONHash(
      'char:1',
      'assets/animations/char-01.png', 'assets/animations/char-01.json'
    );
    this.game.load.atlasJSONHash(
      'alien',
      'assets/animations/enemy-01.png', 'assets/animations/enemy-01.json'
    );
    this.game.load.atlasJSONHash(
      'brain',
      'assets/animations/brain-01.png', 'assets/animations/brain-01.json'
    );
    this.game.load.json('level', 'levels/L0101.json');
    this.game.load.webfont('score-font', 'Revalia');
    this.game.load.image('bg:background', 'assets/back-01.png');
    this.game.load.image('bg:fx:1', 'assets/back-fx-back.png');
    this.game.load.image('bg:fx:2', 'assets/back-fx-front.png');
    this.game.load.image('narwhal', 'assets/char-01.png');
    this.game.load.image('hud:heart', 'assets/hud-life.png');
    this.game.load.image('hud:enemy', 'assets/hud-enemy.png');
  }

  create() {
    const bgLayer = this.game.add.group();
    const enemyLayer = this.game.add.group();
    const characterLayer = this.game.add.group();
    const hudLayer = this.game.add.group();
    this._initEnvironment(bgLayer);
    this._spawnNarwhal(characterLayer);
    this._initFormations(enemyLayer);
    this._createHud(hudLayer);
  }

  update() {
    this._formationManager.update();
    this._environment.update();
    this._handleInput();
    this._handleCollisions();
    this._updateHud();
  }

  private _createHud(hudLayer: Phaser.Group) {
    // Lives
    const hearts = new Phaser.Group(this.game);
    for (let i = 0, l = this._narwhal.lives; i < l; i++) {
      const heart =
        new Phaser.Image(this.game, 0, -52 - (i * 60), 'hud:heart');
      hearts.addChild(heart);
    }
    hearts.position.setTo(20, 1045);
    hudLayer.addChild(hearts);
    this._narwhal.onDropLife.add(() => {
      hearts.removeChildAt(hearts.length - 1);
    });

    // Score
    const score = new Phaser.Group(this.game);
    const enemyIndicator = new Phaser.Image(this.game, 0, 0, 'hud:enemy');
    this._score = new Phaser.Text(this.game, 45, 0, 'x0000', {
      font: 'Revalia',
      fontSize: '38px',
      fill: 'white'
    });
    this._score.setShadow(1, 1, 'black', 5);
    score.addChild(enemyIndicator);
    score.addChild(this._score);
    score.updateTransform();
    score.position.setTo(15, 15);
    hudLayer.addChild(score);
  }


  private _initEnvironment(layer: Phaser.Group) {
    this._environment.init({ fx: 2, speeds: [10, 20] }, layer);
  }

  private _initFormations(layer: Phaser.Group) {
    var levelData = this.game.cache.getJSON('level');
    this._formationManager.init(levelData.formations, layer);
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
    this.game.physics.arcade.overlap(
      this._narwhal, this._formationManager.aliens,
      this._onNarwhalVsAlien,
      undefined, this
    );
  }

  private _onNarwhalVsAlien(narwhal: Narwhal, alien: Alien) {
    narwhal.takeDamage();
  }

  private _onNarwhalVsBrain(narwhal: Narwhal, brain: Brain) {
    narwhal.attack(brain);
  }

  private _spawnNarwhal(layer: Phaser.Group) {
    this._narwhal = new Narwhal(
      this.game,
      this.game.world.centerX,
      this.game.world.centerY
    );
    layer.addChild(this._narwhal);
    this._narwhal.events.onOutOfBounds.addOnce(() => {
      this.game.state.start(this.game.state.current);
    });
    this._narwhal.onDie.addOnce(() => {
      this.game.camera.onFadeComplete.addOnce(() => {
        this.game.camera.resetFX();
        this.game.state.start(this.game.state.current);
      });
      this.game.camera.fade(0, 5000);
    }, this);
  }

  private _updateHud() {
    const text = `x${pad(this._formationManager.enemyKilled)}`;
    this._score.setText(text);

    function pad(n) {
      const str = n + '';
      return '0000'.slice(0, 4 - str.length) + str;
    }
  }
};

window.onload = () => {
  const level = new Level();
  const game = new Phaser.Game(1000, 1080, Phaser.AUTO, 'content', level);
};
