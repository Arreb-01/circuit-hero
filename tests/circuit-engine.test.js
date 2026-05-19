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

function assertError(result, status, reason, messagePart) {
  assert.strictEqual(result.status, status);
  assert.strictEqual(result.reason, reason);
  if (messagePart) {
    assert.ok(result.message.includes(messagePart), 'expected message to include "' + messagePart + '", got "' + result.message + '"');
  }
}

const battery = createComponent('battery', 'battery');
const bulbA = createComponent('bulbA', 'bulb');
const bulbB = createComponent('bulbB', 'bulb');
const switchA = createComponent('switchA', 'switch');
let engine;
let result;

engine = loadEngine(createContext([battery], []));
result = engine.evaluate({ circuitGoal: { type: 'closed', requiredBulbs: 1 } });
assertError(result, 'incomplete', 'missing-bulb', 'Missing bulb');

engine = loadEngine(createContext([battery, bulbA], []));
result = engine.evaluate({ circuitGoal: { type: 'closed', requiredBulbs: 1 } });
assertError(result, 'incomplete', 'missing-wires', 'Missing wires');

const seriesWires = [
  { fromUid: 'battery', fromPortId: 'pos', toUid: 'bulbA', toPortId: 'left' },
  { fromUid: 'bulbA', fromPortId: 'right', toUid: 'bulbB', toPortId: 'left' },
  { fromUid: 'bulbB', fromPortId: 'right', toUid: 'battery', toPortId: 'neg' }
];

engine = loadEngine(createContext([battery, bulbA, bulbB], seriesWires));
result = engine.evaluate({ circuitGoal: { type: 'series', requiredBulbs: 2 } });
assert.strictEqual(result.status, 'closed');
assert.strictEqual(result.bulbs.length, 2);

engine = loadEngine(createContext([battery, bulbA, bulbB], seriesWires));
result = engine.evaluate({ circuitGoal: { type: 'parallel', requiredBulbs: 2 } });
assert.strictEqual(result.status, 'open', 'series wiring should not pass a parallel objective');
assert.strictEqual(result.reason, 'parallel-connections');

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

const noSwitchWires = [
  { fromUid: 'battery', fromPortId: 'pos', toUid: 'bulbA', toPortId: 'left' },
  { fromUid: 'bulbA', fromPortId: 'right', toUid: 'battery', toPortId: 'neg' }
];

engine = loadEngine(createContext([battery, bulbA], noSwitchWires));
result = engine.evaluate({ circuitGoal: { type: 'closed', requiredBulbs: 1, requiredSwitches: 1 } });
assertError(result, 'incomplete', 'missing-switch', 'Missing switch');

engine = loadEngine(createContext([battery, switchA, bulbA], noSwitchWires));
result = engine.evaluate({ circuitGoal: { type: 'closed', requiredBulbs: 1, requiredSwitches: 1 } });
assertError(result, 'open', 'missing-switch', 'Missing switch in circuit');

const openSwitch = createComponent('openSwitch', 'switch');
openSwitch.switchClosed = false;
const openSwitchWires = [
  { fromUid: 'battery', fromPortId: 'pos', toUid: 'openSwitch', toPortId: 'left' },
  { fromUid: 'openSwitch', fromPortId: 'right', toUid: 'bulbA', toPortId: 'left' },
  { fromUid: 'bulbA', fromPortId: 'right', toUid: 'battery', toPortId: 'neg' }
];

engine = loadEngine(createContext([battery, openSwitch, bulbA], openSwitchWires));
result = engine.evaluate({ circuitGoal: { type: 'closed', requiredBulbs: 1, requiredSwitches: 1 } });
assertError(result, 'open', 'switch-open', 'Switch is open');

const switchWires = [
  { fromUid: 'battery', fromPortId: 'pos', toUid: 'switchA', toPortId: 'left' },
  { fromUid: 'switchA', fromPortId: 'right', toUid: 'bulbA', toPortId: 'left' },
  { fromUid: 'bulbA', fromPortId: 'right', toUid: 'battery', toPortId: 'neg' }
];

engine = loadEngine(createContext([battery, switchA, bulbA], switchWires));
result = engine.evaluate({ circuitGoal: { type: 'closed', requiredBulbs: 1, requiredSwitches: 1 } });
assert.strictEqual(result.status, 'closed', 'switch mission should pass when a closed switch is in the circuit path');

const houseComponents = [
  createComponent('houseBattery', 'battery'),
  createComponent('master', 'switch'),
  createComponent('roomSwitchA', 'switch'),
  createComponent('roomSwitchB', 'switch'),
  createComponent('roomBulbA', 'bulb'),
  createComponent('roomBulbB', 'bulb'),
  createComponent('hallBulb', 'bulb')
];

