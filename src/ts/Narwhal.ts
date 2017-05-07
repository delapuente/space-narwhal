import { genFrames } from './utils';
import { Brain } from './enemies';

/** Movement speed for the hero narwhal. */
const SPEED = 800;

const SINKING_SPEED = 100;

const RECOVERING_TIME = 3000;

type NarwhalState =
  'idle' |
  'attacking' |
  'takingDamage' |
  'injured' |
  'recovering' |
  'dying' |
  'dead' |
  'back()';

type NarwhalAction =
  'attack' |
  'animation:attacking:end' |
  'takeDamage' |
  'die' |
  'dropLife' |
  'animation:injured:end' |
  'die' |
  'animation:dying:end' |
  'ready';

type NarwhalMachine = {
  [state in NarwhalState]?: { [action in NarwhalAction]?: NarwhalState }
};

export default class Narwhal extends Phaser.Sprite {

  private _attacking: boolean = false;

  private _formerState: NarwhalState | undefined;

  private _frames;

  private _lives: number = 3;

  private _state: NarwhalState = 'idle';

  private readonly _animationMachine: NarwhalMachine = {
    'idle': {
      'attack': 'attacking',
      'takeDamage': 'takingDamage'
    },
    'attacking': {
      'animation:attacking:end': 'back()'
    },
    'takingDamage': {
      'die': 'dying',
      'dropLife': 'injured'
    },
    'injured': {
      'animation:injured:end': 'recovering'
    },
    'recovering':  {
      'attack': 'attacking',
      'ready': 'idle'
    },
    'dying': {
      'animation:dying:end': 'dead'
    }
  };

  constructor(game, x, y) {
    super(game, x, y, 'char:1', 'idle/0001.png');
    this._frames = genFrames('', '.png', 4);
    this.anchor.setTo(0.5);
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    this._setupAnimations();
  }

  attack(brain: Brain) {
    this._transition('attack', brain);
  }

  takeDamage() {
    this._transition('takeDamage');
  }

  move(direction) {
    if (this._canMove()) {
      this.body.velocity.x = direction.x * SPEED;
      this.body.velocity.y = direction.y * SPEED;
    }
  }

  update() {
    this.animations.play(this._getAnimation());
    if (this._state === 'dead') {
      this.body.velocity.setTo(0, SINKING_SPEED);
    }
  }

  private _can(action: NarwhalAction) {
    const transitions = this._animationMachine[this._state] || {};
    return action in transitions;
  }

  private _canMove() {
    return this._state !== 'dying' && this._state !== 'dead';
  }

  private _getAnimation() {
    return this._state;
  }

  private _onCompleteAnimation(_, animation: Phaser.Animation) {
    this._transition(`animation:${animation.name}:end` as NarwhalAction);
  }

  private onenterattacking(brain) {
    brain.burst();
  }

  private onenterdead() {
    this.body.collideWorldBounds = false;
  }

  private onenterdying() {
    this.body.velocity.setTo(0, 0);
  }

  private onenterinjured() {
    this._lives--;
  }

  private onenterrecovering() {
    setTimeout(() => this._transition('ready'), RECOVERING_TIME);
  }

  private onentertakingDamage() {
    this._transition(this._lives === 1 ? 'die' : 'dropLife');
  }

  private _transition(action: NarwhalAction, ...args) {
    const transitions = this._animationMachine[this._state];
    if (transitions) {
      if (action in transitions) {
        const newState =
          (transitions[action] === 'back()' ?
           this._formerState : transitions[action]) as NarwhalState;
        if (this._state !== newState) {
          this._formerState = this._state;
          this._state = newState;
          const enterName = `onenter${newState}`;
          this[enterName] && this[enterName](...args);
        }
      }
    }
  }

  private _setupAnimations() {
    this.animations.add(
      'idle',
      this._frames('idle', [1, 5], [4, 2]), 10,
      true, false
    ).onComplete.add(this._onCompleteAnimation, this);

    this.animations.add(
      'attacking',
      this._frames('attack', [1, 6], [6], [6], [6]), 25
    ).onComplete.add(this._onCompleteAnimation, this);

    this.animations.add(
      'dying',
      this._frames('death', [1, 9]), 10
    ).onComplete.add(this._onCompleteAnimation, this);

    this.animations.add(
      'recovering',
      this._frames('recovering', [1, 3]), 10
    ).onComplete.add(this._onCompleteAnimation, this);

    this.animations.add(
      'injured',
      this._frames('damage', [1, 3], [3, 1]), 10
    ).onComplete.add(this._onCompleteAnimation, this);

    this.animations.add(
      'dead',
      this._frames('death', [9]), 1
    ).onComplete.add(this._onCompleteAnimation, this);
  }

};
