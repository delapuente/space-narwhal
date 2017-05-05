import { Enemy, Alien, Brain } from './enemies';
import { Path, Pulse, RadialFormation, Diamond, Delta } from './Formation';

type TypeOf<T> = new (..._) => T;

const FORMATIONS: { [s: string]: TypeOf<RadialFormation> } = {
  'Diamond': Diamond,
  'Delta': Delta
};

type PulseSpec = Pulse;

type PathSpec = Array<[string|number, string|number]>;

type FormationSpec = {
  shape: string,
  brainPositions: Array<number>,
  rotate?: number,
  pulse?: PulseSpec,
  follow?: { path: PathSpec, duration: number },
  delay?: number,
  at?: number
};

export default class FormationManager {

  private readonly _game: Phaser.Game;

  private _physicsTimeTotal: number = 0;

  private readonly _screen: { [s: string]: number };

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
    //TODO: Inject in the constructor.
    const semiWidth = this._game.width / 2;
    const semiHeight = this._game.height / 2;
    const centerX = this._game.world.centerX;
    const centerY = this._game.world.centerY;
    const top = centerY - semiHeight;
    const bottom = centerY + semiHeight;
    const left = centerX - semiWidth;
    const right = centerX + semiWidth;
    this._screen = {
      centerX, centerY, top, bottom, left, right,
      get randomX() {
        return Math.random() * (this.right - this.left) + this.left;
      },
      get randomY() {
        return Math.random() * (this.bottom - this.top) + this.top;
      }
    };
  }

  init(formations: Array<FormationSpec>) {
    this._formations = formations;
    this._timeOrigin = this._physicsTimeTotal;
    this._allocateAliens(100);
    this._allocateBrains(50);
    this._updateDeadline();
  }

  update() {
    this._physicsTimeTotal += this._game.time.physicsElapsed;
    this._spawnFormations();
  }

  private _updateDeadline() {
    if (!this._formations.length) {
      this._deadline = Infinity;
    }
    else {
      let { at, delay } = this._formations[0];
      if (typeof at !== 'undefined') {
        at = Math.max(0, at || 0);
        this._deadline = this._timeOrigin + at;
      }
      else {
        delay = Math.max(0, delay || 0);
        if (!isFinite(this._deadline)) {
          this._deadline = this._timeOrigin;
        }
        this._deadline += delay;
      }
    }
  }

  private _spawnFormations() {
    const now = this._physicsTimeTotal;
    if (this._formations.length && now >= this._deadline) {
      const formationData = /*this._formations[0] as FormationSpec;*/this._formations.shift() as FormationSpec;
      const formation = this._spawnFormation(formationData);
      this._applyEffects(formationData, formation);
      this._updateDeadline();
    }
  }

  private _spawnFormation(formationData: FormationSpec) {
    const { shape, brainPositions } = formationData;
    const FormationClass = FORMATIONS[shape];
    const formation = new FormationClass(this._game, formationData);
    const { locations } = formation;
    const brainCount = brainPositions.length;
    const enemies = this._getAliens(locations.length - brainCount);
    const brains = this._getBrains(brainCount);

    formation.init(enemies, brains, brainPositions);
    return this._game.add.existing(formation);
  }

  private _allocateAliens(count: number) {
    this._allocateEnemies(Alien, count);
  }

  private _allocateBrains(count: number) {
    this._allocateEnemies(Brain, count);
  }

  private _getAliens(count: number) {
    return this._getEnemies(Alien, count);
  }

  private _getBrains(count: number) {
    return this._getEnemies(Brain, count);
  }

  private _getEnemies<E extends Enemy>(klass: TypeOf<E>, count: number) {
    const items: Array<E> = [];
    const type = klass.name.toLowerCase();
    for (let i = 0, l = this._enemies[type].length; i < l; i++) {
      let enemy = this._enemies[type][i];
      if (!enemy.alive) {
        enemy.reset(0, 0);
        items.push(enemy);
      }
      if (items.length === count) {
        return items;
      }
    }
    items.concat(this._allocateEnemies(klass, count - items.length));
    return items;
  }

  private _allocateEnemies<E extends Enemy>(klass: TypeOf<E>, count: number) {
    const items: Array<E> = [];
    const type = klass.name.toLowerCase();
    for (let i = 0; i < count; i++) {
      let enemy = new klass(this._game);
      this._enemies[type].push(enemy);
      items.push(enemy);
      enemy.kill();
    }
    return items;
  }

  private _applyEffects(formationData: FormationSpec, formation: RadialFormation) {
    const { pulse, rotate, follow } = formationData;
    if (pulse) {
      formation.enablePulse(pulse.amplitude, pulse.frequency);
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

    function toPoint([kx, ky]: [number | string, number | string]) {
      const { [kx]: x = kx, [ky]: y = ky } = this._screen;
      return new Phaser.Point(<number>x, <number>y);
    }
  }

};
