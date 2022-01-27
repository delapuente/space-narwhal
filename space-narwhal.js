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
        this._whiteFilter = this.game.add.filter('White');
        this._whiteFilter.force = 0.75;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYzQzNDc0YjRhNTVmZDNmODQ5YTYiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL3V0aWxzL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy90cy9lbmVtaWVzL0VuZW15LnRzIiwid2VicGFjazovLy8uL3NyYy90cy9lbnZpcm9ubWVudHMvRW52aXJvbm1lbnQudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL0Zvcm1hdGlvbk1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL05hcndoYWwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL2Vudmlyb25tZW50cy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdHMvRm9ybWF0aW9uLnRzIiwid2VicGFjazovLy8uL3NyYy90cy9lbmVtaWVzL0FsaWVuLnRzIiwid2VicGFjazovLy8uL3NyYy90cy9lbmVtaWVzL0JyYWluLnRzIiwid2VicGFjazovLy8uL3NyYy90cy9lbnZpcm9ubWVudHMvT2NlYW4udHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL3NwYWNlLW5hcndoYWwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL2VuZW1pZXMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQSwyQ0FBMkMsY0FBYzs7UUFFekQ7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSxLQUFLO1FBQ0w7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7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QUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFMUIsYUFBYSxDQUFDO1lBQ1osTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNuQixPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDO1FBQy9DLENBQUM7SUFDSCxDQUFDO0NBQ0Y7QUFBQSxDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7SUFDbkIsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztJQUMxQixNQUFNLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUMxRSxDQUFDLENBQUM7Ozs7Ozs7O0FDekxGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQTRCO0FBQ0E7QUFDQTs7QUFNMUIiLCJmaWxlIjoic3BhY2UtbmFyd2hhbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGlkZW50aXR5IGZ1bmN0aW9uIGZvciBjYWxsaW5nIGhhcm1vbnkgaW1wb3J0cyB3aXRoIHRoZSBjb3JyZWN0IGNvbnRleHRcbiBcdF9fd2VicGFja19yZXF1aXJlX18uaSA9IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfTtcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMTApO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGM0MzQ3NGI0YTU1ZmQzZjg0OWE2IiwiXG50eXBlIEZyb21UbyA9IEFycmF5PFtudW1iZXIsbnVtYmVyXXxbbnVtYmVyXT47XG50eXBlIFNob3J0R2VuRnJhbWVzID0gKG5hbWU6IHN0cmluZywgLi4uc2VxOiBGcm9tVG8pID0+IEFycmF5PHN0cmluZz47XG5cbmZ1bmN0aW9uIGdlbkZyYW1lcyhwcmVmaXg6IHN0cmluZywgc3VmZml4OiBzdHJpbmcsIGRpZ2l0czogbnVtYmVyKSA6IFNob3J0R2VuRnJhbWVzIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG5hbWUsIC4uLnNlcSkge1xuICAgIGNvbnN0IHBhdGggPSBgJHtwcmVmaXggPyBwcmVmaXggKyAnLycgOiAnJ30ke25hbWV9L2A7XG4gICAgY29uc3QgbmFtZXM6IEFycmF5PHN0cmluZz4gPSBbXTtcbiAgICBzZXEuZm9yRWFjaChwYWlyID0+IHtcbiAgICAgIGNvbnN0IGZyb20gPSBwYWlyWzBdO1xuICAgICAgY29uc3QgdG8gPSBwYWlyLmxlbmd0aCA9PT0gMSA/IGZyb20gOiBwYWlyWzFdO1xuICAgICAgY29uc3QgZnJhbWVzID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXG4gICAgICAgIHBhdGgsXG4gICAgICAgIGZyb20sIHRvLFxuICAgICAgICBzdWZmaXgsIGRpZ2l0c1xuICAgICAgKTtcbiAgICAgIG5hbWVzLnB1c2goLi4uZnJhbWVzKTtcbiAgICB9KTtcbiAgICByZXR1cm4gbmFtZXM7XG4gIH1cbn1cblxuY2xhc3MgU3BhY2VOYXJ3aGFsTG9hZGVyIGV4dGVuZHMgUGhhc2VyLkxvYWRlciB7XG5cbiAgY29uc3RydWN0b3IoZ2FtZTogUGhhc2VyLkdhbWUpIHtcbiAgICBzdXBlcihnYW1lKTtcbiAgfVxuXG4gIHdlYmZvbnQoa2V5OiBzdHJpbmcsIGZvbnROYW1lOiBzdHJpbmcsIG92ZXJ3cml0ZSA9IGZhbHNlKSA6IHRoaXMge1xuICAgIHRoaXMuYWRkVG9GaWxlTGlzdCgnd2ViZm9udCcsIGtleSwgZm9udE5hbWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbG9hZEZpbGUoZmlsZSkge1xuICAgIHN1cGVyLmxvYWRGaWxlKGZpbGUpO1xuICAgIGlmIChmaWxlLnR5cGUgPT09ICd3ZWJmb250Jykge1xuICAgICAgLy8gZmlsZS51cmwgY29udGFpbnMgdGhlIHdlYiBmb250XG4gICAgICBkb2N1bWVudC5mb250cy5sb2FkKGAxMHB0IFwiJHtmaWxlLnVybH1cImApLnRoZW4oXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYXN5bmNDb21wbGV0ZShmaWxlKTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4gIHtcbiAgICAgICAgICAgIHRoaXMuYXN5bmNDb21wbGV0ZShmaWxlLCBgRXJyb3IgbG9hZGluZyBmb250ICR7ZmlsZS51cmx9YCk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbn1cblxuZXhwb3J0IHsgZ2VuRnJhbWVzLCBTcGFjZU5hcndoYWxMb2FkZXIgfTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL34vc291cmNlLW1hcC1sb2FkZXIhLi9zcmMvdHMvdXRpbHMvaW5kZXgudHMiLCJpbXBvcnQgeyBSYWRpYWxGb3JtYXRpb24gfSBmcm9tICcuLi9Gb3JtYXRpb24nO1xuXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBFbmVteSBleHRlbmRzIFBoYXNlci5TcHJpdGUge1xuXG4gIGdldCBkaXN0YW5jZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzdGFuY2U7XG4gIH1cblxuICBnZXQgZm9ybWF0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9mb3JtYXRpb247XG4gIH1cblxuICBnZXQgcGxhY2VtZW50KCkge1xuICAgIHJldHVybiB0aGlzLl9wbGFjZW1lbnQ7XG4gIH07XG5cbiAgcHJpdmF0ZSBfZGlzdGFuY2U6IG51bWJlcnx1bmRlZmluZWQ7XG5cbiAgcHJpdmF0ZSBfZm9ybWF0aW9uOiBSYWRpYWxGb3JtYXRpb247XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfcGxhY2VtZW50OiBQaGFzZXIuUG9pbnQgPSBuZXcgUGhhc2VyLlBvaW50KCk7XG5cbiAgY29uc3RydWN0b3IoZ2FtZTogUGhhc2VyLkdhbWUsIGtleTogc3RyaW5nKSB7XG4gICAgc3VwZXIoZ2FtZSwgMCwgMCwga2V5KTtcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUpO1xuICB9XG5cbiAgcGxhY2UoZm9ybWF0aW9uOiBSYWRpYWxGb3JtYXRpb24sIHg6IG51bWJlciwgeTogbnVtYmVyKTogdGhpcyB7XG4gICAgc3VwZXIucmVzZXQoeCwgeSk7XG4gICAgdGhpcy51cGRhdGVUcmFuc2Zvcm0oKTtcbiAgICB0aGlzLl9mb3JtYXRpb24gPSBmb3JtYXRpb247XG4gICAgdGhpcy5fcGxhY2VtZW50LnNldFRvKHgsIHkpO1xuICAgIHRoaXMuX2Rpc3RhbmNlID0gdGhpcy5fcGxhY2VtZW50LmdldE1hZ25pdHVkZSgpO1xuICAgIHRoaXMuX3Jlc2V0RXZlbnRzKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwcml2YXRlIF9yZXNldEV2ZW50cygpIHtcbiAgICBmb3IgKGxldCBuYW1lIGluIHRoaXMuZXZlbnRzKSB7XG4gICAgICBjb25zdCBtZW1iZXIgPSB0aGlzLmV2ZW50c1tuYW1lXTtcbiAgICAgIGlmIChtZW1iZXIgaW5zdGFuY2VvZiBQaGFzZXIuU2lnbmFsKSB7XG4gICAgICAgIChtZW1iZXIgYXMgUGhhc2VyLlNpZ25hbCkucmVtb3ZlQWxsKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL34vc291cmNlLW1hcC1sb2FkZXIhLi9zcmMvdHMvZW5lbWllcy9FbmVteS50cyIsIlxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRW52aXJvbm1lbnQge1xuXG4gIHByb3RlY3RlZCBfZ2FtZTogUGhhc2VyLkdhbWU7XG5cbiAgcHJvdGVjdGVkIF9sYXllcjogUGhhc2VyLkdyb3VwO1xuXG4gIGNvbnN0cnVjdG9yKGdhbWU6IFBoYXNlci5HYW1lKSB7XG4gICAgdGhpcy5fZ2FtZSA9IGdhbWU7XG4gIH1cblxuICBpbml0KG9wdGlvbnMsIGxheWVyOiBQaGFzZXIuR3JvdXApIHtcbiAgICB0aGlzLl9sYXllciA9IGxheWVyO1xuICAgIHRoaXMuX2xheWVyLmNsYXNzVHlwZSA9IFBoYXNlci5JbWFnZTtcbiAgICB0aGlzLl9sYXllci5jcmVhdGUoMCwgMCwgJ2JnOmJhY2tncm91bmQnKTtcbiAgfVxuXG4gIHVwZGF0ZSgpIHsgfVxuXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9+L3NvdXJjZS1tYXAtbG9hZGVyIS4vc3JjL3RzL2Vudmlyb25tZW50cy9FbnZpcm9ubWVudC50cyIsImltcG9ydCB7IEVuZW15LCBBbGllbiwgQnJhaW4gfSBmcm9tICcuL2VuZW1pZXMnO1xuaW1wb3J0IHsgUGF0aCwgUHVsc2UsIFJhZGlhbEZvcm1hdGlvbiwgRGlhbW9uZCwgRGVsdGEgfSBmcm9tICcuL0Zvcm1hdGlvbic7XG5cbnR5cGUgVHlwZU9mPFQ+ID0gbmV3ICguLi5fKSA9PiBUO1xuXG5jb25zdCBGT1JNQVRJT05TOiB7IFtzOiBzdHJpbmddOiBUeXBlT2Y8UmFkaWFsRm9ybWF0aW9uPiB9ID0ge1xuICAnRGlhbW9uZCc6IERpYW1vbmQsXG4gICdEZWx0YSc6IERlbHRhXG59O1xuXG50eXBlIFB1bHNlU3BlYyA9IFB1bHNlO1xuXG50eXBlIFBhdGhTcGVjID0gQXJyYXk8W3N0cmluZ3xudW1iZXIsIHN0cmluZ3xudW1iZXJdPjtcblxudHlwZSBGb3JtYXRpb25TcGVjID0ge1xuICBzaGFwZTogc3RyaW5nLFxuICBicmFpblBvc2l0aW9uczogQXJyYXk8bnVtYmVyPixcbiAgcm90YXRlPzogbnVtYmVyLFxuICBwdWxzZT86IFB1bHNlU3BlYyxcbiAgZm9sbG93PzogeyBwYXRoOiBQYXRoU3BlYywgZHVyYXRpb246IG51bWJlciB9LFxuICBkZWxheT86IG51bWJlcixcbiAgYXQ/OiBudW1iZXIsXG4gIHJlcGVhdD86IG51bWJlciB8IHN0cmluZyxcbiAgd2FpdD86IG51bWJlclxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRm9ybWF0aW9uTWFuYWdlciB7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfZ2FtZTogUGhhc2VyLkdhbWU7XG5cbiAgcHJpdmF0ZSBfbGF5ZXI6IFBoYXNlci5Hcm91cDtcblxuICBwcml2YXRlIF9waHlzaWNzVGltZVRvdGFsOiBudW1iZXIgPSAwO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX3NjcmVlbjogeyBbczogc3RyaW5nXTogbnVtYmVyIH07XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfZW5lbWllczoge1xuICAgIGFsaWVuOiBBcnJheTxBbGllbj47XG4gICAgYnJhaW46IEFycmF5PEJyYWluPjtcbiAgfSA9IHtcbiAgICBhbGllbjogW10sXG4gICAgYnJhaW46IFtdXG4gIH07XG5cbiAgcHJpdmF0ZSBfZm9ybWF0aW9uczogQXJyYXk8Rm9ybWF0aW9uU3BlYz47XG5cbiAgcHJpdmF0ZSBfdGltZU9yaWdpbjogbnVtYmVyID0gLUluZmluaXR5O1xuXG4gIHByaXZhdGUgX2RlYWRsaW5lOiBudW1iZXIgPSBJbmZpbml0eTtcblxuICBwcml2YXRlIF9lbmVteUtpbGxlZDogbnVtYmVyID0gMDtcblxuICBnZXQgYnJhaW5zKCkge1xuICAgIHJldHVybiB0aGlzLl9lbmVtaWVzLmJyYWluLmZpbHRlcihicmFpbiA9PiBicmFpbi5hbGl2ZSk7XG4gIH1cblxuICBnZXQgYWxpZW5zKCkge1xuICAgIHJldHVybiB0aGlzLl9lbmVtaWVzLmFsaWVuLmZpbHRlcihhbGllbiA9PiBhbGllbi5hbGl2ZSk7XG4gIH1cblxuICBnZXQgZW5lbXlLaWxsZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuZW15S2lsbGVkO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZ2FtZTogUGhhc2VyLkdhbWUpIHtcbiAgICB0aGlzLl9nYW1lID0gZ2FtZTtcbiAgICAvL1RPRE86IEluamVjdCBpbiB0aGUgY29uc3RydWN0b3IuXG4gICAgY29uc3Qgc2VtaVdpZHRoID0gdGhpcy5fZ2FtZS53aWR0aCAvIDI7XG4gICAgY29uc3Qgc2VtaUhlaWdodCA9IHRoaXMuX2dhbWUuaGVpZ2h0IC8gMjtcbiAgICBjb25zdCBjZW50ZXJYID0gdGhpcy5fZ2FtZS53b3JsZC5jZW50ZXJYO1xuICAgIGNvbnN0IGNlbnRlclkgPSB0aGlzLl9nYW1lLndvcmxkLmNlbnRlclk7XG4gICAgY29uc3QgdG9wID0gY2VudGVyWSAtIHNlbWlIZWlnaHQ7XG4gICAgY29uc3QgYm90dG9tID0gY2VudGVyWSArIHNlbWlIZWlnaHQ7XG4gICAgY29uc3QgbGVmdCA9IGNlbnRlclggLSBzZW1pV2lkdGg7XG4gICAgY29uc3QgcmlnaHQgPSBjZW50ZXJYICsgc2VtaVdpZHRoO1xuICAgIHRoaXMuX3NjcmVlbiA9IHtcbiAgICAgIGNlbnRlclgsIGNlbnRlclksIHRvcCwgYm90dG9tLCBsZWZ0LCByaWdodCxcbiAgICAgIGdldCByYW5kb21YKCkge1xuICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqICh0aGlzLnJpZ2h0IC0gdGhpcy5sZWZ0KSArIHRoaXMubGVmdDtcbiAgICAgIH0sXG4gICAgICBnZXQgcmFuZG9tWSgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgKiAodGhpcy5ib3R0b20gLSB0aGlzLnRvcCkgKyB0aGlzLnRvcDtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgaW5pdChmb3JtYXRpb25zOiBBcnJheTxGb3JtYXRpb25TcGVjPiwgbGF5ZXI6IFBoYXNlci5Hcm91cCkge1xuICAgIHRoaXMuX2Zvcm1hdGlvbnMgPSBmb3JtYXRpb25zO1xuICAgIHRoaXMuX3RpbWVPcmlnaW4gPSB0aGlzLl9waHlzaWNzVGltZVRvdGFsO1xuICAgIHRoaXMuX2xheWVyID0gbGF5ZXI7XG4gICAgdGhpcy5fYWxsb2NhdGVBbGllbnMoNTAwKTtcbiAgICB0aGlzLl9hbGxvY2F0ZUJyYWlucyg1MCk7XG4gICAgdGhpcy5fdXBkYXRlRGVhZGxpbmUoKTtcbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICB0aGlzLl9waHlzaWNzVGltZVRvdGFsICs9IHRoaXMuX2dhbWUudGltZS5waHlzaWNzRWxhcHNlZDtcbiAgICB0aGlzLl9zcGF3bkZvcm1hdGlvbnMoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZURlYWRsaW5lKCkge1xuICAgIGlmICghdGhpcy5fZm9ybWF0aW9ucy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuX2RlYWRsaW5lID0gSW5maW5pdHk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbGV0IHsgYXQsIGRlbGF5IH0gPSB0aGlzLl9mb3JtYXRpb25zWzBdO1xuICAgICAgaWYgKHR5cGVvZiBhdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgYXQgPSBNYXRoLm1heCgwLCBhdCB8fCAwKTtcbiAgICAgICAgdGhpcy5fZGVhZGxpbmUgPSB0aGlzLl90aW1lT3JpZ2luICsgYXQ7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZGVsYXkgPSBNYXRoLm1heCgwLCBkZWxheSB8fCAwKTtcbiAgICAgICAgaWYgKCFpc0Zpbml0ZSh0aGlzLl9kZWFkbGluZSkpIHtcbiAgICAgICAgICB0aGlzLl9kZWFkbGluZSA9IHRoaXMuX3RpbWVPcmlnaW47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZGVhZGxpbmUgKz0gZGVsYXk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfc3Bhd25Gb3JtYXRpb25zKCkge1xuICAgIGNvbnN0IG5vdyA9IHRoaXMuX3BoeXNpY3NUaW1lVG90YWw7XG4gICAgaWYgKHRoaXMuX2Zvcm1hdGlvbnMubGVuZ3RoICYmIG5vdyA+PSB0aGlzLl9kZWFkbGluZSkge1xuICAgICAgY29uc3QgZm9ybWF0aW9uRGF0YSA9IHRoaXMuX2Zvcm1hdGlvbnMuc2hpZnQoKSBhcyBGb3JtYXRpb25TcGVjO1xuICAgICAgY29uc3QgeyByZXBlYXQgPSAxLCB3YWl0ID0gMCB9ID0gZm9ybWF0aW9uRGF0YTtcbiAgICAgIGlmIChyZXBlYXQgPiAxKSB7XG4gICAgICAgIGZvcm1hdGlvbkRhdGEucmVwZWF0ID0gdG9JbnQocmVwZWF0KSAtIDE7XG4gICAgICAgIGZvcm1hdGlvbkRhdGEuZGVsYXkgPSB3YWl0O1xuICAgICAgICB0aGlzLl9mb3JtYXRpb25zLnVuc2hpZnQoZm9ybWF0aW9uRGF0YSk7XG4gICAgICB9XG4gICAgICBjb25zdCBmb3JtYXRpb24gPSB0aGlzLl9zcGF3bkZvcm1hdGlvbihmb3JtYXRpb25EYXRhKTtcbiAgICAgIHRoaXMuX2FwcGx5RWZmZWN0cyhmb3JtYXRpb25EYXRhLCBmb3JtYXRpb24pO1xuICAgICAgdGhpcy5fdXBkYXRlRGVhZGxpbmUoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0b0ludCh2Om51bWJlcnxzdHJpbmcpIHtcbiAgICAgIGlmICh0eXBlb2YgdiA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICh2ID09PSAnSW5maW5pdHknKSB7XG4gICAgICAgIHJldHVybiBJbmZpbml0eTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwYXJzZUludCh2LCAxMCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfc3Bhd25Gb3JtYXRpb24oZm9ybWF0aW9uRGF0YTogRm9ybWF0aW9uU3BlYykgOiBSYWRpYWxGb3JtYXRpb24ge1xuICAgIGNvbnN0IHsgc2hhcGUsIGJyYWluUG9zaXRpb25zIH0gPSBmb3JtYXRpb25EYXRhO1xuICAgIGNvbnN0IEZvcm1hdGlvbkNsYXNzID0gRk9STUFUSU9OU1tzaGFwZV07XG4gICAgY29uc3QgZm9ybWF0aW9uID0gbmV3IEZvcm1hdGlvbkNsYXNzKHRoaXMuX2dhbWUsIGZvcm1hdGlvbkRhdGEpO1xuICAgIGZvcm1hdGlvbi5vbkRlc3Ryb3llZEJ5Q2hhcmFjdGVyLmFkZE9uY2UoZW5lbXlDb3VudCA9PiB7XG4gICAgICB0aGlzLl9lbmVteUtpbGxlZCArPSBlbmVteUNvdW50O1xuICAgIH0sIHRoaXMpO1xuICAgIGNvbnN0IHsgbG9jYXRpb25zIH0gPSBmb3JtYXRpb247XG4gICAgY29uc3QgYnJhaW5Db3VudCA9IGJyYWluUG9zaXRpb25zLmxlbmd0aDtcbiAgICBjb25zdCBlbmVtaWVzID0gdGhpcy5fZ2V0QWxpZW5zKGxvY2F0aW9ucy5sZW5ndGggLSBicmFpbkNvdW50KTtcbiAgICBjb25zdCBicmFpbnMgPSB0aGlzLl9nZXRCcmFpbnMoYnJhaW5Db3VudCk7XG5cbiAgICBmb3JtYXRpb24uaW5pdChlbmVtaWVzLCBicmFpbnMsIGJyYWluUG9zaXRpb25zKTtcbiAgICByZXR1cm4gdGhpcy5fbGF5ZXIuYWRkQ2hpbGQoZm9ybWF0aW9uKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FsbG9jYXRlQWxpZW5zKGNvdW50OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5fYWxsb2NhdGVFbmVtaWVzKEFsaWVuLCBjb3VudCk7XG4gIH1cblxuICBwcml2YXRlIF9hbGxvY2F0ZUJyYWlucyhjb3VudDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FsbG9jYXRlRW5lbWllcyhCcmFpbiwgY291bnQpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0QWxpZW5zKGNvdW50OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0RW5lbWllcyhBbGllbiwgY291bnQpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0QnJhaW5zKGNvdW50OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0RW5lbWllcyhCcmFpbiwgY291bnQpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0RW5lbWllczxFIGV4dGVuZHMgRW5lbXk+KGtsYXNzOiBUeXBlT2Y8RT4sIGNvdW50OiBudW1iZXIpIHtcbiAgICBjb25zdCBpdGVtczogQXJyYXk8RT4gPSBbXTtcbiAgICBjb25zdCB0eXBlID0ga2xhc3MubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5fZW5lbWllc1t0eXBlXS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGNvbnN0IGVuZW15ID0gdGhpcy5fZW5lbWllc1t0eXBlXVtpXTtcbiAgICAgIGlmICghZW5lbXkuYWxpdmUpIHtcbiAgICAgICAgaXRlbXMucHVzaChlbmVteSk7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbXMubGVuZ3RoID09PSBjb3VudCkge1xuICAgICAgICByZXR1cm4gaXRlbXM7XG4gICAgICB9XG4gICAgfVxuICAgIGl0ZW1zLnB1c2goLi4udGhpcy5fYWxsb2NhdGVFbmVtaWVzKGtsYXNzLCBjb3VudCAtIGl0ZW1zLmxlbmd0aCkpO1xuICAgIHJldHVybiBpdGVtcztcbiAgfVxuXG4gIHByaXZhdGUgX2FsbG9jYXRlRW5lbWllczxFIGV4dGVuZHMgRW5lbXk+KGtsYXNzOiBUeXBlT2Y8RT4sIGNvdW50OiBudW1iZXIpIHtcbiAgICBjb25zdCBpdGVtczogQXJyYXk8RT4gPSBbXTtcbiAgICBjb25zdCB0eXBlID0ga2xhc3MubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgbGV0IGVuZW15ID0gbmV3IGtsYXNzKHRoaXMuX2dhbWUpO1xuICAgICAgdGhpcy5fZW5lbWllc1t0eXBlXS5wdXNoKGVuZW15KTtcbiAgICAgIGl0ZW1zLnB1c2goZW5lbXkpO1xuICAgICAgZW5lbXkua2lsbCgpO1xuICAgIH1cbiAgICByZXR1cm4gaXRlbXM7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUVmZmVjdHMoZm9ybWF0aW9uRGF0YTogRm9ybWF0aW9uU3BlYywgZm9ybWF0aW9uOiBSYWRpYWxGb3JtYXRpb24pIHtcbiAgICBjb25zdCB7IHB1bHNlLCByb3RhdGUsIGZvbGxvdyB9ID0gZm9ybWF0aW9uRGF0YTtcbiAgICBpZiAocHVsc2UpIHtcbiAgICAgIGZvcm1hdGlvbi5lbmFibGVQdWxzZShwdWxzZS5hbXBsaXR1ZGUsIHB1bHNlLmZyZXF1ZW5jeSk7XG4gICAgfVxuICAgIGlmIChyb3RhdGUpIHtcbiAgICAgIGZvcm1hdGlvbi5lbmFibGVSb3RhdGlvbihyb3RhdGUpO1xuICAgIH1cbiAgICBpZiAoZm9sbG93KSB7XG4gICAgICBjb25zdCB7IHBhdGgsIGR1cmF0aW9uIH0gPSBmb2xsb3c7XG4gICAgICBmb3JtYXRpb24uZW5hYmxlTW92ZW1lbnQoXG4gICAgICAgIHBhdGgubWFwKHRvUG9pbnQsIHRoaXMpLFxuICAgICAgICBkdXJhdGlvblxuICAgICAgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0b1BvaW50KFtreCwga3ldOiBbbnVtYmVyIHwgc3RyaW5nLCBudW1iZXIgfCBzdHJpbmddKSB7XG4gICAgICBjb25zdCB7IFtreF06IHggPSBreCwgW2t5XTogeSA9IGt5IH0gPSB0aGlzLl9zY3JlZW47XG4gICAgICByZXR1cm4gbmV3IFBoYXNlci5Qb2ludCg8bnVtYmVyPngsIDxudW1iZXI+eSk7XG4gICAgfVxuICB9XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9+L3NvdXJjZS1tYXAtbG9hZGVyIS4vc3JjL3RzL0Zvcm1hdGlvbk1hbmFnZXIudHMiLCJpbXBvcnQgeyBnZW5GcmFtZXMgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IEJyYWluIH0gZnJvbSAnLi9lbmVtaWVzJztcbmltcG9ydCB7IFdoaXRlIH0gZnJvbSAnLi9zaGFkZXJzJztcblxuLyoqIE1vdmVtZW50IHNwZWVkIGZvciB0aGUgaGVybyBuYXJ3aGFsLiAqL1xuY29uc3QgU1BFRUQgPSA4MDA7XG5cbmNvbnN0IFNJTktJTkdfU1BFRUQgPSAxMDA7XG5cbmNvbnN0IFJFQ09WRVJJTkdfVElNRSA9IDMwMDA7XG5cbnR5cGUgTmFyd2hhbFN0YXRlID1cbiAgJ2lkbGUnIHxcbiAgJ2F0dGFja2luZycgfFxuICAndGFraW5nRGFtYWdlJyB8XG4gICdhY2hpbmcnIHxcbiAgJ3JlY292ZXJpbmcnIHxcbiAgJ2R5aW5nJyB8XG4gICdkZWFkJyB8XG4gICdiYWNrKCknO1xuXG50eXBlIE5hcndoYWxBY3Rpb24gPVxuICAnYXR0YWNrJyB8XG4gICdhbmltYXRpb246YXR0YWNraW5nOmVuZCcgfFxuICAndGFrZURhbWFnZScgfFxuICAnZGllJyB8XG4gICdkcm9wTGlmZScgfFxuICAnYW5pbWF0aW9uOmFjaGluZzplbmQnIHxcbiAgJ2RpZScgfFxuICAnYW5pbWF0aW9uOmR5aW5nOmVuZCcgfFxuICAncmVhZHknO1xuXG50eXBlIE5hcndoYWxNYWNoaW5lID0ge1xuICBbc3RhdGUgaW4gTmFyd2hhbFN0YXRlXT86IHsgW2FjdGlvbiBpbiBOYXJ3aGFsQWN0aW9uXT86IE5hcndoYWxTdGF0ZSB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOYXJ3aGFsIGV4dGVuZHMgUGhhc2VyLlNwcml0ZSB7XG5cbiAgb25Ecm9wTGlmZSA9IG5ldyBQaGFzZXIuU2lnbmFsKCk7XG5cbiAgb25EaWUgPSBuZXcgUGhhc2VyLlNpZ25hbCgpO1xuXG4gIHByaXZhdGUgX2F0dGFja2luZzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHByaXZhdGUgX2JsaW5raW5nO1xuXG4gIHByaXZhdGUgX2Zvcm1lclN0YXRlOiBOYXJ3aGFsU3RhdGUgfCB1bmRlZmluZWQ7XG5cbiAgcHJpdmF0ZSBfZnJhbWVzO1xuXG4gIHByaXZhdGUgX2xpdmVzOiBudW1iZXIgPSAxMDtcblxuICBwcml2YXRlIF9zdGF0ZTogTmFyd2hhbFN0YXRlID0gJ2lkbGUnO1xuXG4gIHByaXZhdGUgX3doaXRlRmlsdGVyOiBQaGFzZXIuRmlsdGVyO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2FuaW1hdGlvbk1hY2hpbmU6IE5hcndoYWxNYWNoaW5lID0ge1xuICAgICdpZGxlJzoge1xuICAgICAgJ2F0dGFjayc6ICdhdHRhY2tpbmcnLFxuICAgICAgJ3Rha2VEYW1hZ2UnOiAndGFraW5nRGFtYWdlJ1xuICAgIH0sXG4gICAgJ2F0dGFja2luZyc6IHtcbiAgICAgICdhbmltYXRpb246YXR0YWNraW5nOmVuZCc6ICdiYWNrKCknXG4gICAgfSxcbiAgICAndGFraW5nRGFtYWdlJzoge1xuICAgICAgJ2RpZSc6ICdkeWluZycsXG4gICAgICAnZHJvcExpZmUnOiAnYWNoaW5nJ1xuICAgIH0sXG4gICAgJ2FjaGluZyc6IHtcbiAgICAgICdhbmltYXRpb246YWNoaW5nOmVuZCc6ICdyZWNvdmVyaW5nJ1xuICAgIH0sXG4gICAgJ3JlY292ZXJpbmcnOiAge1xuICAgICAgJ2F0dGFjayc6ICdhdHRhY2tpbmcnLFxuICAgICAgJ3JlYWR5JzogJ2lkbGUnXG4gICAgfSxcbiAgICAnZHlpbmcnOiB7XG4gICAgICAnYW5pbWF0aW9uOmR5aW5nOmVuZCc6ICdkZWFkJ1xuICAgIH1cbiAgfTtcblxuICBnZXQgbGl2ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xpdmVzO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZ2FtZSwgeCwgeSkge1xuICAgIHN1cGVyKGdhbWUsIHgsIHksICdjaGFyOjEnLCAnaWRsZS8wMDAxLnBuZycpO1xuICAgIHRoaXMuX2ZyYW1lcyA9IGdlbkZyYW1lcygnJywgJy5wbmcnLCA0KTtcbiAgICB0aGlzLl93aGl0ZUZpbHRlciA9IHRoaXMuZ2FtZS5hZGQuZmlsdGVyKCdXaGl0ZScpIGFzIFdoaXRlO1xuICAgIHRoaXMuX3doaXRlRmlsdGVyLmZvcmNlID0gMC43NTtcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUpO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmVuYWJsZSh0aGlzKTtcbiAgICB0aGlzLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcbiAgICB0aGlzLl9zZXR1cEFuaW1hdGlvbnMoKTtcbiAgfVxuXG4gIGF0dGFjayhicmFpbjogQnJhaW4pIHtcbiAgICB0aGlzLl90cmFuc2l0aW9uKCdhdHRhY2snLCBicmFpbik7XG4gIH1cblxuICB0YWtlRGFtYWdlKCkge1xuICAgIHRoaXMuX3RyYW5zaXRpb24oJ3Rha2VEYW1hZ2UnKTtcbiAgfVxuXG4gIG1vdmUoZGlyZWN0aW9uKSB7XG4gICAgaWYgKHRoaXMuX2Nhbk1vdmUoKSkge1xuICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSBkaXJlY3Rpb24ueCAqIFNQRUVEO1xuICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnkgPSBkaXJlY3Rpb24ueSAqIFNQRUVEO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICB0aGlzLmFuaW1hdGlvbnMucGxheSh0aGlzLl9nZXRBbmltYXRpb24oKSk7XG4gICAgaWYgKHRoaXMuX3N0YXRlID09PSAnZGVhZCcpIHtcbiAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS5zZXRUbygwLCBTSU5LSU5HX1NQRUVEKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9ibGluaygpIHtcbiAgICBpZiAodGhpcy5maWx0ZXJzKSB7XG4gICAgICB0aGlzLmZpbHRlcnMgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5maWx0ZXJzID0gW3RoaXMuX3doaXRlRmlsdGVyXTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jYW4oYWN0aW9uOiBOYXJ3aGFsQWN0aW9uKSB7XG4gICAgY29uc3QgdHJhbnNpdGlvbnMgPSB0aGlzLl9hbmltYXRpb25NYWNoaW5lW3RoaXMuX3N0YXRlXSB8fCB7fTtcbiAgICByZXR1cm4gYWN0aW9uIGluIHRyYW5zaXRpb25zO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2FuTW92ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fc3RhdGUgIT09ICdkeWluZycgJiYgdGhpcy5fc3RhdGUgIT09ICdkZWFkJztcbiAgfVxuXG4gIHByaXZhdGUgX2NsZWFyQmxpbmsoKSB7XG4gICAgdGhpcy5maWx0ZXJzID0gdW5kZWZpbmVkO1xuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fYmxpbmtpbmcpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0QW5pbWF0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9zdGF0ZTtcbiAgfVxuXG4gIHByaXZhdGUgX29uQ29tcGxldGVBbmltYXRpb24oXywgYW5pbWF0aW9uOiBQaGFzZXIuQW5pbWF0aW9uKSB7XG4gICAgdGhpcy5fdHJhbnNpdGlvbihgYW5pbWF0aW9uOiR7YW5pbWF0aW9uLm5hbWV9OmVuZGAgYXMgTmFyd2hhbEFjdGlvbik7XG4gIH1cblxuICBwcml2YXRlIG9uZW50ZXJhdHRhY2tpbmcoYnJhaW4pIHtcbiAgICBicmFpbi5idXJzdCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbmVudGVyaWRsZSgpIHtcbiAgICB0aGlzLl9jbGVhckJsaW5rKCk7XG4gIH1cblxuICBwcml2YXRlIG9uZW50ZXJkZWFkKCkge1xuICAgIHRoaXMuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSBmYWxzZTtcbiAgICB0aGlzLmNoZWNrV29ybGRCb3VuZHMgPSB0cnVlO1xuICAgIHRoaXMub25EaWUuZGlzcGF0Y2goKTtcbiAgfVxuXG4gIHByaXZhdGUgb25lbnRlcmR5aW5nKCkge1xuICAgIHRoaXMuYm9keS52ZWxvY2l0eS5zZXRUbygwLCAwKTtcbiAgICB0aGlzLm9uRHJvcExpZmUuZGlzcGF0Y2goKTtcbiAgfVxuXG4gIHByaXZhdGUgb25lbnRlcmFjaGluZygpIHtcbiAgICB0aGlzLl9saXZlcy0tO1xuICAgIHRoaXMub25Ecm9wTGlmZS5kaXNwYXRjaCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbmV4aXRhY2hpbmcoKSB7XG4gICAgdGhpcy5fYmxpbmtpbmcgPSBzZXRJbnRlcnZhbCgoKSA9PiB0aGlzLl9ibGluaygpLCAxNTApO1xuICB9XG5cbiAgcHJpdmF0ZSBvbmVudGVycmVjb3ZlcmluZygpIHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuX3RyYW5zaXRpb24oJ3JlYWR5JyksIFJFQ09WRVJJTkdfVElNRSk7XG4gIH1cblxuICBwcml2YXRlIG9uZW50ZXJ0YWtpbmdEYW1hZ2UoKSB7XG4gICAgdGhpcy5fdHJhbnNpdGlvbih0aGlzLl9saXZlcyA9PT0gMSA/ICdkaWUnIDogJ2Ryb3BMaWZlJyk7XG4gIH1cblxuICBwcml2YXRlIF90cmFuc2l0aW9uKGFjdGlvbjogTmFyd2hhbEFjdGlvbiwgLi4uYXJncykge1xuICAgIGNvbnN0IHRyYW5zaXRpb25zID0gdGhpcy5fYW5pbWF0aW9uTWFjaGluZVt0aGlzLl9zdGF0ZV07XG4gICAgaWYgKHRyYW5zaXRpb25zKSB7XG4gICAgICBpZiAoYWN0aW9uIGluIHRyYW5zaXRpb25zKSB7XG4gICAgICAgIGNvbnN0IG5ld1N0YXRlID1cbiAgICAgICAgICAodHJhbnNpdGlvbnNbYWN0aW9uXSA9PT0gJ2JhY2soKScgP1xuICAgICAgICAgICB0aGlzLl9mb3JtZXJTdGF0ZSA6IHRyYW5zaXRpb25zW2FjdGlvbl0pIGFzIE5hcndoYWxTdGF0ZTtcbiAgICAgICAgaWYgKHRoaXMuX3N0YXRlICE9PSBuZXdTdGF0ZSkge1xuICAgICAgICAgIHRoaXMuX2Zvcm1lclN0YXRlID0gdGhpcy5fc3RhdGU7XG4gICAgICAgICAgdGhpcy5fc3RhdGUgPSBuZXdTdGF0ZTtcbiAgICAgICAgICBjb25zdCBleGl0TmFtZSA9IGBvbmV4aXQke3RoaXMuX2Zvcm1lclN0YXRlfWA7XG4gICAgICAgICAgdGhpc1tleGl0TmFtZV0gJiYgdGhpc1tleGl0TmFtZV0oLi4uYXJncyk7XG4gICAgICAgICAgY29uc3QgZW50ZXJOYW1lID0gYG9uZW50ZXIke25ld1N0YXRlfWA7XG4gICAgICAgICAgdGhpc1tlbnRlck5hbWVdICYmIHRoaXNbZW50ZXJOYW1lXSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3NldHVwQW5pbWF0aW9ucygpIHtcbiAgICB0aGlzLmFuaW1hdGlvbnMuYWRkKFxuICAgICAgJ2lkbGUnLFxuICAgICAgdGhpcy5fZnJhbWVzKCdpZGxlJywgWzEsIDVdLCBbNCwgMl0pLCAxMCxcbiAgICAgIHRydWUsIGZhbHNlXG4gICAgKS5vbkNvbXBsZXRlLmFkZCh0aGlzLl9vbkNvbXBsZXRlQW5pbWF0aW9uLCB0aGlzKTtcblxuICAgIHRoaXMuYW5pbWF0aW9ucy5hZGQoXG4gICAgICAnYXR0YWNraW5nJyxcbiAgICAgIHRoaXMuX2ZyYW1lcygnYXR0YWNrJywgWzEsIDZdLCBbNl0sIFs2XSwgWzZdKSwgMjVcbiAgICApLm9uQ29tcGxldGUuYWRkKHRoaXMuX29uQ29tcGxldGVBbmltYXRpb24sIHRoaXMpO1xuXG4gICAgdGhpcy5hbmltYXRpb25zLmFkZChcbiAgICAgICdkeWluZycsXG4gICAgICB0aGlzLl9mcmFtZXMoJ2RlYXRoJywgWzEsIDldKSwgMTBcbiAgICApLm9uQ29tcGxldGUuYWRkKHRoaXMuX29uQ29tcGxldGVBbmltYXRpb24sIHRoaXMpO1xuXG4gICAgdGhpcy5hbmltYXRpb25zLmFkZChcbiAgICAgICdyZWNvdmVyaW5nJyxcbiAgICAgIHRoaXMuX2ZyYW1lcygncmVjb3ZlcmluZycsIFsxLCAzXSksIDEwXG4gICAgKS5vbkNvbXBsZXRlLmFkZCh0aGlzLl9vbkNvbXBsZXRlQW5pbWF0aW9uLCB0aGlzKTtcblxuICAgIHRoaXMuYW5pbWF0aW9ucy5hZGQoXG4gICAgICAnYWNoaW5nJyxcbiAgICAgIHRoaXMuX2ZyYW1lcygnZGFtYWdlJywgWzEsIDNdLCBbMywgMV0pLCAxMFxuICAgICkub25Db21wbGV0ZS5hZGQodGhpcy5fb25Db21wbGV0ZUFuaW1hdGlvbiwgdGhpcyk7XG5cbiAgICB0aGlzLmFuaW1hdGlvbnMuYWRkKFxuICAgICAgJ2RlYWQnLFxuICAgICAgdGhpcy5fZnJhbWVzKCdkZWF0aCcsIFs5XSksIDFcbiAgICApLm9uQ29tcGxldGUuYWRkKHRoaXMuX29uQ29tcGxldGVBbmltYXRpb24sIHRoaXMpO1xuICB9XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9+L3NvdXJjZS1tYXAtbG9hZGVyIS4vc3JjL3RzL05hcndoYWwudHMiLCJpbXBvcnQgRW52aXJvbm1lbnQgZnJvbSAnLi9FbnZpcm9ubWVudCc7XG5pbXBvcnQgT2NlYW4gZnJvbSAnLi9PY2Vhbic7XG5cbmV4cG9ydCB7IEVudmlyb25tZW50LCBPY2VhbiB9O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdHMvZW52aXJvbm1lbnRzL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IEVuZW15LCBBbGllbiwgQnJhaW4gfSBmcm9tICcuL2VuZW1pZXMnO1xuXG5jb25zdCBERUdfOTAgPSBNYXRoLlBJIC8gMjtcbmNvbnN0IERFR18xODAgPSBNYXRoLlBJO1xuY29uc3QgREVHXzM2MCA9IDIgKiBNYXRoLlBJO1xuXG50eXBlIFB1bHNlID0geyBhbXBsaXR1ZGU6IG51bWJlciwgZnJlcXVlbmN5OiBudW1iZXIgfTtcblxudHlwZSBQYXRoID0ge1xuICB4OiBBcnJheTxudW1iZXI+LCB5OiBBcnJheTxudW1iZXI+LFxuICBzdGFydFRpbWU6IG51bWJlciwgZHVyYXRpb246IG51bWJlclxufTtcblxuYWJzdHJhY3QgY2xhc3MgUmFkaWFsRm9ybWF0aW9uIGV4dGVuZHMgUGhhc2VyLkdyb3VwIHtcblxuICBhYnN0cmFjdCBsb2NhdGlvbnM6IEFycmF5PFBoYXNlci5Qb2ludD47XG5cbiAgcGF1c2VkOiBib29sZWFuO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2JyYWluczogQXJyYXk8QnJhaW4+ID0gW107XG5cbiAgcHJpdmF0ZSBfcm90YXRpb246IG51bWJlciA9IDA7XG5cbiAgcHJpdmF0ZSBfcGF0aDogUGF0aCA9IHtcbiAgICB4OiBbXSwgeTogW10sXG4gICAgc3RhcnRUaW1lOiAtSW5maW5pdHksIGR1cmF0aW9uOiBJbmZpbml0eVxuICB9O1xuXG4gIHByaXZhdGUgX3BoeXNpY3NUaW1lVG90YWw6IG51bWJlciA9IDA7XG5cbiAgcHJpdmF0ZSBfcHVsc2U6IFB1bHNlID0geyBhbXBsaXR1ZGU6IDAsIGZyZXF1ZW5jeTogMCB9O1xuXG4gIG9uRGVzdHJveWVkQnlDaGFyYWN0ZXIgPSBuZXcgUGhhc2VyLlNpZ25hbCgpO1xuXG4gIGNvbnN0cnVjdG9yKGdhbWU6IFBoYXNlci5HYW1lKSB7XG4gICAgc3VwZXIoZ2FtZSk7XG4gIH1cblxuICBpbml0KGFsaWVuczogQXJyYXk8QWxpZW4+LCBicmFpbnM6IEFycmF5PEJyYWluPiwgYnJhaW5Qb3NpdGlvbnM6IEFycmF5PG51bWJlcj4pIHtcbiAgICBhbGllbnMuZm9yRWFjaChhbGllbiA9PiB0aGlzLmdhbWUucGh5c2ljcy5lbmFibGUoYWxpZW4pKTtcbiAgICBicmFpbnMuZm9yRWFjaChicmFpbiA9PiB7XG4gICAgICBicmFpbi5vbkJ1cnN0LmFkZE9uY2UodGhpcy5fdHJ5VG9EZXN0cm95LCB0aGlzKTtcbiAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmVuYWJsZShicmFpbik7XG4gICAgICB0aGlzLl9icmFpbnMucHVzaChicmFpbik7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9wbGFjZShhbGllbnMsIGJyYWlucywgYnJhaW5Qb3NpdGlvbnMpO1xuICB9XG5cbiAgZW5hYmxlUm90YXRpb24oc3BlZWQpIHtcbiAgICB0aGlzLl9yb3RhdGlvbiA9IHNwZWVkO1xuICB9XG5cbiAgZGlzYWJsZVJvdGF0aW9uKCkge1xuICAgIHRoaXMuZW5hYmxlUm90YXRpb24oMCk7XG4gIH1cblxuICBlbmFibGVQdWxzZShhbXBsaXR1ZGUsIHNwZWVkKSB7XG4gICAgdGhpcy5fcHVsc2UuYW1wbGl0dWRlID0gYW1wbGl0dWRlO1xuICAgIHRoaXMuX3B1bHNlLmZyZXF1ZW5jeSA9IHNwZWVkO1xuICB9XG5cbiAgZGlzYWJsZVB1bHNlKCkge1xuICAgIHRoaXMuZW5hYmxlUHVsc2UoMCwgMCk7XG4gIH1cblxuICBlbmFibGVNb3ZlbWVudChwYXRoOiBBcnJheTxQSVhJLlBvaW50PiwgdGltZSkge1xuICAgIHRoaXMuX3BhdGgueCA9IHBhdGgubWFwKHBvaW50ID0+IHBvaW50LngpO1xuICAgIHRoaXMuX3BhdGgueSA9IHBhdGgubWFwKHBvaW50ID0+IHBvaW50LnkpO1xuICAgIHRoaXMuX3BhdGguc3RhcnRUaW1lID0gdGhpcy5fcGh5c2ljc1RpbWVUb3RhbDtcbiAgICB0aGlzLl9wYXRoLmR1cmF0aW9uID0gdGltZTtcbiAgfVxuXG4gIGRpc2FibGVkTW92ZW1lbnQoKSB7XG4gICAgdGhpcy5lbmFibGVNb3ZlbWVudChbXSwgMCk7XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgaWYgKCF0aGlzLnBhdXNlZCkge1xuICAgICAgY29uc3QgZHQgPSB0aGlzLmdhbWUudGltZS5waHlzaWNzRWxhcHNlZDtcbiAgICAgIGNvbnN0IHQgPSB0aGlzLl9waHlzaWNzVGltZVRvdGFsICs9IGR0O1xuICAgICAgdGhpcy5fcm90YXRlKHQsIGR0KTtcbiAgICAgIHRoaXMuX3B1bHNhdGUodCwgZHQpO1xuICAgICAgdGhpcy5fbW92ZSh0LCBkdCk7XG4gICAgICB0aGlzLl9jaGVja091dE9mU2NyZWVuKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY2hlY2tPdXRPZlNjcmVlbigpIHtcbiAgICBjb25zdCB7IHgsIHksIHdpZHRoLCBoZWlnaHQgfSA9IHRoaXMuZ2V0Qm91bmRzKCk7XG4gICAgY29uc3QgZm9ybWF0aW9uQm91bmRzID0gbmV3IFBoYXNlci5SZWN0YW5nbGUoeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gICAgY29uc3QgY2FtZXJhVmlldyA9IHRoaXMuZ2FtZS5jYW1lcmEudmlldztcbiAgICBjb25zdCBpc091dHNpZGUgPVxuICAgICAgIVBoYXNlci5SZWN0YW5nbGUuaW50ZXJzZWN0cyhmb3JtYXRpb25Cb3VuZHMsIGNhbWVyYVZpZXcpO1xuICAgIGlmIChpc091dHNpZGUpIHtcbiAgICAgIHRoaXMuX2Rlc3Ryb3lJbW1lZGlhdGVseSgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2Rlc3Ryb3lBbmltYXRlZCgpIHtcbiAgICB0aGlzLl9kZXN0cm95U2hhcGUoKS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMub25EZXN0cm95ZWRCeUNoYXJhY3Rlci5kaXNwYXRjaCh0aGlzLmxvY2F0aW9ucy5sZW5ndGgpO1xuICAgICAgdGhpcy5kZXN0cm95KGZhbHNlKVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZGVzdHJveUltbWVkaWF0ZWx5KCkge1xuICAgIHRoaXMuY2FsbEFsbCgna2lsbCcsIG51bGwpO1xuICAgIHRoaXMuZGVzdHJveShmYWxzZSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX2Rlc3Ryb3lTaGFwZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oZnVsZmlsID0+IHtcbiAgICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBjb25zdCBlbmVteSA9IHRoaXMuY2hpbGRyZW5baW5kZXhdIGFzIEVuZW15O1xuICAgICAgICAgIGlmIChlbmVteSkge1xuICAgICAgICAgICAgZW5lbXkua2lsbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaW5kZXggPT09IGxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGZ1bGZpbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgaW5kZXggKiA1MCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9tb3ZlKHQ6IG51bWJlciwgZHQ6IG51bWJlcikge1xuICAgIGNvbnN0IHBlcmNlbnRhZ2UgPSAodCAtIHRoaXMuX3BhdGguc3RhcnRUaW1lKSAvIHRoaXMuX3BhdGguZHVyYXRpb247XG4gICAgdGhpcy54ID0gdGhpcy5nYW1lLm1hdGguYmV6aWVySW50ZXJwb2xhdGlvbih0aGlzLl9wYXRoLngsIHBlcmNlbnRhZ2UpO1xuICAgIHRoaXMueSA9IHRoaXMuZ2FtZS5tYXRoLmJlemllckludGVycG9sYXRpb24odGhpcy5fcGF0aC55LCBwZXJjZW50YWdlKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BsYWNlKGFsaWVuczogQXJyYXk8QWxpZW4+LCBicmFpbnM6IEFycmF5PEJyYWluPiwgYnJhaW5Qb3NpdGlvbnM6IEFycmF5PG51bWJlcj4pIHtcbiAgICB0aGlzLmxvY2F0aW9ucy5mb3JFYWNoKCh7IHgsIHkgfSwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IGlzQnJhaW5QbGFjZSA9IGJyYWluUG9zaXRpb25zLmluZGV4T2YoaW5kZXgpID49IDA7XG4gICAgICBjb25zdCBlbmVteSA9IGlzQnJhaW5QbGFjZSA/IGJyYWlucy5wb3AoKSA6IGFsaWVucy5wb3AoKTtcbiAgICAgIGlmIChlbmVteSkge1xuICAgICAgICBlbmVteS5wbGFjZSh0aGlzLCB4LCB5KTtcbiAgICAgICAgZW5lbXkucm90YXRpb24gPSBNYXRoLmF0YW4oeSAvIHgpICsgREVHXzkwICsgKHggPCAwID8gREVHXzE4MCA6IDApO1xuICAgICAgICB0aGlzLmFkZENoaWxkKGVuZW15KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX3B1bHNhdGUodDogbnVtYmVyLCBkdDogbnVtYmVyKSB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuIGFzIEFycmF5PEVuZW15PjtcbiAgICBjb25zdCB7IGFtcGxpdHVkZSwgZnJlcXVlbmN5IH0gPSB0aGlzLl9wdWxzZTtcbiAgICBjaGlsZHJlbi5mb3JFYWNoKGVuZW15ID0+IHtcbiAgICAgIGNvbnN0IHsgcm90YXRpb24sIGRpc3RhbmNlIH0gPSBlbmVteTtcbiAgICAgIGlmIChkaXN0YW5jZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0VuZW15IGlzIG5vdCBjb3JyZWN0bHkgcGxhY2VkIGluIHRoZSBmb3JtYXRpb24uJyk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gZGlzdGFuY2UgKyBhbXBsaXR1ZGU7XG4gICAgICAgIGNvbnN0IGRpc3BsYWNlbWVudCA9XG4gICAgICAgICAgYW1wbGl0dWRlICogTWF0aC5zaW4oREVHXzM2MCAqIGZyZXF1ZW5jeSAqIHQpICsgb2Zmc2V0O1xuICAgICAgICBlbmVteS54ID0gZGlzcGxhY2VtZW50ICogTWF0aC5jb3Mocm90YXRpb24gLSBERUdfOTApO1xuICAgICAgICBlbmVteS55ID0gZGlzcGxhY2VtZW50ICogTWF0aC5zaW4ocm90YXRpb24gLSBERUdfOTApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfcm90YXRlKHQ6IG51bWJlciwgZHQ6IG51bWJlcikge1xuICAgIHRoaXMucm90YXRpb24gKz0gdGhpcy5fcm90YXRpb24gKiBkdDtcbiAgfVxuXG4gIHByaXZhdGUgX3RyeVRvRGVzdHJveShicmFpbjogQnJhaW4pIHtcbiAgICB0aGlzLnBhdXNlZCA9IHRydWU7XG4gICAgdGhpcy5fYnJhaW5zLnNwbGljZSh0aGlzLl9icmFpbnMuaW5kZXhPZihicmFpbiksIDEpWzBdLmtpbGwoKTtcbiAgICBpZiAodGhpcy5fYnJhaW5zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5fZGVzdHJveUFuaW1hdGVkKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cbn1cblxudHlwZSBEaWFtb25QYXJhbWV0ZXJzID0geyByYWRpdXM6IG51bWJlciB9O1xuY2xhc3MgRGlhbW9uZCBleHRlbmRzIFJhZGlhbEZvcm1hdGlvbiB7XG5cbiAgcHJpdmF0ZSBzdGF0aWMgZGVmYXVsdHM6IERpYW1vblBhcmFtZXRlcnMgPSB7IHJhZGl1czogMTAwIH07XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfcmFkaXVzOiBudW1iZXI7XG5cbiAgcHJpdmF0ZSBfbG9jYXRpb25zO1xuXG4gIGdldCBsb2NhdGlvbnMoKSB7XG4gICAgaWYgKCF0aGlzLl9sb2NhdGlvbnMpIHtcbiAgICAgIGNvbnN0IHJhZGl1cyA9IHRoaXMuX3JhZGl1cztcbiAgICAgIHRoaXMuX2xvY2F0aW9ucyA9IFtcbiAgICAgICAgbmV3IFBoYXNlci5Qb2ludCgwLCByYWRpdXMpLFxuICAgICAgICBuZXcgUGhhc2VyLlBvaW50KHJhZGl1cyAvIDIsIHJhZGl1cyAvIDIpLFxuICAgICAgICBuZXcgUGhhc2VyLlBvaW50KHJhZGl1cywgMCksXG4gICAgICAgIG5ldyBQaGFzZXIuUG9pbnQocmFkaXVzIC8gMiwgLXJhZGl1cyAvIDIpLFxuICAgICAgICBuZXcgUGhhc2VyLlBvaW50KDAsIC1yYWRpdXMpLFxuICAgICAgICBuZXcgUGhhc2VyLlBvaW50KC1yYWRpdXMgLyAyLCAtcmFkaXVzIC8gMiksXG4gICAgICAgIG5ldyBQaGFzZXIuUG9pbnQoLXJhZGl1cywgMCksXG4gICAgICAgIG5ldyBQaGFzZXIuUG9pbnQoLXJhZGl1cyAvIDIsIHJhZGl1cyAvIDIpXG4gICAgICBdO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fbG9jYXRpb25zO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZ2FtZTogUGhhc2VyLkdhbWUsIHsgcmFkaXVzIH0gPSBEaWFtb25kLmRlZmF1bHRzKSB7XG4gICAgc3VwZXIoZ2FtZSk7XG4gICAgdGhpcy5fcmFkaXVzID0gcmFkaXVzO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9idWlsZFNoYXBlKCkge1xuICAgIHJldHVybiB0aGlzLmxvY2F0aW9ucy5tYXAocG9pbnQgPT4ge1xuICAgICAgY29uc3QgY29udGFpbmVyID0gbmV3IFBoYXNlci5Hcm91cCh0aGlzLmdhbWUpO1xuICAgICAgY29udGFpbmVyLnBvc2l0aW9uID0gcG9pbnQ7XG4gICAgICBjb250YWluZXIucm90YXRpb24gPSBNYXRoLmF0YW4ocG9pbnQueSAvIHBvaW50LngpICtcbiAgICAgICAgREVHXzkwICsgKHBvaW50LnggPCAwID8gREVHXzE4MCA6IDApO1xuICAgICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgICB9KTtcbiAgfVxuXG59XG5cbmNsYXNzIERlbHRhIGV4dGVuZHMgUmFkaWFsRm9ybWF0aW9uIHtcblxuICBwcml2YXRlIF9sb2NhdGlvbnM7XG5cbiAgZ2V0IGxvY2F0aW9ucygpOiBBcnJheTxQaGFzZXIuUG9pbnQ+IHtcbiAgICBpZiAoIXRoaXMuX2xvY2F0aW9ucykge1xuICAgICAgY29uc3QgcmFkaXVzID0gdGhpcy5fcmFkaXVzO1xuICAgICAgdGhpcy5fbG9jYXRpb25zID0gW1xuICAgICAgICBuZXcgUGhhc2VyLlBvaW50KHJhZGl1cywgMCksXG4gICAgICAgIG5ldyBQaGFzZXIuUG9pbnQocmFkaXVzIC8gMiwgcmFkaXVzIC8gMiksXG4gICAgICAgIG5ldyBQaGFzZXIuUG9pbnQoMCwgcmFkaXVzKSxcbiAgICAgICAgbmV3IFBoYXNlci5Qb2ludCgtcmFkaXVzIC8gMiwgcmFkaXVzIC8gMiksXG4gICAgICAgIG5ldyBQaGFzZXIuUG9pbnQoLXJhZGl1cywgMCksXG4gICAgICBdO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fbG9jYXRpb25zO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgZGVmYXVsdHM6IERpYW1vblBhcmFtZXRlcnMgPSB7IHJhZGl1czogMTAwIH07XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfcmFkaXVzOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoZ2FtZTogUGhhc2VyLkdhbWUsIHsgcmFkaXVzIH0gPSBEZWx0YS5kZWZhdWx0cykge1xuICAgIHN1cGVyKGdhbWUpO1xuICAgIHRoaXMuX3JhZGl1cyA9IHJhZGl1cztcbiAgfVxuXG59XG5cbmV4cG9ydCB7IERpYW1vbmQsIERlbHRhLCBSYWRpYWxGb3JtYXRpb24sIFBhdGgsIFB1bHNlIH07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9+L3NvdXJjZS1tYXAtbG9hZGVyIS4vc3JjL3RzL0Zvcm1hdGlvbi50cyIsImltcG9ydCBFbmVteSBmcm9tICcuL0VuZW15JztcbmltcG9ydCB7IGdlbkZyYW1lcyB9IGZyb20gJy4uL3V0aWxzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWxpZW4gZXh0ZW5kcyBFbmVteSB7XG5cbiAgcHJpdmF0ZSBfZnJhbWVzO1xuXG4gIGNvbnN0cnVjdG9yKGdhbWUpIHtcbiAgICBzdXBlcihnYW1lLCAnYWxpZW4nKTtcbiAgICB0aGlzLl9mcmFtZXMgPSBnZW5GcmFtZXMoJycsICcucG5nJywgNCk7XG4gICAgdGhpcy5fc2V0dXBBbmltYXRpb25zKCk7XG4gICAgdGhpcy5hbmltYXRpb25zLnBsYXkoJ2lkbGUnKTtcbiAgfVxuXG4gIHByaXZhdGUgX29uQ29tcGxldGVBbmltYXRpb24oKSB7XG5cbiAgfVxuXG4gIHByaXZhdGUgX3NldHVwQW5pbWF0aW9ucygpIHtcbiAgICB0aGlzLmFuaW1hdGlvbnMuYWRkKFxuICAgICAgJ2lkbGUnLFxuICAgICAgdGhpcy5fZnJhbWVzKCdpZGxlJywgWzEsIDVdLCBbNCwgMl0pLCA4LFxuICAgICAgdHJ1ZSwgZmFsc2VcbiAgICApLm9uQ29tcGxldGUuYWRkKHRoaXMuX29uQ29tcGxldGVBbmltYXRpb24sIHRoaXMpO1xuICB9XG5cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL34vc291cmNlLW1hcC1sb2FkZXIhLi9zcmMvdHMvZW5lbWllcy9BbGllbi50cyIsImltcG9ydCBFbmVteSBmcm9tICcuL0VuZW15JztcbmltcG9ydCB7IGdlbkZyYW1lcyB9IGZyb20gJy4uL3V0aWxzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnJhaW4gZXh0ZW5kcyBFbmVteSB7XG5cbiAgcmVhZG9ubHkgb25CdXJzdDogUGhhc2VyLlNpZ25hbCA9IG5ldyBQaGFzZXIuU2lnbmFsKCk7XG5cbiAgcHJpdmF0ZSBfZnJhbWVzO1xuXG4gIGNvbnN0cnVjdG9yKGdhbWUpIHtcbiAgICBzdXBlcihnYW1lLCAnYnJhaW4nKTtcbiAgICB0aGlzLl9mcmFtZXMgPSBnZW5GcmFtZXMoJycsICcucG5nJywgNCk7XG4gICAgdGhpcy5fc2V0dXBBbmltYXRpb25zKCk7XG4gICAgdGhpcy5hbmltYXRpb25zLnBsYXkoJ2lkbGUnKTtcbiAgfVxuXG4gIGJ1cnN0KCkge1xuICAgIHRoaXMub25CdXJzdC5kaXNwYXRjaCh0aGlzKTtcbiAgfVxuXG4gIHByaXZhdGUgX29uQ29tcGxldGVBbmltYXRpb24oKSB7XG5cbiAgfVxuXG4gIHByaXZhdGUgX3NldHVwQW5pbWF0aW9ucygpIHtcbiAgICB0aGlzLmFuaW1hdGlvbnMuYWRkKFxuICAgICAgJ2lkbGUnLFxuICAgICAgdGhpcy5fZnJhbWVzKCdpZGxlJywgWzEsIDVdLCBbNCwgMl0pLCA3LFxuICAgICAgdHJ1ZSwgZmFsc2VcbiAgICApLm9uQ29tcGxldGUuYWRkKHRoaXMuX29uQ29tcGxldGVBbmltYXRpb24sIHRoaXMpO1xuICB9XG5cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL34vc291cmNlLW1hcC1sb2FkZXIhLi9zcmMvdHMvZW5lbWllcy9CcmFpbi50cyIsImltcG9ydCBFbnZpcm9ubWVudCBmcm9tICcuL0Vudmlyb25tZW50JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT2NlYW4gZXh0ZW5kcyBFbnZpcm9ubWVudCB7XG5cbiAgcHJpdmF0ZSBfcGh5c2ljc1RpbWVUb3RhbDogbnVtYmVyID0gMDtcblxuICBwcml2YXRlIF9meFN0YXRlcztcblxuICBjb25zdHJ1Y3RvcihnYW1lOiBQaGFzZXIuR2FtZSkge1xuICAgIHN1cGVyKGdhbWUpO1xuICB9XG5cbiAgaW5pdCh7IGZ4LCBzcGVlZHMgfTogeyBmeDogbnVtYmVyLCBzcGVlZHM6IEFycmF5PG51bWJlcj4gfSwgbGF5ZXI6IFBoYXNlci5Hcm91cCkge1xuICAgIHN1cGVyLmluaXQoe30sIGxheWVyKTtcbiAgICBjb25zdCBiZyA9IHRoaXMuX2xheWVyLmNoaWxkcmVuWzBdIGFzIFBoYXNlci5JbWFnZTtcbiAgICB0aGlzLl9meFN0YXRlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IGZ4OyBpKyspIHtcbiAgICAgIGNvbnN0IGZ4ID0gdGhpcy5fbGF5ZXIuY3JlYXRlKDAsIDAsIGBiZzpmeDoke2l9YCkgYXMgUGhhc2VyLkltYWdlO1xuICAgICAgY29uc3Qgd2lkdGhEaWZmZXJlbmNlID0gZngud2lkdGggLSBiZy53aWR0aDtcbiAgICAgIGNvbnN0IG9mZnNldFggPSB3aWR0aERpZmZlcmVuY2UgLyAyO1xuICAgICAgZngucG9zaXRpb24ueCA9IC1vZmZzZXRYO1xuICAgICAgY29uc3Qgc3BlZWQgPSBzcGVlZHNbaSAtIDFdO1xuICAgICAgY29uc3QgbGltaXRzID0gWy13aWR0aERpZmZlcmVuY2UsIDBdO1xuICAgICAgY29uc3QgZGlyZWN0aW9uID0gLTE7XG4gICAgICB0aGlzLl9meFN0YXRlcy5wdXNoKHsgbGF5ZXI6IGZ4LCBzcGVlZCwgbGltaXRzLCBkaXJlY3Rpb24gfSk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIGNvbnN0IGR0ID0gdGhpcy5fZ2FtZS50aW1lLnBoeXNpY3NFbGFwc2VkO1xuICAgIHRoaXMuX3BoeXNpY3NUaW1lVG90YWwgKz0gZHQ7XG4gICAgdGhpcy5fZnhTdGF0ZXMuZm9yRWFjaChzdGF0ZSA9PiB7XG4gICAgICBjb25zdCB7IGxheWVyLCBzcGVlZCwgbGltaXRzLCBkaXJlY3Rpb24gfSA9IHN0YXRlO1xuICAgICAgY29uc3QgZHYgPSBkaXJlY3Rpb24gKiBzcGVlZCAqIGR0O1xuICAgICAgY29uc3QgY3VycmVudFBvc2l0aW9uID0gbGF5ZXIucG9zaXRpb24ueCArPSBkdjtcbiAgICAgIGlmIChjdXJyZW50UG9zaXRpb24gPD0gbGltaXRzWzBdIHx8IGN1cnJlbnRQb3NpdGlvbiA+PSBsaW1pdHNbMV0pIHtcbiAgICAgICAgc3RhdGUuZGlyZWN0aW9uID0gLXN0YXRlLmRpcmVjdGlvbjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9+L3NvdXJjZS1tYXAtbG9hZGVyIS4vc3JjL3RzL2Vudmlyb25tZW50cy9PY2Vhbi50cyIsImltcG9ydCBOYXJ3aGFsIGZyb20gJy4vTmFyd2hhbCc7XG5pbXBvcnQgeyBBbGllbiwgQnJhaW4gfSBmcm9tICcuL2VuZW1pZXMnO1xuaW1wb3J0IEZvcm1hdGlvbk1hbmFnZXIgZnJvbSAnLi9Gb3JtYXRpb25NYW5hZ2VyJztcbmltcG9ydCB7IFNwYWNlTmFyd2hhbExvYWRlciB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgT2NlYW4gfSBmcm9tICcuL2Vudmlyb25tZW50cyc7XG4vLyBpbXBvcnQgeyBXaGl0ZSB9IGZyb20gJy4vc2hhZGVycyc7XG5cbmNsYXNzIExldmVsIGV4dGVuZHMgUGhhc2VyLlN0YXRlIHtcblxuICBwcml2YXRlIF9lbnZpcm9ubWVudDogT2NlYW47XG5cbiAgcHJpdmF0ZSBfbmFyd2hhbDogTmFyd2hhbDtcblxuICBwcml2YXRlIF9mb3JtYXRpb25NYW5hZ2VyOiBGb3JtYXRpb25NYW5hZ2VyO1xuXG4gIHByaXZhdGUgX2tleXM6IHsgW2s6IHN0cmluZ106IFBoYXNlci5LZXkgfTtcblxuICBwcml2YXRlIF9zY29yZTogUGhhc2VyLlRleHQ7XG5cbiAgaW5pdCgpIHtcbiAgICAvLyBQaGFzZXIuRmlsdGVyLldoaXRlID0gV2hpdGU7XG4gICAgdGhpcy5nYW1lLmxvYWQgPSBuZXcgU3BhY2VOYXJ3aGFsTG9hZGVyKHRoaXMuZ2FtZSk7XG4gICAgdGhpcy5fa2V5cyA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXlzKHtcbiAgICAgIGxlZnQ6IFBoYXNlci5LZXlDb2RlLkxFRlQsXG4gICAgICByaWdodDogUGhhc2VyLktleUNvZGUuUklHSFQsXG4gICAgICB1cDogUGhhc2VyLktleUNvZGUuVVAsXG4gICAgICBkb3duOiBQaGFzZXIuS2V5Q29kZS5ET1dOXG4gICAgfSk7XG4gICAgdGhpcy5fZm9ybWF0aW9uTWFuYWdlciA9IG5ldyBGb3JtYXRpb25NYW5hZ2VyKHRoaXMuZ2FtZSk7XG4gICAgdGhpcy5fZW52aXJvbm1lbnQgPSBuZXcgT2NlYW4odGhpcy5nYW1lKTtcbiAgfVxuXG4gIHByZWxvYWQoKSB7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXRsYXNKU09OSGFzaChcbiAgICAgICdjaGFyOjEnLFxuICAgICAgJ2Fzc2V0cy9hbmltYXRpb25zL2NoYXItMDEucG5nJywgJ2Fzc2V0cy9hbmltYXRpb25zL2NoYXItMDEuanNvbidcbiAgICApO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzSlNPTkhhc2goXG4gICAgICAnYWxpZW4nLFxuICAgICAgJ2Fzc2V0cy9hbmltYXRpb25zL2VuZW15LTAxLnBuZycsICdhc3NldHMvYW5pbWF0aW9ucy9lbmVteS0wMS5qc29uJ1xuICAgICk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXRsYXNKU09OSGFzaChcbiAgICAgICdicmFpbicsXG4gICAgICAnYXNzZXRzL2FuaW1hdGlvbnMvYnJhaW4tMDEucG5nJywgJ2Fzc2V0cy9hbmltYXRpb25zL2JyYWluLTAxLmpzb24nXG4gICAgKTtcbiAgICB0aGlzLmdhbWUubG9hZC5qc29uKCdsZXZlbCcsICdsZXZlbHMvTDAxMDEuanNvbicpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLndlYmZvbnQoJ3Njb3JlLWZvbnQnLCAnUmV2YWxpYScpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmltYWdlKCdiZzpiYWNrZ3JvdW5kJywgJ2Fzc2V0cy9iYWNrLTAxLnBuZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmltYWdlKCdiZzpmeDoxJywgJ2Fzc2V0cy9iYWNrLWZ4LWJhY2sucG5nJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoJ2JnOmZ4OjInLCAnYXNzZXRzL2JhY2stZngtZnJvbnQucG5nJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoJ25hcndoYWwnLCAnYXNzZXRzL2NoYXItMDEucG5nJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoJ2h1ZDpoZWFydCcsICdhc3NldHMvaHVkLWxpZmUucG5nJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoJ2h1ZDplbmVteScsICdhc3NldHMvaHVkLWVuZW15LnBuZycpO1xuICB9XG5cbiAgY3JlYXRlKCkge1xuICAgIGNvbnN0IGJnTGF5ZXIgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgY29uc3QgZW5lbXlMYXllciA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICBjb25zdCBjaGFyYWN0ZXJMYXllciA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICBjb25zdCBodWRMYXllciA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICB0aGlzLl9pbml0RW52aXJvbm1lbnQoYmdMYXllcik7XG4gICAgdGhpcy5fc3Bhd25OYXJ3aGFsKGNoYXJhY3RlckxheWVyKTtcbiAgICB0aGlzLl9pbml0Rm9ybWF0aW9ucyhlbmVteUxheWVyKTtcbiAgICB0aGlzLl9jcmVhdGVIdWQoaHVkTGF5ZXIpO1xuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIHRoaXMuX2Zvcm1hdGlvbk1hbmFnZXIudXBkYXRlKCk7XG4gICAgdGhpcy5fZW52aXJvbm1lbnQudXBkYXRlKCk7XG4gICAgdGhpcy5faGFuZGxlSW5wdXQoKTtcbiAgICB0aGlzLl9oYW5kbGVDb2xsaXNpb25zKCk7XG4gICAgdGhpcy5fdXBkYXRlSHVkKCk7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVIdWQoaHVkTGF5ZXI6IFBoYXNlci5Hcm91cCkge1xuICAgIC8vIExpdmVzXG4gICAgY29uc3QgaGVhcnRzID0gbmV3IFBoYXNlci5Hcm91cCh0aGlzLmdhbWUpO1xuICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5fbmFyd2hhbC5saXZlczsgaSA8IGw7IGkrKykge1xuICAgICAgY29uc3QgaGVhcnQgPVxuICAgICAgICBuZXcgUGhhc2VyLkltYWdlKHRoaXMuZ2FtZSwgMCwgLTUyIC0gKGkgKiA2MCksICdodWQ6aGVhcnQnKTtcbiAgICAgIGhlYXJ0cy5hZGRDaGlsZChoZWFydCk7XG4gICAgfVxuICAgIGhlYXJ0cy5wb3NpdGlvbi5zZXRUbygyMCwgMTA0NSk7XG4gICAgaHVkTGF5ZXIuYWRkQ2hpbGQoaGVhcnRzKTtcbiAgICB0aGlzLl9uYXJ3aGFsLm9uRHJvcExpZmUuYWRkKCgpID0+IHtcbiAgICAgIGhlYXJ0cy5yZW1vdmVDaGlsZEF0KGhlYXJ0cy5sZW5ndGggLSAxKTtcbiAgICB9KTtcblxuICAgIC8vIFNjb3JlXG4gICAgY29uc3Qgc2NvcmUgPSBuZXcgUGhhc2VyLkdyb3VwKHRoaXMuZ2FtZSk7XG4gICAgY29uc3QgZW5lbXlJbmRpY2F0b3IgPSBuZXcgUGhhc2VyLkltYWdlKHRoaXMuZ2FtZSwgMCwgMCwgJ2h1ZDplbmVteScpO1xuICAgIHRoaXMuX3Njb3JlID0gbmV3IFBoYXNlci5UZXh0KHRoaXMuZ2FtZSwgNDUsIDAsICd4MDAwMCcsIHtcbiAgICAgIGZvbnQ6ICdSZXZhbGlhJyxcbiAgICAgIGZvbnRTaXplOiAnMzhweCcsXG4gICAgICBmaWxsOiAnd2hpdGUnXG4gICAgfSk7XG4gICAgdGhpcy5fc2NvcmUuc2V0U2hhZG93KDEsIDEsICdibGFjaycsIDUpO1xuICAgIHNjb3JlLmFkZENoaWxkKGVuZW15SW5kaWNhdG9yKTtcbiAgICBzY29yZS5hZGRDaGlsZCh0aGlzLl9zY29yZSk7XG4gICAgc2NvcmUudXBkYXRlVHJhbnNmb3JtKCk7XG4gICAgc2NvcmUucG9zaXRpb24uc2V0VG8oMTUsIDE1KTtcbiAgICBodWRMYXllci5hZGRDaGlsZChzY29yZSk7XG4gIH1cblxuXG4gIHByaXZhdGUgX2luaXRFbnZpcm9ubWVudChsYXllcjogUGhhc2VyLkdyb3VwKSB7XG4gICAgdGhpcy5fZW52aXJvbm1lbnQuaW5pdCh7IGZ4OiAyLCBzcGVlZHM6IFsxMCwgMjBdIH0sIGxheWVyKTtcbiAgfVxuXG4gIHByaXZhdGUgX2luaXRGb3JtYXRpb25zKGxheWVyOiBQaGFzZXIuR3JvdXApIHtcbiAgICB2YXIgbGV2ZWxEYXRhID0gdGhpcy5nYW1lLmNhY2hlLmdldEpTT04oJ2xldmVsJyk7XG4gICAgdGhpcy5fZm9ybWF0aW9uTWFuYWdlci5pbml0KGxldmVsRGF0YS5mb3JtYXRpb25zLCBsYXllcik7XG4gIH1cblxuICBwcml2YXRlIF9oYW5kbGVJbnB1dCgpIHtcbiAgICBjb25zdCBkaXJlY3Rpb24gPSB7IHg6IDAsIHk6IDAgfTtcbiAgICBpZiAodGhpcy5fa2V5cy5sZWZ0LmlzRG93bikge1xuICAgICAgZGlyZWN0aW9uLnggPSAtMTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2tleXMucmlnaHQuaXNEb3duKSB7XG4gICAgICBkaXJlY3Rpb24ueCA9IDE7XG4gICAgfVxuICAgIGlmICh0aGlzLl9rZXlzLnVwLmlzRG93bikge1xuICAgICAgZGlyZWN0aW9uLnkgPSAtMTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2tleXMuZG93bi5pc0Rvd24pIHtcbiAgICAgIGRpcmVjdGlvbi55ID0gMTtcbiAgICB9XG4gICAgdGhpcy5fbmFyd2hhbC5tb3ZlKGRpcmVjdGlvbik7XG4gIH1cblxuICBwcml2YXRlIF9oYW5kbGVDb2xsaXNpb25zKCkge1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKFxuICAgICAgdGhpcy5fbmFyd2hhbCwgdGhpcy5fZm9ybWF0aW9uTWFuYWdlci5icmFpbnMsXG4gICAgICB0aGlzLl9vbk5hcndoYWxWc0JyYWluLFxuICAgICAgdW5kZWZpbmVkLCB0aGlzXG4gICAgKTtcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcChcbiAgICAgIHRoaXMuX25hcndoYWwsIHRoaXMuX2Zvcm1hdGlvbk1hbmFnZXIuYWxpZW5zLFxuICAgICAgdGhpcy5fb25OYXJ3aGFsVnNBbGllbixcbiAgICAgIHVuZGVmaW5lZCwgdGhpc1xuICAgICk7XG4gIH1cblxuICBwcml2YXRlIF9vbk5hcndoYWxWc0FsaWVuKG5hcndoYWw6IE5hcndoYWwsIGFsaWVuOiBBbGllbikge1xuICAgIG5hcndoYWwudGFrZURhbWFnZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfb25OYXJ3aGFsVnNCcmFpbihuYXJ3aGFsOiBOYXJ3aGFsLCBicmFpbjogQnJhaW4pIHtcbiAgICBuYXJ3aGFsLmF0dGFjayhicmFpbik7XG4gIH1cblxuICBwcml2YXRlIF9zcGF3bk5hcndoYWwobGF5ZXI6IFBoYXNlci5Hcm91cCkge1xuICAgIHRoaXMuX25hcndoYWwgPSBuZXcgTmFyd2hhbChcbiAgICAgIHRoaXMuZ2FtZSxcbiAgICAgIHRoaXMuZ2FtZS53b3JsZC5jZW50ZXJYLFxuICAgICAgdGhpcy5nYW1lLndvcmxkLmNlbnRlcllcbiAgICApO1xuICAgIGxheWVyLmFkZENoaWxkKHRoaXMuX25hcndoYWwpO1xuICAgIHRoaXMuX25hcndoYWwuZXZlbnRzLm9uT3V0T2ZCb3VuZHMuYWRkT25jZSgoKSA9PiB7XG4gICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQodGhpcy5nYW1lLnN0YXRlLmN1cnJlbnQpO1xuICAgIH0pO1xuICAgIHRoaXMuX25hcndoYWwub25EaWUuYWRkT25jZSgoKSA9PiB7XG4gICAgICB0aGlzLmdhbWUuY2FtZXJhLm9uRmFkZUNvbXBsZXRlLmFkZE9uY2UoKCkgPT4ge1xuICAgICAgICB0aGlzLmdhbWUuY2FtZXJhLnJlc2V0RlgoKTtcbiAgICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KHRoaXMuZ2FtZS5zdGF0ZS5jdXJyZW50KTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5nYW1lLmNhbWVyYS5mYWRlKDAsIDUwMDApO1xuICAgIH0sIHRoaXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlSHVkKCkge1xuICAgIGNvbnN0IHRleHQgPSBgeCR7cGFkKHRoaXMuX2Zvcm1hdGlvbk1hbmFnZXIuZW5lbXlLaWxsZWQpfWA7XG4gICAgdGhpcy5fc2NvcmUuc2V0VGV4dCh0ZXh0KTtcblxuICAgIGZ1bmN0aW9uIHBhZChuKSB7XG4gICAgICBjb25zdCBzdHIgPSBuICsgJyc7XG4gICAgICByZXR1cm4gJzAwMDAnLnNsaWNlKDAsIDQgLSBzdHIubGVuZ3RoKSArIHN0cjtcbiAgICB9XG4gIH1cbn07XG5cbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG4gIGNvbnN0IGxldmVsID0gbmV3IExldmVsKCk7XG4gIGNvbnN0IGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoMTAwMCwgMTA4MCwgUGhhc2VyLkFVVE8sICdjb250ZW50JywgbGV2ZWwpO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL34vc291cmNlLW1hcC1sb2FkZXIhLi9zcmMvdHMvc3BhY2UtbmFyd2hhbC50cyIsImltcG9ydCBFbmVteSBmcm9tICcuL0VuZW15JztcbmltcG9ydCBBbGllbiBmcm9tICcuL0FsaWVuJztcbmltcG9ydCBCcmFpbiBmcm9tICcuL0JyYWluJztcblxuZXhwb3J0IHtcbiAgRW5lbXksXG4gIEFsaWVuLFxuICBCcmFpblxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3RzL2VuZW1pZXMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDExXG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=