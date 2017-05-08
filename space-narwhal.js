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
/* 1 */
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
const utils_1 = __webpack_require__(1);
/** Movement speed for the hero narwhal. */
const SPEED = 800;
const SINKING_SPEED = 100;
const RECOVERING_TIME = 3000;
class Narwhal extends Phaser.Sprite {
    constructor(game, x, y) {
        super(game, x, y, 'char:1', 'idle/0001.png');
        this._attacking = false;
        this._lives = 3;
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
        this.onDropLife = new Phaser.Signal();
        this._frames = utils_1.genFrames('', '.png', 4);
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
    _can(action) {
        const transitions = this._animationMachine[this._state] || {};
        return action in transitions;
    }
    _canMove() {
        return this._state !== 'dying' && this._state !== 'dead';
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
    onenterdead() {
        this.body.collideWorldBounds = false;
        this.checkWorldBounds = true;
    }
    onenterdying() {
        this.body.velocity.setTo(0, 0);
        this.onDropLife.dispatch();
    }
    onenteraching() {
        this._lives--;
        this.onDropLife.dispatch();
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
const Enemy_1 = __webpack_require__(0);
class Alien extends Enemy_1.default {
    constructor(game) {
        super(game, 'alien');
    }
}
exports.default = Alien;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Enemy_1 = __webpack_require__(0);
class Brain extends Enemy_1.default {
    constructor(game) {
        super(game, 'brain');
        this.onBurst = new Phaser.Signal();
    }
    burst() {
        this.onBurst.dispatch(this);
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
const utils_1 = __webpack_require__(1);
const environments_1 = __webpack_require__(5);
class Level extends Phaser.State {
    init() {
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
        this.game.load.json('level', 'levels/L0101.json');
        this.game.load.webfont('score-font', 'Revalia');
        this.game.load.image('bg:background', 'assets/back-01.png');
        this.game.load.image('bg:fx:1', 'assets/back-fx-back.png');
        this.game.load.image('bg:fx:2', 'assets/back-fx-front.png');
        this.game.load.image('narwhal', 'assets/char-01.png');
        this.game.load.image('alien', 'assets/enemy-01.png');
        this.game.load.image('brain', 'assets/brain-01.png');
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
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Enemy__ = __webpack_require__(0);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgOTgyNmQ4YjY3NDEzOTI2YjBjNmIiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL2VuZW1pZXMvRW5lbXkudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL3V0aWxzL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy90cy9lbnZpcm9ubWVudHMvRW52aXJvbm1lbnQudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL0Zvcm1hdGlvbk1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL05hcndoYWwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL2Vudmlyb25tZW50cy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdHMvRm9ybWF0aW9uLnRzIiwid2VicGFjazovLy8uL3NyYy90cy9lbmVtaWVzL0FsaWVuLnRzIiwid2VicGFjazovLy8uL3NyYy90cy9lbmVtaWVzL0JyYWluLnRzIiwid2VicGFjazovLy8uL3NyYy90cy9lbnZpcm9ubWVudHMvT2NlYW4udHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL3NwYWNlLW5hcndoYWwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL2VuZW1pZXMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxtREFBMkMsY0FBYzs7QUFFekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7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LEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0MsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDcEQsTUFBTSxLQUFLLEdBQ1QsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQzlELE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekIsQ0FBQztRQUNELE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNoQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQztZQUMzQixNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDMUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRO1FBQ1IsTUFBTSxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxQyxNQUFNLGNBQWMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3RFLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUU7WUFDdkQsSUFBSSxFQUFFLFNBQVM7WUFDZixRQUFRLEVBQUUsTUFB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QyxDQUFDO0FBQzFFLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDMUtGO0FBQ0E7QUFDQTs7QUFNQSIsImZpbGUiOiJzcGFjZS1uYXJ3aGFsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gaWRlbnRpdHkgZnVuY3Rpb24gZm9yIGNhbGxpbmcgaGFybW9ueSBpbXBvcnRzIHdpdGggdGhlIGNvcnJlY3QgY29udGV4dFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5pID0gZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9O1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAxMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgOTgyNmQ4YjY3NDEzOTI2YjBjNmIiLCJpbXBvcnQgeyBSYWRpYWxGb3JtYXRpb24gfSBmcm9tICcuLi9Gb3JtYXRpb24nO1xuXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBFbmVteSBleHRlbmRzIFBoYXNlci5TcHJpdGUge1xuXG4gIGdldCBkaXN0YW5jZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzdGFuY2U7XG4gIH1cblxuICBnZXQgZm9ybWF0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9mb3JtYXRpb247XG4gIH1cblxuICBnZXQgcGxhY2VtZW50KCkge1xuICAgIHJldHVybiB0aGlzLl9wbGFjZW1lbnQ7XG4gIH07XG5cbiAgcHJpdmF0ZSBfZGlzdGFuY2U6IG51bWJlcnx1bmRlZmluZWQ7XG5cbiAgcHJpdmF0ZSBfZm9ybWF0aW9uOiBSYWRpYWxGb3JtYXRpb247XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfcGxhY2VtZW50OiBQaGFzZXIuUG9pbnQgPSBuZXcgUGhhc2VyLlBvaW50KCk7XG5cbiAgY29uc3RydWN0b3IoZ2FtZTogUGhhc2VyLkdhbWUsIGtleTogc3RyaW5nKSB7XG4gICAgc3VwZXIoZ2FtZSwgMCwgMCwga2V5KTtcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUpO1xuICB9XG5cbiAgcGxhY2UoZm9ybWF0aW9uOiBSYWRpYWxGb3JtYXRpb24sIHg6IG51bWJlciwgeTogbnVtYmVyKTogdGhpcyB7XG4gICAgc3VwZXIucmVzZXQoeCwgeSk7XG4gICAgdGhpcy51cGRhdGVUcmFuc2Zvcm0oKTtcbiAgICB0aGlzLl9mb3JtYXRpb24gPSBmb3JtYXRpb247XG4gICAgdGhpcy5fcGxhY2VtZW50LnNldFRvKHgsIHkpO1xuICAgIHRoaXMuX2Rpc3RhbmNlID0gdGhpcy5fcGxhY2VtZW50LmdldE1hZ25pdHVkZSgpO1xuICAgIHRoaXMuX3Jlc2V0RXZlbnRzKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwcml2YXRlIF9yZXNldEV2ZW50cygpIHtcbiAgICBmb3IgKGxldCBuYW1lIGluIHRoaXMuZXZlbnRzKSB7XG4gICAgICBjb25zdCBtZW1iZXIgPSB0aGlzLmV2ZW50c1tuYW1lXTtcbiAgICAgIGlmIChtZW1iZXIgaW5zdGFuY2VvZiBQaGFzZXIuU2lnbmFsKSB7XG4gICAgICAgIChtZW1iZXIgYXMgUGhhc2VyLlNpZ25hbCkucmVtb3ZlQWxsKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL34vc291cmNlLW1hcC1sb2FkZXIhLi9zcmMvdHMvZW5lbWllcy9FbmVteS50cyIsIlxudHlwZSBGcm9tVG8gPSBBcnJheTxbbnVtYmVyLG51bWJlcl18W251bWJlcl0+O1xudHlwZSBTaG9ydEdlbkZyYW1lcyA9IChuYW1lOiBzdHJpbmcsIC4uLnNlcTogRnJvbVRvKSA9PiBBcnJheTxzdHJpbmc+O1xuXG5mdW5jdGlvbiBnZW5GcmFtZXMocHJlZml4OiBzdHJpbmcsIHN1ZmZpeDogc3RyaW5nLCBkaWdpdHM6IG51bWJlcikgOiBTaG9ydEdlbkZyYW1lcyB7XG4gIHJldHVybiBmdW5jdGlvbihuYW1lLCAuLi5zZXEpIHtcbiAgICBjb25zdCBwYXRoID0gYCR7cHJlZml4ID8gcHJlZml4ICsgJy8nIDogJyd9JHtuYW1lfS9gO1xuICAgIGNvbnN0IG5hbWVzOiBBcnJheTxzdHJpbmc+ID0gW107XG4gICAgc2VxLmZvckVhY2gocGFpciA9PiB7XG4gICAgICBjb25zdCBmcm9tID0gcGFpclswXTtcbiAgICAgIGNvbnN0IHRvID0gcGFpci5sZW5ndGggPT09IDEgPyBmcm9tIDogcGFpclsxXTtcbiAgICAgIGNvbnN0IGZyYW1lcyA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFxuICAgICAgICBwYXRoLFxuICAgICAgICBmcm9tLCB0byxcbiAgICAgICAgc3VmZml4LCBkaWdpdHNcbiAgICAgICk7XG4gICAgICBuYW1lcy5wdXNoKC4uLmZyYW1lcyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIG5hbWVzO1xuICB9XG59XG5cbmNsYXNzIFNwYWNlTmFyd2hhbExvYWRlciBleHRlbmRzIFBoYXNlci5Mb2FkZXIge1xuXG4gIGNvbnN0cnVjdG9yKGdhbWU6IFBoYXNlci5HYW1lKSB7XG4gICAgc3VwZXIoZ2FtZSk7XG4gIH1cblxuICB3ZWJmb250KGtleTogc3RyaW5nLCBmb250TmFtZTogc3RyaW5nLCBvdmVyd3JpdGUgPSBmYWxzZSkgOiB0aGlzIHtcbiAgICB0aGlzLmFkZFRvRmlsZUxpc3QoJ3dlYmZvbnQnLCBrZXksIGZvbnROYW1lKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxvYWRGaWxlKGZpbGUpIHtcbiAgICBzdXBlci5sb2FkRmlsZShmaWxlKTtcbiAgICBpZiAoZmlsZS50eXBlID09PSAnd2ViZm9udCcpIHtcbiAgICAgIC8vIGZpbGUudXJsIGNvbnRhaW5zIHRoZSB3ZWIgZm9udFxuICAgICAgZG9jdW1lbnQuZm9udHMubG9hZChgMTBwdCBcIiR7ZmlsZS51cmx9XCJgKS50aGVuKFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFzeW5jQ29tcGxldGUoZmlsZSk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+ICB7XG4gICAgICAgICAgICB0aGlzLmFzeW5jQ29tcGxldGUoZmlsZSwgYEVycm9yIGxvYWRpbmcgZm9udCAke2ZpbGUudXJsfWApO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG59XG5cbmV4cG9ydCB7IGdlbkZyYW1lcywgU3BhY2VOYXJ3aGFsTG9hZGVyIH07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9+L3NvdXJjZS1tYXAtbG9hZGVyIS4vc3JjL3RzL3V0aWxzL2luZGV4LnRzIiwiXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbnZpcm9ubWVudCB7XG5cbiAgcHJvdGVjdGVkIF9nYW1lOiBQaGFzZXIuR2FtZTtcblxuICBwcm90ZWN0ZWQgX2xheWVyOiBQaGFzZXIuR3JvdXA7XG5cbiAgY29uc3RydWN0b3IoZ2FtZTogUGhhc2VyLkdhbWUpIHtcbiAgICB0aGlzLl9nYW1lID0gZ2FtZTtcbiAgfVxuXG4gIGluaXQob3B0aW9ucywgbGF5ZXI6IFBoYXNlci5Hcm91cCkge1xuICAgIHRoaXMuX2xheWVyID0gbGF5ZXI7XG4gICAgdGhpcy5fbGF5ZXIuY2xhc3NUeXBlID0gUGhhc2VyLkltYWdlO1xuICAgIHRoaXMuX2xheWVyLmNyZWF0ZSgwLCAwLCAnYmc6YmFja2dyb3VuZCcpO1xuICB9XG5cbiAgdXBkYXRlKCkgeyB9XG5cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL34vc291cmNlLW1hcC1sb2FkZXIhLi9zcmMvdHMvZW52aXJvbm1lbnRzL0Vudmlyb25tZW50LnRzIiwiaW1wb3J0IHsgRW5lbXksIEFsaWVuLCBCcmFpbiB9IGZyb20gJy4vZW5lbWllcyc7XG5pbXBvcnQgeyBQYXRoLCBQdWxzZSwgUmFkaWFsRm9ybWF0aW9uLCBEaWFtb25kLCBEZWx0YSB9IGZyb20gJy4vRm9ybWF0aW9uJztcblxudHlwZSBUeXBlT2Y8VD4gPSBuZXcgKC4uLl8pID0+IFQ7XG5cbmNvbnN0IEZPUk1BVElPTlM6IHsgW3M6IHN0cmluZ106IFR5cGVPZjxSYWRpYWxGb3JtYXRpb24+IH0gPSB7XG4gICdEaWFtb25kJzogRGlhbW9uZCxcbiAgJ0RlbHRhJzogRGVsdGFcbn07XG5cbnR5cGUgUHVsc2VTcGVjID0gUHVsc2U7XG5cbnR5cGUgUGF0aFNwZWMgPSBBcnJheTxbc3RyaW5nfG51bWJlciwgc3RyaW5nfG51bWJlcl0+O1xuXG50eXBlIEZvcm1hdGlvblNwZWMgPSB7XG4gIHNoYXBlOiBzdHJpbmcsXG4gIGJyYWluUG9zaXRpb25zOiBBcnJheTxudW1iZXI+LFxuICByb3RhdGU/OiBudW1iZXIsXG4gIHB1bHNlPzogUHVsc2VTcGVjLFxuICBmb2xsb3c/OiB7IHBhdGg6IFBhdGhTcGVjLCBkdXJhdGlvbjogbnVtYmVyIH0sXG4gIGRlbGF5PzogbnVtYmVyLFxuICBhdD86IG51bWJlcixcbiAgcmVwZWF0PzogbnVtYmVyIHwgc3RyaW5nLFxuICB3YWl0PzogbnVtYmVyXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGb3JtYXRpb25NYW5hZ2VyIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IF9nYW1lOiBQaGFzZXIuR2FtZTtcblxuICBwcml2YXRlIF9sYXllcjogUGhhc2VyLkdyb3VwO1xuXG4gIHByaXZhdGUgX3BoeXNpY3NUaW1lVG90YWw6IG51bWJlciA9IDA7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfc2NyZWVuOiB7IFtzOiBzdHJpbmddOiBudW1iZXIgfTtcblxuICBwcml2YXRlIHJlYWRvbmx5IF9lbmVtaWVzOiB7XG4gICAgYWxpZW46IEFycmF5PEFsaWVuPjtcbiAgICBicmFpbjogQXJyYXk8QnJhaW4+O1xuICB9ID0ge1xuICAgIGFsaWVuOiBbXSxcbiAgICBicmFpbjogW11cbiAgfTtcblxuICBwcml2YXRlIF9mb3JtYXRpb25zOiBBcnJheTxGb3JtYXRpb25TcGVjPjtcblxuICBwcml2YXRlIF90aW1lT3JpZ2luOiBudW1iZXIgPSAtSW5maW5pdHk7XG5cbiAgcHJpdmF0ZSBfZGVhZGxpbmU6IG51bWJlciA9IEluZmluaXR5O1xuXG4gIHByaXZhdGUgX2VuZW15S2lsbGVkOiBudW1iZXIgPSAwO1xuXG4gIGdldCBicmFpbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuZW1pZXMuYnJhaW4uZmlsdGVyKGJyYWluID0+IGJyYWluLmFsaXZlKTtcbiAgfVxuXG4gIGdldCBhbGllbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuZW1pZXMuYWxpZW4uZmlsdGVyKGFsaWVuID0+IGFsaWVuLmFsaXZlKTtcbiAgfVxuXG4gIGdldCBlbmVteUtpbGxlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5lbXlLaWxsZWQ7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihnYW1lOiBQaGFzZXIuR2FtZSkge1xuICAgIHRoaXMuX2dhbWUgPSBnYW1lO1xuICAgIC8vVE9ETzogSW5qZWN0IGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICBjb25zdCBzZW1pV2lkdGggPSB0aGlzLl9nYW1lLndpZHRoIC8gMjtcbiAgICBjb25zdCBzZW1pSGVpZ2h0ID0gdGhpcy5fZ2FtZS5oZWlnaHQgLyAyO1xuICAgIGNvbnN0IGNlbnRlclggPSB0aGlzLl9nYW1lLndvcmxkLmNlbnRlclg7XG4gICAgY29uc3QgY2VudGVyWSA9IHRoaXMuX2dhbWUud29ybGQuY2VudGVyWTtcbiAgICBjb25zdCB0b3AgPSBjZW50ZXJZIC0gc2VtaUhlaWdodDtcbiAgICBjb25zdCBib3R0b20gPSBjZW50ZXJZICsgc2VtaUhlaWdodDtcbiAgICBjb25zdCBsZWZ0ID0gY2VudGVyWCAtIHNlbWlXaWR0aDtcbiAgICBjb25zdCByaWdodCA9IGNlbnRlclggKyBzZW1pV2lkdGg7XG4gICAgdGhpcy5fc2NyZWVuID0ge1xuICAgICAgY2VudGVyWCwgY2VudGVyWSwgdG9wLCBib3R0b20sIGxlZnQsIHJpZ2h0LFxuICAgICAgZ2V0IHJhbmRvbVgoKSB7XG4gICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpICogKHRoaXMucmlnaHQgLSB0aGlzLmxlZnQpICsgdGhpcy5sZWZ0O1xuICAgICAgfSxcbiAgICAgIGdldCByYW5kb21ZKCkge1xuICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqICh0aGlzLmJvdHRvbSAtIHRoaXMudG9wKSArIHRoaXMudG9wO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBpbml0KGZvcm1hdGlvbnM6IEFycmF5PEZvcm1hdGlvblNwZWM+LCBsYXllcjogUGhhc2VyLkdyb3VwKSB7XG4gICAgdGhpcy5fZm9ybWF0aW9ucyA9IGZvcm1hdGlvbnM7XG4gICAgdGhpcy5fdGltZU9yaWdpbiA9IHRoaXMuX3BoeXNpY3NUaW1lVG90YWw7XG4gICAgdGhpcy5fbGF5ZXIgPSBsYXllcjtcbiAgICB0aGlzLl9hbGxvY2F0ZUFsaWVucyg1MDApO1xuICAgIHRoaXMuX2FsbG9jYXRlQnJhaW5zKDUwKTtcbiAgICB0aGlzLl91cGRhdGVEZWFkbGluZSgpO1xuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIHRoaXMuX3BoeXNpY3NUaW1lVG90YWwgKz0gdGhpcy5fZ2FtZS50aW1lLnBoeXNpY3NFbGFwc2VkO1xuICAgIHRoaXMuX3NwYXduRm9ybWF0aW9ucygpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlRGVhZGxpbmUoKSB7XG4gICAgaWYgKCF0aGlzLl9mb3JtYXRpb25zLmxlbmd0aCkge1xuICAgICAgdGhpcy5fZGVhZGxpbmUgPSBJbmZpbml0eTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBsZXQgeyBhdCwgZGVsYXkgfSA9IHRoaXMuX2Zvcm1hdGlvbnNbMF07XG4gICAgICBpZiAodHlwZW9mIGF0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBhdCA9IE1hdGgubWF4KDAsIGF0IHx8IDApO1xuICAgICAgICB0aGlzLl9kZWFkbGluZSA9IHRoaXMuX3RpbWVPcmlnaW4gKyBhdDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBkZWxheSA9IE1hdGgubWF4KDAsIGRlbGF5IHx8IDApO1xuICAgICAgICBpZiAoIWlzRmluaXRlKHRoaXMuX2RlYWRsaW5lKSkge1xuICAgICAgICAgIHRoaXMuX2RlYWRsaW5lID0gdGhpcy5fdGltZU9yaWdpbjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9kZWFkbGluZSArPSBkZWxheTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9zcGF3bkZvcm1hdGlvbnMoKSB7XG4gICAgY29uc3Qgbm93ID0gdGhpcy5fcGh5c2ljc1RpbWVUb3RhbDtcbiAgICBpZiAodGhpcy5fZm9ybWF0aW9ucy5sZW5ndGggJiYgbm93ID49IHRoaXMuX2RlYWRsaW5lKSB7XG4gICAgICBjb25zdCBmb3JtYXRpb25EYXRhID0gdGhpcy5fZm9ybWF0aW9ucy5zaGlmdCgpIGFzIEZvcm1hdGlvblNwZWM7XG4gICAgICBjb25zdCB7IHJlcGVhdCA9IDEsIHdhaXQgPSAwIH0gPSBmb3JtYXRpb25EYXRhO1xuICAgICAgaWYgKHJlcGVhdCA+IDEpIHtcbiAgICAgICAgZm9ybWF0aW9uRGF0YS5yZXBlYXQgPSB0b0ludChyZXBlYXQpIC0gMTtcbiAgICAgICAgZm9ybWF0aW9uRGF0YS5kZWxheSA9IHdhaXQ7XG4gICAgICAgIHRoaXMuX2Zvcm1hdGlvbnMudW5zaGlmdChmb3JtYXRpb25EYXRhKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGZvcm1hdGlvbiA9IHRoaXMuX3NwYXduRm9ybWF0aW9uKGZvcm1hdGlvbkRhdGEpO1xuICAgICAgdGhpcy5fYXBwbHlFZmZlY3RzKGZvcm1hdGlvbkRhdGEsIGZvcm1hdGlvbik7XG4gICAgICB0aGlzLl91cGRhdGVEZWFkbGluZSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvSW50KHY6bnVtYmVyfHN0cmluZykge1xuICAgICAgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gdjtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHYgPT09ICdJbmZpbml0eScpIHtcbiAgICAgICAgcmV0dXJuIEluZmluaXR5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBhcnNlSW50KHYsIDEwKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9zcGF3bkZvcm1hdGlvbihmb3JtYXRpb25EYXRhOiBGb3JtYXRpb25TcGVjKSA6IFJhZGlhbEZvcm1hdGlvbiB7XG4gICAgY29uc3QgeyBzaGFwZSwgYnJhaW5Qb3NpdGlvbnMgfSA9IGZvcm1hdGlvbkRhdGE7XG4gICAgY29uc3QgRm9ybWF0aW9uQ2xhc3MgPSBGT1JNQVRJT05TW3NoYXBlXTtcbiAgICBjb25zdCBmb3JtYXRpb24gPSBuZXcgRm9ybWF0aW9uQ2xhc3ModGhpcy5fZ2FtZSwgZm9ybWF0aW9uRGF0YSk7XG4gICAgZm9ybWF0aW9uLm9uRGVzdHJveWVkQnlDaGFyYWN0ZXIuYWRkT25jZShlbmVteUNvdW50ID0+IHtcbiAgICAgIHRoaXMuX2VuZW15S2lsbGVkICs9IGVuZW15Q291bnQ7XG4gICAgfSwgdGhpcyk7XG4gICAgY29uc3QgeyBsb2NhdGlvbnMgfSA9IGZvcm1hdGlvbjtcbiAgICBjb25zdCBicmFpbkNvdW50ID0gYnJhaW5Qb3NpdGlvbnMubGVuZ3RoO1xuICAgIGNvbnN0IGVuZW1pZXMgPSB0aGlzLl9nZXRBbGllbnMobG9jYXRpb25zLmxlbmd0aCAtIGJyYWluQ291bnQpO1xuICAgIGNvbnN0IGJyYWlucyA9IHRoaXMuX2dldEJyYWlucyhicmFpbkNvdW50KTtcblxuICAgIGZvcm1hdGlvbi5pbml0KGVuZW1pZXMsIGJyYWlucywgYnJhaW5Qb3NpdGlvbnMpO1xuICAgIHJldHVybiB0aGlzLl9sYXllci5hZGRDaGlsZChmb3JtYXRpb24pO1xuICB9XG5cbiAgcHJpdmF0ZSBfYWxsb2NhdGVBbGllbnMoY291bnQ6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLl9hbGxvY2F0ZUVuZW1pZXMoQWxpZW4sIGNvdW50KTtcbiAgfVxuXG4gIHByaXZhdGUgX2FsbG9jYXRlQnJhaW5zKGNvdW50OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5fYWxsb2NhdGVFbmVtaWVzKEJyYWluLCBjb3VudCk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRBbGllbnMoY291bnQ6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLl9nZXRFbmVtaWVzKEFsaWVuLCBjb3VudCk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRCcmFpbnMoY291bnQ6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLl9nZXRFbmVtaWVzKEJyYWluLCBjb3VudCk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRFbmVtaWVzPEUgZXh0ZW5kcyBFbmVteT4oa2xhc3M6IFR5cGVPZjxFPiwgY291bnQ6IG51bWJlcikge1xuICAgIGNvbnN0IGl0ZW1zOiBBcnJheTxFPiA9IFtdO1xuICAgIGNvbnN0IHR5cGUgPSBrbGFzcy5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLl9lbmVtaWVzW3R5cGVdLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgY29uc3QgZW5lbXkgPSB0aGlzLl9lbmVtaWVzW3R5cGVdW2ldO1xuICAgICAgaWYgKCFlbmVteS5hbGl2ZSkge1xuICAgICAgICBpdGVtcy5wdXNoKGVuZW15KTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtcy5sZW5ndGggPT09IGNvdW50KSB7XG4gICAgICAgIHJldHVybiBpdGVtcztcbiAgICAgIH1cbiAgICB9XG4gICAgaXRlbXMucHVzaCguLi50aGlzLl9hbGxvY2F0ZUVuZW1pZXMoa2xhc3MsIGNvdW50IC0gaXRlbXMubGVuZ3RoKSk7XG4gICAgcmV0dXJuIGl0ZW1zO1xuICB9XG5cbiAgcHJpdmF0ZSBfYWxsb2NhdGVFbmVtaWVzPEUgZXh0ZW5kcyBFbmVteT4oa2xhc3M6IFR5cGVPZjxFPiwgY291bnQ6IG51bWJlcikge1xuICAgIGNvbnN0IGl0ZW1zOiBBcnJheTxFPiA9IFtdO1xuICAgIGNvbnN0IHR5cGUgPSBrbGFzcy5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICBsZXQgZW5lbXkgPSBuZXcga2xhc3ModGhpcy5fZ2FtZSk7XG4gICAgICB0aGlzLl9lbmVtaWVzW3R5cGVdLnB1c2goZW5lbXkpO1xuICAgICAgaXRlbXMucHVzaChlbmVteSk7XG4gICAgICBlbmVteS5raWxsKCk7XG4gICAgfVxuICAgIHJldHVybiBpdGVtcztcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5RWZmZWN0cyhmb3JtYXRpb25EYXRhOiBGb3JtYXRpb25TcGVjLCBmb3JtYXRpb246IFJhZGlhbEZvcm1hdGlvbikge1xuICAgIGNvbnN0IHsgcHVsc2UsIHJvdGF0ZSwgZm9sbG93IH0gPSBmb3JtYXRpb25EYXRhO1xuICAgIGlmIChwdWxzZSkge1xuICAgICAgZm9ybWF0aW9uLmVuYWJsZVB1bHNlKHB1bHNlLmFtcGxpdHVkZSwgcHVsc2UuZnJlcXVlbmN5KTtcbiAgICB9XG4gICAgaWYgKHJvdGF0ZSkge1xuICAgICAgZm9ybWF0aW9uLmVuYWJsZVJvdGF0aW9uKHJvdGF0ZSk7XG4gICAgfVxuICAgIGlmIChmb2xsb3cpIHtcbiAgICAgIGNvbnN0IHsgcGF0aCwgZHVyYXRpb24gfSA9IGZvbGxvdztcbiAgICAgIGZvcm1hdGlvbi5lbmFibGVNb3ZlbWVudChcbiAgICAgICAgcGF0aC5tYXAodG9Qb2ludCwgdGhpcyksXG4gICAgICAgIGR1cmF0aW9uXG4gICAgICApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvUG9pbnQoW2t4LCBreV06IFtudW1iZXIgfCBzdHJpbmcsIG51bWJlciB8IHN0cmluZ10pIHtcbiAgICAgIGNvbnN0IHsgW2t4XTogeCA9IGt4LCBba3ldOiB5ID0ga3kgfSA9IHRoaXMuX3NjcmVlbjtcbiAgICAgIHJldHVybiBuZXcgUGhhc2VyLlBvaW50KDxudW1iZXI+eCwgPG51bWJlcj55KTtcbiAgICB9XG4gIH1cblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL34vc291cmNlLW1hcC1sb2FkZXIhLi9zcmMvdHMvRm9ybWF0aW9uTWFuYWdlci50cyIsImltcG9ydCB7IGdlbkZyYW1lcyB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgQnJhaW4gfSBmcm9tICcuL2VuZW1pZXMnO1xuXG4vKiogTW92ZW1lbnQgc3BlZWQgZm9yIHRoZSBoZXJvIG5hcndoYWwuICovXG5jb25zdCBTUEVFRCA9IDgwMDtcblxuY29uc3QgU0lOS0lOR19TUEVFRCA9IDEwMDtcblxuY29uc3QgUkVDT1ZFUklOR19USU1FID0gMzAwMDtcblxudHlwZSBOYXJ3aGFsU3RhdGUgPVxuICAnaWRsZScgfFxuICAnYXR0YWNraW5nJyB8XG4gICd0YWtpbmdEYW1hZ2UnIHxcbiAgJ2FjaGluZycgfFxuICAncmVjb3ZlcmluZycgfFxuICAnZHlpbmcnIHxcbiAgJ2RlYWQnIHxcbiAgJ2JhY2soKSc7XG5cbnR5cGUgTmFyd2hhbEFjdGlvbiA9XG4gICdhdHRhY2snIHxcbiAgJ2FuaW1hdGlvbjphdHRhY2tpbmc6ZW5kJyB8XG4gICd0YWtlRGFtYWdlJyB8XG4gICdkaWUnIHxcbiAgJ2Ryb3BMaWZlJyB8XG4gICdhbmltYXRpb246YWNoaW5nOmVuZCcgfFxuICAnZGllJyB8XG4gICdhbmltYXRpb246ZHlpbmc6ZW5kJyB8XG4gICdyZWFkeSc7XG5cbnR5cGUgTmFyd2hhbE1hY2hpbmUgPSB7XG4gIFtzdGF0ZSBpbiBOYXJ3aGFsU3RhdGVdPzogeyBbYWN0aW9uIGluIE5hcndoYWxBY3Rpb25dPzogTmFyd2hhbFN0YXRlIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5hcndoYWwgZXh0ZW5kcyBQaGFzZXIuU3ByaXRlIHtcblxuICBwcml2YXRlIF9hdHRhY2tpbmc6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBwcml2YXRlIF9mb3JtZXJTdGF0ZTogTmFyd2hhbFN0YXRlIHwgdW5kZWZpbmVkO1xuXG4gIHByaXZhdGUgX2ZyYW1lcztcblxuICBwcml2YXRlIF9saXZlczogbnVtYmVyID0gMztcblxuICBwcml2YXRlIF9zdGF0ZTogTmFyd2hhbFN0YXRlID0gJ2lkbGUnO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2FuaW1hdGlvbk1hY2hpbmU6IE5hcndoYWxNYWNoaW5lID0ge1xuICAgICdpZGxlJzoge1xuICAgICAgJ2F0dGFjayc6ICdhdHRhY2tpbmcnLFxuICAgICAgJ3Rha2VEYW1hZ2UnOiAndGFraW5nRGFtYWdlJ1xuICAgIH0sXG4gICAgJ2F0dGFja2luZyc6IHtcbiAgICAgICdhbmltYXRpb246YXR0YWNraW5nOmVuZCc6ICdiYWNrKCknXG4gICAgfSxcbiAgICAndGFraW5nRGFtYWdlJzoge1xuICAgICAgJ2RpZSc6ICdkeWluZycsXG4gICAgICAnZHJvcExpZmUnOiAnYWNoaW5nJ1xuICAgIH0sXG4gICAgJ2FjaGluZyc6IHtcbiAgICAgICdhbmltYXRpb246YWNoaW5nOmVuZCc6ICdyZWNvdmVyaW5nJ1xuICAgIH0sXG4gICAgJ3JlY292ZXJpbmcnOiAge1xuICAgICAgJ2F0dGFjayc6ICdhdHRhY2tpbmcnLFxuICAgICAgJ3JlYWR5JzogJ2lkbGUnXG4gICAgfSxcbiAgICAnZHlpbmcnOiB7XG4gICAgICAnYW5pbWF0aW9uOmR5aW5nOmVuZCc6ICdkZWFkJ1xuICAgIH1cbiAgfTtcblxuICBnZXQgbGl2ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xpdmVzO1xuICB9XG5cbiAgb25Ecm9wTGlmZSA9IG5ldyBQaGFzZXIuU2lnbmFsKCk7XG5cbiAgY29uc3RydWN0b3IoZ2FtZSwgeCwgeSkge1xuICAgIHN1cGVyKGdhbWUsIHgsIHksICdjaGFyOjEnLCAnaWRsZS8wMDAxLnBuZycpO1xuICAgIHRoaXMuX2ZyYW1lcyA9IGdlbkZyYW1lcygnJywgJy5wbmcnLCA0KTtcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUpO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmVuYWJsZSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcbiAgICB0aGlzLl9zZXR1cEFuaW1hdGlvbnMoKTtcbiAgfVxuXG4gIGF0dGFjayhicmFpbjogQnJhaW4pIHtcbiAgICB0aGlzLl90cmFuc2l0aW9uKCdhdHRhY2snLCBicmFpbik7XG4gIH1cblxuICB0YWtlRGFtYWdlKCkge1xuICAgIHRoaXMuX3RyYW5zaXRpb24oJ3Rha2VEYW1hZ2UnKTtcbiAgfVxuXG4gIG1vdmUoZGlyZWN0aW9uKSB7XG4gICAgaWYgKHRoaXMuX2Nhbk1vdmUoKSkge1xuICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSBkaXJlY3Rpb24ueCAqIFNQRUVEO1xuICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnkgPSBkaXJlY3Rpb24ueSAqIFNQRUVEO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICB0aGlzLmFuaW1hdGlvbnMucGxheSh0aGlzLl9nZXRBbmltYXRpb24oKSk7XG4gICAgaWYgKHRoaXMuX3N0YXRlID09PSAnZGVhZCcpIHtcbiAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS5zZXRUbygwLCBTSU5LSU5HX1NQRUVEKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jYW4oYWN0aW9uOiBOYXJ3aGFsQWN0aW9uKSB7XG4gICAgY29uc3QgdHJhbnNpdGlvbnMgPSB0aGlzLl9hbmltYXRpb25NYWNoaW5lW3RoaXMuX3N0YXRlXSB8fCB7fTtcbiAgICByZXR1cm4gYWN0aW9uIGluIHRyYW5zaXRpb25zO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2FuTW92ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fc3RhdGUgIT09ICdkeWluZycgJiYgdGhpcy5fc3RhdGUgIT09ICdkZWFkJztcbiAgfVxuXG4gIHByaXZhdGUgX2dldEFuaW1hdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fc3RhdGU7XG4gIH1cblxuICBwcml2YXRlIF9vbkNvbXBsZXRlQW5pbWF0aW9uKF8sIGFuaW1hdGlvbjogUGhhc2VyLkFuaW1hdGlvbikge1xuICAgIHRoaXMuX3RyYW5zaXRpb24oYGFuaW1hdGlvbjoke2FuaW1hdGlvbi5uYW1lfTplbmRgIGFzIE5hcndoYWxBY3Rpb24pO1xuICB9XG5cbiAgcHJpdmF0ZSBvbmVudGVyYXR0YWNraW5nKGJyYWluKSB7XG4gICAgYnJhaW4uYnVyc3QoKTtcbiAgfVxuXG4gIHByaXZhdGUgb25lbnRlcmRlYWQoKSB7XG4gICAgdGhpcy5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IGZhbHNlO1xuICAgIHRoaXMuY2hlY2tXb3JsZEJvdW5kcyA9IHRydWU7XG4gIH1cblxuICBwcml2YXRlIG9uZW50ZXJkeWluZygpIHtcbiAgICB0aGlzLmJvZHkudmVsb2NpdHkuc2V0VG8oMCwgMCk7XG4gICAgdGhpcy5vbkRyb3BMaWZlLmRpc3BhdGNoKCk7XG4gIH1cblxuICBwcml2YXRlIG9uZW50ZXJhY2hpbmcoKSB7XG4gICAgdGhpcy5fbGl2ZXMtLTtcbiAgICB0aGlzLm9uRHJvcExpZmUuZGlzcGF0Y2goKTtcbiAgfVxuXG4gIHByaXZhdGUgb25lbnRlcnJlY292ZXJpbmcoKSB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLl90cmFuc2l0aW9uKCdyZWFkeScpLCBSRUNPVkVSSU5HX1RJTUUpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbmVudGVydGFraW5nRGFtYWdlKCkge1xuICAgIHRoaXMuX3RyYW5zaXRpb24odGhpcy5fbGl2ZXMgPT09IDEgPyAnZGllJyA6ICdkcm9wTGlmZScpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdHJhbnNpdGlvbihhY3Rpb246IE5hcndoYWxBY3Rpb24sIC4uLmFyZ3MpIHtcbiAgICBjb25zdCB0cmFuc2l0aW9ucyA9IHRoaXMuX2FuaW1hdGlvbk1hY2hpbmVbdGhpcy5fc3RhdGVdO1xuICAgIGlmICh0cmFuc2l0aW9ucykge1xuICAgICAgaWYgKGFjdGlvbiBpbiB0cmFuc2l0aW9ucykge1xuICAgICAgICBjb25zdCBuZXdTdGF0ZSA9XG4gICAgICAgICAgKHRyYW5zaXRpb25zW2FjdGlvbl0gPT09ICdiYWNrKCknID9cbiAgICAgICAgICAgdGhpcy5fZm9ybWVyU3RhdGUgOiB0cmFuc2l0aW9uc1thY3Rpb25dKSBhcyBOYXJ3aGFsU3RhdGU7XG4gICAgICAgIGlmICh0aGlzLl9zdGF0ZSAhPT0gbmV3U3RhdGUpIHtcbiAgICAgICAgICB0aGlzLl9mb3JtZXJTdGF0ZSA9IHRoaXMuX3N0YXRlO1xuICAgICAgICAgIHRoaXMuX3N0YXRlID0gbmV3U3RhdGU7XG4gICAgICAgICAgY29uc3QgZW50ZXJOYW1lID0gYG9uZW50ZXIke25ld1N0YXRlfWA7XG4gICAgICAgICAgdGhpc1tlbnRlck5hbWVdICYmIHRoaXNbZW50ZXJOYW1lXSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3NldHVwQW5pbWF0aW9ucygpIHtcbiAgICB0aGlzLmFuaW1hdGlvbnMuYWRkKFxuICAgICAgJ2lkbGUnLFxuICAgICAgdGhpcy5fZnJhbWVzKCdpZGxlJywgWzEsIDVdLCBbNCwgMl0pLCAxMCxcbiAgICAgIHRydWUsIGZhbHNlXG4gICAgKS5vbkNvbXBsZXRlLmFkZCh0aGlzLl9vbkNvbXBsZXRlQW5pbWF0aW9uLCB0aGlzKTtcblxuICAgIHRoaXMuYW5pbWF0aW9ucy5hZGQoXG4gICAgICAnYXR0YWNraW5nJyxcbiAgICAgIHRoaXMuX2ZyYW1lcygnYXR0YWNrJywgWzEsIDZdLCBbNl0sIFs2XSwgWzZdKSwgMjVcbiAgICApLm9uQ29tcGxldGUuYWRkKHRoaXMuX29uQ29tcGxldGVBbmltYXRpb24sIHRoaXMpO1xuXG4gICAgdGhpcy5hbmltYXRpb25zLmFkZChcbiAgICAgICdkeWluZycsXG4gICAgICB0aGlzLl9mcmFtZXMoJ2RlYXRoJywgWzEsIDldKSwgMTBcbiAgICApLm9uQ29tcGxldGUuYWRkKHRoaXMuX29uQ29tcGxldGVBbmltYXRpb24sIHRoaXMpO1xuXG4gICAgdGhpcy5hbmltYXRpb25zLmFkZChcbiAgICAgICdyZWNvdmVyaW5nJyxcbiAgICAgIHRoaXMuX2ZyYW1lcygncmVjb3ZlcmluZycsIFsxLCAzXSksIDEwXG4gICAgKS5vbkNvbXBsZXRlLmFkZCh0aGlzLl9vbkNvbXBsZXRlQW5pbWF0aW9uLCB0aGlzKTtcblxuICAgIHRoaXMuYW5pbWF0aW9ucy5hZGQoXG4gICAgICAnYWNoaW5nJyxcbiAgICAgIHRoaXMuX2ZyYW1lcygnZGFtYWdlJywgWzEsIDNdLCBbMywgMV0pLCAxMFxuICAgICkub25Db21wbGV0ZS5hZGQodGhpcy5fb25Db21wbGV0ZUFuaW1hdGlvbiwgdGhpcyk7XG5cbiAgICB0aGlzLmFuaW1hdGlvbnMuYWRkKFxuICAgICAgJ2RlYWQnLFxuICAgICAgdGhpcy5fZnJhbWVzKCdkZWF0aCcsIFs5XSksIDFcbiAgICApLm9uQ29tcGxldGUuYWRkKHRoaXMuX29uQ29tcGxldGVBbmltYXRpb24sIHRoaXMpO1xuICB9XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9+L3NvdXJjZS1tYXAtbG9hZGVyIS4vc3JjL3RzL05hcndoYWwudHMiLCJpbXBvcnQgRW52aXJvbm1lbnQgZnJvbSAnLi9FbnZpcm9ubWVudCc7XG5pbXBvcnQgT2NlYW4gZnJvbSAnLi9PY2Vhbic7XG5cbmV4cG9ydCB7IEVudmlyb25tZW50LCBPY2VhbiB9O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdHMvZW52aXJvbm1lbnRzL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IEVuZW15LCBBbGllbiwgQnJhaW4gfSBmcm9tICcuL2VuZW1pZXMnO1xuXG5jb25zdCBERUdfOTAgPSBNYXRoLlBJIC8gMjtcbmNvbnN0IERFR18xODAgPSBNYXRoLlBJO1xuY29uc3QgREVHXzM2MCA9IDIgKiBNYXRoLlBJO1xuXG50eXBlIFB1bHNlID0geyBhbXBsaXR1ZGU6IG51bWJlciwgZnJlcXVlbmN5OiBudW1iZXIgfTtcblxudHlwZSBQYXRoID0ge1xuICB4OiBBcnJheTxudW1iZXI+LCB5OiBBcnJheTxudW1iZXI+LFxuICBzdGFydFRpbWU6IG51bWJlciwgZHVyYXRpb246IG51bWJlclxufTtcblxuYWJzdHJhY3QgY2xhc3MgUmFkaWFsRm9ybWF0aW9uIGV4dGVuZHMgUGhhc2VyLkdyb3VwIHtcblxuICBhYnN0cmFjdCBsb2NhdGlvbnM6IEFycmF5PFBoYXNlci5Qb2ludD47XG5cbiAgcGF1c2VkOiBib29sZWFuO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2JyYWluczogQXJyYXk8QnJhaW4+ID0gW107XG5cbiAgcHJpdmF0ZSBfcm90YXRpb246IG51bWJlciA9IDA7XG5cbiAgcHJpdmF0ZSBfcGF0aDogUGF0aCA9IHtcbiAgICB4OiBbXSwgeTogW10sXG4gICAgc3RhcnRUaW1lOiAtSW5maW5pdHksIGR1cmF0aW9uOiBJbmZpbml0eVxuICB9O1xuXG4gIHByaXZhdGUgX3BoeXNpY3NUaW1lVG90YWw6IG51bWJlciA9IDA7XG5cbiAgcHJpdmF0ZSBfcHVsc2U6IFB1bHNlID0geyBhbXBsaXR1ZGU6IDAsIGZyZXF1ZW5jeTogMCB9O1xuXG4gIG9uRGVzdHJveWVkQnlDaGFyYWN0ZXIgPSBuZXcgUGhhc2VyLlNpZ25hbCgpO1xuXG4gIGNvbnN0cnVjdG9yKGdhbWU6IFBoYXNlci5HYW1lKSB7XG4gICAgc3VwZXIoZ2FtZSk7XG4gIH1cblxuICBpbml0KGFsaWVuczogQXJyYXk8QWxpZW4+LCBicmFpbnM6IEFycmF5PEJyYWluPiwgYnJhaW5Qb3NpdGlvbnM6IEFycmF5PG51bWJlcj4pIHtcbiAgICBhbGllbnMuZm9yRWFjaChhbGllbiA9PiB0aGlzLmdhbWUucGh5c2ljcy5lbmFibGUoYWxpZW4pKTtcbiAgICBicmFpbnMuZm9yRWFjaChicmFpbiA9PiB7XG4gICAgICBicmFpbi5vbkJ1cnN0LmFkZE9uY2UodGhpcy5fdHJ5VG9EZXN0cm95LCB0aGlzKTtcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmVuYWJsZShicmFpbik7XG4gICAgICB0aGlzLl9icmFpbnMucHVzaChicmFpbik7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9wbGFjZShhbGllbnMsIGJyYWlucywgYnJhaW5Qb3NpdGlvbnMpO1xuICB9XG5cbiAgZW5hYmxlUm90YXRpb24oc3BlZWQpIHtcbiAgICB0aGlzLl9yb3RhdGlvbiA9IHNwZWVkO1xuICB9XG5cbiAgZGlzYWJsZVJvdGF0aW9uKCkge1xuICAgIHRoaXMuZW5hYmxlUm90YXRpb24oMCk7XG4gIH1cblxuICBlbmFibGVQdWxzZShhbXBsaXR1ZGUsIHNwZWVkKSB7XG4gICAgdGhpcy5fcHVsc2UuYW1wbGl0dWRlID0gYW1wbGl0dWRlO1xuICAgIHRoaXMuX3B1bHNlLmZyZXF1ZW5jeSA9IHNwZWVkO1xuICB9XG5cbiAgZGlzYWJsZVB1bHNlKCkge1xuICAgIHRoaXMuZW5hYmxlUHVsc2UoMCwgMCk7XG4gIH1cblxuICBlbmFibGVNb3ZlbWVudChwYXRoOiBBcnJheTxQSVhJLlBvaW50PiwgdGltZSkge1xuICAgIHRoaXMuX3BhdGgueCA9IHBhdGgubWFwKHBvaW50ID0+IHBvaW50LngpO1xuICAgIHRoaXMuX3BhdGgueSA9IHBhdGgubWFwKHBvaW50ID0+IHBvaW50LnkpO1xuICAgIHRoaXMuX3BhdGguc3RhcnRUaW1lID0gdGhpcy5fcGh5c2ljc1RpbWVUb3RhbDtcbiAgICB0aGlzLl9wYXRoLmR1cmF0aW9uID0gdGltZTtcbiAgfVxuXG4gIGRpc2FibGVkTW92ZW1lbnQoKSB7XG4gICAgdGhpcy5lbmFibGVNb3ZlbWVudChbXSwgMCk7XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgaWYgKCF0aGlzLnBhdXNlZCkge1xuICAgICAgY29uc3QgZHQgPSB0aGlzLmdhbWUudGltZS5waHlzaWNzRWxhcHNlZDtcbiAgICAgIGNvbnN0IHQgPSB0aGlzLl9waHlzaWNzVGltZVRvdGFsICs9IGR0O1xuICAgICAgdGhpcy5fcm90YXRlKHQsIGR0KTtcbiAgICAgIHRoaXMuX3B1bHNhdGUodCwgZHQpO1xuICAgICAgdGhpcy5fbW92ZSh0LCBkdCk7XG4gICAgICB0aGlzLl9jaGVja091dE9mU2NyZWVuKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY2hlY2tPdXRPZlNjcmVlbigpIHtcbiAgICBjb25zdCB7IHgsIHksIHdpZHRoLCBoZWlnaHQgfSA9IHRoaXMuZ2V0Qm91bmRzKCk7XG4gICAgY29uc3QgZm9ybWF0aW9uQm91bmRzID0gbmV3IFBoYXNlci5SZWN0YW5nbGUoeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gICAgY29uc3QgY2FtZXJhVmlldyA9IHRoaXMuZ2FtZS5jYW1lcmEudmlldztcbiAgICBjb25zdCBpc091dHNpZGUgPVxuICAgICAgIVBoYXNlci5SZWN0YW5nbGUuaW50ZXJzZWN0cyhmb3JtYXRpb25Cb3VuZHMsIGNhbWVyYVZpZXcpO1xuICAgIGlmIChpc091dHNpZGUpIHtcbiAgICAgIHRoaXMuX2Rlc3Ryb3lJbW1lZGlhdGVseSgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2Rlc3Ryb3lBbmltYXRlZCgpIHtcbiAgICB0aGlzLl9kZXN0cm95U2hhcGUoKS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMub25EZXN0cm95ZWRCeUNoYXJhY3Rlci5kaXNwYXRjaCh0aGlzLmxvY2F0aW9ucy5sZW5ndGgpO1xuICAgICAgdGhpcy5kZXN0cm95KGZhbHNlKVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZGVzdHJveUltbWVkaWF0ZWx5KCkge1xuICAgIHRoaXMuY2FsbEFsbCgna2lsbCcsIG51bGwpO1xuICAgIHRoaXMuZGVzdHJveShmYWxzZSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX2Rlc3Ryb3lTaGFwZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oZnVsZmlsID0+IHtcbiAgICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBjb25zdCBlbmVteSA9IHRoaXMuY2hpbGRyZW5baW5kZXhdIGFzIEVuZW15O1xuICAgICAgICAgIGlmIChlbmVteSkge1xuICAgICAgICAgICAgZW5lbXkua2lsbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaW5kZXggPT09IGxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGZ1bGZpbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgaW5kZXggKiA1MCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9tb3ZlKHQ6IG51bWJlciwgZHQ6IG51bWJlcikge1xuICAgIGNvbnN0IHBlcmNlbnRhZ2UgPSAodCAtIHRoaXMuX3BhdGguc3RhcnRUaW1lKSAvIHRoaXMuX3BhdGguZHVyYXRpb247XG4gICAgdGhpcy54ID0gdGhpcy5nYW1lLm1hdGguYmV6aWVySW50ZXJwb2xhdGlvbih0aGlzLl9wYXRoLngsIHBlcmNlbnRhZ2UpO1xuICAgIHRoaXMueSA9IHRoaXMuZ2FtZS5tYXRoLmJlemllckludGVycG9sYXRpb24odGhpcy5fcGF0aC55LCBwZXJjZW50YWdlKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BsYWNlKGFsaWVuczogQXJyYXk8QWxpZW4+LCBicmFpbnM6IEFycmF5PEJyYWluPiwgYnJhaW5Qb3NpdGlvbnM6IEFycmF5PG51bWJlcj4pIHtcbiAgICB0aGlzLmxvY2F0aW9ucy5mb3JFYWNoKCh7IHgsIHkgfSwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IGlzQnJhaW5QbGFjZSA9IGJyYWluUG9zaXRpb25zLmluZGV4T2YoaW5kZXgpID49IDA7XG4gICAgICBjb25zdCBlbmVteSA9IGlzQnJhaW5QbGFjZSA/IGJyYWlucy5wb3AoKSA6IGFsaWVucy5wb3AoKTtcbiAgICAgIGlmIChlbmVteSkge1xuICAgICAgICBlbmVteS5wbGFjZSh0aGlzLCB4LCB5KTtcbiAgICAgICAgZW5lbXkucm90YXRpb24gPSBNYXRoLmF0YW4oeSAvIHgpICsgREVHXzkwICsgKHggPCAwID8gREVHXzE4MCA6IDApO1xuICAgICAgICB0aGlzLmFkZENoaWxkKGVuZW15KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX3B1bHNhdGUodDogbnVtYmVyLCBkdDogbnVtYmVyKSB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuIGFzIEFycmF5PEVuZW15PjtcbiAgICBjb25zdCB7IGFtcGxpdHVkZSwgZnJlcXVlbmN5IH0gPSB0aGlzLl9wdWxzZTtcbiAgICBjaGlsZHJlbi5mb3JFYWNoKGVuZW15ID0+IHtcbiAgICAgIGNvbnN0IHsgcm90YXRpb24sIGRpc3RhbmNlIH0gPSBlbmVteTtcbiAgICAgIGlmIChkaXN0YW5jZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0VuZW15IGlzIG5vdCBjb3JyZWN0bHkgcGxhY2VkIGluIHRoZSBmb3JtYXRpb24uJyk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gZGlzdGFuY2UgKyBhbXBsaXR1ZGU7XG4gICAgICAgIGNvbnN0IGRpc3BsYWNlbWVudCA9XG4gICAgICAgICAgYW1wbGl0dWRlICogTWF0aC5zaW4oREVHXzM2MCAqIGZyZXF1ZW5jeSAqIHQpICsgb2Zmc2V0O1xuICAgICAgICBlbmVteS54ID0gZGlzcGxhY2VtZW50ICogTWF0aC5jb3Mocm90YXRpb24gLSBERUdfOTApO1xuICAgICAgICBlbmVteS55ID0gZGlzcGxhY2VtZW50ICogTWF0aC5zaW4ocm90YXRpb24gLSBERUdfOTApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfcm90YXRlKHQ6IG51bWJlciwgZHQ6IG51bWJlcikge1xuICAgIHRoaXMucm90YXRpb24gKz0gdGhpcy5fcm90YXRpb24gKiBkdDtcbiAgfVxuXG4gIHByaXZhdGUgX3RyeVRvRGVzdHJveShicmFpbjogQnJhaW4pIHtcbiAgICB0aGlzLnBhdXNlZCA9IHRydWU7XG4gICAgdGhpcy5fYnJhaW5zLnNwbGljZSh0aGlzLl9icmFpbnMuaW5kZXhPZihicmFpbiksIDEpWzBdLmtpbGwoKTtcbiAgICBpZiAodGhpcy5fYnJhaW5zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5fZGVzdHJveUFuaW1hdGVkKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cbn1cblxudHlwZSBEaWFtb25QYXJhbWV0ZXJzID0geyByYWRpdXM6IG51bWJlciB9O1xuY2xhc3MgRGlhbW9uZCBleHRlbmRzIFJhZGlhbEZvcm1hdGlvbiB7XG5cbiAgcHJpdmF0ZSBzdGF0aWMgZGVmYXVsdHM6IERpYW1vblBhcmFtZXRlcnMgPSB7IHJhZGl1czogMTAwIH07XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfcmFkaXVzOiBudW1iZXI7XG5cbiAgcHJpdmF0ZSBfbG9jYXRpb25zO1xuXG4gIGdldCBsb2NhdGlvbnMoKSB7XG4gICAgaWYgKCF0aGlzLl9sb2NhdGlvbnMpIHtcbiAgICAgIGNvbnN0IHJhZGl1cyA9IHRoaXMuX3JhZGl1cztcbiAgICAgIHRoaXMuX2xvY2F0aW9ucyA9IFtcbiAgICAgICAgbmV3IFBoYXNlci5Qb2ludCgwLCByYWRpdXMpLFxuICAgICAgICBuZXcgUGhhc2VyLlBvaW50KHJhZGl1cyAvIDIsIHJhZGl1cyAvIDIpLFxuICAgICAgICBuZXcgUGhhc2VyLlBvaW50KHJhZGl1cywgMCksXG4gICAgICAgIG5ldyBQaGFzZXIuUG9pbnQocmFkaXVzIC8gMiwgLXJhZGl1cyAvIDIpLFxuICAgICAgICBuZXcgUGhhc2VyLlBvaW50KDAsIC1yYWRpdXMpLFxuICAgICAgICBuZXcgUGhhc2VyLlBvaW50KC1yYWRpdXMgLyAyLCAtcmFkaXVzIC8gMiksXG4gICAgICAgIG5ldyBQaGFzZXIuUG9pbnQoLXJhZGl1cywgMCksXG4gICAgICAgIG5ldyBQaGFzZXIuUG9pbnQoLXJhZGl1cyAvIDIsIHJhZGl1cyAvIDIpXG4gICAgICBdO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fbG9jYXRpb25zO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZ2FtZTogUGhhc2VyLkdhbWUsIHsgcmFkaXVzIH0gPSBEaWFtb25kLmRlZmF1bHRzKSB7XG4gICAgc3VwZXIoZ2FtZSk7XG4gICAgdGhpcy5fcmFkaXVzID0gcmFkaXVzO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9idWlsZFNoYXBlKCkge1xuICAgIHJldHVybiB0aGlzLmxvY2F0aW9ucy5tYXAocG9pbnQgPT4ge1xuICAgICAgY29uc3QgY29udGFpbmVyID0gbmV3IFBoYXNlci5Hcm91cCh0aGlzLmdhbWUpO1xuICAgICAgY29udGFpbmVyLnBvc2l0aW9uID0gcG9pbnQ7XG4gICAgICBjb250YWluZXIucm90YXRpb24gPSBNYXRoLmF0YW4ocG9pbnQueSAvIHBvaW50LngpICtcbiAgICAgICAgREVHXzkwICsgKHBvaW50LnggPCAwID8gREVHXzE4MCA6IDApO1xuICAgICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgICB9KTtcbiAgfVxuXG59XG5cbmNsYXNzIERlbHRhIGV4dGVuZHMgUmFkaWFsRm9ybWF0aW9uIHtcblxuICBwcml2YXRlIF9sb2NhdGlvbnM7XG5cbiAgZ2V0IGxvY2F0aW9ucygpOiBBcnJheTxQaGFzZXIuUG9pbnQ+IHtcbiAgICBpZiAoIXRoaXMuX2xvY2F0aW9ucykge1xuICAgICAgY29uc3QgcmFkaXVzID0gdGhpcy5fcmFkaXVzO1xuICAgICAgdGhpcy5fbG9jYXRpb25zID0gW1xuICAgICAgICBuZXcgUGhhc2VyLlBvaW50KHJhZGl1cywgMCksXG4gICAgICAgIG5ldyBQaGFzZXIuUG9pbnQocmFkaXVzIC8gMiwgcmFkaXVzIC8gMiksXG4gICAgICAgIG5ldyBQaGFzZXIuUG9pbnQoMCwgcmFkaXVzKSxcbiAgICAgICAgbmV3IFBoYXNlci5Qb2ludCgtcmFkaXVzIC8gMiwgcmFkaXVzIC8gMiksXG4gICAgICAgIG5ldyBQaGFzZXIuUG9pbnQoLXJhZGl1cywgMCksXG4gICAgICBdO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fbG9jYXRpb25zO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgZGVmYXVsdHM6IERpYW1vblBhcmFtZXRlcnMgPSB7IHJhZGl1czogMTAwIH07XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfcmFkaXVzOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoZ2FtZTogUGhhc2VyLkdhbWUsIHsgcmFkaXVzIH0gPSBEZWx0YS5kZWZhdWx0cykge1xuICAgIHN1cGVyKGdhbWUpO1xuICAgIHRoaXMuX3JhZGl1cyA9IHJhZGl1cztcbiAgfVxuXG59XG5cbmV4cG9ydCB7IERpYW1vbmQsIERlbHRhLCBSYWRpYWxGb3JtYXRpb24sIFBhdGgsIFB1bHNlIH07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9+L3NvdXJjZS1tYXAtbG9hZGVyIS4vc3JjL3RzL0Zvcm1hdGlvbi50cyIsImltcG9ydCBFbmVteSBmcm9tICcuL0VuZW15JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWxpZW4gZXh0ZW5kcyBFbmVteSB7XG5cbiAgY29uc3RydWN0b3IoZ2FtZSkge1xuICAgIHN1cGVyKGdhbWUsICdhbGllbicpO1xuICB9XG5cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL34vc291cmNlLW1hcC1sb2FkZXIhLi9zcmMvdHMvZW5lbWllcy9BbGllbi50cyIsImltcG9ydCBFbmVteSBmcm9tICcuL0VuZW15JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnJhaW4gZXh0ZW5kcyBFbmVteSB7XG5cbiAgcmVhZG9ubHkgb25CdXJzdDogUGhhc2VyLlNpZ25hbCA9IG5ldyBQaGFzZXIuU2lnbmFsKCk7XG5cbiAgY29uc3RydWN0b3IoZ2FtZSkge1xuICAgIHN1cGVyKGdhbWUsICdicmFpbicpO1xuICB9XG5cbiAgYnVyc3QoKSB7XG4gICAgdGhpcy5vbkJ1cnN0LmRpc3BhdGNoKHRoaXMpO1xuICB9XG5cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL34vc291cmNlLW1hcC1sb2FkZXIhLi9zcmMvdHMvZW5lbWllcy9CcmFpbi50cyIsImltcG9ydCBFbnZpcm9ubWVudCBmcm9tICcuL0Vudmlyb25tZW50JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT2NlYW4gZXh0ZW5kcyBFbnZpcm9ubWVudCB7XG5cbiAgcHJpdmF0ZSBfcGh5c2ljc1RpbWVUb3RhbDogbnVtYmVyID0gMDtcblxuICBwcml2YXRlIF9meFN0YXRlcztcblxuICBjb25zdHJ1Y3RvcihnYW1lOiBQaGFzZXIuR2FtZSkge1xuICAgIHN1cGVyKGdhbWUpO1xuICB9XG5cbiAgaW5pdCh7IGZ4LCBzcGVlZHMgfTogeyBmeDogbnVtYmVyLCBzcGVlZHM6IEFycmF5PG51bWJlcj4gfSwgbGF5ZXI6IFBoYXNlci5Hcm91cCkge1xuICAgIHN1cGVyLmluaXQoe30sIGxheWVyKTtcbiAgICBjb25zdCBiZyA9IHRoaXMuX2xheWVyLmNoaWxkcmVuWzBdIGFzIFBoYXNlci5JbWFnZTtcbiAgICB0aGlzLl9meFN0YXRlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IGZ4OyBpKyspIHtcbiAgICAgIGNvbnN0IGZ4ID0gdGhpcy5fbGF5ZXIuY3JlYXRlKDAsIDAsIGBiZzpmeDoke2l9YCkgYXMgUGhhc2VyLkltYWdlO1xuICAgICAgY29uc3Qgd2lkdGhEaWZmZXJlbmNlID0gZngud2lkdGggLSBiZy53aWR0aDtcbiAgICAgIGNvbnN0IG9mZnNldFggPSB3aWR0aERpZmZlcmVuY2UgLyAyO1xuICAgICAgZngucG9zaXRpb24ueCA9IC1vZmZzZXRYO1xuICAgICAgY29uc3Qgc3BlZWQgPSBzcGVlZHNbaSAtIDFdO1xuICAgICAgY29uc3QgbGltaXRzID0gWy13aWR0aERpZmZlcmVuY2UsIDBdO1xuICAgICAgY29uc3QgZGlyZWN0aW9uID0gLTE7XG4gICAgICB0aGlzLl9meFN0YXRlcy5wdXNoKHsgbGF5ZXI6IGZ4LCBzcGVlZCwgbGltaXRzLCBkaXJlY3Rpb24gfSk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIGNvbnN0IGR0ID0gdGhpcy5fZ2FtZS50aW1lLnBoeXNpY3NFbGFwc2VkO1xuICAgIHRoaXMuX3BoeXNpY3NUaW1lVG90YWwgKz0gZHQ7XG4gICAgdGhpcy5fZnhTdGF0ZXMuZm9yRWFjaChzdGF0ZSA9PiB7XG4gICAgICBjb25zdCB7IGxheWVyLCBzcGVlZCwgbGltaXRzLCBkaXJlY3Rpb24gfSA9IHN0YXRlO1xuICAgICAgY29uc3QgZHYgPSBkaXJlY3Rpb24gKiBzcGVlZCAqIGR0O1xuICAgICAgY29uc3QgY3VycmVudFBvc2l0aW9uID0gbGF5ZXIucG9zaXRpb24ueCArPSBkdjtcbiAgICAgIGlmIChjdXJyZW50UG9zaXRpb24gPD0gbGltaXRzWzBdIHx8IGN1cnJlbnRQb3NpdGlvbiA+PSBsaW1pdHNbMV0pIHtcbiAgICAgICAgc3RhdGUuZGlyZWN0aW9uID0gLXN0YXRlLmRpcmVjdGlvbjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9+L3NvdXJjZS1tYXAtbG9hZGVyIS4vc3JjL3RzL2Vudmlyb25tZW50cy9PY2Vhbi50cyIsImltcG9ydCBOYXJ3aGFsIGZyb20gJy4vTmFyd2hhbCc7XG5pbXBvcnQgeyBBbGllbiwgQnJhaW4gfSBmcm9tICcuL2VuZW1pZXMnO1xuaW1wb3J0IEZvcm1hdGlvbk1hbmFnZXIgZnJvbSAnLi9Gb3JtYXRpb25NYW5hZ2VyJztcbmltcG9ydCB7IFNwYWNlTmFyd2hhbExvYWRlciB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgT2NlYW4gfSBmcm9tICcuL2Vudmlyb25tZW50cyc7XG5cbmNsYXNzIExldmVsIGV4dGVuZHMgUGhhc2VyLlN0YXRlIHtcblxuICBwcml2YXRlIF9lbnZpcm9ubWVudDogT2NlYW47XG5cbiAgcHJpdmF0ZSBfbmFyd2hhbDogTmFyd2hhbDtcblxuICBwcml2YXRlIF9mb3JtYXRpb25NYW5hZ2VyOiBGb3JtYXRpb25NYW5hZ2VyO1xuXG4gIHByaXZhdGUgX2tleXM6IHsgW2s6IHN0cmluZ106IFBoYXNlci5LZXkgfTtcblxuICBwcml2YXRlIF9zY29yZTogUGhhc2VyLlRleHQ7XG5cbiAgaW5pdCgpIHtcbiAgICB0aGlzLmdhbWUubG9hZCA9IG5ldyBTcGFjZU5hcndoYWxMb2FkZXIodGhpcy5nYW1lKTtcbiAgICB0aGlzLl9rZXlzID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleXMoe1xuICAgICAgbGVmdDogUGhhc2VyLktleUNvZGUuTEVGVCxcbiAgICAgIHJpZ2h0OiBQaGFzZXIuS2V5Q29kZS5SSUdIVCxcbiAgICAgIHVwOiBQaGFzZXIuS2V5Q29kZS5VUCxcbiAgICAgIGRvd246IFBoYXNlci5LZXlDb2RlLkRPV05cbiAgICB9KTtcbiAgICB0aGlzLl9mb3JtYXRpb25NYW5hZ2VyID0gbmV3IEZvcm1hdGlvbk1hbmFnZXIodGhpcy5nYW1lKTtcbiAgICB0aGlzLl9lbnZpcm9ubWVudCA9IG5ldyBPY2Vhbih0aGlzLmdhbWUpO1xuICB9XG5cbiAgcHJlbG9hZCgpIHtcbiAgICB0aGlzLmdhbWUubG9hZC5hdGxhc0pTT05IYXNoKFxuICAgICAgJ2NoYXI6MScsXG4gICAgICAnYXNzZXRzL2FuaW1hdGlvbnMvY2hhci0wMS5wbmcnLCAnYXNzZXRzL2FuaW1hdGlvbnMvY2hhci0wMS5qc29uJ1xuICAgICk7XG4gICAgdGhpcy5nYW1lLmxvYWQuanNvbignbGV2ZWwnLCAnbGV2ZWxzL0wwMTAxLmpzb24nKTtcbiAgICB0aGlzLmdhbWUubG9hZC53ZWJmb250KCdzY29yZS1mb250JywgJ1JldmFsaWEnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnYmc6YmFja2dyb3VuZCcsICdhc3NldHMvYmFjay0wMS5wbmcnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnYmc6Zng6MScsICdhc3NldHMvYmFjay1meC1iYWNrLnBuZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmltYWdlKCdiZzpmeDoyJywgJ2Fzc2V0cy9iYWNrLWZ4LWZyb250LnBuZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmltYWdlKCduYXJ3aGFsJywgJ2Fzc2V0cy9jaGFyLTAxLnBuZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmltYWdlKCdhbGllbicsICdhc3NldHMvZW5lbXktMDEucG5nJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoJ2JyYWluJywgJ2Fzc2V0cy9icmFpbi0wMS5wbmcnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnaHVkOmhlYXJ0JywgJ2Fzc2V0cy9odWQtbGlmZS5wbmcnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnaHVkOmVuZW15JywgJ2Fzc2V0cy9odWQtZW5lbXkucG5nJyk7XG4gIH1cblxuICBjcmVhdGUoKSB7XG4gICAgY29uc3QgYmdMYXllciA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICBjb25zdCBlbmVteUxheWVyID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgIGNvbnN0IGNoYXJhY3RlckxheWVyID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgIGNvbnN0IGh1ZExheWVyID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgIHRoaXMuX2luaXRFbnZpcm9ubWVudChiZ0xheWVyKTtcbiAgICB0aGlzLl9zcGF3bk5hcndoYWwoY2hhcmFjdGVyTGF5ZXIpO1xuICAgIHRoaXMuX2luaXRGb3JtYXRpb25zKGVuZW15TGF5ZXIpO1xuICAgIHRoaXMuX2NyZWF0ZUh1ZChodWRMYXllcik7XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgdGhpcy5fZm9ybWF0aW9uTWFuYWdlci51cGRhdGUoKTtcbiAgICB0aGlzLl9lbnZpcm9ubWVudC51cGRhdGUoKTtcbiAgICB0aGlzLl9oYW5kbGVJbnB1dCgpO1xuICAgIHRoaXMuX2hhbmRsZUNvbGxpc2lvbnMoKTtcbiAgICB0aGlzLl91cGRhdGVIdWQoKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZUh1ZChodWRMYXllcjogUGhhc2VyLkdyb3VwKSB7XG4gICAgLy8gTGl2ZXNcbiAgICBjb25zdCBoZWFydHMgPSBuZXcgUGhhc2VyLkdyb3VwKHRoaXMuZ2FtZSk7XG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLl9uYXJ3aGFsLmxpdmVzOyBpIDwgbDsgaSsrKSB7XG4gICAgICBjb25zdCBoZWFydCA9XG4gICAgICAgIG5ldyBQaGFzZXIuSW1hZ2UodGhpcy5nYW1lLCAwLCAtNTIgLSAoaSAqIDYwKSwgJ2h1ZDpoZWFydCcpO1xuICAgICAgaGVhcnRzLmFkZENoaWxkKGhlYXJ0KTtcbiAgICB9XG4gICAgaGVhcnRzLnBvc2l0aW9uLnNldFRvKDIwLCAxMDQ1KTtcbiAgICBodWRMYXllci5hZGRDaGlsZChoZWFydHMpO1xuICAgIHRoaXMuX25hcndoYWwub25Ecm9wTGlmZS5hZGQoKCkgPT4ge1xuICAgICAgaGVhcnRzLnJlbW92ZUNoaWxkQXQoaGVhcnRzLmxlbmd0aCAtIDEpO1xuICAgIH0pO1xuXG4gICAgLy8gU2NvcmVcbiAgICBjb25zdCBzY29yZSA9IG5ldyBQaGFzZXIuR3JvdXAodGhpcy5nYW1lKTtcbiAgICBjb25zdCBlbmVteUluZGljYXRvciA9IG5ldyBQaGFzZXIuSW1hZ2UodGhpcy5nYW1lLCAwLCAwLCAnaHVkOmVuZW15Jyk7XG4gICAgdGhpcy5fc2NvcmUgPSBuZXcgUGhhc2VyLlRleHQodGhpcy5nYW1lLCA0NSwgMCwgJ3gwMDAwJywge1xuICAgICAgZm9udDogJ1JldmFsaWEnLFxuICAgICAgZm9udFNpemU6ICczOHB4JyxcbiAgICAgIGZpbGw6ICd3aGl0ZSdcbiAgICB9KTtcbiAgICB0aGlzLl9zY29yZS5zZXRTaGFkb3coMSwgMSwgJ2JsYWNrJywgNSk7XG4gICAgc2NvcmUuYWRkQ2hpbGQoZW5lbXlJbmRpY2F0b3IpO1xuICAgIHNjb3JlLmFkZENoaWxkKHRoaXMuX3Njb3JlKTtcbiAgICBzY29yZS51cGRhdGVUcmFuc2Zvcm0oKTtcbiAgICBzY29yZS5wb3NpdGlvbi5zZXRUbygxNSwgMTUpO1xuICAgIGh1ZExheWVyLmFkZENoaWxkKHNjb3JlKTtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfaW5pdEVudmlyb25tZW50KGxheWVyOiBQaGFzZXIuR3JvdXApIHtcbiAgICB0aGlzLl9lbnZpcm9ubWVudC5pbml0KHsgZng6IDIsIHNwZWVkczogWzEwLCAyMF0gfSwgbGF5ZXIpO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5pdEZvcm1hdGlvbnMobGF5ZXI6IFBoYXNlci5Hcm91cCkge1xuICAgIHZhciBsZXZlbERhdGEgPSB0aGlzLmdhbWUuY2FjaGUuZ2V0SlNPTignbGV2ZWwnKTtcbiAgICB0aGlzLl9mb3JtYXRpb25NYW5hZ2VyLmluaXQobGV2ZWxEYXRhLmZvcm1hdGlvbnMsIGxheWVyKTtcbiAgfVxuXG4gIHByaXZhdGUgX2hhbmRsZUlucHV0KCkge1xuICAgIGNvbnN0IGRpcmVjdGlvbiA9IHsgeDogMCwgeTogMCB9O1xuICAgIGlmICh0aGlzLl9rZXlzLmxlZnQuaXNEb3duKSB7XG4gICAgICBkaXJlY3Rpb24ueCA9IC0xO1xuICAgIH1cbiAgICBpZiAodGhpcy5fa2V5cy5yaWdodC5pc0Rvd24pIHtcbiAgICAgIGRpcmVjdGlvbi54ID0gMTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2tleXMudXAuaXNEb3duKSB7XG4gICAgICBkaXJlY3Rpb24ueSA9IC0xO1xuICAgIH1cbiAgICBpZiAodGhpcy5fa2V5cy5kb3duLmlzRG93bikge1xuICAgICAgZGlyZWN0aW9uLnkgPSAxO1xuICAgIH1cbiAgICB0aGlzLl9uYXJ3aGFsLm1vdmUoZGlyZWN0aW9uKTtcbiAgfVxuXG4gIHByaXZhdGUgX2hhbmRsZUNvbGxpc2lvbnMoKSB7XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAoXG4gICAgICB0aGlzLl9uYXJ3aGFsLCB0aGlzLl9mb3JtYXRpb25NYW5hZ2VyLmJyYWlucyxcbiAgICAgIHRoaXMuX29uTmFyd2hhbFZzQnJhaW4sXG4gICAgICB1bmRlZmluZWQsIHRoaXNcbiAgICApO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKFxuICAgICAgdGhpcy5fbmFyd2hhbCwgdGhpcy5fZm9ybWF0aW9uTWFuYWdlci5hbGllbnMsXG4gICAgICB0aGlzLl9vbk5hcndoYWxWc0FsaWVuLFxuICAgICAgdW5kZWZpbmVkLCB0aGlzXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgX29uTmFyd2hhbFZzQWxpZW4obmFyd2hhbDogTmFyd2hhbCwgYWxpZW46IEFsaWVuKSB7XG4gICAgbmFyd2hhbC50YWtlRGFtYWdlKCk7XG4gIH1cblxuICBwcml2YXRlIF9vbk5hcndoYWxWc0JyYWluKG5hcndoYWw6IE5hcndoYWwsIGJyYWluOiBCcmFpbikge1xuICAgIG5hcndoYWwuYXR0YWNrKGJyYWluKTtcbiAgfVxuXG4gIHByaXZhdGUgX3NwYXduTmFyd2hhbChsYXllcjogUGhhc2VyLkdyb3VwKSB7XG4gICAgdGhpcy5fbmFyd2hhbCA9IG5ldyBOYXJ3aGFsKFxuICAgICAgdGhpcy5nYW1lLFxuICAgICAgdGhpcy5nYW1lLndvcmxkLmNlbnRlclgsXG4gICAgICB0aGlzLmdhbWUud29ybGQuY2VudGVyWVxuICAgICk7XG4gICAgbGF5ZXIuYWRkQ2hpbGQodGhpcy5fbmFyd2hhbCk7XG4gICAgdGhpcy5fbmFyd2hhbC5ldmVudHMub25PdXRPZkJvdW5kcy5hZGRPbmNlKCgpID0+IHtcbiAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCh0aGlzLmdhbWUuc3RhdGUuY3VycmVudCk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVIdWQoKSB7XG4gICAgY29uc3QgdGV4dCA9IGB4JHtwYWQodGhpcy5fZm9ybWF0aW9uTWFuYWdlci5lbmVteUtpbGxlZCl9YDtcbiAgICB0aGlzLl9zY29yZS5zZXRUZXh0KHRleHQpO1xuXG4gICAgZnVuY3Rpb24gcGFkKG4pIHtcbiAgICAgIGNvbnN0IHN0ciA9IG4gKyAnJztcbiAgICAgIHJldHVybiAnMDAwMCcuc2xpY2UoMCwgNCAtIHN0ci5sZW5ndGgpICsgc3RyO1xuICAgIH1cbiAgfVxufTtcblxud2luZG93Lm9ubG9hZCA9ICgpID0+IHtcbiAgY29uc3QgbGV2ZWwgPSBuZXcgTGV2ZWwoKTtcbiAgY29uc3QgZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSgxMDAwLCAxMDgwLCBQaGFzZXIuQVVUTywgJ2NvbnRlbnQnLCBsZXZlbCk7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vfi9zb3VyY2UtbWFwLWxvYWRlciEuL3NyYy90cy9zcGFjZS1uYXJ3aGFsLnRzIiwiaW1wb3J0IEVuZW15IGZyb20gJy4vRW5lbXknO1xuaW1wb3J0IEFsaWVuIGZyb20gJy4vQWxpZW4nO1xuaW1wb3J0IEJyYWluIGZyb20gJy4vQnJhaW4nO1xuXG5leHBvcnQge1xuICBFbmVteSxcbiAgQWxpZW4sXG4gIEJyYWluXG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdHMvZW5lbWllcy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==