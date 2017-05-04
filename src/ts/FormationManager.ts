import { Enemy, Alien, Brain } from './enemies';
import { Path, Pulse, Formation, Diamond } from './Formation';

const FORMATIONS: { [s:string]: { new (): Formation } } = {
  'Diamond': Diamond
};

type FormationSpec = {
  shape: string,
  brainPositions: Array<number>,
  rotate?: number,
  pulse?: Pulse,
  path?: Path,
  delay?: number,
  at?: number
};

export default class FormationManager {

  private readonly _game: Phaser.Game;

  private readonly _screen: { [s:string]: number };

  private readonly _enemies: {
    alien: Array<Alien>;
    brain: Array<Brain>;
  } = {
    alien: [],
    brain: []
  };

  private _formations: Array<FormationSpec>;

  private _timeOrigin: number = -Infinity;

  private _deadline: number = Infinity;

  get brains() {
    return this._enemies.brain;
  }

  constructor(game: Phaser.Game) {
    this._game = game;
    const semiWidth = this._game.width / 2;
    const semiHeight = this._game.height / 2;
    const centerX = this._game.world.centerX;
    const centerY = this._game.world.centerY;
    const top = centerY - semiHeight;
    const bottom = centerY + semiHeight;
    const left = centerX - semiWidth;
    const right = centerX + semiWidth;
    this._screen = { centerX, centerY, top, bottom, left, right };
  }

  init(formations: Array<FormationSpec>) {
    this._formations = formations;
    this._timeOrigin = this._game.time.now;
    this._updateDeadline();
  }

  spawnFormations() {
    const now = this._game.time.now;
    if (this._formations.length && now >= this._deadline) {
      const formationData = this._formations.shift();
      const formation = this._spawnFormation(formationData);
      this._applyEffects(formationData, formation);
      this._updateDeadline();
    }
  }

  private _updateDeadline() {
    if (!this._formations.length) {
      this._deadline = Infinity;
    }
    else {
      let { at, delay } = this._formations[0];
      if (typeof at !== 'undefined') {
        at = Math.max(0, at || 0);
        this._deadline = this._timeOrigin + at * 1000;
      }
      else {
        delay = Math.max(0, delay || 0);
        if (!isFinite(this._deadline)) {
          this._deadline = this._timeOrigin;
        }
        this._deadline += delay * 1000;
      }
    }
  }

  private _spawnFormation(formationData: FormationSpec) {
    const { shape, brainPositions } = formationData;
    const FormationConstructor = FORMATIONS[shape];
    const totalLocations = FormationConstructor.locations;
    const brainCount = brainPositions.length;
    const enemies = this._getAliens(totalLocations - brainCount);
    const brains = this._getBrains(brainCount);
    const formation = new FormationConstructor(this._game, formationData);
    formation.init(enemies, brains, brainPositions);
    return this._game.add.existing(formation);
  }

  private _getAliens(count: number) {
    return this._getEnemies(Alien, count);
  }

  private _getBrains(count: number) {
    return this._getEnemies(Brain, count);
  }

  private _getEnemies(klass: {new (): Enemy}, count: number) {
    const items: Array<Enemy> = [];

    // From the pool
    var type = klass.name.toLowerCase();
    for (let i = 0, l = this._enemies[type].length; i < l; i++)  {
      let enemy = this._enemies[type][i];
      if (!enemy.alive) {
        enemy.reset(0, 0);
        items.push(enemy);
      }
      if (items.length === count) {
        return items;
      }
    }

    // Brand new
    for (let i = 0, l = count - items.length; i < l; i++) {
      let enemy = new klass(this._game);
      this._enemies[type].push(enemy);
      items.push(enemy);
    }
    return items;
  }

  private _applyEffects(formationData, formation) {
    const { pulse, rotate, follow } = formationData;
    if (pulse) {
      formation.enablePulse(pulse.amplitude, pulse.speed);
    }
    if (rotate) {
      formation.enableRotation(rotate);
    }
    if (follow) {
      const { path, duration } = follow;
      formation.enableMovement(
        path.map(toPoint, this),
        duration
      );
    }

    function toPoint([x, y]) {
      x = x in this._screen ? this._screen[x] : x;
      y = y in this._screen ? this._screen[y] : y;
      return new Phaser.Point(x, y);
    }
  }

};
