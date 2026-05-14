const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const context = vm.createContext({ console });
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/data/level-config.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/data/profile-model.js'), 'utf8'), context);

const ProfileModel = vm.runInContext('ProfileModel', context);

const model = ProfileModel.create({
  username: 'Nicholas',
  progress: {
    levels: {
      '1-1': { completed: true, stars: 3, bestTime: 80, usedHint: false },
      '2-1': { completed: true, stars: 2, bestTime: 140, usedHint: true }
    }
  }
});

assert.strictEqual(model.username, 'Nicholas');
assert.strictEqual(model.title, 'Apprentice Electrician');
assert.strictEqual(model.progressRows.length, 6);
assert.deepStrictEqual(JSON.parse(JSON.stringify(model.progressRows.slice(0, 4).map(row => row.status))), [
  'Done',
  'Done',
  'In Progress',
  'Locked'
]);
assert.deepStrictEqual(JSON.parse(JSON.stringify(model.progressRows[0].stars)), [true, true, true]);
assert.deepStrictEqual(JSON.parse(JSON.stringify(model.progressRows[1].stars)), [true, true, false]);

const badgeStates = Object.fromEntries(model.badges.map(badge => [badge.id, badge.unlocked]));
assert.strictEqual(badgeStates.firstCircuit, true);
assert.strictEqual(badgeStates.bugFixer, true);
assert.strictEqual(badgeStates.speedRun, true);
assert.strictEqual(badgeStates.allStar, false);

assert.ok(model.components.some(component => component.id === 'battery'));
assert.ok(model.components.some(component => component.id === 'switch'));

console.log('profile-model tests passed');
