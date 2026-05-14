const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const context = vm.createContext({ console });
const code = fs.readFileSync(path.join(__dirname, '..', 'js/game/wire-geometry.js'), 'utf8');
vm.runInContext(code, context, { filename: 'js/game/wire-geometry.js' });

const WireGeometry = vm.runInContext('WireGeometry', context);

const points = WireGeometry.sampleBezier({ x: 0, y: 0 }, { x: 100, y: 60 }, 12);
assert.strictEqual(points.length, 13);
assert.deepStrictEqual(JSON.parse(JSON.stringify(points[0])), { x: 0, y: 0 });
assert.deepStrictEqual(JSON.parse(JSON.stringify(points[points.length - 1])), { x: 100, y: 60 });

const middle = points[6];
assert.ok(middle.x > 35 && middle.x < 65, 'middle x should stay near the center');
assert.ok(middle.y > 10 && middle.y < 50, 'middle y should bend smoothly');

const near = WireGeometry.distanceToBezier({ x: 50, y: 30 }, { x: 0, y: 0 }, { x: 100, y: 60 });
const far = WireGeometry.distanceToBezier({ x: 50, y: 120 }, { x: 0, y: 0 }, { x: 100, y: 60 });
assert.ok(near < far, 'near point should be closer than far point');

console.log('wire-geometry tests passed');