const houseWires = [
  { fromUid: 'houseBattery', fromPortId: 'pos', toUid: 'master', toPortId: 'left' },
  { fromUid: 'master', fromPortId: 'right', toUid: 'roomSwitchA', toPortId: 'left' },
  { fromUid: 'master', fromPortId: 'right', toUid: 'roomSwitchB', toPortId: 'left' },
  { fromUid: 'roomSwitchA', fromPortId: 'right', toUid: 'roomBulbA', toPortId: 'left' },
  { fromUid: 'roomSwitchB', fromPortId: 'right', toUid: 'roomBulbB', toPortId: 'left' },
  { fromUid: 'roomBulbA', fromPortId: 'right', toUid: 'hallBulb', toPortId: 'left' },
  { fromUid: 'roomBulbB', fromPortId: 'right', toUid: 'hallBulb', toPortId: 'left' },
  { fromUid: 'hallBulb', fromPortId: 'right', toUid: 'houseBattery', toPortId: 'neg' }
];

engine = loadEngine(createContext(houseComponents, houseWires));
result = engine.evaluate({ circuitGoal: { type: 'houseWiring', requiredBulbs: 3, requiredSwitches: 3 } });
assert.strictEqual(result.status, 'closed', '5-1 should pass mixed house wiring');
assert.deepStrictEqual(JSON.parse(JSON.stringify(result.details.livingRoomBulbs.sort())), ['roomBulbA', 'roomBulbB']);
assert.strictEqual(result.details.hallwayBulb, 'hallBulb');
assert.strictEqual(result.paths.length, 2, '5-1 should animate both parallel living-room branches');
assert.ok(result.paths.some(path => path.some(node => node.startsWith('roomBulbA.'))), '5-1 should animate the first living-room branch');
assert.ok(result.paths.some(path => path.some(node => node.startsWith('roomBulbB.'))), '5-1 should animate the second living-room branch');

engine = loadEngine(createContext([houseComponents[0], houseComponents[4], houseComponents[5], houseComponents[6]], []));
result = engine.evaluate({ circuitGoal: { type: 'houseWiring', requiredBulbs: 3, requiredSwitches: 3 } });
assertError(result, 'incomplete', 'missing-switches', 'Missing switches');

engine = loadEngine(createContext(houseComponents, []));
result = engine.evaluate({ circuitGoal: { type: 'houseWiring', requiredBulbs: 3, requiredSwitches: 3 } });
assertError(result, 'incomplete', 'missing-wires', 'Missing wires');

const houseSwitchLogicComponents = [
  createComponent('houseBattery', 'battery'),
  createComponent('master', 'switch'),
  createComponent('unusedSwitchA', 'switch'),
  createComponent('unusedSwitchB', 'switch'),
  createComponent('roomBulbA', 'bulb'),
  createComponent('roomBulbB', 'bulb'),
  createComponent('hallBulb', 'bulb')
];
const houseSwitchLogicWires = [
  { fromUid: 'houseBattery', fromPortId: 'pos', toUid: 'master', toPortId: 'left' },
  { fromUid: 'master', fromPortId: 'right', toUid: 'roomBulbA', toPortId: 'left' },
  { fromUid: 'master', fromPortId: 'right', toUid: 'roomBulbB', toPortId: 'left' },
  { fromUid: 'master', fromPortId: 'right', toUid: 'hallBulb', toPortId: 'left' },
  { fromUid: 'roomBulbA', fromPortId: 'right', toUid: 'houseBattery', toPortId: 'neg' },
  { fromUid: 'roomBulbB', fromPortId: 'right', toUid: 'houseBattery', toPortId: 'neg' },
  { fromUid: 'hallBulb', fromPortId: 'right', toUid: 'houseBattery', toPortId: 'neg' }
];

engine = loadEngine(createContext(houseSwitchLogicComponents, houseSwitchLogicWires));
result = engine.evaluate({ circuitGoal: { type: 'houseWiring', requiredBulbs: 3, requiredSwitches: 3 } });
assertError(result, 'open', 'house-switch-logic', 'Check switch logic');

const theaterComponents = [
  createComponent('theaterBattery', 'battery'),
  createComponent('theaterMaster', 'switch'),
  createComponent('audienceSwitchA', 'switch'),
  createComponent('audienceSwitchB', 'switch'),
  createComponent('stageA', 'bulb'),
  createComponent('stageB', 'bulb'),
  createComponent('stageC', 'bulb'),
  createComponent('audienceA', 'bulb'),
  createComponent('audienceB', 'bulb')
];

