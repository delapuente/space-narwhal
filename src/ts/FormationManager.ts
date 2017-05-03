import Alien from './Alien';
import Brain from './Brain';
import { Formation, Diamond } from './Formation';

const FORMATIONS = {
  'Diamond': Diamond
};

export default class FormationManager {

  _formations: any[];

  _timeOrigin: number;

  _deadline: number;

  _game: Phaser.Game;

  _screen: any;

  _brains: Array<Brain>;

  get brains() {
    return this._brains;
  }

  constructor(game: Phaser.Game) {
    this._game = game;
    this._brains = [];
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

  setup(formations: any[]) {
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

  _updateDeadline() {
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
        if (!this._deadline) {
          this._deadline = this._timeOrigin;
        }
        this._deadline += delay * 1000;
      }
    }
  }

  _spawnFormation(formationData) {
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

  _getAliens(count: number) {
    const items = [];
    for (let i = 0; i < count; i++)  {
      items.push(new Alien(this._game));
    }
    return items;
  }

  _getBrains(count: number) {
    const items = [];
    for (let i = 0; i < count; i++)  {
      items.push(new Brain(this._game));
    }
    this._brains.push(...items);
    return items;
  }

  _applyEffects(formationData, formation) {
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
