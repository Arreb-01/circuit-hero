const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const context = vm.createContext({ console });
const code = fs.readFileSync(path.join(__dirname, '..', 'js/data/level-config.js'), 'utf8');
vm.runInContext(code, context, { filename: 'js/data/level-config.js' });

const LevelConfig = vm.runInContext('LevelConfig', context);
const sandbox = LevelConfig.get('sandbox');

assert.ok(sandbox, 'sandbox config should exist');
assert.strictEqual(sandbox.mode, 'sandbox');
assert.strictEqual(sandbox.scoring, false);
assert.strictEqual(sandbox.workbench.partsPanel.battery.count, Infinity);
assert.strictEqual(sandbox.workbench.partsPanel.bulb.count, Infinity);
assert.strictEqual(sandbox.workbench.partsPanel.switch.count, Infinity);
assert.strictEqual(sandbox.workbench.partsPanel.wire.count, Infinity);

console.log('sandbox-config tests passed');
