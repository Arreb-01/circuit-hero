const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const wires = [
  { fromUid: 'houseBattery', fromPortId: 'pos', toUid: 'master', toPortId: 'left' },
  { fromUid: 'master', fromPortId: 'right', toUid: 'roomSwitchA', toPortId: 'left' },
  { fromUid: 'master', fromPortId: 'right', toUid: 'roomSwitchB', toPortId: 'left' },
  { fromUid: 'roomSwitchA', fromPortId: 'right', toUid: 'roomBulbA', toPortId: 'left' },
  { fromUid: 'roomSwitchB', fromPortId: 'right', toUid: 'roomBulbB', toPortId: 'left' },
  { fromUid: 'roomBulbA', fromPortId: 'right', toUid: 'hallBulb', toPortId: 'left' },
  { fromUid: 'roomBulbB', fromPortId: 'right', toUid: 'hallBulb', toPortId: 'left' },
  { fromUid: 'hallBulb', fromPortId: 'right', toUid: 'houseBattery', toPortId: 'neg' }
];

const portPositions = {};
wires.forEach(function(wire, index) {
  portPositions[wire.fromUid + '.' + wire.fromPortId] = { x: index * 20, y: index * 10 };
  portPositions[wire.toUid + '.' + wire.toPortId] = { x: index * 20 + 10, y: index * 10 + 4 };
});

const context = vm.createContext({
  console,
  Wiring: {
    getAll() {
      return wires;
    },
    getPortPosition(uid, portId) {
      return portPositions[uid + '.' + portId] || null;
    }
  },
  WireGeometry: {
    sampleBezier(from, to) {
      return [from, to];
    }
  }
});

vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/game/particle-system.js'), 'utf8'), context);
const ParticleSystem = vm.runInContext('ParticleSystem', context);

const paths = ParticleSystem.buildPaths({
  path: null,
  paths: [
    [
      'houseBattery.pos',
      'master.left',
      'master.right',
      'roomSwitchA.left',
      'roomSwitchA.right',
      'roomBulbA.left',
      'roomBulbA.right',
      'hallBulb.left',
      'hallBulb.right',
      'houseBattery.neg'
    ],
    [
      'houseBattery.pos',
      'master.left',
      'master.right',
      'roomSwitchB.left',
      'roomSwitchB.right',
      'roomBulbB.left',
      'roomBulbB.right',
      'hallBulb.left',
      'hallBulb.right',
      'houseBattery.neg'
    ]
  ]
});

assert.strictEqual(paths.length, 10, 'two branch paths should expand to their real wire segments, including shared source and return wires');
paths.forEach(function(segment) {
  assert.strictEqual(segment.length, 2, 'each segment should contain one sampled wire span in this test');
});

function includesWireSegment(fromKey, toKey) {
  const from = portPositions[fromKey];
  const to = portPositions[toKey];
  return paths.some(function(segment) {
    return (segment[0] === from && segment[1] === to) || (segment[0] === to && segment[1] === from);
  });
}

assert.ok(includesWireSegment('roomSwitchA.right', 'roomBulbA.left'), 'upper/living-room A branch wire should animate');
assert.ok(includesWireSegment('roomSwitchB.right', 'roomBulbB.left'), 'lower/living-room B branch wire should animate');

console.log('particle-system tests passed');
