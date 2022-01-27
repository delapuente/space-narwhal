/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function genFrames(prefix, suffix, digits) {
    return function (name, ...seq) {
        const path = `${prefix ? prefix + '/' : ''}${name}/`;
        const names = [];
        seq.forEach(pair => {
            const from = pair[0];
            const to = pair.length === 1 ? from : pair[1];
            const frames = Phaser.Animation.generateFrameNames(path, from, to, suffix, digits);
            names.push(...frames);
        });
        return names;
    };
}
exports.genFrames = genFrames;
class SpaceNarwhalLoader extends Phaser.Loader {
    constructor(game) {
        super(game);
    }
    webfont(key, fontName, overwrite = false) {
        this.addToFileList('webfont', key, fontName);
        return this;
    }
    loadFile(file) {
        super.loadFile(file);
        if (file.type === 'webfont') {
            // file.url contains the web font
            document.fonts.load(`10pt "${file.url}"`).then(() => {
                this.asyncComplete(file);
            }, () => {
                this.asyncComplete(file, `Error loading font ${file.url}`);
            });
        }
    }
}
exports.SpaceNarwhalLoader = SpaceNarwhalLoader;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Enemy extends Phaser.Sprite {
    constructor(game, key) {
        super(game, 0, 0, key);
        this._placement = new Phaser.Point();
        this.anchor.setTo(0.5);
    }
    get distance() {
        return this._distance;
    }
    get formation() {
        return this._formation;
    }
    get placement() {
        return this._placement;
    }
    ;
    place(formation, x, y) {
        super.reset(x, y);
        this.updateTransform();
        this._formation = formation;
        this._placement.setTo(x, y);
        this._distance = this._placement.getMagnitude();
        this._resetEvents();
        return this;
    }
    _resetEvents() {
        for (let name in this.events) {
            const member = this.events[name];
            if (member instanceof Phaser.Signal) {
                member.removeAll();
            }
        }
    }
}
exports.default = Enemy;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Environment {
    constructor(game) {
        this._game = game;
    }
    init(options, layer) {
        this._layer = layer;
        this._layer.classType = Phaser.Image;
        this._layer.create(0, 0, 'bg:background');
    }
    update() { }
}
exports.default = Environment;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const enemies_1 = __webpack_require__(11);
const Formation_1 = __webpack_require__(6);
const FORMATIONS = {
    'Diamond': Formation_1.Diamond,
    'Delta': Formation_1.Delta
};
class FormationManager {
    constructor(game) {
        this._physicsTimeTotal = 0;
        this._enemies = {
            alien: [],
            brain: []
        };
        this._timeOrigin = -Infinity;
        this._deadline = Infinity;
        this._enemyKilled = 0;
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
    get brains() {
        return this._enemies.brain.filter(brain => brain.alive);
    }
    get aliens() {
        return this._enemies.alien.filter(alien => alien.alive);
    }
    get enemyKilled() {
        return this._enemyKilled;
    }
    init(formations, layer) {
        this._formations = formations;
        this._timeOrigin = this._physicsTimeTotal;
        this._layer = layer;
        this._allocateAliens(500);
        this._allocateBrains(50);
        this._updateDeadline();
    }
    update() {
        this._physicsTimeTotal += this._game.time.physicsElapsed;
        this._spawnFormations();
    }
    _updateDeadline() {
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
    _spawnFormations() {
        const now = this._physicsTimeTotal;
        if (this._formations.length && now >= this._deadline) {
            const formationData = this._formations.shift();
            const { repeat = 1, wait = 0 } = formationData;
            if (repeat > 1) {
                formationData.repeat = toInt(repeat) - 1;
                formationData.delay = wait;
                this._formations.unshift(formationData);
            }
            const formation = this._spawnFormation(formationData);
            this._applyEffects(formationData, formation);
            this._updateDeadline();
        }
        function toInt(v) {
            if (typeof v === 'number') {
                return v;
            }
            else if (v === 'Infinity') {
                return Infinity;
            }
            return parseInt(v, 10);
        }
    }
    _spawnFormation(formationData) {
        const { shape, brainPositions } = formationData;
        const FormationClass = FORMATIONS[shape];
        const formation = new FormationClass(this._game, formationData);
        formation.onDestroyedByCharacter.addOnce(enemyCount => {
            this._enemyKilled += enemyCount;
        }, this);
        const { locations } = formation;
        const brainCount = brainPositions.length;
        const enemies = this._getAliens(locations.length - brainCount);
        const brains = this._getBrains(brainCount);
        formation.init(enemies, brains, brainPositions);
        return this._layer.addChild(formation);
    }
    _allocateAliens(count) {
        return this._allocateEnemies(enemies_1.Alien, count);
    }
    _allocateBrains(count) {
        return this._allocateEnemies(enemies_1.Brain, count);
    }
    _getAliens(count) {
        return this._getEnemies(enemies_1.Alien, count);
    }
    _getBrains(count) {
        return this._getEnemies(enemies_1.Brain, count);
    }
    _getEnemies(klass, count) {
        const items = [];
        const type = klass.name.toLowerCase();
        for (let i = 0, l = this._enemies[type].length; i < l; i++) {
            const enemy = this._enemies[type][i];
            if (!enemy.alive) {
                items.push(enemy);
            }
            if (items.length === count) {
                return items;
            }
        }
        items.push(...this._allocateEnemies(klass, count - items.length));
        return items;
    }
    _allocateEnemies(klass, count) {
        const items = [];
        const type = klass.name.toLowerCase();
        for (let i = 0; i < count; i++) {
            let enemy = new klass(this._game);
            this._enemies[type].push(enemy);
            items.push(enemy);
            enemy.kill();
        }
        return items;
    }
    _applyEffects(formationData, formation) {
        const { pulse, rotate, follow } = formationData;
        if (pulse) {
            formation.enablePulse(pulse.amplitude, pulse.frequency);
        }
        if (rotate) {
            formation.enableRotation(rotate);
        }
        if (follow) {
            const { path, duration } = follow;
            formation.enableMovement(path.map(toPoint, this), duration);
        }
        function toPoint([kx, ky]) {
            const { [kx]: x = kx, [ky]: y = ky } = this._screen;
            return new Phaser.Point(x, y);
        }
    }
}
exports.default = FormationManager;
;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = __webpack_require__(0);
// import { White } from './shaders';
/** Movement speed for the hero narwhal. */
const SPEED = 800;
const SINKING_SPEED = 100;
const RECOVERING_TIME = 3000;
class Narwhal extends Phaser.Sprite {
    constructor(game, x, y) {
        super(game, x, y, 'char:1', 'idle/0001.png');
        this.onDropLife = new Phaser.Signal();
        this.onDie = new Phaser.Signal();
        this._attacking = false;
        this._lives = 10;
        this._state = 'idle';
        this._animationMachine = {
            'idle': {
                'attack': 'attacking',
                'takeDamage': 'takingDamage'
            },
            'attacking': {
                'animation:attacking:end': 'back()'
            },
            'takingDamage': {
                'die': 'dying',
                'dropLife': 'aching'
            },
            'aching': {
                'animation:aching:end': 'recovering'
            },
            'recovering': {
                'attack': 'attacking',
                'ready': 'idle'
            },
            'dying': {
                'animation:dying:end': 'dead'
            }
        };
        this._frames = utils_1.genFrames('', '.png', 4);
        //this._whiteFilter = this.game.add.filter('White') as White;
        //this._whiteFilter.force = 0.75;
        this.anchor.setTo(0.5);
        this.game.physics.enable(this);
        this.body.collideWorldBounds = true;
        this._setupAnimations();
    }
    get lives() {
        return this._lives;
    }
    attack(brain) {
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
    _blink() {
        if (this.filters) {
            this.filters = undefined;
        }
        else {
            this.filters = [this._whiteFilter];
        }
    }
    _can(action) {
        const transitions = this._animationMachine[this._state] || {};
        return action in transitions;
    }
    _canMove() {
        return this._state !== 'dying' && this._state !== 'dead';
    }
    _clearBlink() {
        this.filters = undefined;
        clearInterval(this._blinking);
    }
    _getAnimation() {
        return this._state;
    }
    _onCompleteAnimation(_, animation) {
        this._transition(`animation:${animation.name}:end`);
    }
    onenterattacking(brain) {
        brain.burst();
    }
    onenteridle() {
        this._clearBlink();
    }
    onenterdead() {
        this.body.collideWorldBounds = false;
        this.checkWorldBounds = true;
        this.onDie.dispatch();
    }
    onenterdying() {
        this.body.velocity.setTo(0, 0);
        this.onDropLife.dispatch();
    }
    onenteraching() {
        this._lives--;
        this.onDropLife.dispatch();
    }
    onexitaching() {
        this._blinking = setInterval(() => this._blink(), 150);
    }
    onenterrecovering() {
        setTimeout(() => this._transition('ready'), RECOVERING_TIME);
    }
    onentertakingDamage() {
        this._transition(this._lives === 1 ? 'die' : 'dropLife');
    }
    _transition(action, ...args) {
        const transitions = this._animationMachine[this._state];
        if (transitions) {
            if (action in transitions) {
                const newState = (transitions[action] === 'back()' ?
                    this._formerState : transitions[action]);
                if (this._state !== newState) {
                    this._formerState = this._state;
                    this._state = newState;
                    const exitName = `onexit${this._formerState}`;
                    this[exitName] && this[exitName](...args);
                    const enterName = `onenter${newState}`;
                    this[enterName] && this[enterName](...args);
                }
            }
        }
    }
    _setupAnimations() {
        this.animations.add('idle', this._frames('idle', [1, 5], [4, 2]), 10, true, false).onComplete.add(this._onCompleteAnimation, this);
        this.animations.add('attacking', this._frames('attack', [1, 6], [6], [6], [6]), 25).onComplete.add(this._onCompleteAnimation, this);
        this.animations.add('dying', this._frames('death', [1, 9]), 10).onComplete.add(this._onCompleteAnimation, this);
        this.animations.add('recovering', this._frames('recovering', [1, 3]), 10).onComplete.add(this._onCompleteAnimation, this);
        this.animations.add('aching', this._frames('damage', [1, 3], [3, 1]), 10).onComplete.add(this._onCompleteAnimation, this);
        this.animations.add('dead', this._frames('death', [9]), 1).onComplete.add(this._onCompleteAnimation, this);
    }
}
exports.default = Narwhal;
;


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Environment__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Environment___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__Environment__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Ocean__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Ocean___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__Ocean__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "Environment", function() { return __WEBPACK_IMPORTED_MODULE_0__Environment___default.a; });
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "Ocean", function() { return __WEBPACK_IMPORTED_MODULE_1__Ocean___default.a; });






/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const DEG_90 = Math.PI / 2;
const DEG_180 = Math.PI;
const DEG_360 = 2 * Math.PI;
class RadialFormation extends Phaser.Group {
    constructor(game) {
        super(game);
        this._brains = [];
        this._rotation = 0;
        this._path = {
            x: [], y: [],
            startTime: -Infinity, duration: Infinity
        };
        this._physicsTimeTotal = 0;
        this._pulse = { amplitude: 0, frequency: 0 };
        this.onDestroyedByCharacter = new Phaser.Signal();
    }
    init(aliens, brains, brainPositions) {
        aliens.forEach(alien => this.game.physics.enable(alien));
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
    enableMovement(path, time) {
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
    _checkOutOfScreen() {
        const { x, y, width, height } = this.getBounds();
        const formationBounds = new Phaser.Rectangle(x, y, width, height);
        const cameraView = this.game.camera.view;
        const isOutside = !Phaser.Rectangle.intersects(formationBounds, cameraView);
        if (isOutside) {
            this._destroyImmediately();
        }
    }
    _destroyAnimated() {
        this._destroyShape().then(() => {
            this.onDestroyedByCharacter.dispatch(this.locations.length);
            this.destroy(false);
        });
    }
    _destroyImmediately() {
        this.callAll('kill', null);
        this.destroy(false);
    }
    _destroyShape() {
        return new Promise(fulfil => {
            const length = this.children.length;
            for (let index = 0; index < length; index++) {
                setTimeout(() => {
                    const enemy = this.children[index];
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
    _move(t, dt) {
        const percentage = (t - this._path.startTime) / this._path.duration;
        this.x = this.game.math.bezierInterpolation(this._path.x, percentage);
        this.y = this.game.math.bezierInterpolation(this._path.y, percentage);
    }
    _place(aliens, brains, brainPositions) {
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
    _pulsate(t, dt) {
        const children = this.children;
        const { amplitude, frequency } = this._pulse;
        children.forEach(enemy => {
            const { rotation, distance } = enemy;
            if (distance === undefined) {
                console.error('Enemy is not correctly placed in the formation.');
            }
            else {
                const offset = distance + amplitude;
                const displacement = amplitude * Math.sin(DEG_360 * frequency * t) + offset;
                enemy.x = displacement * Math.cos(rotation - DEG_90);
                enemy.y = displacement * Math.sin(rotation - DEG_90);
            }
        });
    }
    _rotate(t, dt) {
        this.rotation += this._rotation * dt;
    }
    _tryToDestroy(brain) {
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
exports.RadialFormation = RadialFormation;
class Diamond extends RadialFormation {
    constructor(game, { radius } = Diamond.defaults) {
        super(game);
        this._radius = radius;
    }
    get locations() {
        if (!this._locations) {
            const radius = this._radius;
            this._locations = [
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
        return this._locations;
    }
    _buildShape() {
        return this.locations.map(point => {
            const container = new Phaser.Group(this.game);
            container.position = point;
            container.rotation = Math.atan(point.y / point.x) +
                DEG_90 + (point.x < 0 ? DEG_180 : 0);
            return container;
        });
    }
}
Diamond.defaults = { radius: 100 };
exports.Diamond = Diamond;
class Delta extends RadialFormation {
    constructor(game, { radius } = Delta.defaults) {
        super(game);
        this._radius = radius;
    }
    get locations() {
        if (!this._locations) {
            const radius = this._radius;
            this._locations = [
                new Phaser.Point(radius, 0),
                new Phaser.Point(radius / 2, radius / 2),
                new Phaser.Point(0, radius),
                new Phaser.Point(-radius / 2, radius / 2),
                new Phaser.Point(-radius, 0),
            ];
        }
        return this._locations;
    }
}
Delta.defaults = { radius: 100 };
exports.Delta = Delta;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Enemy_1 = __webpack_require__(1);
const utils_1 = __webpack_require__(0);
class Alien extends Enemy_1.default {
    constructor(game) {
        super(game, 'alien');
        this._frames = utils_1.genFrames('', '.png', 4);
        this._setupAnimations();
        this.animations.play('idle');
    }
    _onCompleteAnimation() {
    }
    _setupAnimations() {
        this.animations.add('idle', this._frames('idle', [1, 5], [4, 2]), 8, true, false).onComplete.add(this._onCompleteAnimation, this);
    }
}
exports.default = Alien;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Enemy_1 = __webpack_require__(1);
const utils_1 = __webpack_require__(0);
class Brain extends Enemy_1.default {
    constructor(game) {
        super(game, 'brain');
        this.onBurst = new Phaser.Signal();
        this._frames = utils_1.genFrames('', '.png', 4);
        this._setupAnimations();
        this.animations.play('idle');
    }
    burst() {
        this.onBurst.dispatch(this);
    }
    _onCompleteAnimation() {
    }
    _setupAnimations() {
        this.animations.add('idle', this._frames('idle', [1, 5], [4, 2]), 7, true, false).onComplete.add(this._onCompleteAnimation, this);
    }
}
exports.default = Brain;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Environment_1 = __webpack_require__(2);
class Ocean extends Environment_1.default {
    constructor(game) {
        super(game);
        this._physicsTimeTotal = 0;
    }
    init({ fx, speeds }, layer) {
        super.init({}, layer);
        const bg = this._layer.children[0];
        this._fxStates = [];
        for (let i = 1; i <= fx; i++) {
            const fx = this._layer.create(0, 0, `bg:fx:${i}`);
            const widthDifference = fx.width - bg.width;
            const offsetX = widthDifference / 2;
            fx.position.x = -offsetX;
            const speed = speeds[i - 1];
            const limits = [-widthDifference, 0];
            const direction = -1;
            this._fxStates.push({ layer: fx, speed, limits, direction });
        }
    }
    update() {
        const dt = this._game.time.physicsElapsed;
        this._physicsTimeTotal += dt;
        this._fxStates.forEach(state => {
            const { layer, speed, limits, direction } = state;
            const dv = direction * speed * dt;
            const currentPosition = layer.position.x += dv;
            if (currentPosition <= limits[0] || currentPosition >= limits[1]) {
                state.direction = -state.direction;
            }
        });
    }
}
exports.default = Ocean;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Narwhal_1 = __webpack_require__(4);
const FormationManager_1 = __webpack_require__(3);
const utils_1 = __webpack_require__(0);
const environments_1 = __webpack_require__(5);
// import { White } from './shaders';
class Level extends Phaser.State {
    init() {
        // Phaser.Filter.White = White;
        this.game.load = new utils_1.SpaceNarwhalLoader(this.game);
        this._keys = this.game.input.keyboard.addKeys({
            left: Phaser.KeyCode.LEFT,
            right: Phaser.KeyCode.RIGHT,
            up: Phaser.KeyCode.UP,
            down: Phaser.KeyCode.DOWN
        });
        this._formationManager = new FormationManager_1.default(this.game);
        this._environment = new environments_1.Ocean(this.game);
    }
    preload() {
        this.game.load.atlasJSONHash('char:1', 'assets/animations/char-01.png', 'assets/animations/char-01.json');
        this.game.load.atlasJSONHash('alien', 'assets/animations/enemy-01.png', 'assets/animations/enemy-01.json');
        this.game.load.atlasJSONHash('brain', 'assets/animations/brain-01.png', 'assets/animations/brain-01.json');
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
    _createHud(hudLayer) {
        // Lives
        const hearts = new Phaser.Group(this.game);
        for (let i = 0, l = this._narwhal.lives; i < l; i++) {
            const heart = new Phaser.Image(this.game, 0, -52 - (i * 60), 'hud:heart');
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
    _initEnvironment(layer) {
        this._environment.init({ fx: 2, speeds: [10, 20] }, layer);
    }
    _initFormations(layer) {
        var levelData = this.game.cache.getJSON('level');
        this._formationManager.init(levelData.formations, layer);
    }
    _handleInput() {
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
    _handleCollisions() {
        this.game.physics.arcade.overlap(this._narwhal, this._formationManager.brains, this._onNarwhalVsBrain, undefined, this);
        this.game.physics.arcade.overlap(this._narwhal, this._formationManager.aliens, this._onNarwhalVsAlien, undefined, this);
    }
    _onNarwhalVsAlien(narwhal, alien) {
        narwhal.takeDamage();
    }
    _onNarwhalVsBrain(narwhal, brain) {
        narwhal.attack(brain);
    }
    _spawnNarwhal(layer) {
        this._narwhal = new Narwhal_1.default(this.game, this.game.world.centerX, this.game.world.centerY);
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
    _updateHud() {
        const text = `x${pad(this._formationManager.enemyKilled)}`;
        this._score.setText(text);
        function pad(n) {
            const str = n + '';
            return '0000'.slice(0, 4 - str.length) + str;
        }
    }
}
;
window.onload = () => {
    const level = new Level();
    const game = new Phaser.Game(1000, 1080, Phaser.AUTO, 'content', level);
};


/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Enemy__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Enemy___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__Enemy__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Alien__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Alien___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__Alien__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Brain__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Brain___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__Brain__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "Enemy", function() { return __WEBPACK_IMPORTED_MODULE_0__Enemy___default.a; });
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "Alien", function() { return __WEBPACK_IMPORTED_MODULE_1__Alien___default.a; });
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "Brain", function() { return __WEBPACK_IMPORTED_MODULE_2__Brain___default.a; });







/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgOGNmZjJjOWM4ZjQxZWY1NmQxZGMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL3V0aWxzL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy90cy9lbmVtaWVzL0VuZW15LnRzIiwid2VicGFjazovLy8uL3NyYy90cy9lbnZpcm9ubWVudHMvRW52aXJvbm1lbnQudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL0Zvcm1hdGlvbk1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL05hcndoYWwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL2Vudmlyb25tZW50cy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdHMvRm9ybWF0aW9uLnRzIiwid2VicGFjazovLy8uL3NyYy90cy9lbmVtaWVzL0FsaWVuLnRzIiwid2VicGFjazovLy8uL3NyYy90cy9lbmVtaWVzL0JyYWluLnRzIiwid2VicGFjazovLy8uL3NyYy90cy9lbnZpcm9ubWVudHMvT2NlYW4udHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL3NwYWNlLW5hcndoYWwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL2VuZW1pZXMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQSwyQ0FBMkMsY0FBYzs7UUFFekQ7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSxLQUFLO1FBQ0w7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7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QU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDL0MsQ0FBQztJQUNILENBQUM7Q0FDRjtBQUFBLENBQUM7QUFFRixNQUFNLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRTtJQUNuQixNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO0lBQzFCLE1BQU0sSUFBSSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzFFLENBQUMsQ0FBQzs7Ozs7Ozs7QUN6TEY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBNEI7QUFDQTtBQUNBOztBQU0xQiIsImZpbGUiOiJzcGFjZS1uYXJ3aGFsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gaWRlbnRpdHkgZnVuY3Rpb24gZm9yIGNhbGxpbmcgaGFybW9ueSBpbXBvcnRzIHdpdGggdGhlIGNvcnJlY3QgY29udGV4dFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5pID0gZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9O1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAxMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgOGNmZjJjOWM4ZjQxZWY1NmQxZGMiLCJcbnR5cGUgRnJvbVRvID0gQXJyYXk8W251bWJlcixudW1iZXJdfFtudW1iZXJdPjtcbnR5cGUgU2hvcnRHZW5GcmFtZXMgPSAobmFtZTogc3RyaW5nLCAuLi5zZXE6IEZyb21UbykgPT4gQXJyYXk8c3RyaW5nPjtcblxuZnVuY3Rpb24gZ2VuRnJhbWVzKHByZWZpeDogc3RyaW5nLCBzdWZmaXg6IHN0cmluZywgZGlnaXRzOiBudW1iZXIpIDogU2hvcnRHZW5GcmFtZXMge1xuICByZXR1cm4gZnVuY3Rpb24obmFtZSwgLi4uc2VxKSB7XG4gICAgY29uc3QgcGF0aCA9IGAke3ByZWZpeCA/IHByZWZpeCArICcvJyA6ICcnfSR7bmFtZX0vYDtcbiAgICBjb25zdCBuYW1lczogQXJyYXk8c3RyaW5nPiA9IFtdO1xuICAgIHNlcS5mb3JFYWNoKHBhaXIgPT4ge1xuICAgICAgY29uc3QgZnJvbSA9IHBhaXJbMF07XG4gICAgICBjb25zdCB0byA9IHBhaXIubGVuZ3RoID09PSAxID8gZnJvbSA6IHBhaXJbMV07XG4gICAgICBjb25zdCBmcmFtZXMgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcbiAgICAgICAgcGF0aCxcbiAgICAgICAgZnJvbSwgdG8sXG4gICAgICAgIHN1ZmZpeCwgZGlnaXRzXG4gICAgICApO1xuICAgICAgbmFtZXMucHVzaCguLi5mcmFtZXMpO1xuICAgIH0pO1xuICAgIHJldHVybiBuYW1lcztcbiAgfVxufVxuXG5jbGFzcyBTcGFjZU5hcndoYWxMb2FkZXIgZXh0ZW5kcyBQaGFzZXIuTG9hZGVyIHtcblxuICBjb25zdHJ1Y3RvcihnYW1lOiBQaGFzZXIuR2FtZSkge1xuICAgIHN1cGVyKGdhbWUpO1xuICB9XG5cbiAgd2ViZm9udChrZXk6IHN0cmluZywgZm9udE5hbWU6IHN0cmluZywgb3ZlcndyaXRlID0gZmFsc2UpIDogdGhpcyB7XG4gICAgdGhpcy5hZGRUb0ZpbGVMaXN0KCd3ZWJmb250Jywga2V5LCBmb250TmFtZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsb2FkRmlsZShmaWxlKSB7XG4gICAgc3VwZXIubG9hZEZpbGUoZmlsZSk7XG4gICAgaWYgKGZpbGUudHlwZSA9PT0gJ3dlYmZvbnQnKSB7XG4gICAgICAvLyBmaWxlLnVybCBjb250YWlucyB0aGUgd2ViIGZvbnRcbiAgICAgIGRvY3VtZW50LmZvbnRzLmxvYWQoYDEwcHQgXCIke2ZpbGUudXJsfVwiYCkudGhlbihcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5hc3luY0NvbXBsZXRlKGZpbGUpO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiAge1xuICAgICAgICAgICAgdGhpcy5hc3luY0NvbXBsZXRlKGZpbGUsIGBFcnJvciBsb2FkaW5nIGZvbnQgJHtmaWxlLnVybH1gKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxufVxuXG5leHBvcnQgeyBnZW5GcmFtZXMsIFNwYWNlTmFyd2hhbExvYWRlciB9O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vfi9zb3VyY2UtbWFwLWxvYWRlciEuL3NyYy90cy91dGlscy9pbmRleC50cyIsImltcG9ydCB7IFJhZGlhbEZvcm1hdGlvbiB9IGZyb20gJy4uL0Zvcm1hdGlvbic7XG5cbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIEVuZW15IGV4dGVuZHMgUGhhc2VyLlNwcml0ZSB7XG5cbiAgZ2V0IGRpc3RhbmNlKCkge1xuICAgIHJldHVybiB0aGlzLl9kaXN0YW5jZTtcbiAgfVxuXG4gIGdldCBmb3JtYXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Zvcm1hdGlvbjtcbiAgfVxuXG4gIGdldCBwbGFjZW1lbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3BsYWNlbWVudDtcbiAgfTtcblxuICBwcml2YXRlIF9kaXN0YW5jZTogbnVtYmVyfHVuZGVmaW5lZDtcblxuICBwcml2YXRlIF9mb3JtYXRpb246IFJhZGlhbEZvcm1hdGlvbjtcblxuICBwcml2YXRlIHJlYWRvbmx5IF9wbGFjZW1lbnQ6IFBoYXNlci5Qb2ludCA9IG5ldyBQaGFzZXIuUG9pbnQoKTtcblxuICBjb25zdHJ1Y3RvcihnYW1lOiBQaGFzZXIuR2FtZSwga2V5OiBzdHJpbmcpIHtcbiAgICBzdXBlcihnYW1lLCAwLCAwLCBrZXkpO1xuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSk7XG4gIH1cblxuICBwbGFjZShmb3JtYXRpb246IFJhZGlhbEZvcm1hdGlvbiwgeDogbnVtYmVyLCB5OiBudW1iZXIpOiB0aGlzIHtcbiAgICBzdXBlci5yZXNldCh4LCB5KTtcbiAgICB0aGlzLnVwZGF0ZVRyYW5zZm9ybSgpO1xuICAgIHRoaXMuX2Zvcm1hdGlvbiA9IGZvcm1hdGlvbjtcbiAgICB0aGlzLl9wbGFjZW1lbnQuc2V0VG8oeCwgeSk7XG4gICAgdGhpcy5fZGlzdGFuY2UgPSB0aGlzLl9wbGFjZW1lbnQuZ2V0TWFnbml0dWRlKCk7XG4gICAgdGhpcy5fcmVzZXRFdmVudHMoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHByaXZhdGUgX3Jlc2V0RXZlbnRzKCkge1xuICAgIGZvciAobGV0IG5hbWUgaW4gdGhpcy5ldmVudHMpIHtcbiAgICAgIGNvbnN0IG1lbWJlciA9IHRoaXMuZXZlbnRzW25hbWVdO1xuICAgICAgaWYgKG1lbWJlciBpbnN0YW5jZW9mIFBoYXNlci5TaWduYWwpIHtcbiAgICAgICAgKG1lbWJlciBhcyBQaGFzZXIuU2lnbmFsKS5yZW1vdmVBbGwoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vfi9zb3VyY2UtbWFwLWxvYWRlciEuL3NyYy90cy9lbmVtaWVzL0VuZW15LnRzIiwiXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbnZpcm9ubWVudCB7XG5cbiAgcHJvdGVjdGVkIF9nYW1lOiBQaGFzZXIuR2FtZTtcblxuICBwcm90ZWN0ZWQgX2xheWVyOiBQaGFzZXIuR3JvdXA7XG5cbiAgY29uc3RydWN0b3IoZ2FtZTogUGhhc2VyLkdhbWUpIHtcbiAgICB0aGlzLl9nYW1lID0gZ2FtZTtcbiAgfVxuXG4gIGluaXQob3B0aW9ucywgbGF5ZXI6IFBoYXNlci5Hcm91cCkge1xuICAgIHRoaXMuX2xheWVyID0gbGF5ZXI7XG4gICAgdGhpcy5fbGF5ZXIuY2xhc3NUeXBlID0gUGhhc2VyLkltYWdlO1xuICAgIHRoaXMuX2xheWVyLmNyZWF0ZSgwLCAwLCAnYmc6YmFja2dyb3VuZCcpO1xuICB9XG5cbiAgdXBkYXRlKCkgeyB9XG5cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL34vc291cmNlLW1hcC1sb2FkZXIhLi9zcmMvdHMvZW52aXJvbm1lbnRzL0Vudmlyb25tZW50LnRzIiwiaW1wb3J0IHsgRW5lbXksIEFsaWVuLCBCcmFpbiB9IGZyb20gJy4vZW5lbWllcyc7XG5pbXBvcnQgeyBQYXRoLCBQdWxzZSwgUmFkaWFsRm9ybWF0aW9uLCBEaWFtb25kLCBEZWx0YSB9IGZyb20gJy4vRm9ybWF0aW9uJztcblxudHlwZSBUeXBlT2Y8VD4gPSBuZXcgKC4uLl8pID0+IFQ7XG5cbmNvbnN0IEZPUk1BVElPTlM6IHsgW3M6IHN0cmluZ106IFR5cGVPZjxSYWRpYWxGb3JtYXRpb24+IH0gPSB7XG4gICdEaWFtb25kJzogRGlhbW9uZCxcbiAgJ0RlbHRhJzogRGVsdGFcbn07XG5cbnR5cGUgUHVsc2VTcGVjID0gUHVsc2U7XG5cbnR5cGUgUGF0aFNwZWMgPSBBcnJheTxbc3RyaW5nfG51bWJlciwgc3RyaW5nfG51bWJlcl0+O1xuXG50eXBlIEZvcm1hdGlvblNwZWMgPSB7XG4gIHNoYXBlOiBzdHJpbmcsXG4gIGJyYWluUG9zaXRpb25zOiBBcnJheTxudW1iZXI+LFxuICByb3RhdGU/OiBudW1iZXIsXG4gIHB1bHNlPzogUHVsc2VTcGVjLFxuICBmb2xsb3c/OiB7IHBhdGg6IFBhdGhTcGVjLCBkdXJhdGlvbjogbnVtYmVyIH0sXG4gIGRlbGF5PzogbnVtYmVyLFxuICBhdD86IG51bWJlcixcbiAgcmVwZWF0PzogbnVtYmVyIHwgc3RyaW5nLFxuICB3YWl0PzogbnVtYmVyXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGb3JtYXRpb25NYW5hZ2VyIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IF9nYW1lOiBQaGFzZXIuR2FtZTtcblxuICBwcml2YXRlIF9sYXllcjogUGhhc2VyLkdyb3VwO1xuXG4gIHByaXZhdGUgX3BoeXNpY3NUaW1lVG90YWw6IG51bWJlciA9IDA7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfc2NyZWVuOiB7IFtzOiBzdHJpbmddOiBudW1iZXIgfTtcblxuICBwcml2YXRlIHJlYWRvbmx5IF9lbmVtaWVzOiB7XG4gICAgYWxpZW46IEFycmF5PEFsaWVuPjtcbiAgICBicmFpbjogQXJyYXk8QnJhaW4+O1xuICB9ID0ge1xuICAgIGFsaWVuOiBbXSxcbiAgICBicmFpbjogW11cbiAgfTtcblxuICBwcml2YXRlIF9mb3JtYXRpb25zOiBBcnJheTxGb3JtYXRpb25TcGVjPjtcblxuICBwcml2YXRlIF90aW1lT3JpZ2luOiBudW1iZXIgPSAtSW5maW5pdHk7XG5cbiAgcHJpdmF0ZSBfZGVhZGxpbmU6IG51bWJlciA9IEluZmluaXR5O1xuXG4gIHByaXZhdGUgX2VuZW15S2lsbGVkOiBudW1iZXIgPSAwO1xuXG4gIGdldCBicmFpbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuZW1pZXMuYnJhaW4uZmlsdGVyKGJyYWluID0+IGJyYWluLmFsaXZlKTtcbiAgfVxuXG4gIGdldCBhbGllbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuZW1pZXMuYWxpZW4uZmlsdGVyKGFsaWVuID0+IGFsaWVuLmFsaXZlKTtcbiAgfVxuXG4gIGdldCBlbmVteUtpbGxlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5lbXlLaWxsZWQ7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihnYW1lOiBQaGFzZXIuR2FtZSkge1xuICAgIHRoaXMuX2dhbWUgPSBnYW1lO1xuICAgIC8vVE9ETzogSW5qZWN0IGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICBjb25zdCBzZW1pV2lkdGggPSB0aGlzLl9nYW1lLndpZHRoIC8gMjtcbiAgICBjb25zdCBzZW1pSGVpZ2h0ID0gdGhpcy5fZ2FtZS5oZWlnaHQgLyAyO1xuICAgIGNvbnN0IGNlbnRlclggPSB0aGlzLl9nYW1lLndvcmxkLmNlbnRlclg7XG4gICAgY29uc3QgY2VudGVyWSA9IHRoaXMuX2dhbWUud29ybGQuY2VudGVyWTtcbiAgICBjb25zdCB0b3AgPSBjZW50ZXJZIC0gc2VtaUhlaWdodDtcbiAgICBjb25zdCBib3R0b20gPSBjZW50ZXJZICsgc2VtaUhlaWdodDtcbiAgICBjb25zdCBsZWZ0ID0gY2VudGVyWCAtIHNlbWlXaWR0aDtcbiAgICBjb25zdCByaWdodCA9IGNlbnRlclggKyBzZW1pV2lkdGg7XG4gICAgdGhpcy5fc2NyZWVuID0ge1xuICAgICAgY2VudGVyWCwgY2VudGVyWSwgdG9wLCBib3R0b20sIGxlZnQsIHJpZ2h0LFxuICAgICAgZ2V0IHJhbmRvbVgoKSB7XG4gICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpICogKHRoaXMucmlnaHQgLSB0aGlzLmxlZnQpICsgdGhpcy5sZWZ0O1xuICAgICAgfSxcbiAgICAgIGdldCByYW5kb21ZKCkge1xuICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqICh0aGlzLmJvdHRvbSAtIHRoaXMudG9wKSArIHRoaXMudG9wO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBpbml0KGZvcm1hdGlvbnM6IEFycmF5PEZvcm1hdGlvblNwZWM+LCBsYXllcjogUGhhc2VyLkdyb3VwKSB7XG4gICAgdGhpcy5fZm9ybWF0aW9ucyA9IGZvcm1hdGlvbnM7XG4gICAgdGhpcy5fdGltZU9yaWdpbiA9IHRoaXMuX3BoeXNpY3NUaW1lVG90YWw7XG4gICAgdGhpcy5fbGF5ZXIgPSBsYXllcjtcbiAgICB0aGlzLl9hbGxvY2F0ZUFsaWVucyg1MDApO1xuICAgIHRoaXMuX2FsbG9jYXRlQnJhaW5zKDUwKTtcbiAgICB0aGlzLl91cGRhdGVEZWFkbGluZSgpO1xuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIHRoaXMuX3BoeXNpY3NUaW1lVG90YWwgKz0gdGhpcy5fZ2FtZS50aW1lLnBoeXNpY3NFbGFwc2VkO1xuICAgIHRoaXMuX3NwYXduRm9ybWF0aW9ucygpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlRGVhZGxpbmUoKSB7XG4gICAgaWYgKCF0aGlzLl9mb3JtYXRpb25zLmxlbmd0aCkge1xuICAgICAgdGhpcy5fZGVhZGxpbmUgPSBJbmZpbml0eTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBsZXQgeyBhdCwgZGVsYXkgfSA9IHRoaXMuX2Zvcm1hdGlvbnNbMF07XG4gICAgICBpZiAodHlwZW9mIGF0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBhdCA9IE1hdGgubWF4KDAsIGF0IHx8IDApO1xuICAgICAgICB0aGlzLl9kZWFkbGluZSA9IHRoaXMuX3RpbWVPcmlnaW4gKyBhdDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBkZWxheSA9IE1hdGgubWF4KDAsIGRlbGF5IHx8IDApO1xuICAgICAgICBpZiAoIWlzRmluaXRlKHRoaXMuX2RlYWRsaW5lKSkge1xuICAgICAgICAgIHRoaXMuX2RlYWRsaW5lID0gdGhpcy5fdGltZU9yaWdpbjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9kZWFkbGluZSArPSBkZWxheTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9zcGF3bkZvcm1hdGlvbnMoKSB7XG4gICAgY29uc3Qgbm93ID0gdGhpcy5fcGh5c2ljc1RpbWVUb3RhbDtcbiAgICBpZiAodGhpcy5fZm9ybWF0aW9ucy5sZW5ndGggJiYgbm93ID49IHRoaXMuX2RlYWRsaW5lKSB7XG4gICAgICBjb25zdCBmb3JtYXRpb25EYXRhID0gdGhpcy5fZm9ybWF0aW9ucy5zaGlmdCgpIGFzIEZvcm1hdGlvblNwZWM7XG4gICAgICBjb25zdCB7IHJlcGVhdCA9IDEsIHdhaXQgPSAwIH0gPSBmb3JtYXRpb25EYXRhO1xuICAgICAgaWYgKHJlcGVhdCA+IDEpIHtcbiAgICAgICAgZm9ybWF0aW9uRGF0YS5yZXBlYXQgPSB0b0ludChyZXBlYXQpIC0gMTtcbiAgICAgICAgZm9ybWF0aW9uRGF0YS5kZWxheSA9IHdhaXQ7XG4gICAgICAgIHRoaXMuX2Zvcm1hdGlvbnMudW5zaGlmdChmb3JtYXRpb25EYXRhKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGZvcm1hdGlvbiA9IHRoaXMuX3NwYXduRm9ybWF0aW9uKGZvcm1hdGlvbkRhdGEpO1xuICAgICAgdGhpcy5fYXBwbHlFZmZlY3RzKGZvcm1hdGlvbkRhdGEsIGZvcm1hdGlvbik7XG4gICAgICB0aGlzLl91cGRhdGVEZWFkbGluZSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvSW50KHY6bnVtYmVyfHN0cmluZykge1xuICAgICAgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gdjtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHYgPT09ICdJbmZpbml0eScpIHtcbiAgICAgICAgcmV0dXJuIEluZmluaXR5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBhcnNlSW50KHYsIDEwKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9zcGF3bkZvcm1hdGlvbihmb3JtYXRpb25EYXRhOiBGb3JtYXRpb25TcGVjKSA6IFJhZGlhbEZvcm1hdGlvbiB7XG4gICAgY29uc3QgeyBzaGFwZSwgYnJhaW5Qb3NpdGlvbnMgfSA9IGZvcm1hdGlvbkRhdGE7XG4gICAgY29uc3QgRm9ybWF0aW9uQ2xhc3MgPSBGT1JNQVRJT05TW3NoYXBlXTtcbiAgICBjb25zdCBmb3JtYXRpb24gPSBuZXcgRm9ybWF0aW9uQ2xhc3ModGhpcy5fZ2FtZSwgZm9ybWF0aW9uRGF0YSk7XG4gICAgZm9ybWF0aW9uLm9uRGVzdHJveWVkQnlDaGFyYWN0ZXIuYWRkT25jZShlbmVteUNvdW50ID0+IHtcbiAgICAgIHRoaXMuX2VuZW15S2lsbGVkICs9IGVuZW15Q291bnQ7XG4gICAgfSwgdGhpcyk7XG4gICAgY29uc3QgeyBsb2NhdGlvbnMgfSA9IGZvcm1hdGlvbjtcbiAgICBjb25zdCBicmFpbkNvdW50ID0gYnJhaW5Qb3NpdGlvbnMubGVuZ3RoO1xuICAgIGNvbnN0IGVuZW1pZXMgPSB0aGlzLl9nZXRBbGllbnMobG9jYXRpb25zLmxlbmd0aCAtIGJyYWluQ291bnQpO1xuICAgIGNvbnN0IGJyYWlucyA9IHRoaXMuX2dldEJyYWlucyhicmFpbkNvdW50KTtcblxuICAgIGZvcm1hdGlvbi5pbml0KGVuZW1pZXMsIGJyYWlucywgYnJhaW5Qb3NpdGlvbnMpO1xuICAgIHJldHVybiB0aGlzLl9sYXllci5hZGRDaGlsZChmb3JtYXRpb24pO1xuICB9XG5cbiAgcHJpdmF0ZSBfYWxsb2NhdGVBbGllbnMoY291bnQ6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLl9hbGxvY2F0ZUVuZW1pZXMoQWxpZW4sIGNvdW50KTtcbiAgfVxuXG4gIHByaXZhdGUgX2FsbG9jYXRlQnJhaW5zKGNvdW50OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5fYWxsb2NhdGVFbmVtaWVzKEJyYWluLCBjb3VudCk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRBbGllbnMoY291bnQ6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLl9nZXRFbmVtaWVzKEFsaWVuLCBjb3VudCk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRCcmFpbnMoY291bnQ6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLl9nZXRFbmVtaWVzKEJyYWluLCBjb3VudCk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRFbmVtaWVzPEUgZXh0ZW5kcyBFbmVteT4oa2xhc3M6IFR5cGVPZjxFPiwgY291bnQ6IG51bWJlcikge1xuICAgIGNvbnN0IGl0ZW1zOiBBcnJheTxFPiA9IFtdO1xuICAgIGNvbnN0IHR5cGUgPSBrbGFzcy5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLl9lbmVtaWVzW3R5cGVdLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgY29uc3QgZW5lbXkgPSB0aGlzLl9lbmVtaWVzW3R5cGVdW2ldO1xuICAgICAgaWYgKCFlbmVteS5hbGl2ZSkge1xuICAgICAgICBpdGVtcy5wdXNoKGVuZW15KTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtcy5sZW5ndGggPT09IGNvdW50KSB7XG4gICAgICAgIHJldHVybiBpdGVtcztcbiAgICAgIH1cbiAgICB9XG4gICAgaXRlbXMucHVzaCguLi50aGlzLl9hbGxvY2F0ZUVuZW1pZXMoa2xhc3MsIGNvdW50IC0gaXRlbXMubGVuZ3RoKSk7XG4gICAgcmV0dXJuIGl0ZW1zO1xuICB9XG5cbiAgcHJpdmF0ZSBfYWxsb2NhdGVFbmVtaWVzPEUgZXh0ZW5kcyBFbmVteT4oa2xhc3M6IFR5cGVPZjxFPiwgY291bnQ6IG51bWJlcikge1xuICAgIGNvbnN0IGl0ZW1zOiBBcnJheTxFPiA9IFtdO1xuICAgIGNvbnN0IHR5cGUgPSBrbGFzcy5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICBsZXQgZW5lbXkgPSBuZXcga2xhc3ModGhpcy5fZ2FtZSk7XG4gICAgICB0aGlzLl9lbmVtaWVzW3R5cGVdLnB1c2goZW5lbXkpO1xuICAgICAgaXRlbXMucHVzaChlbmVteSk7XG4gICAgICBlbmVteS5raWxsKCk7XG4gICAgfVxuICAgIHJldHVybiBpdGVtcztcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5RWZmZWN0cyhmb3JtYXRpb25EYXRhOiBGb3JtYXRpb25TcGVjLCBmb3JtYXRpb246IFJhZGlhbEZvcm1hdGlvbikge1xuICAgIGNvbnN0IHsgcHVsc2UsIHJvdGF0ZSwgZm9sbG93IH0gPSBmb3JtYXRpb25EYXRhO1xuICAgIGlmIChwdWxzZSkge1xuICAgICAgZm9ybWF0aW9uLmVuYWJsZVB1bHNlKHB1bHNlLmFtcGxpdHVkZSwgcHVsc2UuZnJlcXVlbmN5KTtcbiAgICB9XG4gICAgaWYgKHJvdGF0ZSkge1xuICAgICAgZm9ybWF0aW9uLmVuYWJsZVJvdGF0aW9uKHJvdGF0ZSk7XG4gICAgfVxuICAgIGlmIChmb2xsb3cpIHtcbiAgICAgIGNvbnN0IHsgcGF0aCwgZHVyYXRpb24gfSA9IGZvbGxvdztcbiAgICAgIGZvcm1hdGlvbi5lbmFibGVNb3ZlbWVudChcbiAgICAgICAgcGF0aC5tYXAodG9Qb2ludCwgdGhpcyksXG4gICAgICAgIGR1cmF0aW9uXG4gICAgICApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvUG9pbnQoW2t4LCBreV06IFtudW1iZXIgfCBzdHJpbmcsIG51bWJlciB8IHN0cmluZ10pIHtcbiAgICAgIGNvbnN0IHsgW2t4XTogeCA9IGt4LCBba3ldOiB5ID0ga3kgfSA9IHRoaXMuX3NjcmVlbjtcbiAgICAgIHJldHVybiBuZXcgUGhhc2VyLlBvaW50KDxudW1iZXI+eCwgPG51bWJlcj55KTtcbiAgICB9XG4gIH1cblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL34vc291cmNlLW1hcC1sb2FkZXIhLi9zcmMvdHMvRm9ybWF0aW9uTWFuYWdlci50cyIsImltcG9ydCB7IGdlbkZyYW1lcyB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgQnJhaW4gfSBmcm9tICcuL2VuZW1pZXMnO1xuLy8gaW1wb3J0IHsgV2hpdGUgfSBmcm9tICcuL3NoYWRlcnMnO1xuXG4vKiogTW92ZW1lbnQgc3BlZWQgZm9yIHRoZSBoZXJvIG5hcndoYWwuICovXG5jb25zdCBTUEVFRCA9IDgwMDtcblxuY29uc3QgU0lOS0lOR19TUEVFRCA9IDEwMDtcblxuY29uc3QgUkVDT1ZFUklOR19USU1FID0gMzAwMDtcblxudHlwZSBOYXJ3aGFsU3RhdGUgPVxuICAnaWRsZScgfFxuICAnYXR0YWNraW5nJyB8XG4gICd0YWtpbmdEYW1hZ2UnIHxcbiAgJ2FjaGluZycgfFxuICAncmVjb3ZlcmluZycgfFxuICAnZHlpbmcnIHxcbiAgJ2RlYWQnIHxcbiAgJ2JhY2soKSc7XG5cbnR5cGUgTmFyd2hhbEFjdGlvbiA9XG4gICdhdHRhY2snIHxcbiAgJ2FuaW1hdGlvbjphdHRhY2tpbmc6ZW5kJyB8XG4gICd0YWtlRGFtYWdlJyB8XG4gICdkaWUnIHxcbiAgJ2Ryb3BMaWZlJyB8XG4gICdhbmltYXRpb246YWNoaW5nOmVuZCcgfFxuICAnZGllJyB8XG4gICdhbmltYXRpb246ZHlpbmc6ZW5kJyB8XG4gICdyZWFkeSc7XG5cbnR5cGUgTmFyd2hhbE1hY2hpbmUgPSB7XG4gIFtzdGF0ZSBpbiBOYXJ3aGFsU3RhdGVdPzogeyBbYWN0aW9uIGluIE5hcndoYWxBY3Rpb25dPzogTmFyd2hhbFN0YXRlIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5hcndoYWwgZXh0ZW5kcyBQaGFzZXIuU3ByaXRlIHtcblxuICBvbkRyb3BMaWZlID0gbmV3IFBoYXNlci5TaWduYWwoKTtcblxuICBvbkRpZSA9IG5ldyBQaGFzZXIuU2lnbmFsKCk7XG5cbiAgcHJpdmF0ZSBfYXR0YWNraW5nOiBib29sZWFuID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSBfYmxpbmtpbmc7XG5cbiAgcHJpdmF0ZSBfZm9ybWVyU3RhdGU6IE5hcndoYWxTdGF0ZSB8IHVuZGVmaW5lZDtcblxuICBwcml2YXRlIF9mcmFtZXM7XG5cbiAgcHJpdmF0ZSBfbGl2ZXM6IG51bWJlciA9IDEwO1xuXG4gIHByaXZhdGUgX3N0YXRlOiBOYXJ3aGFsU3RhdGUgPSAnaWRsZSc7XG5cbiAgcHJpdmF0ZSBfd2hpdGVGaWx0ZXI6IFBoYXNlci5GaWx0ZXI7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfYW5pbWF0aW9uTWFjaGluZTogTmFyd2hhbE1hY2hpbmUgPSB7XG4gICAgJ2lkbGUnOiB7XG4gICAgICAnYXR0YWNrJzogJ2F0dGFja2luZycsXG4gICAgICAndGFrZURhbWFnZSc6ICd0YWtpbmdEYW1hZ2UnXG4gICAgfSxcbiAgICAnYXR0YWNraW5nJzoge1xuICAgICAgJ2FuaW1hdGlvbjphdHRhY2tpbmc6ZW5kJzogJ2JhY2soKSdcbiAgICB9LFxuICAgICd0YWtpbmdEYW1hZ2UnOiB7XG4gICAgICAnZGllJzogJ2R5aW5nJyxcbiAgICAgICdkcm9wTGlmZSc6ICdhY2hpbmcnXG4gICAgfSxcbiAgICAnYWNoaW5nJzoge1xuICAgICAgJ2FuaW1hdGlvbjphY2hpbmc6ZW5kJzogJ3JlY292ZXJpbmcnXG4gICAgfSxcbiAgICAncmVjb3ZlcmluZyc6ICB7XG4gICAgICAnYXR0YWNrJzogJ2F0dGFja2luZycsXG4gICAgICAncmVhZHknOiAnaWRsZSdcbiAgICB9LFxuICAgICdkeWluZyc6IHtcbiAgICAgICdhbmltYXRpb246ZHlpbmc6ZW5kJzogJ2RlYWQnXG4gICAgfVxuICB9O1xuXG4gIGdldCBsaXZlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fbGl2ZXM7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihnYW1lLCB4LCB5KSB7XG4gICAgc3VwZXIoZ2FtZSwgeCwgeSwgJ2NoYXI6MScsICdpZGxlLzAwMDEucG5nJyk7XG4gICAgdGhpcy5fZnJhbWVzID0gZ2VuRnJhbWVzKCcnLCAnLnBuZycsIDQpO1xuICAgIC8vdGhpcy5fd2hpdGVGaWx0ZXIgPSB0aGlzLmdhbWUuYWRkLmZpbHRlcignV2hpdGUnKSBhcyBXaGl0ZTtcbiAgICAvL3RoaXMuX3doaXRlRmlsdGVyLmZvcmNlID0gMC43NTtcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUpO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmVuYWJsZSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcbiAgICB0aGlzLl9zZXR1cEFuaW1hdGlvbnMoKTtcbiAgfVxuXG4gIGF0dGFjayhicmFpbjogQnJhaW4pIHtcbiAgICB0aGlzLl90cmFuc2l0aW9uKCdhdHRhY2snLCBicmFpbik7XG4gIH1cblxuICB0YWtlRGFtYWdlKCkge1xuICAgIHRoaXMuX3RyYW5zaXRpb24oJ3Rha2VEYW1hZ2UnKTtcbiAgfVxuXG4gIG1vdmUoZGlyZWN0aW9uKSB7XG4gICAgaWYgKHRoaXMuX2Nhbk1vdmUoKSkge1xuICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSBkaXJlY3Rpb24ueCAqIFNQRUVEO1xuICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnkgPSBkaXJlY3Rpb24ueSAqIFNQRUVEO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICB0aGlzLmFuaW1hdGlvbnMucGxheSh0aGlzLl9nZXRBbmltYXRpb24oKSk7XG4gICAgaWYgKHRoaXMuX3N0YXRlID09PSAnZGVhZCcpIHtcbiAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS5zZXRUbygwLCBTSU5LSU5HX1NQRUVEKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9ibGluaygpIHtcbiAgICBpZiAodGhpcy5maWx0ZXJzKSB7XG4gICAgICB0aGlzLmZpbHRlcnMgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5maWx0ZXJzID0gW3RoaXMuX3doaXRlRmlsdGVyXTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jYW4oYWN0aW9uOiBOYXJ3aGFsQWN0aW9uKSB7XG4gICAgY29uc3QgdHJhbnNpdGlvbnMgPSB0aGlzLl9hbmltYXRpb25NYWNoaW5lW3RoaXMuX3N0YXRlXSB8fCB7fTtcbiAgICByZXR1cm4gYWN0aW9uIGluIHRyYW5zaXRpb25zO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2FuTW92ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fc3RhdGUgIT09ICdkeWluZycgJiYgdGhpcy5fc3RhdGUgIT09ICdkZWFkJztcbiAgfVxuXG4gIHByaXZhdGUgX2NsZWFyQmxpbmsoKSB7XG4gICAgdGhpcy5maWx0ZXJzID0gdW5kZWZpbmVkO1xuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fYmxpbmtpbmcpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0QW5pbWF0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9zdGF0ZTtcbiAgfVxuXG4gIHByaXZhdGUgX29uQ29tcGxldGVBbmltYXRpb24oXywgYW5pbWF0aW9uOiBQaGFzZXIuQW5pbWF0aW9uKSB7XG4gICAgdGhpcy5fdHJhbnNpdGlvbihgYW5pbWF0aW9uOiR7YW5pbWF0aW9uLm5hbWV9OmVuZGAgYXMgTmFyd2hhbEFjdGlvbik7XG4gIH1cblxuICBwcml2YXRlIG9uZW50ZXJhdHRhY2tpbmcoYnJhaW4pIHtcbiAgICBicmFpbi5idXJzdCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbmVudGVyaWRsZSgpIHtcbiAgICB0aGlzLl9jbGVhckJsaW5rKCk7XG4gIH1cblxuICBwcml2YXRlIG9uZW50ZXJkZWFkKCkge1xuICAgIHRoaXMuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSBmYWxzZTtcbiAgICB0aGlzLmNoZWNrV29ybGRCb3VuZHMgPSB0cnVlO1xuICAgIHRoaXMub25EaWUuZGlzcGF0Y2goKTtcbiAgfVxuXG4gIHByaXZhdGUgb25lbnRlcmR5aW5nKCkge1xuICAgIHRoaXMuYm9keS52ZWxvY2l0eS5zZXRUbygwLCAwKTtcbiAgICB0aGlzLm9uRHJvcExpZmUuZGlzcGF0Y2goKTtcbiAgfVxuXG4gIHByaXZhdGUgb25lbnRlcmFjaGluZygpIHtcbiAgICB0aGlzLl9saXZlcy0tO1xuICAgIHRoaXMub25Ecm9wTGlmZS5kaXNwYXRjaCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbmV4aXRhY2hpbmcoKSB7XG4gICAgdGhpcy5fYmxpbmtpbmcgPSBzZXRJbnRlcnZhbCgoKSA9PiB0aGlzLl9ibGluaygpLCAxNTApO1xuICB9XG5cbiAgcHJpdmF0ZSBvbmVudGVycmVjb3ZlcmluZygpIHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuX3RyYW5zaXRpb24oJ3JlYWR5JyksIFJFQ09WRVJJTkdfVElNRSk7XG4gIH1cblxuICBwcml2YXRlIG9uZW50ZXJ0YWtpbmdEYW1hZ2UoKSB7XG4gICAgdGhpcy5fdHJhbnNpdGlvbih0aGlzLl9saXZlcyA9PT0gMSA/ICdkaWUnIDogJ2Ryb3BMaWZlJyk7XG4gIH1cblxuICBwcml2YXRlIF90cmFuc2l0aW9uKGFjdGlvbjogTmFyd2hhbEFjdGlvbiwgLi4uYXJncykge1xuICAgIGNvbnN0IHRyYW5zaXRpb25zID0gdGhpcy5fYW5pbWF0aW9uTWFjaGluZVt0aGlzLl9zdGF0ZV07XG4gICAgaWYgKHRyYW5zaXRpb25zKSB7XG4gICAgICBpZiAoYWN0aW9uIGluIHRyYW5zaXRpb25zKSB7XG4gICAgICAgIGNvbnN0IG5ld1N0YXRlID1cbiAgICAgICAgICAodHJhbnNpdGlvbnNbYWN0aW9uXSA9PT0gJ2JhY2soKScgP1xuICAgICAgICAgICB0aGlzLl9mb3JtZXJTdGF0ZSA6IHRyYW5zaXRpb25zW2FjdGlvbl0pIGFzIE5hcndoYWxTdGF0ZTtcbiAgICAgICAgaWYgKHRoaXMuX3N0YXRlICE9PSBuZXdTdGF0ZSkge1xuICAgICAgICAgIHRoaXMuX2Zvcm1lclN0YXRlID0gdGhpcy5fc3RhdGU7XG4gICAgICAgICAgdGhpcy5fc3RhdGUgPSBuZXdTdGF0ZTtcbiAgICAgICAgICBjb25zdCBleGl0TmFtZSA9IGBvbmV4aXQke3RoaXMuX2Zvcm1lclN0YXRlfWA7XG4gICAgICAgICAgdGhpc1tleGl0TmFtZV0gJiYgdGhpc1tleGl0TmFtZV0oLi4uYXJncyk7XG4gICAgICAgICAgY29uc3QgZW50ZXJOYW1lID0gYG9uZW50ZXIke25ld1N0YXRlfWA7XG4gICAgICAgICAgdGhpc1tlbnRlck5hbWVdICYmIHRoaXNbZW50ZXJOYW1lXSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3NldHVwQW5pbWF0aW9ucygpIHtcbiAgICB0aGlzLmFuaW1hdGlvbnMuYWRkKFxuICAgICAgJ2lkbGUnLFxuICAgICAgdGhpcy5fZnJhbWVzKCdpZGxlJywgWzEsIDVdLCBbNCwgMl0pLCAxMCxcbiAgICAgIHRydWUsIGZhbHNlXG4gICAgKS5vbkNvbXBsZXRlLmFkZCh0aGlzLl9vbkNvbXBsZXRlQW5pbWF0aW9uLCB0aGlzKTtcblxuICAgIHRoaXMuYW5pbWF0aW9ucy5hZGQoXG4gICAgICAnYXR0YWNraW5nJyxcbiAgICAgIHRoaXMuX2ZyYW1lcygnYXR0YWNrJywgWzEsIDZdLCBbNl0sIFs2XSwgWzZdKSwgMjVcbiAgICApLm9uQ29tcGxldGUuYWRkKHRoaXMuX29uQ29tcGxldGVBbmltYXRpb24sIHRoaXMpO1xuXG4gICAgdGhpcy5hbmltYXRpb25zLmFkZChcbiAgICAgICdkeWluZycsXG4gICAgICB0aGlzLl9mcmFtZXMoJ2RlYXRoJywgWzEsIDldKSwgMTBcbiAgICApLm9uQ29tcGxldGUuYWRkKHRoaXMuX29uQ29tcGxldGVBbmltYXRpb24sIHRoaXMpO1xuXG4gICAgdGhpcy5hbmltYXRpb25zLmFkZChcbiAgICAgICdyZWNvdmVyaW5nJyxcbiAgICAgIHRoaXMuX2ZyYW1lcygncmVjb3ZlcmluZycsIFsxLCAzXSksIDEwXG4gICAgKS5vbkNvbXBsZXRlLmFkZCh0aGlzLl9vbkNvbXBsZXRlQW5pbWF0aW9uLCB0aGlzKTtcblxuICAgIHRoaXMuYW5pbWF0aW9ucy5hZGQoXG4gICAgICAnYWNoaW5nJyxcbiAgICAgIHRoaXMuX2ZyYW1lcygnZGFtYWdlJywgWzEsIDNdLCBbMywgMV0pLCAxMFxuICAgICkub25Db21wbGV0ZS5hZGQodGhpcy5fb25Db21wbGV0ZUFuaW1hdGlvbiwgdGhpcyk7XG5cbiAgICB0aGlzLmFuaW1hdGlvbnMuYWRkKFxuICAgICAgJ2RlYWQnLFxuICAgICAgdGhpcy5fZnJhbWVzKCdkZWF0aCcsIFs5XSksIDFcbiAgICApLm9uQ29tcGxldGUuYWRkKHRoaXMuX29uQ29tcGxldGVBbmltYXRpb24sIHRoaXMpO1xuICB9XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9+L3NvdXJjZS1tYXAtbG9hZGVyIS4vc3JjL3RzL05hcndoYWwudHMiLCJpbXBvcnQgRW52aXJvbm1lbnQgZnJvbSAnLi9FbnZpcm9ubWVudCc7XG5pbXBvcnQgT2NlYW4gZnJvbSAnLi9PY2Vhbic7XG5cbmV4cG9ydCB7IEVudmlyb25tZW50LCBPY2VhbiB9O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdHMvZW52aXJvbm1lbnRzL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IEVuZW15LCBBbGllbiwgQnJhaW4gfSBmcm9tICcuL2VuZW1pZXMnO1xuXG5jb25zdCBERUdfOTAgPSBNYXRoLlBJIC8gMjtcbmNvbnN0IERFR18xODAgPSBNYXRoLlBJO1xuY29uc3QgREVHXzM2MCA9IDIgKiBNYXRoLlBJO1xuXG50eXBlIFB1bHNlID0geyBhbXBsaXR1ZGU6IG51bWJlciwgZnJlcXVlbmN5OiBudW1iZXIgfTtcblxudHlwZSBQYXRoID0ge1xuICB4OiBBcnJheTxudW1iZXI+LCB5OiBBcnJheTxudW1iZXI+LFxuICBzdGFydFRpbWU6IG51bWJlciwgZHVyYXRpb246IG51bWJlclxufTtcblxuYWJzdHJhY3QgY2xhc3MgUmFkaWFsRm9ybWF0aW9uIGV4dGVuZHMgUGhhc2VyLkdyb3VwIHtcblxuICBhYnN0cmFjdCBsb2NhdGlvbnM6IEFycmF5PFBoYXNlci5Qb2ludD47XG5cbiAgcGF1c2VkOiBib29sZWFuO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2JyYWluczogQXJyYXk8QnJhaW4+ID0gW107XG5cbiAgcHJpdmF0ZSBfcm90YXRpb246IG51bWJlciA9IDA7XG5cbiAgcHJpdmF0ZSBfcGF0aDogUGF0aCA9IHtcbiAgICB4OiBbXSwgeTogW10sXG4gICAgc3RhcnRUaW1lOiAtSW5maW5pdHksIGR1cmF0aW9uOiBJbmZpbml0eVxuICB9O1xuXG4gIHByaXZhdGUgX3BoeXNpY3NUaW1lVG90YWw6IG51bWJlciA9IDA7XG5cbiAgcHJpdmF0ZSBfcHVsc2U6IFB1bHNlID0geyBhbXBsaXR1ZGU6IDAsIGZyZXF1ZW5jeTogMCB9O1xuXG4gIG9uRGVzdHJveWVkQnlDaGFyYWN0ZXIgPSBuZXcgUGhhc2VyLlNpZ25hbCgpO1xuXG4gIGNvbnN0cnVjdG9yKGdhbWU6IFBoYXNlci5HYW1lKSB7XG4gICAgc3VwZXIoZ2FtZSk7XG4gIH1cblxuICBpbml0KGFsaWVuczogQXJyYXk8QWxpZW4+LCBicmFpbnM6IEFycmF5PEJyYWluPiwgYnJhaW5Qb3NpdGlvbnM6IEFycmF5PG51bWJlcj4pIHtcbiAgICBhbGllbnMuZm9yRWFjaChhbGllbiA9PiB0aGlzLmdhbWUucGh5c2ljcy5lbmFibGUoYWxpZW4pKTtcbiAgICBicmFpbnMuZm9yRWFjaChicmFpbiA9PiB7XG4gICAgICBicmFpbi5vbkJ1cnN0LmFkZE9uY2UodGhpcy5fdHJ5VG9EZXN0cm95LCB0aGlzKTtcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmVuYWJsZShicmFpbik7XG4gICAgICB0aGlzLl9icmFpbnMucHVzaChicmFpbik7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9wbGFjZShhbGllbnMsIGJyYWlucywgYnJhaW5Qb3NpdGlvbnMpO1xuICB9XG5cbiAgZW5hYmxlUm90YXRpb24oc3BlZWQpIHtcbiAgICB0aGlzLl9yb3RhdGlvbiA9IHNwZWVkO1xuICB9XG5cbiAgZGlzYWJsZVJvdGF0aW9uKCkge1xuICAgIHRoaXMuZW5hYmxlUm90YXRpb24oMCk7XG4gIH1cblxuICBlbmFibGVQdWxzZShhbXBsaXR1ZGUsIHNwZWVkKSB7XG4gICAgdGhpcy5fcHVsc2UuYW1wbGl0dWRlID0gYW1wbGl0dWRlO1xuICAgIHRoaXMuX3B1bHNlLmZyZXF1ZW5jeSA9IHNwZWVkO1xuICB9XG5cbiAgZGlzYWJsZVB1bHNlKCkge1xuICAgIHRoaXMuZW5hYmxlUHVsc2UoMCwgMCk7XG4gIH1cblxuICBlbmFibGVNb3ZlbWVudChwYXRoOiBBcnJheTxQSVhJLlBvaW50PiwgdGltZSkge1xuICAgIHRoaXMuX3BhdGgueCA9IHBhdGgubWFwKHBvaW50ID0+IHBvaW50LngpO1xuICAgIHRoaXMuX3BhdGgueSA9IHBhdGgubWFwKHBvaW50ID0+IHBvaW50LnkpO1xuICAgIHRoaXMuX3BhdGguc3RhcnRUaW1lID0gdGhpcy5fcGh5c2ljc1RpbWVUb3RhbDtcbiAgICB0aGlzLl9wYXRoLmR1cmF0aW9uID0gdGltZTtcbiAgfVxuXG4gIGRpc2FibGVkTW92ZW1lbnQoKSB7XG4gICAgdGhpcy5lbmFibGVNb3ZlbWVudChbXSwgMCk7XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgaWYgKCF0aGlzLnBhdXNlZCkge1xuICAgICAgY29uc3QgZHQgPSB0aGlzLmdhbWUudGltZS5waHlzaWNzRWxhcHNlZDtcbiAgICAgIGNvbnN0IHQgPSB0aGlzLl9waHlzaWNzVGltZVRvdGFsICs9IGR0O1xuICAgICAgdGhpcy5fcm90YXRlKHQsIGR0KTtcbiAgICAgIHRoaXMuX3B1bHNhdGUodCwgZHQpO1xuICAgICAgdGhpcy5fbW92ZSh0LCBkdCk7XG4gICAgICB0aGlzLl9jaGVja091dE9mU2NyZWVuKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY2hlY2tPdXRPZlNjcmVlbigpIHtcbiAgICBjb25zdCB7IHgsIHksIHdpZHRoLCBoZWlnaHQgfSA9IHRoaXMuZ2V0Qm91bmRzKCk7XG4gICAgY29uc3QgZm9ybWF0aW9uQm91bmRzID0gbmV3IFBoYXNlci5SZWN0YW5nbGUoeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gICAgY29uc3QgY2FtZXJhVmlldyA9IHRoaXMuZ2FtZS5jYW1lcmEudmlldztcbiAgICBjb25zdCBpc091dHNpZGUgPVxuICAgICAgIVBoYXNlci5SZWN0YW5nbGUuaW50ZXJzZWN0cyhmb3JtYXRpb25Cb3VuZHMsIGNhbWVyYVZpZXcpO1xuICAgIGlmIChpc091dHNpZGUpIHtcbiAgICAgIHRoaXMuX2Rlc3Ryb3lJbW1lZGlhdGVseSgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2Rlc3Ryb3lBbmltYXRlZCgpIHtcbiAgICB0aGlzLl9kZXN0cm95U2hhcGUoKS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMub25EZXN0cm95ZWRCeUNoYXJhY3Rlci5kaXNwYXRjaCh0aGlzLmxvY2F0aW9ucy5sZW5ndGgpO1xuICAgICAgdGhpcy5kZXN0cm95KGZhbHNlKVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZGVzdHJveUltbWVkaWF0ZWx5KCkge1xuICAgIHRoaXMuY2FsbEFsbCgna2lsbCcsIG51bGwpO1xuICAgIHRoaXMuZGVzdHJveShmYWxzZSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX2Rlc3Ryb3lTaGFwZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oZnVsZmlsID0+IHtcbiAgICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBjb25zdCBlbmVteSA9IHRoaXMuY2hpbGRyZW5baW5kZXhdIGFzIEVuZW15O1xuICAgICAgICAgIGlmIChlbmVteSkge1xuICAgICAgICAgICAgZW5lbXkua2lsbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaW5kZXggPT09IGxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGZ1bGZpbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgaW5kZXggKiA1MCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9tb3ZlKHQ6IG51bWJlciwgZHQ6IG51bWJlcikge1xuICAgIGNvbnN0IHBlcmNlbnRhZ2UgPSAodCAtIHRoaXMuX3BhdGguc3RhcnRUaW1lKSAvIHRoaXMuX3BhdGguZHVyYXRpb247XG4gICAgdGhpcy54ID0gdGhpcy5nYW1lLm1hdGguYmV6aWVySW50ZXJwb2xhdGlvbih0aGlzLl9wYXRoLngsIHBlcmNlbnRhZ2UpO1xuICAgIHRoaXMueSA9IHRoaXMuZ2FtZS5tYXRoLmJlemllckludGVycG9sYXRpb24odGhpcy5fcGF0aC55LCBwZXJjZW50YWdlKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BsYWNlKGFsaWVuczogQXJyYXk8QWxpZW4+LCBicmFpbnM6IEFycmF5PEJyYWluPiwgYnJhaW5Qb3NpdGlvbnM6IEFycmF5PG51bWJlcj4pIHtcbiAgICB0aGlzLmxvY2F0aW9ucy5mb3JFYWNoKCh7IHgsIHkgfSwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IGlzQnJhaW5QbGFjZSA9IGJyYWluUG9zaXRpb25zLmluZGV4T2YoaW5kZXgpID49IDA7XG4gICAgICBjb25zdCBlbmVteSA9IGlzQnJhaW5QbGFjZSA/IGJyYWlucy5wb3AoKSA6IGFsaWVucy5wb3AoKTtcbiAgICAgIGlmIChlbmVteSkge1xuICAgICAgICBlbmVteS5wbGFjZSh0aGlzLCB4LCB5KTtcbiAgICAgICAgZW5lbXkucm90YXRpb24gPSBNYXRoLmF0YW4oeSAvIHgpICsgREVHXzkwICsgKHggPCAwID8gREVHXzE4MCA6IDApO1xuICAgICAgICB0aGlzLmFkZENoaWxkKGVuZW15KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX3B1bHNhdGUodDogbnVtYmVyLCBkdDogbnVtYmVyKSB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuIGFzIEFycmF5PEVuZW15PjtcbiAgICBjb25zdCB7IGFtcGxpdHVkZSwgZnJlcXVlbmN5IH0gPSB0aGlzLl9wdWxzZTtcbiAgICBjaGlsZHJlbi5mb3JFYWNoKGVuZW15ID0+IHtcbiAgICAgIGNvbnN0IHsgcm90YXRpb24sIGRpc3RhbmNlIH0gPSBlbmVteTtcbiAgICAgIGlmIChkaXN0YW5jZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0VuZW15IGlzIG5vdCBjb3JyZWN0bHkgcGxhY2VkIGluIHRoZSBmb3JtYXRpb24uJyk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gZGlzdGFuY2UgKyBhbXBsaXR1ZGU7XG4gICAgICAgIGNvbnN0IGRpc3BsYWNlbWVudCA9XG4gICAgICAgICAgYW1wbGl0dWRlICogTWF0aC5zaW4oREVHXzM2MCAqIGZyZXF1ZW5jeSAqIHQpICsgb2Zmc2V0O1xuICAgICAgICBlbmVteS54ID0gZGlzcGxhY2VtZW50ICogTWF0aC5jb3Mocm90YXRpb24gLSBERUdfOTApO1xuICAgICAgICBlbmVteS55ID0gZGlzcGxhY2VtZW50ICogTWF0aC5zaW4ocm90YXRpb24gLSBERUdfOTApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfcm90YXRlKHQ6IG51bWJlciwgZHQ6IG51bWJlcikge1xuICAgIHRoaXMucm90YXRpb24gKz0gdGhpcy5fcm90YXRpb24gKiBkdDtcbiAgfVxuXG4gIHByaXZhdGUgX3RyeVRvRGVzdHJveShicmFpbjogQnJhaW4pIHtcbiAgICB0aGlzLnBhdXNlZCA9IHRydWU7XG4gICAgdGhpcy5fYnJhaW5zLnNwbGljZSh0aGlzLl9icmFpbnMuaW5kZXhPZihicmFpbiksIDEpWzBdLmtpbGwoKTtcbiAgICBpZiAodGhpcy5fYnJhaW5zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5fZGVzdHJveUFuaW1hdGVkKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cbn1cblxudHlwZSBEaWFtb25QYXJhbWV0ZXJzID0geyByYWRpdXM6IG51bWJlciB9O1xuY2xhc3MgRGlhbW9uZCBleHRlbmRzIFJhZGlhbEZvcm1hdGlvbiB7XG5cbiAgcHJpdmF0ZSBzdGF0aWMgZGVmYXVsdHM6IERpYW1vblBhcmFtZXRlcnMgPSB7IHJhZGl1czogMTAwIH07XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfcmFkaXVzOiBudW1iZXI7XG5cbiAgcHJpdmF0ZSBfbG9jYXRpb25zO1xuXG4gIGdldCBsb2NhdGlvbnMoKSB7XG4gICAgaWYgKCF0aGlzLl9sb2NhdGlvbnMpIHtcbiAgICAgIGNvbnN0IHJhZGl1cyA9IHRoaXMuX3JhZGl1cztcbiAgICAgIHRoaXMuX2xvY2F0aW9ucyA9IFtcbiAgICAgICAgbmV3IFBoYXNlci5Qb2ludCgwLCByYWRpdXMpLFxuICAgICAgICBuZXcgUGhhc2VyLlBvaW50KHJhZGl1cyAvIDIsIHJhZGl1cyAvIDIpLFxuICAgICAgICBuZXcgUGhhc2VyLlBvaW50KHJhZGl1cywgMCksXG4gICAgICAgIG5ldyBQaGFzZXIuUG9pbnQocmFkaXVzIC8gMiwgLXJhZGl1cyAvIDIpLFxuICAgICAgICBuZXcgUGhhc2VyLlBvaW50KDAsIC1yYWRpdXMpLFxuICAgICAgICBuZXcgUGhhc2VyLlBvaW50KC1yYWRpdXMgLyAyLCAtcmFkaXVzIC8gMiksXG4gICAgICAgIG5ldyBQaGFzZXIuUG9pbnQoLXJhZGl1cywgMCksXG4gICAgICAgIG5ldyBQaGFzZXIuUG9pbnQoLXJhZGl1cyAvIDIsIHJhZGl1cyAvIDIpXG4gICAgICBdO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fbG9jYXRpb25zO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZ2FtZTogUGhhc2VyLkdhbWUsIHsgcmFkaXVzIH0gPSBEaWFtb25kLmRlZmF1bHRzKSB7XG4gICAgc3VwZXIoZ2FtZSk7XG4gICAgdGhpcy5fcmFkaXVzID0gcmFkaXVzO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9idWlsZFNoYXBlKCkge1xuICAgIHJldHVybiB0aGlzLmxvY2F0aW9ucy5tYXAocG9pbnQgPT4ge1xuICAgICAgY29uc3QgY29udGFpbmVyID0gbmV3IFBoYXNlci5Hcm91cCh0aGlzLmdhbWUpO1xuICAgICAgY29udGFpbmVyLnBvc2l0aW9uID0gcG9pbnQ7XG4gICAgICBjb250YWluZXIucm90YXRpb24gPSBNYXRoLmF0YW4ocG9pbnQueSAvIHBvaW50LngpICtcbiAgICAgICAgREVHXzkwICsgKHBvaW50LnggPCAwID8gREVHXzE4MCA6IDApO1xuICAgICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgICB9KTtcbiAgfVxuXG59XG5cbmNsYXNzIERlbHRhIGV4dGVuZHMgUmFkaWFsRm9ybWF0aW9uIHtcblxuICBwcml2YXRlIF9sb2NhdGlvbnM7XG5cbiAgZ2V0IGxvY2F0aW9ucygpOiBBcnJheTxQaGFzZXIuUG9pbnQ+IHtcbiAgICBpZiAoIXRoaXMuX2xvY2F0aW9ucykge1xuICAgICAgY29uc3QgcmFkaXVzID0gdGhpcy5fcmFkaXVzO1xuICAgICAgdGhpcy5fbG9jYXRpb25zID0gW1xuICAgICAgICBuZXcgUGhhc2VyLlBvaW50KHJhZGl1cywgMCksXG4gICAgICAgIG5ldyBQaGFzZXIuUG9pbnQocmFkaXVzIC8gMiwgcmFkaXVzIC8gMiksXG4gICAgICAgIG5ldyBQaGFzZXIuUG9pbnQoMCwgcmFkaXVzKSxcbiAgICAgICAgbmV3IFBoYXNlci5Qb2ludCgtcmFkaXVzIC8gMiwgcmFkaXVzIC8gMiksXG4gICAgICAgIG5ldyBQaGFzZXIuUG9pbnQoLXJhZGl1cywgMCksXG4gICAgICBdO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fbG9jYXRpb25zO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgZGVmYXVsdHM6IERpYW1vblBhcmFtZXRlcnMgPSB7IHJhZGl1czogMTAwIH07XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfcmFkaXVzOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoZ2FtZTogUGhhc2VyLkdhbWUsIHsgcmFkaXVzIH0gPSBEZWx0YS5kZWZhdWx0cykge1xuICAgIHN1cGVyKGdhbWUpO1xuICAgIHRoaXMuX3JhZGl1cyA9IHJhZGl1cztcbiAgfVxuXG59XG5cbmV4cG9ydCB7IERpYW1vbmQsIERlbHRhLCBSYWRpYWxGb3JtYXRpb24sIFBhdGgsIFB1bHNlIH07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9+L3NvdXJjZS1tYXAtbG9hZGVyIS4vc3JjL3RzL0Zvcm1hdGlvbi50cyIsImltcG9ydCBFbmVteSBmcm9tICcuL0VuZW15JztcbmltcG9ydCB7IGdlbkZyYW1lcyB9IGZyb20gJy4uL3V0aWxzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWxpZW4gZXh0ZW5kcyBFbmVteSB7XG5cbiAgcHJpdmF0ZSBfZnJhbWVzO1xuXG4gIGNvbnN0cnVjdG9yKGdhbWUpIHtcbiAgICBzdXBlcihnYW1lLCAnYWxpZW4nKTtcbiAgICB0aGlzLl9mcmFtZXMgPSBnZW5GcmFtZXMoJycsICcucG5nJywgNCk7XG4gICAgdGhpcy5fc2V0dXBBbmltYXRpb25zKCk7XG4gICAgdGhpcy5hbmltYXRpb25zLnBsYXkoJ2lkbGUnKTtcbiAgfVxuXG4gIHByaXZhdGUgX29uQ29tcGxldGVBbmltYXRpb24oKSB7XG5cbiAgfVxuXG4gIHByaXZhdGUgX3NldHVwQW5pbWF0aW9ucygpIHtcbiAgICB0aGlzLmFuaW1hdGlvbnMuYWRkKFxuICAgICAgJ2lkbGUnLFxuICAgICAgdGhpcy5fZnJhbWVzKCdpZGxlJywgWzEsIDVdLCBbNCwgMl0pLCA4LFxuICAgICAgdHJ1ZSwgZmFsc2VcbiAgICApLm9uQ29tcGxldGUuYWRkKHRoaXMuX29uQ29tcGxldGVBbmltYXRpb24sIHRoaXMpO1xuICB9XG5cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL34vc291cmNlLW1hcC1sb2FkZXIhLi9zcmMvdHMvZW5lbWllcy9BbGllbi50cyIsImltcG9ydCBFbmVteSBmcm9tICcuL0VuZW15JztcbmltcG9ydCB7IGdlbkZyYW1lcyB9IGZyb20gJy4uL3V0aWxzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnJhaW4gZXh0ZW5kcyBFbmVteSB7XG5cbiAgcmVhZG9ubHkgb25CdXJzdDogUGhhc2VyLlNpZ25hbCA9IG5ldyBQaGFzZXIuU2lnbmFsKCk7XG5cbiAgcHJpdmF0ZSBfZnJhbWVzO1xuXG4gIGNvbnN0cnVjdG9yKGdhbWUpIHtcbiAgICBzdXBlcihnYW1lLCAnYnJhaW4nKTtcbiAgICB0aGlzLl9mcmFtZXMgPSBnZW5GcmFtZXMoJycsICcucG5nJywgNCk7XG4gICAgdGhpcy5fc2V0dXBBbmltYXRpb25zKCk7XG4gICAgdGhpcy5hbmltYXRpb25zLnBsYXkoJ2lkbGUnKTtcbiAgfVxuXG4gIGJ1cnN0KCkge1xuICAgIHRoaXMub25CdXJzdC5kaXNwYXRjaCh0aGlzKTtcbiAgfVxuXG4gIHByaXZhdGUgX29uQ29tcGxldGVBbmltYXRpb24oKSB7XG5cbiAgfVxuXG4gIHByaXZhdGUgX3NldHVwQW5pbWF0aW9ucygpIHtcbiAgICB0aGlzLmFuaW1hdGlvbnMuYWRkKFxuICAgICAgJ2lkbGUnLFxuICAgICAgdGhpcy5fZnJhbWVzKCdpZGxlJywgWzEsIDVdLCBbNCwgMl0pLCA3LFxuICAgICAgdHJ1ZSwgZmFsc2VcbiAgICApLm9uQ29tcGxldGUuYWRkKHRoaXMuX29uQ29tcGxldGVBbmltYXRpb24sIHRoaXMpO1xuICB9XG5cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL34vc291cmNlLW1hcC1sb2FkZXIhLi9zcmMvdHMvZW5lbWllcy9CcmFpbi50cyIsImltcG9ydCBFbnZpcm9ubWVudCBmcm9tICcuL0Vudmlyb25tZW50JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT2NlYW4gZXh0ZW5kcyBFbnZpcm9ubWVudCB7XG5cbiAgcHJpdmF0ZSBfcGh5c2ljc1RpbWVUb3RhbDogbnVtYmVyID0gMDtcblxuICBwcml2YXRlIF9meFN0YXRlcztcblxuICBjb25zdHJ1Y3RvcihnYW1lOiBQaGFzZXIuR2FtZSkge1xuICAgIHN1cGVyKGdhbWUpO1xuICB9XG5cbiAgaW5pdCh7IGZ4LCBzcGVlZHMgfTogeyBmeDogbnVtYmVyLCBzcGVlZHM6IEFycmF5PG51bWJlcj4gfSwgbGF5ZXI6IFBoYXNlci5Hcm91cCkge1xuICAgIHN1cGVyLmluaXQoe30sIGxheWVyKTtcbiAgICBjb25zdCBiZyA9IHRoaXMuX2xheWVyLmNoaWxkcmVuWzBdIGFzIFBoYXNlci5JbWFnZTtcbiAgICB0aGlzLl9meFN0YXRlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IGZ4OyBpKyspIHtcbiAgICAgIGNvbnN0IGZ4ID0gdGhpcy5fbGF5ZXIuY3JlYXRlKDAsIDAsIGBiZzpmeDoke2l9YCkgYXMgUGhhc2VyLkltYWdlO1xuICAgICAgY29uc3Qgd2lkdGhEaWZmZXJlbmNlID0gZngud2lkdGggLSBiZy53aWR0aDtcbiAgICAgIGNvbnN0IG9mZnNldFggPSB3aWR0aERpZmZlcmVuY2UgLyAyO1xuICAgICAgZngucG9zaXRpb24ueCA9IC1vZmZzZXRYO1xuICAgICAgY29uc3Qgc3BlZWQgPSBzcGVlZHNbaSAtIDFdO1xuICAgICAgY29uc3QgbGltaXRzID0gWy13aWR0aERpZmZlcmVuY2UsIDBdO1xuICAgICAgY29uc3QgZGlyZWN0aW9uID0gLTE7XG4gICAgICB0aGlzLl9meFN0YXRlcy5wdXNoKHsgbGF5ZXI6IGZ4LCBzcGVlZCwgbGltaXRzLCBkaXJlY3Rpb24gfSk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIGNvbnN0IGR0ID0gdGhpcy5fZ2FtZS50aW1lLnBoeXNpY3NFbGFwc2VkO1xuICAgIHRoaXMuX3BoeXNpY3NUaW1lVG90YWwgKz0gZHQ7XG4gICAgdGhpcy5fZnhTdGF0ZXMuZm9yRWFjaChzdGF0ZSA9PiB7XG4gICAgICBjb25zdCB7IGxheWVyLCBzcGVlZCwgbGltaXRzLCBkaXJlY3Rpb24gfSA9IHN0YXRlO1xuICAgICAgY29uc3QgZHYgPSBkaXJlY3Rpb24gKiBzcGVlZCAqIGR0O1xuICAgICAgY29uc3QgY3VycmVudFBvc2l0aW9uID0gbGF5ZXIucG9zaXRpb24ueCArPSBkdjtcbiAgICAgIGlmIChjdXJyZW50UG9zaXRpb24gPD0gbGltaXRzWzBdIHx8IGN1cnJlbnRQb3NpdGlvbiA+PSBsaW1pdHNbMV0pIHtcbiAgICAgICAgc3RhdGUuZGlyZWN0aW9uID0gLXN0YXRlLmRpcmVjdGlvbjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9+L3NvdXJjZS1tYXAtbG9hZGVyIS4vc3JjL3RzL2Vudmlyb25tZW50cy9PY2Vhbi50cyIsImltcG9ydCBOYXJ3aGFsIGZyb20gJy4vTmFyd2hhbCc7XG5pbXBvcnQgeyBBbGllbiwgQnJhaW4gfSBmcm9tICcuL2VuZW1pZXMnO1xuaW1wb3J0IEZvcm1hdGlvbk1hbmFnZXIgZnJvbSAnLi9Gb3JtYXRpb25NYW5hZ2VyJztcbmltcG9ydCB7IFNwYWNlTmFyd2hhbExvYWRlciB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgT2NlYW4gfSBmcm9tICcuL2Vudmlyb25tZW50cyc7XG4vLyBpbXBvcnQgeyBXaGl0ZSB9IGZyb20gJy4vc2hhZGVycyc7XG5cbmNsYXNzIExldmVsIGV4dGVuZHMgUGhhc2VyLlN0YXRlIHtcblxuICBwcml2YXRlIF9lbnZpcm9ubWVudDogT2NlYW47XG5cbiAgcHJpdmF0ZSBfbmFyd2hhbDogTmFyd2hhbDtcblxuICBwcml2YXRlIF9mb3JtYXRpb25NYW5hZ2VyOiBGb3JtYXRpb25NYW5hZ2VyO1xuXG4gIHByaXZhdGUgX2tleXM6IHsgW2s6IHN0cmluZ106IFBoYXNlci5LZXkgfTtcblxuICBwcml2YXRlIF9zY29yZTogUGhhc2VyLlRleHQ7XG5cbiAgaW5pdCgpIHtcbiAgICAvLyBQaGFzZXIuRmlsdGVyLldoaXRlID0gV2hpdGU7XG4gICAgdGhpcy5nYW1lLmxvYWQgPSBuZXcgU3BhY2VOYXJ3aGFsTG9hZGVyKHRoaXMuZ2FtZSk7XG4gICAgdGhpcy5fa2V5cyA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXlzKHtcbiAgICAgIGxlZnQ6IFBoYXNlci5LZXlDb2RlLkxFRlQsXG4gICAgICByaWdodDogUGhhc2VyLktleUNvZGUuUklHSFQsXG4gICAgICB1cDogUGhhc2VyLktleUNvZGUuVVAsXG4gICAgICBkb3duOiBQaGFzZXIuS2V5Q29kZS5ET1dOXG4gICAgfSk7XG4gICAgdGhpcy5fZm9ybWF0aW9uTWFuYWdlciA9IG5ldyBGb3JtYXRpb25NYW5hZ2VyKHRoaXMuZ2FtZSk7XG4gICAgdGhpcy5fZW52aXJvbm1lbnQgPSBuZXcgT2NlYW4odGhpcy5nYW1lKTtcbiAgfVxuXG4gIHByZWxvYWQoKSB7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXRsYXNKU09OSGFzaChcbiAgICAgICdjaGFyOjEnLFxuICAgICAgJ2Fzc2V0cy9hbmltYXRpb25zL2NoYXItMDEucG5nJywgJ2Fzc2V0cy9hbmltYXRpb25zL2NoYXItMDEuanNvbidcbiAgICApO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzSlNPTkhhc2goXG4gICAgICAnYWxpZW4nLFxuICAgICAgJ2Fzc2V0cy9hbmltYXRpb25zL2VuZW15LTAxLnBuZycsICdhc3NldHMvYW5pbWF0aW9ucy9lbmVteS0wMS5qc29uJ1xuICAgICk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXRsYXNKU09OSGFzaChcbiAgICAgICdicmFpbicsXG4gICAgICAnYXNzZXRzL2FuaW1hdGlvbnMvYnJhaW4tMDEucG5nJywgJ2Fzc2V0cy9hbmltYXRpb25zL2JyYWluLTAxLmpzb24nXG4gICAgKTtcbiAgICB0aGlzLmdhbWUubG9hZC5qc29uKCdsZXZlbCcsICdsZXZlbHMvTDAxMDEuanNvbicpO1xuICAgICh0aGlzLmdhbWUubG9hZCBhcyBhbnkpLndlYmZvbnQoJ3Njb3JlLWZvbnQnLCAnUmV2YWxpYScpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmltYWdlKCdiZzpiYWNrZ3JvdW5kJywgJ2Fzc2V0cy9iYWNrLTAxLnBuZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmltYWdlKCdiZzpmeDoxJywgJ2Fzc2V0cy9iYWNrLWZ4LWJhY2sucG5nJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoJ2JnOmZ4OjInLCAnYXNzZXRzL2JhY2stZngtZnJvbnQucG5nJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoJ25hcndoYWwnLCAnYXNzZXRzL2NoYXItMDEucG5nJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoJ2h1ZDpoZWFydCcsICdhc3NldHMvaHVkLWxpZmUucG5nJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoJ2h1ZDplbmVteScsICdhc3NldHMvaHVkLWVuZW15LnBuZycpO1xuICB9XG5cbiAgY3JlYXRlKCkge1xuICAgIGNvbnN0IGJnTGF5ZXIgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgY29uc3QgZW5lbXlMYXllciA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICBjb25zdCBjaGFyYWN0ZXJMYXllciA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICBjb25zdCBodWRMYXllciA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICB0aGlzLl9pbml0RW52aXJvbm1lbnQoYmdMYXllcik7XG4gICAgdGhpcy5fc3Bhd25OYXJ3aGFsKGNoYXJhY3RlckxheWVyKTtcbiAgICB0aGlzLl9pbml0Rm9ybWF0aW9ucyhlbmVteUxheWVyKTtcbiAgICB0aGlzLl9jcmVhdGVIdWQoaHVkTGF5ZXIpO1xuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIHRoaXMuX2Zvcm1hdGlvbk1hbmFnZXIudXBkYXRlKCk7XG4gICAgdGhpcy5fZW52aXJvbm1lbnQudXBkYXRlKCk7XG4gICAgdGhpcy5faGFuZGxlSW5wdXQoKTtcbiAgICB0aGlzLl9oYW5kbGVDb2xsaXNpb25zKCk7XG4gICAgdGhpcy5fdXBkYXRlSHVkKCk7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVIdWQoaHVkTGF5ZXI6IFBoYXNlci5Hcm91cCkge1xuICAgIC8vIExpdmVzXG4gICAgY29uc3QgaGVhcnRzID0gbmV3IFBoYXNlci5Hcm91cCh0aGlzLmdhbWUpO1xuICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5fbmFyd2hhbC5saXZlczsgaSA8IGw7IGkrKykge1xuICAgICAgY29uc3QgaGVhcnQgPVxuICAgICAgICBuZXcgUGhhc2VyLkltYWdlKHRoaXMuZ2FtZSwgMCwgLTUyIC0gKGkgKiA2MCksICdodWQ6aGVhcnQnKTtcbiAgICAgIGhlYXJ0cy5hZGRDaGlsZChoZWFydCk7XG4gICAgfVxuICAgIGhlYXJ0cy5wb3NpdGlvbi5zZXRUbygyMCwgMTA0NSk7XG4gICAgaHVkTGF5ZXIuYWRkQ2hpbGQoaGVhcnRzKTtcbiAgICB0aGlzLl9uYXJ3aGFsLm9uRHJvcExpZmUuYWRkKCgpID0+IHtcbiAgICAgIGhlYXJ0cy5yZW1vdmVDaGlsZEF0KGhlYXJ0cy5sZW5ndGggLSAxKTtcbiAgICB9KTtcblxuICAgIC8vIFNjb3JlXG4gICAgY29uc3Qgc2NvcmUgPSBuZXcgUGhhc2VyLkdyb3VwKHRoaXMuZ2FtZSk7XG4gICAgY29uc3QgZW5lbXlJbmRpY2F0b3IgPSBuZXcgUGhhc2VyLkltYWdlKHRoaXMuZ2FtZSwgMCwgMCwgJ2h1ZDplbmVteScpO1xuICAgIHRoaXMuX3Njb3JlID0gbmV3IFBoYXNlci5UZXh0KHRoaXMuZ2FtZSwgNDUsIDAsICd4MDAwMCcsIHtcbiAgICAgIGZvbnQ6ICdSZXZhbGlhJyxcbiAgICAgIGZvbnRTaXplOiAnMzhweCcsXG4gICAgICBmaWxsOiAnd2hpdGUnXG4gICAgfSk7XG4gICAgdGhpcy5fc2NvcmUuc2V0U2hhZG93KDEsIDEsICdibGFjaycsIDUpO1xuICAgIHNjb3JlLmFkZENoaWxkKGVuZW15SW5kaWNhdG9yKTtcbiAgICBzY29yZS5hZGRDaGlsZCh0aGlzLl9zY29yZSk7XG4gICAgc2NvcmUudXBkYXRlVHJhbnNmb3JtKCk7XG4gICAgc2NvcmUucG9zaXRpb24uc2V0VG8oMTUsIDE1KTtcbiAgICBodWRMYXllci5hZGRDaGlsZChzY29yZSk7XG4gIH1cblxuXG4gIHByaXZhdGUgX2luaXRFbnZpcm9ubWVudChsYXllcjogUGhhc2VyLkdyb3VwKSB7XG4gICAgdGhpcy5fZW52aXJvbm1lbnQuaW5pdCh7IGZ4OiAyLCBzcGVlZHM6IFsxMCwgMjBdIH0sIGxheWVyKTtcbiAgfVxuXG4gIHByaXZhdGUgX2luaXRGb3JtYXRpb25zKGxheWVyOiBQaGFzZXIuR3JvdXApIHtcbiAgICB2YXIgbGV2ZWxEYXRhID0gdGhpcy5nYW1lLmNhY2hlLmdldEpTT04oJ2xldmVsJyk7XG4gICAgdGhpcy5fZm9ybWF0aW9uTWFuYWdlci5pbml0KGxldmVsRGF0YS5mb3JtYXRpb25zLCBsYXllcik7XG4gIH1cblxuICBwcml2YXRlIF9oYW5kbGVJbnB1dCgpIHtcbiAgICBjb25zdCBkaXJlY3Rpb24gPSB7IHg6IDAsIHk6IDAgfTtcbiAgICBpZiAodGhpcy5fa2V5cy5sZWZ0LmlzRG93bikge1xuICAgICAgZGlyZWN0aW9uLnggPSAtMTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2tleXMucmlnaHQuaXNEb3duKSB7XG4gICAgICBkaXJlY3Rpb24ueCA9IDE7XG4gICAgfVxuICAgIGlmICh0aGlzLl9rZXlzLnVwLmlzRG93bikge1xuICAgICAgZGlyZWN0aW9uLnkgPSAtMTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2tleXMuZG93bi5pc0Rvd24pIHtcbiAgICAgIGRpcmVjdGlvbi55ID0gMTtcbiAgICB9XG4gICAgdGhpcy5fbmFyd2hhbC5tb3ZlKGRpcmVjdGlvbik7XG4gIH1cblxuICBwcml2YXRlIF9oYW5kbGVDb2xsaXNpb25zKCkge1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKFxuICAgICAgdGhpcy5fbmFyd2hhbCwgdGhpcy5fZm9ybWF0aW9uTWFuYWdlci5icmFpbnMsXG4gICAgICB0aGlzLl9vbk5hcndoYWxWc0JyYWluLFxuICAgICAgdW5kZWZpbmVkLCB0aGlzXG4gICAgKTtcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcChcbiAgICAgIHRoaXMuX25hcndoYWwsIHRoaXMuX2Zvcm1hdGlvbk1hbmFnZXIuYWxpZW5zLFxuICAgICAgdGhpcy5fb25OYXJ3aGFsVnNBbGllbixcbiAgICAgIHVuZGVmaW5lZCwgdGhpc1xuICAgICk7XG4gIH1cblxuICBwcml2YXRlIF9vbk5hcndoYWxWc0FsaWVuKG5hcndoYWw6IE5hcndoYWwsIGFsaWVuOiBBbGllbikge1xuICAgIG5hcndoYWwudGFrZURhbWFnZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfb25OYXJ3aGFsVnNCcmFpbihuYXJ3aGFsOiBOYXJ3aGFsLCBicmFpbjogQnJhaW4pIHtcbiAgICBuYXJ3aGFsLmF0dGFjayhicmFpbik7XG4gIH1cblxuICBwcml2YXRlIF9zcGF3bk5hcndoYWwobGF5ZXI6IFBoYXNlci5Hcm91cCkge1xuICAgIHRoaXMuX25hcndoYWwgPSBuZXcgTmFyd2hhbChcbiAgICAgIHRoaXMuZ2FtZSxcbiAgICAgIHRoaXMuZ2FtZS53b3JsZC5jZW50ZXJYLFxuICAgICAgdGhpcy5nYW1lLndvcmxkLmNlbnRlcllcbiAgICApO1xuICAgIGxheWVyLmFkZENoaWxkKHRoaXMuX25hcndoYWwpO1xuICAgIHRoaXMuX25hcndoYWwuZXZlbnRzLm9uT3V0T2ZCb3VuZHMuYWRkT25jZSgoKSA9PiB7XG4gICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQodGhpcy5nYW1lLnN0YXRlLmN1cnJlbnQpO1xuICAgIH0pO1xuICAgIHRoaXMuX25hcndoYWwub25EaWUuYWRkT25jZSgoKSA9PiB7XG4gICAgICB0aGlzLmdhbWUuY2FtZXJhLm9uRmFkZUNvbXBsZXRlLmFkZE9uY2UoKCkgPT4ge1xuICAgICAgICB0aGlzLmdhbWUuY2FtZXJhLnJlc2V0RlgoKTtcbiAgICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KHRoaXMuZ2FtZS5zdGF0ZS5jdXJyZW50KTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5nYW1lLmNhbWVyYS5mYWRlKDAsIDUwMDApO1xuICAgIH0sIHRoaXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlSHVkKCkge1xuICAgIGNvbnN0IHRleHQgPSBgeCR7cGFkKHRoaXMuX2Zvcm1hdGlvbk1hbmFnZXIuZW5lbXlLaWxsZWQpfWA7XG4gICAgdGhpcy5fc2NvcmUuc2V0VGV4dCh0ZXh0KTtcblxuICAgIGZ1bmN0aW9uIHBhZChuKSB7XG4gICAgICBjb25zdCBzdHIgPSBuICsgJyc7XG4gICAgICByZXR1cm4gJzAwMDAnLnNsaWNlKDAsIDQgLSBzdHIubGVuZ3RoKSArIHN0cjtcbiAgICB9XG4gIH1cbn07XG5cbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG4gIGNvbnN0IGxldmVsID0gbmV3IExldmVsKCk7XG4gIGNvbnN0IGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoMTAwMCwgMTA4MCwgUGhhc2VyLkFVVE8sICdjb250ZW50JywgbGV2ZWwpO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL34vc291cmNlLW1hcC1sb2FkZXIhLi9zcmMvdHMvc3BhY2UtbmFyd2hhbC50cyIsImltcG9ydCBFbmVteSBmcm9tICcuL0VuZW15JztcbmltcG9ydCBBbGllbiBmcm9tICcuL0FsaWVuJztcbmltcG9ydCBCcmFpbiBmcm9tICcuL0JyYWluJztcblxuZXhwb3J0IHtcbiAgRW5lbXksXG4gIEFsaWVuLFxuICBCcmFpblxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3RzL2VuZW1pZXMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDExXG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=