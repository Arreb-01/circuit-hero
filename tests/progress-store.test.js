const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadScript(file, context) {
  const code = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  vm.runInContext(code, context, { filename: file });
}

function createStorage() {
  const data = new Map();
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    }
  };
}

const context = vm.createContext({
  console,
  window: {},
  localStorage: createStorage()
});

loadScript('js/data/level-config.js', context);
loadScript('js/data/progress-store.js', context);

const { LevelConfig, ProgressStore } = vm.runInContext('({ LevelConfig, ProgressStore })', context);

assert.strictEqual(LevelConfig.has('1-1'), true, 'existing levels should be discoverable');
assert.strictEqual(LevelConfig.has('5-1'), false, 'missing levels should not be treated as playable');

const storage = createStorage();

ProgressStore.markLevelStarted('1-1', 1000, storage);
ProgressStore.markHintUsed('1-1', storage);

assert.strictEqual(ProgressStore.getLevelStart('1-1', storage), 1000);
assert.strictEqual(ProgressStore.hasUsedHint('1-1', storage), true);
assert.strictEqual(ProgressStore.hasUsedHint('2-1', storage), false, 'hint state must not leak between levels');
assert.strictEqual(ProgressStore.getLevelStart('2-1', storage), null, 'timer state must not leak between levels');

assert.strictEqual(ProgressStore.calculateStars({ elapsed: 90, usedHint: false, targetTime: 120 }), 3);
assert.strictEqual(ProgressStore.calculateStars({ elapsed: 150, usedHint: false, targetTime: 120 }), 2);
assert.strictEqual(ProgressStore.calculateStars({ elapsed: 90, usedHint: true, targetTime: 120 }), 1);

ProgressStore.completeLevel('1-1', { stars: 3, elapsed: 90, usedHint: true }, storage);
const progress = ProgressStore.getProgress(storage);

assert.deepStrictEqual(JSON.parse(JSON.stringify(progress.levels['1-1'])), {
  completed: true,
  stars: 3,
  bestTime: 90,
  usedHint: true
});

ProgressStore.completeLevel('1-1', { stars: 2, elapsed: 120, usedHint: false }, storage);
assert.strictEqual(ProgressStore.getLevelProgress('1-1', storage).stars, 3, 'lower replay score should not overwrite best stars');
assert.strictEqual(ProgressStore.getLevelProgress('1-1', storage).bestTime, 90, 'slower replay should not overwrite best time');

console.log('progress-store tests passed');
