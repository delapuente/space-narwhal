import Alien from './Alien';
import Brain from './Brain';

class Formation extends Phaser.Group {

  points: Array<PIXI.Point>;

  _brain: Brain;

  _brainPosition: number;

  _rotationSpeed: number;

  _pulseParameters: { amplitude: number, speed: number };

  _startTime: number;

  _totalTime: number;

  _path: { x: Array<number>, y: Array<number> };

  _pathGoal: number;

  constructor(game: Phaser.Game, enemies: Array<Alien>, brainPosition: number) {
    super(game, game.world, 'group', false, true);
    this._brain = new Brain(this.game, this);
    this.game.physics.enable(this._brain);
    this._brainPosition = brainPosition;
    this.points = [];
    this.addMultiple(enemies.map(enemy => {
      const container = new Phaser.Group(this.game);
      container.addChild(enemy);
      return container;
    }), true);
    (<Phaser.Group>(this.children[brainPosition])).removeAll();
    (<Phaser.Group>(this.children[brainPosition])).addChild(this._brain);
    this._rotationSpeed = 0;
    this._pulseParameters = { amplitude: 0, speed: 0 };
    this._startTime = 0;
    this._totalTime = 0;
    this._path = { x: [], y: [] };
  }

  get brain() {
    return this._brain;
  }

  enableRotation(speed) {
    this._rotationSpeed = speed;
  }

  disableRotation() {
    this.enableRotation(0);
  }

  enablePulse(amplitude, speed) {
    this._pulseParameters.amplitude = amplitude;
    this._pulseParameters.speed = speed;
  }

  disablePulse() {
    this.enablePulse(0, 0);
  }

  enableMovement(path: Array<PIXI.Point>, time) {
    this._path.x = path.map(point => point.x);
    this._path.y = path.map(point => point.y);
    this._startTime = this.game.time.now;
    this._totalTime = time * 1000;
  }

  disabledMovement() {
    this.enableMovement([], 0);
  }

  update() {
    const t = this.game.time.now;
    const dt = this.game.time.physicsElapsed;
    this._rotate(t, dt);
    this._pulse(t, dt);
    this._move(t, dt);
  }

  destroy() {
    const length = this.children.length;
    const end = this._brainPosition + length;
    for (let i = this._brainPosition; i < end; i++) {
      setTimeout(() => {
        const index = i % length;
        const container = (<Phaser.Group>(this.children[index]));
        const alien = (<Alien>container.children[0]);
        if (alien) {
          alien.kill();
        }
      }, i * 50);
    }
  }

  _rotate(t, dt) {
    this.rotation += this._rotationSpeed;
  }

  _pulse(t, dt) {
    const children = (<Array<PIXI.DisplayObjectContainer>>this.children);
    const { amplitude, speed } = this._pulseParameters;
    children.forEach(container => {
      const alien = container.children[0];
      alien.y = amplitude * Math.sin(t * speed * dt);
    });
  }

  _move(t, dt) {
    var percentage = (t - this._startTime) / this._totalTime;
    this.x = this.game.math.bezierInterpolation(this._path.x, percentage);
    this.y = this.game.math.bezierInterpolation(this._path.y, percentage);
  }

}

class Diamond extends Formation {

  constructor(game, enemies: Array<Alien>, brainPosition: number, radius: number) {
    super(game, enemies.slice(0, 8), brainPosition);
    this._calculatePoints(radius);
    this.reset();
  }

  /** Calculate the places for the formation */
  _calculatePoints(radius: number) {
    this.points.push(new PIXI.Point(0, radius));
    this.points.push(new PIXI.Point(radius/2, radius/2));
    this.points.push(new PIXI.Point(radius, 0));
    this.points.push(new PIXI.Point(radius/2, -radius/2));
    this.points.push(new PIXI.Point(0, -radius));
    this.points.push(new PIXI.Point(-radius/2, -radius/2));
    this.points.push(new PIXI.Point(-radius, 0));
    this.points.push(new PIXI.Point(-radius/2, radius/2));
  }

  /** Place the enemies at the formation places. */
  reset() {
    const _90 = Math.PI/2;
    const _180 = Math.PI;
    for (let i = 0, l = this.children.length; i < l; i++) {
      const container = this.children[i];
      const point = this.points[i];
      container.position = point;
      container.rotation = Math.atan(point.y/point.x) +
                           _90 + (point.x < 0 ? _180 : 0);
    }
  }

}

export { Diamond, Formation };
