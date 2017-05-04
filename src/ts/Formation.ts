import { Alien, Brain } from './enemies';

type Pulse = { amplitude: number, speed: number };
type Path = {
  x: Array<number>, y: Array<number>,
  startTime: number, duration: number
};

abstract class Formation extends Phaser.Group {

  private _rotationSpeed: number = 0;

  private _pulse: Pulse = { amplitude: 0, speed: 0 };

  private _path: Path = {
    x: [], y: [],
    startTime: -Infinity, duration: Infinity
  };

  private readonly _brains: Array<Brain> = [];

  protected abstract _buildShape(): Array<Phaser.Group>;

  readonly abstract locations: number;

  constructor(game: Phaser.Game) {
    super(game);
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
        if (!brain) {
          console.error('Insufficient brains to cover all locations.')
        }
        else {
          brain.events.onKilled.addOnce(
            this._checkDestruction, this, 0, index
          );
          this._brains.push(brain);
          container.addChild(brain);
        }
      }
      else {
        const alien = aliens.pop();
        if (!alien) {
          console.error('Insufficient aliens to cover all locations.')
        }
        else {
          container.addChild(alien);
        }
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
    this._pulse.amplitude = amplitude;
    this._pulse.speed = speed;
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
    this._pulsate(t, dt);
    this._move(t, dt);
    this._checkOutOfScreen();
  }

  private _checkDestruction(brain: Brain, formationIndex: number) {
    this._brains.splice(this._brains.indexOf(brain), 1);
    if (this._brains.length) {
      return;
    }
    this._destroyFormation(formationIndex).then(() => {
      this.destroy(false);
    });
  }

  protected _destroyFormation(from = 0): Promise<void> {
    return new Promise<void>(fulfil => {
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
          if (i === end) {
            fulfil();
          }
        }, i * 50);
      }
    });
  }

  private _rotate(t: number, dt: number) {
    this.rotation += this._rotationSpeed * dt;
  }

  private _pulsate(t: number, dt: number) {
    const children = (<Array<PIXI.DisplayObjectContainer>>this.children);
    const { amplitude, speed } = this._pulse;
    children.forEach(container => {
      const enemy = container.children[0];
      // Can be absent since it is being reused in another place.
      if (enemy) {
        enemy.y = amplitude * Math.sin(t * speed * dt);
      }
    });
  }

  private _move(t: number, dt: number) {
    const percentage = (t - this._path.startTime) / this._path.duration;
    this.x = this.game.math.bezierInterpolation(this._path.x, percentage);
    this.y = this.game.math.bezierInterpolation(this._path.y, percentage);
  }

  private _checkOutOfScreen() {
    const { x, y, width, height } = this.getBounds();
    const formationBounds = new Phaser.Rectangle(x, y, width, height);
    const cameraView = this.game.camera.view;
    const isOutside =
      !Phaser.Rectangle.intersects(formationBounds, cameraView);
    if (isOutside) {
      this._destroyFormation();
    }
  }

}

type DiamonParameters = { radius: number };
class Diamond extends Formation {

  private static defaults: DiamonParameters = { radius: 100 };

  private readonly _radius: number;

  readonly locations = 8;

  constructor(game: Phaser.Game, { radius } = Diamond.defaults) {
    super(game);
    this._radius = radius;
  }

  protected _buildShape() {
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

  private _calculatePoints(radius: number): Array<Phaser.Point> {
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

export { Diamond, Formation, Path, Pulse };
