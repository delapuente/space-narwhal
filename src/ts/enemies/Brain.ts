import Enemy from './Enemy';

export default class Brain extends Enemy {

  readonly onBurst: Phaser.Signal = new Phaser.Signal();

  constructor(game) {
    super(game, 'brain');
  }

  burst() {
    this.onBurst.dispatch(this);
  }

}
