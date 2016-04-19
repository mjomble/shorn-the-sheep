(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _exports$ENERGY_PER_T;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Width and height of one tile in pixels
exports.TILESIZE = 64;

exports.TUTORIAL_LEVEL_COUNT = 8;

exports.ANIM_FRAMERATE = 12;

// Time in ms between two sheep spawning from same source
exports.SPAWN_INTERVAL = 500;

// Time it takes for one sheep to move from one tile to the next
exports.SHEEP_MOVE_DURATION = 500;

// In milliseconds
exports.TURN_DURATION = 1000;

var SHEEPTYPES = {
  NORMAL: Symbol('NORMAL'),
  SHORN: Symbol('SHORN'),
  FLUFFY: Symbol('FLUFFY'),
  SCARRED: Symbol('SCARRED')
};

exports.SHEEPTYPES = SHEEPTYPES;

exports.ENERGY_PER_TYPE = (_exports$ENERGY_PER_T = {}, _defineProperty(_exports$ENERGY_PER_T, SHEEPTYPES.NORMAL, 8), _defineProperty(_exports$ENERGY_PER_T, SHEEPTYPES.SHORN, 12), _defineProperty(_exports$ENERGY_PER_T, SHEEPTYPES.FLUFFY, 20), _defineProperty(_exports$ENERGY_PER_T, SHEEPTYPES.SCARRED, 4), _exports$ENERGY_PER_T);

},{}],2:[function(require,module,exports){
'use strict';

var matrixGenerator = require('./matrix-generator');
var spawnGenerator = require('./spawn-generator');

var create = function create(phaserGame) {
  matrixGenerator.create(phaserGame);
  spawnGenerator.create(phaserGame);
};

var generate = function generate(spec) {
  var matrix = matrixGenerator.generate(spec.matrixSpec);
  var spawns = spawnGenerator.generate(spec.spawnSpec, matrix);
  var level = {
    matrix: matrix,
    spawns: spawns,
    description: spec.description,
    startingEnergy: spec.startingEnergy,
    energyRequired: spec.energyRequired,
    dialog: []
  };

  return level;
};

exports.create = create;
exports.generate = generate;

},{"./matrix-generator":3,"./spawn-generator":4}],3:[function(require,module,exports){
'use strict';

var game = void 0;
var matrix = void 0;

var create = function create(phaserGame) {
  game = phaserGame;
};

var createGrassMatrix = function createGrassMatrix(size) {
  matrix = [];
  for (var idxRow = 0; idxRow < size.numRows; idxRow++) {
    var row = [];
    for (var idxCol = 0; idxCol < size.numCols; idxCol++) {
      row.push({});
    }
    matrix.push(row);
  }

  return matrix;
};

var getRandomRowIdxInMatrix = function getRandomRowIdxInMatrix() {
  var maxIdx = matrix.length - 1;
  var idx = game.rnd.integerInRange(0, maxIdx);

  return idx;
};

var getRandomColIdxInRow = function getRandomColIdxInRow(row) {
  var maxIdx = row.length - 1;
  var idx = game.rnd.integerInRange(0, maxIdx);

  return idx;
};

var getRandomPositionInMatrix = function getRandomPositionInMatrix() {
  var rowIdx = getRandomRowIdxInMatrix();
  var colIdx = getRandomColIdxInRow(matrix[rowIdx]);
  var pos = {
    rowIdx: rowIdx,
    colIdx: colIdx
  };

  return pos;
};

var matrixPositionIsGrass = function matrixPositionIsGrass(pos) {
  var obj = matrix[pos.rowIdx][pos.colIdx];
  var type = obj.type || 'grass';
  var isGrass = type === 'grass';

  return isGrass;
};

var getRandomGrassPositionInMatrix = function getRandomGrassPositionInMatrix() {
  var foundPos = false;
  var pos = void 0;
  do {
    pos = getRandomPositionInMatrix();
    foundPos = matrixPositionIsGrass(pos);
  } while (!foundPos);

  return pos;
};

var disperseEntitiesToMatrix = function disperseEntitiesToMatrix(entities) {
  entities.forEach(function (entity) {
    var pos = getRandomGrassPositionInMatrix();
    matrix[pos.rowIdx][pos.colIdx] = entity;
  });
};

var generate = function generate(spec) {
  createGrassMatrix(spec.size);
  disperseEntitiesToMatrix(spec.entities);

  return matrix;
};

exports.create = create;
exports.generate = generate;

},{}],4:[function(require,module,exports){
'use strict';

var minTurn = 5;
var spawnTurnDiffPerSheepPerSpawn = 3;
var game = void 0;
var matrix = void 0;
var spec = void 0;
var spawns = void 0;

var create = function create(phaserGame) {
  game = phaserGame;
};

var getSheepPerSpawn = function getSheepPerSpawn() {
  var sheepPerSpawn = spec.numSheep / spec.numSpawns;

  return sheepPerSpawn;
};

var getSheepPerSpawnFloor = function getSheepPerSpawnFloor() {
  var sheepPerSpawn = getSheepPerSpawn();
  var sheepPerSpawnFloor = Math.floor(sheepPerSpawn);

  return sheepPerSpawnFloor;
};

var generateEmptySpawns = function generateEmptySpawns() {
  // TODO: throw error if spec.numSheep < spec.numSpawns

  spawns = [];
  for (var idx = 0; idx < spec.numSpawns; idx++) {
    spawns.push({});
  }
};

var placeSheepInSpawns = function placeSheepInSpawns() {
  // TODO: random number of sheep (within bounds) per spawn.

  var stdSheepPerSpawn = getSheepPerSpawnFloor();
  var minSheepPerSpawn = Math.ceil(stdSheepPerSpawn * 0.75);
  var numSheepUsed = 0;
  spawns.forEach(function (spawn, idx, arrSpawns) {
    var isLast = idx === arrSpawns.length - 1;
    if (isLast) {
      // TODO: this means that the last wave is always the biggest, but maybe that's ok.
      spawn.count = spec.numSheep - numSheepUsed;
    } else {
      var numAdditionalSheepUsed = game.rnd.integerInRange(minSheepPerSpawn, stdSheepPerSpawn);
      numSheepUsed += numAdditionalSheepUsed;
      spawn.count = game.rnd.integerInRange(minSheepPerSpawn, stdSheepPerSpawn);
    }
  });
};

var setSpawnTurns = function setSpawnTurns() {
  var turn = minTurn;
  var sheepPerSpawn = getSheepPerSpawnFloor();
  var maxSpawnTurnDiff = spawnTurnDiffPerSheepPerSpawn * sheepPerSpawn;
  spawns.forEach(function (spawn) {
    var spawnTurnDiff = game.rnd.integerInRange(0, maxSpawnTurnDiff);
    spawn.turn = turn;
    turn += spawnTurnDiff;
  });
};

var getRandSide = function getRandSide() {
  var sides = ['top', 'bottom', 'left', 'right'];
  var idx = game.rnd.integerInRange(0, sides.length - 1);
  var side = sides[idx];

  return side;
};

var getRandRowIdx = function getRandRowIdx() {
  var maxRowIdx = matrix.length - 1;
  var idx = game.rnd.integerInRange(0, maxRowIdx);

  return idx;
};

var getRandColIdx = function getRandColIdx() {
  var maxColIdx = matrix[0].length - 1;
  var idx = game.rnd.integerInRange(0, maxColIdx);

  return idx;
};

var getRandMatrixEdgePosition = function getRandMatrixEdgePosition() {
  var side = getRandSide();
  var pos = {};
  if (side === 'top' || side === 'bottom') {
    pos.colIdx = getRandColIdx();
    pos.rowIdx = side === 'top' ? -1 : matrix.length;
  } else if (side === 'left' || side === "right") {
    pos.rowIdx = getRandRowIdx();
    pos.colIdx = side === 'left' ? -1 : matrix[0].length;
  } else {
    throw new Error('Invalid side: ' + side);
  }

  return pos;
};

var setSpawnPositions = function setSpawnPositions() {
  spawns.forEach(function (spawn) {
    var pos = getRandMatrixEdgePosition();
    spawn.row = pos.rowIdx;
    spawn.col = pos.colIdx;
  });
};

var setSpawnDirections = function setSpawnDirections() {
  spawns.forEach(function (spawn) {
    var pos = {
      rowIdx: spawn.row,
      colIdx: spawn.col
    };
    var dir = void 0;
    if (pos.rowIdx === -1) {
      dir = 'down';
    } else if (pos.rowIdx === matrix.length) {
      dir = 'up';
    } else if (pos.colIdx === -1) {
      dir = 'right';
    } else if (pos.colIdx === matrix[0].length) {
      dir = 'left';
    } else {
      throw new Error('Invalid spawn position: row ' + pos.rowIdx + ', col ' + pos.colIdx);
    }
    spawn.dir = dir;
  });
};

var generate = function generate(spawnSpec, tileMatrix) {
  spec = spawnSpec;
  matrix = tileMatrix;
  generateEmptySpawns();
  placeSheepInSpawns();
  setSpawnTurns();
  setSpawnPositions();
  setSpawnDirections();

  return spawns;
};

exports.create = create;
exports.generate = generate;

},{}],5:[function(require,module,exports){
'use strict';

/* globals Phaser */

var constants = require('./constants');
var signals = require('./signals');
var tileShifter = require('./tile-shifter');
var utils = require('./utils');

var ENERGY_PER_TYPE = constants.ENERGY_PER_TYPE;


var STATES = {
  PLAY: Symbol('PLAY'),
  WIN: Symbol('WIN'),
  LOSE: Symbol('LOSE')
};

var currentLevel = void 0;

function throwValidationError() {
  var error = new Error();
  error.isValidation = true;
  throw error;
}

function expectEqual(val1, val2) {
  if (val1 !== val2) {
    throwValidationError();
  }
}

function expectInRange(val, min, max) {
  if (val < min || val > max) {
    throwValidationError();
  }
}

function validateSpawns() {
  var size = getSize();
  var currentSpawn = void 0;

  try {
    currentLevel.spawns.forEach(function (spawn) {
      currentSpawn = spawn;

      if (spawn.turn < 5) {
        throw new Error('Spawn must not start before turn 5');
      }

      if (spawn.dir === 'up') {
        expectEqual(spawn.row, size.y);
        expectInRange(spawn.col, 0, size.x - 1);
      } else if (spawn.dir === 'down') {
        expectEqual(spawn.row, -1);
        expectInRange(spawn.col, 0, size.x - 1);
      } else if (spawn.dir === 'left') {
        expectEqual(spawn.col, size.x);
        expectInRange(spawn.row, 0, size.y - 1);
      } else if (spawn.dir === 'right') {
        expectEqual(spawn.col, -1);
        expectInRange(spawn.row, 0, size.y - 1);
      }
    });
  } catch (e) {
    if (e.isValidation) {
      throw new Error('Invalid spawn position (row ' + currentSpawn.row + ' col ' + currentSpawn.col + ')');
    } else {
      throw e;
    }
  }
}

function getSize() {
  return new Phaser.Point(currentLevel.tiles[0].length, currentLevel.tiles.length);
}

function getTileXY(x, y) {
  return currentLevel.tiles[y][x];
}

exports.getSize = getSize;
exports.getTileXY = getTileXY;

exports.getAllSheepSources = function () {
  return currentLevel.spawns;
};

exports.getDef = function () {
  return currentLevel.def;
};

exports.getEnergy = function () {
  return currentLevel.energy;
};

exports.getEnergyRequired = function () {
  return currentLevel.def.energyRequired;
};

exports.getDialog = function () {
  return currentLevel.def.dialog;
};

exports.hasWon = function () {
  return currentLevel.state === STATES.WIN;
};

exports.hasLost = function () {
  return currentLevel.state === STATES.LOSE;
};

exports.isGameOver = function () {
  return exports.hasWon() || exports.hasLost();
};

exports.getTurn = function () {
  return currentLevel.turn;
};

exports.getTile = function (point) {
  return getTileXY(point.x, point.y);
};

exports.nextTurn = function () {
  currentLevel.turn++;
};

exports.isPointInLevel = function (point) {
  var size = getSize();

  return point.x >= 0 && point.x < size.x && point.y >= 0 && point.y < size.y;
};

exports.startLevel = function (def) {
  if (!('startingEnergy' in def)) {
    throw new Error('Starting energy not defined for level');
  }

  if (!('energyRequired' in def)) {
    throw new Error('Required energy not defined for level');
  }

  currentLevel = {
    def: def,
    tiles: utils.clone(def.matrix), // Operate on a copy, do not modify def
    spawns: utils.clone(def.spawns),
    state: STATES.PLAY,
    turn: 0,
    energy: def.startingEnergy,
    wavesStarted: 0
  };

  validateSpawns();

  tileShifter.setOnShift(function (energyCost) {
    if (currentLevel.energy < energyCost) {
      throw new Error('Not enough energy');
    }

    currentLevel.energy -= energyCost;
  });
};

exports.onSheepAbducted = function (sheepType) {
  currentLevel.energy += ENERGY_PER_TYPE[sheepType];

  if (currentLevel.energy >= currentLevel.def.energyRequired) {
    currentLevel.state = STATES.WIN;
  }

  signals.sheepAbducted.dispatch();
};

exports.swapTiles = function (tile1, tile2) {
  var row1 = tile1.custom.row;
  var col1 = tile1.custom.col;
  var row2 = tile2.custom.row;
  var col2 = tile2.custom.col;
  var tiles = currentLevel.tiles;
  var _ref = [tiles[row2][col2], tiles[row1][col1]];
  tiles[row1][col1] = _ref[0];
  tiles[row2][col2] = _ref[1];
};

signals.waveStarted.add(function () {
  currentLevel.wavesStarted++;
});

exports.getWavesLeft = function () {
  return currentLevel.spawns.length - currentLevel.wavesStarted;
};

},{"./constants":1,"./signals":10,"./tile-shifter":11,"./utils":13}],6:[function(require,module,exports){
'use strict';

/* globals Phaser, game, Play */

var constants = require('./constants');
var levelGenerator = require('./level-generator/level-generator');
var levelManager = require('./level-manager');
var preload = require('./preload');
var selectedTileOverlay = require('./selected-tile-overlay');
var signals = require('./signals');
var tileShifter = require('./tile-shifter');
var utils = require('./utils');

var ANIM_FRAMERATE = constants.ANIM_FRAMERATE;
var SHEEP_MOVE_DURATION = constants.SHEEP_MOVE_DURATION;
var SHEEPTYPES = constants.SHEEPTYPES;
var SPAWN_INTERVAL = constants.SPAWN_INTERVAL;
var TILESIZE = constants.TILESIZE;
var TURN_DURATION = constants.TURN_DURATION;
var TUTORIAL_LEVEL_COUNT = constants.TUTORIAL_LEVEL_COUNT;


var types = void 0;
var levelIndex = 0; // The first level will be this + 1

signals.tutorialStarted.add(function () {
  levelIndex = 0;
});

var shope = void 0; // The plural of 'sheep' that we made up
var grasseses = void 0;
var sources = void 0;
var dogs = void 0;
var bloods = void 0;
var facilities = void 0;
var spaceship = void 0;

var topLeft = void 0;
var tileUnderMouse = void 0;
var nextLevelButton = void 0;
var levelComplete = void 0;
var nextDialogButton = void 0;
var barBitmap = void 0;
var displayTextbox = -1;
var bmd;
var drawnObject;
var text = void 0;
var spaceshipSoundIndex = -1;
var displaySpeaker = void 0;

function getTileTopLeft(x, y) {
  return new Phaser.Point(topLeft.x + TILESIZE * x, topLeft.y + TILESIZE * y);
}

function getSheepPos(x, y, offset) {
  var point = getTileTopLeft(x, y);
  point.add(offset.x, offset.y);
  return point;
}

function tweenSheep(sheep, currentPos) {
  var nextPos = utils.getNextPos(currentPos.x, currentPos.y, sheep.custom.dir, 1);
  sheep.custom.targetPos = nextPos;
  var nextPosPx = getSheepPos(nextPos.x, nextPos.y, sheep.custom.offset);
  var tween = game.add.tween(sheep).to(nextPosPx, SHEEP_MOVE_DURATION, Phaser.Easing.Linear.None, true);
  tween.onComplete.add(sheepTweenComplete, sheep);
}

function sheepTweenComplete() {
  var sheep = this;
  var currentPos = sheep.custom.targetPos;

  if (!levelManager.isPointInLevel(currentPos)) {
    // TODO: animate sheep falling into space
    sheep.kill();
  } else {
    var tile = levelManager.getTile(currentPos);

    if (tile.type === 'spaceship') {
      sheep.kill();
      levelManager.onSheepAbducted(sheep.custom.type);
      spaceshipSoundIndex++;
      if (spaceshipSoundIndex % 4 === 0 || spaceshipSoundIndex === 0) {

        Play.spaceship_phaser();
      }

      if (levelManager.hasWon()) {
        levelComplete.visible = true;

        if (levelIndex !== TUTORIAL_LEVEL_COUNT) {
          nextLevelButton.visible = true;
        }
      }
    } else {
      var sheepType = sheep.custom.type;

      if (tile.type === 'dog') {
        sheep.custom.dir = tile.dir;
        sheep.animations.play(tile.dir);
        //Play.sheep_slow();
      } else if (tile.type === 'shearery') {
          if (sheepType === SHEEPTYPES.NORMAL || sheepType === SHEEPTYPES.FLUFFY) {
            sheep.custom.type = SHEEPTYPES.SHORN;
            sheep.loadTexture('shorn-sheep', null, false);
            Play.shearing();
          }
        } else if (tile.type === 'wash') {
          if (sheepType === SHEEPTYPES.NORMAL) {
            sheep.custom.type = SHEEPTYPES.FLUFFY;
            sheep.loadTexture('fluffy-sheep', null, false);
            Play.splash();
          }
        } else if (tile.type === 'scarrery') {
          if (sheepType !== SHEEPTYPES.SCARRED) {
            sheep.custom.type = SHEEPTYPES.SCARRED;
            sheep.loadTexture('scarred-sheep', null, false);
            Play.sheep_frightened();
          }
        } else if (tile.type === 'chapel') {
          if (sheepType === SHEEPTYPES.SCARRED) {
            sheep.custom.type = SHEEPTYPES.NORMAL;
            sheep.loadTexture('sheep', null, false);
          }
        } else if (tile.type === 'wolf') {
          sheep.kill();
          Play.sheep_fast();

          if (!tile.bloodRendered) {
            var tileTopLeft = getTileTopLeft(currentPos.x, currentPos.y);
            var blood = bloods.create(tileTopLeft.x + 10, tileTopLeft.y + 30, 'blood');
            blood.scale.set(0.7);
            tile.bloodRendered = true;
          }
        }

      if (sheep.alive) {
        tweenSheep(sheep, currentPos);
      }
    }
  }
}

function spawnSheep() {
  var source = this;
  var col = source.col;
  var row = source.row;


  var offset = new Phaser.Point(game.rnd.between(3, 10), game.rnd.between(10, 20));

  var sheepPos = getSheepPos(col, row, offset);
  var creatingNew = shope.countDead() === 0;
  var sheep = shope.getFirstDead(true, sheepPos.x, sheepPos.y, 'sheep');

  if (creatingNew) {
    sheep.animations.add('down', [9, 10, 11], ANIM_FRAMERATE, true);
    sheep.animations.add('left', [6, 7, 8], ANIM_FRAMERATE, true);
    sheep.animations.add('right', [3, 4, 5], ANIM_FRAMERATE, true);
    sheep.animations.add('up', [0, 1, 2], ANIM_FRAMERATE, true);
  } else {
    // Cancel existing tweens?
  }

  sheep.animations.play(source.dir);

  sheep.custom = {
    type: SHEEPTYPES.NORMAL,
    offset: offset,
    dir: source.dir
  };

  var currentPos = new Phaser.Point(col, row);
  tweenSheep(sheep, currentPos);
}

function addSourceSprite(source) {
  var row = source.row;
  var col = source.col;

  var tileTopLeft = getTileTopLeft(col, row);
  source.sprite = sources.create(tileTopLeft.x, tileTopLeft.y + 10, 'sheep-source');
  source.sprite.animations.add('swirl');
  source.sprite.animations.play('swirl', ANIM_FRAMERATE, true);
}

function activateSheepSources() {
  levelManager.getAllSheepSources().forEach(function (source) {
    if (source.turn === levelManager.getTurn()) {
      (function () {
        delete source.activating;
        source.active = true;
        signals.waveStarted.dispatch();

        var timer = game.time.create(true);
        timer.repeat(SPAWN_INTERVAL, source.count, spawnSheep, source);

        timer.onComplete.add(function () {
          // Fade out
          var tween = game.add.tween(source.sprite).to({ alpha: 0 }, 1000, null, true, 500);
          tween.onComplete.add(function () {
            return source.sprite.destroy();
          });
        });

        timer.start();

        signals.newLevel.addOnce(function () {
          timer.stop();
        });
      })();
    } else if (!source.active && !source.activating && source.turn < levelManager.getTurn() + 5) {
      (function () {
        source.activating = true;
        Play.spaceship_bean();
        addSourceSprite(source);

        var turnsLeft = source.turn - levelManager.getTurn();
        var timeLeft = turnsLeft * TURN_DURATION;

        // Fade in
        source.sprite.alpha = 0;
        game.add.tween(source.sprite).to({ alpha: 1 }, timeLeft, null, true);

        // Pulsating arrow
        var row = source.row;
        var col = source.col;

        var point = getTileTopLeft(col, row); // top left
        point.add(TILESIZE / 2, TILESIZE / 2); // center
        point = utils.getNextPos(point.x, point.y, source.dir, TILESIZE / 2); // move half a tile in the source direction
        var arrow = game.add.sprite(point.x, point.y, 'arrow');
        arrow.anchor.set(0.5); // align the center of the arrow to its position
        arrow.angle = utils.getAngle(source.dir);
        arrow.alpha = 0;
        var tween = game.add.tween(arrow).to({ alpha: 1 }, TURN_DURATION / 2, Phaser.Easing.Quadratic.InOut, true, 0, turnsLeft, true);
        tween.onComplete.add(function () {
          return arrow.destroy();
        });
      })();
    }
  });
}

function nextTurn() {
  levelManager.nextTurn();
  activateSheepSources();
}

var generateTestLevel = function generateTestLevel() {
  var spec = game.cache.getJSON('level-spec-8');
  var level = levelGenerator.generate(spec);

  return level;
};

function loadLevel(index, regenerate) {
  levelComplete.visible = false;

  var json = void 0;

  if (game.custom.randomLevelMode) {
    json = regenerate ? generateTestLevel() : levelManager.getDef();
  } else {
    nextLevelButton.visible = false;

    var key = 'level-' + index;
    json = game.cache.getJSON(key);
  }

  levelManager.startLevel(json);
  var halfSizePx = levelManager.getSize().clone().multiply(TILESIZE / 2, TILESIZE / 2);
  topLeft = new Phaser.Point(game.world.centerX - halfSizePx.x, game.world.centerY - halfSizePx.y);

  // TODO: reuse pooled sprites instead of destroying and recreating?
  grasseses.removeAll(true);
  sources.removeAll(true);
  shope.removeAll(true);
  dogs.removeAll(true);
  bloods.removeAll(true);
  facilities.removeAll(true);

  spaceship.events.destroy();

  var levelSize = levelManager.getSize();

  for (var row = 0; row < levelSize.y; row++) {
    for (var col = 0; col < levelSize.x; col++) {
      var tile = levelManager.getTileXY(col, row);
      var type = tile.type || 'grass';
      var tileTopLeft = getTileTopLeft(col, row);
      var objsprite = null;

      var random = game.rnd.between(1, 3);
      var grass = grasseses.create(tileTopLeft.x, tileTopLeft.y, 'grass' + random);
      grass.inputEnabled = true;

      if (type === 'spaceship') {
        spaceship.position.copyFrom(tileTopLeft);
        objsprite = spaceship;
      } else if (type === 'dog') {
        objsprite = dogs.create(tileTopLeft.x, tileTopLeft.y, 'dog');
        objsprite.animations.add('down', [10]);
        objsprite.animations.add('left', [7]);
        objsprite.animations.add('right', [4]);
        objsprite.animations.add('up', [1]);
        objsprite.animations.play(tile.dir);
      } else if (type === 'shearery') {
        objsprite = facilities.create(tileTopLeft.x, tileTopLeft.y, 'shearery');
      } else if (type === 'wash') {
        objsprite = facilities.create(tileTopLeft.x, tileTopLeft.y, 'wash');
      } else if (type === 'scarrery') {
        objsprite = facilities.create(tileTopLeft.x, tileTopLeft.y, 'scarrery');
      } else if (type === 'chapel') {
        objsprite = facilities.create(tileTopLeft.x, tileTopLeft.y, 'chapel');
      } else if (type === 'wolf') {
        objsprite = facilities.create(tileTopLeft.x, tileTopLeft.y, 'wolf');
        tile.bloodRendered = false;
      } else if (type === 'grass') {
        // Nothing to do
      } else {
          throw new Error('Unrecognized tile type: ' + type);
        }

      grass.custom = { row: row, col: col, objtype: type, objsprite: objsprite };
      grass.inputEnabled = true;

      if (tileShifter.isShiftable(type)) {
        grass.input.useHandCursor = true;
      }

      addMouseHandlers(grass);
    }
  }

  signals.newLevel.dispatch();
  stopTurns();
  loadNextDialog();

  updateEnergyBar();
}

function loadNextLevel() {
  if (!game.custom.randomLevelMode) {
    levelIndex++;
  }

  displayTextbox = -1;
  loadLevel(levelIndex, true);
}

function restartLevel() {
  loadLevel(levelIndex, false);
}

function startTurns() {
  game.time.events.loop(TURN_DURATION, nextTurn);
  game.time.events.start();
}

function stopTurns() {
  game.time.events.stop();
}

function loadNextDialog() {
  var dialog = levelManager.getDialog();

  if (dialog && displayTextbox < dialog.length - 1) {
    drawnObject.visible = true;
    nextDialogButton.visible = true;
    text.visible = true;
    displaySpeaker.visible = true;
    ++displayTextbox;
    var currentSpeaker = levelManager.getDialog()[displayTextbox]["speaker"];
    var currentSide = levelManager.getDialog()[displayTextbox]["side"];
    var left_x = 120;
    var right_x = 560;
    var center_x = 220;

    text.text = levelManager.getDialog()[displayTextbox]["msg"];

    if (currentSide === "left") {
      text.x = 260;
    } else if (currentSide === "right") {
      text.x = 100;
    } else {
      text.x = 100;
    }

    if (currentSpeaker === "none") {
      displaySpeaker.alpha = 0;
    } else {
      displaySpeaker.alpha = 1;
      displaySpeaker.loadTexture(currentSpeaker);
    }

    if (currentSide === "left") {
      displaySpeaker.x = left_x;
    } else if (currentSide === "center") {
      displaySpeaker.x = center_x;
    } else {
      displaySpeaker.x = right_x;
    }
  } else {
    drawnObject.visible = false;
    nextDialogButton.visible = false;
    text.visible = false;
    displaySpeaker.visible = false;
    startTurns();
  }
}

function addMouseHandlers(grass) {
  grass.events.onInputDown.add(function () {
    tileShifter.handleTileClicked(grass);
    updateEnergyBar();
  });

  grass.events.onInputOver.add(function () {
    tileUnderMouse = grass;
    updateEnergyBar();
  });

  grass.events.onInputOut.add(function () {
    // Need to make sure we don't do this right after the adjacent tile was set as tileUnderMouse
    if (tileUnderMouse === grass) {
      tileUnderMouse = null;
      updateEnergyBar();
    }
  });
}

var createDialog = function createDialog() {
  var width = 640;
  var height = 140;
  bmd = game.add.bitmapData(width, height);

  bmd.ctx.beginPath();
  bmd.ctx.rect(0, 0, width, height);
  bmd.ctx.fillStyle = '#550055';
  bmd.ctx.fill();

  drawnObject = game.add.sprite(400, 170, bmd);
  drawnObject.alpha = 0.8;
  drawnObject.anchor.setTo(0.5, 0.5);

  nextDialogButton = game.add.button(640, 260, 'next-dialog-button', loadNextDialog);
  nextDialogButton.anchor.setTo(0.5);
  nextDialogButton.visible = true;

  text = game.add.text(260, 120, '', { fill: 'white', font: '20px Courier', fontWeight: 'bold' });
  text.wordWrap = true;
  text.wordWrapWidth = 450;
  displaySpeaker = game.add.image(120, 240, 'alien-left');
  displaySpeaker.anchor.y = 1;
  displaySpeaker.visible = true;
};

function updateEnergyBar() {
  var barWidth = 150;
  var energyRequired = levelManager.getEnergyRequired();
  var energy = levelManager.getEnergy();
  var cost = 0;

  if (tileUnderMouse && tileShifter.hasSelectedTile()) {
    var selectedTile = tileShifter.getSelectedTile();

    if (tileShifter.tilesAreSwappable(tileUnderMouse, selectedTile)) {
      cost = tileShifter.calculateShiftCost(tileUnderMouse, selectedTile);
    }
  }

  var ratio = barWidth / energyRequired;

  barBitmap.ctx.clearRect(0, 0, 150, 12);

  function fillBarSegment(start, width, color) {
    barBitmap.ctx.fillStyle = color;
    barBitmap.ctx.fillRect(start * ratio, 0, width * ratio, 12);
  }

  if (energy > cost) {
    fillBarSegment(0, energy - cost, '#bbddff');
  }

  if (cost > 0) {
    if (energy > cost) {
      fillBarSegment(energy - cost, cost, 'yellow');
    } else {
      fillBarSegment(0, energy, 'yellow');
      fillBarSegment(energy, cost - energy, 'red');
    }
  }

  barBitmap.ctx.strokeStyle = 'white';
  barBitmap.ctx.strokeRect(0, 0, 150, 12);
}

exports.preload = preload;

exports.create = function () {
  levelGenerator.create(game);
  if (game.custom.randomLevelMode == false) {
    Play.say.allyourbase();
  }
  game.add.tileSprite(0, 0, game.width, game.height, 'space');

  types = game.cache.getJSON('types');

  grasseses = game.add.group();
  sources = game.add.group();
  shope = game.add.group();
  dogs = game.add.group();
  bloods = game.add.group();
  facilities = game.add.group();

  // Init at 0, 0 - will be positioned later
  spaceship = game.add.sprite(0, 0, 'spaceship');
  spaceship.animations.add('wobble');
  spaceship.animations.play('wobble', 6, true);

  nextLevelButton = game.add.button(game.world.centerX, 550, 'next-level-button', loadNextLevel);
  nextLevelButton.anchor.setTo(0.5);

  if (!game.custom.randomLevelMode) {
    nextLevelButton.visible = false;
  }

  levelComplete = game.add.image(game.world.centerX, 90, 'level-complete');
  levelComplete.anchor.setTo(0.5);
  levelComplete.smoothed = false;

  var restartButton = game.add.button(game.world.centerX, 40, 'restart-level-button', restartLevel);
  restartButton.anchor.setTo(0.5);
  restartButton.smoothed = false;

  var mainMenuButton = game.add.text(768, 568, 'MAIN MENU', { fill: 'white', font: '20px Courier', fontWeight: 'bold' });
  mainMenuButton.anchor.set(1);
  mainMenuButton.inputEnabled = true;
  mainMenuButton.input.useHandCursor = true;
  mainMenuButton.events.onInputDown.add(function () {
    game.state.start('title-screen');
  });

  selectedTileOverlay.create();
  tileShifter.create(types);

  barBitmap = game.add.bitmapData(151, 13);
  barBitmap.ctx.translate(0.5, 0.5); // Avoid pixel boundaries

  game.add.text(32, 32, 'ENERGY:', { fill: 'white', font: '14px Courier' });
  game.add.sprite(32, 50, barBitmap);

  signals.sheepAbducted.add(updateEnergyBar);

  createDialog();

  loadNextLevel();

  game.input.onDown.add(function () {
    if (!tileUnderMouse && tileShifter.hasSelectedTile()) {
      tileShifter.deselect();
    }
  });
};

exports.update = function () {};

exports.render = function () {
  if (!levelManager.isGameOver()) {
    game.debug.text('Waves left: ' + levelManager.getWavesLeft(), 32, 570);
  }
};

},{"./constants":1,"./level-generator/level-generator":2,"./level-manager":5,"./preload":8,"./selected-tile-overlay":9,"./signals":10,"./tile-shifter":11,"./utils":13}],7:[function(require,module,exports){
'use strict';

/* globals Phaser, game */

window.game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game');

game.custom = { randomLevelMode: false };

game.state.add('title-screen', require('./title-screen'));
game.state.add('main-state', require('./main-state'));
game.state.start('title-screen');

},{"./main-state":6,"./title-screen":12}],8:[function(require,module,exports){
'use strict';

/* globals game */

var constants = require('./constants');

module.exports = function () {
  game.load.image('space', 'space.png');
  game.load.image('grass1', 'grass.png');
  game.load.image('grass2', 'grass2.png');
  game.load.image('grass3', 'grass3.png');
  game.load.spritesheet('spaceship', 'spaceship.png', 50, 41);
  game.load.image('shearery', 'shearery.png');
  game.load.image('wash', 'wash.png');
  game.load.image('scarrery', 'scarrery.png');
  game.load.image('chapel', 'chapel.png');
  game.load.image('wolf', 'wolf.png');
  game.load.image('blood', 'blood.png');
  game.load.image('arrow', 'arrow.png');
  game.load.image('alien-left', 'alien-left.png');
  game.load.image('alien-right', 'alien-right.png');
  game.load.image('dog-left', 'dog-left.png');
  game.load.image('dog-right', 'dog-right.png');
  game.load.image('sheep-left', 'sheep-left.png');
  game.load.image('sheep-right', 'sheep-right.png');
  game.load.spritesheet('sheep-source', 'sheep-source.png', 50, 41);
  game.load.spritesheet('sheep', 'sheep.png', 49, 33);
  game.load.spritesheet('shorn-sheep', 'shorn-sheep.png', 49, 32);
  game.load.spritesheet('fluffy-sheep', 'fluffy-sheep.png', 49, 32);
  game.load.spritesheet('scarred-sheep', 'scarred-sheep.png', 49, 32);
  game.load.spritesheet('dog', 'dog.png', 49, 41);
  game.load.spritesheet('selected', 'selected.png', 128, 128);
  game.load.image('level-complete', 'level-complete.png');
  game.load.image('next-level-button', 'next-level-button.png');
  game.load.image('restart-level-button', 'restart-level-button.png');
  game.load.image('next-dialog-button', 'next-dialog-button.png');
  game.load.json('types', 'data/types.json');

  for (var i = 1; i <= constants.TUTORIAL_LEVEL_COUNT; i++) {
    game.load.json('level-' + i, 'data/level-' + i + '.json');
  }

  game.load.json('test-level-spec', 'data/test-level-spec.json');
  game.load.json('level-spec-8', 'data/level-spec-8.json');
};

},{"./constants":1}],9:[function(require,module,exports){
'use strict';

/* globals game */

var signals = require('./signals');

var overlay = void 0;

var create = function create() {
  overlay = game.add.sprite(0, 0, 'selected');
  overlay.animations.add('glow', null, 8, true);
  overlay.animations.play('glow');
  hide();
};

var show = function show(tile) {
  overlay.x = tile.x - 32;
  overlay.y = tile.y - 32;
  overlay.visible = true;
};

var hide = function hide() {
  overlay.visible = false;
};

signals.newLevel.add(hide);

exports.create = create;
exports.show = show;
exports.hide = hide;

},{"./signals":10}],10:[function(require,module,exports){
"use strict";

/* globals Phaser */

exports.newLevel = new Phaser.Signal();
exports.sheepAbducted = new Phaser.Signal();
exports.tutorialStarted = new Phaser.Signal();
exports.waveStarted = new Phaser.Signal();

},{}],11:[function(require,module,exports){
'use strict';

/* global Play */

var levelManager = require('./level-manager');
var selectedTileOverlay = require('./selected-tile-overlay');
var signals = require('./signals');

var selectedTile = null;
var onShift = null;
var types = void 0;

signals.newLevel.add(function () {
  selectedTile = null;
});

function create(tileTypes) {
  types = tileTypes;
}

function switchObjects(tile1, tile2) {
  var custom1 = tile1.custom;
  var custom2 = tile2.custom;
  var sprite1 = custom1.objsprite;
  var sprite2 = custom2.objsprite;

  if (sprite1) {
    // TODO: offsets?
    sprite1.x = tile2.x;
    sprite1.y = tile2.y;
  }

  if (sprite2) {
    sprite2.x = tile1.x;
    sprite2.y = tile1.y;
  }

  var _ref = [custom2.objtype, custom1.objtype];
  custom1.objtype = _ref[0];
  custom2.objtype = _ref[1];
  var _ref2 = [custom2.objsprite, custom1.objsprite];
  custom1.objsprite = _ref2[0];
  custom2.objsprite = _ref2[1];


  if (onShift) {
    var energyCost = calculateShiftCost(tile1, tile2);
    onShift(energyCost);
  }
}

function hasSelectedTile() {
  return selectedTile !== null;
}

function getSelectedTile() {
  return selectedTile;
}

function isShiftable(type) {
  return type !== 'spaceship' && type !== 'wolf';
}

function handleTileClicked(tile) {
  var objtype = tile.custom.objtype;

  if (isShiftable(objtype)) {
    if (hasSelectedTile()) {
      if (tilesAreSwappable(tile, selectedTile)) {
        var cost = calculateShiftCost(tile, selectedTile);

        if (cost > levelManager.getEnergy()) {
          // TODO: inform user that they don't have enough energy
          Play.sheep_fast();
          return;
        }

        levelManager.swapTiles(tile, selectedTile);
        switchObjects(tile, selectedTile);
      }

      selectedTile = null;
      selectedTileOverlay.hide();
    } else {
      selectedTile = tile;
      selectedTileOverlay.show(tile);
    }
  }
}

function setOnShift(callback) {
  onShift = callback;
}

function getShiftEnergy(tile) {
  return types[tile.custom.objtype].shiftEnergy;
}

function tilesAreSwappable(tile1, tile2) {
  return isShiftable(tile1.custom.objtype) && isShiftable(tile2.custom.objtype) && tile1 !== tile2;
}

function calculateShiftCost(tile1, tile2) {
  return getShiftEnergy(tile1) + getShiftEnergy(tile2);
}

exports.deselect = function () {
  selectedTile = null;
  selectedTileOverlay.hide();
};

exports.create = create;
exports.hasSelectedTile = hasSelectedTile;
exports.getSelectedTile = getSelectedTile;
exports.isShiftable = isShiftable;
exports.handleTileClicked = handleTileClicked;
exports.setOnShift = setOnShift;
exports.tilesAreSwappable = tilesAreSwappable;
exports.calculateShiftCost = calculateShiftCost;

},{"./level-manager":5,"./selected-tile-overlay":9,"./signals":10}],12:[function(require,module,exports){
'use strict';

/* globals game, Play */

var signals = require('./signals');

exports.preload = function () {
  game.load.image('space', 'space.png');
  game.load.image('title', 'title.png');
};

function playTutorial() {
  game.custom.randomLevelMode = false;
  game.state.start('main-state');
  signals.tutorialStarted.dispatch();
}

function playRandom() {
  game.custom.randomLevelMode = true;
  game.state.start('main-state');
}

var names = ['Shearing is Cearing', 'Space Shepherd', 'Does it have to\nbe a sheep?', 'Does it have to\nhave a name?', 'Shear Joy', 'Shorn the Sheep', 'Shift My Shope', 'Shope Can Mean Anything', 'Get Your Probes Here', 'Fi(r)st Probing Free', 'Dude, Where\'s My Sheep?', 'Old Poop', 'Ctrl-Shift-Sheep', 'Pimp My Sheep', 'A sheep is a terrible\nthing to waste', 'All your sheep are\nbelong to aliens', 'Insert Name Here'];

var nameText = void 0;

function setRandomName() {
  nameText.text = game.rnd.pick(names);
}

exports.create = function () {
  game.add.tileSprite(0, 0, game.width, game.height, 'space');
  game.add.image(0, 0, 'title');

  nameText = game.add.text(400, 90, '', { fill: 'white', font: '48px Courier', fontWeight: 'bold', align: 'center' });
  nameText.anchor.set(0.5);
  nameText.smoothed = false;
  nameText.inputEnabled = true;
  nameText.input.useHandCursor = true;
  nameText.events.onInputDown.add(setRandomName);
  setRandomName(); // init

  var tutorialButton = game.add.text(450, 250, 'PLAY TUTORIAL', { fill: 'white', font: '24px Courier', fontWeight: 'bold' });
  tutorialButton.anchor.set(0.5);
  tutorialButton.smoothed = false;
  tutorialButton.inputEnabled = true;
  tutorialButton.input.useHandCursor = true;
  tutorialButton.events.onInputDown.add(Play.switch_on_device);
  tutorialButton.events.onInputDown.add(playTutorial);

  var randomButton = game.add.text(450, 310, 'PLAY RANDOM', { fill: 'white', font: '24px Courier', fontWeight: 'bold' });
  randomButton.anchor.set(0.5);
  randomButton.smoothed = false;
  randomButton.inputEnabled = true;
  randomButton.input.useHandCursor = true;
  randomButton.events.onInputDown.add(Play.switch_on_device);
  randomButton.events.onInputDown.add(playRandom);
};

exports.update = function () {};

exports.render = function () {};

},{"./signals":10}],13:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function clone(obj) {
  if (Array.isArray(obj)) {
    return obj.map(clone);
  } else if (obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object') {
    var _ret = function () {
      var cloned = {};
      Object.keys(obj).forEach(function (key) {
        cloned[key] = clone(obj[key]);
      });
      return {
        v: cloned
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  } else if (!obj || typeof obj === 'string' || typeof obj === 'number') {
    return obj;
  } else {
    throw new Error('Cloning not supported for ' + (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) + ' ' + obj);
  }
}

exports.clone = clone;

exports.getNextPos = function (x, y, direction, distance) {
  if (direction === 'right') {
    return { x: x + distance, y: y };
  } else if (direction === 'left') {
    return { x: x - distance, y: y };
  } else if (direction === 'up') {
    return { x: x, y: y - distance };
  } else if (direction === 'down') {
    return { x: x, y: y + distance };
  } else {
    throw new Error('Invalid direction: ' + direction);
  }
};

exports.getAngle = function (direction) {
  if (direction === 'up') {
    return 0;
  } else if (direction === 'right') {
    return 90;
  } else if (direction === 'down') {
    return 180;
  } else if (direction === 'left') {
    return -90;
  } else {
    throw new Error('Invalid direction: ' + direction);
  }
};

},{}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJlczZcXGNvbnN0YW50cy5qcyIsImVzNlxcbGV2ZWwtZ2VuZXJhdG9yXFxsZXZlbC1nZW5lcmF0b3IuanMiLCJlczZcXGxldmVsLWdlbmVyYXRvclxcbWF0cml4LWdlbmVyYXRvci5qcyIsImVzNlxcbGV2ZWwtZ2VuZXJhdG9yXFxzcGF3bi1nZW5lcmF0b3IuanMiLCJlczZcXGxldmVsLW1hbmFnZXIuanMiLCJlczZcXG1haW4tc3RhdGUuanMiLCJlczZcXG1haW4uanMiLCJlczZcXHByZWxvYWQuanMiLCJlczZcXHNlbGVjdGVkLXRpbGUtb3ZlcmxheS5qcyIsImVzNlxcc2lnbmFscy5qcyIsImVzNlxcdGlsZS1zaGlmdGVyLmpzIiwiZXM2XFx0aXRsZS1zY3JlZW4uanMiLCJlczZcXHV0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OztBQ0NBLFFBQVEsUUFBUixHQUFtQixFQUFuQjs7QUFFQSxRQUFRLG9CQUFSLEdBQStCLENBQS9COztBQUVBLFFBQVEsY0FBUixHQUF5QixFQUF6Qjs7O0FBR0EsUUFBUSxjQUFSLEdBQXlCLEdBQXpCOzs7QUFHQSxRQUFRLG1CQUFSLEdBQThCLEdBQTlCOzs7QUFHQSxRQUFRLGFBQVIsR0FBd0IsSUFBeEI7O0FBRUEsSUFBTSxhQUFhO0FBQ2pCLFVBQVEsT0FBTyxRQUFQLENBQVI7QUFDQSxTQUFPLE9BQU8sT0FBUCxDQUFQO0FBQ0EsVUFBUSxPQUFPLFFBQVAsQ0FBUjtBQUNBLFdBQVMsT0FBTyxTQUFQLENBQVQ7Q0FKSTs7QUFPTixRQUFRLFVBQVIsR0FBcUIsVUFBckI7O0FBRUEsUUFBUSxlQUFSLHVFQUNHLFdBQVcsTUFBWCxFQUFvQiwyQ0FDcEIsV0FBVyxLQUFYLEVBQW1CLDRDQUNuQixXQUFXLE1BQVgsRUFBb0IsNENBQ3BCLFdBQVcsT0FBWCxFQUFxQiwwQkFKeEI7Ozs7O0FDekJBLElBQUksa0JBQWtCLFFB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QUFjLE9BQWQsRUFBdUI7QUFDekIsV0FBTyxFQUFFLEdBQUcsSUFBSSxRQUFKLEVBQWMsSUFBbkIsRUFBUCxDQUR5QjtHQUEzQixNQUdLLElBQUksY0FBYyxNQUFkLEVBQXNCO0FBQzdCLFdBQU8sRUFBRSxHQUFHLElBQUksUUFBSixFQUFjLElBQW5CLEVBQVAsQ0FENkI7R0FBMUIsTUFHQSxJQUFJLGNBQWMsSUFBZCxFQUFvQjtBQUMzQixXQUFPLEVBQUUsSUFBRixFQUFLLEdBQUcsSUFBSSxRQUFKLEVBQWYsQ0FEMkI7R0FBeEIsTUFHQSxJQUFJLGNBQWMsTUFBZCxFQUFzQjtBQUM3QixXQUFPLEVBQUUsSUFBRixFQUFLLEdBQUcsSUFBSSxRQUFKLEVBQWYsQ0FENkI7R0FBMUIsTUFHQTtBQUNILFVBQU0sSUFBSSxLQUFKLENBQVUsd0JBQXdCLFNBQXhCLENBQWhCLENBREc7R0FIQTtDQVZjOztBQWtCckIsUUFBUSxRQUFSLEdBQW1CLFVBQVMsU0FBVCxFQUFvQjtBQUNyQyxNQUFJLGNBQWMsSUFBZCxFQUFvQjtBQUN0QixXQUFPLENBQVAsQ0FEc0I7R0FBeEIsTUFHSyxJQUFJLGNBQWMsT0FBZCxFQUF1QjtBQUM5QixXQUFPLEVBQVAsQ0FEOEI7R0FBM0IsTUFHQSxJQUFJLGNBQWMsTUFBZCxFQUFzQjtBQUM3QixXQUFPLEdBQVAsQ0FENkI7R0FBMUIsTUFHQSxJQUFJLGNBQWMsTUFBZCxFQUFzQjtBQUM3QixXQUFPLENBQUMsRUFBRCxDQURzQjtHQUExQixNQUdBO0FBQ0gsVUFBTSxJQUFJLEtBQUosQ0FBVSx3QkFBd0IsU0FBeEIsQ0FBaEIsQ0FERztHQUhBO0NBVlkiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gV2lkdGggYW5kIGhlaWdodCBvZiBvbmUgdGlsZSBpbiBwaXhlbHNcclxuZXhwb3J0cy5USUxFU0laRSA9IDY0O1xyXG5cclxuZXhwb3J0cy5UVVRPUklBTF9MRVZFTF9DT1VOVCA9IDg7XHJcblxyXG5leHBvcnRzLkFOSU1fRlJBTUVSQVRFID0gMTI7XHJcblxyXG4vLyBUaW1lIGluIG1zIGJldHdlZW4gdHdvIHNoZWVwIHNwYXduaW5nIGZyb20gc2FtZSBzb3VyY2VcclxuZXhwb3J0cy5TUEFXTl9JTlRFUlZBTCA9IDUwMDtcclxuXHJcbi8vIFRpbWUgaXQgdGFrZXMgZm9yIG9uZSBzaGVlcCB0byBtb3ZlIGZyb20gb25lIHRpbGUgdG8gdGhlIG5leHRcclxuZXhwb3J0cy5TSEVFUF9NT1ZFX0RVUkFUSU9OID0gNTAwO1xyXG5cclxuLy8gSW4gbWlsbGlzZWNvbmRzXHJcbmV4cG9ydHMuVFVSTl9EVVJBVElPTiA9IDEwMDA7XHJcblxyXG5jb25zdCBTSEVFUFRZUEVTID0ge1xyXG4gIE5PUk1BTDogU3ltYm9sKCdOT1JNQUwnKSxcclxuICBTSE9STjogU3ltYm9sKCdTSE9STicpLFxyXG4gIEZMVUZGWTogU3ltYm9sKCdGTFVGRlknKSxcclxuICBTQ0FSUkVEOiBTeW1ib2woJ1NDQVJSRUQnKVxyXG59O1xyXG5cclxuZXhwb3J0cy5TSEVFUFRZUEVTID0gU0hFRVBUWVBFUztcclxuXHJcbmV4cG9ydHMuRU5FUkdZX1BFUl9UWVBFID0ge1xyXG4gIFtTSEVFUFRZUEVTLk5PUk1BTF06IDgsXHJcbiAgW1NIRUVQVFlQRVMuU0hPUk5dOiAxMixcclxuICBbU0hFRVBUWVBFUy5GTFVGRlldOiAyMCxcclxuICBbU0hFRVBUWVBFUy5TQ0FSUkVEXTogNFxyXG59O1xyXG4iLCJsZXQgbWF0cml4R2VuZXJhdG9yID0gcmVxdWlyZSgnLi9tYXRyaXgtZ2VuZXJhdG9yJyk7XG5sZXQgc3Bhd25HZW5lcmF0b3IgPSByZXF1aXJlKCcuL3NwYXduLWdlbmVyYXRvcicpO1xuXG5sZXQgY3JlYXRlID0gKHBoYXNlckdhbWUpID0+IHtcbiAgbWF0cml4R2VuZXJhdG9yLmNyZWF0ZShwaGFzZXJHYW1lKTtcbiAgc3Bhd25HZW5lcmF0b3IuY3JlYXRlKHBoYXNlckdhbWUpO1xufTtcblxubGV0IGdlbmVyYXRlID0gKHNwZWMpID0+IHtcbiAgY29uc3QgbWF0cml4ID0gbWF0cml4R2VuZXJhdG9yLmdlbmVyYXRlKHNwZWMubWF0cml4U3BlYyk7XG4gIGNvbnN0IHNwYXducyA9IHNwYXduR2VuZXJhdG9yLmdlbmVyYXRlKHNwZWMuc3Bhd25TcGVjLCBtYXRyaXgpO1xuICB2YXIgbGV2ZWwgPSB7XG4gICAgbWF0cml4OiBtYXRyaXgsXG4gICAgc3Bhd25zOiBzcGF3bnMsXG4gICAgZGVzY3JpcHRpb246IHNwZWMuZGVzY3JpcHRpb24sXG4gICAgc3RhcnRpbmdFbmVyZ3k6IHNwZWMuc3RhcnRpbmdFbmVyZ3ksXG4gICAgZW5lcmd5UmVxdWlyZWQ6IHNwZWMuZW5lcmd5UmVxdWlyZWQsXG4gICAgZGlhbG9nOiBbXVxuICB9O1xuXG4gIHJldHVybiBsZXZlbDtcbn07XG5cbmV4cG9ydHMuY3JlYXRlID0gY3JlYXRlO1xuZXhwb3J0cy5nZW5lcmF0ZSA9IGdlbmVyYXRlO1xuIiwibGV0IGdhbWU7XG5sZXQgbWF0cml4O1xuXG5sZXQgY3JlYXRlID0gKHBoYXNlckdhbWUpID0+IHtcbiAgZ2FtZSA9IHBoYXNlckdhbWU7XG59O1xuXG5sZXQgY3JlYXRlR3Jhc3NNYXRyaXggPSAoc2l6ZSkgPT4ge1xuICBtYXRyaXggPSBbXTtcbiAgZm9yIChsZXQgaWR4Um93ID0gMDsgaWR4Um93IDwgc2l6ZS5udW1Sb3dzOyBpZHhSb3crKykge1xuICAgIGxldCByb3cgPSBbXTtcbiAgICBmb3IgKGxldCBpZHhDb2wgPSAwOyBpZHhDb2wgPCBzaXplLm51bUNvbHM7IGlkeENvbCsrKSB7XG4gICAgICByb3cucHVzaCh7fSk7XG4gICAgfVxuICAgIG1hdHJpeC5wdXNoKHJvdyk7XG4gIH1cblxuICByZXR1cm4gbWF0cml4O1xufTtcblxubGV0IGdldFJhbmRvbVJvd0lkeEluTWF0cml4ID0gKCkgPT4ge1xuICBsZXQgbWF4SWR4ID0gbWF0cml4Lmxlbmd0aCAtIDE7XG4gIGxldCBpZHggPSBnYW1lLnJuZC5pbnRlZ2VySW5SYW5nZSgwLCBtYXhJZHgpO1xuXG4gIHJldHVybiBpZHg7XG59O1xuXG5sZXQgZ2V0UmFuZG9tQ29sSWR4SW5Sb3cgPSAocm93KSA9PiB7XG4gIGxldCBtYXhJZHggPSByb3cubGVuZ3RoIC0gMTtcbiAgbGV0IGlkeCA9IGdhbWUucm5kLmludGVnZXJJblJhbmdlKDAsIG1heElkeCk7XG5cbiAgcmV0dXJuIGlkeDtcbn07XG5cbmxldCBnZXRSYW5kb21Qb3NpdGlvbkluTWF0cml4ID0gKCkgPT4ge1xuICBsZXQgcm93SWR4ID0gZ2V0UmFuZG9tUm93SWR4SW5NYXRyaXgoKTtcbiAgbGV0IGNvbElkeCA9IGdldFJhbmRvbUNvbElkeEluUm93KG1hdHJpeFtyb3dJZHhdKTtcbiAgbGV0IHBvcyA9IHtcbiAgICByb3dJZHg6IHJvd0lkeCxcbiAgICBjb2xJZHg6IGNvbElkeFxuICB9O1xuXG4gIHJldHVybiBwb3M7XG59O1xuXG5sZXQgbWF0cml4UG9zaXRpb25Jc0dyYXNzID0gKHBvcykgPT4ge1xuICBsZXQgb2JqID0gbWF0cml4W3Bvcy5yb3dJZHhdW3Bvcy5jb2xJZHhdO1xuICBsZXQgdHlwZSA9IG9iai50eXBlIHx8ICdncmFzcyc7XG4gIGxldCBpc0dyYXNzID0gdHlwZSA9PT0gJ2dyYXNzJztcblxuICByZXR1cm4gaXNHcmFzcztcbn07XG5cbmxldCBnZXRSYW5kb21HcmFzc1Bvc2l0aW9uSW5NYXRyaXggPSAoKSA9PiB7XG4gIGxldCBmb3VuZFBvcyA9IGZhbHNlO1xuICBsZXQgcG9zO1xuICBkbyB7XG4gICAgcG9zID0gZ2V0UmFuZG9tUG9zaXRpb25Jbk1hdHJpeCgpO1xuICAgIGZvdW5kUG9zID0gbWF0cml4UG9zaXRpb25Jc0dyYXNzKHBvcyk7XG4gIH0gd2hpbGUgKCFmb3VuZFBvcyk7XG5cbiAgcmV0dXJuIHBvcztcbn07XG5cbmxldCBkaXNwZXJzZUVudGl0aWVzVG9NYXRyaXggPSAoZW50aXRpZXMpID0+IHtcbiAgZW50aXRpZXMuZm9yRWFjaCgoZW50aXR5KSA9PiB7XG4gICAgbGV0IHBvcyA9IGdldFJhbmRvbUdyYXNzUG9zaXRpb25Jbk1hdHJpeCgpO1xuICAgIG1hdHJpeFtwb3Mucm93SWR4XVtwb3MuY29sSWR4XSA9IGVudGl0eTtcbiAgfSk7XG59O1xuXG5sZXQgZ2VuZXJhdGUgPSAoc3BlYykgPT4ge1xuICBjcmVhdGVHcmFzc01hdHJpeChzcGVjLnNpemUpO1xuICBkaXNwZXJzZUVudGl0aWVzVG9NYXRyaXgoc3BlYy5lbnRpdGllcyk7XG5cbiAgcmV0dXJuIG1hdHJpeDtcbn07XG5cbmV4cG9ydHMuY3JlYXRlID0gY3JlYXRlO1xuZXhwb3J0cy5nZW5lcmF0ZSA9IGdlbmVyYXRlO1xuIiwiY29uc3QgbWluVHVybiA9IDU7XG5jb25zdCBzcGF3blR1cm5EaWZmUGVyU2hlZXBQZXJTcGF3biA9IDM7XG5sZXQgZ2FtZTtcbmxldCBtYXRyaXg7XG5sZXQgc3BlYztcbmxldCBzcGF3bnM7XG5cbmNvbnN0IGNyZWF0ZSA9IChwaGFzZXJHYW1lKSA9PiB7XG4gIGdhbWUgPSBwaGFzZXJHYW1lO1xufTtcblxuY29uc3QgZ2V0U2hlZXBQZXJTcGF3biA9ICgpID0+IHtcbiAgY29uc3Qgc2hlZXBQZXJTcGF3biA9IHNwZWMubnVtU2hlZXAgLyBzcGVjLm51bVNwYXducztcblxuICByZXR1cm4gc2hlZXBQZXJTcGF3bjtcbn07XG5cbmNvbnN0IGdldFNoZWVwUGVyU3Bhd25GbG9vciA9ICgpID0+IHtcbiAgY29uc3Qgc2hlZXBQZXJTcGF3biA9IGdldFNoZWVwUGVyU3Bhd24oKTtcbiAgY29uc3Qgc2hlZXBQZXJTcGF3bkZsb29yID0gTWF0aC5mbG9vcihzaGVlcFBlclNwYXduKTtcblxuICByZXR1cm4gc2hlZXBQZXJTcGF3bkZsb29yO1xufTtcblxuY29uc3QgZ2VuZXJhdGVFbXB0eVNwYXducyA9ICgpID0+IHtcbiAgLy8gVE9ETzogdGhyb3cgZXJyb3IgaWYgc3BlYy5udW1TaGVlcCA8IHNwZWMubnVtU3Bhd25zXG5cbiAgc3Bhd25zID0gW107XG4gIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IHNwZWMubnVtU3Bhd25zOyBpZHgrKykge1xuICAgIHNwYXducy5wdXNoKHt9KTtcbiAgfVxufTtcblxuY29uc3QgcGxhY2VTaGVlcEluU3Bhd25zID0gKCkgPT4ge1xuICAvLyBUT0RPOiByYW5kb20gbnVtYmVyIG9mIHNoZWVwICh3aXRoaW4gYm91bmRzKSBwZXIgc3Bhd24uXG5cbiAgY29uc3Qgc3RkU2hlZXBQZXJTcGF3biA9IGdldFNoZWVwUGVyU3Bhd25GbG9vcigpO1xuICBjb25zdCBtaW5TaGVlcFBlclNwYXduID0gTWF0aC5jZWlsKHN0ZFNoZWVwUGVyU3Bhd24gKiAwLjc1KTtcbiAgbGV0IG51bVNoZWVwVXNlZCA9IDA7XG4gIHNwYXducy5mb3JFYWNoKChzcGF3biwgaWR4LCBhcnJTcGF3bnMpID0+IHtcbiAgICBjb25zdCBpc0xhc3QgPSBpZHggPT09IGFyclNwYXducy5sZW5ndGggLSAxO1xuICAgIGlmIChpc0xhc3QpIHtcbiAgICAgICAgLy8gVE9ETzogdGhpcyBtZWFucyB0aGF0IHRoZSBsYXN0IHdhdmUgaXMgYWx3YXlzIHRoZSBiaWdnZXN0LCBidXQgbWF5YmUgdGhhdCdzIG9rLlxuICAgICAgICBzcGF3bi5jb3VudCA9IHNwZWMubnVtU2hlZXAgLSBudW1TaGVlcFVzZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG51bUFkZGl0aW9uYWxTaGVlcFVzZWQgPSBnYW1lLnJuZC5pbnRlZ2VySW5SYW5nZShtaW5TaGVlcFBlclNwYXduLCBzdGRTaGVlcFBlclNwYXduKTtcbiAgICAgIG51bVNoZWVwVXNlZCArPSBudW1BZGRpdGlvbmFsU2hlZXBVc2VkO1xuICAgICAgc3Bhd24uY291bnQgPSBnYW1lLnJuZC5pbnRlZ2VySW5SYW5nZShtaW5TaGVlcFBlclNwYXduLCBzdGRTaGVlcFBlclNwYXduKTtcbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3Qgc2V0U3Bhd25UdXJucyA9ICgpID0+IHtcbiAgbGV0IHR1cm4gPSBtaW5UdXJuO1xuICBjb25zdCBzaGVlcFBlclNwYXduID0gZ2V0U2hlZXBQZXJTcGF3bkZsb29yKCk7XG4gIGNvbnN0IG1heFNwYXduVHVybkRpZmYgPSBzcGF3blR1cm5EaWZmUGVyU2hlZXBQZXJTcGF3biAqIHNoZWVwUGVyU3Bhd247XG4gIHNwYXducy5mb3JFYWNoKChzcGF3bikgPT4ge1xuICAgIGNvbnN0IHNwYXduVHVybkRpZmYgPSBnYW1lLnJuZC5pbnRlZ2VySW5SYW5nZSgwLCBtYXhTcGF3blR1cm5EaWZmKTtcbiAgICBzcGF3bi50dXJuID0gdHVybjtcbiAgICB0dXJuICs9IHNwYXduVHVybkRpZmY7XG4gIH0pO1xufTtcblxuY29uc3QgZ2V0UmFuZFNpZGUgPSAoKSA9PiB7XG4gIGNvbnN0IHNpZGVzID0gWyd0b3AnLCAnYm90dG9tJywgJ2xlZnQnLCAncmlnaHQnXTtcbiAgY29uc3QgaWR4ID0gZ2FtZS5ybmQuaW50ZWdlckluUmFuZ2UoMCwgc2lkZXMubGVuZ3RoIC0gMSk7XG4gIGNvbnN0IHNpZGUgPSBzaWRlc1tpZHhdO1xuXG4gIHJldHVybiBzaWRlO1xufTtcblxuY29uc3QgZ2V0UmFuZFJvd0lkeCA9ICgpID0+IHtcbiAgY29uc3QgbWF4Um93SWR4ID0gbWF0cml4Lmxlbmd0aCAtIDE7XG4gIGNvbnN0IGlkeCA9IGdhbWUucm5kLmludGVnZXJJblJhbmdlKDAsIG1heFJvd0lkeCk7XG5cbiAgcmV0dXJuIGlkeDtcbn07XG5cbmNvbnN0IGdldFJhbmRDb2xJZHggPSAoKSA9PiB7XG4gIGNvbnN0IG1heENvbElkeCA9IG1hdHJpeFswXS5sZW5ndGggLSAxO1xuICBjb25zdCBpZHggPSBnYW1lLnJuZC5pbnRlZ2VySW5SYW5nZSgwLCBtYXhDb2xJZHgpO1xuXG4gIHJldHVybiBpZHg7XG59O1xuXG5jb25zdCBnZXRSYW5kTWF0cml4RWRnZVBvc2l0aW9uID0gKCkgPT4ge1xuICBjb25zdCBzaWRlID0gZ2V0UmFuZFNpZGUoKTtcbiAgbGV0IHBvcyA9IHt9O1xuICBpZiAoc2lkZSA9PT0gJ3RvcCcgfHwgc2lkZSA9PT0gJ2JvdHRvbScpIHtcbiAgICBwb3MuY29sSWR4ID0gZ2V0UmFuZENvbElkeCgpO1xuICAgIHBvcy5yb3dJZHggPSBzaWRlID09PSAndG9wJyA/IC0xIDogbWF0cml4Lmxlbmd0aDtcbiAgfSBlbHNlIGlmIChzaWRlID09PSAnbGVmdCcgfHwgc2lkZSA9PT0gXCJyaWdodFwiKSB7XG4gICAgcG9zLnJvd0lkeCA9IGdldFJhbmRSb3dJZHgoKTtcbiAgICBwb3MuY29sSWR4ID0gc2lkZSA9PT0gJ2xlZnQnID8gLTEgOiBtYXRyaXhbMF0ubGVuZ3RoO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzaWRlOiAnICsgc2lkZSk7XG4gIH1cblxuICByZXR1cm4gcG9zO1xufTtcblxuY29uc3Qgc2V0U3Bhd25Qb3NpdGlvbnMgPSAoKSA9PiB7XG4gIHNwYXducy5mb3JFYWNoKChzcGF3bikgPT4ge1xuICAgIGNvbnN0IHBvcyA9IGdldFJhbmRNYXRyaXhFZGdlUG9zaXRpb24oKTtcbiAgICBzcGF3bi5yb3cgPSBwb3Mucm93SWR4O1xuICAgIHNwYXduLmNvbCA9IHBvcy5jb2xJZHg7XG4gIH0pO1xufTtcblxuY29uc3Qgc2V0U3Bhd25EaXJlY3Rpb25zID0gKCkgPT4ge1xuICBzcGF3bnMuZm9yRWFjaCgoc3Bhd24pID0+IHtcbiAgICBjb25zdCBwb3MgPSB7XG4gICAgICByb3dJZHg6IHNwYXduLnJvdyxcbiAgICAgIGNvbElkeDogc3Bhd24uY29sXG4gICAgfTtcbiAgICBsZXQgZGlyO1xuICAgIGlmIChwb3Mucm93SWR4ID09PSAtMSkge1xuICAgICAgZGlyID0gJ2Rvd24nO1xuICAgIH0gZWxzZSBpZiAocG9zLnJvd0lkeCA9PT0gbWF0cml4Lmxlbmd0aCkge1xuICAgICAgZGlyID0gJ3VwJztcbiAgICB9IGVsc2UgaWYgKHBvcy5jb2xJZHggPT09IC0xKSB7XG4gICAgICBkaXIgPSAncmlnaHQnO1xuICAgIH0gZWxzZSBpZiAocG9zLmNvbElkeCA9PT0gbWF0cml4WzBdLmxlbmd0aCkge1xuICAgICAgZGlyID0gJ2xlZnQnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3Bhd24gcG9zaXRpb246IHJvdyAnICsgcG9zLnJvd0lkeCArICcsIGNvbCAnICsgcG9zLmNvbElkeCk7XG4gICAgfVxuICAgIHNwYXduLmRpciA9IGRpcjtcbiAgfSk7XG59O1xuXG5jb25zdCBnZW5lcmF0ZSA9IChzcGF3blNwZWMsIHRpbGVNYXRyaXgpID0+IHtcbiAgc3BlYyA9IHNwYXduU3BlYztcbiAgbWF0cml4ID0gdGlsZU1hdHJpeDtcbiAgZ2VuZXJhdGVFbXB0eVNwYXducygpO1xuICBwbGFjZVNoZWVwSW5TcGF3bnMoKTtcbiAgc2V0U3Bhd25UdXJucygpO1xuICBzZXRTcGF3blBvc2l0aW9ucygpO1xuICBzZXRTcGF3bkRpcmVjdGlvbnMoKTtcblxuICByZXR1cm4gc3Bhd25zO1xufTtcblxuZXhwb3J0cy5jcmVhdGUgPSBjcmVhdGU7XG5leHBvcnRzLmdlbmVyYXRlID0gZ2VuZXJhdGU7XG4iLCIvKiBnbG9iYWxzIFBoYXNlciAqL1xyXG5cclxuY29uc3QgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcclxuY29uc3Qgc2lnbmFscyA9IHJlcXVpcmUoJy4vc2lnbmFscycpO1xyXG5jb25zdCB0aWxlU2hpZnRlciA9IHJlcXVpcmUoJy4vdGlsZS1zaGlmdGVyJyk7XHJcbmNvbnN0IHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xyXG5cclxuY29uc3QgeyBFTkVSR1lfUEVSX1RZUEUgfSA9IGNvbnN0YW50cztcclxuXHJcbmNvbnN0IFNUQVRFUyA9IHtcclxuICBQTEFZOiBTeW1ib2woJ1BMQVknKSxcclxuICBXSU46IFN5bWJvbCgnV0lOJyksXHJcbiAgTE9TRTogU3ltYm9sKCdMT1NFJylcclxufTtcclxuXHJcbmxldCBjdXJyZW50TGV2ZWw7XHJcblxyXG5mdW5jdGlvbiB0aHJvd1ZhbGlkYXRpb25FcnJvcigpIHtcclxuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IoKTtcclxuICBlcnJvci5pc1ZhbGlkYXRpb24gPSB0cnVlO1xyXG4gIHRocm93IGVycm9yO1xyXG59XHJcblxyXG5mdW5jdGlvbiBleHBlY3RFcXVhbCh2YWwxLCB2YWwyKSB7XHJcbiAgaWYgKHZhbDEgIT09IHZhbDIpIHtcclxuICAgIHRocm93VmFsaWRhdGlvbkVycm9yKCk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBleHBlY3RJblJhbmdlKHZhbCwgbWluLCBtYXgpIHtcclxuICBpZiAodmFsIDwgbWluIHx8IHZhbCA+IG1heCkge1xyXG4gICAgdGhyb3dWYWxpZGF0aW9uRXJyb3IoKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHZhbGlkYXRlU3Bhd25zKCkge1xyXG4gIGNvbnN0IHNpemUgPSBnZXRTaXplKCk7XHJcbiAgbGV0IGN1cnJlbnRTcGF3bjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGN1cnJlbnRMZXZlbC5zcGF3bnMuZm9yRWFjaChzcGF3biA9PiB7XHJcbiAgICAgIGN1cnJlbnRTcGF3biA9IHNwYXduO1xyXG5cclxuICAgICAgaWYgKHNwYXduLnR1cm4gPCA1KSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTcGF3biBtdXN0IG5vdCBzdGFydCBiZWZvcmUgdHVybiA1Jyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChzcGF3bi5kaXIgPT09ICd1cCcpIHtcclxuICAgICAgICBleHBlY3RFcXVhbChzcGF3bi5yb3csIHNpemUueSk7XHJcbiAgICAgICAgZXhwZWN0SW5SYW5nZShzcGF3bi5jb2wsIDAsIHNpemUueCAtIDEpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKHNwYXduLmRpciA9PT0gJ2Rvd24nKSB7XHJcbiAgICAgICAgZXhwZWN0RXF1YWwoc3Bhd24ucm93LCAtMSk7XHJcbiAgICAgICAgZXhwZWN0SW5SYW5nZShzcGF3bi5jb2wsIDAsIHNpemUueCAtIDEpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKHNwYXduLmRpciA9PT0gJ2xlZnQnKSB7XHJcbiAgICAgICAgZXhwZWN0RXF1YWwoc3Bhd24uY29sLCBzaXplLngpO1xyXG4gICAgICAgIGV4cGVjdEluUmFuZ2Uoc3Bhd24ucm93LCAwLCBzaXplLnkgLSAxKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChzcGF3bi5kaXIgPT09ICdyaWdodCcpIHtcclxuICAgICAgICBleHBlY3RFcXVhbChzcGF3bi5jb2wsIC0xKTtcclxuICAgICAgICBleHBlY3RJblJhbmdlKHNwYXduLnJvdywgMCwgc2l6ZS55IC0gMSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuICBjYXRjaCAoZSkge1xyXG4gICAgaWYgKGUuaXNWYWxpZGF0aW9uKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzcGF3biBwb3NpdGlvbiAocm93ICcgKyBjdXJyZW50U3Bhd24ucm93ICsgJyBjb2wgJyArIGN1cnJlbnRTcGF3bi5jb2wgKyAnKScpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRocm93IGU7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRTaXplKCkge1xyXG4gIHJldHVybiBuZXcgUGhhc2VyLlBvaW50KGN1cnJlbnRMZXZlbC50aWxlc1swXS5sZW5ndGgsIGN1cnJlbnRMZXZlbC50aWxlcy5sZW5ndGgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRUaWxlWFkoeCwgeSkge1xyXG4gIHJldHVybiBjdXJyZW50TGV2ZWwudGlsZXNbeV1beF07XHJcbn1cclxuXHJcbmV4cG9ydHMuZ2V0U2l6ZSA9IGdldFNpemU7XHJcbmV4cG9ydHMuZ2V0VGlsZVhZID0gZ2V0VGlsZVhZO1xyXG5cclxuZXhwb3J0cy5nZXRBbGxTaGVlcFNvdXJjZXMgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gY3VycmVudExldmVsLnNwYXducztcclxufTtcclxuXHJcbmV4cG9ydHMuZ2V0RGVmID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIGN1cnJlbnRMZXZlbC5kZWY7XHJcbn07XHJcblxyXG5leHBvcnRzLmdldEVuZXJneSA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiBjdXJyZW50TGV2ZWwuZW5lcmd5O1xyXG59O1xyXG5cclxuZXhwb3J0cy5nZXRFbmVyZ3lSZXF1aXJlZCA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiBjdXJyZW50TGV2ZWwuZGVmLmVuZXJneVJlcXVpcmVkO1xyXG59O1xyXG5cclxuZXhwb3J0cy5nZXREaWFsb2cgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gY3VycmVudExldmVsLmRlZi5kaWFsb2c7XHJcbn07XHJcblxyXG5leHBvcnRzLmhhc1dvbiA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiBjdXJyZW50TGV2ZWwuc3RhdGUgPT09IFNUQVRFUy5XSU47XHJcbn07XHJcblxyXG5leHBvcnRzLmhhc0xvc3QgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gY3VycmVudExldmVsLnN0YXRlID09PSBTVEFURVMuTE9TRTtcclxufTtcclxuXHJcbmV4cG9ydHMuaXNHYW1lT3ZlciA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiBleHBvcnRzLmhhc1dvbigpIHx8IGV4cG9ydHMuaGFzTG9zdCgpO1xyXG59O1xyXG5cclxuZXhwb3J0cy5nZXRUdXJuID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIGN1cnJlbnRMZXZlbC50dXJuO1xyXG59O1xyXG5cclxuZXhwb3J0cy5nZXRUaWxlID0gZnVuY3Rpb24ocG9pbnQpIHtcclxuICByZXR1cm4gZ2V0VGlsZVhZKHBvaW50LngsIHBvaW50LnkpO1xyXG59O1xyXG5cclxuZXhwb3J0cy5uZXh0VHVybiA9IGZ1bmN0aW9uKCkge1xyXG4gIGN1cnJlbnRMZXZlbC50dXJuKys7XHJcbn07XHJcblxyXG5leHBvcnRzLmlzUG9pbnRJbkxldmVsID0gZnVuY3Rpb24ocG9pbnQpIHtcclxuICBjb25zdCBzaXplID0gZ2V0U2l6ZSgpO1xyXG5cclxuICByZXR1cm4gKFxyXG4gICAgcG9pbnQueCA+PSAwICYmIHBvaW50LnggPCBzaXplLnggJiZcclxuICAgIHBvaW50LnkgPj0gMCAmJiBwb2ludC55IDwgc2l6ZS55XHJcbiAgKTtcclxufTtcclxuXHJcbmV4cG9ydHMuc3RhcnRMZXZlbCA9IGZ1bmN0aW9uKGRlZikge1xyXG4gIGlmICghKCdzdGFydGluZ0VuZXJneScgaW4gZGVmKSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdTdGFydGluZyBlbmVyZ3kgbm90IGRlZmluZWQgZm9yIGxldmVsJyk7XHJcbiAgfVxyXG5cclxuICBpZiAoISgnZW5lcmd5UmVxdWlyZWQnIGluIGRlZikpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgZW5lcmd5IG5vdCBkZWZpbmVkIGZvciBsZXZlbCcpO1xyXG4gIH1cclxuXHJcbiAgY3VycmVudExldmVsID0ge1xyXG4gICAgZGVmOiBkZWYsXHJcbiAgICB0aWxlczogdXRpbHMuY2xvbmUoZGVmLm1hdHJpeCksIC8vIE9wZXJhdGUgb24gYSBjb3B5LCBkbyBub3QgbW9kaWZ5IGRlZlxyXG4gICAgc3Bhd25zOiB1dGlscy5jbG9uZShkZWYuc3Bhd25zKSxcclxuICAgIHN0YXRlOiBTVEFURVMuUExBWSxcclxuICAgIHR1cm46IDAsXHJcbiAgICBlbmVyZ3k6IGRlZi5zdGFydGluZ0VuZXJneSxcclxuICAgIHdhdmVzU3RhcnRlZDogMFxyXG4gIH07XHJcblxyXG4gIHZhbGlkYXRlU3Bhd25zKCk7XHJcblxyXG4gIHRpbGVTaGlmdGVyLnNldE9uU2hpZnQoZW5lcmd5Q29zdCA9PiB7XHJcbiAgICBpZiAoY3VycmVudExldmVsLmVuZXJneSA8IGVuZXJneUNvc3QpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgZW5vdWdoIGVuZXJneScpO1xyXG4gICAgfVxyXG5cclxuICAgIGN1cnJlbnRMZXZlbC5lbmVyZ3kgLT0gZW5lcmd5Q29zdDtcclxuICB9KTtcclxufTtcclxuXHJcbmV4cG9ydHMub25TaGVlcEFiZHVjdGVkID0gZnVuY3Rpb24oc2hlZXBUeXBlKSB7XHJcbiAgY3VycmVudExldmVsLmVuZXJneSArPSBFTkVSR1lfUEVSX1RZUEVbc2hlZXBUeXBlXTtcclxuXHJcbiAgaWYgKGN1cnJlbnRMZXZlbC5lbmVyZ3kgPj0gY3VycmVudExldmVsLmRlZi5lbmVyZ3lSZXF1aXJlZCkge1xyXG4gICAgY3VycmVudExldmVsLnN0YXRlID0gU1RBVEVTLldJTjtcclxuICB9XHJcblxyXG4gIHNpZ25hbHMuc2hlZXBBYmR1Y3RlZC5kaXNwYXRjaCgpO1xyXG59O1xyXG5cclxuZXhwb3J0cy5zd2FwVGlsZXMgPSBmdW5jdGlvbih0aWxlMSwgdGlsZTIpIHtcclxuICBjb25zdCByb3cxID0gdGlsZTEuY3VzdG9tLnJvdztcclxuICBjb25zdCBjb2wxID0gdGlsZTEuY3VzdG9tLmNvbDtcclxuICBjb25zdCByb3cyID0gdGlsZTIuY3VzdG9tLnJvdztcclxuICBjb25zdCBjb2wyID0gdGlsZTIuY3VzdG9tLmNvbDtcclxuICBjb25zdCB0aWxlcyA9IGN1cnJlbnRMZXZlbC50aWxlcztcclxuICBbIHRpbGVzW3JvdzFdW2NvbDFdLCB0aWxlc1tyb3cyXVtjb2wyXSBdID0gWyB0aWxlc1tyb3cyXVtjb2wyXSwgdGlsZXNbcm93MV1bY29sMV0gXTtcclxufTtcclxuXHJcbnNpZ25hbHMud2F2ZVN0YXJ0ZWQuYWRkKCgpID0+IHsgY3VycmVudExldmVsLndhdmVzU3RhcnRlZCsrOyB9KTtcclxuXHJcbmV4cG9ydHMuZ2V0V2F2ZXNMZWZ0ID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIGN1cnJlbnRMZXZlbC5zcGF3bnMubGVuZ3RoIC0gY3VycmVudExldmVsLndhdmVzU3RhcnRlZDtcclxufTtcclxuIiwiLyogZ2xvYmFscyBQaGFzZXIsIGdhbWUsIFBsYXkgKi9cclxuXHJcbmNvbnN0IGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XHJcbmNvbnN0IGxldmVsR2VuZXJhdG9yID0gcmVxdWlyZSgnLi9sZXZlbC1nZW5lcmF0b3IvbGV2ZWwtZ2VuZXJhdG9yJyk7XHJcbmNvbnN0IGxldmVsTWFuYWdlciA9IHJlcXVpcmUoJy4vbGV2ZWwtbWFuYWdlcicpO1xyXG5jb25zdCBwcmVsb2FkID0gcmVxdWlyZSgnLi9wcmVsb2FkJyk7XHJcbmNvbnN0IHNlbGVjdGVkVGlsZU92ZXJsYXkgPSByZXF1aXJlKCcuL3NlbGVjdGVkLXRpbGUtb3ZlcmxheScpO1xyXG5jb25zdCBzaWduYWxzID0gcmVxdWlyZSgnLi9zaWduYWxzJyk7XHJcbmNvbnN0IHRpbGVTaGlmdGVyID0gcmVxdWlyZSgnLi90aWxlLXNoaWZ0ZXInKTtcclxuY29uc3QgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcblxyXG5jb25zdCB7XHJcbiAgQU5JTV9GUkFNRVJBVEUsXHJcbiAgU0hFRVBfTU9WRV9EVVJBVElPTixcclxuICBTSEVFUFRZUEVTLFxyXG4gIFNQQVdOX0lOVEVSVkFMLFxyXG4gIFRJTEVTSVpFLFxyXG4gIFRVUk5fRFVSQVRJT04sXHJcbiAgVFVUT1JJQUxfTEVWRUxfQ09VTlRcclxufSA9IGNvbnN0YW50cztcclxuXHJcbmxldCB0eXBlcztcclxubGV0IGxldmVsSW5kZXggPSAwOyAvLyBUaGUgZmlyc3QgbGV2ZWwgd2lsbCBiZSB0aGlzICsgMVxyXG5cclxuc2lnbmFscy50dXRvcmlhbFN0YXJ0ZWQuYWRkKCgpID0+IHsgbGV2ZWxJbmRleCA9IDA7IH0pO1xyXG5cclxubGV0IHNob3BlOyAvLyBUaGUgcGx1cmFsIG9mICdzaGVlcCcgdGhhdCB3ZSBtYWRlIHVwXHJcbmxldCBncmFzc2VzZXM7XHJcbmxldCBzb3VyY2VzO1xyXG5sZXQgZG9ncztcclxubGV0IGJsb29kcztcclxubGV0IGZhY2lsaXRpZXM7XHJcbmxldCBzcGFjZXNoaXA7XHJcblxyXG5sZXQgdG9wTGVmdDtcclxubGV0IHRpbGVVbmRlck1vdXNlO1xyXG5sZXQgbmV4dExldmVsQnV0dG9uO1xyXG5sZXQgbGV2ZWxDb21wbGV0ZTtcclxubGV0IG5leHREaWFsb2dCdXR0b247XHJcbmxldCBiYXJCaXRtYXA7XHJcbmxldCBkaXNwbGF5VGV4dGJveCA9IC0xO1xyXG52YXIgYm1kO1xyXG52YXIgZHJhd25PYmplY3Q7XHJcbmxldCB0ZXh0O1xyXG5sZXQgc3BhY2VzaGlwU291bmRJbmRleCA9IC0xO1xyXG5sZXQgZGlzcGxheVNwZWFrZXI7XHJcblxyXG5mdW5jdGlvbiBnZXRUaWxlVG9wTGVmdCh4LCB5KSB7XHJcbiAgcmV0dXJuIG5ldyBQaGFzZXIuUG9pbnQodG9wTGVmdC54ICsgVElMRVNJWkUgKiB4LCB0b3BMZWZ0LnkgKyBUSUxFU0laRSAqIHkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRTaGVlcFBvcyh4LCB5LCBvZmZzZXQpIHtcclxuICB2YXIgcG9pbnQgPSBnZXRUaWxlVG9wTGVmdCh4LCB5KTtcclxuICBwb2ludC5hZGQob2Zmc2V0LngsIG9mZnNldC55KTtcclxuICByZXR1cm4gcG9pbnQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHR3ZWVuU2hlZXAoc2hlZXAsIGN1cnJlbnRQb3MpIHtcclxuICBjb25zdCBuZXh0UG9zID0gdXRpbHMuZ2V0TmV4dFBvcyhjdXJyZW50UG9zLngsIGN1cnJlbnRQb3MueSwgc2hlZXAuY3VzdG9tLmRpciwgMSk7XHJcbiAgc2hlZXAuY3VzdG9tLnRhcmdldFBvcyA9IG5leHRQb3M7XHJcbiAgY29uc3QgbmV4dFBvc1B4ID0gZ2V0U2hlZXBQb3MobmV4dFBvcy54LCBuZXh0UG9zLnksIHNoZWVwLmN1c3RvbS5vZmZzZXQpO1xyXG4gIGNvbnN0IHR3ZWVuID0gZ2FtZS5hZGQudHdlZW4oc2hlZXApLnRvKG5leHRQb3NQeCwgU0hFRVBfTU9WRV9EVVJBVElPTiwgUGhhc2VyLkVhc2luZy5MaW5lYXIuTm9uZSwgdHJ1ZSk7XHJcbiAgdHdlZW4ub25Db21wbGV0ZS5hZGQoc2hlZXBUd2VlbkNvbXBsZXRlLCBzaGVlcCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNoZWVwVHdlZW5Db21wbGV0ZSgpIHtcclxuICBjb25zdCBzaGVlcCA9IHRoaXM7XHJcbiAgY29uc3QgY3VycmVudFBvcyA9IHNoZWVwLmN1c3RvbS50YXJnZXRQb3M7XHJcblxyXG4gIGlmICghbGV2ZWxNYW5hZ2VyLmlzUG9pbnRJbkxldmVsKGN1cnJlbnRQb3MpKSB7XHJcbiAgICAvLyBUT0RPOiBhbmltYXRlIHNoZWVwIGZhbGxpbmcgaW50byBzcGFjZVxyXG4gICAgc2hlZXAua2lsbCgpO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIGNvbnN0IHRpbGUgPSBsZXZlbE1hbmFnZXIuZ2V0VGlsZShjdXJyZW50UG9zKTtcclxuXHJcbiAgICBpZiAodGlsZS50eXBlID09PSAnc3BhY2VzaGlwJykge1xyXG4gICAgICBzaGVlcC5raWxsKCk7XHJcbiAgICAgIGxldmVsTWFuYWdlci5vblNoZWVwQWJkdWN0ZWQoc2hlZXAuY3VzdG9tLnR5cGUpO1xyXG4gICAgICBzcGFjZXNoaXBTb3VuZEluZGV4Kys7XHJcbiAgICAgIGlmIChzcGFjZXNoaXBTb3VuZEluZGV4ICUgNCA9PT0gMCB8fCBzcGFjZXNoaXBTb3VuZEluZGV4ID09PSAwKSB7XHJcblxyXG4gICAgICBQbGF5LnNwYWNlc2hpcF9waGFzZXIoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGxldmVsTWFuYWdlci5oYXNXb24oKSkge1xyXG4gICAgICAgIGxldmVsQ29tcGxldGUudmlzaWJsZSA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmIChsZXZlbEluZGV4ICE9PSBUVVRPUklBTF9MRVZFTF9DT1VOVCkge1xyXG4gICAgICAgICAgbmV4dExldmVsQnV0dG9uLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGNvbnN0IHNoZWVwVHlwZSA9IHNoZWVwLmN1c3RvbS50eXBlO1xyXG5cclxuICAgICAgaWYgKHRpbGUudHlwZSA9PT0gJ2RvZycpIHtcclxuICAgICAgICBzaGVlcC5jdXN0b20uZGlyID0gdGlsZS5kaXI7XHJcbiAgICAgICAgc2hlZXAuYW5pbWF0aW9ucy5wbGF5KHRpbGUuZGlyKTtcclxuICAgICAgICAvL1BsYXkuc2hlZXBfc2xvdygpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKHRpbGUudHlwZSA9PT0gJ3NoZWFyZXJ5Jykge1xyXG4gICAgICAgIGlmIChzaGVlcFR5cGUgPT09IFNIRUVQVFlQRVMuTk9STUFMIHx8IHNoZWVwVHlwZSA9PT0gU0hFRVBUWVBFUy5GTFVGRlkpIHtcclxuICAgICAgICAgIHNoZWVwLmN1c3RvbS50eXBlID0gU0hFRVBUWVBFUy5TSE9STjtcclxuICAgICAgICAgIHNoZWVwLmxvYWRUZXh0dXJlKCdzaG9ybi1zaGVlcCcsIG51bGwsIGZhbHNlKTtcclxuICAgICAgICAgIFBsYXkuc2hlYXJpbmcoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAodGlsZS50eXBlID09PSAnd2FzaCcpIHtcclxuICAgICAgICBpZiAoc2hlZXBUeXBlID09PSBTSEVFUFRZUEVTLk5PUk1BTCkge1xyXG4gICAgICAgICAgc2hlZXAuY3VzdG9tLnR5cGUgPSBTSEVFUFRZUEVTLkZMVUZGWTtcclxuICAgICAgICAgIHNoZWVwLmxvYWRUZXh0dXJlKCdmbHVmZnktc2hlZXAnLCBudWxsLCBmYWxzZSk7XHJcbiAgICAgICAgICBQbGF5LnNwbGFzaCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICh0aWxlLnR5cGUgPT09ICdzY2FycmVyeScpIHtcclxuICAgICAgICBpZiAoc2hlZXBUeXBlICE9PSBTSEVFUFRZUEVTLlNDQVJSRUQpIHtcclxuICAgICAgICAgIHNoZWVwLmN1c3RvbS50eXBlID0gU0hFRVBUWVBFUy5TQ0FSUkVEO1xyXG4gICAgICAgICAgc2hlZXAubG9hZFRleHR1cmUoJ3NjYXJyZWQtc2hlZXAnLCBudWxsLCBmYWxzZSk7XHJcbiAgICAgICAgICBQbGF5LnNoZWVwX2ZyaWdodGVuZWQoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAodGlsZS50eXBlID09PSAnY2hhcGVsJykge1xyXG4gICAgICAgIGlmIChzaGVlcFR5cGUgPT09IFNIRUVQVFlQRVMuU0NBUlJFRCkge1xyXG4gICAgICAgICAgc2hlZXAuY3VzdG9tLnR5cGUgPSBTSEVFUFRZUEVTLk5PUk1BTDtcclxuICAgICAgICAgIHNoZWVwLmxvYWRUZXh0dXJlKCdzaGVlcCcsIG51bGwsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAodGlsZS50eXBlID09PSAnd29sZicpIHtcclxuICAgICAgICBzaGVlcC5raWxsKCk7XHJcbiAgICAgICAgUGxheS5zaGVlcF9mYXN0KCk7XHJcblxyXG4gICAgICAgIGlmICghdGlsZS5ibG9vZFJlbmRlcmVkKSB7XHJcbiAgICAgICAgICBjb25zdCB0aWxlVG9wTGVmdCA9IGdldFRpbGVUb3BMZWZ0KGN1cnJlbnRQb3MueCwgY3VycmVudFBvcy55KTtcclxuICAgICAgICAgIGNvbnN0IGJsb29kID0gYmxvb2RzLmNyZWF0ZSh0aWxlVG9wTGVmdC54ICsgMTAsIHRpbGVUb3BMZWZ0LnkgKyAzMCwgJ2Jsb29kJyk7XHJcbiAgICAgICAgICBibG9vZC5zY2FsZS5zZXQoMC43KTtcclxuICAgICAgICAgIHRpbGUuYmxvb2RSZW5kZXJlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoc2hlZXAuYWxpdmUpIHtcclxuICAgICAgICB0d2VlblNoZWVwKHNoZWVwLCBjdXJyZW50UG9zKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc3Bhd25TaGVlcCgpIHtcclxuICBjb25zdCBzb3VyY2UgPSB0aGlzO1xyXG4gIGNvbnN0IHsgY29sLCByb3cgfSA9IHNvdXJjZTtcclxuXHJcbiAgY29uc3Qgb2Zmc2V0ID0gbmV3IFBoYXNlci5Qb2ludChcclxuICAgIGdhbWUucm5kLmJldHdlZW4oMywgMTApLFxyXG4gICAgZ2FtZS5ybmQuYmV0d2VlbigxMCwgMjApXHJcbiAgKTtcclxuXHJcbiAgY29uc3Qgc2hlZXBQb3MgPSBnZXRTaGVlcFBvcyhjb2wsIHJvdywgb2Zmc2V0KTtcclxuICBjb25zdCBjcmVhdGluZ05ldyA9IHNob3BlLmNvdW50RGVhZCgpID09PSAwO1xyXG4gIGNvbnN0IHNoZWVwID0gc2hvcGUuZ2V0Rmlyc3REZWFkKHRydWUsIHNoZWVwUG9zLngsIHNoZWVwUG9zLnksICdzaGVlcCcpO1xyXG5cclxuICBpZiAoY3JlYXRpbmdOZXcpIHtcclxuICAgIHNoZWVwLmFuaW1hdGlvbnMuYWRkKCdkb3duJywgWzksIDEwLCAxMV0sIEFOSU1fRlJBTUVSQVRFLCB0cnVlKTtcclxuICAgIHNoZWVwLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzYsIDcsIDhdLCBBTklNX0ZSQU1FUkFURSwgdHJ1ZSk7XHJcbiAgICBzaGVlcC5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbMywgNCwgNV0sIEFOSU1fRlJBTUVSQVRFLCB0cnVlKTtcclxuICAgIHNoZWVwLmFuaW1hdGlvbnMuYWRkKCd1cCcsIFswLCAxLCAyXSwgQU5JTV9GUkFNRVJBVEUsIHRydWUpO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIC8vIENhbmNlbCBleGlzdGluZyB0d2VlbnM/XHJcbiAgfVxyXG5cclxuICBzaGVlcC5hbmltYXRpb25zLnBsYXkoc291cmNlLmRpcik7XHJcblxyXG4gIHNoZWVwLmN1c3RvbSA9IHtcclxuICAgIHR5cGU6IFNIRUVQVFlQRVMuTk9STUFMLFxyXG4gICAgb2Zmc2V0OiBvZmZzZXQsXHJcbiAgICBkaXI6IHNvdXJjZS5kaXJcclxuICB9O1xyXG5cclxuICBjb25zdCBjdXJyZW50UG9zID0gbmV3IFBoYXNlci5Qb2ludChjb2wsIHJvdyk7XHJcbiAgdHdlZW5TaGVlcChzaGVlcCwgY3VycmVudFBvcyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZFNvdXJjZVNwcml0ZShzb3VyY2UpIHtcclxuICBjb25zdCB7IHJvdywgY29sIH0gPSBzb3VyY2U7XHJcbiAgY29uc3QgdGlsZVRvcExlZnQgPSBnZXRUaWxlVG9wTGVmdChjb2wsIHJvdyk7XHJcbiAgc291cmNlLnNwcml0ZSA9IHNvdXJjZXMuY3JlYXRlKHRpbGVUb3BMZWZ0LngsIHRpbGVUb3BMZWZ0LnkgKyAxMCwgJ3NoZWVwLXNvdXJjZScpO1xyXG4gIHNvdXJjZS5zcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ3N3aXJsJyk7XHJcbiAgc291cmNlLnNwcml0ZS5hbmltYXRpb25zLnBsYXkoJ3N3aXJsJywgQU5JTV9GUkFNRVJBVEUsIHRydWUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhY3RpdmF0ZVNoZWVwU291cmNlcygpIHtcclxuICBsZXZlbE1hbmFnZXIuZ2V0QWxsU2hlZXBTb3VyY2VzKCkuZm9yRWFjaChzb3VyY2UgPT4ge1xyXG4gICAgaWYgKHNvdXJjZS50dXJuID09PSBsZXZlbE1hbmFnZXIuZ2V0VHVybigpKSB7XHJcbiAgICAgIGRlbGV0ZSBzb3VyY2UuYWN0aXZhdGluZztcclxuICAgICAgc291cmNlLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgIHNpZ25hbHMud2F2ZVN0YXJ0ZWQuZGlzcGF0Y2goKTtcclxuXHJcbiAgICAgIGNvbnN0IHRpbWVyID0gZ2FtZS50aW1lLmNyZWF0ZSh0cnVlKTtcclxuICAgICAgdGltZXIucmVwZWF0KFNQQVdOX0lOVEVSVkFMLCBzb3VyY2UuY291bnQsIHNwYXduU2hlZXAsIHNvdXJjZSk7XHJcblxyXG4gICAgICB0aW1lci5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XHJcbiAgICAgICAgLy8gRmFkZSBvdXRcclxuICAgICAgICBjb25zdCB0d2VlbiA9IGdhbWUuYWRkLnR3ZWVuKHNvdXJjZS5zcHJpdGUpLnRvKHsgYWxwaGE6IDAgfSwgMTAwMCwgbnVsbCwgdHJ1ZSwgNTAwKTtcclxuICAgICAgICB0d2Vlbi5vbkNvbXBsZXRlLmFkZCgoKSA9PiBzb3VyY2Uuc3ByaXRlLmRlc3Ryb3koKSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGltZXIuc3RhcnQoKTtcclxuXHJcbiAgICAgIHNpZ25hbHMubmV3TGV2ZWwuYWRkT25jZSgoKSA9PiB7IHRpbWVyLnN0b3AoKTsgfSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICghc291cmNlLmFjdGl2ZSAmJiAhc291cmNlLmFjdGl2YXRpbmcgJiYgc291cmNlLnR1cm4gPCBsZXZlbE1hbmFnZXIuZ2V0VHVybigpICsgNSkge1xyXG4gICAgICBzb3VyY2UuYWN0aXZhdGluZyA9IHRydWU7XHJcbiAgICAgIFBsYXkuc3BhY2VzaGlwX2JlYW4oKTtcclxuICAgICAgYWRkU291cmNlU3ByaXRlKHNvdXJjZSk7XHJcblxyXG4gICAgICBjb25zdCB0dXJuc0xlZnQgPSBzb3VyY2UudHVybiAtIGxldmVsTWFuYWdlci5nZXRUdXJuKCk7XHJcbiAgICAgIGNvbnN0IHRpbWVMZWZ0ID0gdHVybnNMZWZ0ICogVFVSTl9EVVJBVElPTjtcclxuXHJcbiAgICAgIC8vIEZhZGUgaW5cclxuICAgICAgc291cmNlLnNwcml0ZS5hbHBoYSA9IDA7XHJcbiAgICAgIGdhbWUuYWRkLnR3ZWVuKHNvdXJjZS5zcHJpdGUpLnRvKHsgYWxwaGE6IDEgfSwgdGltZUxlZnQsIG51bGwsIHRydWUpO1xyXG5cclxuICAgICAgLy8gUHVsc2F0aW5nIGFycm93XHJcbiAgICAgIGNvbnN0IHsgcm93LCBjb2wgfSA9IHNvdXJjZTtcclxuICAgICAgbGV0IHBvaW50ID0gZ2V0VGlsZVRvcExlZnQoY29sLCByb3cpOyAvLyB0b3AgbGVmdFxyXG4gICAgICBwb2ludC5hZGQoVElMRVNJWkUgLyAyLCBUSUxFU0laRSAvIDIpOyAvLyBjZW50ZXJcclxuICAgICAgcG9pbnQgPSB1dGlscy5nZXROZXh0UG9zKHBvaW50LngsIHBvaW50LnksIHNvdXJjZS5kaXIsIFRJTEVTSVpFIC8gMik7IC8vIG1vdmUgaGFsZiBhIHRpbGUgaW4gdGhlIHNvdXJjZSBkaXJlY3Rpb25cclxuICAgICAgY29uc3QgYXJyb3cgPSBnYW1lLmFkZC5zcHJpdGUocG9pbnQueCwgcG9pbnQueSwgJ2Fycm93Jyk7XHJcbiAgICAgIGFycm93LmFuY2hvci5zZXQoMC41KTsgLy8gYWxpZ24gdGhlIGNlbnRlciBvZiB0aGUgYXJyb3cgdG8gaXRzIHBvc2l0aW9uXHJcbiAgICAgIGFycm93LmFuZ2xlID0gdXRpbHMuZ2V0QW5nbGUoc291cmNlLmRpcik7XHJcbiAgICAgIGFycm93LmFscGhhID0gMDtcclxuICAgICAgY29uc3QgdHdlZW4gPSBnYW1lLmFkZC50d2VlbihhcnJvdykudG8oeyBhbHBoYTogMSB9LCBUVVJOX0RVUkFUSU9OIC8gMiwgUGhhc2VyLkVhc2luZy5RdWFkcmF0aWMuSW5PdXQsIHRydWUsIDAsIHR1cm5zTGVmdCwgdHJ1ZSk7XHJcbiAgICAgIHR3ZWVuLm9uQ29tcGxldGUuYWRkKCgpID0+IGFycm93LmRlc3Ryb3koKSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG5leHRUdXJuKCkge1xyXG4gIGxldmVsTWFuYWdlci5uZXh0VHVybigpO1xyXG4gIGFjdGl2YXRlU2hlZXBTb3VyY2VzKCk7XHJcbn1cclxuXHJcbmNvbnN0IGdlbmVyYXRlVGVzdExldmVsID0gKCkgPT4ge1xyXG4gIGNvbnN0IHNwZWMgPSBnYW1lLmNhY2hlLmdldEpTT04oJ2xldmVsLXNwZWMtOCcpO1xyXG4gIGNvbnN0IGxldmVsID0gbGV2ZWxHZW5lcmF0b3IuZ2VuZXJhdGUoc3BlYyk7XHJcblxyXG4gIHJldHVybiBsZXZlbDtcclxufTtcclxuXHJcbmZ1bmN0aW9uIGxvYWRMZXZlbChpbmRleCwgcmVnZW5lcmF0ZSkge1xyXG4gIGxldmVsQ29tcGxldGUudmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuICBsZXQganNvbjtcclxuXHJcbiAgaWYgKGdhbWUuY3VzdG9tLnJhbmRvbUxldmVsTW9kZSkge1xyXG4gICAganNvbiA9IHJlZ2VuZXJhdGUgPyBnZW5lcmF0ZVRlc3RMZXZlbCgpIDogbGV2ZWxNYW5hZ2VyLmdldERlZigpO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIG5leHRMZXZlbEJ1dHRvbi52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgY29uc3Qga2V5ID0gJ2xldmVsLScgKyBpbmRleDtcclxuICAgIGpzb24gPSBnYW1lLmNhY2hlLmdldEpTT04oa2V5KTtcclxuICB9XHJcblxyXG4gIGxldmVsTWFuYWdlci5zdGFydExldmVsKGpzb24pO1xyXG4gIGNvbnN0IGhhbGZTaXplUHggPSBsZXZlbE1hbmFnZXIuZ2V0U2l6ZSgpLmNsb25lKCkubXVsdGlwbHkoVElMRVNJWkUgLyAyLCBUSUxFU0laRSAvIDIpO1xyXG4gIHRvcExlZnQgPSBuZXcgUGhhc2VyLlBvaW50KGdhbWUud29ybGQuY2VudGVyWCAtIGhhbGZTaXplUHgueCwgZ2FtZS53b3JsZC5jZW50ZXJZIC0gaGFsZlNpemVQeC55KTtcclxuXHJcbiAgLy8gVE9ETzogcmV1c2UgcG9vbGVkIHNwcml0ZXMgaW5zdGVhZCBvZiBkZXN0cm95aW5nIGFuZCByZWNyZWF0aW5nP1xyXG4gIGdyYXNzZXNlcy5yZW1vdmVBbGwodHJ1ZSk7XHJcbiAgc291cmNlcy5yZW1vdmVBbGwodHJ1ZSk7XHJcbiAgc2hvcGUucmVtb3ZlQWxsKHRydWUpO1xyXG4gIGRvZ3MucmVtb3ZlQWxsKHRydWUpO1xyXG4gIGJsb29kcy5yZW1vdmVBbGwodHJ1ZSk7XHJcbiAgZmFjaWxpdGllcy5yZW1vdmVBbGwodHJ1ZSk7XHJcblxyXG4gIHNwYWNlc2hpcC5ldmVudHMuZGVzdHJveSgpO1xyXG5cclxuICBjb25zdCBsZXZlbFNpemUgPSBsZXZlbE1hbmFnZXIuZ2V0U2l6ZSgpO1xyXG5cclxuICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBsZXZlbFNpemUueTsgcm93KyspIHtcclxuICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IGxldmVsU2l6ZS54OyBjb2wrKykge1xyXG4gICAgICBjb25zdCB0aWxlID0gbGV2ZWxNYW5hZ2VyLmdldFRpbGVYWShjb2wsIHJvdyk7XHJcbiAgICAgIGNvbnN0IHR5cGUgPSB0aWxlLnR5cGUgfHwgJ2dyYXNzJztcclxuICAgICAgY29uc3QgdGlsZVRvcExlZnQgPSBnZXRUaWxlVG9wTGVmdChjb2wsIHJvdyk7XHJcbiAgICAgIGxldCBvYmpzcHJpdGUgPSBudWxsO1xyXG5cclxuICAgICAgbGV0IHJhbmRvbSA9IGdhbWUucm5kLmJldHdlZW4oMSwgMyk7XHJcbiAgICAgIGxldCBncmFzcyA9IGdyYXNzZXNlcy5jcmVhdGUodGlsZVRvcExlZnQueCwgdGlsZVRvcExlZnQueSwgJ2dyYXNzJyArIHJhbmRvbSk7XHJcbiAgICAgIGdyYXNzLmlucHV0RW5hYmxlZCA9IHRydWU7XHJcblxyXG4gICAgICBpZiAodHlwZSA9PT0gJ3NwYWNlc2hpcCcpIHtcclxuICAgICAgICBzcGFjZXNoaXAucG9zaXRpb24uY29weUZyb20odGlsZVRvcExlZnQpO1xyXG4gICAgICAgIG9ianNwcml0ZSA9IHNwYWNlc2hpcDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICh0eXBlID09PSAnZG9nJykge1xyXG4gICAgICAgIG9ianNwcml0ZSA9IGRvZ3MuY3JlYXRlKHRpbGVUb3BMZWZ0LngsIHRpbGVUb3BMZWZ0LnksICdkb2cnKTtcclxuICAgICAgICBvYmpzcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2Rvd24nLCBbMTBdKTtcclxuICAgICAgICBvYmpzcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBbN10pO1xyXG4gICAgICAgIG9ianNwcml0ZS5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNF0pO1xyXG4gICAgICAgIG9ianNwcml0ZS5hbmltYXRpb25zLmFkZCgndXAnLCBbMV0pO1xyXG4gICAgICAgIG9ianNwcml0ZS5hbmltYXRpb25zLnBsYXkodGlsZS5kaXIpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICdzaGVhcmVyeScpIHtcclxuICAgICAgICBvYmpzcHJpdGUgPSBmYWNpbGl0aWVzLmNyZWF0ZSh0aWxlVG9wTGVmdC54LCB0aWxlVG9wTGVmdC55LCAnc2hlYXJlcnknKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICh0eXBlID09PSAnd2FzaCcpIHtcclxuICAgICAgICBvYmpzcHJpdGUgPSBmYWNpbGl0aWVzLmNyZWF0ZSh0aWxlVG9wTGVmdC54LCB0aWxlVG9wTGVmdC55LCAnd2FzaCcpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICdzY2FycmVyeScpIHtcclxuICAgICAgICBvYmpzcHJpdGUgPSBmYWNpbGl0aWVzLmNyZWF0ZSh0aWxlVG9wTGVmdC54LCB0aWxlVG9wTGVmdC55LCAnc2NhcnJlcnknKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICh0eXBlID09PSAnY2hhcGVsJykge1xyXG4gICAgICAgIG9ianNwcml0ZSA9IGZhY2lsaXRpZXMuY3JlYXRlKHRpbGVUb3BMZWZ0LngsIHRpbGVUb3BMZWZ0LnksICdjaGFwZWwnKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICh0eXBlID09PSAnd29sZicpIHtcclxuICAgICAgICBvYmpzcHJpdGUgPSBmYWNpbGl0aWVzLmNyZWF0ZSh0aWxlVG9wTGVmdC54LCB0aWxlVG9wTGVmdC55LCAnd29sZicpO1xyXG4gICAgICAgIHRpbGUuYmxvb2RSZW5kZXJlZCA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICdncmFzcycpIHtcclxuICAgICAgICAvLyBOb3RoaW5nIHRvIGRvXHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnJlY29nbml6ZWQgdGlsZSB0eXBlOiAnICsgdHlwZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGdyYXNzLmN1c3RvbSA9IHsgcm93LCBjb2wsIG9ianR5cGU6IHR5cGUsIG9ianNwcml0ZSB9O1xyXG4gICAgICBncmFzcy5pbnB1dEVuYWJsZWQgPSB0cnVlO1xyXG5cclxuICAgICAgaWYgKHRpbGVTaGlmdGVyLmlzU2hpZnRhYmxlKHR5cGUpKSB7XHJcbiAgICAgICAgZ3Jhc3MuaW5wdXQudXNlSGFuZEN1cnNvciA9IHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFkZE1vdXNlSGFuZGxlcnMoZ3Jhc3MpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2lnbmFscy5uZXdMZXZlbC5kaXNwYXRjaCgpO1xyXG4gIHN0b3BUdXJucygpO1xyXG4gIGxvYWROZXh0RGlhbG9nKCk7XHJcblxyXG4gIHVwZGF0ZUVuZXJneUJhcigpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBsb2FkTmV4dExldmVsKCkge1xyXG4gIGlmICghZ2FtZS5jdXN0b20ucmFuZG9tTGV2ZWxNb2RlKSB7XHJcbiAgICBsZXZlbEluZGV4Kys7XHJcbiAgfVxyXG5cclxuICBkaXNwbGF5VGV4dGJveCA9IC0xO1xyXG4gIGxvYWRMZXZlbChsZXZlbEluZGV4LCB0cnVlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVzdGFydExldmVsKCkge1xyXG4gIGxvYWRMZXZlbChsZXZlbEluZGV4LCBmYWxzZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0YXJ0VHVybnMoKSB7XHJcbiAgZ2FtZS50aW1lLmV2ZW50cy5sb29wKFRVUk5fRFVSQVRJT04sIG5leHRUdXJuKTtcclxuICBnYW1lLnRpbWUuZXZlbnRzLnN0YXJ0KCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0b3BUdXJucygpIHtcclxuICBnYW1lLnRpbWUuZXZlbnRzLnN0b3AoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbG9hZE5leHREaWFsb2coKSB7XHJcbiAgY29uc3QgZGlhbG9nID0gbGV2ZWxNYW5hZ2VyLmdldERpYWxvZygpO1xyXG5cclxuICBpZiAoZGlhbG9nICYmIGRpc3BsYXlUZXh0Ym94IDwgZGlhbG9nLmxlbmd0aC0xKSB7XHJcbiAgICBkcmF3bk9iamVjdC52aXNpYmxlID0gdHJ1ZTtcclxuICAgIG5leHREaWFsb2dCdXR0b24udmlzaWJsZSA9IHRydWU7XHJcbiAgICB0ZXh0LnZpc2libGUgPSB0cnVlO1xyXG4gICAgZGlzcGxheVNwZWFrZXIudmlzaWJsZSA9IHRydWU7XHJcbiAgICArK2Rpc3BsYXlUZXh0Ym94O1xyXG4gICAgdmFyIGN1cnJlbnRTcGVha2VyID0gbGV2ZWxNYW5hZ2VyLmdldERpYWxvZygpW2Rpc3BsYXlUZXh0Ym94XVtcInNwZWFrZXJcIl07XHJcbiAgICB2YXIgY3VycmVudFNpZGUgPSBsZXZlbE1hbmFnZXIuZ2V0RGlhbG9nKClbZGlzcGxheVRleHRib3hdW1wic2lkZVwiXTtcclxuICAgIHZhciBsZWZ0X3ggPSAxMjA7XHJcbiAgICB2YXIgcmlnaHRfeCA9IDU2MDtcclxuICAgIHZhciBjZW50ZXJfeCA9IDIyMDtcclxuXHJcbiAgICB0ZXh0LnRleHQgPSBsZXZlbE1hbmFnZXIuZ2V0RGlhbG9nKClbZGlzcGxheVRleHRib3hdW1wibXNnXCJdO1xyXG5cclxuICAgIGlmIChjdXJyZW50U2lkZSA9PT0gXCJsZWZ0XCIpIHtcclxuICAgICAgdGV4dC54ID0gMjYwO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoY3VycmVudFNpZGUgPT09IFwicmlnaHRcIikge1xyXG4gICAgICB0ZXh0LnggPSAxMDA7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGV4dC54ID0gMTAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjdXJyZW50U3BlYWtlciA9PT0gXCJub25lXCIpIHtcclxuICAgICAgZGlzcGxheVNwZWFrZXIuYWxwaGEgPSAwO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGRpc3BsYXlTcGVha2VyLmFscGhhID0gMTtcclxuICAgICAgZGlzcGxheVNwZWFrZXIubG9hZFRleHR1cmUoY3VycmVudFNwZWFrZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjdXJyZW50U2lkZSA9PT0gXCJsZWZ0XCIpIHtcclxuICAgICAgZGlzcGxheVNwZWFrZXIueCA9IGxlZnRfeDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGN1cnJlbnRTaWRlID09PSBcImNlbnRlclwiKSB7XHJcbiAgICAgIGRpc3BsYXlTcGVha2VyLnggPSBjZW50ZXJfeDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBkaXNwbGF5U3BlYWtlci54ID0gcmlnaHRfeDtcclxuICAgIH1cclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICBkcmF3bk9iamVjdC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICBuZXh0RGlhbG9nQnV0dG9uLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHRleHQudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgZGlzcGxheVNwZWFrZXIudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgc3RhcnRUdXJucygpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gYWRkTW91c2VIYW5kbGVycyhncmFzcykge1xyXG4gIGdyYXNzLmV2ZW50cy5vbklucHV0RG93bi5hZGQoKCkgPT4ge1xyXG4gICAgdGlsZVNoaWZ0ZXIuaGFuZGxlVGlsZUNsaWNrZWQoZ3Jhc3MpO1xyXG4gICAgdXBkYXRlRW5lcmd5QmFyKCk7XHJcbiAgfSk7XHJcblxyXG4gIGdyYXNzLmV2ZW50cy5vbklucHV0T3Zlci5hZGQoKCkgPT4ge1xyXG4gICAgdGlsZVVuZGVyTW91c2UgPSBncmFzcztcclxuICAgIHVwZGF0ZUVuZXJneUJhcigpO1xyXG4gIH0pO1xyXG5cclxuICBncmFzcy5ldmVudHMub25JbnB1dE91dC5hZGQoKCkgPT4ge1xyXG4gICAgLy8gTmVlZCB0byBtYWtlIHN1cmUgd2UgZG9uJ3QgZG8gdGhpcyByaWdodCBhZnRlciB0aGUgYWRqYWNlbnQgdGlsZSB3YXMgc2V0IGFzIHRpbGVVbmRlck1vdXNlXHJcbiAgICBpZiAodGlsZVVuZGVyTW91c2UgPT09IGdyYXNzKSB7XHJcbiAgICAgIHRpbGVVbmRlck1vdXNlID0gbnVsbDtcclxuICAgICAgdXBkYXRlRW5lcmd5QmFyKCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbmNvbnN0IGNyZWF0ZURpYWxvZyA9ICgpID0+IHtcclxuICB2YXIgd2lkdGggPSA2NDA7XHJcbiAgdmFyIGhlaWdodCA9IDE0MDtcclxuICBibWQgPSBnYW1lLmFkZC5iaXRtYXBEYXRhKHdpZHRoLCBoZWlnaHQpO1xyXG5cclxuICBibWQuY3R4LmJlZ2luUGF0aCgpO1xyXG4gIGJtZC5jdHgucmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcclxuICBibWQuY3R4LmZpbGxTdHlsZSA9ICcjNTUwMDU1JztcclxuICBibWQuY3R4LmZpbGwoKTtcclxuXHJcbiAgZHJhd25PYmplY3QgPSBnYW1lLmFkZC5zcHJpdGUoNDAwLCAxNzAsIGJtZCk7XHJcbiAgZHJhd25PYmplY3QuYWxwaGEgPSAwLjg7XHJcbiAgZHJhd25PYmplY3QuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcclxuXHJcbiAgbmV4dERpYWxvZ0J1dHRvbiA9IGdhbWUuYWRkLmJ1dHRvbig2NDAsIDI2MCwgJ25leHQtZGlhbG9nLWJ1dHRvbicsIGxvYWROZXh0RGlhbG9nKTtcclxuICBuZXh0RGlhbG9nQnV0dG9uLmFuY2hvci5zZXRUbygwLjUpO1xyXG4gIG5leHREaWFsb2dCdXR0b24udmlzaWJsZSA9IHRydWU7XHJcblxyXG4gIHRleHQgPSBnYW1lLmFkZC50ZXh0KDI2MCwgMTIwLCAnJywge2ZpbGw6ICd3aGl0ZScsIGZvbnQ6ICcyMHB4IENvdXJpZXInLCBmb250V2VpZ2h0OiAnYm9sZCd9KTtcclxuICB0ZXh0LndvcmRXcmFwID0gdHJ1ZTtcclxuICB0ZXh0LndvcmRXcmFwV2lkdGggPSA0NTA7XHJcbiAgZGlzcGxheVNwZWFrZXIgPSBnYW1lLmFkZC5pbWFnZSgxMjAsIDI0MCwgJ2FsaWVuLWxlZnQnKTtcbiAgZGlzcGxheVNwZWFrZXIuYW5jaG9yLnkgPSAxO1xyXG4gIGRpc3BsYXlTcGVha2VyLnZpc2libGUgPSB0cnVlO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gdXBkYXRlRW5lcmd5QmFyKCkge1xyXG4gIGNvbnN0IGJhcldpZHRoID0gMTUwO1xyXG4gIGNvbnN0IGVuZXJneVJlcXVpcmVkID0gbGV2ZWxNYW5hZ2VyLmdldEVuZXJneVJlcXVpcmVkKCk7XHJcbiAgY29uc3QgZW5lcmd5ID0gbGV2ZWxNYW5hZ2VyLmdldEVuZXJneSgpO1xyXG4gIGxldCBjb3N0ID0gMDtcclxuXHJcbiAgaWYgKHRpbGVVbmRlck1vdXNlICYmIHRpbGVTaGlmdGVyLmhhc1NlbGVjdGVkVGlsZSgpKSB7XHJcbiAgICBjb25zdCBzZWxlY3RlZFRpbGUgPSB0aWxlU2hpZnRlci5nZXRTZWxlY3RlZFRpbGUoKTtcclxuXHJcbiAgICBpZiAodGlsZVNoaWZ0ZXIudGlsZXNBcmVTd2FwcGFibGUodGlsZVVuZGVyTW91c2UsIHNlbGVjdGVkVGlsZSkpIHtcclxuICAgICAgY29zdCA9IHRpbGVTaGlmdGVyLmNhbGN1bGF0ZVNoaWZ0Q29zdCh0aWxlVW5kZXJNb3VzZSwgc2VsZWN0ZWRUaWxlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IHJhdGlvID0gYmFyV2lkdGggLyBlbmVyZ3lSZXF1aXJlZDtcclxuXHJcbiAgYmFyQml0bWFwLmN0eC5jbGVhclJlY3QoMCwgMCwgMTUwLCAxMik7XHJcblxyXG4gIGZ1bmN0aW9uIGZpbGxCYXJTZWdtZW50KHN0YXJ0LCB3aWR0aCwgY29sb3IpIHtcclxuICAgIGJhckJpdG1hcC5jdHguZmlsbFN0eWxlID0gY29sb3I7XHJcbiAgICBiYXJCaXRtYXAuY3R4LmZpbGxSZWN0KHN0YXJ0ICogcmF0aW8sIDAsIHdpZHRoICogcmF0aW8sIDEyKTtcclxuICB9XHJcblxyXG4gIGlmIChlbmVyZ3kgPiBjb3N0KSB7XHJcbiAgICBmaWxsQmFyU2VnbWVudCgwLCBlbmVyZ3kgLSBjb3N0LCAnI2JiZGRmZicpO1xyXG4gIH1cclxuXHJcbiAgaWYgKGNvc3QgPiAwKSB7XHJcbiAgICBpZiAoZW5lcmd5ID4gY29zdCkge1xyXG4gICAgICBmaWxsQmFyU2VnbWVudChlbmVyZ3kgLSBjb3N0LCBjb3N0LCAneWVsbG93Jyk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgZmlsbEJhclNlZ21lbnQoMCwgZW5lcmd5LCAneWVsbG93Jyk7XHJcbiAgICAgIGZpbGxCYXJTZWdtZW50KGVuZXJneSwgY29zdCAtIGVuZXJneSwgJ3JlZCcpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYmFyQml0bWFwLmN0eC5zdHJva2VTdHlsZSA9ICd3aGl0ZSc7XHJcbiAgYmFyQml0bWFwLmN0eC5zdHJva2VSZWN0KDAsIDAsIDE1MCwgMTIpO1xyXG59XHJcblxyXG5leHBvcnRzLnByZWxvYWQgPSBwcmVsb2FkO1xyXG5cclxuZXhwb3J0cy5jcmVhdGUgPSAoKSA9PiB7XHJcbiAgbGV2ZWxHZW5lcmF0b3IuY3JlYXRlKGdhbWUpO1xyXG4gIGlmIChnYW1lLmN1c3RvbS5yYW5kb21MZXZlbE1vZGUgPT0gZmFsc2UpIHtcclxuICBQbGF5LnNheS5hbGx5b3VyYmFzZSgpO1xyXG4gIH1cclxuICBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIGdhbWUud2lkdGgsIGdhbWUuaGVpZ2h0LCAnc3BhY2UnKTtcclxuXHJcbiAgdHlwZXMgPSBnYW1lLmNhY2hlLmdldEpTT04oJ3R5cGVzJyk7XHJcblxyXG4gIGdyYXNzZXNlcyA9IGdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgc291cmNlcyA9IGdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgc2hvcGUgPSBnYW1lLmFkZC5ncm91cCgpO1xyXG4gIGRvZ3MgPSBnYW1lLmFkZC5ncm91cCgpO1xyXG4gIGJsb29kcyA9IGdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgZmFjaWxpdGllcyA9IGdhbWUuYWRkLmdyb3VwKCk7XHJcblxyXG4gIC8vIEluaXQgYXQgMCwgMCAtIHdpbGwgYmUgcG9zaXRpb25lZCBsYXRlclxyXG4gIHNwYWNlc2hpcCA9IGdhbWUuYWRkLnNwcml0ZSgwLCAwLCAnc3BhY2VzaGlwJyk7XHJcbiAgc3BhY2VzaGlwLmFuaW1hdGlvbnMuYWRkKCd3b2JibGUnKTtcclxuICBzcGFjZXNoaXAuYW5pbWF0aW9ucy5wbGF5KCd3b2JibGUnLCA2LCB0cnVlKTtcclxuXHJcbiAgbmV4dExldmVsQnV0dG9uID0gZ2FtZS5hZGQuYnV0dG9uKGdhbWUud29ybGQuY2VudGVyWCwgNTUwLCAnbmV4dC1sZXZlbC1idXR0b24nLCBsb2FkTmV4dExldmVsKTtcclxuICBuZXh0TGV2ZWxCdXR0b24uYW5jaG9yLnNldFRvKDAuNSk7XHJcblxyXG4gIGlmICghZ2FtZS5jdXN0b20ucmFuZG9tTGV2ZWxNb2RlKSB7XHJcbiAgICBuZXh0TGV2ZWxCdXR0b24udmlzaWJsZSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgbGV2ZWxDb21wbGV0ZSA9IGdhbWUuYWRkLmltYWdlKGdhbWUud29ybGQuY2VudGVyWCwgOTAsICdsZXZlbC1jb21wbGV0ZScpO1xyXG4gIGxldmVsQ29tcGxldGUuYW5jaG9yLnNldFRvKDAuNSk7XHJcbiAgbGV2ZWxDb21wbGV0ZS5zbW9vdGhlZCA9IGZhbHNlO1xyXG5cclxuICBjb25zdCByZXN0YXJ0QnV0dG9uID0gZ2FtZS5hZGQuYnV0dG9uKGdhbWUud29ybGQuY2VudGVyWCwgNDAsICdyZXN0YXJ0LWxldmVsLWJ1dHRvbicsIHJlc3RhcnRMZXZlbCk7XHJcbiAgcmVzdGFydEJ1dHRvbi5hbmNob3Iuc2V0VG8oMC41KTtcclxuICByZXN0YXJ0QnV0dG9uLnNtb290aGVkID0gZmFsc2U7XHJcblxyXG4gIGNvbnN0IG1haW5NZW51QnV0dG9uID0gZ2FtZS5hZGQudGV4dCg3NjgsIDU2OCwgJ01BSU4gTUVOVScsIHsgZmlsbDogJ3doaXRlJywgZm9udDogJzIwcHggQ291cmllcicsIGZvbnRXZWlnaHQ6ICdib2xkJyB9KTtcclxuICBtYWluTWVudUJ1dHRvbi5hbmNob3Iuc2V0KDEpO1xyXG4gIG1haW5NZW51QnV0dG9uLmlucHV0RW5hYmxlZCA9IHRydWU7XHJcbiAgbWFpbk1lbnVCdXR0b24uaW5wdXQudXNlSGFuZEN1cnNvciA9IHRydWU7XHJcbiAgbWFpbk1lbnVCdXR0b24uZXZlbnRzLm9uSW5wdXREb3duLmFkZCgoKSA9PiB7IGdhbWUuc3RhdGUuc3RhcnQoJ3RpdGxlLXNjcmVlbicpOyB9KTtcclxuXHJcbiAgc2VsZWN0ZWRUaWxlT3ZlcmxheS5jcmVhdGUoKTtcclxuICB0aWxlU2hpZnRlci5jcmVhdGUodHlwZXMpO1xyXG5cclxuICBiYXJCaXRtYXAgPSBnYW1lLmFkZC5iaXRtYXBEYXRhKDE1MSwgMTMpO1xyXG4gIGJhckJpdG1hcC5jdHgudHJhbnNsYXRlKDAuNSwgMC41KTsgLy8gQXZvaWQgcGl4ZWwgYm91bmRhcmllc1xyXG5cclxuICBnYW1lLmFkZC50ZXh0KDMyLCAzMiwgJ0VORVJHWTonLCB7IGZpbGw6ICd3aGl0ZScsIGZvbnQ6ICcxNHB4IENvdXJpZXInIH0pO1xyXG4gIGdhbWUuYWRkLnNwcml0ZSgzMiwgNTAsIGJhckJpdG1hcCk7XHJcblxyXG4gIHNpZ25hbHMuc2hlZXBBYmR1Y3RlZC5hZGQodXBkYXRlRW5lcmd5QmFyKTtcclxuXHJcbiAgY3JlYXRlRGlhbG9nKCk7XHJcblxyXG4gIGxvYWROZXh0TGV2ZWwoKTtcclxuXHJcbiAgZ2FtZS5pbnB1dC5vbkRvd24uYWRkKCgpID0+IHtcclxuICAgIGlmICghdGlsZVVuZGVyTW91c2UgJiYgdGlsZVNoaWZ0ZXIuaGFzU2VsZWN0ZWRUaWxlKCkpIHtcclxuICAgICAgdGlsZVNoaWZ0ZXIuZGVzZWxlY3QoKTtcclxuICAgIH1cclxuICB9KTtcclxufTtcclxuXHJcbmV4cG9ydHMudXBkYXRlID0gKCkgPT4ge307XHJcblxyXG5leHBvcnRzLnJlbmRlciA9ICgpID0+IHtcclxuICBpZiAoIWxldmVsTWFuYWdlci5pc0dhbWVPdmVyKCkpIHtcclxuICAgIGdhbWUuZGVidWcudGV4dCgnV2F2ZXMgbGVmdDogJyArIGxldmVsTWFuYWdlci5nZXRXYXZlc0xlZnQoKSwgMzIsIDU3MCk7XHJcbiAgfVxyXG59O1xyXG4iLCIvKiBnbG9iYWxzIFBoYXNlciwgZ2FtZSAqL1xyXG5cclxud2luZG93LmdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoODAwLCA2MDAsIFBoYXNlci5DQU5WQVMsICdnYW1lJyk7XHJcblxyXG5nYW1lLmN1c3RvbSA9IHsgcmFuZG9tTGV2ZWxNb2RlOiBmYWxzZSB9O1xyXG5cclxuZ2FtZS5zdGF0ZS5hZGQoJ3RpdGxlLXNjcmVlbicsIHJlcXVpcmUoJy4vdGl0bGUtc2NyZWVuJykpO1xyXG5nYW1lLnN0YXRlLmFkZCgnbWFpbi1zdGF0ZScsIHJlcXVpcmUoJy4vbWFpbi1zdGF0ZScpKTtcclxuZ2FtZS5zdGF0ZS5zdGFydCgndGl0bGUtc2NyZWVuJyk7XHJcbiIsIi8qIGdsb2JhbHMgZ2FtZSAqL1xuXG5jb25zdCBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9ICgpID0+IHtcbiAgZ2FtZS5sb2FkLmltYWdlKCdzcGFjZScsICdzcGFjZS5wbmcnKTtcbiAgZ2FtZS5sb2FkLmltYWdlKCdncmFzczEnLCAnZ3Jhc3MucG5nJyk7XG4gIGdhbWUubG9hZC5pbWFnZSgnZ3Jhc3MyJywgJ2dyYXNzMi5wbmcnKTtcbiAgZ2FtZS5sb2FkLmltYWdlKCdncmFzczMnLCAnZ3Jhc3MzLnBuZycpO1xuICBnYW1lLmxvYWQuc3ByaXRlc2hlZXQoJ3NwYWNlc2hpcCcsICdzcGFjZXNoaXAucG5nJywgNTAsIDQxKTtcbiAgZ2FtZS5sb2FkLmltYWdlKCdzaGVhcmVyeScsICdzaGVhcmVyeS5wbmcnKTtcbiAgZ2FtZS5sb2FkLmltYWdlKCd3YXNoJywgJ3dhc2gucG5nJyk7XG4gIGdhbWUubG9hZC5pbWFnZSgnc2NhcnJlcnknLCAnc2NhcnJlcnkucG5nJyk7XG4gIGdhbWUubG9hZC5pbWFnZSgnY2hhcGVsJywgJ2NoYXBlbC5wbmcnKTtcbiAgZ2FtZS5sb2FkLmltYWdlKCd3b2xmJywgJ3dvbGYucG5nJyk7XG4gIGdhbWUubG9hZC5pbWFnZSgnYmxvb2QnLCAnYmxvb2QucG5nJyk7XG4gIGdhbWUubG9hZC5pbWFnZSgnYXJyb3cnLCAnYXJyb3cucG5nJyk7XG4gIGdhbWUubG9hZC5pbWFnZSgnYWxpZW4tbGVmdCcsICdhbGllbi1sZWZ0LnBuZycpO1xuICBnYW1lLmxvYWQuaW1hZ2UoJ2FsaWVuLXJpZ2h0JywgJ2FsaWVuLXJpZ2h0LnBuZycpO1xuICBnYW1lLmxvYWQuaW1hZ2UoJ2RvZy1sZWZ0JywgJ2RvZy1sZWZ0LnBuZycpO1xuICBnYW1lLmxvYWQuaW1hZ2UoJ2RvZy1yaWdodCcsICdkb2ctcmlnaHQucG5nJyk7XG4gIGdhbWUubG9hZC5pbWFnZSgnc2hlZXAtbGVmdCcsICdzaGVlcC1sZWZ0LnBuZycpO1xuICBnYW1lLmxvYWQuaW1hZ2UoJ3NoZWVwLXJpZ2h0JywgJ3NoZWVwLXJpZ2h0LnBuZycpO1xuICBnYW1lLmxvYWQuc3ByaXRlc2hlZXQoJ3NoZWVwLXNvdXJjZScsICdzaGVlcC1zb3VyY2UucG5nJywgNTAsIDQxKTtcbiAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdzaGVlcCcsICdzaGVlcC5wbmcnLCA0OSwgMzMpO1xuICBnYW1lLmxvYWQuc3ByaXRlc2hlZXQoJ3Nob3JuLXNoZWVwJywgJ3Nob3JuLXNoZWVwLnBuZycsIDQ5LCAzMik7XG4gIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZmx1ZmZ5LXNoZWVwJywgJ2ZsdWZmeS1zaGVlcC5wbmcnLCA0OSwgMzIpO1xuICBnYW1lLmxvYWQuc3ByaXRlc2hlZXQoJ3NjYXJyZWQtc2hlZXAnLCAnc2NhcnJlZC1zaGVlcC5wbmcnLCA0OSwgMzIpO1xuICBnYW1lLmxvYWQuc3ByaXRlc2hlZXQoJ2RvZycsICdkb2cucG5nJywgNDksIDQxKTtcbiAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdzZWxlY3RlZCcsICdzZWxlY3RlZC5wbmcnLCAxMjgsIDEyOCk7XG4gIGdhbWUubG9hZC5pbWFnZSgnbGV2ZWwtY29tcGxldGUnLCAnbGV2ZWwtY29tcGxldGUucG5nJyk7XG4gIGdhbWUubG9hZC5pbWFnZSgnbmV4dC1sZXZlbC1idXR0b24nLCAnbmV4dC1sZXZlbC1idXR0b24ucG5nJyk7XG4gIGdhbWUubG9hZC5pbWFnZSgncmVzdGFydC1sZXZlbC1idXR0b24nLCAncmVzdGFydC1sZXZlbC1idXR0b24ucG5nJyk7XG4gIGdhbWUubG9hZC5pbWFnZSgnbmV4dC1kaWFsb2ctYnV0dG9uJywgJ25leHQtZGlhbG9nLWJ1dHRvbi5wbmcnKTtcbiAgZ2FtZS5sb2FkLmpzb24oJ3R5cGVzJywgJ2RhdGEvdHlwZXMuanNvbicpO1xuXG4gIGZvciAobGV0IGkgPSAxOyBpIDw9IGNvbnN0YW50cy5UVVRPUklBTF9MRVZFTF9DT1VOVDsgaSsrKSB7XG4gICAgZ2FtZS5sb2FkLmpzb24oJ2xldmVsLScgKyBpLCAnZGF0YS9sZXZlbC0nICsgaSArICcuanNvbicpO1xuICB9XG5cbiAgZ2FtZS5sb2FkLmpzb24oJ3Rlc3QtbGV2ZWwtc3BlYycsICdkYXRhL3Rlc3QtbGV2ZWwtc3BlYy5qc29uJyk7XG4gIGdhbWUubG9hZC5qc29uKCdsZXZlbC1zcGVjLTgnLCAnZGF0YS9sZXZlbC1zcGVjLTguanNvbicpO1xufTtcbiIsIi8qIGdsb2JhbHMgZ2FtZSAqL1xuXG5jb25zdCBzaWduYWxzID0gcmVxdWlyZSgnLi9zaWduYWxzJyk7XG5cbmxldCBvdmVybGF5O1xuXG5sZXQgY3JlYXRlID0gKCkgPT4ge1xuICBvdmVybGF5ID0gZ2FtZS5hZGQuc3ByaXRlKDAsIDAsICdzZWxlY3RlZCcpO1xuICBvdmVybGF5LmFuaW1hdGlvbnMuYWRkKCdnbG93JywgbnVsbCwgOCwgdHJ1ZSk7XG4gIG92ZXJsYXkuYW5pbWF0aW9ucy5wbGF5KCdnbG93Jyk7XG4gIGhpZGUoKTtcbn07XG5cbmxldCBzaG93ID0gKHRpbGUpID0+IHtcbiAgb3ZlcmxheS54ID0gdGlsZS54IC0gMzI7XG4gIG92ZXJsYXkueSA9IHRpbGUueSAtIDMyO1xuICBvdmVybGF5LnZpc2libGUgPSB0cnVlO1xufTtcblxubGV0IGhpZGUgPSAoKSA9PiB7XG4gIG92ZXJsYXkudmlzaWJsZSA9IGZhbHNlO1xufTtcblxuc2lnbmFscy5uZXdMZXZlbC5hZGQoaGlkZSk7XG5cbmV4cG9ydHMuY3JlYXRlID0gY3JlYXRlO1xuZXhwb3J0cy5zaG93ID0gc2hvdztcbmV4cG9ydHMuaGlkZSA9IGhpZGU7XG4iLCIvKiBnbG9iYWxzIFBoYXNlciAqL1xyXG5cclxuZXhwb3J0cy5uZXdMZXZlbCA9IG5ldyBQaGFzZXIuU2lnbmFsKCk7XHJcbmV4cG9ydHMuc2hlZXBBYmR1Y3RlZCA9IG5ldyBQaGFzZXIuU2lnbmFsKCk7XHJcbmV4cG9ydHMudHV0b3JpYWxTdGFydGVkID0gbmV3IFBoYXNlci5TaWduYWwoKTtcclxuZXhwb3J0cy53YXZlU3RhcnRlZCA9IG5ldyBQaGFzZXIuU2lnbmFsKCk7XHJcbiIsIi8qIGdsb2JhbCBQbGF5ICovXG5cbmNvbnN0IGxldmVsTWFuYWdlciA9IHJlcXVpcmUoJy4vbGV2ZWwtbWFuYWdlcicpO1xuY29uc3Qgc2VsZWN0ZWRUaWxlT3ZlcmxheSA9IHJlcXVpcmUoJy4vc2VsZWN0ZWQtdGlsZS1vdmVybGF5Jyk7XG5jb25zdCBzaWduYWxzID0gcmVxdWlyZSgnLi9zaWduYWxzJyk7XG5cbmxldCBzZWxlY3RlZFRpbGUgPSBudWxsO1xubGV0IG9uU2hpZnQgPSBudWxsO1xubGV0IHR5cGVzO1xuXG5zaWduYWxzLm5ld0xldmVsLmFkZCgoKSA9PiB7IHNlbGVjdGVkVGlsZSA9IG51bGw7IH0pO1xuXG5mdW5jdGlvbiBjcmVhdGUodGlsZVR5cGVzKSB7XG4gIHR5cGVzID0gdGlsZVR5cGVzO1xufVxuXG5mdW5jdGlvbiBzd2l0Y2hPYmplY3RzKHRpbGUxLCB0aWxlMikge1xuICBjb25zdCBjdXN0b20xID0gdGlsZTEuY3VzdG9tO1xuICBjb25zdCBjdXN0b20yID0gdGlsZTIuY3VzdG9tO1xuICBjb25zdCBzcHJpdGUxID0gY3VzdG9tMS5vYmpzcHJpdGU7XG4gIGNvbnN0IHNwcml0ZTIgPSBjdXN0b20yLm9ianNwcml0ZTtcblxuICBpZiAoc3ByaXRlMSkge1xuICAgIC8vIFRPRE86IG9mZnNldHM/XG4gICAgc3ByaXRlMS54ID0gdGlsZTIueDtcbiAgICBzcHJpdGUxLnkgPSB0aWxlMi55O1xuICB9XG5cbiAgaWYgKHNwcml0ZTIpIHtcbiAgICBzcHJpdGUyLnggPSB0aWxlMS54O1xuICAgIHNwcml0ZTIueSA9IHRpbGUxLnk7XG4gIH1cblxuICBbIGN1c3RvbTEub2JqdHlwZSwgY3VzdG9tMi5vYmp0eXBlIF0gPSBbIGN1c3RvbTIub2JqdHlwZSwgY3VzdG9tMS5vYmp0eXBlIF07XG4gIFsgY3VzdG9tMS5vYmpzcHJpdGUsIGN1c3RvbTIub2Jqc3ByaXRlIF0gPSBbIGN1c3RvbTIub2Jqc3ByaXRlLCBjdXN0b20xLm9ianNwcml0ZSBdO1xuXG4gIGlmIChvblNoaWZ0KSB7XG4gICAgY29uc3QgZW5lcmd5Q29zdCA9IGNhbGN1bGF0ZVNoaWZ0Q29zdCh0aWxlMSwgdGlsZTIpO1xuICAgIG9uU2hpZnQoZW5lcmd5Q29zdCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaGFzU2VsZWN0ZWRUaWxlKCkge1xuICByZXR1cm4gc2VsZWN0ZWRUaWxlICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBnZXRTZWxlY3RlZFRpbGUoKSB7XG4gIHJldHVybiBzZWxlY3RlZFRpbGU7XG59XG5cbmZ1bmN0aW9uIGlzU2hpZnRhYmxlKHR5cGUpIHtcbiAgcmV0dXJuIHR5cGUgIT09ICdzcGFjZXNoaXAnICYmIHR5cGUgIT09ICd3b2xmJztcbn1cblxuZnVuY3Rpb24gaGFuZGxlVGlsZUNsaWNrZWQodGlsZSkge1xuICBjb25zdCBvYmp0eXBlID0gdGlsZS5jdXN0b20ub2JqdHlwZTtcblxuICBpZiAoaXNTaGlmdGFibGUob2JqdHlwZSkpIHtcbiAgICBpZiAoaGFzU2VsZWN0ZWRUaWxlKCkpIHtcbiAgICAgIGlmICh0aWxlc0FyZVN3YXBwYWJsZSh0aWxlLCBzZWxlY3RlZFRpbGUpKSB7XG4gICAgICAgIGNvbnN0IGNvc3QgPSBjYWxjdWxhdGVTaGlmdENvc3QodGlsZSwgc2VsZWN0ZWRUaWxlKTtcblxuICAgICAgICBpZiAoY29zdCA+IGxldmVsTWFuYWdlci5nZXRFbmVyZ3koKSkge1xuICAgICAgICAgIC8vIFRPRE86IGluZm9ybSB1c2VyIHRoYXQgdGhleSBkb24ndCBoYXZlIGVub3VnaCBlbmVyZ3lcbiAgICAgICAgICBQbGF5LnNoZWVwX2Zhc3QoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXZlbE1hbmFnZXIuc3dhcFRpbGVzKHRpbGUsIHNlbGVjdGVkVGlsZSk7XG4gICAgICAgIHN3aXRjaE9iamVjdHModGlsZSwgc2VsZWN0ZWRUaWxlKTtcbiAgICAgIH1cblxuICAgICAgc2VsZWN0ZWRUaWxlID0gbnVsbDtcbiAgICAgIHNlbGVjdGVkVGlsZU92ZXJsYXkuaGlkZSgpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHNlbGVjdGVkVGlsZSA9IHRpbGU7XG4gICAgICBzZWxlY3RlZFRpbGVPdmVybGF5LnNob3codGlsZSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNldE9uU2hpZnQoY2FsbGJhY2spIHtcbiAgb25TaGlmdCA9IGNhbGxiYWNrO1xufVxuXG5mdW5jdGlvbiBnZXRTaGlmdEVuZXJneSh0aWxlKSB7XG4gIHJldHVybiB0eXBlc1t0aWxlLmN1c3RvbS5vYmp0eXBlXS5zaGlmdEVuZXJneTtcbn1cblxuZnVuY3Rpb24gdGlsZXNBcmVTd2FwcGFibGUodGlsZTEsIHRpbGUyKSB7XG4gIHJldHVybiBpc1NoaWZ0YWJsZSh0aWxlMS5jdXN0b20ub2JqdHlwZSkgJiYgaXNTaGlmdGFibGUodGlsZTIuY3VzdG9tLm9ianR5cGUpICYmIHRpbGUxICE9PSB0aWxlMjtcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlU2hpZnRDb3N0KHRpbGUxLCB0aWxlMikge1xuICByZXR1cm4gZ2V0U2hpZnRFbmVyZ3kodGlsZTEpICsgZ2V0U2hpZnRFbmVyZ3kodGlsZTIpO1xufVxuXG5leHBvcnRzLmRlc2VsZWN0ID0gKCkgPT4ge1xuICBzZWxlY3RlZFRpbGUgPSBudWxsO1xuICBzZWxlY3RlZFRpbGVPdmVybGF5LmhpZGUoKTtcbn07XG5cbmV4cG9ydHMuY3JlYXRlID0gY3JlYXRlO1xuZXhwb3J0cy5oYXNTZWxlY3RlZFRpbGUgPSBoYXNTZWxlY3RlZFRpbGU7XG5leHBvcnRzLmdldFNlbGVjdGVkVGlsZSA9IGdldFNlbGVjdGVkVGlsZTtcbmV4cG9ydHMuaXNTaGlmdGFibGUgPSBpc1NoaWZ0YWJsZTtcbmV4cG9ydHMuaGFuZGxlVGlsZUNsaWNrZWQgPSBoYW5kbGVUaWxlQ2xpY2tlZDtcbmV4cG9ydHMuc2V0T25TaGlmdCA9IHNldE9uU2hpZnQ7XG5leHBvcnRzLnRpbGVzQXJlU3dhcHBhYmxlID0gdGlsZXNBcmVTd2FwcGFibGU7XG5leHBvcnRzLmNhbGN1bGF0ZVNoaWZ0Q29zdCA9IGNhbGN1bGF0ZVNoaWZ0Q29zdDtcbiIsIi8qIGdsb2JhbHMgZ2FtZSwgUGxheSAqL1xyXG5cclxuY29uc3Qgc2lnbmFscyA9IHJlcXVpcmUoJy4vc2lnbmFscycpO1xyXG5cclxuZXhwb3J0cy5wcmVsb2FkID0gKCkgPT4ge1xyXG4gIGdhbWUubG9hZC5pbWFnZSgnc3BhY2UnLCAnc3BhY2UucG5nJyk7XHJcbiAgZ2FtZS5sb2FkLmltYWdlKCd0aXRsZScsICd0aXRsZS5wbmcnKTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIHBsYXlUdXRvcmlhbCgpIHtcclxuICBnYW1lLmN1c3RvbS5yYW5kb21MZXZlbE1vZGUgPSBmYWxzZTtcclxuICBnYW1lLnN0YXRlLnN0YXJ0KCdtYWluLXN0YXRlJyk7XHJcbiAgc2lnbmFscy50dXRvcmlhbFN0YXJ0ZWQuZGlzcGF0Y2goKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcGxheVJhbmRvbSgpIHtcclxuICBnYW1lLmN1c3RvbS5yYW5kb21MZXZlbE1vZGUgPSB0cnVlO1xyXG4gIGdhbWUuc3RhdGUuc3RhcnQoJ21haW4tc3RhdGUnKTtcclxufVxyXG5cclxuY29uc3QgbmFtZXMgPSBbXHJcbiAgJ1NoZWFyaW5nIGlzIENlYXJpbmcnLFxyXG4gICdTcGFjZSBTaGVwaGVyZCcsXHJcbiAgJ0RvZXMgaXQgaGF2ZSB0b1xcbmJlIGEgc2hlZXA/JyxcclxuICAnRG9lcyBpdCBoYXZlIHRvXFxuaGF2ZSBhIG5hbWU/JyxcclxuICAnU2hlYXIgSm95JyxcclxuICAnU2hvcm4gdGhlIFNoZWVwJyxcclxuICAnU2hpZnQgTXkgU2hvcGUnLFxyXG4gICdTaG9wZSBDYW4gTWVhbiBBbnl0aGluZycsXHJcbiAgJ0dldCBZb3VyIFByb2JlcyBIZXJlJyxcclxuICAnRmkocilzdCBQcm9iaW5nIEZyZWUnLFxyXG4gICdEdWRlLCBXaGVyZVxcJ3MgTXkgU2hlZXA/JyxcclxuICAnT2xkIFBvb3AnLFxyXG4gICdDdHJsLVNoaWZ0LVNoZWVwJyxcclxuICAnUGltcCBNeSBTaGVlcCcsXHJcbiAgJ0Egc2hlZXAgaXMgYSB0ZXJyaWJsZVxcbnRoaW5nIHRvIHdhc3RlJyxcclxuICAnQWxsIHlvdXIgc2hlZXAgYXJlXFxuYmVsb25nIHRvIGFsaWVucycsXHJcbiAgJ0luc2VydCBOYW1lIEhlcmUnXHJcbl07XHJcblxyXG5sZXQgbmFtZVRleHQ7XHJcblxyXG5mdW5jdGlvbiBzZXRSYW5kb21OYW1lKCkge1xyXG4gIG5hbWVUZXh0LnRleHQgPSBnYW1lLnJuZC5waWNrKG5hbWVzKTtcclxufVxyXG5cclxuZXhwb3J0cy5jcmVhdGUgPSAoKSA9PiB7XHJcbiAgZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCBnYW1lLndpZHRoLCBnYW1lLmhlaWdodCwgJ3NwYWNlJyk7XHJcbiAgZ2FtZS5hZGQuaW1hZ2UoMCwgMCwgJ3RpdGxlJyk7XHJcblxyXG4gIG5hbWVUZXh0ID0gZ2FtZS5hZGQudGV4dCg0MDAsIDkwLCAnJywgeyBmaWxsOiAnd2hpdGUnLCBmb250OiAnNDhweCBDb3VyaWVyJywgZm9udFdlaWdodDogJ2JvbGQnLCBhbGlnbjogJ2NlbnRlcicgfSk7XHJcbiAgbmFtZVRleHQuYW5jaG9yLnNldCgwLjUpO1xyXG4gIG5hbWVUZXh0LnNtb290aGVkID0gZmFsc2U7XHJcbiAgbmFtZVRleHQuaW5wdXRFbmFibGVkID0gdHJ1ZTtcclxuICBuYW1lVGV4dC5pbnB1dC51c2VIYW5kQ3Vyc29yID0gdHJ1ZTtcclxuICBuYW1lVGV4dC5ldmVudHMub25JbnB1dERvd24uYWRkKHNldFJhbmRvbU5hbWUpO1xyXG4gIHNldFJhbmRvbU5hbWUoKTsgLy8gaW5pdFxyXG5cclxuICBjb25zdCB0dXRvcmlhbEJ1dHRvbiA9IGdhbWUuYWRkLnRleHQoNDUwLCAyNTAsICdQTEFZIFRVVE9SSUFMJywgeyBmaWxsOiAnd2hpdGUnLCBmb250OiAnMjRweCBDb3VyaWVyJywgZm9udFdlaWdodDogJ2JvbGQnIH0pO1xyXG4gIHR1dG9yaWFsQnV0dG9uLmFuY2hvci5zZXQoMC41KTtcclxuICB0dXRvcmlhbEJ1dHRvbi5zbW9vdGhlZCA9IGZhbHNlO1xyXG4gIHR1dG9yaWFsQnV0dG9uLmlucHV0RW5hYmxlZCA9IHRydWU7XHJcbiAgdHV0b3JpYWxCdXR0b24uaW5wdXQudXNlSGFuZEN1cnNvciA9IHRydWU7XHJcbiAgdHV0b3JpYWxCdXR0b24uZXZlbnRzLm9uSW5wdXREb3duLmFkZChQbGF5LnN3aXRjaF9vbl9kZXZpY2UpO1xyXG4gIHR1dG9yaWFsQnV0dG9uLmV2ZW50cy5vbklucHV0RG93bi5hZGQocGxheVR1dG9yaWFsKTtcclxuXHJcbiAgY29uc3QgcmFuZG9tQnV0dG9uID0gZ2FtZS5hZGQudGV4dCg0NTAsIDMxMCwgJ1BMQVkgUkFORE9NJywgeyBmaWxsOiAnd2hpdGUnLCBmb250OiAnMjRweCBDb3VyaWVyJywgZm9udFdlaWdodDogJ2JvbGQnIH0pO1xyXG4gIHJhbmRvbUJ1dHRvbi5hbmNob3Iuc2V0KDAuNSk7XHJcbiAgcmFuZG9tQnV0dG9uLnNtb290aGVkID0gZmFsc2U7XHJcbiAgcmFuZG9tQnV0dG9uLmlucHV0RW5hYmxlZCA9IHRydWU7XHJcbiAgcmFuZG9tQnV0dG9uLmlucHV0LnVzZUhhbmRDdXJzb3IgPSB0cnVlO1xyXG4gIHJhbmRvbUJ1dHRvbi5ldmVudHMub25JbnB1dERvd24uYWRkKFBsYXkuc3dpdGNoX29uX2RldmljZSk7XHJcbiAgcmFuZG9tQnV0dG9uLmV2ZW50cy5vbklucHV0RG93bi5hZGQocGxheVJhbmRvbSk7XHJcbn07XHJcblxyXG5leHBvcnRzLnVwZGF0ZSA9ICgpID0+IHt9O1xyXG5cclxuZXhwb3J0cy5yZW5kZXIgPSAoKSA9PiB7fTtcclxuIiwiZnVuY3Rpb24gY2xvbmUob2JqKSB7XHJcbiAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xyXG4gICAgcmV0dXJuIG9iai5tYXAoY2xvbmUpO1xyXG4gIH1cclxuICBlbHNlIGlmIChvYmogJiYgdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpIHtcclxuICAgIGNvbnN0IGNsb25lZCA9IHt9O1xyXG4gICAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGtleSA9PiB7IGNsb25lZFtrZXldID0gY2xvbmUob2JqW2tleV0pOyB9KTtcclxuICAgIHJldHVybiBjbG9uZWQ7XHJcbiAgfVxyXG4gIGVsc2UgaWYgKCFvYmogfHwgdHlwZW9mIG9iaiA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIG9iaiA9PT0gJ251bWJlcicpIHtcclxuICAgIHJldHVybiBvYmo7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDbG9uaW5nIG5vdCBzdXBwb3J0ZWQgZm9yICcgKyB0eXBlb2Ygb2JqICsgJyAnICsgb2JqKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydHMuY2xvbmUgPSBjbG9uZTtcclxuXHJcbmV4cG9ydHMuZ2V0TmV4dFBvcyA9IGZ1bmN0aW9uKHgsIHksIGRpcmVjdGlvbiwgZGlzdGFuY2UpIHtcclxuICBpZiAoZGlyZWN0aW9uID09PSAncmlnaHQnKSB7XHJcbiAgICByZXR1cm4geyB4OiB4ICsgZGlzdGFuY2UsIHkgfTtcclxuICB9XHJcbiAgZWxzZSBpZiAoZGlyZWN0aW9uID09PSAnbGVmdCcpIHtcclxuICAgIHJldHVybiB7IHg6IHggLSBkaXN0YW5jZSwgeSB9O1xyXG4gIH1cclxuICBlbHNlIGlmIChkaXJlY3Rpb24gPT09ICd1cCcpIHtcclxuICAgIHJldHVybiB7IHgsIHk6IHkgLSBkaXN0YW5jZSB9O1xyXG4gIH1cclxuICBlbHNlIGlmIChkaXJlY3Rpb24gPT09ICdkb3duJykge1xyXG4gICAgcmV0dXJuIHsgeCwgeTogeSArIGRpc3RhbmNlIH07XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGRpcmVjdGlvbjogJyArIGRpcmVjdGlvbik7XHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0cy5nZXRBbmdsZSA9IGZ1bmN0aW9uKGRpcmVjdGlvbikge1xyXG4gIGlmIChkaXJlY3Rpb24gPT09ICd1cCcpIHtcclxuICAgIHJldHVybiAwO1xyXG4gIH1cclxuICBlbHNlIGlmIChkaXJlY3Rpb24gPT09ICdyaWdodCcpIHtcclxuICAgIHJldHVybiA5MDtcclxuICB9XHJcbiAgZWxzZSBpZiAoZGlyZWN0aW9uID09PSAnZG93bicpIHtcclxuICAgIHJldHVybiAxODA7XHJcbiAgfVxyXG4gIGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gJ2xlZnQnKSB7XHJcbiAgICByZXR1cm4gLTkwO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBkaXJlY3Rpb246ICcgKyBkaXJlY3Rpb24pO1xyXG4gIH1cclxufTtcclxuIl19