const theaterWires = [
  { fromUid: 'theaterBattery', fromPortId: 'pos', toUid: 'theaterMaster', toPortId: 'left' },
  { fromUid: 'theaterMaster', fromPortId: 'right', toUid: 'stageA', toPortId: 'left' },
  { fromUid: 'stageA', fromPortId: 'right', toUid: 'stageB', toPortId: 'left' },
  { fromUid: 'stageB', fromPortId: 'right', toUid: 'stageC', toPortId: 'left' },
  { fromUid: 'stageC', fromPortId: 'right', toUid: 'theaterBattery', toPortId: 'neg' },
  { fromUid: 'theaterMaster', fromPortId: 'right', toUid: 'audienceSwitchA', toPortId: 'left' },
  { fromUid: 'audienceSwitchA', fromPortId: 'right', toUid: 'audienceA', toPortId: 'left' },
  { fromUid: 'audienceA', fromPortId: 'right', toUid: 'theaterBattery', toPortId: 'neg' },
  { fromUid: 'theaterMaster', fromPortId: 'right', toUid: 'audienceSwitchB', toPortId: 'left' },
  { fromUid: 'audienceSwitchB', fromPortId: 'right', toUid: 'audienceB', toPortId: 'left' },
  { fromUid: 'audienceB', fromPortId: 'right', toUid: 'theaterBattery', toPortId: 'neg' }
];

engine = loadEngine(createContext(theaterComponents, theaterWires));
result = engine.evaluate({ circuitGoal: { type: 'theaterWiring', requiredBulbs: 5, requiredSwitches: 3 } });
assert.strictEqual(result.status, 'closed', '6-1 should pass hierarchical theater wiring');
assert.deepStrictEqual(JSON.parse(JSON.stringify(result.details.stageBulbs.sort())), ['stageA', 'stageB', 'stageC']);
assert.deepStrictEqual(JSON.parse(JSON.stringify(result.details.audienceBulbs.sort())), ['audienceA', 'audienceB']);

engine = loadEngine(createContext(theaterComponents.slice(0, 7), []));
result = engine.evaluate({ circuitGoal: { type: 'theaterWiring', requiredBulbs: 5, requiredSwitches: 3 } });
assertError(result, 'incomplete', 'missing-bulbs', 'Missing bulbs');

engine = loadEngine(createContext(theaterComponents, []));
result = engine.evaluate({ circuitGoal: { type: 'theaterWiring', requiredBulbs: 5, requiredSwitches: 3 } });
assertError(result, 'incomplete', 'missing-wires', 'Missing wires');

const theaterParallelStageComponents = [
  createComponent('theaterBattery', 'battery'),
  createComponent('theaterMaster', 'switch'),
  createComponent('audienceSwitchA', 'switch'),
  createComponent('audienceSwitchB', 'switch'),
  createComponent('stageA', 'bulb'),
  createComponent('stageB', 'bulb'),
  createComponent('stageC', 'bulb'),
  createComponent('audienceA', 'bulb'),
  createComponent('audienceB', 'bulb')
];
const theaterParallelStageWires = [
  { fromUid: 'theaterBattery', fromPortId: 'pos', toUid: 'theaterMaster', toPortId: 'left' },
  { fromUid: 'theaterMaster', fromPortId: 'right', toUid: 'stageA', toPortId: 'left' },
  { fromUid: 'theaterMaster', fromPortId: 'right', toUid: 'stageB', toPortId: 'left' },
  { fromUid: 'theaterMaster', fromPortId: 'right', toUid: 'stageC', toPortId: 'left' },
  { fromUid: 'stageA', fromPortId: 'right', toUid: 'theaterBattery', toPortId: 'neg' },
  { fromUid: 'stageB', fromPortId: 'right', toUid: 'theaterBattery', toPortId: 'neg' },
  { fromUid: 'stageC', fromPortId: 'right', toUid: 'theaterBattery', toPortId: 'neg' },
  { fromUid: 'theaterMaster', fromPortId: 'right', toUid: 'audienceSwitchA', toPortId: 'left' },
  { fromUid: 'audienceSwitchA', fromPortId: 'right', toUid: 'audienceA', toPortId: 'left' },
  { fromUid: 'audienceA', fromPortId: 'right', toUid: 'theaterBattery', toPortId: 'neg' },
  { fromUid: 'theaterMaster', fromPortId: 'right', toUid: 'audienceSwitchB', toPortId: 'left' },
  { fromUid: 'audienceSwitchB', fromPortId: 'right', toUid: 'audienceB', toPortId: 'left' },
  { fromUid: 'audienceB', fromPortId: 'right', toUid: 'theaterBattery', toPortId: 'neg' }
];

engine = loadEngine(createContext(theaterParallelStageComponents, theaterParallelStageWires));
result = engine.evaluate({ circuitGoal: { type: 'theaterWiring', requiredBulbs: 5, requiredSwitches: 3 } });
assertError(result, 'open', 'theater-stage-series', 'Stage lights must be in series');

console.log('circuit-engine tests passed');
