import Alien from './Alien';
import Brain from './Brain';

class Formation extends Phaser.Group {

  _rotationSpeed: number;

  _pulseParameters: { amplitude: number, speed: number };

  _path: {
    x: Array<number>, y: Array<number>,
    startTime: number, duration: number
  };

  _pathGoal: number;

  _enemies: Array<Alien>;

  _brains: Array<Brain>;

  constructor(game: Phaser.Game) {
    super(game);
    this._rotationSpeed = 1;
    this._pulseParameters = { amplitude: 0, speed: 0 };
    this._path = { x: [], y: [], startTime: 0, duration: Infinity };
    this._brains = [];
  }

  init(aliens: Array<Alien>, brains: Array<Brain>, brainPositions: Array<number>) {
    const alienContainers = this._buildShape();
    this.addMultiple(alienContainers, true);

    //TODO: Enable physics for aliens
    brains.forEach(brain => this.game.physics.enable(brain));

    // Assign enemies to containers
    const children = (<Array<PIXI.DisplayObjectContainer>>this.children);
    children.forEach((container, index) => {
      if (brainPositions.indexOf(index) >= 0) {
        const brain = brains.pop();
        brain.events.onKilled.addOnce(
          this._checkDestruction, this, 0, index
        );
        this._brains.push(brain);
        container.addChild(brain);
      }
      else {
        container.addChild(aliens.pop());
      }
    });
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
    this._path.startTime = this.game.time.now;
    this._path.duration = time * 1000;
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

  _checkDestruction(brain, formationIndex) {
    this._brains.splice(this._brains.indexOf(brain), 1);
    if (this._brains.length) {
      return;
    }
    this._destroyFormation(formationIndex);
  }

  _destroyFormation(from = 0) {
    const length = this.children.length;
    const end = from + length;
    for (let i = from; i < end; i++) {
      setTimeout(() => {
        const index = i % length;
        const container = (<Phaser.Group>(this.children[index]));
        const enemy = (<Phaser.Sprite>container.children[0]);
        if (enemy) {
          enemy.kill();
        }
      }, i * 50);
    }
  }

  _buildShape() {
    return [];
  }

  _rotate(t, dt) {
    this.rotation += this._rotationSpeed * dt;
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
    var percentage = (t - this._path.startTime) / this._path.duration;
    this.x = this.game.math.bezierInterpolation(this._path.x, percentage);
    this.y = this.game.math.bezierInterpolation(this._path.y, percentage);
  }

}

class Diamond extends Formation {

  static locations = 8;

  _radius: number;

  constructor(game, { radius }) {
    super(game);
    this._radius = radius;
  }

  _buildShape() {
    const _90 = Math.PI/2;
    const _180 = Math.PI;
    return this._calculatePoints(this._radius).map(point => {
      const container = new Phaser.Group(this.game);
      container.position = point;
      container.rotation = Math.atan(point.y/point.x) +
                           _90 + (point.x < 0 ? _180 : 0);
      return container;
    });
  }

  _calculatePoints(radius: number) {
    return [
      new Phaser.Point(0, radius),
      new Phaser.Point(radius/2, radius/2),
      new Phaser.Point(radius, 0),
      new Phaser.Point(radius/2, -radius/2),
      new Phaser.Point(0, -radius),
      new Phaser.Point(-radius/2, -radius/2),
      new Phaser.Point(-radius, 0),
      new Phaser.Point(-radius/2, radius/2)
    ];
  }

}

export { Diamond, Formation };
