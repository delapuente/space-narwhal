import { Enemy, Alien, Brain } from './enemies';

const DEG_90 = Math.PI / 2;
const DEG_180 = Math.PI;
const DEG_360 = 2 * Math.PI;

type Pulse = { amplitude: number, frequency: number };

type Path = {
  x: Array<number>, y: Array<number>,
  startTime: number, duration: number
};

abstract class RadialFormation extends Phaser.Group {

  abstract locations: Array<Phaser.Point>;

  paused: boolean;

  private readonly _brains: Array<Brain> = [];

  private _rotation: number = 0;

  private _path: Path = {
    x: [], y: [],
    startTime: -Infinity, duration: Infinity
  };

  private _physicsTimeTotal: number = 0;

  private _pulse: Pulse = { amplitude: 0, frequency: 0 };

  constructor(game: Phaser.Game) {
    super(game);
  }

  init(aliens: Array<Alien>, brains: Array<Brain>, brainPositions: Array<number>) {
    //TODO: Enable physics for aliens
    brains.forEach(brain => {
      brain.onBurst.addOnce(this._tryToDestroy, this);
      this.game.physics.enable(brain);
      this._brains.push(brain);
    });

    this._place(aliens, brains, brainPositions);
  }

  enableRotation(speed) {
    this._rotation = speed;
  }

  disableRotation() {
    this.enableRotation(0);
  }

  enablePulse(amplitude, speed) {
    this._pulse.amplitude = amplitude;
    this._pulse.frequency = speed;
  }

  disablePulse() {
    this.enablePulse(0, 0);
  }

  enableMovement(path: Array<PIXI.Point>, time) {
    this._path.x = path.map(point => point.x);
    this._path.y = path.map(point => point.y);
    this._path.startTime = this._physicsTimeTotal;
    this._path.duration = time;
  }

  disabledMovement() {
    this.enableMovement([], 0);
  }

  update() {
    if (!this.paused) {
      const dt = this.game.time.physicsElapsed;
      const t = this._physicsTimeTotal += dt;
      this._rotate(t, dt);
      this._pulsate(t, dt);
      this._move(t, dt);
      this._checkOutOfScreen();
    }
  }

  private _checkOutOfScreen() {
    const { x, y, width, height } = this.getBounds();
    const formationBounds = new Phaser.Rectangle(x, y, width, height);
    const cameraView = this.game.camera.view;
    const isOutside =
      !Phaser.Rectangle.intersects(formationBounds, cameraView);
    if (isOutside) {
      this._destroyImmediately();
    }
  }

  private _destroyAnimated() {
    this._destroyShape().then(
      () => this.destroy(false)
    );
  }

  private _destroyImmediately() {
    this.callAll('kill', null);
    this.destroy(false);
  }

  protected _destroyShape(): Promise<void> {
    return new Promise<void>(fulfil => {
      const length = this.children.length;
      for (let index = 0; index < length; index++) {
        setTimeout(() => {
          const enemy = this.children[index] as Enemy;
          if (enemy) {
            enemy.kill();
          }
          if (index === length - 1) {
            fulfil();
          }
        }, index * 50);
      }
    });
  }

  private _move(t: number, dt: number) {
    const percentage = (t - this._path.startTime) / this._path.duration;
    this.x = this.game.math.bezierInterpolation(this._path.x, percentage);
    this.y = this.game.math.bezierInterpolation(this._path.y, percentage);
  }

  private _place(aliens: Array<Alien>, brains: Array<Brain>, brainPositions: Array<number>) {
    this.locations.forEach(({ x, y }, index) => {
      const isBrainPlace = brainPositions.indexOf(index) >= 0;
      const enemy = isBrainPlace ? brains.pop() : aliens.pop();
      if (enemy) {
        enemy.place(this, x, y);
        enemy.rotation = Math.atan(y / x) + DEG_90 + (x < 0 ? DEG_180 : 0);
        this.addChild(enemy);
      }
    });
  }

  private _pulsate(t: number, dt: number) {
    const children = this.children as Array<Enemy>;
    const { amplitude, frequency } = this._pulse;
    children.forEach(enemy => {
      const { rotation, distance } = enemy;
      if (distance === undefined) {
        console.error('Enemy is not correctly placed in the formation.');
      }
      else {
        const offset = distance + amplitude;
        const displacement =
          amplitude * Math.sin(DEG_360 * frequency * t) + offset;
        enemy.x = displacement * Math.cos(rotation - DEG_90);
        enemy.y = displacement * Math.sin(rotation - DEG_90);
      }
    });
  }

  private _rotate(t: number, dt: number) {
    this.rotation += this._rotation * dt;
  }

  private _tryToDestroy(brain: Brain) {
    this.paused = true;
    this._brains.splice(this._brains.indexOf(brain), 1)[0].kill();
    if (this._brains.length === 0) {
      this._destroyAnimated();
    }
    else {
      this.paused = false;
    }
  }
}

type DiamonParameters = { radius: number };
class Diamond extends RadialFormation {

  private static defaults: DiamonParameters = { radius: 100 };

  private readonly _radius: number;

  get locations() {
    const radius = this._radius;
    return [
      new Phaser.Point(0, radius),
      new Phaser.Point(radius / 2, radius / 2),
      new Phaser.Point(radius, 0),
      new Phaser.Point(radius / 2, -radius / 2),
      new Phaser.Point(0, -radius),
      new Phaser.Point(-radius / 2, -radius / 2),
      new Phaser.Point(-radius, 0),
      new Phaser.Point(-radius / 2, radius / 2)
    ];
  }

  constructor(game: Phaser.Game, { radius } = Diamond.defaults) {
    super(game);
    this._radius = radius;
  }

  protected _buildShape() {
    return this.locations.map(point => {
      const container = new Phaser.Group(this.game);
      container.position = point;
      container.rotation = Math.atan(point.y / point.x) +
        DEG_90 + (point.x < 0 ? DEG_180 : 0);
      return container;
    });
  }

}

class Delta extends RadialFormation {

  get locations(): Array<Phaser.Point> {
    const radius = this._radius;
    return [
      new Phaser.Point(radius, 0),
      new Phaser.Point(radius / 2, radius / 2),
      new Phaser.Point(0, radius),
      new Phaser.Point(-radius / 2, radius / 2),
      new Phaser.Point(-radius, 0),
    ];
  }

  private static defaults: DiamonParameters = { radius: 100 };

  private readonly _radius: number;

  constructor(game: Phaser.Game, { radius } = Delta.defaults) {
    super(game);
    this._radius = radius;
  }

}

export { Diamond, Delta, RadialFormation, Path, Pulse };
