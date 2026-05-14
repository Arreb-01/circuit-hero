const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createComponent(uid, type) {
  const ports = type === 'battery'
    ? [{ id: 'pos' }, { id: 'neg' }]
    : [{ id: 'left' }, { id: 'right' }];
  return { uid, type, def: { ports }, switchClosed: true };
}

function createContext(components, wires) {
  return vm.createContext({
    console,
    Components: {
      getAll() {
        return components;
      },
      getByUid(uid) {
        return components.find(component => component.uid === uid);
      }
    },
    Wiring: {
      getAll() {
        return wires;
      },
      getPortConnections(uid, portId) {
        return wires.filter(wire => (
          (wire.fromUid === uid && wire.fromPortId === portId) ||
          (wire.toUid === uid && wire.toPortId === portId)
        ));
      }
    }
  });
}

function loadEngine(context) {
  const code = fs.readFileSync(path.join(__dirname, '..', 'js/game/circuit-engine.js'), 'utf8');
  vm.runInContext(code, context, { filename: 'js/game/circuit-engine.js' });
  return vm.runInContext('CircuitEngine', context);
}

const battery = createComponent('battery', 'battery');
const bulbA = createComponent('bulbA', 'bulb');
const bulbB = createComponent('bulbB', 'bulb');

const seriesWires = [
  { fromUid: 'battery', fromPortId: 'pos', toUid: 'bulbA', toPortId: 'left' },
  { fromUid: 'bulbA', fromPortId: 'right', toUid: 'bulbB', toPortId: 'left' },
  { fromUid: 'bulbB', fromPortId: 'right', toUid: 'battery', toPortId: 'neg' }
];

let engine = loadEngine(createContext([battery, bulbA, bulbB], seriesWires));
let result = engine.evaluate({ circuitGoal: { type: 'series', requiredBulbs: 2 } });
assert.strictEqual(result.status, 'closed');
assert.strictEqual(result.bulbs.length, 2);

engine = loadEngine(createContext([battery, bulbA, bulbB], seriesWires));
result = engine.evaluate({ circuitGoal: { type: 'parallel', requiredBulbs: 2 } });
assert.strictEqual(result.status, 'open', 'series wiring should not pass a parallel objective');

const parallelWires = [
  { fromUid: 'battery', fromPortId: 'pos', toUid: 'bulbA', toPortId: 'left' },
  { fromUid: 'battery', fromPortId: 'pos', toUid: 'bulbB', toPortId: 'left' },
  { fromUid: 'bulbA', fromPortId: 'right', toUid: 'battery', toPortId: 'neg' },
  { fromUid: 'bulbB', fromPortId: 'right', toUid: 'battery', toPortId: 'neg' }
];

engine = loadEngine(createContext([battery, bulbA, bulbB], parallelWires));
result = engine.evaluate({ circuitGoal: { type: 'parallel', requiredBulbs: 2 } });
assert.strictEqual(result.status, 'closed');
assert.strictEqual(result.bulbs.length, 2);

console.log('circuit-engine tests passed');
